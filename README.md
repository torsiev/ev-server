# EV Server

A backend application that serves an [OCPP](https://openchargealliance.org/protocols/open-charge-point-protocol/) v1.6 central system for managing the communication between charging stations (EV chargers) and the central system.

## Setup

First, install the required tools

- Install NodeJS: https://nodejs.org/ (Install the LTS version)
- Install pnpm: https://pnpm.io/installation

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

To run tests, run the following command

```bash
  pnpm test
```
