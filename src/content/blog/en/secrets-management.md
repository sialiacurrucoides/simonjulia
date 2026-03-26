---
title: "Secrets Management"
description: "Secret managers exist to keep secrets secure, allowing us to store sensitive information in a single place and grant different permissions to both machine and human users."
date: 2026-03-26
tags: ["backend", "security", "DevOps"]
---
In an application, a secret is any sensitive piece of data that could be abused if exposed. This can include an API key used to connect to external services, a password used by the backend to access a database, a token used for encryption, and so on.

In many cases, these secrets need to be shared either between team members or across different parts of the system. The more complex a project becomes, the more likely it is that managing these secrets turns into a problem.

<br>

## Possible Problems
- An inexperienced developer might hardcode a secret into the codebase, commit and push it, or even log it somewhere. From that point on, anyone with access to the repository can access these secrets. This means it’s not enough to secure just the codebase — every machine that has access to it must also be secure.
- For convenience, developers sometimes share secrets through third-party platforms. Tens of thousands of secrets have already been found in large language model training datasets. Most people are aware of chat applications that sell user data, but even those considered “secure” can be intercepted.
- A secret often exists in many places: on different developer machines, across multiple platforms — a phenomenon known as __secret sprawl__. This increases the attack surface and makes it difficult to rotate secrets dynamically, which would otherwise improve security.
- In the event of a leak, it is often difficult to trace where it happened, what needs to be secured, or who accessed and stored the secrets.

<br>

For smaller projects, it may be sufficient to store secrets in a Git-ignored .env file and protect them with linters and code reviews. However, as projects grow or handle more sensitive data, it becomes increasingly worthwhile to consider using a dedicated secrets manager, which can solve some or all of the problems listed above.

<br>

## Secrets Managers

There are many tools available today that help manage secrets. They differ in ease of use, pricing, features, and scalability. However, most of them share a common idea: storing secrets in a single, __centralized__ location.

Access to these secrets is restricted to authenticated users or machines with proper authorization, and access can be revoked at any time by an administrator.

This raises an obvious concern: if everything is centralized, wouldn’t compromising the secrets manager expose everything? In practice, most solutions support two-factor authentication, which significantly increases security. This is still more practical than requiring maximum security on every developer machine.

<br>

It’s also worth noting that secrets managers are not only useful for teams. They can be beneficial even for solo projects, and free tiers are often available for those. I’ve personally experienced losing important data stored in a local .env file after a machine failure. While I could pull the code on another machine, I had to regenerate all the secrets from scratch.

Of course, not every small project needs this level of setup — introducing a secrets manager does come with some additional overhead.

Below are a few tools, without aiming for completeness.

<br>

### Bitwarden Secrets Manager
#### Description

A relatively easy-to-use and widely accessible secrets manager. However, it does not scale particularly well beyond a certain point, so for enterprise use cases, more feature-rich solutions are usually preferred.

Its workflow is as follows: you create an organization, then a project within it. Secrets are stored as key-value pairs. Each secret gets a unique identifier, which can be used in your code.

Access can be configured per secret, specifying which users or machines can read or write it. Machine accounts must be assigned to the organization, and access tokens can be generated for them. These tokens are stored as environment variables on the target machine.

Secrets are retrieved via the bws CLI (not to be confused with the bw CLI for password management). The CLI replaces secret identifiers with their actual values at runtime.

One downside of this approach is that you still typically need a .env file, but instead of real values, it contains Bitwarden secret IDs. These are less sensitive, but still something to manage.

Another important detail: both US and EU regions are supported, but at the time of writing, the CLI may default to US servers even for EU users. This needs to be configured manually:
bws config server-base https://vault.bitwarden.eu

#### Pricing (2026-03-25)

Free tier: unlimited secrets, 2 users, 3 projects, 3 machine accounts  
Teams: $6 / user / month – unlimited secrets, projects, 20 machine accounts, audit logs  
Enterprise: $12 / user / month – 50 machine accounts, additional enterprise features  

#### Vendor lock-in

Low.

#### Self-hosting

Possible.

<br>

### Infisical
#### Description

An easy-to-use tool with an intuitive interface. One of its strengths is built-in support for multiple environments per project. It clearly shows missing secrets across environments in a tabular view.

It supports both US and EU regions — make sure to log in to the correct one.

Instead of managing permissions per secret, it uses roles. Each role defines access to specific environments and secrets. Default roles include admin, developer, viewer, and no-access.

Integration is done via a CLI, but unlike Bitwarden, there is no need to manage secret IDs. Running your app with a command like `infisical run --env=dev --` injects the secrets automatically.

#### Pricing (2026-03-26)

Free tier: unlimited secrets (with lower rate limits), 5 identities, 3 projects, 3 environments  
Pro: $18/month per identity – higher rate limits, versioning, secret rotation, 12 projects, 12 environments, 90-day audit logs  
Enterprise: custom pricing  

#### Vendor lock-in

Low.

#### Self-hosting

Possible.

<br>

### Doppler
#### Description

A modern secrets manager focused on simplicity and developer experience. Its interface is clean and easy to navigate, making onboarding fast. Secrets are organized by projects and environments, similarly to Infisical.

It integrates well with CI/CD systems and cloud providers, and secrets can be injected at runtime via CLI. There is no need to manage individual secret identifiers.

The downside is that it relies heavily on its own ecosystem, which can make migration more difficult later.

#### Pricing (2026-03-26)

Free tier: limited number of secrets and basic features  
Team: ~$7–$10 / user / month (depending on configuration)  
Enterprise: custom pricing  

#### Vendor lock-in

Medium.

#### Self-hosting

Not available.

<br>

### HashiCorp Vault
#### Description

One of the most well-known and feature-rich secrets management solutions, primarily designed for enterprise use.

It supports not only static secrets but also dynamic secret generation (e.g. temporary database credentials), secret rotation, and fine-grained access control.

It uses a policy-based system and supports multiple authentication methods (token, Kubernetes, AWS IAM, etc.).

The downside is its complexity — both setup and operation require significant effort, making it overkill for small projects.

#### Pricing (2026-03-26)

Open source version available (free)  
Enterprise: custom pricing  
Cloud (HCP Vault): usage-based pricing  

#### Vendor lock-in

Low–medium.

#### Self-hosting

Possible (and very common).

<br>

### Google Cloud Secret Manager
#### Description

A native secrets management service within Google Cloud Platform. Easy to use if you're already using GCP.

Secrets are versioned, auditable, and tightly integrated with other GCP services (e.g. Cloud Run, GKE).

Access control is handled via IAM, which is powerful but can be complex for beginners.

The main drawback is strong dependency on the GCP ecosystem.

#### Pricing (2026-03-26)

~$0.06 / active secret / month  
~$0.03 / 10,000 accesses  
(Usually very low cost for small projects)  

#### Vendor lock-in

High.

#### Self-hosting

Not available.

<br>

### Amazon Web Services Secrets Manager
#### Description

AWS’s native secrets management solution, similar in purpose to Google Cloud Secret Manager, but with additional features like automatic secret rotation (e.g. for database credentials).

It integrates deeply with AWS services (IAM, Lambda, RDS, etc.) and works well in complex, scalable architectures.

The downside is relatively high cost and the complexity of AWS IAM configuration.

#### Pricing (2026-03-26)

~$0.40 / secret / month  
~$0.05 / 10,000 accesses  
(More expensive than most alternatives)

#### Vendor lock-in

High.

#### Self-hosting

Not available.
