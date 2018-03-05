'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
 const cloudinary = require('cloudinary');
 const path = require('path');
 const logger = require('../utils/logger');
var Promise = require("bluebird");


try {
  const env = require('../.data/.env.json');
  cloudinary.config(env.cloudinary);
}
catch(e) {
  logger.info('You must provide a Cloudinary credentials file - see README.md');
  process.exit(1);
}

const pictureStore = {

  addPicture(userId, tag, imageFile, response) {
   
    imageFile.mv('tempimage', err => {
      if (!err) {
        cloudinary.uploader.upload('tempimage', result => {
          console.log(result);
          const picture = {
            img: result.url,
            tag: tag
          };

        cloudinary.v2.uploader.add_tag(userId, result.public_id, function(result) { logger.info(result) });

        cloudinary.v2.uploader.add_tag(tag, result.public_id, function(result) { logger.info(result) });
     

          response();
        });
      }
    });
  },

  deletePicture(userId, image) {
    const id = path.parse(image);
   console.log(id.name);
    cloudinary.api.delete_resources([id.name], function (result) {
      console.log(result);
    });

  },

   deleteAllPictures(userId) {
    cloudinary.v2.api.resources_by_tag(userId, function(error, result){
      let album =  result.resources
      console.log(album[0].public_id + "deleting stuff");
      
      // Using Promise.map:
      //map over every image in our album and promise to return from cloudinary
      Promise.map(album, function(image) {
      //request to cloudinary for each of our images in the array
      return cloudinary.v2.api.delete_resources(image.public_id, function(error, imgResult){
     //   album.forEach(public_id => {
     //    cloudinary.api.delete_resources([public_id], result => {
     //      console.log(result);
         });
      });
    });
      
  },
};

module.exports = pictureStore;