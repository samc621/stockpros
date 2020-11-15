# StockPros

StockPros is an interface for implementing custom trading strategies. Users can backtest their strategies, paper trade, and live trade. It runs in Node.js and uses a few external services.

## Services

- [PostgreSQL](https://postgresql.org) - SQL database
- [Redis](https://redis.io) - in-memory data store
- [Alpaca](https://alpaca.markets) - live/paper trading
- [Polygon](https://polygon.io) - market data
  - Polygon data is free with a live Alpaca trading account. If you set a Polygon API key in the environment variables (see below), it be used, otherwise the live Alpaca API key will be used.

## Installation

Use the `.env.example` file to configure the environment variables for a given environment e.g. `.env.local`, `.env.development`, `.env.staging`, or `.env.production`.

### Set the environment

`$ export NODE_ENV=local`

## Unit Testing

`$ npm test`

## Strategy Creation

Strategies go into the `/strategies` directory. StockPros comes with a default strategy.

On start, StockPros will load the S&P 500 stocks into the DB and then begin running **all** strategies in the directory on them.

## Start the server

`$ npm start`
