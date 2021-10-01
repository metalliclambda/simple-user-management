const express = require('express');
const authController = require('../controllers/auth');
const userValidator = require('../middleware/userValidator');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.get('/login' , authController.getLoing);

router.get('/signup' , authController.getSignup);

router.get('/new-password' , isAuth , authController.getNewPassword);

router.get('/forgotten-password' , authController.getForgottenPassword);

router.get('/reset/:token' , authController.getResetToken);

router.get('/confirm/:token' , authController.getConfirmToken);

router.post('/signup' , userValidator.validate('userSignUp') , authController.postSignup);

router.post('/login' , userValidator.validate('userLogin') ,authController.postLogin);

router.post('/forgotten-password' , userValidator.validate('forgottenpassword') ,authController.postForgattenPassword);

router.post('/logout' , isAuth , authController.postLogout);

router.post('/new-password' , isAuth , userValidator.validate('newPassword')  , authController.postNewPassword);

router.post('/reset-password'  , userValidator.validate('resetPassword')  , authController.postResetPassword);

router.post('/emailConfirmationAgain' , userValidator.validate('forgottenpassword') ,authController.postEmailConfirmationAgain);

module.exports = router;