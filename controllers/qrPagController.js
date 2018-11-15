'use strict';

var logger = require("../lib/logger.js");
var qrPagModel = require("../models/qrPagModel.js");
var QRCode = require("qrcode");
var Error = require( global.pathRootApp + '/error')
module.exports = function (app) {
	var qrPagController = {

		gerar: function (req, res) {
			var tipo = req.headers.accept;
			var end = req.headers.host;
			var operacaoFinanceira = JSON.parse(req.body);

			if(tipo == "*/*")
				tipo = "text/plain";

			if (operacaoFinanceira.versao == ''){
				Error.enviarErro("Versão da operação não informada");
				return;
			}

			if (operacaoFinanceira.cnpjInstituicao == ''){
				Error.enviarErro("CNPJ da instituição não informada");	
				return;
			}

			if (operacaoFinanceira.valor == null || operacaoFinanceira.valor == ""){
				Error.enviarErro("Valor da operação não informada");
				return;
			}

			if (operacaoFinanceira.dataHoraSolicitacao == ''){
				Error.enviarErro("Data/Hora da operação não informada");
				return;
			}

			if (operacaoFinanceira.situacao == ''){
				Error.enviarErro("Situação da operação não informada");
				return;
			}

			if (operacaoFinanceira.tipoOperacao == ''){
				Error.enviarErro("Tipo da operação não informada");
				return;
			}

			// VALIDAÇÃO TERMINAL	
			if (operacaoFinanceira.terminal == null || operacaoFinanceira.terminal == ''){
				Error.enviarErro("Terminal não informado");
				return;
			}

			if (operacaoFinanceira.terminal.idTerminal == ""){
				Error.enviarErro("Id do terminal não informado");
				return;
			}

			if (operacaoFinanceira.terminal.descricao == ""){
				Error.enviarErro("Descrição do terminal não informado");
				return;
			}

			if (operacaoFinanceira.terminal.uf == ""){
				Error.enviarErro("UF do terminal não informado");
				return;
			}

			if (operacaoFinanceira.terminal.cep == ""){
				Error.enviarErro("CEP do terminal não informado");
				return;
			}

			if (operacaoFinanceira.terminal.latitudeTerminal == ""){
				Error.enviarErro("Latitude do terminal não informado");
				return;
			}

			if (operacaoFinanceira.terminal.longitudeTerminal == ""){
				Error.enviarErro("Longitude do terminal não informado");
				return;
			}


			// VALIDAÇÃO BENEFICIARIO
			if (operacaoFinanceira.beneficiario == null){
				Error.enviarErro("Beneficiário não informado");
				return;
			}

			if (operacaoFinanceira.beneficiario.nome == ""){
				Error.enviarErro("Nome do beneficiário não informado");
				return;
			}

			if (operacaoFinanceira.beneficiario.cpfCnpj == ""){
				Error.enviarErro("CPF/CNPJ do beneficiário não informado");
				return;
			}

			if (operacaoFinanceira.beneficiario.instituicao == ""){
				Error.enviarErro("Instituição do beneficiário não informado");
				return;
			}


			qrPagModel.incluirOperacao(operacaoFinanceira).then(function (resp) {
				if (tipo == "text/plain"){
					res.setHeader('content-type', tipo);
					res.status(200).send(end + "/operacoes/" + resp._id);
				}
				else if (tipo.substr(0,5) == "image"){
					res.setHeader('content-type', tipo);

					QRCode.toDataURL(JSON.stringify(operacaoFinanceira), function (err, url) {
						res.status(200).send(url);
					})
				}
			});

		 
		},

		recuperarOperacoes: function (req, res) {
			qrPagModel.recuperarOperacoes().then(function (lista) {
				res.setHeader('content-type', 'application/qrpague');
				res.status(200).send(lista);
			});
		},

		consultarOperacao: function (req, res) {
			var uuid = req.params.uuid;

			qrPagModel.consultarOperacao(uuid).then(function (operacao) {
				res.setHeader('content-type', 'application/qrpague');
				res.status(200).send(operacao);
			});
		},

		autorizarOperacao: function (req, res) {

			var uuid = req.params.uuid;
			var autorizacao = JSON.parse(req.body);

			// VALIDAÇÃO OPERAÇÃO
			if (!autorizacao.hasOwnProperty('operacaoAutorizada')){
				Error.enviarErro("Operação da autorização não informada");
				return;
			}

			if (typeof (autorizacao.operacaoAutorizada) != "boolean") {
				Error.enviarErro("Operação da autorização com formato inválido");
				return;
			}

			if (autorizacao.dataHoraAutorizacao == ""){
				Error.enviarErro("Data/Hora da autorização não informada");
				return;
			}

			if (autorizacao.dispositivoConfirmacao == null || autorizacao.dispositivoConfirmacao == ''){
				Error.enviarErro("Dispositivo não informado");
				return;
			}

			if (autorizacao.dispositivoConfirmacao.idTerminal == ""){
				Error.enviarErro("Id do terminal não informado");
				return;
			}

			if (autorizacao.dispositivoConfirmacao.descricao == ""){
				Error.enviarErro("Descrição do terminal não informado");
				return;
			}

			if (autorizacao.dispositivoConfirmacao.uf == ""){
				Error.enviarErro("UF do terminal não informado");
				return;
			}

			if (autorizacao.dispositivoConfirmacao.cep == ""){
				Error.enviarErro("CEP do terminal não informado");
				return;
			}

			if (autorizacao.dispositivoConfirmacao.latitudeTerminal == ""){
				Error.enviarErro("Latitude do terminal não informado");
				return;
			}

			if (autorizacao.dispositivoConfirmacao.longitudeTerminal == ""){
				Error.enviarErro("Longitude do terminal não informado");
				return;
			}

			qrPagModel.autorizarOperacao(uuid, autorizacao).then(function (aut) {
				res.setHeader('content-type', 'application/qrpague');
				res.status(200).send({
					sucessoOperacao: true,
					dataReferencia: new Date()
				});
			});

			
		},

		receberConfirmacao: function (req, res) {

			var uuid = req.params.uuid;
			var confirmacao = JSON.parse(req.body);

			// VALIDAÇÃO OPERAÇÃO
			if (!confirmacao.hasOwnProperty('operacaoConfirmada')){
				Error.enviarErro("Operação da confirmação não informada");					
				return;
			}

			if (typeof (confirmacao.operacaoConfirmada) != "boolean") {
				Error.enviarErro("Operação da confirmação com formato inválido");	
				return;
			}

			if (!confirmacao.hasOwnProperty('dataHoraConfirmacao') || confirmacao.dataHoraConfirmacao == ""){
				Error.enviarErro("Data/Hora da confirmação não informada");	
				return;
			}				

			if (confirmacao.dispositivoConfirmacao == null || confirmacao.dispositivoConfirmacao == ''){
				Error.enviarErro("Dispositivo não informado");	
				return;
			}

			if (confirmacao.dispositivoConfirmacao.idTerminal == ""){
				Error.enviarErro("Id do terminal não informado");					
				return;
			}

			if (confirmacao.dispositivoConfirmacao.descricao == ""){
				Error.enviarErro("Descrição do terminal não informado");	
				return;
			}				

			if (confirmacao.dispositivoConfirmacao.uf == ""){
				Error.enviarErro("UF do terminal não informado");	
				return;
			}

			if (confirmacao.dispositivoConfirmacao.cep == ""){
				Error.enviarErro("CEP do terminal não informado");	
				return;
			}

			if (confirmacao.dispositivoConfirmacao.latitudeTerminal == ""){
				Error.enviarErro("Latitude do terminal não informado");				
				return;
			}

			if (confirmacao.dispositivoConfirmacao.longitudeTerminal == ""){
				Error.enviarErro("Longitude do terminal não informado");
				return;
			}


			qrPagModel.confirmarOperacao(uuid, confirmacao).then(function (conf) {
				res.setHeader('content-type', 'application/qrpague');
				res.status(200).send({
					sucessoOperacao: true,
					dataReferencia: new Date()
				});
			});

			 
		},

		retornaCodigoBarra: function (req, res) {
			var codigoBarras = req.params.codigoBarras;

			if (codigoBarras == ""){
				Error.enviarErro("Código de barras não informado");		
				return;
			}			

			if (codigoBarras.length != 44){
				Error.enviarErro("Formato do código de barras não informado");	
				return;
			}
			
			res.setHeader('content-type', 'application/qrpague');
			res.status(200).send({"codigoBarras":codigoBarras});
		}
	};
	return qrPagController;

}
