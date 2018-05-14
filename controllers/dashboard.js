
'use strict';

const logger = require('../utils/logger');
const accounts = require('./accounts.js');
const pictureStore = require('../models/picture-store.js');
const userStore = require('../models/user-store.js');

const cloudinary = require('cloudinary');
var Promise = require("bluebird");
const Handlebars = require('handlebars');
const path = require('path');

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
      viewData.textColour = "ffffff";
      viewData.textBgColour = "1050ff";
      if(!viewData.user.messageFont){
        viewData.user.messageFont = "Verdana";
        viewData.user.messageColour= "White";        
      }

      //if statement above to make sure we stay on the same transition mode after upload or delete
      cloudinary.v2.api.resources_by_tag("!!!!!" + loggedInUser.id, function(error, result){
        // this is all only done when we have a response from cloudinary
        viewData.album =  result.resources
        console.log('current user id: ', loggedInUser.id)
        console.log('current user message: ', loggedInUser.message)
        console.log('current user message:Font ', loggedInUser.messageFont)

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
            
//             console.log(' >> tags : ', imgResult.tags)
            if (imgResult.tags.includes('logo')) {
              
              viewData.logoUrl = imgResult.url;
              viewData.logo = imgResult.public_id;
          
              viewData.user.messageHeight = Math.floor(imgResult.height/6); 

              console.log('Logo at ' + viewData.logoUrl);
              imgResult.split = imgResult.url.split("upload");
              viewData.endCardUrl = imgResult.split[0] + "upload/w_" + imgResult.width + ',l_text:' + viewData.user.messageFont + "_" + viewData.user.messageHeight + "_bold_italic:" + viewData.user.message + ",co_" + viewData.user.messageColour + ",g_south,y_" + viewData.user.messageHeight + ",a_-5" + imgResult.split[1]
              console.log('End card at ' + viewData.endCardUrl);
              }

            imgResult.split = imgResult.url.split("upload");
           // image url can be found at imgResult.split[0] + 'upload' + imgResult.split[1]

            return imgResult

          }

          }).then((res) =>{
            let logoWidth = Math.floor(res.width/6);
            let textHeight = Math.floor(logoWidth/3);
            let textBgHeight = Math.floor(textHeight*1.5);
            let textPad = Math.floor(textHeight/4);
              //structure our images in a nice way
              let image = {
              img: res.url,
              public_id: res.public_id,
              tags: res.tags,
              split: res.split[0],
              split1: res.split[1],
              logo: viewData.logo,
              textHeight: textHeight,
              textBgHeight: textBgHeight,
              textPad: textPad,
              textColour: viewData.textColour,
              textBgColour: viewData.textBgColour,
              logoWidth: logoWidth,
              width: res.width

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
          let updatedAlbum;
          
          if (logoImage){
            //this if statement was needed as the app crashed after a delete all was triggered and logoImage was undefined
          updatedAlbum = formattedImages.map((image) => {
            image.logo = logoImage.public_id
            return image
          })
          viewData.album.image = updatedAlbum
          }
          else{
            
            updatedAlbum = formattedImages
            
            viewData.album.image = updatedAlbum

          }
          if (updatedAlbum){
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
          }
          console.log("All Images... ");  
          // console.log(updatedAlbum);  
          console.log("current user logo is at");  
          console.log(viewData.logo);
          // console.log(viewData.transition);

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
  
    addMessage(request, response) {
      
      const loggedInUser = accounts.getCurrentUser(request);
      let message = (request.body.message);
      let messageFont = (request.body.font);
      let messageColour = (request.body.colour);

      loggedInUser.message = message;
      loggedInUser.messageColour = messageColour;
      loggedInUser.messageFont = messageFont;

      logger.info('changing user message to : ' + message)
      console.log(loggedInUser);
      // userStore.addMessage(message, loggedInUser.id);
      response.redirect('/dashboard');
 
  },
    
  
    addTag(request, response) {
      
      const loggedInUser = accounts.getCurrentUser(request);
            logger.info('uploading tag ' + request.body.tag + ' to picture ' +  request.body.img)

      const id = path.parse(request.body.img);
      cloudinary.v2.uploader.add_tag(request.body.tag, id.name, function(res) { 
      logger.info('added tag ' + request.body.tag + ' to image', res) });
      response.redirect('/dashboard');
    
  },

    deleteAllPictures(request, response) {
      const loggedInUser = accounts.getCurrentUser(request);
      pictureStore.deleteAllPictures(loggedInUser.id, response);
      loggedInUser.message = "";
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