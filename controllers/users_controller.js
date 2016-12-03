var express = require('express');
var SpotifyWebApi = require('spotify-web-api-node');
var router = express.Router();
// var userId = require('../server.js');  didn't work

var User = require('../models')["User"];
var Thread = require('../models')["Thread"];
var Comment = require('../models')["Comment"];

router.get('/', function(req, res) {
  res.redirect('/index');
});


//MOVED TO SERVER.JS FOR NOW
//Displays all threads on home page
//Passes an object containing all threads to home.handlebars
// router.get('/index', function(req, res) {
  
//   Thread.findAll({}) //might need include statement for that Thread's User
//   .then(function(result) {
//     var threadsObject = {threads: result};
//     res.render('home', threadsObject); //call thread's user to get display name and pass that to Handlebars
//   });
// });


//MOVED TO SERVER.JS FOR NOW
//Displays the post a thread form
// router.get('/post', function(req, res) {
//   // console.log("Req object: " + req);
//   console.log("Playlists: " + JSON.stringify(spotifyApi));
//   // spotifyApi.getUserPlaylists(userId).then(function(result){
    
//     res.render('post', {userId: userId, playlists: spotifyApi});  //object might not be correct
//   // });
  
// });


//NOT IN USE CURRENTLY
//Displays threads on home page where genre is selectedGenre
//Passes an object containing all threads with the selected genre to home.handlebars
// router.get('/index/:genre', function(req, res) {
//   var selectedGenre = req.body.genre;
//   Thread.findAll({
//     where: {
//       genre: selectedGenre
//     }
//   }).then(function(result) {
//     var threadsObject = {threads: result};
//     res.render('home', threadsObject);
//   });
// });


//MOVED TO SERVER.JS FOR NOW
// //Displays thread contents and all comments on thread page
// //Passes two objects, one containing the thread and one containing that thread's comments to thread.handlebars
// router.get('/thread:id', function(req, res) {
//   chosenID = req.params.id;
//   var threadObject;
//   var commentsObject;

//   Thread.findOne({
//     where: {
//       id: chosenID
//     },
//     // include: [Comment]
//   }).then(function(result) {
//     console.log(result);
//     threadObject = result;
//     // commentObject = result.Comments;  //Not sure if this is right
//     res.render('thread', {
//       thread: threadObject
//       // comments: commentsObject
//     })
//   });
// });


//NOT IN USE CURRENTLY
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


//NOT IN USE CURRENTLY: Using Spotify login instead
//Adds a new user to the Users table when a user signs up
// router.post('/user/create', function(req, res) {
//   var newUser = req.body;

//   User.create({
//     name: newUser.name,
//     // password: newUser.password,
//     // email: newUser.email,
//     // favoriteGenre: newUser.genre
//     userUri: newUser.uri
//   }).then(function(result) {
//     res.redirect('/index');
//   });
// });


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
    console.log(result);
    res.redirect('/thread' + result.id);
  });
});


//Adds a new comment to the Comments table when a user posts a comment
router.post('/thread:id/comment/create', function(req, res) {
  var newComment = req.body;
  var threadID = req.params.id;

  Comment.create({
    UserId: newComment.userID,
    ThreadId: threadID,
    contents: newComment.contents
  }).then(function(result) {
    res.redirect('/thread' + threadID);
  });
});

//NOT IN USE CURRENTLY
//Adds a like relationship to the Likes table when a user likes a thread
// currentUser.addThread(threadID);  //This might be addLikedThread

module.exports = router;