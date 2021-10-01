const bcrypt = require("bcryptjs");
const crypto = require('crypto'); // for creating unique secure random number
const { validationResult } = require("express-validator");
const mailOptions = require('../util/mail-options');
const User = require("../models/user");
const url = require('url');

module.exports.getLoing = (req, res , next) => {

  let errorMsg = req.flash('error')[0];
  let infoMsg = req.flash('info')[0];
  let oldEmailValue = req.flash('oldValue')[0];
  let isError ;
  if(errorMsg){
    isError = true;
  } else {
    isError = false;
  }
  let msg = errorMsg || infoMsg;

  res.render("./auth/login", {
    pageTitle: "Login",
    path: "login",
    errorMessage: msg,
    isError : isError,
    oldEmailValue : oldEmailValue
  });
};

module.exports.getSignup = (req, res , next) => {
  let errorMsg = req.flash('error')[0];
  let infoMsg = req.flash('info')[0];
  let isError ;
  if(errorMsg){
    isError = true;
  } else {
    isError = false;
  }
  let msg = errorMsg || infoMsg;

  res.render("./auth/signup", {
    pageTitle: "Sign Up",
    path: "signup",
    errorMessage: msg,
    isError : isError
  });
};

module.exports.getForgottenPassword = (req, res , next) => {
  let errorMsg = req.flash('error')[0];
  let infoMsg = req.flash('info')[0];
  let isError = false ;
  if(errorMsg){
    isError = true;
  } else {
    isError = false;
  }
  let msg = errorMsg || infoMsg;

  res.render("./auth/forgottenPassword", {
    pageTitle: "Forgotten Password",
    path: "forgottenpassword",
    errorMessage: msg,
    isError : isError
  });
};

module.exports.getNewPassword = (req, res , next) => {
  let errorMsg = req.flash('error')[0];
  let infoMsg = req.flash('info')[0];
  let isError ;
  if(errorMsg){
    isError = true;
  } else {
    isError = false;
  }
  let msg = errorMsg || infoMsg;

  res.render("./auth/new-password", {
    pageTitle: "Change Password",
    path: "newPassword",
    errorMessage: msg,
    isError : isError
  });
}

module.exports.getResetToken = (req , res , next) =>{
  let token = req.params.token;
  User.findOne({resetToken : token , resetTokenExpiration : { $gt : Date.now() }})
  .then(user => {
    if(user){
      let errorMsg = req.flash('error')[0];
      let infoMsg = req.flash('info')[0];
      let isError ;
      if(errorMsg){
        isError = true;
      } else {
          isError = false;
        }
        let msg = errorMsg || infoMsg;
        
        res.render("./auth/resetPassword", {
          pageTitle: "Reset Password",
          path: "reset-password",
          userToken : token, 
          errorMessage: msg,
          isError : isError
        });
      } else {
        req.flash('error', 'Invalid Link');
        res.redirect('/login'); 
        
      }
    })
    .catch(err=>{
      const error =  new Error(err);
      return next(error);
    });

}

module.exports.getConfirmToken = (req , res , next) => {
  let token = req.params.token;
  User.findOne({confirmToken : token})
    .then(user => {      
      if (user){
        user.isConfirmed = true;
        user.confirmToken = null;
        return user.save();
      } else {
        req.flash('error' , 'Invalid Link');
        return res.redirect('/login');
      }
    })
    .then(result => {
      if(result){
        req.flash('info' , 'Your Email Confirmed, You can login now.');
        return res.redirect('/login');
      } 
    })
    .catch(err => {
      const error =  new Error(err);
      return next(error);
    });
}

module.exports.postSignup = (req, res , next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error' , errors.errors[0].msg);
    return res.redirect('/signup');
  }
  let token = '';  
  User.findOne({email : req.body.email})
    .then(user => {
      if(user){
        req.flash('error' , 'This Email already Exist');
        return res.redirect('/signup');
      } else {
        return bcrypt.hash(req.body.password, 12);
      }
    })  
    .then(hash => {
      if(hash){
        token = crypto.randomBytes(32).toString('hex');
        const newUser = new User({
          email: req.body.email,
          password: hash,
          confirmToken : token,
          isConfirmed : false,
          isAdmin : false,
          posts: [],
        });        
        return newUser.save();                
      }
    })
    .then(result => {
      if(result){
        let link = url.format({
          protocol : req.protocol,
          host : req.headers.host ,
        });
        let linkObj = new URL(link);
        linkObj.pathname = `/confirm/${token}`;
        // console.log(linkObj.href);   // in developing mode, we can just log instead of sending email
        mailOptions.sendMail(mailOptions.confirmMsg(req.body.email , linkObj.href));                
        req.flash('info' , 'Please Confirm your Email address');
        return res.redirect('/login');
      }
    })
    .catch(err=> {
      const error =  new Error(err);
      return next(error);
    });

};

