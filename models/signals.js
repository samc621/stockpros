const knex = require("../config/knex");

class SignalsModel {
  constructor(id) {
    this.tableName = "signals";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then((rows) => rows[0]);
  }

  async find(data) {
    data["signals.is_deleted"] = false;
    return knex(this.tableName)
      .select(
        "id",
        "type",
        "operand_1",
        "operator",
        "percentage_difference",
        "operand_2",
        "next_signal_inclusive"
      )
      .where(data)
      .orderBy("signals.created_at", "asc");
  }

  async findOne(data) {
    data["signals.is_deleted"] = false;
    return knex(this.tableName)
      .select(
        "id",
        "type",
        "operand_1",
        "operator",
        "percentage_difference",
        "operand_2",
        "next_signal_inclusive"
      )
      .where(data)
      .orderBy("signals.created_at", "asc")
      .first();
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

module.exports = SignalsModel;
