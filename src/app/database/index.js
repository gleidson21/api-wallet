import Sequelize from "sequelize";
import databaseConfig from "../../config/database.cjs";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

const Models = [User, Wallet,Transaction];

class Database {
  constructor() {
    this.init();
    this.connectionTest();
  }
init() {
    this.connection = databaseConfig.use_env_variable
      ? new Sequelize(
          process.env[databaseConfig.use_env_variable],
          databaseConfig
        )
      : new Sequelize(databaseConfig);

    models.map((model) => model.init(this.connection));

    models.map(
      (model) =>
        model.associate &&
        model.associate(this.connection.models)
    );
  }

  async connectionTest() {
    try {
      await this.connection.authenticate();
      console.log("✅ Conexão com PostgreSQL estabelecida com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao conectar no banco de dados:", error.message);
    }
  }
}

export default new Database();