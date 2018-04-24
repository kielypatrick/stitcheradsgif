
'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const pictureStore = require('../models/picture-store.js');
const cloudinary = require('cloudinary');
var Promise = require("bluebird");
const Handlebars = require('handlebars');
const _ = require('lodash')
//lodash required for .find method

var viewData = {
    title: 'PictureStore Dashboard',
};

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

const dashboard = {

    index(request, response) {
      logger.info('dashboard rendering');

      const loggedInUser = accounts.getCurrentUser(request);
      viewData.user = loggedInUser;
      //Put in a link to a default blank logo for the user
      viewData.logoUrl = "http://res.cloudinary.com/patrick86/image/upload/w_iw,h_20/tempLogo.png";
      viewData.logo = "tempLogo.png";
      if (viewData.transition === undefined){
        viewData.transition = "rZoom";
      }
      viewData.textColour = "000000";

      //if statement above to make sure we stay on the same transition mode after upload or delete
      cloudinary.v2.api.resources_by_tag(loggedInUser.id, function(error, result){
        // this is all only done when we have a response from cloudinary
        viewData.album =  result.resources
        console.log('current user id: ', loggedInUser.id)

        // console.log('all : ', viewData.album)
        console.log("Total Images: " + viewData.album.length + " photos" )

        // Using Promise.map:
        //map over every image in our album and promise to return from cloudinary
        Promise.map(viewData.album, function(image) {
          //request to cloudinary for each of our images in the array
          return cloudinary.v2.api.resource(image.public_id, function(error, imgResult){
          //loaded our image tags
          //          console.log('finished loading image tags')
          if (viewData.album){

            imgResult.tags.shift();
            //remove the user id tag
            
            //this block removed as logo needs to be set later 
            //to ensure it's picked up by all images
            
//             console.log(' >> tags : ', imgResult.tags)
            if (imgResult.tags == 'logo') {

              viewData.logoUrl = imgResult.url;
              console.log('Logo at ' + viewData.logoUrl);
              }
//               console.log('THIS IS A LOGO')
//             } else {
//               console.log('THIS IS NOT A LOGO')
//               console.log('img tag: ' + imgResult.tags);
//             }

            imgResult.split = imgResult.url.split("upload");
           // image url can be found at imgResult.split[0] + 'upload' + imgResult.split[1]

            return imgResult

          }

          }).then((res) =>{
            //console.log('img WIT: ' + res.width);
            let logoWidth = Math.floor(res.width/6);
            let textHeight = Math.floor(logoWidth/3);
              //structure our images in a nice way
              let image = {
              img: res.url,
              public_id: res.public_id,
              tags: res.tags,
              split: res.split[0],
              split1: res.split[1],
              logo: viewData.logo,
              textHeight: textHeight,
              textColour: viewData.textColour,
              logoWidth: logoWidth

            }
            console.log('logo size: ' + image.logoWidth);

            return image
          })
        }).then(function(formattedImages){
          //when all is done we render our view :)
          
          // Find in the formatted images for the logo, map over the images and 
          // set the logo id 

          //find the image tagged "logo"
          let logoImage = _.find(formattedImages, (image) => image.tags[0] === 'logo')
          //update the album to attach this logo to all images
          //map a new version of the images over the old ones, with the logo property correctly defined
          let updatedAlbum = formattedImages.map((image) => {
            image.logo = logoImage.public_id
            return image
          })
          viewData.album.image = updatedAlbum
          let i
          for (i = 0; i < updatedAlbum.length; i++){
          //  console.log(viewData.album.image)

            if (updatedAlbum[i].public_id == updatedAlbum[i].logo){
             updatedAlbum.splice(i, 1); 
                        console.log("Logo spliced out... ");  

            }
            //seperate the logo image from the album

          }      
          console.log("Total Images (not counting logo image): " + updatedAlbum.length)

          console.log("All Images... ");  
          console.log(updatedAlbum);  
          console.log("current user logo is at");  
          console.log(viewData.logoUrl);
          console.log(viewData.transition);

          response.render('dashboard', viewData);         
          });
      });
     
    },                                         
                                    
    uploadPicture(request, response) {
      
      const loggedInUser = accounts.getCurrentUser(request);
      pictureStore.addPicture(loggedInUser.id, request.body.tag, request.files.picture, function () {
      response.redirect('/dashboard');
      logger.info('uploading picture: ' + request.body.tag)

    });
      
  },

    deleteAllPictures(request, response) {
      const loggedInUser = accounts.getCurrentUser(request);
      pictureStore.deleteAllPictures(loggedInUser.id, response);
  },

    deletePicture(request, response) {
      const loggedInUser = accounts.getCurrentUser(request);
      pictureStore.deletePicture(loggedInUser.id, request.query.img, response, viewData);

  },
  
  deleteTag(request, response) {
      const loggedInUser = accounts.getCurrentUser(request);
          console.log("request.query", request.query.img);

      pictureStore.deleteTag(loggedInUser.id, request.query.img, response, viewData);

  },

//     createGif(request, response) {
//       const loggedInUser = accounts.getCurrentUser(request);

//       cloudinary.v2.uploader.multi(loggedInUser.id, {delay: (request.body.delay * 1000)},
//       function(error,result) {
//       viewData.gif = result.url;
//       console.log('gif is at ' + viewData.gif);
//     });

//   },
  
    checkBox(request, response){
      viewData.transition = request.query.value;
      if (request.query.value == 'zoom')
      {
        viewData.transition = request.query.value
      }
      else if (request.query.value == 'rZoom')
      {
        viewData.transition = request.query.value
      }
      else if (request.query.value == 'fade')
      {
        viewData.transition = request.query.value
      }
      else 
      {
        viewData.transition = 'slide'
      }
      console.log("request.query");

      console.log(request.query);

      console.log(request.query.value);
     
      response.render('dashboard', viewData);         
      
    },
   
};

module.exports = dashboard;