const knex = require("../config/knex");

class WatchedSymbolsModel {
  constructor(id) {
    this.tableName = "watched_symbols";
    this.id = id;
  }

  async create(data) {
    return knex(this.tableName)
      .insert(Object.assign(data))
      .returning("*")
      .then(rows => rows[0]);
  }

  async find(data) {
    data["watched_symbols.is_deleted"] = false;
    return knex(this.tableName)
      .select("id", "symbol", "is_active")
      .where(data)
      .orderBy("watched_symbols.created_at", "asc");
  }

  async findOne(data) {
    data["watched_symbols.is_deleted"] = false;
    return knex(this.tableName)
      .select("id", "symbol", "is_active")
      .where(data)
      .orderBy("watched_symbols.created_at", "asc")
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

module.exports = WatchedSymbolsModel;
