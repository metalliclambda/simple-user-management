const mongoose = require('mongoose'); 

const Schema = mongoose.Schema;

const userSchema = new Schema({ 
    email : {
      type : String,
      required : true
    } ,
    password : {
      type : String,
      required : true
    } ,

    isAdmin : {
      type : Boolean,
      required : true
    } ,

    confirmToken : {
      type : String
    },

    isConfirmed : {
      type : Boolean ,
      required : true
    },
    
    resetToken : {
      type : String
    },
    resetTokenExpiration : {
      type : Date
    }   
  });

  module.exports = mongoose.model('User' , userSchema);
