import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        cpf: Sequelize.STRING,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'users',
      }
    );

    // O GANCHO PROFISSIONAL: Criar a Wallet logo após o User ser criado
    this.addHook('afterCreate', async (user) => {
      // Usamos 'sequelize.models.Wallet' para evitar problemas de importação circular
      await sequelize.models.Wallet.create({
        user_id: user.id,
        balance: 0.00,
        status: 'active',
        currency: 'BRL',
      });
    });

    return this;
  }

  static associate(models) {
    // Um usuário tem uma carteira
    this.hasOne(models.Wallet, { foreignKey: 'user_id', as: 'wallet' });
  }
}

export default User;