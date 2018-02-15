'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const pictureStore = require('../models/picture-store.js');
const cloudinary = require('cloudinary');


const dashboard = {
  index(request, response) {
    logger.info('dashboard rendering');
    cloudinary.v2.uploader.multi('bitmoji',
    function(error,result) {console.log(result) });
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: 'PictureStore Dashboard',
      user: loggedInUser,
      album: pictureStore.getAlbum(loggedInUser.id),

    };
    response.render('dashboard', viewData);
  },

  uploadPicture(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    pictureStore.addPicture(loggedInUser.id, request.body.title, request.files.picture, function () {
      response.redirect('/dashboard');
    });
  },
  
   deleteAllPictures(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    pictureStore.deleteAllPictures(loggedInUser.id);
    response.redirect('/dashboard');
  },

  deletePicture(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    pictureStore.deletePicture(loggedInUser.id, request.query.img);
    response.redirect('/dashboard');
  },
};

module.exports = dashboard;