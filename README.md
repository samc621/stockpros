# StockPros

StockPros is an interface for implementing custom trading strategies. Users can backtest their strategies, paper trade, and live trade. It runs in Node.js and uses a few external services.

## Services

- [PostgreSQL](https://postgresql.org) - SQL database.
- [Redis](https://redis.io) - in-memory data store.
- [Alpaca](https://alpaca.markets) - live/paper trading.
- [Polygon](https://polygon.io) - market data.
  - Polygon data is free with a live Alpaca trading account. If you set a Polygon API key in the environment variables (see below), it be used, otherwise the live Alpaca API key will be used.

## Installation

Use the `.env.example` file to configure the environment variables for a given environment e.g. `.env.local`, `.env.development`, `.env.staging`, or `.env.production`.

### Set the environment

`$ export NODE_ENV=local`

## Unit Testing

`$ npm test`

## Start the server

`$ npm start`

On start, StockPros will load the watched symbols into the DB, including up to 15 years of historical OHLC (open-high-low-close) data, and then begin running all active strategies for these symbols.

### Running with Docker Compose

`$ docker-compose build`

`$ docker-compose up`

## API

For each API, view the docs and try the requests in Postman.

- [Strategies](https://documenter.getpostman.com/view/5027621/TVzSjwkc)
- [Signals](https://documenter.getpostman.com/view/5027621/TVzSjwkb)
- [WatchedSymbols](https://documenter.getpostman.com/view/5027621/TVzSjwuM)
