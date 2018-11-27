'use strict'
import Api from '/tools/request-api'

module.exports = {

    takeReturn ( urlPath , notificacao ) {

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