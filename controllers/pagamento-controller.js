'use strict';

import qrPagModel from "models/qrpague-model";
import Error from 'error';
import Config from 'config'
import CallBackServices from 'services/callback'

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

