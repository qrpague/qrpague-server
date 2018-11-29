'use strict';

var logger = require("../lib/logger.js");
var qrPagModel = require("../models/qrpague-model.js");
var QRCode = require("qrcode");
var Error = require('../error')
var Validador = require('boleto-brasileiro-validator');
import Config from 'config'
import CallBackServices from 'services/callback'


module.exports = {

	gerar: async function (req, res, next) {


		try {
			var tipo = req.headers.accept;
			var operacaoFinanceira = req.body


			validarOperacao(operacaoFinanceira, next)

			let resp = await qrPagModel.incluirOperacao(operacaoFinanceira);
			if (tipo == "application/image") {

				QRCode.toDataURL(JSON.stringify(operacaoFinanceira), function (err, url) {
					res.status(200).send(url);
				})
			}
			let resposta = Config.PROTOCOL + '://' + Config.QRPAGUE_URL_QRCODE_CREATE + resp._id

			return res.status(200).send(resposta);

		} catch (error) {
			next(error)
		}




	},

	recuperarOperacoes: async function (req, res, next) {

		let lista = await qrPagModel.recuperarOperacoes()

		res.setHeader('Content-Type', ['application/json']);
		res.status(200).send(lista);
	},

	consultarOperacao: async function (req, res, next) {


		try {
			
 		   
			let acceptType = req.headers['accept']
			var uuid = req.params.uuid;
			let operacao = await qrPagModel.consultarOperacao(uuid);
			if (!operacao) {
				return res.status(401).send({});
			}

			
			if ( acceptType.indexOf('application/xhtml+xml') != -1 ) {
				res.setHeader('Content-Type', 'application/xhtml+xml');


				let fs = require("fs")

				let urlOperacao = Config.PROTOCOL + '://' + Config.HTTP_HOST + ':' + Config.HTTP_PORT +  req.originalUrl
	 
				let content = fs.readFileSync( global.pathRootApp + '/templates/shareLink.html', "utf8")
	
				// let qrcodeImage = await QRCode.toDataURL( JSON.stringify( operacao ) )
	
				content = content.replaceAll( '$TITLE$' , 'QRPAGUE - PAGAMENTO' )
				content = content.replaceAll( '$URL$' , urlOperacao )
				content = content.replaceAll( '$DESCRIPTION$' , operacao.descricao )
				content = content.replaceAll( '$URL_IMAGE$' , 'https://avatars1.githubusercontent.com/u/43270555?s=460&v=4' )
				content = content.replaceAll( '$TYPE$' , 'website' )

				operacao = content

			}else{
				res.setHeader('Content-Type', 'application/qrpague');
			} 

			
			return res.status(200).send(operacao);

		} catch (error) {
			next(error)
		}
	},

	autorizarOperacao: async function (req, res, next) {

		try {

			var uuid = req.params.uuid;
			var autorizacao = req.body

			// validarAutorizacao(autorizacao, next)


			//CALLBACK - CONSULTAR UUID 

			let operacao = await qrPagModel.consultarOperacao(uuid);

			if (!operacao) {
				return next('QRPAGUE_SERVER_AUTORIZAR-OPERACAO_UUID_INVALIDO')
			}

			let urlCallBack = operacao.callback

			if (!urlCallBack) {
				autorizacao.dispositivoConfirmacao = {}
			} else {

				let dispositivoConfirmacao = await CallBackServices.takeReturn(urlCallBack, operacao)

				autorizacao.dispositivoConfirmacao = dispositivoConfirmacao

			}


			let aut = await qrPagModel.autorizarOperacao(uuid, autorizacao)


			let resposta = { sucessoOperacao: true, dataReferencia: new Date() }

			res.setHeader('Content-Type', ['application/json']);

			return res.status(200).send(resposta);
		} catch (error) {
			next(error)
		}


	},

	receberConfirmacao: async function (req, res, next) {

		var uuid = req.params.uuid;
		var confirmacao = JSON.parse(req.body);

		// VALIDAÇÃO OPERAÇÃO
		if (!confirmacao.hasOwnProperty('operacaoConfirmada')) {
			return next(Error("Operação da confirmação não informada"));

		}

		if (typeof (confirmacao.operacaoConfirmada) != "boolean") {
			return next(Error("Operação da confirmação com formato inválido"));

		}

		if (!confirmacao.hasOwnProperty('dataHoraConfirmacao') || confirmacao.dataHoraConfirmacao == "") {
			return next(Error("Data/Hora da confirmação não informada"));

		}

		if (confirmacao.dispositivoConfirmacao == null || confirmacao.dispositivoConfirmacao == '') {
			return next(Error("Dispositivo não informado"));

		}

		if (confirmacao.dispositivoConfirmacao.idTerminal == "") {
			return next(Error("Id do terminal não informado"));

		}

		if (confirmacao.dispositivoConfirmacao.descricao == "") {
			return next(Error("Descrição do terminal não informado"));

		}

		if (confirmacao.dispositivoConfirmacao.uf == "") {
			return next(Error("UF do terminal não informado"));

		}

		if (confirmacao.dispositivoConfirmacao.cep == "") {
			return next(Error("CEP do terminal não informado"));

		}

		if (confirmacao.dispositivoConfirmacao.latitudeTerminal == "") {
			return next(Error("Latitude do terminal não informado"));

		}

		if (confirmacao.dispositivoConfirmacao.longitudeTerminal == "") {
			return next(Error("Longitude do terminal não informado"));

		}


		qrPagModel.confirmarOperacao(uuid, confirmacao).then(function (conf) {
			res.setHeader('Content-Type', ['application/qrpague']);
			res.status(200).send({
				sucessoOperacao: true,
				dataReferencia: new Date()
			});
		});


	},

	retornaCodigoBarra: async function (req, res, next) {
		var codigoBarras = req.params.codigoBarras;
		let tipoBoleto = null
		if (codigoBarras == "") {
			return next(Error("Código de barras não informado"));

		}
		try {
			if (Validador.boletoBancario(codigoBarras)) {
				tipoBoleto = "BOLETO-BANCARIO"
			} else if (Validador.boletoArrecadacao(codigoBarras)) {
				tipoBoleto = "CONVENIO"
			} else if (Validador.boletoBancarioLinhaDigitavel(codigoBarras)) {
				tipoBoleto = "BOLETO-BANCARIO"
			} else if (Validador.boletoArrecadacaoLinhaDigitavel(codigoBarras)) {
				tipoBoleto = "CONVENIO"
			}
		} catch (erro) {
			console.log(erro)
		}


		res.setHeader('Content-Type', 'application/qrpague');
		res.status(200).send({ "codigoBarras": codigoBarras, lenght: codigoBarras.length, tipoOperacao: tipoBoleto });
	}

}

