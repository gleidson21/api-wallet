import Sequelize from "sequelize";
import databaseConfig from "../../config/database.cjs";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

// 1. Corrigido para "models" (minúsculo) para bater com o uso abaixo
const models = [User, Wallet, Transaction];

class Database {
  constructor() {
    this.init();
    this.connectionTest();
  }

  init() {
    // 2. Identifica qual ambiente estamos usando (no Render será 'production')
    const env = process.env.NODE_ENV || "development";
    const config = databaseConfig[env];

    // 3. Inicializa a conexão usando o bloco correto (com SSL e Dialect)
    if (config.use_env_variable) {
      this.connection = new Sequelize(process.env[config.use_env_variable], config);
    } else {
      this.connection = new Sequelize(config);
    }

    // 4. Inicializa os modelos
    models.map((model) => model.init(this.connection));

    // 5. Faz as associações entre tabelas (ex: User tem muitas Wallets)
    models.map(
      (model) =>
        model.associate && model.associate(this.connection.models)
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