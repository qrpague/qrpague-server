'use strict';

let qrPagModel  = require( global.pathRootApp + "/models/qrpague-model");
let Error  = require( global.pathRootApp + '/error');
let Config  = require( global.pathRootApp + '/config')
let CallBackServices  = require( global.pathRootApp + '/services/callback')

/*
	Controlller  para gerencimar um pagamento atrelado ao uma operação previamente criada .
*/
module.exports = {

	register: async function (req, res, nexts) {
		try {


			return res.status(200).send(resposta);
		} catch (error) {
			next(error)
		}
	},
	list: async function (req, res, next) {
		try {


			return res.status(200).send(resposta);
		} catch (error) {
			next(error)
		}
	},

	detail: async function (req, res, next) {

		try {


			return res.status(200).send(resposta);
		} catch (error) {
			next(error)
		}


	},

	check: async function (req, res, next) {

		try {


			return res.status(200).send(resposta);
		} catch (error) {
			next(error)
		}

	},


}

