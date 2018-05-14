imgResult.split = imgResult.url.split("upload");
viewData.endCardUrl = imgResult.split[0] + "upload/w_" + 
imgResult.width + ',l_text:' + viewData.user.messageFont + "_" + 
viewData.user.messageHeight + "_bold_italic:" + 
viewData.user.message + ",co_" + viewData.user.messageColour +
",g_south,y_" + viewData.user.messageHeight + ",a_-5" + 
imgResult.split[1]
 console.log('End card at ' + viewData.endCardUrl);