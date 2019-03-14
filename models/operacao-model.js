'use strict';


let monk = require('monk')
let cfg  = require('../config')

const db = monk(cfg.URL_DATABASE)
const tab = db.get('operacoes')

module.exports = {

	incluirOperacao: function (obj) {

		delete obj.versao;

		return tab.insert(obj, function (e, operacao) {
			return Promise.resolve(obj._id);
		});
	},
	recuperarOperacoes: function () {
		return tab.find({}, { limit : 20, sort : { dataHoraEfetivacao : -1 }} , function (e, operacoes) {
			return Promise.resolve(operacoes);
		});
	},

	consultarOperacao: function ( uuid ) {
		return tab.findOne({ _id: monk.id( uuid ) }, function (e, operacao) {
			return Promise.resolve(operacao);
		});
	},

	autorizarOperacao: function (uuid, dados) {
		var aut = (dados.operacaoAutorizada) ? 'AUTORIZADO' : 'CANCELADO';

		return tab.update({ _id: monk.id( uuid ) }, { $set: { 'situacao': aut, 'autorizacaoOperacao': dados } }, function (e, operacao) {
			return Promise.resolve(operacao);
		});
	},

	confirmarOperacao: function (uuid, dados) {
		var aut = (dados.operacaoConfirmada) ? 'CONFIRMADO' : 'CANCELADO';

		return tab.update({ _id: monk.id( uuid ) }, { $set: { 'situacao': aut, 'confirmacaoOperacao': dados } }, function (e, operacao) {
			return Promise.resolve(operacao);
		});
	}
};




