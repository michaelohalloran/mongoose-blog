const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const postsRouter = require('./postsRouter');
const app = express();
const path = require('path');

app.use(morgan('common'));

app.use('/blog-posts', postsRouter);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject)=>{
        server = app.listen(port, ()=>{
            resolve(server);
        }).on('error',err=> {
            reject(err);
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject)=>{
        console.log('Closing server');
        server.close(err=>{
            if(err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// app.listen(process.env.port || 80, function() {
//     console.log("Server started");
// })

//require.main means arriving at the server via the main point in package.json
if(require.main === module) {
    console.log("Server started");
    runServer().catch(err=>console.error(err));
};

module.exports = {
    app,
    runServer,
    closeServer
}