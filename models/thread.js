'use strict';
module.exports = function(sequelize, DataTypes) {
  var Thread = sequelize.define('Thread', {
    title: DataTypes.STRING,
    contents: DataTypes.STRING,
    genre: DataTypes.STRING,
    likes: DataTypes.INTEGER,
    threadUri: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Thread.belongsTo(models.User);
        Thread.belongsToMany(models.User, {through: 'UserLikes'});
      }
    }
  });
  return Thread;
};