module.exports.postLogin = (req, res , next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error' , errors.errors[0].msg);
    return res.redirect('/login');
  }

  const {email , password} = req.body;
  User.findOne({email : email})
    .then(user => {      
      if(user){
        
        bcrypt.compare(password , user.password)
        .then(isMatch => {
          if (isMatch) {
            if(!user.isConfirmed){
              req.flash('error', 'You need to confirm your Email');
              req.flash('oldValue' , email);
              return res.redirect('/login'); 
            } else {
                req.session.isLoggedIn = true;
                req.session.user = user;
                req.session.save(()=>{
                    res.redirect('/');     
                });
            }
          } else {
              req.flash('error', 'Invalid Username or Password!');
              res.redirect('/login'); 
          }
        })            
        .catch(err => {
          const error =  new Error(err);
          return next(error);
        });
      }else {
        req.flash('error', 'Invalid Username or Password!');
        res.redirect('/login');
      }
    })
    .catch(err => {
      const error =  new Error(err);
      return next(error);
    });

};

module.exports.postForgattenPassword = (req, res , next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error' , errors.errors[0].msg);
    return res.redirect('/forgotten-password');
  }

  let token = '';
  User.findOne({email : req.body.email})
    .then(user => {
      if(user){   
        if(!user.isConfirmed){
          req.flash('error', 'You need to confirm your Email');
          return res.redirect('/login'); 
        }     
        token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      }       
      req.flash('info' , 'Password Reset Link will be sent , if the Email exits');
      res.redirect('/login');            
      
    })    
    .then(result => {
      if(result){
        let link = url.format({
          protocol : req.protocol,
          host : req.headers.host ,
        });
        let linkObj = new URL(link);
        linkObj.pathname = `/reset/${token}`;
        // console.log(linkObj.href); // developer can use log in development mode
        mailOptions.sendMail(mailOptions.forgetPassMsg(user.email , linkObj.href));
        req.flash('info' , 'Password Reset Link will be sent , if the Email exits');
        res.redirect('/login');          
      }
    })
    .catch(err => {      
      const error =  new Error(err);
      return next(error);
    });
  
};

module.exports.postLogout = (req , res , next) => {
  req.session.destroy(()=>{
    res.redirect('/'); 
  });  // this will clear all the session
}

module.exports.postNewPassword = (req, res , next) => {  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error' , errors.errors[0].msg);
    return res.redirect('/new-password');
  }  

  const {oldPassword , newPassword} = req.body;
  User.findOne({email : req.user.email})
    .then(user => {
      bcrypt.compare(oldPassword , user.password)
        .then(isMatch => {
          if (isMatch) {
            bcrypt.hash(req.body.newPassword, 12)
              .then(hash => {
                user.password = hash;
                return user.save();
              })
              .then(result => {
                req.flash('info', 'Password Changed Successfully');
                res.redirect('/new-password'); 
              })
              .catch(err => {
                const error =  new Error(err);
                return next(error);
              });
          } else {
              req.flash('error', 'Invalid Old Password');
              res.redirect('/new-password'); 
          }
        })            
        .catch(err => {          
          const error =  new Error(err);
          return next(error);
        });
    })
    .catch(err => {
      const error =  new Error(err);
      return next(error);
    });  
};

module.exports.postResetPassword = (req , res , next)=>{
  const {newPassword , userToken} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error' , errors.errors[0].msg);
    return res.redirect(`/reset/${userToken}`);
  }

  User.findOne({resetToken : userToken , resetTokenExpiration : { $gt : Date.now() }})
    .then(user => {
      if(user){

        bcrypt.hash(newPassword, 12)
          .then(hash => {
            user.password = hash;
            user.resetToken = null;
            user.resetTokenExpiration = null;
            return user.save();
          })
          .then(result => {
            req.flash('info', 'Password Changed Successfully');
            res.redirect('/login'); 
          })
          .catch(err => {            
            const error =  new Error(err);
            return next(error);
          });

      } else {
        req.flash('error', 'Invalid Link');
        res.redirect('/login'); 
      }
    })    
    .catch(err=> {      
      const error =  new Error(err);
      return next(error);
    });
}

module.exports.postEmailConfirmationAgain = (req , res , next)=> {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    req.flash('error' , errors.errors[0].msg);
    return res.redirect('/login');
  }

  let token = '';
  User.findOne({email : req.body.email})
    .then(user => {
      if(user){   
        if(!user.isConfirmed){
          token = crypto.randomBytes(32).toString('hex');
          user.confirmToken = token;          
          return user.save();
        }  else {
          req.flash('error', 'Email is already Confirmed');
          return res.redirect('/login');           
        }        
      }    
    })    
    .then(result => {
      if(result){

        let link = url.format({
          protocol : req.protocol,
          host : req.headers.host ,
        });
        let linkObj = new URL(link);
        linkObj.pathname = `/confirm/${token}`;
        // console.log(linkObj.href); // developer can use log in development mode.
        mailOptions.sendMail(mailOptions.confirmMsg(req.body.email , linkObj.href))                
          .then(info => {
            req.flash('info' , 'Please Confirm your Email address');
            return res.redirect('/login');
          })
          .catch(err => {
            req.flash('error' , 'An Error with Sending Confirmation mail ! Try Later');
            return res.redirect('/login');
          });
      }
    })    
    .catch(err => {
      console.log(err);      
      const error =  new Error(err);
      return next(error);
    });
}
