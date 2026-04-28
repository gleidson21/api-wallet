import Sequelize, { Model } from 'sequelize';

class Wallet extends Model {
  static init(sequelize) {
    super.init(
      {
        balance: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00,
          get() {
            const value = this.getDataValue('balance');
            return value === null ? null : parseFloat(value);
          },
        },
        status: {
          type: Sequelize.ENUM('active', 'blocked', 'inactive'),
          defaultValue: 'active',
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'BRL',
        },
      },
      {
        sequelize,
        tableName: 'wallets',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
  }
}

export default Wallet;