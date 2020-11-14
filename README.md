# StockPros

StockPros is an interface for implementing custom trading strategies. Users can backtest their strategies, paper trade, and live trade. It runs in Node.js and uses a few external services.

## Services

- [PostgreSQL] (https://postgresql.org) - SQL database
- [Alpaca] (https://alpaca.markets) - for live/paper trading
- [Polygon] (https://polygon.io) - for market data (free with a live Alpaca trading account)

## Installation

Use the `.env.example` file to configure the environment variables for a given environment e.g. `local`, `development`, `staging`, or `production`.

### Set the environment

`$ export NODE_ENV=local`

### Start the server

`$ npm start`
