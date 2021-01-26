const knex = require("../config/knex");

class OHLCDataModel {
  constructor(id) {
    this.tableName = "ohlc_data";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then((rows) => rows[0])
      .catch((err) => {
        if (err.code === "23505") {
          return null;
        }
        throw new Error(err.message);
      });
  }

  async find(data, fromDate, toDate) {
    data.is_deleted = false;
    return knex(this.tableName)
      .select("id", "symbol", "timestamp", "open", "high", "low", "close")
      .where(data)
      .modify((queryBuilder) => {
        if (fromDate) {
          queryBuilder.andWhere("timestamp", ">=", fromDate);
        }
        if (toDate) {
          queryBuilder.andWhere("timestamp", "<=", toDate);
        }
      })
      .orderBy("timestamp", "asc");
  }

  async findOne(data) {
    data.is_deleted = false;
    return knex(this.tableName)
      .select("id", "symbol", "timestamp", "open", "high", "low", "close")
      .where(data)
      .orderBy("timestamp", "asc")
      .first();
  }

  async checkIfOHLCLoaded(symbol) {
    return knex
      .raw(
        `SELECT exists (SELECT 1 FROM ${this.tableName} WHERE symbol = '${symbol}' LIMIT 1)`
      )
      .then((rows) => rows.rows[0].exists);
  }

  async update(data) {
    return knex(this.tableName)
      .where({ id: this.id })
      .update(data)
      .returning("*")
      .then((rows) => rows[0]);
  }

  async hardDelete() {
    return knex(this.tableName).where({ id: this.id }).del();
  }
}

module.exports = OHLCDataModel;
