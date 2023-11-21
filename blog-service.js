const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

var sequelize = new Sequelize('database', 'username', 'password', {
    host: 'host',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Post model
const Post = sequelize.define('Post', {
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    featureImage: {
        type: DataTypes.STRING,
    },
    published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
});

const Category = sequelize.define('Category', {
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Post.belongsTo(Category, { foreignKey: 'category' });

sequelize.sync()
    .then(() => {
        console.log('Database synchronized successfully');
    })
    .catch((error) => {
        console.error('Unable to sync the database:', error.message);
    });


function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log('Database synchronized successfully');
                resolve();
            })
            .catch((error) => {
                console.error('Unable to sync the database:', error.message);
                reject('Unable to sync the database');
            });
    });
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then((posts) => {
                if (posts && posts.length > 0) {
                    resolve(posts);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error('Error fetching all posts:', error.message);
                reject('Unable to fetch all posts');
            });
    });
}

function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { category: category }
        })
            .then((posts) => {
                if (posts && posts.length > 0) {
                    resolve(posts);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error(`Error fetching posts for category ${category}:`, error.message);
                reject(`Unable to fetch posts for category ${category}`);
            });
    });
}

const { Op } = require('sequelize');

function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [Op.gte]: new Date(minDateStr)
                }
            }
        })
            .then((posts) => {
                if (posts && posts.length > 0) {
                    resolve(posts);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error(`Error fetching posts since ${minDateStr}:`, error.message);
                reject(`Unable to fetch posts since ${minDateStr}`);
            });
    });
}

function getPostById(id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { id: id }
        })
            .then((posts) => {
                if (posts && posts.length > 0) {
                    // Return only the first object (assuming id is unique)
                    resolve(posts[0]);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error(`Error fetching post with id ${id}:`, error.message);
                reject(`Unable to fetch post with id ${id}`);
            });
    });
}

function addPost(postData) {
    return new Promise((resolve, reject) => {
        // Ensure the published property is set properly
        postData.published = (postData.published) ? true : false;

        // Iterate over properties and replace empty values with null
        for (let prop in postData) {
            if (postData[prop] === "") {
                postData[prop] = null;
            }
        }

        // Assign the current date to postDate
        postData.postDate = new Date();

        // Create a new post using Post.create()
        Post.create(postData)
            .then(() => {
                console.log('Post created successfully');
                resolve();
            })
            .catch((error) => {
                console.error('Unable to create post:', error.message);
                reject('Unable to create post');
            });
    });
}

function addCategory(categoryData) {
    for (const key in categoryData) {
        if (categoryData[key] === "") {
            categoryData[key] = null;
        }
    }
    return new Promise((resolve, reject) => {
        Category.create(categoryData)
            .then(() => resolve())
            .catch((err) => reject(`Unable to create category: ${err.message}`));
    });
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { published: true }
        })
            .then((publishedPosts) => {
                if (publishedPosts && publishedPosts.length > 0) {
                    resolve(publishedPosts);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error('Error fetching published posts:', error.message);
                reject('Unable to fetch published posts');
            });
    });
}

function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: { published: true, category: category }
        })
            .then((publishedPostsByCategory) => {
                if (publishedPostsByCategory && publishedPostsByCategory.length > 0) {
                    resolve(publishedPostsByCategory);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error(`Error fetching published posts for category ${category}:`, error.message);
                reject(`Unable to fetch published posts for category ${category}`);
            });
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((categories) => {
                if (categories && categories.length > 0) {
                    resolve(categories);
                } else {
                    reject('No results returned');
                }
            })
            .catch((error) => {
                console.error('Error fetching categories:', error.message);
                reject('Unable to fetch categories');
            });
    });
}

const { Category } = require('./models');

function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then((rowsDeleted) => {
            if (rowsDeleted > 0) {
                resolve();
            } else {
                reject('Category not found');
            }
        })
        .catch((err) => {
            reject(`Unable to delete category: ${err.message}`);
        });
    });
}

const { Post } = require('./models');

function deletePostById(id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
        .then((rowsDeleted) => {
            if (rowsDeleted > 0) {

                resolve();
            } else {
                reject('Post not found');
            }
        })
        .catch((err) => {
            reject('Unable to delete post');
        });
    });
}

module.exports = {
    initialize,
    getAllPosts,
    getPublishedPosts,
    getPublishedPostsByCategory,
    getCategories,
    getPostsByCategory,
    getPostsByMinDate,
    getPostById,
    addPost,
    addCategory,
    deleteCategoryById,
    deletePostById,
    Post, // Export the Post model for external use
    Category, // Export the Category model for external use
};
