'use strict'
let Api  = require('/tools/request-api')
 
module.exports = {

    request : function ( urlPath  ) {
        

         let options = {
            method: 'GET',
            uri: urlPath,
             headers:{
                 'Content-Type' : 'application/json'
            },
            json: true
         };

        return Api.request(options) 

    }

 

}