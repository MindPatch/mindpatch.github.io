// Writeups shown on the index. Posts with `full` render the whole article on this site;
// posts with `body` show a short summary plus a link to the original.
const POSTS=[
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
  <ul><li>Fixed in Gitea 1.14.3</li><li>Credited in the release notes</li></ul>`}
];
