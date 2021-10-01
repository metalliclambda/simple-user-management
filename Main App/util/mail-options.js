
const nodemailer = require('nodemailer');


// these should be in the env variable
const MAIL_SERVICE_USER = "";
const MAIL_SERVICE_PASS = "";
const MAIL_SERVICE = "";
const MAIL_SENDER_EMAIL = ""; 

// later i should put them in env variables
const transporter = nodemailer.createTransport({
    service : MAIL_SERVICE,
    auth: {
      user: MAIL_SERVICE_USER, 
      pass: MAIL_SERVICE_PASS, 
    }
});


let confirmMsg = (clientEmail, linkWithToken)=>{
    return {
        from: MAIL_SENDER_EMAIL,
        to: clientEmail ,
        subject: "Email Confirmation",
        html: `<h1>Dear Client</h1><h3>Welcome to our App</h3>
            please confirm your email with this link below
            <br>
            <a style="text-align: center;"  href="${linkWithToken}"><h2>Activation Link</h2></a>
            <br>
            <h3>If you didn't register in our app, Don't click on the link.</h3>`
    }
};

let forgetPassMsg = (email , linkWithToken)=>{
    return {
        from: MAIL_SENDER_EMAIL,
        to: email ,
        subject: "Reset Password Link",
        html: `   <h1>Your Reset Password Link</h1>
                <h3>Click link button below and reset your password</h3>    
                <a style="text-align: center;" href="${linkWithToken}"><h2>Reset Pass</h2></a>
                <h3>If you didn't register in our app, Don't click on the link.</h3>`
    }
};

let sendMail = (msg) => {    
    return transporter.sendMail(msg)
}


module.exports.forgetPassMsg = forgetPassMsg;
module.exports.confirmMsg = confirmMsg;
module.exports.sendMail = sendMail;