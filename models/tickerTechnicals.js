const knex = require("../../config/knex");

class TickerTechnicalsModel {
  constructor(id) {
    this.tableName = "ticker_technicals";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["ticker_technicals.is_deleted"] = false;
    return knex(this.tableName)
      .select(
        "tickers.symbol",
        "ticker_technicals.id",
        "ticker_technicals.sma_50_day",
        "ticker_technicals.sma_200_day",
        "ticker_technicals.high_52_week",
        "ticker_technicals.low_52_week",
        "ticker_technicals.average_volume_10_day",
        "ticker_technicals.cagr_3_year",
        "ticker_technicals.sma_50_day"
      )
      .leftJoin("tickers", "ticker_technicals.ticker_id", "=", "tickers.id")
      .where(data)
      .orderBy("ticker_technicals.created_at", "asc");
  }

  async findOne(data) {
    data["ticker_technicals.is_deleted"] = false;
    return knex(this.tableName)
      .select(
        "tickers.symbol",
        "ticker_technicals.id",
        "ticker_technicals.sma_50_day",
        "ticker_technicals.sma_200_day",
        "ticker_technicals.high_52_week",
        "ticker_technicals.low_52_week",
        "ticker_technicals.average_volume_10_day",
        "ticker_technicals.cagr_3_year",
        "ticker_technicals.sma_50_day"
      )
      .leftJoin("tickers", "ticker_technicals.ticker_id", "=", "tickers.id")
      .where(data)
      .orderBy("ticker_technicals.created_at", "asc")
      .first();
  }

  async update(data) {
    return knex(this.tableName)
      .where({ id: this.id })
      .update(data)
      .returning("*")
      .then(rows => rows[0]);
  }

  async hardDelete() {
    return knex(this.tableName).where({ id: this.id }).del();
  }
}

module.exports = TickerTechnicalsModel;
