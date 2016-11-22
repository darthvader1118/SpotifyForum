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


//Displays profile info and created threads and liked threads on profile page
//Passes three objects, one containing the user info, one containing created threads and one containing liked threads to profile.handlebars
userID = req.params.id;
var createdObject;
var likedObject;
var currentUser;

User.findOne({where: { id: userID }})
.then(function(result) {
  currentUser = result;
});

likedObject = currentUser.getLiked(); //if there is a function writted in the user model to get an object of liked threads

Thread.findAll({
  where: {
    userID: userID
  }
}).then(function(result) {
  createdObject = result;
  res.render('profile', {
    user: currentUser,
    created: createdObject,
    liked: likedObject
  })
});


//Adds a new user to the Users table when a user signs up
var newUser = req.body;

User.create({
  name: newUser.name,
  password: newUser.password,
  email: newUser.email,
  favoriteGenre: newUser.genre
}).then(function(result) {
  res.redirect('/index');
});


//Adds a new thread to the Threads table when a user posts a new playlist
var newThread = req.body;

Thread.create({
  title: newThread.title,
  userID: newThread.userID,
  contents: newThread.contents,
  genre: newThread.genre,
  likes: 0,
  createdDate:
}).then(function(result) {
  res.redirect('/threads/' + result.id);
});


//Adds a new comment to the Comments table when a user posts a comment
var newComment = req.body;

Comment.create({
  userID: newComment.userID,
  threadID: newComment.threadID,
  contents: newComment.contents,
  createdDate:
}).then(function(result) {
  res.redirect('/threads/' + newComment.threadID);
});


//Adds a like relationship to the Likes table when a user likes a thread

currentUser.addLike(threadID); //if there is a function written in the user model to add a like relationship to the Like table