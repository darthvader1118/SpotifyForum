'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    userUri: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.belongsToMany(models.Thread, {through: 'UserLikes'});
        User.hasMany(models.Thread);
      }
    }
  });
  return User;
};