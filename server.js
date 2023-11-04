/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chidera Osondu Student ID: 174098210  Date: Friday Nov 2nd
*
*  Online (Cyclic) Link: https://extinct-tutu-ray.cyclic.cloud/
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require('path');

const blogData = require("./blog-service");

// Added requires for the new libraries
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');

const stripJs = require('strip-js');



// Setting up Handlebars as the view engine
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper 'equal' needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
        // Add other custom helpers here
    }
}));

app.set('view engine', '.hbs');

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

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get('/', (req, res) => {
    res.redirect('/blog');
});


app.get('/about', (req, res) => {
    res.render('about');
});


app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
      console.log(viewData, "<==view data")
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/posts', (req, res) => {
    
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
            .then(data => {
                res.render("posts", { posts: data });
            })
            .catch(err => {
                res.render("posts", { message: "no results" });
            });
    } else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate)
            .then(data => {
                res.render("posts", { posts: data });
            })
            .catch(err => {
                res.render("posts", { message: "no results" });
            });
    } else {
        blogService.getAllPosts()
            .then(data => {
                res.render("posts", { posts: data });
            })
            .catch(err => {
                res.render("posts", { message: "no results" });
            });
    }
});

// /post/value route for getting a post by its ID
app.get('/post/:id', (req, res) => {
    blogService.getPostById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.json({ message: err }));
});

app.get('/categories', (req, res) => {
    const categoriesData = [
        {id: 1, name: "Technology"},
        {id: 2, name: "Gaming"},
        {id: 3, name: "Fashion"},
        {id: 4, name: "Education"},
        {id: 5, name: "Wellness"}
    ];
    res.render("categories", {categories: categoriesData});
});


app.get('/addpost', (req, res) => {
    res.render('addPost');  
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
    res.status(404).render('404');
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

    app.get('/blog/:id', async (req, res) => {

        // Declare an object to store properties for the view
        let viewData = {};
    
        try{
    
            // declare empty array to hold "post" objects
            let posts = [];
    
            // if there's a "category" query, filter the returned posts by category
            if(req.query.category){
                // Obtain the published "posts" by category
                posts = await blogData.getPublishedPostsByCategory(req.query.category);
            }else{
                // Obtain the published "posts"
                posts = await blogData.getPublishedPosts();
            }
    
            // sort the published posts by postDate
            posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
    
            // store the "posts" and "post" data in the viewData object (to be passed to the view)
            viewData.posts = posts;
    
        }catch(err){
            viewData.message = "no results";
        }
    
        try{
            // Obtain the post by "id"
            viewData.post = await blogData.getPostById(req.params.id);
        }catch(err){
            viewData.message = "no results"; 
        }
    
        try{
            // Obtain the full list of "categories"
            let categories = await blogData.getCategories();
    
            // store the "categories" data in the viewData object (to be passed to the view)
            viewData.categories = categories;
        }catch(err){
            viewData.categoriesMessage = "no results"
        }
    
        // render the "blog" view with all of the data (viewData)
        res.render("blog", {data: viewData})
    });