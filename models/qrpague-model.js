'use strict';


let monk  = require( 'monk')
let cfg  = require( global.pathRootApp + '/config')

const db = monk(cfg.URL_DATABASE)
const listaOperacoes = db.get('tabOperacoes')

module.exports = {

	incluirOperacao: function (obj) {

		delete obj.versao;

		return listaOperacoes.insert(obj, function (e, operacao) {
			return Promise.resolve(obj._id);
		});
	},

	recuperarOperacoes: function () {
		return listaOperacoes.find({}, function (e, operacoes) {
			return Promise.resolve(operacoes);
		});
	},

	consultarOperacao: function ( uuid ) {
		return listaOperacoes.findOne({ _id: monk.id( uuid ) }, function (e, operacao) {
			return Promise.resolve(operacao);
		});
	},

	autorizarOperacao: function (uuid, dados) {
		var aut = (dados.operacaoAutorizada) ? 'AUTORIZADO' : 'CANCELADO';

		return listaOperacoes.update({ _id: monk.id( uuid ) }, { $set: { 'situacao': aut, 'autorizacaoOperacao': dados } }, function (e, operacao) {
			return Promise.resolve(operacao);
		});
	},

	confirmarOperacao: function (uuid, dados) {
		var aut = (dados.operacaoConfirmada) ? 'CONFIRMADO' : 'CANCELADO';

		return listaOperacoes.update({ _id: monk.id( uuid ) }, { $set: { 'situacao': aut, 'confirmacaoOperacao': dados } }, function (e, operacao) {
			return Promise.resolve(operacao);
		});
	}
};




