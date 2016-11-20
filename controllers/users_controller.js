var express = require('express');
var router = express.Router();

var User = require('../models')["User"];
var Thread = require('../models')["Thread"];
var Comment = require('../models')["Comment"];
var Like = require('../models')["Like"];


//Displays all threads on home page
//Passes an object containing all threads to home.handlebars
Thread.findAll({})
  .then(function(result) {
    var threadsObject = {threads: result};
    res.render('home', threadsObject);
  });


//Displays threads on home page where genre is selectedGenre
//Passes an object containing all threads with the selected genre to home.handlebars
Thread.findAll({
  where: {
    genre: selectedGenre
  }
}).then(function(result) {
  var threadsObject = {threads: result};
  res.render('home', threadsObject);
});


//Displays thread contents and all comments on thread page
//Passes two objects, one containing the thread and one containing that thread's comments to thread.handlebars
chosenID = req.params.id;
var threadObject;
var commentsObject;

Thread.findOne({
  where: {
    id: chosenID
  }
}).then(function(result) {
  threadObject = result;
});

Comment.findAll({
  where: {
    threadID: chosenID
  }
}).then(function(result) {
  commentsObject = result;
  res.render('thread', {
    thread: threadObject,
    comments: commentsObject
  })
});


//Displays created threads and liked threads on profile page
//Passes two objects, one containing created threads and one containing liked threads to profile.handlebars
userID = req.params.id;
var createdObject;
var likedObject;
var CurrentUser;

User.findOne({where: { id: userID }})
.then(function(result) {
  CurrentUser = result;
});

likedObject = CurrentUser.getLiked(); //if there is a function writted in the user model to get an object of liked threads

Thread.findAll({
  where: {
    userID: userID
  }
}).then(function(result) {
  createdObject = result;
  res.render('profile', {
    created: createdObject,
    liked: likedObject
  })
});