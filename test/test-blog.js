const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const {app, runServer, closeServer} = require('../server');
chai.use(chaiHttp);


describe('Blog API', function() {
    before(function() {
        return runServer();
    });

    after(function(){
        return closeServer();
    });

    it('should list blogs on GET', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.at.least(1);
                const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
                res.body.forEach(function(item) {
                    expect(item).to.be.a('object');
                    expect(item).to.include.keys(expectedKeys);
                });
            });
    });

    it('should add blog on POST', function() {
        
        const newPost = {title: 'Random Title', content: 'Dummy content', author: 'Jake'};
        const expectedKeys = ['id', 'publishDate'].concat(Object.keys(newPost));
        
        return chai.request(app)
            .post('/blog-posts')
            .send(newPost)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.all.keys(expectedKeys);
                expect(res.body.title).to.equal(newPost.title);
                expect(res.body.content).to.equal(newPost.content);
                expect(res.body.author).to.equal(newPost.author);
            });   
    });

    it('should update blogs on PUT', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                const updateBlogPost = Object.assign(res.body[0], {
                    title: 'Updated post',
                    content: 'Updated content'
                });
                return chai.request(app)
                    .put(`/blog-posts/${res.body[0].id}`)
                    .send(updateBlogPost)
                    .then(function(res) {
                        expect(res).to.have.status(204);
                    });
            });
    }); //end IT PUT

    it('should delete blogs on DELETE', function() {
        return chai.request(app)
            .get('/blog-posts')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/blog-posts/${res.body[0].id}`);
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            });
    }); //end IT delete route

}); //end describe 