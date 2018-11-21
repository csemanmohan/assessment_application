var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var https = require('https').Server(app);
// var request = require("request");
var path=require('path');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}) );

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

var formidable = require('formidable');
var fs = require('fs');
globalpath = ""

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.post('/fileupload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.file.path;
    var newpath = path.join(__dirname, ("/public/resume/" + files.file.name))
    globalpath = newpath;
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.write('File uploaded!');
      res.end();
    });
});
});

app.post('/questionfileupload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.file.path;
    var newpath = path.join(__dirname, ("/public/questionsets/" + files.file.name))
    globalpath = newpath;
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.write('File uploaded!');
      res.end();
    });
});
});

app.post('/login', function(request, response) {
  var user = {
    username : request.body.username,
    password : request.body.password
  }
  var filepath = path.join(__dirname, "/public/json/users.json")
  fs.readFile(filepath, function (err, data) {
    var users = JSON.parse(data)
    // console.log(users);
    var result = users.filter(obj => {
      return obj.username === user.username && obj.password === user.password
    })
    response.send(result[0]);
  })
});

app.post('/user', function(request, response) {
  var user = {
    username : request.body.username,
    password : request.body.password
  }
  var filepath = path.join(__dirname, "/public/json/users.json")
  fs.readFile(filepath, function (err, data) {
    var users = JSON.parse(data)
    // console.log(users);
    var result = users.filter(obj => {
      return obj.username === user.username && obj.password === user.password
    })
    var setpath = path.join(__dirname, "/public/questionsets/" + result[0].set + ".json")
    console.log(setpath);
    fs.readFile(setpath, function (err, data) {
      var questions = JSON.parse(data)
      response.send(questions);
    })
  })
});

app.post('/register', function(request, response) {
  var user = {
    username : request.body.username,
    password : request.body.password,
    user_type : "user",
    resume : globalpath
  }
   var filepath = path.join(__dirname, "/public/json/users.json")
   fs.readFile(filepath, function (err, data) {
     var json = JSON.parse(data)
     var result = json.find(obj => {
       return obj.username === user.username && obj.password === user.password
     })
     console.log("user", result);
     if(result != undefined){
       response.send("User already exists");
     }
     else{
       json.push(user)
       fs.writeFile(filepath, JSON.stringify(json), function(err){
         if(err) {
           response.send("Oops! Something went wrong");
         }
         response.send("User added");
       });
     }
   });
});

app.get('/users', function(request, response) {
   var filepath = path.join(__dirname, "/public/json/users.json")
   fs.readFile(filepath, function (err, data) {
     var json = JSON.parse(data)
     json.shift();
     console.log(json);
     response.send(json);
   })
});

app.post('/mapSets', function(request, response) {
   var map = request.body
   var filepath = path.join(__dirname, "/public/json/users.json")
   fs.writeFile(filepath, JSON.stringify(map), function(err){
     if(err) {
       response.send("Oops! Something went wrong");
     }
     response.send("Question mapping done!")
   });
});

http.listen(8001, function () {
  console.log('resume running!');
});
