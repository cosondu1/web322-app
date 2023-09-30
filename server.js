/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chidera Osondu Student ID: 174098210  Date: Friday 29th Sept
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require('path');

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

const blogService = require('./blog-service.js');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/blog', (req, res) => {
    blogService.getPublishedPosts()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err });
        });
});


app.get('/posts', (req, res) => {
    blogService.getAllPosts()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err });
        });
});

app.get('/categories', (req, res) => {
    blogService.getCategories()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err });
        });
});


// Catch-all for non-matching routes
app.use((req, res, next) => {
    res.status(404).send("Page Not Found");
});

// app.listen(HTTP_PORT, () => {
//     console.log('Express http server listening on port ' + HTTP_PORT);
// });

blogService.initialize()
    .then(() => {
        app.listen(8080, () => {
            console.log('Server is running on http://localhost:8080');
        });
    })
    .catch(err => {
        console.error('Failed to initialize blog service:', err);
    });
