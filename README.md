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

## Running with Docker

> Each following command has to be executed in the project root folder

Before we start please create a `.env` file first, you can follow the [Setup](#setup) chapter to see how you can do it.

First, set the ENV value for the database, you can follow this example:

```bash
DB_HOST=db # You must set the host to db, otherwise the app won't connect to the db
DB_USER=root
# For the others you can setup on you own
DB_PORT=3306
DB_PASSWORD=yourpassword
DB_NAME="ev_server"
# This path can be anywhere, depending on your preferences
DB_VOLUME_PATH="C:/Users/someone/Documents/docker_mysql" # Windows
DB_VOLUME_PATH="/home/user/docker_mysql" # Linux
```

After setting up the `.env` file, make sure your device is running docker. Then build the docker image for this project.

```bash
docker image build -t ev-server .
```

Then, run the docker-compose with this command:

```bash
docker compose up -d
```

If the containers run properly, you can run database migration on the app container.

```bash
docker exec -it <container_id_or_name> bash
#example
docker exec -it ev-server-app-1 bash
```

Inside the container bash, you can run the database migration.

```bash
pnpm run db:node

pnpm run db:node --seed # Run db seeding (optional)
```

Now the project runs on docker🥳.

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

## Project Docs

See [`/docs/ev-server101.md`](./docs/ev-server101.md) for more information about this project.
