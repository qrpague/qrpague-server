'use strict';

var logger = require("../lib/logger.js");
var qrPagModel = require("../models/qrPagModel.js");
var QRCode = require("qrcode");
var Error = require( global.pathRootApp + '/error')

// var boletoValidator = require('boleto-validator/promise');
var Validador = require('boleto-brasileiro-validator');



module.exports = function (app) {
	var qrPagController = {

		gerar: function (req, res, next ) {
			var tipo = req.headers.accept;
			var end = req.headers.host;
			var operacaoFinanceira =  req.body 

			if(tipo == "*/*")
				tipo = "text/plain";

			if (operacaoFinanceira.versao == ''){
				return next( Error("Versão da operação não informada"));
				
			}

			if (operacaoFinanceira.cnpjInstituicao == ''){
				return next( Error("CNPJ da instituição não informada"));	
				
			}

			if (operacaoFinanceira.valor == null || operacaoFinanceira.valor == ""){
				return next( Error("Valor da operação não informada"));
				
			}

			if (operacaoFinanceira.dataHoraSolicitacao == ''){
				return next( Error("Data/Hora da operação não informada"));
				
			}

			if (operacaoFinanceira.situacao == ''){
				return next( Error("Situação da operação não informada"));
				
			}

			if (operacaoFinanceira.tipoOperacao == ''){
				return next( Error("Tipo da operação não informada"));
				
			}

			// VALIDAÇÃO TERMINAL	
			if (operacaoFinanceira.terminal == null || operacaoFinanceira.terminal == ''){
				return next( Error("Terminal não informado"));
				
			}

			if (operacaoFinanceira.terminal.idTerminal == ""){
				return next( Error("Id do terminal não informado"));
				
			}

			if (operacaoFinanceira.terminal.descricao == ""){
				return next( Error("Descrição do terminal não informado"));
				
			}

			if (operacaoFinanceira.terminal.uf == ""){
				return next( Error("UF do terminal não informado"));
				
			}

			if (operacaoFinanceira.terminal.cep == ""){
				return next( Error("CEP do terminal não informado"));
				
			}

			if (operacaoFinanceira.terminal.latitudeTerminal == ""){
				return next( Error("Latitude do terminal não informado"));
				
			}

			if (operacaoFinanceira.terminal.longitudeTerminal == ""){
				return next( Error("Longitude do terminal não informado"));
				
			}


			// VALIDAÇÃO BENEFICIARIO
			if (operacaoFinanceira.beneficiario == null){
				return next( Error("Beneficiário não informado"));
				
			}

			if (operacaoFinanceira.beneficiario.nome == ""){
				return next( Error("Nome do beneficiário não informado"));
				
			}

			if (operacaoFinanceira.beneficiario.cpfCnpj == ""){
				return next( Error("CPF/CNPJ do beneficiário não informado"));
				
			}

			if (operacaoFinanceira.beneficiario.instituicao == ""){
				return next( Error("Instituição do beneficiário não informado"));
				
			}


			qrPagModel.incluirOperacao(operacaoFinanceira).then(function (resp) {
				if (tipo == "text/plain"){
					res.setHeader('Content-Type', tipo);
					res.status(200).send(end + "/operacoes/" + resp._id);
				}
				else if (tipo.substr(0,5) == "image"){
					res.setHeader('Content-Type', tipo);

					QRCode.toDataURL(JSON.stringify(operacaoFinanceira), function (err, url) {
						res.status(200).send(url);
					})
				}
			});

		 
		},

		recuperarOperacoes: function (req, res, next ) {
			qrPagModel.recuperarOperacoes().then(function (lista) {
				res.setHeader('Content-Type', ['application/json' ]);
				res.status(200).send(lista);
			});
		},

		consultarOperacao: function (req, res, next ) {
			var uuid = req.params.uuid;

			qrPagModel.consultarOperacao(uuid).then(function (operacao) {
				res.setHeader('Content-Type','application/qrpague');
				res.status(200).send(operacao);
			});
		},

		autorizarOperacao: function (req, res, next ) {

			var uuid = req.params.uuid;
			var autorizacao = JSON.parse(req.body);

			// VALIDAÇÃO OPERAÇÃO
			if (!autorizacao.hasOwnProperty('operacaoAutorizada')){
				return next( Error("Operação da autorização não informada"));
				
			}

			if (typeof (autorizacao.operacaoAutorizada) != "boolean") {
				return next( Error("Operação da autorização com formato inválido"));
				
			}

			if (autorizacao.dataHoraAutorizacao == ""){
				return next( Error("Data/Hora da autorização não informada"));
				
			}

			if (autorizacao.dispositivoConfirmacao == null || autorizacao.dispositivoConfirmacao == ''){
				return next( Error("Dispositivo não informado"));
				
			}

			if (autorizacao.dispositivoConfirmacao.idTerminal == ""){
				return next( Error("Id do terminal não informado"));
				
			}

			if (autorizacao.dispositivoConfirmacao.descricao == ""){
				return next( Error("Descrição do terminal não informado"));
				
			}

			if (autorizacao.dispositivoConfirmacao.uf == ""){
				return next( Error("UF do terminal não informado"));
				
			}

			if (autorizacao.dispositivoConfirmacao.cep == ""){
				return next( Error("CEP do terminal não informado"));
				
			}

			if (autorizacao.dispositivoConfirmacao.latitudeTerminal == ""){
				return next( Error("Latitude do terminal não informado"));
				
			}

			if (autorizacao.dispositivoConfirmacao.longitudeTerminal == ""){
				return next( Error("Longitude do terminal não informado"));
				
			}

			qrPagModel.autorizarOperacao(uuid, autorizacao).then(function (aut) {
				res.setHeader('Content-Type','application/qrpague');
				res.status(200).send({
					sucessoOperacao: true,
					dataReferencia: new Date()
				});
			});

			
		},

		receberConfirmacao: function (req, res, next ) {

			var uuid = req.params.uuid;
			var confirmacao = JSON.parse(req.body);

			// VALIDAÇÃO OPERAÇÃO
			if (!confirmacao.hasOwnProperty('operacaoConfirmada')){
				return next( Error("Operação da confirmação não informada"));					
				
			}

			if (typeof (confirmacao.operacaoConfirmada) != "boolean") {
				return next( Error("Operação da confirmação com formato inválido"));	
				
			}

			if (!confirmacao.hasOwnProperty('dataHoraConfirmacao') || confirmacao.dataHoraConfirmacao == ""){
				return next( Error("Data/Hora da confirmação não informada"));	
				
			}				

			if (confirmacao.dispositivoConfirmacao == null || confirmacao.dispositivoConfirmacao == ''){
				return next( Error("Dispositivo não informado"));	
				
			}

			if (confirmacao.dispositivoConfirmacao.idTerminal == ""){
				return next( Error("Id do terminal não informado"));					
				
			}

			if (confirmacao.dispositivoConfirmacao.descricao == ""){
				return next( Error("Descrição do terminal não informado"));	
				
			}				

			if (confirmacao.dispositivoConfirmacao.uf == ""){
				return next( Error("UF do terminal não informado"));	
				
			}

			if (confirmacao.dispositivoConfirmacao.cep == ""){
				return next( Error("CEP do terminal não informado"));	
				
			}

			if (confirmacao.dispositivoConfirmacao.latitudeTerminal == ""){
				return next( Error("Latitude do terminal não informado"));				
				
			}

			if (confirmacao.dispositivoConfirmacao.longitudeTerminal == ""){
				return next( Error("Longitude do terminal não informado"));
				
			}


			qrPagModel.confirmarOperacao(uuid, confirmacao).then(function (conf) {
				res.setHeader('Content-Type', ['application/qrpague' ]);
				res.status(200).send({
					sucessoOperacao: true,
					dataReferencia: new Date()
				});
			});

			 
		},

		retornaCodigoBarra: async function (req, res, next ) {
			var codigoBarras = req.params.codigoBarras;
			let tipoBoleto = null 
			if (codigoBarras == ""){
				return next( Error("Código de barras não informado"));		
				
			}	
			try {
				if( Validador.boletoBancario( codigoBarras ) ) {
					tipoBoleto = "BOLETO-BANCARIO"
				} else if( Validador.boletoArrecadacao( codigoBarras ) ) {
					tipoBoleto = "CONVENIO"
				} else if( Validador.boletoBancarioLinhaDigitavel( codigoBarras ) ) {
					tipoBoleto = "BOLETO-BANCARIO"
				} else if( Validador.boletoArrecadacaoLinhaDigitavel( codigoBarras ) ) {
					tipoBoleto = "CONVENIO"
				} 
			}catch( erro ) {
				console.log( erro)
			}	
			 
 
			res.setHeader('Content-Type','application/qrpague');
			res.status(200).send({"codigoBarras":codigoBarras , lenght : codigoBarras.length , tipoOperacao : tipoBoleto });
		}
	};
	return qrPagController;

}
