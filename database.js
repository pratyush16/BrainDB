var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'user',
  password : 'password',
  database : 'genedb'
});

connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  
    console.log('connected as id ' + connection.threadId);
  });

connection.query('', function (err, rows, fields) {
  if (err) throw err
})

connection.end(function(err) {
    // The connection is terminated now
  });