//bring in our express module

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);

let db = mongoose.connection;

// Check connection
db.once('open', ()=>{
    console.log('Connected to MongoDB')
});


// Check for DB errors
db.on('error', (err) => {
    console.log(err)
});

//Init App
const app = express();

// Bring in Models
let Article = require('./model/article');


// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator());

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req,res,next)=>{
    res.locals.user = req.user || null;
    next();
})


//Home Route

// get ('/') the homepage
/* app.get('/', function(reqg,res){
        res.send('Hello World')
}); */

app.get('/', (req, res) => {
    /*let articles = [
        {
            id: 1,
            title: 'Article One',
            author: 'Winston Ye',
            body: "This is article one"
            
        },
        
        {
            id: 2,
            title: 'Article Two',
            author: 'Courtney Chung',
            body: "This is article two"
            
        },
        
        
        {
            id: 3,
            title: 'Article Three',
            author: 'Larissa Lee',
            body: "This is article three"
            
        }
    ]; */
    Article.find({}, (err, articles)=>{
        if(err){
            console.log(err);
        }else{
            res.render('index',  {
            title: 'Article',
            articles: articles
        })
        }   
    });
})

// Route Files
let articles = require('./route/articles');
let users = require('./route/user');
app.use('/article', articles);
app.use('/user', users);


//Start Server
app.listen(3000, () => console.log('Example app listening on port 3000!'))