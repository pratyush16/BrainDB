var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();
// Logging requests
app.use(logger('dev'));

//for static files
app.use(express.static(path.join(__dirname, 'static')));

app.get('/search', function(req, res){
    res.send('Display a search HTML form here');
});
  
app.post('/search', function(req, res){
    res.send('Your search for ' + req.body.searchText + ' returned X results');
});

//for everything else
app.get('*', function(req, res){
    res.send('Invalid Address');
});

//run the app
app.listen(3000);
console.log('Listening on port 3000');
