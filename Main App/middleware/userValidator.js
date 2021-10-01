const { body } = require('express-validator');

module.exports.validate = (what) => {
    switch (what) {
        case 'userLogin': {
            return [
                body('email').isEmail().normalizeEmail(),
                body('password').not().isEmpty()
            ];
        }
            break;


        case 'userSignUp': {
            return [
                body('email').isEmail().normalizeEmail(),
                body('password').not().isEmpty(),
                body('confirmPassword').not().isEmpty(),
                body('confirmPassword').custom((value, { req }) => {
                    if (value !== req.body.password) {
                      throw new Error('Password confirmation does not match password');
                    }                
                    // Indicates the success of this synchronous custom validator
                    return true;
                }),
            ];
        }
            break;

        case 'forgottenpassword': {
            return [
                body('email').isEmail().normalizeEmail()
            ];
        }
            break;

        case 'newPassword': {
            return [
                body('oldPassword').not().isEmpty(),
                body('newPassword').not().isEmpty(),
                body('confirmNewPassword').not().isEmpty(),
                body('confirmNewPassword').custom((value, { req }) => {
                    if (value !== req.body.newPassword) {
                      throw new Error('Password confirmation does not match password');
                    }                
                    // Indicates the success of this synchronous custom validator
                    return true;
                }),
            ];
        }
            break;

        case 'resetPassword': {
            return [
                body('newPassword').not().isEmpty(),
                body('confirmNewPassword').not().isEmpty(),
                body('confirmNewPassword').custom((value, { req }) => {
                    if (value !== req.body.newPassword) {
                      throw new Error('Password confirmation does not match password');
                    }                
                    // Indicates the success of this synchronous custom validator
                    return true;
                }),
            ];
        }
            break;


        default:
            break;
    }
}