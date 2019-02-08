'use strict'


module.exports = {
    cors: function (req, res, next) {
 

        res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Credentials", "true");
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
		res.header("Access-Control-Max-Age", "3600");
		res.header("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me");

        next();
    }

}