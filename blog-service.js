const blogService = require('./blog-service.js');


const fs = require('fs');

// Globally declared arrays
let posts = [];
let categories = [];

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) return reject('Unable to read file');
            posts = JSON.parse(data);

            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) return reject('Unable to read file');
                categories = JSON.parse(data);
                resolve();
            });
        });
    });
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if(posts.length > 0) {
            resolve(posts);
        } else {
            reject('No results returned');
        }
    });
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        const publishedPosts = posts.filter(post => post.published);
        if(publishedPosts.length > 0) {
            resolve(publishedPosts);
        } else {
            reject('No results returned');
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if(categories.length > 0) {
            resolve(categories);
        } else {
            reject('No results returned');
        }
    });
}

module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getCategories
};
