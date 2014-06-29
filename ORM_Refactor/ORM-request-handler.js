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
var messageId = 0;
var sequelize = new Sequelize("chat", "root");
/* TODO this constructor takes the database name, username, then password.
 * Modify the arguments if you need to */

/* first define the data structure by giving property names and datatypes
 * See http://sequelizejs.com for other datatypes you can use besides STRING. */
var Users = sequelize.define('Users', {
  userId: Sequelize.STRING
});

var Messages = sequelize.define('Messages', {
  messageId: Sequelize.STRING,
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
        console.log(Messages);
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
          post.id = messageId;
          messageId++;
          post.createdAt = new Date();
          if (query['roomname'] !== undefined) {
            post.roomname = query['roomname'];
          }
          // var messageId;
          // module.exports.newMessageId(connection, messageId);
          module.exports.roomUserInsert('rooms', 'roomId', post.roomname, connection);
          module.exports.roomUserInsert('users', 'userId', post.username, connection);
          var messageObj = {
            messageId: 1,
            messageText: post.text,
            roomId: post.roomname,
            userId: post.username
          };
          module.exports.messageInsert(messageObj, connection);

          response.writeHead(statusCode, headers);
          response.end(responseText);
        });
      }
    }
  },

  roomUserInsert: function(tableName, column, property, connection) {
    var obj = {};
    obj[column] = property;
    connection.query('SELECT * FROM ' + tableName + ' WHERE ' + column + ' = ' + '\'' + property + '\'', function(err, rows, fields){
      // console.log(rows);
      if (rows.length === 0){
        connection.query('INSERT INTO ' + tableName + ' SET ?', obj, function(err, result){
          if (err){
            console.log('This error: ' + err);
          } else {
            // console.log(result);
          }
          // connection.end();
        });
      }
    });
  },
  messageInsert: function(messageObj, connection) {
    connection.query('SELECT max(messageId) from messages', function(err, rows, fields){
      messageId = rows[0]['max(messageId)'] + 1;
      messageObj.messageId = messageId;
      connection.query('INSERT INTO messages SET ?', messageObj, function(err, result){
        if (err){
          console.log('This error: ' + err);
        } else {
          // console.log(result);
        }
        connection.end();
      });
    });
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
