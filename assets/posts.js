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
<ul><li><a href="https://docs.docker.com/engine/security/" target="_blank" rel="noopener">Docker Security Best Practices</a></li><li><a href="https://blog.trailofbits.com/2019/07/19/understanding-docker-container-escapes/" target="_blank" rel="noopener">Understanding Docker Container Escapes</a></li><li><a href="https://man7.org/linux/man-pages/man7/capabilities.7.html" target="_blank" rel="noopener">Linux Capabilities</a></li><li><a href="https://book.hacktricks.xyz/linux-hardening/privilege-escalation/docker-security/docker-breakout-privilege-escalation" target="_blank" rel="noopener">Docker breakout / privilege escalation (HackTricks)</a></li><li><a href="https://github.com/MindPatch/zeronleft_labs" target="_blank" rel="noopener">zeronleft_labs</a></li></ul>`}
];
