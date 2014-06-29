/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require('url');
var _ = require('underscore');
var mysql = require('mysql');
var Sequelize = require('sequelize');
var sequelize = new Sequelize("chat", "root");
/* TODO this constructor takes the database name, username, then password.
 * Modify the arguments if you need to */

/* first define the data structure by giving property names and datatypes
 * See http://sequelizejs.com for other datatypes you can use besides STRING. */
var Users = sequelize.define('Users', {
  userId: Sequelize.STRING
});

var Messages = sequelize.define('Messages', {
  messageText: Sequelize.STRING,
  roomId: Sequelize.STRING,
  userId: Sequelize.STRING
});

var Rooms = sequelize.define('Rooms', {
  roomId: Sequelize.STRING
});


module.exports = {
  handleRequest: function(request, response) {

    var statusCode = 404;
    //  Without this line, this server wouldn't work. See the note
    //  * below about CORS.
    var headers = module.exports.defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    var responseText = '';
    var req=url.parse(request.url, true);

    //only allow correct path
    if (req.pathname.slice(0, 8)==='/classes') {

      var parameters = req.pathname.slice(1).split('/');

      var query = req.query;

      if (parameters[1]==='room') {
        query['roomname'] = parameters[2];
      }

      //OPTIONS
      if(request.method === "OPTIONS") {
        // handle options request
        statusCode=200;
        response.writeHead(statusCode, headers);
        response.end(responseText);
      //GET
      } else if (request.method === 'GET') {

        headers['Content-Type'] = "application/json";
        statusCode=200;

        Messages.sync().success(function() {
          Messages.findAll().success(function(messageArray) {
            // This function is called back with an array of matches.
            var resultsObj = {results: []};
            for (var i = 0; i < messageArray.length; i++) {
              resultsObj.results[i] = messageArray[i].dataValues;
            }
            var responseText = JSON.stringify(resultsObj);
            response.writeHead(200, module.exports.defaultCorsHeaders);
            response.end(responseText);
          });
        });
        // console.log(query);
        // module.exports.returnResults(query, connection, response);
        // connection.end();
      //POST
      } else if (request.method === 'POST') {
        statusCode=201;
        var body = "";
        request.on('data', function (chunk) {
          body += chunk;
        });
        request.on('end', function () {
          var post = JSON.parse(body);
          post.createdAt = new Date();
          if (query['roomname'] !== undefined) {
            post.roomname = query['roomname'];
          }
          // var messageId;
          // module.exports.newMessageId(connection, messageId);
          // module.exports.roomUserInsert('rooms', 'roomId', post.roomname, connection);
          Rooms.sync().success(function(){
            Rooms.findAll({ where: {roomId: post.roomname} }).success(function(rooms) {
                  // This function is called back with an array of matches.
              console.log(rooms);
              for (var i = 0; i < rooms.length; i++) {
                console.log(rooms[i].roomname + " exists");
              }
              Rooms.build({roomId: post.roomname}).save().success(function(){
                console.log('YAY');
              });

            });
          });
          Users.sync().success(function(){
            Users.findAll({ where: {userId: post.username} }).success(function(users) {
                  // This function is called back with an array of matches.
              for (var i = 0; i < users.length; i++) {
                console.log(users[i].username + " exists");
              }
              Users.build({userId: post.username}).save().success(function(){
                console.log('YAY');
              });

            });
          });
          var messageObj = {
            messageText: post.text,
            roomId: post.roomname,
            userId: post.username
          };
          Messages.build(messageObj).save().success(function(){
            console.log('YAY');
          });
          // module.exports.roomMessageInsert('users', 'userId', post.username, connection);
          // module.exports.messageInsert(messageObj, connection);

          response.writeHead(statusCode, headers);
          response.end(responseText);
        });
      }
    }
  },

  /* These headers will allow Cross-Origin Resource Sharing (CORS).
   * This CRUCIAL code allows this server to talk to websites that
   * are on different domains. (Your chat client is running from a url
   * like file://your/chat/client/index.html, which is considered a
   * different domain.) */
  defaultCorsHeaders: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10 // Seconds.
  }
};
