var DataTypes = require("sequelize").DataTypes;
var _answers = require("./answers");
var _forms = require("./forms");
var _users = require("./users");

function initModels(sequelize) {
  var answers = _answers(sequelize, DataTypes);
  var forms = _forms(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  answers.belongsTo(forms, { as: "form", foreignKey: "form_id"});
  forms.hasMany(answers, { as: "answers", foreignKey: "form_id"});
  forms.belongsTo(users, { as: "created_by_user", foreignKey: "created_by"});
  users.hasMany(forms, { as: "forms", foreignKey: "created_by"});

  return {
    answers,
    forms,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