function validarOperacao(operacaoFinanceira, next) {
	if (operacaoFinanceira.versao == '') {
		return next(Error("Versão da operação não informada"));

	}

	if (operacaoFinanceira.cnpjInstituicao == '') {
		return next(Error("CNPJ da instituição não informada"));

	}

	if (operacaoFinanceira.valor == null || operacaoFinanceira.valor == "") {
		return next(Error("Valor da operação não informada"));

	}

	if (operacaoFinanceira.dataHoraSolicitacao == '') {
		return next(Error("Data/Hora da operação não informada"));

	}

	if (operacaoFinanceira.situacao == '') {
		return next(Error("Situação da operação não informada"));

	}

	if (operacaoFinanceira.tipoOperacao == '') {
		return next(Error("Tipo da operação não informada"));

	}

	// VALIDAÇÃO TERMINAL	
	if (operacaoFinanceira.terminal == null || operacaoFinanceira.terminal == '') {
		return next(Error("Terminal não informado"));

	}

	if (operacaoFinanceira.terminal.idTerminal == "") {
		return next(Error("Id do terminal não informado"));

	}

	if (operacaoFinanceira.terminal.descricao == "") {
		return next(Error("Descrição do terminal não informado"));

	}

	if (operacaoFinanceira.terminal.uf == "") {
		return next(Error("UF do terminal não informado"));

	}

	if (operacaoFinanceira.terminal.cep == "") {
		return next(Error("CEP do terminal não informado"));

	}

	if (operacaoFinanceira.terminal.latitudeTerminal == "") {
		return next(Error("Latitude do terminal não informado"));

	}

	if (operacaoFinanceira.terminal.longitudeTerminal == "") {
		return next(Error("Longitude do terminal não informado"));

	}


	// VALIDAÇÃO BENEFICIARIO
	if (operacaoFinanceira.beneficiario == null) {
		return next(Error("Beneficiário não informado"));

	}

	if (operacaoFinanceira.beneficiario.nome == "") {
		return next(Error("Nome do beneficiário não informado"));

	}

	if (operacaoFinanceira.beneficiario.cpfCnpj == "") {
		return next(Error("CPF/CNPJ do beneficiário não informado"));

	}

	if (operacaoFinanceira.beneficiario.instituicao == "") {
		return next(Error("Instituição do beneficiário não informado"));

	}
}


function validarAutorizacao(autorizacao, next) {
	// VALIDAÇÃO OPERAÇÃO
	if (!autorizacao.hasOwnProperty('operacaoAutorizada')) {
		return next(Error("Operação da autorização não informada"));

	}

	if (typeof (autorizacao.operacaoAutorizada) != "boolean") {
		return next(Error("Operação da autorização com formato inválido"));

	}

	if (autorizacao.dataHoraAutorizacao == "") {
		return next(Error("Data/Hora da autorização não informada"));

	}

	if (autorizacao.dispositivoConfirmacao == null || autorizacao.dispositivoConfirmacao == '') {
		return next(Error("Dispositivo não informado"));

	}

	if (autorizacao.dispositivoConfirmacao.idTerminal == "") {
		return next(Error("Id do terminal não informado"));

	}

	if (autorizacao.dispositivoConfirmacao.descricao == "") {
		return next(Error("Descrição do terminal não informado"));

	}

	if (autorizacao.dispositivoConfirmacao.uf == "") {
		return next(Error("UF do terminal não informado"));

	}

	if (autorizacao.dispositivoConfirmacao.cep == "") {
		return next(Error("CEP do terminal não informado"));

	}

	if (autorizacao.dispositivoConfirmacao.latitudeTerminal == "") {
		return next(Error("Latitude do terminal não informado"));

	}

	if (autorizacao.dispositivoConfirmacao.longitudeTerminal == "") {
		return next(Error("Longitude do terminal não informado"));

	}
}