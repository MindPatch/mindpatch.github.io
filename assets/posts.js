// Writeups shown on the index. Posts with `full` render the whole article on this site;
// posts with `body` show a short summary plus a link to the original.
const POSTS=[
 {id:"docker-escape",date:"2026-01-17",y:"2026",m:"Jan 17",title:"Docker escape: breaking out of containers",tag:"research",src:"mindpatch.net",url:"https://www.mindpatch.net/posts/docker-escape/",
  body:`<p>Research on how code running inside a Docker container can break out onto the host.</p>`},
 {id:"docker-escape-ssrf",date:"2025-09-01",y:"2025",m:"Sep 1",title:"CVE-2025-9074: Docker Desktop container escape via SSRF",tag:"research",cve:"CVE-2025-9074",src:"mindpatch.net",url:"https://www.mindpatch.net/posts/docker-escape-ssrf/",
  full:`<h2>Overview</h2>
<p>CVE-2025-9074 is a container escape in Docker Desktop, rated CVSS 9.3. What makes it nasty isn't some clever exploit chain, it's that there's barely any exploit at all. Any container could reach the Docker Engine API and take over the host with a few plain HTTP requests. No socket mount, no privileged flag, no kernel bug.</p>
<p>It affects Docker Desktop on Windows (WSL2 backend) and macOS. The whole thing comes down to one misconfiguration: the Docker daemon was listening on an internal address, <code>192.168.65.7:2375</code>, that every container could route to, with no authentication in front of it.</p>
<p>Credit for finding and disclosing this goes to Felix Boulet and Philippe Dugre. Their write-ups are linked at the bottom.</p>

<h2>How the API got exposed</h2>
<p>Docker Desktop doesn't run the daemon on your host directly. On Windows it lives inside a WSL2 VM (a real Linux kernel under Hyper-V); on macOS, a similar lightweight VM. Your <code>docker</code> CLI on the host is just an HTTP client talking to <code>dockerd</code> inside that VM.</p>
<p>On native Linux this conversation happens over a Unix socket (<code>/var/run/docker.sock</code>) that's protected by filesystem permissions and never touches the network. Docker Desktop can't use that trick cleanly across the host/VM boundary, so it exposed the API over TCP instead. And that's where it went wrong. Three things lined up:</p>
<ol><li><strong>The daemon bound to <code>0.0.0.0:2375</code></strong> instead of localhost, so anything on the VM's network could reach it.</li>
<li><strong>No authentication.</strong> No keys, no certs, nothing. Any request was treated as legitimate.</li>
<li><strong>Containers could route to that network.</strong> From inside a container, <code>192.168.65.7:2375</code> was directly reachable over <code>eth0</code>.</li></ol>
<p>Put those together and every container on the machine had the exact same power over the daemon as an admin typing <code>docker</code> on the host. And the daemon runs as root.</p>
<pre class="mermaid">flowchart TB
    subgraph Host["Windows / macOS Host"]
        A["Docker CLI"]
    end
    subgraph VM["Docker VM - 192.168.65.7"]
        B["TCP :2375&lt;br/&gt;0.0.0.0 · NO AUTH"]
        C["dockerd (root)"]
    end
    subgraph Net["Container Network - 172.17.0.0/16"]
        H["Malicious Container"]
    end
    A --&gt;|legit calls| B --&gt; C
    H ==&gt;|"same API access"| B
    style B fill:#4a1520,stroke:#d45574,color:#e0e0e0
    style H fill:#4a1520,stroke:#d45574,color:#e0e0e0</pre>
<p>Confirming it was reachable took one request:</p>
<pre><code># From inside any container
curl -s http://192.168.65.7:2375/_ping
# OK      &lt;- no auth, no questions asked

ip route show
# default via 172.17.0.1 dev eth0
# 172.17.0.0/16 dev eth0 scope link
# 192.168.65.0/24 dev eth0 scope link   &lt;- VM network is right there</code></pre>

<h2>From API access to host root</h2>
<p>Once you can talk to the daemon, escaping is just asking it to do something dumb on your behalf. Every path below is a normal Docker API call, the same one the CLI makes.</p>
<pre class="mermaid">flowchart LR
    A[Reach :2375] --&gt; B[Recon: /info, /containers/json]
    B --&gt; C[Create container with&lt;br/&gt;bind mount / or --privileged]
    C --&gt; D[Read/write host FS&lt;br/&gt;· Full host control]</pre>
<p>The classic move is to create a new container that bind-mounts the host root and gives yourself a shell in it:</p>
<pre><code># POST /containers/create with:
#   HostConfig.Binds = ["/:/host"]
#   HostConfig.Privileged = true
# then start it and you're reading /host/etc/shadow, dropping SSH keys, whatever.</code></pre>
<p>You never needed to mount <code>docker.sock</code> into the container. The network path <em>was</em> the socket.</p>

<h2>Testing for it</h2>
<p><small>WARNING: Educational use only. Test in isolated environments you own.</small></p>
<p>If you want to see it live, there's a short PoC video: <a href="https://www.youtube.com/watch?v=CiPbB3ZbEPk" target="_blank" rel="noopener">watch on YouTube &#8599;</a></p>
<p>To reproduce, install a Docker Desktop build older than 4.44.3 (4.44.0, 4.43.x, etc.) on a throwaway machine, then run a container and check whether the API answers:</p>
<pre><code>docker run --rm -it python:3.11-alpine sh
pip install requests</code></pre>
<p>This script just probes the endpoint, it doesn't do anything destructive:</p>
<pre><code>#!/usr/bin/env python3
"""CVE-2025-9074 check - test only on systems you own."""
import requests

TARGET = "http://192.168.65.7:2375"

def check():
    try:
        r = requests.get(f"{TARGET}/_ping", timeout=3)
    except requests.exceptions.RequestException:
        print("[-] No route to the API - likely patched or well configured.")
        return

    if r.status_code == 200 and r.text.strip() == "OK":
        print("[!] VULNERABLE: Docker API is reachable from this container.")
        info = requests.get(f"{TARGET}/info", timeout=5).json()
        print(f"    Docker:  {info.get('ServerVersion')}")
        print(f"    Host OS: {info.get('OperatingSystem')}")
        containers = requests.get(f"{TARGET}/containers/json?all=1", timeout=5).json()
        print(f"    Sees {len(containers)} containers on the host.")
    else:
        print("[-] Endpoint responded oddly - probably not vulnerable.")

if __name__ == "__main__":
    check()</code></pre>
<p>If it comes back <code>VULNERABLE</code> and prints the host's Docker version and container list, that's your proof: a container with no special privileges is reading host-level daemon state. A patched or properly configured system just can't reach the endpoint.</p>

<h2>The fix</h2>
<p>Docker shipped the fix in Docker Desktop 4.44.3 on August 20, 2025. It stops the daemon from listening in a way containers can reach, closing the network path without breaking the normal CLI workflow.</p>
<p>If you're running Docker Desktop, update to 4.44.3 or later. It's a one-line answer to a critical bug.</p>

<h2>Takeaway</h2>
<p>The interesting thing about CVE-2025-9074 is how boring the exploit is. No memory corruption, no capability abuse, no kernel exploit, just an API that should have been on localhost, listening for anyone who asked. Container isolation held up fine; the management plane sitting next to it did not.</p>
<p>If you run containers, it's worth remembering that the daemon is the real crown jewel. Anything a container can reach on the network deserves the same scrutiny as anything it can reach on disk.</p>

<h2>References</h2>
<ul><li><a href="https://pvotal.tech/breaking-dockers-isolation-using-docker-cve-2025-9074/" target="_blank" rel="noopener">Felix Boulet: Breaking Docker's Isolation using Docker CVE-2025-9074</a></li>
<li><a href="https://blog.qwertysecurity.com/Articles/blog3.html" target="_blank" rel="noopener">Philippe Dugre: Docker Desktop Container Escape</a></li>
<li><a href="https://docs.docker.com/engine/security/" target="_blank" rel="noopener">Docker Security Best Practices</a></li>
<li><a href="https://docs.docker.com/engine/api/" target="_blank" rel="noopener">Docker Engine API Documentation</a></li></ul>`},
 {id:"cit-ctf",date:"2025-04-28",y:"2025",m:"Apr 28",title:"CIT CTF 2025: solving all web challenges",tag:"ctf",src:"Medium",url:"https://mindpatch.medium.com/cit-ctf-2025-solving-all-web-challenges-e9697670ae1f",
  body:`<p>Solutions for every web challenge in CIT CTF 2025, including the "Mr. Chatbot" task.</p>`},
 {id:"analysis-of-cve-2022-30781",date:"2025-01-10",y:"2025",m:"Jan 10",title:"CVE-2022-30781: how git fetch led to RCE in Gitea",tag:"research",cve:"CVE-2022-30781",src:"Medium",url:"https://mindpatch.medium.com/analysis-of-cve-2022-30781-5089f9616957",
  body:`<p>A root-cause analysis of CVE-2022-30781, a remote code execution bug in Gitea's repository migration feature. Gitea ran <code>git fetch</code> against a user-supplied remote, and an attacker-controlled value could smuggle in the <code>--upload-pack</code> option to run an arbitrary command on the server.</p>
  <h2>The chain</h2>
  <ul><li>Repo migration triggers a server-side <code>git fetch</code></li><li>The <code>--upload-pack</code> option lets you point Git at a command instead of the real helper</li><li>Injecting it turns "fetch a repo" into "run my command"</li></ul>
  <p>The Gitea team fixed it by using <code>--</code> to stop Git from treating the value as an option.</p>`},
 {id:"legacy-sdk-xss-account-takeover",date:"2025-03-14",y:"2025",m:"Mar 14",title:"Legacy SDK flaws: stored XSS to account takeover",tag:"bug bounty",src:"Medium",url:"https://mindpatch.medium.com/legacy-sdk-flaws-cause-stored-xss-and-account-takeover-ato-5b4ed6c1f13f",
  body:`<p>A bug bounty writeup where an outdated SDK left a stored XSS sink in place. The post shows how that stored XSS was chained into a full account takeover.</p>`},
 {id:"solving-doxpit-challenge",date:"2024-08-20",y:"2024",m:"Aug 20",title:"HTB DoxPit challenge",tag:"ctf",src:"Medium",url:"https://mindpatch.medium.com/htb-solving-doxpit-challange-d1957f57b0b0",
  body:`<p>Walkthrough of the DoxPit web challenge on Hack The Box.</p>`},
 {id:"gitea-dos",date:"2023-02-22",y:"2023",m:"Feb 22",title:"With a single request, you can kill any Gitea server",tag:"disclosure",src:"Medium",url:"https://mindpatch.medium.com/with-a-single-request-you-can-kill-any-gitea-server-1275c5f3b226",
  body:`<p>A denial-of-service bug in Gitea 1.14.2: a single crafted issue comment forced the server to burn CPU while rendering it, enough to take the instance down. Reported and validated within two days.</p>
  <h2>Outcome</h2>
  <ul><li>Fixed in Gitea 1.14.3</li><li>Credited in the release notes</li></ul>`},
 {id:"ibm-rce",date:"2021-06-02",y:"2021",m:"Jun 2",title:"Remote code execution on an ibm.com subdomain",tag:"disclosure",src:"dev.to",url:"https://dev.to/knassar702/remote-code-execution-on-ibm-com-subdomain-4k96",
  body:`<p>An exposed Jenkins instance on an ibm.com subdomain led to remote code execution.</p>`},
 {id:"nokia-sqli",date:"2021-06-02",y:"2021",m:"Jun 2",title:"SQL injection on gdclive.nokia.com",tag:"disclosure",src:"dev.to",url:"https://dev.to/knassar702/sql-inection-on-gdclivenokia-com-c7c",
  body:`<p>Finding and reporting an SQL injection on a Nokia web property.</p>`},
 {id:"ibm-xss",date:"2021-06-02",y:"2021",m:"Jun 2",title:"Reflected XSS via JSONP on an ibm.com subdomain",tag:"disclosure",src:"dev.to",url:"https://dev.to/knassar702/reflected-xss-by-jsonp-on-ibm-com-subdomain-5aia",
  body:`<p>A JSONP callback parameter on an ibm.com subdomain reflected attacker input into script context, giving reflected XSS.</p>`}
];
