const knex = require("../config/knex");

class PositionsModel {
  constructor(id) {
    this.tableName = "positions";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then((rows) => rows[0]);
  }

  async find(data) {
    data["positions.is_deleted"] = false;
    return knex(this.tableName)
      .select("id", "symbol", "quantity", "avg_entry_price", "cost_basis")
      .where(data)
      .orderBy("positions.created_at", "asc");
  }

  async findOne(data) {
    data["positions.is_deleted"] = false;
    return knex(this.tableName)
      .select("id", "symbol", "quantity", "avg_entry_price", "cost_basis")
      .where(data)
      .orderBy("positions.created_at", "asc")
      .first();
  }

  async checkIfPositionExists(symbol) {
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

module.exports = PositionsModel;
