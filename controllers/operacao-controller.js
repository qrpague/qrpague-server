'use strict';
let QRCode = require("qrcode");
let Validador = require('boleto-brasileiro-validator');

let qrPagModel = require( global.pathRootApp + "/models/qrpague-model");
let logger = require( global.pathRootApp + "/lib/logger");
let Error = require( global.pathRootApp + '/error')
let Config  = require( global.pathRootApp + '/config')
let CallBackServices  = require( global.pathRootApp + '/services/callback')


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

	recuperar: async function (req, res, next) {

		let lista = await qrPagModel.recuperarOperacoes()

		res.setHeader('Content-Type', ['application/json']);
		res.status(200).send(lista);
	},

	consultar: async function (req, res, next) {


		try {
 
			let acceptType = req.headers['accept']
			let headers = req.headers['user-agent']


			console.info( acceptType )
			console.info( headers )

			var uuid = req.params.uuid;
			let operacao = await qrPagModel.consultarOperacao(uuid);
			if (!operacao) {
				return res.status(401).send({});
			}

 			
			if ( header &&  headers.indexOf('WhatsApp') != -1 ) {
				res.setHeader('Content-Type', 'application/xhtml+xml');


				let fs = require("fs")

				let urlOperacao = Config.PROTOCOL + '://' + Config.HOST + ':' + Config.HTTP_PORT +  req.originalUrl
	 
				let content = fs.readFileSync( global.pathRootApp + '/templates/shareLink.html', "utf8")
	
				// let qrcodeImage = await QRCode.toDataURL( JSON.stringify( operacao ) )
	
				let tipo = 'PAGAMENTOS'
				let descricao = 'Tíquete de pagamento'
				switch( operacao.tipoOperacao ) {
					case 'PAGAMENTO':
					 tipo = 'Pagamento de título.'; 
					 descricao = 'Tíquete de pagamento no valor de R$ ';  
					 break
					case 'CONVENIO': 
					tipo = 'Pagamento de convênio.';  
					descricao = 'Tíquete de pagamento no valor de R$ ';  
					break
					case 'BOLETO-BANCARIO': 
					tipo = 'Transferencia digital.';  
					descricao = 'Tíquete de transferência no valor de R$ ';  
					break
					case 'TRANSFERENCIA': 
					tipo = 'Transferência digital.';  
					descricao = 'Tíquete de transferência no valor de R$ ';  
					break
				}

				content = content.replaceAll( '$TITLE$' , ' ' + tipo  )
				content = content.replaceAll( '$URL$' , urlOperacao )
 				content = content.replaceAll( '$DESCRIPTION$' , descricao + operacao.valor )
				content = content.replaceAll( '$URL_IMAGE$' , 'https://avatars1.githubusercontent.com/u/43270555?s=460&v=4' )
				content = content.replaceAll( '$TYPE$' , 'website' )

				operacao = content

			}else{
				res.setHeader('Content-Type', 'application/qrpague');
			} 

			console.info( operacao )
			return res.status(200).send(operacao);

		} catch (error) {
			next(error)
		}
	},

	autorizar: async function (req, res, next) {

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

	receber: async function (req, res, next) {

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