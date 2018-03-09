const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

//to use ES6 promises
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {blogPost} = require('./models');

app.use(morgan('common'));
app.use(jsonParser);

// const path = require('path');

// app.get('/blog-posts', (req, res) => {
    //Express method, path comes from Node, allows us to join folder names to a path, path.join uses
    //global var __dirname (current directory where file is executing, wherever folder we put this is located (C://Mike etc.))
    //this mashes these 2 things together to make one string
//     res.sendFile(path.join(__dirname, '/index.html'))
    // let fullPath = __dirname + "/index.html" > this = C:\...\mongoose_blog/index.html
// });

app.get('/blog-posts', (req,res) => {
    //blogPost is the MongoDB blogposts collection
    blogPost
    .find()
    //return only 10
    .limit(10)
    //this promise returns an array or object of blogPost objects?
    .then(blogPosts=> {
        // console.log(blogPost);
        //json method wraps this string with type json and sends it on response channel as a string
        //changes this from JSON into string (notifies browser it's a JSON type so it can be parsed)
        //JSON is used to refer to type JSON, but it's also a browser library, so JSON.stringify is 
        //method on this library, changes JSON object into string
        res.json(blogPosts);
            //blogPost is model object based on blogPost schema/class, this here is an instance, we 
            //are creating a JSON object which will be serialized 
    })
    .catch(err=>{
        console.error(err);
        const message = 'Internal server error';
        res.status(500).send(message);
    });
});

app.get('/blog-posts/:id', (req,res)=>{
    blogPost 
    .findById(req.params.id) 
    .then(blogPost=> {
        res.json({
        title: blogPost.title,
        content: blogPost.content,
        author: blogPost.authorName
        });
    })
    .catch(err=>{
        console.error(err);
        const message = 'Internal server error';
        res.status(500).send(message);
    });
});


app.post('/blog-posts', (req, res)=> {
    //this checks if all fields are included
    const requiredFields = ['title', 'content', 'author'];
    for(let i = 0; i < requiredFields.length; i++) {
        let field = requiredFields[i];
        if(!(field in req.body)) {
            const message = `Missing field \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    //Mongoose's create method, this checks that we're not passing e.g. a number for the title, since this would
    //violate the schema (which requires a string)
    //actual user would be passing req.body via a form, though we are doing it in Postman
    blogPost.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost))
    .catch(err=> {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.put('/blog-posts/:id', (req, res)=>{
    
    if(req.params.id !== req.body.id) {
        const message = `Request id ${req.params.id} and request body id ${req.body.id} do not match`;
        res.status(400).send(message);
    }

    const updatedPost = {};

    const updateFields = ['title', 'content', 'author'];
    for(let i = 0; i < updateFields.length; i++) {
        if(updateFields[i] in req.body) {
            updatedPost[updateFields[i]] = req.body[updateFields[i]];
        }
    }

    blogPost.findByIdAndUpdate(req.params.id, {$set: updatedPost}, {new:true})
        .then(updatedPost => res.status(204).end())
        .catch(err=>res.status(500).json({message: "Error"}));

    // let post = blogPost.update({
    //     _id: req.params.id,
    //     title: req.body.title,
    //     content: req.body.content,
    //     author: req.body.author
    // })
    // .then(updatedPost => res.status(204).end()) 
    // .catch(err=>res.status(500).json({message: "Error thrown"}));

    
    // res.status(200).json(post);
});

app.delete('/blog-posts/:id', (req, res)=>{
    blogPost.findByIdAndRemove(req.params.id)
    .then(()=> {
        res.status(204).json({message: "success"});
    })
    .catch(err=>{
        if(err) {
            console.error(err);
            const message = 'Internal server error';
            res.status(500).send(message);
        }
    });
});




let server;

function runServer() {
    return new Promise((resolve, reject)=>{
        mongoose.connect(DATABASE_URL, err=> {
            if(err) {
                return reject(err);
            }
        });

        server = app.listen(PORT, ()=>{
            console.log(`App listening on port ${PORT}`);
            resolve();
        }).on('error',err=> {
            mongoose.disconnect();
            reject(err);
        });
    });
}

function closeServer() {
    //disconnects this Node script from Mongo DB, now we can't use Mongoose anymore
    return mongoose.disconnect().then(()=>{
        return new Promise((resolve, reject)=>{
            console.log('Closing server');
            server.close(err=>{
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

// app.listen(process.env.port || 80, function() {
//     console.log("Server started");
// })

//require.main means arriving at the server via the main point in package.json
if(require.main === module) {
    console.log("Server started");
    runServer(DATABASE_URL).catch(err=>console.error(err));
};

module.exports = {
    app,
    runServer,
    closeServer
}