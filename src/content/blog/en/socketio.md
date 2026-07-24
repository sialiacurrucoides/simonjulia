---
title: "Real-Time Notifications"
description: "HTTP communication follows a request-response model. The client only receives new data after sending another request to the server. As a result, continuously tracking state changes often requires polling or a similar technique. WebSocket was designed to solve this problem by allowing a connection to remain open for a long time. In practice, Socket.IO is often the tool we use because it provides solutions to many problems that WebSocket alone does not address."
date: 2026-07-24
tags: ["frontend", "backend"]
---

<figure class="diagram3">
  <picture>
    <source media="(max-width: 600px)" srcset="/socketio_en_mobile.svg" />
    <img src="/socketio_en.svg" alt="Data flow over an open connection" width="900" height="630" loading="lazy" />
  </picture>
  <figcaption>Data flow over an open connection</figcaption>
</figure>

<br>

## Common Use Cases

- messaging applications
- multiplayer online games
- real-time stock market data
- live sports updates
- monitoring systems
- collaborative document editing
- notifications

<br>

## How WebSocket Works

WebSocket is an application-layer communication protocol, just like HTTP. Unlike HTTP, however, it enables continuous, bidirectional, near real-time communication between the client and the server.

<br>

Why "near" real-time? Because the communication process involves multiple components (see the first diagram). For example, transmitting data over the network takes a measurable amount of time. Furthermore, JavaScript executes on a single main thread. If a long-running synchronous operation is blocking that thread, the operating system may already have received new data on a socket, but JavaScript cannot process it until the event loop gets a chance to handle it. The socket itself is managed by the operating system kernel, where incoming data is buffered in memory before being processed by the application. This architecture allows multiple sockets to exist simultaneously.

<br>

WebSocket uses TCP (Transmission Control Protocol) as its transport protocol because TCP guarantees that messages arrive in the same order they were sent, unlike the faster but unordered UDP (User Datagram Protocol).

<br>

The Node.js ecosystem includes a popular library called **ws**, which, at the time of writing, receives nearly 200 million downloads per week. It can be used on both the client and the server.

<br>

## Why Use Socket.IO?

A plain WebSocket library is perfectly adequate for demonstrating a simple chat application. However, production applications often require additional features that go beyond the WebSocket protocol itself. Some examples include:

- automatic reconnection
- fallback to HTTP long-polling
- an event-based API
- multiplexing (multiple namespaces over a single connection)
- message acknowledgements

Of course, you could implement these features yourself. But why reinvent the wheel when there's a mature, open-source library that has been refined and maintained by the community for years? In the JavaScript ecosystem, that library is Socket.IO.

<br>

<figure class="diagram3">
  <picture>
    <source media="(max-width: 600px)" srcset="/socketio-handshake_en_mobile.svg" />
    <img src="/socketio-handshake_en.svg" alt="HTTP handshake followed by a WebSocket upgrade, or long-polling if the upgrade fails" width="900" height="420" loading="lazy" />
  </picture>
  <figcaption>HTTP handshake → WebSocket upgrade (or long-polling if the upgrade fails)</figcaption>
</figure>

<br>

## Namespaces

We've mentioned namespaces, but what exactly are they in this context? You can think of them as logical endpoints. They resemble REST routes such as `/chat` or `/admin`, but they actually represent separate Socket.IO communication channels. They make it possible to separate different parts of an application and control which events and data each part can access.

```
io.of("/orders").on("connection", (socket) => {
  socket.on("order:list", () => {});
  socket.on("order:create", () => {});
});

io.of("/users").on("connection", (socket) => {
  socket.on("user:list", () => {});
});
````

<br>

## Rooms

Rooms are a strictly server-side concept. The server decides which rooms a client may join and can broadcast messages to specific rooms accordingly. A namespace can contain multiple rooms, and each room can contain multiple sockets.

The client cannot query which rooms currently exist.

```
io.on("connection", (socket) => {
  socket.join("some room");
});

io.to("some room").emit("some event");
```

<br>

## Why Not Server-Sent Events (SSE)?

Server-Sent Events (SSE) only support one-way communication from the server to the client, whereas WebSocket provides full bidirectional communication. If your application only needs to push updates to the browser—for example, news feeds or stock prices—SSE may be the simpler choice. However, if the client also needs to continuously send data back to the server, as in chat applications, multiplayer games, or collaborative editing, WebSocket is the better option.

<br>

## NestJS Integration

Most tutorials and documentation demonstrate Socket.IO using plain JavaScript. To integrate it into a NestJS application, however, you'll typically use an adapter. The `@nestjs/platform-socket.io` package provides Socket.IO integration through NestJS's WebSocket abstraction. In larger distributed systems, you can also use the `@socket.io/redis-adapter`.

With a custom adapter, you can implement socket authentication before handing the configured Socket.IO server over to your NestJS application in `main.ts`.

```
app.useWebSocketAdapter(new AuthenticatedIoAdapter(app));
```

It's also worth configuring CORS at this stage. Because Socket.IO starts with an HTTP connection, clients from different origins must be explicitly allowed; otherwise, the connection may fail before the WebSocket upgrade even takes place.

<br>

## Things to Keep in Mind

* On the client side, don't register your event listeners inside the `connect` callback. Since the callback is executed again after every reconnection, doing so will register duplicate listeners. Instead, define your event handlers separately (as recommended in the official documentation).

```
// BAD
socket.on("connect", () => {
  socket.on("data", () => {
    /* ... */
  });
});

// GOOD
socket.on("connect", () => {
  // ...
});

socket.on("data", () => {
  /* ... */
});
```

<br>

* Decide whether buffered events accumulated during a temporary connection loss should be processed after reconnection. For example, it usually doesn't make sense to process hundreds of queued mouse position updates when only the most recent position matters. In such cases, the `volatile` modifier is useful.

```
io.volatile.emit("position", playerPosition);
```

<br>

* Finally, remember that messages sent over WebSocket are not delivered to users who are offline. If you're building a reliable notification system, you'll also need an appropriate persistence and synchronization strategy to ensure users receive notifications they missed while disconnected.

