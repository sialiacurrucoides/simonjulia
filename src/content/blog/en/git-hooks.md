---

title: "Git hooks"
description: "Git hooks allow you to run custom scripts before or after executing various Git commands. They can be used to automate many checks that developers would otherwise need to keep in mind."
date: 2026-04-13
tags: ["backend", "frontend", "security", "DevOps"]
---------------------------------------------------

## Hooks

When initializing a Git project, a `hooks` folder is created inside the `.git` directory, containing example scripts.

```
    applypatch-msg.sample           pre-push.sample
    commit-msg.sample               pre-rebase.sample
    fsmonitor-watchman.sample       pre-receive.sample
    post-update.sample              prepare-commit-msg.sample
    pre-applypatch.sample           push-to-checkout.sample
    pre-commit.sample               sendemail-validate.sample
    pre-merge-commit.sample         update.sample
```

<br>

These files contain scripts that run at different stages of the Git workflow, with the most well-known being the *pre-commit* hook.
If we remove the `.sample` suffix and make the file executable (`chmod ug+x`), we can start using them.

<br>

## Hook management tools

In practice — especially in projects with multiple developers — we don’t modify these files manually. Instead, we typically use a tool that simplifies managing, sharing, and versioning hooks. By default, Git hooks are not part of the repository, so they are not automatically shared among team members. This is one of the main reasons why hook management tools are used.

In Python communities, the **pre-commit framework** is commonly used, while JavaScript projects tend to prefer **husky**.
Of course, pre-commit can also be used in JS-based projects, and one of its advantages is the large number of ready-made scripts available. However, if the goal is to make a TypeScript project feel familiar to new developers, using Husky is often the better choice.

<br>

## What are they good for, and when should we use them?

<br>

### pre-commit

There are often strong opinions about whether *pre-commit* hooks should be used at all. A common criticism is that they interrupt the development workflow, can be slow, and are not entirely secure since they can be bypassed with the `--no-verify` flag.

There is some truth to this, and whenever possible, we should rely on **CI** for both validation and enforcement. Hooks do not replace CI checks — they complement them.

However, there are certain checks that are worth running locally before code enters the Git history. For example, verifying that no sensitive data (secrets) has been accidentally left in the code. This might not be due to lack of knowledge or carelessness — it can easily happen during debugging.

A useful free tool for detecting secrets is **ggshield**, which should be run before creating a commit to avoid complex Git history rewriting later. Each developer needs to install the GitGuardian ggshield tool and authenticate. After that, it only takes a single line added to the generated pre-commit file:

`ggshield secret scan pre-commit`

Scanning can also be performed locally, minimizing data transfer.

It is also recommended to run linting at this stage. Running the full linting process might be better suited for a later phase, but since it is usually sufficient to check only the modified files, we commonly use the **lint-staged** package. lint-staged runs checks only on files that are in the staging area.

### pre-push

If CI resources are limited or unavailable for running tests, it can make sense to execute __tests__ and __coverage checks__ at the *pre-push* stage. However, keep in mind that as the project grows, this process can become slower, so it should only be used as a fallback solution.

Before pushing code to the repository, it is useful to know whether anything has been broken and whether the code is covered by tests to the expected extent.

This is generally not recommended for pre-commit, as it is preferable to create small, logically separated commits — for example, separating a feature and its tests into different commits. This approach is also encouraged by the __conventional commits__ specification (which can be enforced in the *commit-msg* hook).

At this stage, it is also worth checking for leftover __debug logs__ in the code. It is a waste of time when a review cycle is spent just cleaning these up.

If we want to stay up to date with newly discovered vulnerabilities in our dependencies, we can also automate running __`npm audit`__ in one of the hooks.

<br>

We can define many different conditions to prevent unwanted code from being committed. All we need to do is extend the relevant hook scripts and ensure they return a non-zero exit code when a condition is not met. However, hooks should remain fast — if a check takes several seconds or minutes, it is better to move it to CI.

<br>

Happy and secure coding!

<br>
