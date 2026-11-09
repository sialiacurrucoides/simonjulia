---
title: "MCP server"
description: "Giving AI agents access to various applications is becoming more and more popular. An MCP server follows an open standard (Model Context Protocol) that standardizes communication between AI applications and the applications they connect to. As the popular analogy goes, MCP is the USB-C port of AI applications."
date: 2026-11-09
tags: ["backend", "frontend", "security"]
---
<figure class="diagram4">
  <img src="/mcp-server-workshop.webp" srcset="/mcp-server-workshop.webp 1x, /mcp-server-workshop-2x.webp 2x" alt="Furniture workshop analogy: Claude and ChatGPT robots, holding a CIMD card and an ACCESS badge, ask the MCP server foreman to build a cupboard, while workers under the TOOLS sign plane, assemble and paint it" width="628" height="785" loading="lazy" />
  <figcaption>MCP server as manager</figcaption>
</figure>

<br>

## What is an MCP server good for?

If you've read my [previous piece](/en/blog/my-experiences-with-ai) about my adventures with AI, or you're simply a software developer, one of the first things that probably comes to mind is that in AI-assisted development we use MCPs to extend our agents' toolkit. For example:
- Context7 - lets our agent read the latest documentation
- Playwright - lets it check frontend changes in a browser
- GitHub MCP - lets it connect to the remote codebase and request information about pull requests

<br>

Plenty of non-developers may have connected applications via MCP as well, for example when they gave an AI assistant permission to read their email account or modify their calendar. Perhaps they've even trusted it with placing an order or booking a flight.

<br>

The big advantage of MCP is that it makes exposing an application simpler, because you don't have to write custom code for each AI client. Any AI application that speaks MCP and has permission to connect can do so.

<br>

## What happens when connecting?

An MCP client asks the MCP server, in the format prescribed by the protocol, which tools and resources it can access. This is preceded by an `initialize` request, in which the client and the server negotiate the capabilities they support.  
If the server is reachable over HTTP and is protected, the client has to obtain authorization before any of this.  
The MCP protocol supports two transports:
- __Stdio transport__: the client launches the server as a subprocess on the same machine, and they communicate via standard input/output. No network or authorization server is needed; the server typically gets its credentials from environment variables.
- __Streamable HTTP transport__: uses HTTP POST for client-to-server messages, and optionally a Server-Sent Events (SSE) stream for messages from the server.

<br>

The latter supports the standard authentication methods: bearer tokens, API keys, custom headers. MCP recommends authentication via __OAuth__, and many AI applications actually require it. The point of OAuth is that the user logs in to the application, granting permission for the connection, without sharing their password with the AI client.

<br>

A shared API key isn't a great idea, because if a single user abuses their access, the only way to restrict them is to replace the key. That inconveniences every other user, since they all have to set up the new key.

<br>

Besides authentication, ideally there's also a check on whether the client requesting the connection can be trusted. The recommended way to do this is CIMD (Client ID Metadata Document): the client's ID is an HTTPS URL pointing to a document that describes the client's metadata. The authorization server downloads this document and can check whether the client is among the accepted ones.

<br>

If authentication (identification) and authorization (permission checking) are in order, the model translates the user's text requests into tool calls, and the client executes them. Based on the responses, the AI sends the user a text summary of what happened.

<br>

## Let's look at a concrete example

Kasszy's settings have a "Connected AI assistants" section. Here, users get instructions on how to connect Claude or ChatGPT.

<br>

For Claude, Kasszy has to be added as a custom connector under connectors, using the URL shown on the frontend.

<br>

<figure class="diagram4">
  <img src="/add-as-claude-connector.webp" alt="Clicking the plus icon below the Claude prompt takes us to the connectors. A new custom connector has to be created." width="814" height="439" loading="lazy" />
  <figcaption>Creating a custom connector in Claude</figcaption>
</figure>

<br>

In this case, the host is the Claude app itself, and the MCP client is the component within Claude that communicates with Kasszy's MCP server. The client asks the MCP server what it can access. These can be __tools__, __resources__ and __prompts__. 

<br>

Claude keeps these options in its context. That's why it's not a good idea to have a tool for every single endpoint of a huge API. In that case, it's worth introducing an extra layer where you can group the functionality.

<br>

The user can send a request, for example, to set blueberries to "depleted".  
The model picks the tool best suited to the task, for example the "update_inventory" tool, and the client calls it.  
The MCP server's response arrives in JSON-RPC 2.0 format. 

```json
{
  "jsonrpc": "2.0",
  "id": 42,
  "result": {
    "isError": false,
    "content": [
      {
        "type": "text",
        "text": "Blueberries have been marked as depleted."
      }
    ],
    "structuredContent": {
      "itemId": "demo-item-123",
      "name": "Blueberries",
      "status": "depleted"
    }
  }
}
```

According to the protocol, every request has an identifier (`id`), and the response contains the same identifier, so the client can match them up.
The AI assistant translates the structured JSON back into easy-to-understand text.

<br>

## Wrapping up

Every now and then I hear influencers say that their AI agents can use their bank cards, reply to their emails and book accommodation on their behalf. And, of course, how happy they are about all this. At times like these, I wonder whether there's something wrong with me. Obviously, I've never had to deal with the burden of organizing back-to-back trips abroad, so I find it hard to imagine burning tokens on that. And even harder to imagine letting AI make decisions about my spending.

<br>

I can't tell what proportion of people actually benefit from connecting everything to AI. Still, I think adding a connector to applications can be useful beyond "rich people's problems" too. It can meaningfully improve certain workflows, with far less risk than unwanted transactions.

<br>

In recent years, it has been very popular to bolt an AI agent onto every piece of software. In many cases, this means the company either pays for the not-exactly-small server the LLM runs on, or pays the model's owner (OpenAI, Anthropic, etc.) for it as a service. That means open-ended bills and hard-to-predict future costs, which the profit margin may or may not cover.  
In the case of my project, it was clear that the margin wouldn't cover it. That doesn't make smartening it up impossible, though. With the MCP server implemented, users who have an AI assistant can make use of its advantages. For example, although I like doing things by hand, when I add a recipe from an external source, I just give Claude a link. It neatly extracts the relevant information, and even credits the source in the description.  
So yes, all in all, I'm pro AI connectors, as long as we keep security in mind. 

<br>

Whether we can educate users to use connectors, or the smart features only work with our own AI client, is another question. In the latter case, I don't think every feature is worth heating up the oceans for.
