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

All strategies should contain an `executeStategy` method which codifies the strategy itself.

On start, StockPros will load the S&P 500 stocks into the DB and then begin running **all** strategies in the directory on the selected watchlist.

## Start the server

`$ npm start`

## Backtesting

The `executeStrategy` method has some optional params used for backtesting:

- `backtest` (Boolean) - set to true for backtesting
- `stockCalcs` (Object) - the point-in-time calculations which are normally stored in the DB

```
{
  sma_50_day,
  sma_200_day,
  high_52_week,
  low_52_week,
  cagr_3_year
};
```

- `position` (Object) - the point-in-time position details

```
{
  avg_entry_price,
  qty
};
```

- `account` (Object) - the point-in-time account details

```
{
  buying_power
}
```
