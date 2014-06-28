exports.insert = function(tableName, tableObj) {
  connection.query('INSERT INTO ' + tableName + ' SET ?', tableObj, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });
}
