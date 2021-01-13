const knex = require("../config/knex");

class StrategiesModel {
  constructor(id) {
    this.tableName = "strategies";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["strategies.is_deleted"] = false;
    return knex(this.tableName)
      .select(
        knex.raw(`
          strategies."id",
          "name",
          "buy_percentage",
          "buy_percentage_type_of",
          "sell_percentage",
          "sell_percentage_type_of",
          (json_agg(to_json(signals.*))) as "signals",
          strategies."is_active"
        `)
      )
      .leftJoin(
        "strategy_signals",
        "strategy_signals.strategy_id",
        "=",
        "strategies.id"
      )
      .leftJoin("signals", "strategy_signals.signal_id", "=", "signals.id")
      .where(data)
      .groupBy("strategies.id")
      .orderBy("strategies.created_at", "asc");
  }

  async findOne(data) {
    data["strategies.is_deleted"] = false;
    return knex(this.tableName)
      .select(
        knex.raw(`
          strategies."id",
          "name",
          "buy_percentage",
          "buy_percentage_type_of",
          "sell_percentage",
          "sell_percentage_type_of",
          (json_agg(to_json(signals.*))) as "signals",
          strategies."is_active"
        `)
      )
      .leftJoin(
        "strategy_signals",
        "strategy_signals.strategy_id",
        "=",
        "strategies.id"
      )
      .leftJoin("signals", "strategy_signals.signal_id", "=", "signals.id")
      .where(data)
      .groupBy("strategies.id")
      .orderBy("strategies.created_at", "asc")
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

module.exports = StrategiesModel;
