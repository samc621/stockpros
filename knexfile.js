const config = require("config");

module.exports = {
  local: {
    client: "pg",
    connection: {
      host: config.get("db.host"),
      port: config.get("db.port"),
      user: config.get("db.user"),
      database: config.get("db.database"),
      password: config.get("db.password")
    },
    useNullAsDefault: true,
    debug: false,
    migrations: {
      directory: "db/migrations",
      tableName: "knex_migrations"
    },
    seeds: {
      directory: "db/seeds"
    }
  },
  docker: {
    client: "pg",
    connection: {
      host: config.get("db.host"),
      port: config.get("db.port"),
      user: config.get("db.user"),
      database: config.get("db.database"),
      password: config.get("db.password")
    },
    useNullAsDefault: true,
    debug: false,
    migrations: {
      directory: "db/migrations",
      tableName: "knex_migrations"
    },
    seeds: {
      directory: "db/seeds"
    }
  }
};
