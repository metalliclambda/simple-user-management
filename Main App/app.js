const path = require("path");
const express = require("express");
const mongoose = require('mongoose'); 
const flash = require('connect-flash');
const session = require('express-session');
const csrf = require('csurf');
const url = require('url');
const MongoDBStore = require('connect-mongodb-session')(session);


// Should use A real DB address in the Env variable
const MONGODB_URI = 'mongodb://localhost:27017/acc-mng';
var store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// this should be set with host later
const PORT = 3000;

var csrfProtection = csrf();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'My Secrect that should be in the env variable', // it should be a long string
  resave: false,  // means : the session will not be saved on every request that is done. But only if sth changed in the session.
  // its better to be false
  saveUninitialized: false,  // Ensure that no session gets saved for a request where it doesn’t need to be saved.  
  store : store
}));

app.use(csrfProtection);

app.use(flash());

app.use((req , res , next) => {
  
  if (!req.session.user) {
    next();
  } else {
    User.findById(req.session.user._id)
      .then(user => {
        if(!user){
          return next();
        }
        req.user = user;
        req.isLoggedIn = true;
        next();
      })
      .catch(err => {
        const error =  new Error(err);
        error.httpStatusCode = 500;
        next(error);
      });
  }
});

app.use((req,res,next) => {
  res.locals.isLoggedIn = req.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(authRoutes);
app.use(userRoutes);

app.use('/404' , (req,res)=>{
  let errorMsg = req.flash('error')[0];
  let infoMsg = req.flash('info')[0];
  let isError ;
  if(errorMsg){
    isError = true;
  } else {
    isError = false;
  }
  let msg = errorMsg || infoMsg;

  res.status(404).render('404', { 
    pageTitle: "Page Not Found",
    path: "404",
    errorMessage: msg,
    isLoggedIn : req.isLoggedIn    
  });
});

app.use('/500' , (req,res)=>{
  let errorMsg = req.flash('error')[0];
  let infoMsg = req.flash('info')[0];
  let isError = true ;
  if(errorMsg){
    isError = true;
  } else {
    isError = false;
  }
  let msg = errorMsg || infoMsg;

  res.status(500).render('500', { 
    pageTitle: "Page Not Found",
    path: "404",
    errorMessage: msg,
    isLoggedIn : req.isLoggedIn    
  });
});

app.use((req,res)=>{
  res.redirect('/404');
});

app.use((error , req , res , next)=>{
  res.redirect('/500');   
});


mongoose.connect(MONGODB_URI)
  .then(()=>{
    console.log('DB Connected !');
    app.listen(PORT, (req, res) => {
      console.log("Server Started !");
    });
  })
  .catch(err => {
    console.log(err);
  });


