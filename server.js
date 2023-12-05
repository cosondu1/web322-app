/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chidera Osondu Student ID: 174098210  Date: Monday December 
*
*  Online (Cyclic) Link: https://extinct-tutu-ray.cyclic.cloud/
*
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require('path');
const blogData = require("./blog-service");
var clientSessions = require("client-sessions");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const blogService = require('./blog-service.js');
const authData = require('./auth-service.js');
const bcrypt = require('bcryptjs');


const stripJs = require('strip-js');

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",

    helpers: {
        navLink: (url, options) => `<li${url === app.locals.activeRoute ? ' class="active"' : ''}><a href="${url}">${options.fn(this)}</a></li>`,

        equal: (lvalue, rvalue, options) => {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper equal needs 2 parameters");
            }
            return lvalue !== rvalue ? options.inverse(this) : options.fn(this);
        },

        safeHTML: (context) => stripJs(context),
    },
}));


app.set('view engine', '.hbs');

cloudinary.config({
    cloud_name: 'dubq2lwcs',
    api_key: '666723166893873',
    api_secret: 'DA5BpthrFWYBqYoa0gulJwJTjXs',
    secure: true
});

const upload = multer();

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const blogService = require('./blog-service.js');

// clientSessions middleware setup
app.use(clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

// Middleware to make the session object available in all views
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// ensureLogin middleware
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.redirect('/blog');
});


app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/posts/add', async (req, res) => {
    try {
        const categories = await blogData.getCategories();
        res.render('addPost', { categories });
    } catch (err) {
        res.render('addPost', { categories: [] });
    }
});

app.get('/categories/add', (req, res) => {
    res.render('addCategory');
});

app.get('/blog', async (req, res) => {

    let viewData = {};

    try{
        let posts = [];

        if(req.query.category){
        
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
           
            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        let post = posts[0]; 

        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        
        let categories = await blogData.getCategories();

        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
      console.log(viewData, "<==view data")

    res.render("blog", {data: viewData})

});

app.get('/posts', (req, res) => {
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category)
            .then(data => {
                if (data.length > 0) {
                    res.render("posts", { posts: data });
                } else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("posts", { message: "no results" });
            });
    } else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate)
            .then(data => {
                if (data.length > 0) {
                    res.render("posts", { posts: data });
                } else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("posts", { message: "no results" });
            });
    } else {
        blogService.getAllPosts()
            .then(data => {
                if (data.length > 0) {
                    res.render("posts", { posts: data });
                } else {
                    res.render("posts", { message: "no results" });
                }
            })
            .catch(err => {
                res.render("posts", { message: "no results" });
            });
    }
});


app.post('/posts/add', upload.single('featureImage'), async (req, res) => {
    try {
        let uploaded = await upload(req);
        req.body.featureImage = uploaded.url;

        await blogService.addPost(req.body);
        res.redirect('/posts');
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).send("Error uploading image");
    }
});

app.post('/categories/add', async (req, res) => {
    try {
        await blogService.addCategory(req.body);
        res.redirect('/categories');
    } catch (error) {
        res.status(500).send("Unable to Add Category");
    }
});

app.get('/posts/delete/:id', async (req, res) => {
    try {
        await blogService.deletePostById(req.params.id);
        res.redirect('/posts');
    } catch (error) {
        res.status(500).send("Unable to Remove Post / Post not found");
    }
});

app.get('/categories/delete/:id', async (req, res) => {
    try {
        await blogService.deleteCategoryById(req.params.id);
        res.redirect('/categories');
    } catch (error) {
        res.status(500).send("Unable to Remove Category / Category not found");
    }
});

app.get('/post/:id', (req, res) => {
    blogService.getPostById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.json({ message: err }));
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await blogService.getCategories();

        if (categories.length > 0) {
            res.render("categories", { categories: categories });
        } else {
            res.render("categories", { message: "no results" });
        }
    } catch (err) {
        res.render("categories", { message: "error retrieving categories" });
    }
});


app.get('/addPost', (req, res) => {
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

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).send("Error uploading image");
    }
});


app.use((req, res, next) => {
    res.status(404).render('404');
});

app.post("/register", async (req, res) => {
    try {
        await authData.registerUser(req.body);
        req.session.successMessage = "User created";
        res.redirect("/login");
    } catch (err) {
        res.render("register", {
            errorMessage: err,
            userName: req.body.userName,
        });
    }
});

app.get("/logout", (req, res) => {
    req.session.reset(); 
    res.redirect("/"); 
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});


app.post("/login", async (req, res) => {
    try {
        req.body.userAgent = req.get("User-Agent");

        const user = await authData.checkUser(req.body);

        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory,
        };
        res.redirect("/posts");
    } catch (err) {
        res.render("login", { errorMessage: err, userName: req.body.userName });
    }
});

app.get("/logout", (req, res) => {
    req.session.reset(); 
    res.redirect("/"); 
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});


app.use((req, res) => {
    res.status(404).render("404");
});

blogService
    .initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on port ${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log("Unable to start server:", err);
    });