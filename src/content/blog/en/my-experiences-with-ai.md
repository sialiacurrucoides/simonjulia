---
title: "My Experience with AI"
description: ""
date: 2026-10-24
tags: ["backend", "frontend", "DevOps", "security"]
---
<figure class="diagram4">
  <img src="/ai-team.webp" srcset="/ai-team.webp 1x, /ai-team-2x.webp 2x" alt="My AI team" width="628" height="785" loading="lazy" />
  <figcaption>My AI team</figcaption>
</figure>

<br>

## 2025

By 2025, AI-assisted work was already in full swing, but I was still only using two tools.

- ChatGPT — I asked it for help when I needed a solution I hadn't used before, or used it to speed up smaller tasks, such as designing regex patterns. I added the final solution to the codebase myself.
- Copilot — sometimes for autocomplete, or for smaller tasks like summarising an error and suggesting a fix. I wasn't impressed. Once, it had been working for almost half an hour without finding the right approach. When I took over, I had it sorted in ten minutes. At that point, I still found it hard to imagine AI taking developers' jobs.

<br>

## Claude Code — getting acquainted

By May 2026, Claude Code seemed to be everywhere I looked. So I decided to give it a try. I learned a little about getting started with it, and it turned out to be a very different experience. The solutions it suggested made me feel as though I had the most knowledgeable senior developer of all time helping me. Of course, I had to set up the right environment, because back then there were still plenty of things to complain about: doing things it shouldn't without asking, not doing things it should, starting to hallucinate.

<br>

Here's how I started:

- `/init` — generate a CLAUDE.md file for the codebase.
- Add __Karpathy's__ four rules right at the top. Not even the whole skill, just four lines ([source](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md)).
- Add two more rules that others had suggested:
  - "Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets."
  - "NEVER commit directly to [master/main/prod - fill which is relevant]"
- Install the __Context7 MCP__ server so it could retrieve up-to-date information about various tools and packages.
- Copy a few popular skills into the skills folder for relevant topics: accessibility, web-security, modern-tailwind, and so on. It's best not to go overboard collecting skills, because even their names and descriptions take up space in the context window. The backend codebase didn't have access to the frontend-specific skills.
- Run `/clear` after every task to optimise token usage and reduce the chance of hallucinations.
- Send every prompt in plan mode.

<br>

At first, I was really paranoid about security, worried it might do something it shouldn't. Like deleting the production database, which has actually happened before... So initially, it had to ask permission for everything. For quite a while, that even included every single lint run...

<br>

## The honeymoon phase

After that sceptical start, when I still thought I had to tell it how to do everything, I quickly realised that if I clearly specified the goal, it could come up with an even better plan than mine. I was honestly impressed by how many edge cases it identified, all the things it wrote tests for, and the questions it asked me. I got carried away, and soon it was writing most of the code.

<br>

## Uncertainty

The quickly generated code then came back to bite me a little, and I slowed down as I worked through the bugs. It got a surprising number of things wrong on the frontend, even after I gave it access to the Playwright MCP server. I still wasn't sure it could replace a developer. Checking its work wasn't optional. Despite knowing the best practices, it once put a secret into a yml file. In my case, the risk wasn't significant: if I hadn't noticed, the secret scanner run by my git hook would probably have caught it. Still, experiences like that meant I couldn't trust it completely. I reviewed every single line.

<br>

You could argue that nobody checks the compiler or the packages they use anymore, but those are deterministic. However smart the model is, it is statistical in nature, so there is always a chance of error.

<br>

My workflow changed. Most of my day was spent writing specifications, reviewing code, and testing manually. I had lost exactly the part of development I loved most: figuring out how to solve a problem and writing the code for it.

<br>

It also became clear that meaningful code review would get harder over time, because I no longer had the mental model you build by working through every step and every bug yourself. If I had been working in a corporate environment, I might have ended up feeling depressed. Luckily, I was on a sabbatical, so my main focus was learning. How to develop a product on my own, from scratch, that other people could use with confidence. From that perspective, the advantages AI offered were encouraging.

<br>

Because my mental model is weaker than it would be with code I wrote myself, I run one or more reviews after every meaningful change.

<br>

## Taking the relationship to the next level

The Claude Code ecosystem kept growing, and it seemed likely that other people had run into the same problems I had, and that solutions already existed.

<br>

### Broken layouts and AI-slop frontends

- **frontend-design** skill — better frontend components, better spacing, fewer ugly solutions.

  ```
  npx skills add anthropics/skills --skill frontend-design
  ```

- **impeccable** — the skill above isn't enough on its own to keep the design consistent and following the same principles throughout. Impeccable interviews you about your goals and puts together a design plan based on them.

  [https://github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable)

<br>

### Security

- **security-guidance@claude-plugins-official** plugin — automatic security checks. It increases costs a little, but I decided it was worth it.

  ```text
  /plugin install security-guidance@claude-plugins-official
  ```

- **claude-code-security-audit** — [https://github.com/McGo/claude-code-security-audit](https://github.com/McGo/claude-code-security-audit)

- **security-audit**

  ```bash
  npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit
  ```

<br>

### Token usage

- **codegraph** — helps mapping out the codebase quickly, so less information needs to be sent to Anthropic's servers.

  [https://github.com/colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)

- **rtk** — a program written in Rust that reduces the size of the Bash command output the agent reads.

  [https://github.com/rtk-ai/rtk](https://github.com/rtk-ai/rtk)

Another popular tool I don't use, because I don't want to make the responses harder to understand:

- **caveman**

  [https://github.com/juliusbrussee/caveman](https://github.com/juliusbrussee/caveman)

Also popular:

- **ponytail** — encourages the agent to write less code.

  [https://github.com/dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail)

<br>

There are plenty of other useful tools; I won't list them all. Collecting every single one isn't worth it, either. Too many can hurt quality. It's worth introducing one new tool at a time and only keeping it if it actually helps with your project.

<br>

For me, the real step up came with the Opus 5.5 model, although improvements to the Claude Code harness played a part too. These days, it's very rare for the model to get something wrong. Its memory, which contains my previous bug reports, probably helps as well. I no longer read every line of code. I know it can write a suitable unit test to check that a controller passes the right values to a service. If a component looks good in every view and every theme, I don't need to go through every line of JSX. Not that reading it would leave much of a lasting impression anyway. It would just take up time.

I still review a lot of things, but less to catch bugs and more to make sure I know about every little decision it might not have asked me about during planning.

<br>

My work now is mainly about giving direction and making decisions: what takes priority, what fits the product, what the costs of each option are, and what works better for the people using it.

<br>

## Wrapping up

A year ago, I wouldn't have thought we'd get to the point of programmers considering retraining as electricians quite so soon. With effective use of AI, it currently seems that fewer people can get a given job done, especially on a greenfield project.

Still, I don't think the profession is finished. A visionary entrepreneur who has found a problem that can be solved with software people will pay for would probably rather focus on business development than on typing into terminals. 

<br>

I think knowing how software works still has value. However good the model is, I wouldn't feel comfortable downloading an app vibe-coded by someone to whom CSP, CORS, secret managers, MFA, passkeys, idempotency, backups, GDPR compliance, and so on mean nothing. AI knows about all of these, but sometimes you have to specifically ask it to address them. And often you have to choose what matters more (see, for example, the CAP theorem on the relationship between consistency and availability). You can't always have your cake and eat it too.
