var express = require("express");
var app = express();
var path = require('path');

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    // Redirect the user to the "/about" route
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    // Return the about.html file from the views folder
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.listen(HTTP_PORT, () => {
    console.log('Express http server listening on port ' + HTTP_PORT);
});
