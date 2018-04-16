const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../model/user');

// Register Form
router.get('/register', (req, res)=>{
    res.render('register');
})

// Register Process
router.post('/register', (req, res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is Not Valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    
    let errors = req.validationErrors();
    
    if(errors){
        res.render('register', {
            errors:errors
        });
    }else{
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password
        });
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                if(err){
                    console.log(err);
                }
                /*
                Hashing is the transformation of a string of characters into a usually shorter fixed-length value or key that represents the original string. Hashing is used to index and retrieve items in a database because it is faster to find the item using the shorter hashed key than to find it using the original value.
                */
                newUser.password = hash;
                newUser.save((err)=>{
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('Success', 'You are now registered and can log in');
                        res.redirect('/user/login');
                    }
                });
            });
        })
    }
});

// Login Form
router.get('/login', (req, res)=>{
    res.render('login');
});

// Login Process
//next allows you to skip to the next middleware
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true    
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('Success', 'You have succesfully Logged Out');
    res.redirect('/user/login');
})


module.exports = router;