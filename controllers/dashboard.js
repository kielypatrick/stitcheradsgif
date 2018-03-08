
'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const pictureStore = require('../models/picture-store.js');
const cloudinary = require('cloudinary');
var Promise = require("bluebird");
const Handlebars = require('handlebars');


const viewData = {
    title: 'PictureStore Dashboard',
};

const dashboard = {

    index(request, response) {
      logger.info('dashboard rendering');

      const loggedInUser = accounts.getCurrentUser(request);
      viewData.user = loggedInUser;
      cloudinary.v2.api.resources_by_tag(loggedInUser.id, function(error, result){
      // this is all only done when we have a response from cloudinary
      viewData.album =  result.resources
      console.log('current user id : ', loggedInUser.id)

      // console.log('all : ', viewData.album)

      // Using Promise.map:
      //map over every image in our album and promise to return from cloudinary
      Promise.map(viewData.album, function(image) {
      //request to cloudinary for each of our images in the array
      return cloudinary.v2.api.resource(image.public_id, function(error, imgResult){
      //loaded our image tags
      //          console.log('finished loading image tags')
      if (viewData.album){
        console.log("photos" + viewData.album.length)

        imgResult.tags.shift();
        if (imgResult.tags == 'logo') {
            
            viewData.logo = imgResult.public_id;
            viewData.logoUrl = imgResult.url;
            console.log('logo: ' + viewData.logo);
            }
        
        // console.log("photos" + viewData.album.length)

        imgResult.split = imgResult.url.split("upload");
       // console.log('img link: ' + imgResult.split[0] + 'upload' + imgResult.split[1]);
        console.log('img tags: ' + imgResult.tags);

        return imgResult
        
      }

      }).then((res) =>{
          //structure our images in a nice way
          let image = {
          img: res.url,
          public_id: res.public_id,
          tags: res.tags,
          split: res.split[0],
          split1: res.split[1],
          logo: viewData.logo
      }
          return image
      })
      }).then(function(formattedImages){
          //when all is done we render our view :)
        
          viewData.album.image=formattedImages
          console.log(formattedImages.length)
        let i
        for (i = 0; i < formattedImages.length; i++){
          // console.log(viewData.album[i].public_id)

          if (formattedImages[i].public_id == viewData.logo){
           formattedImages.splice(i, 1); 
          }
        }        
        console.log(formattedImages);    
        response.render('dashboard', viewData);         
        });
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

  },

    createGif(request, response) {
      const loggedInUser = accounts.getCurrentUser(request);

      cloudinary.v2.uploader.multi(loggedInUser.id, {delay: (request.body.delay * 1000)},
      function(error,result) {
      viewData.gif = result.url;
      console.log('gif is at ' + viewData.gif);
    });

  },

};

module.exports = dashboard;