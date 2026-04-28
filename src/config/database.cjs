require("dotenv").config();

module.exports = process.env.DATABASE_URL
  ? {
      use_env_variable: "DATABASE_URL",
      dialect: "postgres",
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
      },
    }
  : {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
      },
    };