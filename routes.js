'use strict';

const express = require('express');
const router = express.Router();

const start = require('./controllers/start');
const dashboard = require('./controllers/dashboard.js');
const about = require('./controllers/about.js');
const accounts = require('./controllers/accounts.js');

router.get('/', accounts.index);
router.get('/login', accounts.login);
router.get('/signup', accounts.signup);
router.get('/logout', accounts.logout);
router.post('/register', accounts.register);
router.post('/authenticate', accounts.authenticate);

router.get('/dashboard', dashboard.index);
router.get('/about', about.index);


router.post('/dashboard/uploadpicture', dashboard.uploadPicture);
router.post('/dashboard/addtag', dashboard.addTag);
router.post('/dashboard/addmessage', dashboard.addMessage);


router.get('/dashboard/deleteallpictures', dashboard.deleteAllPictures);
router.get('/dashboard/checkbox', dashboard.checkBox);

router.get('/dashboard/deletepicture', dashboard.deletePicture);
router.get('/dashboard/deletetag', dashboard.deleteTag);

//router.post('/dashboard/createGif', dashboard.createGif);


module.exports = router;
