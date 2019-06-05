const QRCode = require("qrcode");
const Validador = require('boleto-brasileiro-validator');
const Operacao = require("../database/model/operacao");
const { APPLICATION_IMAGE } = require('../enum/content-type');


const gerar = async ({ tipo, operacaoFinanceira }) => {
	
	let resposta;

	validarOperacao(operacaoFinanceira)

	let resultado = await Operacao.incluirOperacao(operacaoFinanceira);

	if (tipo == APPLICATION_IMAGE) {
		resposta = await QRCode.toDataURL(JSON.stringify(operacaoFinanceira));
	} else {
		resposta = Config.PROTOCOL + '://' + Config.QRPAGUE_URL_QRCODE_CREATE + resultado._id
	}

	return res.status(200).send(resposta);
}

const recuperar = async (req, res, next) => {

	let lista = await qrPagModel.recuperarOperacoes()

	res.setHeader('Content-Type', ['application/json']);
	res.status(200).send(lista);
}

const consultar = async function (req, res, next) {


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

		
		if ( headers &&  headers.indexOf('WhatsApp') != -1 ) {
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
}

const autorizar = async (req, res, next) => {

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


}

const receber = async (req, res, next) => {

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


}

module.exports = {
	gerar
}