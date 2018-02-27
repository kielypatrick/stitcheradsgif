'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
 const cloudinary = require('cloudinary');
 const path = require('path');
 const logger = require('../utils/logger');

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
    let album = this.getAlbum();
    if (album) {
      album.forEach(image => {
        const id = path.parse(image);
        cloudinary.api.delete_resources([id.name], result => {
          console.log(result);
        });
      });
    }
  },
};

module.exports = pictureStore;