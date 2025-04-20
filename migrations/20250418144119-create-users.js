'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(32),
        allowNull: false
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // await queryInterface.addIndex('users', ['id'], {
    //   name: 'PRIMARY',
    //   unique: true,
    //   using: 'BTREE'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};