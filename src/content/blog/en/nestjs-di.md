---

title: "NestJS Dependency Injection"

description: "One of the great advantages of NestJS is that it provides a well-defined structure for our backend. Dependency injection is one of the key tools for keeping our codebase clear and efficient. It means that we don't have to initialize a dependency where we use it. We only need to indicate that we need it, and NestJS makes it available to us."

date: 2026-08-20

tags: ["backend"]

---

<figure class="diagram3">

  <img src="/nestjs_cook.webp" alt="A chef labeled NestJS pours a pot labeled UserService into a cauldron labeled DI Container while reading a TypeScript metadata cookbook, as UserController rings for it" width="1536" height="1024" loading="lazy" />

  <figcaption>NestJS dependency injection, kitchen style</figcaption>

</figure>

<br>

## What does dependency injection (DI) mean in practice?

If a class didn't rely on NestJS's DI system to make its dependencies available, the code would look something like this:

```

class UserController {

    constructor() {
        const config = new Config();
        const database = new Database(config);
        const userRepository = new UserRepository(database);

        this.userService = new UserService(userRepository)
    }
}

```

<br>

Instead, we only need to indicate what we want to use:

```

class UserController {
    constructor(private userService: UserService) {}
}

```

We don't have to build the entire dependency chain ourselves everywhere.

<br>

## What happens behind the scenes?

During compilation, type definitions are removed from the code, but if the TypeScript configuration file contains

```
    "emitDecoratorMetadata": true,
```

the metadata is preserved and can be used to keep information in the code about which classes require which other classes. The algorithm can rely on this information, along with which providers have been registered and which tokens we have defined.

<br>

NestJS collects the providers defined in the module and registers them in the DI container. It then creates and manages the necessary instances as dependencies are resolved. Based on the metadata, it can build the __dependency graph__ showing which pieces of code require which providers. By default, a reusable _instance_ is created for each provider, which NestJS caches.

<br>

From a performance perspective, it makes perfect sense that singleton scope is the default, but it can be overridden with REQUEST or TRANSIENT scope. In the latter case, the transient provider is not shared between consumers, but each consumer gets its own instance. With REQUEST scope, a new instance is created for every incoming request.

<br>

Injection itself is a recursive process in which the algorithm goes through the dependencies of dependencies and builds the required objects:

```

    resolve(A)

    A requires B

        ↓

    resolve(B)

    B requires C

        ↓

    resolve(C)

    C requires nothing

        ↓

    create C

    create B(C)

    create A(B)

```

<br>

## Circular dependency

The logic above raises the question: what happens when A depends on B and B depends on A? Uh-oh... Although it is generally a good idea to avoid this, for example by moving shared elements into a separate module, there are cases where it can be justified. In such cases, the solution is _forwardRef()_.

```
constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}

```

<br>

```

constructor(
    @Inject(forwardRef(() => CatService))
    private catService: CatService,
  ) {}

```

In this case, the algorithm can postpone resolving the referenced class until later, potentially until the entire graph has been built.

<br>

Mutual dependencies can also occur between modules, in which case _forwardRef()_ is needed as well.

```
// CommonModule
@Module({ imports: [forwardRef(() => CatsModule)] })

export class CommonModule {}

```

<br>

```
// CatsModule
@Module({ imports: [forwardRef(() => CommonModule)] })

export class CatsModule {}

```

<br>

## What can be injected?

You can inject more than just another class. You can also inject values, or values calculated at runtime that depend on other providers. Let's look at a few examples.

Constants:

```
    const catConfig = {
        color: 'black',
        strength: 'strong',
    };

    @Module({
        providers: [
            {
                provide: 'CAT_CONFIG',
                useValue: catConfig,
            },
        ],
    })

```

<br>

Notice that our provider has been given a name. This becomes the **__token__**, which NestJS uses to find and resolve the provider later. The commonly used, one-line provider definition is a shorthand for the following:

```
{

    provide: CatsService,
    useClass: CatsService,

  },

```

<br>

If we use a string or a Symbol instead of a class as the provider's injection token, we have to specify the token with the `@Inject()` decorator when injecting it.

```

    @Injectable()
    export class CatSalon {
        constructor(@Inject('CAT_CONFIG') private config) {}
    }

```

<br>

Values depending on parameters.

```

    @Module({
        providers: [
            {
                provide: 'CAT_MOOD',
                useFactory: () => {
                    const hour = new Date().getHours();
                    return hour < 16 ? 'Calm Cat' : 'Impatient cat';
                },
            },
        ],
    })

```

A typical example would be a provider that supplies a database connection based on configuration.

```
{
  provide: 'CONNECTION',
  useFactory: (config: ConfigService) => new DatabaseConnection(config.get('DB_URL')),
  inject: [ConfigService],
}

```

In this case, the argument is injected as well.

<br>

## What is required for injection to work?

- __@Injectable()__ is used to mark classes that can participate in the dependency injection system.

- In the module file, we list all the providers that can be managed by the module's DI container under the _providers_ key. This is where NestJS's algorithm determines which providers need to be registered in the container.

- If another module wants to use a given provider, the module containing the provider must add the __provider__ to its _exports_ list, and the consuming module must specify the exporting __module__ in its _imports_ list.

- The compiler matters because it is important to preserve metadata that is available at runtime. For example, _tsc_ or _SWC_ can be used with the appropriate configuration.

<br>

## Conclusion

Thanks to dependency injection, we get a more transparent codebase, and by understanding the basic logic, we can build our modules more easily and fix dependency injection-related errors more quickly. For example, when we forget to export something (if we happened to be in the mood to write the code manually 🙂).
