const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../model/article');

//Bring in User Model
let User = require('../model/user');

// Access Control
let ensureAuthenticated = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger', 'Please Login');
        res.redirect('/user/login');
    }
}

//Add Route
router.get('/add', ensureAuthenticated, (req, res) => res.render('add_article', {
        title:'Add Article'
    })
)


// Add Submit Post Route
router.post('/add', (req,res)=>{
    req.checkBody('title', 'Title is Required!').notEmpty();
    //req.checkBody('author', 'Author is Required!').notEmpty();
    req.checkBody('body', 'Body is Required!').notEmpty();
    
    // Get Errors
    let errors = req.validationErrors();
    
    if(errors){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id; //puts down user id instead of author
        article.body = req.body.body;

        article.save((err)=>{
            if(err){
                console.log(err);
                return;
            }else{
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
           });
        }
    });
    
    

// Load Edit Form
// : is placeholder
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
    Article.findById(req.params.id, (err, article)=>{
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized to make Edits');
            //https://stackoverflow.com/questions/7042340/error-cant-set-headers-after-they-are-sent-to-the-client
            return res.redirect('/');
        }
        res.render('edit_article', {
            title:'Edit Article',
            article:article
        });
    });
});

// Update Submit Post Route
router.post('/edit/:id', (req,res)=>{
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    
    let query = {_id:req.params.id}
    
    Article.update(query, article, (err)=>{
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

//Delete Article
router.delete('/:id', (req, res)=>{
    if(!req.user._id){
        res.status(500).send();
    }
    
    let query = {_id:req.params.id}
    
    Article.findById(req.params.id, (err, article)=>{
        if(article.author != req.user._id){
            res.status(500).send();
        }else{
            Article.remove(query, (err)=>{
                if(err){
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });    
});


module.exports = router;

// Get Single Article
// : is placeholder
router.get('/:id', (req, res)=>{
    Article.findById(req.params.id, (err, article)=>{
        User.findById(article.author, (err, user)=>{
            res.render('article', {
                article:article,
                author: user.name
            });
        })
    });
});
