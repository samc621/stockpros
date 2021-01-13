const knex = require("../config/knex");

class StrategySignalsModel {
  constructor(id) {
    this.tableName = "strategy_signals";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["strategy_signals.is_deleted"] = false;
    return knex(this.tableName)
      .select("id", "strategy_id", "signal_id", "is_active")
      .where(data)
      .orderBy("strategy_signals.created_at", "asc");
  }

  async findOne(data) {
    data["strategy_signals.is_deleted"] = false;
    return knex(this.tableName)
      .select("id", "strategy_id", "signal_id", "is_active")
      .where(data)
      .orderBy("strategy_signals.created_at", "asc")
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

module.exports = StrategySignalsModel;
