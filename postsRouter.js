const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
router.use(bodyParser.urlencoded({ extended: false }));

const {BlogPosts} = require('./models');

BlogPosts.create('Post 1', 'This is the first post', 'Bob');
BlogPosts.create('Post 2', 'This is the second post', 'Bob');

//retrieve all blog posts
router.get('/', (req,res) => {
    res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req,res) => {
    const requiredFields = ['title', 'content', 'author'];
    for(let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing ${field} field`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    const post = BlogPosts.create(req.body.title, req.body.content, req.body.author);
    res.status(201).json(post);
});

router.put('/:id', jsonParser, (req,res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    // console.dir(req.body);
    // console.dir(req.body.id);
    for(let i = 0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing \`${field}\` field`;
            return res.status(400).send(message);
        }
    }
    // if(req.params.id !== req.body.id) {
    //     console.log(`${req.body.title}`);
    //     const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    //     console.error(message);
    //     return res.status(400).send(message);
    // }
    console.log(`Updating post \`${req.params.id}\``);
    const updatedItem = BlogPosts.update({
        id: req.params.id,
        title: req.body.title, 
        content: req.body.content, 
        author: req.body.author,
        publishDate: req.body.publishDate
    });
    res.status(204).end();
});

router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted post ${req.params.id}`);
    res.status(204).end();
});

module.exports = router;