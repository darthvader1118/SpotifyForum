var express = require('express');
var bodyParser = require('body-parser');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var models = require('./models/');
models.sequelize.sync({force: true});
var app = express();
var path = require('path');
var userId = "";
var playlists;

var User = require('./models')["User"];
var Thread = require('./models')["Thread"];
var Comment = require('./models')["Comment"];

var client_id = 'abe793abff5d41309db47e9f17981f2b'; // Your client id
var client_secret = 'a87564837ce64590a5446a7aebc6edc5'; // Your secret
var redirect_uri = 'http://trackshareproject.herokuapp.com/callback'; // Your redirect uri


//Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
var SpotifyWebApi = require('spotify-web-api-node');
 
// credentials are optional 
var spotifyApi = new SpotifyWebApi({
  clientId : client_id,
  clientSecret : client_secret
});

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
 
    // Save the access token so that it's used in future calls 
    spotifyApi.setAccessToken(data.body['access_token']);

  }, function(err) {
        console.log('Something went wrong when retrieving an access token', err);
  });

//use spotifywebapi to get albums tracks playlists for keywords

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var routes = require('./controllers/users_controller.js');
app.use('/', routes);

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var login = 0;

//login authorization logic
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
  login = 1;
});


//gets top 5 playlists of search term
app.get('/index/:genre', function(req, res) {
  var chosen = req.params.genre;
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  spotifyApi.getPlaylistsForCategory(chosen, {
      country: 'US',
      limit : 5,
      offset : 0
    })
  .then(function(data) {
    console.log(data.body);
    var playlist = data.body.playlists.items;
    res.json(playlist);
  }, function(err) {
    console.log("Something went wrong!", err);
  });


});

app.get('/cat', function(req, res) {
spotifyApi.getCategories({
  limit : 40,
  offset : 0,
  country: 'US'
})
.then(function(data){
  console.log(data.body);
  res.json(data.body);
});

//write sequelize code that will store all categories into database 
})


//redirect uri that takes in the login info passes if there or just fails 
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          userId = body.id;
          
          User.findOne({ where: {id: body.id} }).then(function(project) {
            if(project == null){
              User.create({
                id: body.id,
                displayName: body.display_name,
                userUri: body.uri
              }).then(function(result) {
                res.redirect('/#' +
                querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token
                }));
              });
            }
              else{
                //add some stuff here
                res.redirect('/#' +
                querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token
                }));
              }
            })
            // project will be the first entry of the Projects table with the title 'aProject' || null
          })

      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

//Displays the post a thread form
app.get('/post', function(req, res) {
  // console.log("Req object: " + req);
  // console.log("Playlists: " + JSON.stringify(spotifyApi));
  spotifyApi.getUserPlaylists(userId).then(function(result){

    console.log("Playlists: " + JSON.stringify(result.body.items));
    var playlists = result.body.items;
    res.render('post', {userId: userId, playlists: playlists});  //object might not be correct
  });
  
});

//Displays all threads on home page
//Passes an object containing all threads to home.handlebars
app.get('/index', function(req, res) {
  Thread.findAll({
    include: User
  }) //might need include statement for that Thread's User
  .then(function(result) {
    var threadsObject = {threads: result, userId: userId};
    res.render('home', threadsObject); //call thread's user to get display name and pass that to Handlebars
  });
});

//Displays thread contents and all comments on thread page
//Passes two objects, one containing the thread and one containing that thread's comments to thread.handlebars
app.get('/thread:id', function(req, res) {
  chosenID = req.params.id;
  var threadObject;
  var commentsObject;

  Thread.findOne({
    where: {
      id: chosenID
    },
    // include: {model: [Comment], include: User}
    include: [{model: Comment, as: 'Comments', include: User}]
  }).then(function(result) {
    console.log(result);
    threadObject = result;
    console.log(JSON.stringify(result));
    commentsObject = result.Comments;  //Not sure if this is right
    res.render('thread', {
      thread: threadObject,
      comments: commentsObject,
      userId: userId
    })
  });
});

//For logging out
app.get('/logout', function(req, res) {
  userId = "";
  res.redirect('/index');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('App listening on PORT: ' + port);
});