var mysql = require('mysql');

exports.insert = function(tableName, tableObj) {
  var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'awesome',
    database: 'chat'
  });

  connection.connect();
  connection.query('INSERT INTO ' + tableName + ' SET ?', tableObj, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
};
