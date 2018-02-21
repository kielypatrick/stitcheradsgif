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
        cloudinary.v2.api.resources_by_tag(loggedInUser.id, function(error, result){
            // this is all only done when we have a response from cloudinary
            viewData.album =  result.resources
            console.log('current user id : ', loggedInUser.id)

            console.log('all : ', viewData.album)


            // Using Promise.map:
            //map over every image in our album and promise to return from cloudinary
            Promise.map(viewData.album, function(image) {
                //request to cloudinary for each of our images in the array
                return cloudinary.v2.api.resource(image.public_id, function(error, imgResult){
                    //loaded our image tags
                    console.log('finished loading image tags')
                  imgResult.tags.shift();
                  console.log('tidied Image tags: ' + imgResult.tags);
                    return imgResult
                  

                }).then((res) =>{
                    //structure our images in a nice way
                    let image = {
                        img: res.url,
                        public_id: res.public_id,
                        tags: res.tags
                    }
                    return image
                })
            }).then(function(formattedImages){
                //when all is done we render our view :)
                viewData.album.image=formattedImages
                response.render('dashboard', viewData);
                logger.info('album ' + viewData.album[0].url);
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
    response.reload(true)

  },
  
  createGif(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    cloudinary.v2.uploader.multi(loggedInUser.id, {delay: (request.body.delay * 1000)},
   function(error,result) {console.log(result) });
      response.redirect('/dashboard');
      logger.info('creating gif:' + request.body.delay)

  },
  
};

module.exports = dashboard;