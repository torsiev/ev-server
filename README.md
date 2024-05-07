# EV Server

A backend application that serves an [OCPP](https://openchargealliance.org/protocols/open-charge-point-protocol/) v1.6 central system for managing the communication between charging stations (EV chargers) and the central system.

## Setup

First, install the required tools

- Install NodeJS: https://nodejs.org/ (Install version 20 or the latest LTS)
- Install pnpm: https://pnpm.io/installation
- Install MySQL 8: https://dev.mysql.com/downloads/

Clone the project

```bash
  git clone https://github.com/torsiev/ev-server.git
```

Go to the project directory

```bash
  cd ev-server
```

Install dependencies

```bash
  pnpm install
```

Create .env file

```bash
cp .env.example .env
```

Change the value on the .env file based on your need.

### Development Mode

Start the server

```bash
  pnpm run dev
```

Or start the server in watch mode

```bash
  pnpm run dev:watch
```

### Production Mode

Build the app

```bash
  pnpm run build
```

Start the local build server

```bash
  pnpm start
```

## Running Tests

To run tests, run the following command.

```bash
  pnpm test
```

## Running Database Migration

To run database migration, make sure the env value for the database is correct. Then you can run the following command.

```bash
  # This command will create database and migrate the database table.
  pnpm run db
```

For more options you can run add `--help` argument.

```bash
  pnpm run db --help
  # or
  pnpm run db -h
```
