const express = require('express');
const userController = require('../controllers/user');
const userValidator = require('../middleware/userValidator');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/' , userController.getIndex);

router.get('/user/profile' , isAuth , userController.getUserProfile);


module.exports = router;