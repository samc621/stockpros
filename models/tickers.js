const knex = require("../config/knex");

class TickersModel {
  constructor(id) {
    this.tableName = "tickers";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["is_deleted"] = false;
    return knex(this.tableName)
      .select(
        "id",
        "name",
        "symbol",
        "logo",
        "country",
        "exchange",
        "industry",
        "sector",
        "market_cap"
      )
      .where(data)
      .orderBy("created_at", "asc");
  }

  async findOne(data) {
    data["is_deleted"] = false;
    return knex(this.tableName)
      .select(
        "id",
        "name",
        "symbol",
        "logo",
        "country",
        "exchange",
        "industry",
        "sector",
        "market_cap"
      )
      .where(data)
      .orderBy("created_at", "asc")
      .first();
  }

  async update(data) {
    return knex(this.tableName)
      .where({ id: this.id })
      .update(data)
      .returning("*")
      .then(rows => rows[0]);
  }

  async checkIfTickerExists(symbol) {
    return knex
      .raw(
        `SELECT exists (SELECT 1 FROM ${this.tableName} WHERE symbol = '${symbol}' LIMIT 1)`
      )
      .then(rows => rows.rows[0].exists);
  }

  async hardDelete() {
    return knex(this.tableName).where({ id: this.id }).del();
  }
}

module.exports = TickersModel;
