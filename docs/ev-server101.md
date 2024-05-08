# EV-SERVER 101 GUIDE

This document was created to help you understand the mess that previous programmers have created. Hopefully, you can understand it and able to continue the development of this project. Good luck😊‼️

## Table of Contents

- [Definition](#definition)
- [Drizzle directory](#drizzle-directory)
- [Src directory](#src-directory)
  - [App directory](#app-directory)
    - [web.ts](#webts)
    - [logger.ts](#loggerts)
    - [db.ts](#dbts)
  - [Controllers directory](#controllers-directory)
  - [Db directory](#db-directory)
    - [dbCli.ts](#dbclits)
    - [seed.ts](#seedts)
    - [Schema directory](#schema-directory)
  - [Middlewares directory](#middlewares-directory)
  - [Routes directory](#routes-directory)
  - [Services directory](#services-directory)
  - [Types directory](#types-directory)
  - [Utils directory](#utils-directory)
  - [Validations directory](#validations-directory)
- [Test Directory](#test-directory)
- [Available commands](#available-commands)
- [.env files](#env-files)
- [More references](#other-references)

## Definition

- **OCPP**
  An open communication system that is widely used as a standardization of communication between charging stations and charging station management system

- **Central System**

  Charge Point Management System/Charging Station Management System: the central system that manages Charge Points and has the information for authorizing users to use its Charge Points.

- **Charge Point/Charging station**

  The Charge Point is the physical system where an electric vehicle can be charged. A Charge Point has one or more connectors.

- **Transaction**

  The part of the charging process that starts when all relevant preconditions (e.g. authorization, plug inserted) are met and ends at the moment when the Charge Point irrevocably leaves this state.

## Drizzle directory

The `./drizzle` directory is a place where the database migrations file produced by [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) will be. These migration files are generated based on [schema](#schema-directory) changes.

Drizzle-kit not only produces SQL files for migrations but also produces metadata to keep track of the schema changes in the codebase.

To generate the migration files you can use this command:

```bash
  pnpm run sql:generate
```

_Manually deleting SQL files is considered harmful_, since these could break the database migration process. Instead, use this command to delete the migration file:

```bash
  pnpm run sql:drop
```

> Please visit the [drizzle-kit docs](https://orm.drizzle.team/kit-docs/overview) for more info.

## Src directory

`./src` is the main folder for this app. Here you can define controllers, middlewares, routes, etc. There is also `./src/index.ts` which is the starting point of the app.

### App directory

The app directory can be accessed at at `./src/app`. This is where the singleton instance will be defined and configured (e.g. logger, and database).

#### web.ts

`web.ts` is the file where the express.js instance is defined. So if you want to add more middlewares or routes you can add them here.

#### logger.ts

`logger.ts` is the file where the [Winston logger](https://github.com/winstonjs/winston) is defined. Here is the place where you want to change the logger configuration or maybe create a new logger instance. The current logger instance also can receive two optional meta which are module and method.

> ! Not recommened to use console.log use, better to use this logger.

Usage example:

```javascript
import { logger } from 'app/logger';

// Output: [2024-05-08T06:02:10.516Z] info(App): Some log message
logger.info('Some log message');

// Using logger with meta
// Output: [2024-05-08T06:02:10.516Z] info(myModule - foo): Log message with meta
logger.info('Log message with meta', { module: 'myModule', method: 'foo' });
```

#### db.ts

`db.ts` is the file where the [drizzle orm](https://orm.drizzle.team/docs/) and [mysql2](https://sidorares.github.io/node-mysql2/docs) connection is defined. You can change or add database configuration here. But better to change the config at the `.env` file.

Usage example:

```javascript
import { db } from 'app/db';
import { chargeboxes } from 'db/schema';

const chargeboxes = await db.select().from(chargeboxes);
```

### Controllers directory

`./src/controllers` just like its name, this is where the controllers should be defined. Controllers are responsible for handling user requests and interacting with the service module.

The controller should be a class that extends a base controller class (if applicable) or implements a specific interface.

Controllers should not directly instantiate the class they depend on (services, etc.). Instead, rely on dependency injection techniques to receive these dependencies through the constructor or methods. This promotes loose coupling and makes testing controllers easier. Then, initiate the controller class at the `./src/controllers/index.ts` file.

### Db directory

`./src/db` directory contains code that relates to the database (seed, schema, etc.).

#### dbCli.ts

`dbCli.ts` is the CLI helper for interacting with a database (create db, migration, drop db, etc). This CLI accepts multiple arguments, the available arguments are:

| argument          | description                        |
| ----------------- | ---------------------------------- |
| `-h`,`--help`     | Show help                          |
| `--create`        | Create database                    |
| `-m`, `--migrate` | Migrate database table             |
| `--drop`          | Drop database                      |
| `--fresh`         | Drop db then create db and migrate |
| `--seed`          | Run database seed                  |

By default, if you don't pass any arguments it will create and then migrate the database table.

```bash
  # This command will create and migrate db
  pnpm run db
  # or run the compiled version
  pnpm run db:node
  # Run command with arguments
  pnpm run db -h
```

#### seed.ts

`seed.ts` is where the database data dummy will be defined.

#### schema directory

`./src/db/schema` folder contains drizzle database schema files. Each file should represent a single schema, these files define the structure of app database tables, including the columns, their data types, constraints, and relationships.

If you need to create a new schema you need to re-export it in the `./src/db/schema/index.ts`. Re-exporting will simplify importing schemas in other modules.

```javascript
// If you don't re-export schema
import { chargeboxes } from 'db/schema/chargeboxes';
import { connectors } from 'db/schema/connectors';

// If you re-export schema, cleaner import
import { chargeboxes, connectors } from 'db/schema';
```

Here's some example of creating a book schema:

1. First, create the book schema file `./src/db/schema/books.ts`. Inside the file, we define the book table.

```javascript
// books.ts
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core';

// Define books table that has id, title, writer column.
// If needed you can add relation in this file too.
// For more information related to drizzle orm please visit https://orm.drizzle.team/docs/.
export const books = mysqlTable('books', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  writer: varchar('writer', { length: 255 }).notNull(),
});
```

2. After that, don't forget to re-export the books object in `./src/db/schema/index.ts`.

```javascript
// index.ts
export * from './books';
```

3. Congratulations, you have created a book schema🎉.

### Middlewares directory

The `./src/middlewares` directory is a place where the [Express middleware](https://expressjs.com/en/guide/using-middleware.html) should be, middleware is like the control center for handling requests before they reach the controllers. It acts as a layer that intercepts incoming requests, performs specific tasks, and potentially modifies them before passing them on. Think of it as a series of checkpoints a request goes through before reaching its final destination.

### Routes directory

All routes are defined in route files, which are located at `./src/routes`. These files will be loaded in [web.ts](#webts). If you try to create a new routes file, you should register it in the [web.ts](#webts) file. See [Express Routing](https://expressjs.com/en/guide/routing.html) for more info.

There is some exception for `routes/wsRouteHandler.ts`, because Express.js didn't handle WebSocket connection this file will be loaded in the `./src/index.ts` file.

### Services directory

The `./src/services` directory is the heart of your application's business logic. It houses reusable functionalities that operate on your data, separate from the controllers. Same as controllers Services should be a class. Services are typically injected into controllers through their constructors or other methods.

### Types directory

All Typescript type definitions (interfaces, enums, type aliases, constant) are defined in `./src/types`.

### Utils directory

The `./src/util` directory serves the application's utility, containing a collection of reusable helper functions that don't belong to specific models, controllers, or services. These functions provide common functionalities that can be utilized across various parts of the application.

### Validations directory

The `./src/validations` houses [Zod](https://zod.dev/) validation schemas. These schemas define the expected format and structure of data received from client requests, ensuring data integrity. Each schema acts as a blueprint, focusing on a specific type of data like user registration information, product details, or form submissions.

## Test directory

The `./src/test` houses test files written to ensure the functionality and reliability of the codebase.

> ! The test file should have `*.test.ts` suffix

## Available commands

- Build

  **Compiling the Typescript code to JavaScript**, this script cleans up the build directory, compiles TypeScript code, and then post-processes the compiled JavaScript to resolve any configured aliases. The build output will be located at `./dist`.

  ```bash
  # Usage
  pnpm run build
  ```

- Start

  Running the compiled JavaScript code to start the local server.

  ```bash
  # Usage
  pnpm run start
  ```

- Dev

  Running the development server. This is a local server without building the TypeScript code first.

  ```bash
  # Usage
  pnpm run dev

  # Run the watch mode
  # This command automatically re-runs it when the file is changed.
  pnpm run dev:watch
  ```

- Test

  Run the jest testing.

  ```bash
  # Usage
  # This will run all the test inside the test folder.
  pnpm run test

  # Run spesific test
  pnpm run test <directory/file path>
  # Example
  pnpm run test index.test.ts
  ```

- Lint

  Run checking for style and potential errors using ESLint.

  ```bash
  # Usage
  pnpm run lint
  ```

- Format

  Automatically format the code using Prettier.

  ```bash
  # Usage
  pnpm run format
  ```

- Clean

  Delete `./dist` directory.

  ```bash
  # Usage
  pnpm run clean
  ```

- SQL

  Run the drizzle-kit to generate or delete the SQL migration file.

  > See [Drizzle directory](#drizzle-directory) chapter for more information.

  ```bash
  # Usage
  pnpm run sql:generate

  pnpm run sql:drop
  ```

- Db

  Run the database utility CLI. Visit [dbcli.ts](#dbclits) for more information.

  ```bash
  # Usage
  pnpm run db
  ```

## .env files

You need to create your `.env` file to make sure the application runs properly. You can copy the `.env.example` file for the reference of every key you need.

| Key           | Description                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`     | Application environtment. This key has 3 options dev, prod, and test.                                                                             |
| `LOG_LEVEL`   | Minimum log level that will be shown for this application. Visit [Winston](https://github.com/winstonjs/winston) to see all available log levels. |
| `SERVER_PORT` | The server port will run on.                                                                                                                      |
| `DB_HOST`     | Database host name that will be use.                                                                                                              |
| `DB_PORT`     | Database port that will be used.                                                                                                                  |
| `DB_USER`     | User for the database.                                                                                                                            |
| `DB_PASSWORD` | Password for the database.                                                                                                                        |
| `DB_NAME`     | Database name that will be used.                                                                                                                  |

## More references

- [Drizzle](https://orm.drizzle.team/docs)
- [Drizzle kit](https://orm.drizzle.team/kit-docs/overview)
- [Express JS](https://expressjs.com/en)
- [Mysql2](https://sidorares.github.io/node-mysql2/docs)
- [OCPP 1.6](https://openchargealliance.org/protocols/open-charge-point-protocol/#OCPP1.6)
- [TypeScript](https://typescriptlang.org/)
- [Winston logger](https://github.com/winstonjs/winston)
- [Zod](https://zod.dev)
