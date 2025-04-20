'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'forms',
          key: 'id'
        }
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      json_structure: {
        type: Sequelize.JSON,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // await queryInterface.addIndex('answers', ['id'], {
    //   name: 'PRIMARY',
    //   unique: true,
    //   using: 'BTREE'
    // });

    // await queryInterface.addIndex('answers', ['form_id'], {
    //   name: 'FK_answers_forms',
    //   using: 'BTREE'
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('answers');
  }
};