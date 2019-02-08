'use strict';


let monk = require('monk')
let cfg = require('../config')

const db = monk(cfg.URL_DATABASE)
const tab = db.get('operacoes')

module.exports = {

	register: async function (uuid, pagamento) {

		let reg = await tab.find({ _id: monk.id(uuid) })

		if (!reg) {
			return null
		}

		//TODO: verificar  se o id do pagamento ja foi utilizado.

		reg.pagamentos ? reg.pagamentos : reg.pagamentos = []
		reg.pagamentos.push(pagamento)

		return await tab.updateOne({ _id: monk.id(uuid) }, reg)
	},

	detail: async function (uuid ) {
		let operacao = await tab.findOne({ 'pagamentos.uuid' :  uuid  });
	},

	list: async function ( ) {
		return await tab.find({},{ pagamentos : 1  });
	},

};




