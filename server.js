/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chidera Osondu Student ID: 174098210  Date: Friday 20th Oct
*
*  Online (Cyclic) Link: https://extinct-tutu-ray.cyclic.cloud/
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require('path');

// Added requires for the new libraries
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Setting up the Cloudinary configuration
cloudinary.config({
    cloud_name: 'dubq2lwcs',
    api_key: '666723166893873',
    api_secret: 'DA5BpthrFWYBqYoa0gulJwJTjXs',
    secure: true
});

// Creating the upload variable without disk storage
const upload = multer();

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
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
            .then(data => res.json(data))
            .catch(err => res.json({ message: err }));
    } else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate)
            .then(data => res.json(data))
            .catch(err => res.json({ message: err }));
    } else {
        blogService.getAllPosts()
            .then(data => res.json(data))
            .catch(err => res.json({ message: err }));
    }
});

// /post/value route for getting a post by its ID
app.get('/post/:id', (req, res) => {
    blogService.getPostById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.json({ message: err }));
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

app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addPost.html'));
});

app.post('/posts/add', upload.single("featureImage"), async (req, res) => {

    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }

    try {
        let uploaded = await upload(req);
        req.body.featureImage = uploaded.url;

        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).send("Error uploading image");
    }
});

// Catch-all for non-matching routes
app.use((req, res, next) => {
    res.status(404).send("Page Not Found");
});

blogService.initialize()
    .then(() => {
        app.listen(8080, () => {
            console.log('Server is running on http://localhost:8080');
        });
    })
    .catch(err => {
        console.error('Failed to initialize blog service:', err);
    });
