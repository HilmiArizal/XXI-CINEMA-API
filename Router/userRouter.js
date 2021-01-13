const express = require('express');
const router = express.Router();
const { userController } = require('../Controller');
const { auth } = require('../Helper/auth');

router.get('/getAllUsers', userController.getAllUsers);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/keepLogin', auth, userController.keepLogin);
router.post('/resendEmail', auth, userController.resendEmail);
router.patch('/emailVerification', auth, userController.emailVerification);
router.patch('/changePassword', auth, userController.changePassword);
// ADMIN
router.get('/getProfileAdmin', auth, userController.getProfileAdmin);
router.get('/getProfileAdminByUser', auth, userController.getProfileAdminByUser);
router.post('/addProfileAdmin', auth, userController.addProfileAdmin);
router.patch('/editProfileAdmin', auth, userController.editProfileAdmin);

module.exports = router;