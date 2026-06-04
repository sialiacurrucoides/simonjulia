---

title: "Playwright"
description: "Playwright is an open-source tool for end-to-end (E2E) testing of web applications."
date: 2026-06-04
tags: ["frontend"]
---

## Why Use Playwright?

One of the main reasons we write tests is to increase our confidence when making changes to a larger codebase. If all important functionality is covered by tests, we can release new changes with much greater peace of mind.

While `unit` tests focus on isolated pieces of logic, end-to-end (E2E) tests are designed to validate complete user flows by simulating realistic application usage. We verify which changes should occur in response to specific events and exactly what the user should see on the screen.

When it comes to E2E testing, Cypress is probably one of the most well-known tools. However, depending on how you use it, costs may arise beyond local development. E2E tests also tend to take longer to run, making them less suitable for *pre-push* hooks. In most cases, they are best executed as part of a CI pipeline.

This is where Playwright shines. It is free, feature-rich, and even offers to generate a GitHub Action workflow during initialization.

Playwright is primarily a browser testing framework, but it also supports API testing through its built-in `request` fixture. Integrating it into a project is straightforward if you follow the official documentation.

<br>

### Why Learn It Instead of Letting AI Do Everything?

In the age of AI, it's tempting to outsource test writing entirely. There's nothing wrong with using AI to optimize workflows or handle smaller tasks, but if we outsource everything, we risk losing the very confidence that testing is supposed to provide.

AI is often good at generating tests for functionality that is already visible and well-defined. However, when we take the time to build a few tests ourselves, step by step, we frequently discover details that deserve improvement or optimization.

I don't think the goal is to memorize every piece of syntax. The goal is to understand the fundamentals and become familiar with the core features.

<br>

## Selectors and Locators

Selectors are textual expressions that describe how a DOM element can be found (for example: `form.login-form button[type="submit"]`).

Locators, on the other hand, are Playwright objects that can actively search for and interact with elements. They may use selectors internally, for example:

```
const submitButton = page.locator(
  'form.login-form button[type="submit"]'
);
```

However, Playwright also provides specialized locator methods that offer a simpler and more expressive API. Examples include:

```
page.getByRole('button', { name: 'Save' })
page.getByText('Save')
page.getByLabel('Email')
page.getByPlaceholder('Search')
page.getByTestId('save-button')
```

These locators can perform more advanced matching as well. For example, `getByRole` takes both accessibility roles and accessible names into account.

<br>

Actual assertions are performed using the familiar *expect* function. It follows a Jest-like assertion syntax while also providing many Playwright-specific assertions.

Most commonly, it operates on Playwright locator objects, although assertions are also available for objects such as `Page` and `APIResponse`.

A simple example:

```
const saveButton = page.getByRole('button', { name: 'Save' });

await expect(saveButton).toBeVisible();
```

Notice the use of `await`. Playwright assertions are asynchronous and automatically wait for the expected condition to become true, making tests more resilient to timing issues.

<br>

## Playwright VS Code Extension (Version 1.1.19)

Thanks to its popularity, there are several VS Code extensions available for Playwright. The one I personally recommend is **Playwright Test for VS Code**, maintained by Microsoft.

After installation, you should see a flask icon in the left sidebar. Clicking it opens the Playwright test panel where your tests are displayed. If some tests are missing, scroll down to the **PROJECTS** section and make sure your installed browsers are selected.

Once configured, all tests should appear along with convenient action buttons for running or debugging them directly from the editor.

<br>

Above the PROJECTS section you'll find the **TOOLS** menu, which contains some very useful features.

The *Pick locator* tool launches a browser and allows you to hover over elements to see which locator Playwright would generate for them. Sometimes it may open a blank page. In that case, simply navigate to your locally running application inside that browser window.

Another useful feature is *Record new*. It launches a browser and starts recording your interactions. As you click around the application, Playwright automatically generates locator code and inserts it into a test file. You'll still need to define your assertions, but the relevant locators are generated for you.

<br>

## Testing Applications That Require Authentication

Testing public pages is relatively straightforward. However, applications that require authentication are often the ones that benefit most from thorough testing.

One important thing to remember is that each Playwright test runs independently. At a minimum, you could place your login flow inside a *beforeEach* hook when testing protected pages. However, repeating the entire login process for every test is both slow and unnecessary.

Playwright allows you to save and reuse browser state, including cookies, local storage, and other session-related data. This makes it possible to perform authentication once and automatically reuse the authenticated state across tests.

When testing pages that should be accessible before login, you can override the stored authentication state. For example:

```
test.use({ storageState: { cookies: [], origins: [] } })
```

A common approach is to create a dedicated setup file and reference it from your `playwright.config.ts` file located in the project root:

```
...
projects: [
  /* Creates + verifies + logs in a fresh test user; teardown deletes it afterwards. */
  { name: 'setup-user', testMatch: /.*\.setup-user\.ts/, teardown: 'cleanup-user' },
  { name: 'cleanup-user', testMatch: /global\.teardown\.ts/ },
  ...
]
```

You may also encounter examples that use:

```
globalSetup: require.resolve('./utils/global-setup')
```

The authentication approaches shown here are only examples. Playwright supports multiple authentication strategies, and the exact implementation often depends on the requirements of a specific project.

<br>

The local setup is usually the easy part. The challenge often comes when running tests in CI.

If your frontend communicates with an external backend, it may make sense to run tests against a staging environment that uses a staging backend. This often requires backend support because tasks such as email verification cannot always be completed through the UI alone.

One possible solution is to create test-specific endpoints that are unavailable in production. For example, an endpoint could verify a test user's email address when called with a valid secret header. Another endpoint might remove test users once testing has finished.

In production systems, records are often archived instead of deleted, but continuously accumulating test data is rarely desirable.

On the frontend side, some additional configuration is usually required. You'll typically define a `baseURL` in the `use` section of `playwright.config.ts` and configure `extraHTTPHeaders` using secrets stored in environment variables.

Depending on the architecture of your application (for example, when frontend and backend run on separate domains), additional proxy or authentication-related solutions may be required to handle cookies and security restrictions correctly.

This section is intentionally not a copy-and-paste guide. Syntax, infrastructure, and project requirements vary, so my goal here is to explain the overall approach rather than provide a universal implementation.

<br>

## Conclusion

Playwright is widely adopted, has a strong ecosystem, and is completely free. As a result, finding answers, examples, and learning materials is rarely a problem.

If you're looking for a course, I can recommend Dilpreet Johal's Playwright course on Udemy. I have no affiliation with him; I simply found his explanations clear and easy to follow.

AI tools also have a substantial amount of knowledge about Playwright. Playwright MCP is becoming increasingly popular as well, allowing AI assistants to interact with browsers directly.

Personally, I found Playwright slightly less intuitive to get started with than I remembered Cypress being. That said, learning resources are plentiful, the API is extensive, and the naming conventions are generally very descriptive.

Although I've only started using it recently, I fully expect Playwright to remain part of my toolkit going forward.
