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

## Strategy Creation

Strategies are initialized with the following parameters:

- `buySignals` (Array[boolean]) - array of logical expressions which indicate whether or not to trigger a buy request. Take a look at the following example:

`percentageDifference(price, stockCalcs.sma_50_day) >= 0.2`

`percentageDifference` calculates the difference between the current price and 50-day simple moving average for a symbol, and the statement checks if this value is greater than or equal to 20%. If true, this is a signal for a buy request.

- `sellSignals` (Array[boolean]) - array of logical expressions which indicate whether or not to trigger a sell request. Take a look at the following example:

`percentageDifference(position.avg_entry_price, price) >= 0.2`

`percentageDifference` calculates the difference between the average entry price and the current price for a symbol, and the statement checks if this value is greater than or equal to 20%. If true, this is a signal for a sell request.

- `buyQuantity` (Number)
- `sellQuantity` (Number)

## Strategy Execution

Strategy instances have an `executeStrategy` method which can be used to forward test or backtest a strategy. This method accepts the following parameters:

- `symbol` (String)
- `price` (Number)
- `backtest` (Boolean) - set to true for backtesting.

There is also an additional parameter which must be passed in when backtesting.

- `date` (Date)

### Using the default strategy

StockPros comes with a default strategy. You can use the `getStrategy1Data` method to retrieve the data necessary to initialize it. This method accepts the following paramters:

- `price` (Number)
- `stockCalcs` (Object) - the point-in-time calculations which are normally stored in the DB.

```
{
  date,
  sma_50_day,
  sma_200_day,
  high_52_week,
  low_52_week,
  cagr_3_year
};
```

- `position` (Object) - the point-in-time position details.

```
{
  avg_entry_price,
  qty
};
```

There is also an additional parameter which must be passed in when backtesting.

- `account` (Object) - the point-in-time account details.

```
{
  buying_power
}
```

### Backtesting

Backtests can be run against a strategy with the `backtest` method. This method accepts the following parameters

- `symbol` (String)
- `years` (Number) - number of years for backtesting.
- `startValue` (Number) - the account starting value.

## Start the server

`$ npm start`

On start, StockPros will load the watchlist stocks into the DB, including up to 15 years of historical OHLC (open-high-low-close) data, and then begin running the default strategy for these stocks.

### Running with Docker Compose

`$ docker-compose build`

`$ docker-compose up`
