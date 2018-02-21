'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const pictureStore = require('../models/picture-store.js');
const cloudinary = require('cloudinary');
var Promise = require("bluebird");

const dashboard = {
  index(request, response) {
        logger.info('dashboard rendering');

        const loggedInUser = accounts.getCurrentUser(request);
        const viewData = {
            title: 'PictureStore Dashboard',
            user: loggedInUser,
        };
        //start of old stuff
        cloudinary.v2.api.resources(function(error, result){
            // this is all only done when we have a response from cloudinary
            viewData.album =  result.resources
          //  console.log('all : ', viewData.album)

      let images = viewData.album.map((image) => {
      //  console.log('map : ', image)
        // loop over each thing in album (temporarily called image) and return what we want
        //which in this case is an object with a url and id want

      cloudinary.v2.api.resource(image.public_id,function(error, result){
        if (!error) {
          console.log('tag 1 = ' + result.tags[1])
       }});


        let newImage = {
          img: image.url,
          public_id: image.public_id,
          created: image.created_at,
          //tag: image.
        }
        console.log(newImage);
        return newImage

      })
      viewData.album.image=images
            response.render('dashboard', viewData);
            logger.info('album ' + viewData.album[0].url);
        });


    },

  uploadPicture(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    pictureStore.addPicture(loggedInUser.id, request.body.tag, request.files.picture, function () {
      response.redirect('/dashboard');
      logger.info('uploading picture:' + request.body.tag)

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
    response.reload(true)


  },
  
  createGif(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    cloudinary.v2.uploader.multi(request.body.tag, {delay: 3000},
   function(error,result) {console.log(result) });
      response.redirect('/dashboard');
      logger.info('creating gif:' + request.body.tag)

  },
  
  
};

module.exports = dashboard;