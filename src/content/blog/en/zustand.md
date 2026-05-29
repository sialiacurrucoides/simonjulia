---

title: "Zustand"
description: "Client-side state management can be made simple and efficient with the Zustand state manager."
date: 2026-05-29
tags: ["frontend"]
---

## When should we use it?

The truth is that you do not always need an external library for client-side state management. Although Zustand can also be used independently from React, the examples in this article will come from the React ecosystem.

If you are working on a simpler application, or there is only a small amount of client-side logic because most of the data comes from the backend, the built-in React solutions may be perfectly sufficient:

* Context API for global state management (e.g. ThemeProvider)
* useState for simple local state used by a single component
* useReducer for more complex local state
* Context API + useReducer for shared global state

<br>

However, as the amount of tracked state grows, a Context-based strategy can easily lead to performance issues. The reason is that whenever the value of a context provider changes, every component consuming that context rerenders.

One of the biggest advantages of modern state managers such as Zustand is that components can subscribe to only a single property of the stored state and rerender only when that specific property changes.

<br>

Historically, Redux has been the most well-known state manager, and it can still be a good choice for very large projects where a large and constantly changing development team requires a well-defined architecture. One of Redux’s main drawbacks, however, is the amount of boilerplate code it introduces. Zustand aims to solve this problem with a much simpler API and syntax.

<br>

## Using Zustand

With Zustand, the first step is defining a *store*.

```
import { create } from 'zustand'

const useBear = create((set) => ({
  bears: 0,
  actions: {
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
    updateBears: (newBears) => set({ bears: newBears }),
  }
}))
```

Notice that unlike the classic React approach, we do not need to manually merge the previous and the new state. We only specify the properties we want to change, and Zustand performs the merge automatically.

However, this behavior only applies to the top level of the state object. For nested objects, we still need to merge the previous and new state manually.

```
setAddress: () => set((state) => ({
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      address: 'My new address'
    }
  }
}))
```

If you frequently work with deeply nested state, you can use the **immer** middleware, which needs to be installed separately.

<br>

### create vs createStore

We can use either the **create** or the **createStore** function to create a store.

The difference is that *create* is optimized for React and essentially returns a hook with the store methods attached to it (`getState`, `setState`, `subscribe`). Thanks to this integration, components rerender automatically when the relevant state changes.

On the other hand, *createStore* creates a framework-agnostic store object, where we are responsible for integrating it into the framework ourselves. This approach can be particularly useful for SSR strategies.

Both functions can also be used outside React components, which helps keep components cleaner and move logic elsewhere.

```
import { useChatStore } from './chatStore'

const socket = new WebSocket('wss://example.com/chat')

socket.addEventListener('open', () => {
  useChatStore.getState().setConnected(true)
})
```

<br>

### Using stored values

When using Zustand inside components, we should keep in mind that Zustand compares the reference of the selector’s return value with the reference of the next value. If the references differ, the component rerenders.

With this in mind, let us look at a few good and bad examples.

```
// GOOD
const counter = useMyStore((s) => s.counter)
const selectedColor = useMyStore((s) => s.selectedColor)
const actions = useMyStore((s) => s.actions) // even though actions is an object, its reference remains stable

// BAD
const { counter, selectedColor } = useMyStore((s) => ({
  counter: s.counter,
  selectedColor: s.selectedColor
})) // object reference changes on every render

const { actions } = useMyStore() // rerenders on every store change
```

<br>

### useShallow

When working with many primitive values, extracting each one individually can feel repetitive. In these cases, we can use the *useShallow* hook.

It is important to remember that shallow comparison only happens at the top level.

```
const names = useBearFamilyMealsStore(
  useShallow((state) => Object.keys(state)),
)
```

<br>

### Middlewares

Zustand provides several built-in middlewares for common problems (`devtools`, `immer`, `combine`, etc.).

One example is **persist**, which allows us to save the state into *localStorage*.

```
const positionStore = createStore<PositionStore>()(
  persist(
    (set) => ({
      position: { x: 0, y: 0 },
      setPosition: (position) => set({ position }),
    }),
    { name: 'position-storage' },
  ),
)
```

Notice the additional function call after the generic type definition (currying). This pattern is required whenever middleware is applied, including custom middleware. It enables proper type inference for nested objects.

<br>

### Summary

In my opinion, Zustand fully deserves its growing popularity. It is easy to learn, has a very clean API, and if we follow a few simple principles, it can help make our applications more efficient and maintainable.
