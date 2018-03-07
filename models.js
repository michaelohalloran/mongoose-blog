const mongoose = require('mongoose');


const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: String,
    lastName: String
  }
});

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()});


//this makes a model from which Mongoose makes a blogposts collection, based on
//the blogPost Schema

const blogPost = mongoose.model('blogPost', blogPostSchema);
module.exports = {blogPost};