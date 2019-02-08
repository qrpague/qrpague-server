'use strict'
let Api  = require('/tools/request-api')
 
module.exports = {

    request : function ( urlPath , notificacao ) {

         let options = {
            method: 'POST',
            uri: urlPath,
            body: notificacao,
            headers:{
                 'Content-Type' : 'application/json'
            },
            json: true
         };

        return Api.request(options) 

    }

 

}