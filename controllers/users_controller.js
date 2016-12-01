var express = require('express');
var router = express.Router();

var User = require('../models')["User"];
var Thread = require('../models')["Thread"];
var Comment = require('../models')["Comment"];
var Like = require('../models')["Like"];

router.get('/', function(req, res) {
  res.redirect('/index');
});

//Displays all threads on home page
//Passes an object containing all threads to home.handlebars
router.get('/index', function(req, res) {
  Thread.findAll({})
  .then(function(result) {
    var threadsObject = {threads: result};
    res.render('home', threadsObject);
  });
});

//Displays the post a thread form
router.get('/post', function(req, res) {
  res.render('post');
});

//Displays threads on home page where genre is selectedGenre
//Passes an object containing all threads with the selected genre to home.handlebars
router.get('/index/:genre', function(req, res) {
  var selectedGenre = req.body.genre;
  Thread.findAll({
    where: {
      genre: selectedGenre
    }
  }).then(function(result) {
    var threadsObject = {threads: result};
    res.render('home', threadsObject);
  });
});


//Displays thread contents and all comments on thread page
//Passes two objects, one containing the thread and one containing that thread's comments to thread.handlebars
router.get('/thread/:id', function(req, res) {
  chosenID = req.params.id;
  var threadObject;
  var commentsObject;

  Thread.findOne({
    where: {
      id: chosenID
    },
    include: [Comment]
  }).then(function(result) {
    threadObject = result;
    commentObject = result.Comments;  //Not sure if this is right
    res.render('thread', {
      thread: threadObject,
      comments: commentsObject
    })
  });
});


//Displays profile info and created threads and liked threads on profile page
//Passes three objects, one containing the user info, one containing created threads and one containing liked threads to profile.handlebars
// router.get('/user/:id', function(req, res) {
//   userID = req.params.id;
//   var createdObject;
//   var likedObject;
//   var currentUser;

//   User.findOne({where: { id: userID }})
//   .then(function(res1) {
//     currentUser = res1;
//     return User.getThreads({where: { UserId: userID }, include: [Thread]});  //Or this might be getLikedThreads
//   })
//   .then(function(res2) {
//     likedObject = res2;
//     return Thread.findAll({where: { UserId: userID }});
//   }) 
//   .then(function(res3) {
//     createdObject = res3;
//     res.render('profile', {
//       user: currentUser,
//       created: createdObject,
//       liked: likedObject
//     })
//   });
// });


//Adds a new user to the Users table when a user signs up
router.post('/user/create', function(req, res) {
  var newUser = req.body;

  User.create({
    name: newUser.name,
    // password: newUser.password,
    // email: newUser.email,
    // favoriteGenre: newUser.genre
    userUri: newUser.uri
  }).then(function(result) {
    res.redirect('/index');
  });
});


//Adds a new thread to the Threads table when a user posts a new playlist
router.post('/thread/create', function(req, res) {
  var newThread = req.body;

  Thread.create({
    title: newThread.title,
    UserId: newThread.userID,
    contents: newThread.contents,
    genre: newThread.genre,
    likes: 0,
    threadUri: newThread.uri
  }).then(function(result) {
    res.redirect('/thread/' + result.id);
  });
});


//Adds a new comment to the Comments table when a user posts a comment
router.post('/thread/:id/comment/create', function(req, res) {
  var newComment = req.body;
  var threadID = req.params.id;

  Comment.create({
    UserId: newComment.userID,
    ThreadId: threadID,
    contents: newComment.contents
  }).then(function(result) {
    res.redirect('/thread/' + threadID);
  });
});


//Adds a like relationship to the Likes table when a user likes a thread
  // currentUser.addThread(threadID);  //This might be addLikedThread