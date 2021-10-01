const { validationResult } = require("express-validator");

module.exports.getIndex = (req , res)=>{
    res.render('./index' , {
        pageTitle : 'Home' , 
        path : '/',        
    });
}

module.exports.getUserProfile = (req,res) => {
    res.render('./user/userProfile' , {
        pageTitle : 'User Account' , 
        path : 'userProfile',
        userData : req.user || {},
    });
}