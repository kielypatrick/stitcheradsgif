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
    
    if (tag == 'logo')
    //check if current upload is intended to be a logo
    {

    cloudinary.v2.api.resources_by_tag(userId, function(error, result){
      let album =  result.resources
      Promise.map(album, function(image) {
      //request to cloudinary for each of our images in the array
      return cloudinary.v2.api.resource(image.public_id, function(error, imgResult){
        
          imgResult.tags.shift();
        //remove the user ID tag from each image, so we can search second (user inputted) tags only

          console.log('Promise Returns : ', imgResult.tags);

          if (imgResult.tags == 'logo'){
            //if there is already a logo image uploaded for this user, we will delete it
            cloudinary.api.delete_resources(imgResult.public_id, function (result) {
            console.log('Deleting old logo');
             
            console.log(result);
            });
          }

          });
        });
      });
    }

    //upload image 
    imageFile.mv('tempimage', err => {
      if (!err) {
        cloudinary.uploader.upload('tempimage', result => {
          console.log("upload pending for" , result.public_id);
          const picture = {
            img: result.url,
            tag: tag
          };
          console.log(">>>>" + tag);
          
    // add tag with user ID for retrieval of users photos
        cloudinary.v2.uploader.add_tag(userId, result.public_id, function(res) { 
          logger.info('added tag ' + userId + ' to image ' + tag, res) 
          cloudinary.v2.uploader.add_tag(tag, result.public_id, function(res2) { 
            logger.info('added tag ' + tag + ' to image', res2) });
          
//Change made here to ensure that the userId tag is the first tag, so that it can be removed later for dispay purposes

        });
    // add user inputted tag
        //if (tag == ''){ 
      //  }
//         else {
//           console.log("no tag");
          
//           cloudinary.v2.uploader.add_tag('tag', result.public_id, function(result) { logger.info('added tag . to image', result) });
//         }

          
//         if (tag !='logo') {
          
          // cloudinary.v2.uploader.upload('tempimage', {public_id: result.public_id +"2",
          // width: .6, crop: "crop", gravity: "center",
          // })
//           cloudinary.v2.uploader.upload('tempimage', {public_id: result.public_id +"3",
//           width: .7, crop: "crop", gravity: "center",
//           })
//           cloudinary.v2.uploader.upload('tempimage', {public_id: result.public_id +"4",
//           width: .8, crop: "crop", gravity: "center",
//           })
//           cloudinary.v2.uploader.upload('tempimage', {public_id: result.public_id +"5",
//           width: .9, crop: "crop", gravity: "center",
//           })
                 
        // cloudinary.v2.uploader.add_tag(userId + tag, result.public_id + "1", function(result) { logger.info(result) });
        // cloudinary.v2.uploader.add_tag(userId + tag, result.public_id + "2", function(result) { logger.info(result) });
//         cloudinary.v2.uploader.add_tag(userId + tag, result.public_id + "3", function(result) { logger.info(result) });
//         cloudinary.v2.uploader.add_tag(userId + tag, result.public_id + "4", function(result) { logger.info(result) });
//         cloudinary.v2.uploader.add_tag(userId + tag, result.public_id + "5", function(result) { logger.info(result) });

//         cloudinary.v2.uploader.multi(userId + tag, {delay: (2000)},
//       function(error,result) {
//       console.log('gif is at ' + result);
//     });

//         }
                                      
        response();
        });
        
      }
    });
     
  },

  deletePicture(userId, image, resp) {
    const id = path.parse(image);
    console.log('You have deleted the following image..');
    console.log(id.name);
    cloudinary.api.delete_resources([id.name], function (result) {
      console.log(result);
      resp.redirect('/dashboard');
      //redirect moved into the cloudinary call to make sure the delete completes first
    });

  },

   deleteAllPictures(userId, resp) {
    cloudinary.v2.api.resources_by_tag(userId, function(error, result){
      let album =  result.resources
      console.log(album[0].public_id + "deleting stuff");
      
      // Using Promise.map:
      //map over every image in our album and promise to return from cloudinary
      Promise.map(album, function(image) {
      //request to cloudinary for each of our images in the array
      return cloudinary.v2.api.delete_resources(image.public_id, function(error, imgResult){
        console.log(result);
        });
      })
      .then(() => {
        resp.redirect('/dashboard');
        //redirect tied to the map iterating over the images make sure all deletions complete first

      })
    });
      
  },
};

module.exports = pictureStore;