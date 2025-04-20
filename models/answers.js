const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('answers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    form_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forms',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    json_structure: {
      type: DataTypes.JSON,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    timestamps: false,
    tableName: 'answers',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FK_answers_forms",
        using: "BTREE",
        fields: [
          { name: "form_id" },
        ]
      },
    ]
  });
};
