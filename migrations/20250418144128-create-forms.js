'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forms', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      is_published: {
        type: Sequelize.TINYINT,
        allowNull: false
      },
      json_structure: {
        type: Sequelize.JSON,
        allowNull: false
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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

    // await queryInterface.addIndex('forms', ['id'], {
    //   name: 'PRIMARY',
    //   unique: true,
    //   using: 'BTREE'
    // });

    // await queryInterface.addIndex('forms', ['created_by'], {
    //   name: 'FK_forms_users',
    //   using: 'BTREE'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('forms');
  }
};