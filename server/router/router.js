const express = require('express');
const router = new express.Router();
const controller = require('../controller/controller');
const upload = require('../middleware/multer');
const auth = require('../middleware/auth');
router.get('/',auth,controller.gethome);

router.get('/register',controller.getregister);

router.get('/login',controller.getlogin);

router.get('/reset_password_mail',controller.reset_password_mail);

router.post('/register',upload,controller.postregister);

router.post('/login',controller.postlogin);

router.get('/logout',auth,controller.getlogout);

router.get('/reset_password/:token',controller.reset_password);

router.post('/reset_password',controller.post_reset_password);

router.get('/forgot_password',controller.forgot_password);

router.post('/forgot_sendmail',controller.forgot_sendmail);


module.exports = router;