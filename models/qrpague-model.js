'use strict';

var logger = require('../lib/logger.js'),
	mongo = require('mongodb'),
	monk = require('monk'),
	cfg = require('../config'),
	Promise = require('promise'),
	db = monk(cfg.URL_DATABASE),
	listaOperacoes = db.get('tabOperacoes')

var modelo = module.exports = function (app) { };

modelo.incluirOperacao = function (obj) {

	delete obj.versao;

	return listaOperacoes.insert(obj, function (e, operacao) {
		return Promise.resolve(obj._id);
	});
};

modelo.recuperarOperacoes = function () {
	return listaOperacoes.find({}, function (e, operacoes) {
		return Promise.resolve(operacoes);
	});
};

modelo.consultarOperacao = function (uuid) {
	return listaOperacoes.findOne({_id:uuid}, function (e, operacao) {
		return Promise.resolve(operacao);
	});
};

modelo.autorizarOperacao = function (uuid, dados) {
	var aut = (dados.operacaoAutorizada)?'AUTORIZADO':'CANCELADO';

	return listaOperacoes.update({_id:uuid}, {$set:{'situacao':aut, 'autorizacaoOperacao':dados}}, function (e, operacao) {
		return Promise.resolve(operacao);
	});
};

modelo.confirmarOperacao = function (uuid, dados) {
	var aut = (dados.operacaoConfirmada)?'CONFIRMADO':'CANCELADO';

	return listaOperacoes.update({_id:uuid}, {$set:{'situacao':aut, 'confirmacaoOperacao':dados}}, function (e, operacao) {
		return Promise.resolve(operacao);
	});
};


