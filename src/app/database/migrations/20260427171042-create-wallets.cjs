'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // Saldo principal (DECIMAL garante precisão nos centavos)
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      // Status da conta (Segurança para bloquear contas se necessário)
      status: {
        type: Sequelize.ENUM('active', 'blocked', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      // Moeda (Padrão BRL, mas deixa sua API pronta para o futuro)
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'BRL',
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

  },

  async down(queryInterface) {

    await queryInterface.dropTable('wallets');

  }
};
