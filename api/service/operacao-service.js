const QRCode = require('qrcode');
const Validador = require('boleto-brasileiro-validator');
const { Operacao } = require('../database/db');
const { APPLICATION_IMAGE } = require('../util/http/content-type');
const { Err, Request, Response, Logger } = require('../util');
const path = ('path');
const fs = require('fs');

const MONGO = {
	ERROR_NAME: 'MongoError',
	DUPLICATE_KEY_CODE: 11000
}

const criarOperacao = async ({ contentType, operacaoFinanceira }) => {
	try {
		let resultado = await Operacao.incluirOperacao(operacaoFinanceira);
		let resposta;
		if (contentType === APPLICATION_IMAGE) {
			resposta = await QRCode.toDataURL(JSON.stringify(operacaoFinanceira));
		} else {
			resposta = process.env.QRPAGUE_URL + '/' + resultado.uuid
		}
		return resposta;
	} catch(err) {
		Logger.warn(err);
		if(err.name === MONGO.ERROR_NAME && err.code === MONGO.DUPLICATE_KEY_CODE) {
			if(err.keyPattern.uuid === 1){
				Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 1000, 2, operacaoFinanceira);
			} else if(err.keyPattern.idRequisicao === 1){
				Err.throwError(Response.HTTP_STATUS.UNPROCESSABLE, 1000, 3, operacaoFinanceira);
			}
		}
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 1000, 1, operacaoFinanceira);
	}
}

const consultarOperacoes = async ({ cnpjInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
	let options = { cnpjInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }
	let resposta = await Operacao.recuperarOperacoes(options);
	return resposta;
}

const consultarOperacao = async function ({ uuid, cnpjInstituicao, userAgent, isWhatsApp }) {

	let operacao = await Operacao.consultarOperacao(uuid);

	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 1, { uuid });
	}
	
	if ( isWhatsApp ) {
		let urlOperacao = process.env.SERVER_URL +  req.originalUrl
		let content = fs.readFileSync( path.join(__dirname, '../templates/shareLink.html'), "utf8")

		let tipo;
		let descricao;
		switch( operacao.tipoOperacao ) {
			case OPERACAO.TRANSFERENCIA: 
				tipo = 'Transferência digital.';  
				descricao = 'Tíquete de transferência no valor de R$ ';  
			break
		}

		content = content.replaceAll( '$TITLE$' , ' ' + tipo  )
		content = content.replaceAll( '$URL$' , urlOperacao )
		content = content.replaceAll( '$DESCRIPTION$' , descricao + operacao.valor )
		content = content.replaceAll( '$URL_IMAGE$' , 'https://avatars1.githubusercontent.com/u/43270555?s=460&v=4' )
		content = content.replaceAll( '$TYPE$' , 'website' )

		operacao = content;
	}

	return operacao;
}

const autorizarOperacao = async ({ uuid, autorizacao }) => {

	let operacao = await Operacao.consultarOperacao(uuid);

	if (!operacao) {
		// TODO: definir mensagem de exceção
		Err.throwError(401, 1000, 2);
		//return next('QRPAGUE_SERVER_AUTORIZAR-OPERACAO_UUID_INVALIDO')
	}

	let urlCallBack = operacao.callback
	if (!urlCallBack) {
		autorizacao.dispositivoConfirmacao = {}
	} else {
		const dispositivoConfirmacao = await Request.post(urlCallBack, operacao);
		autorizacao.dispositivoConfirmacao = dispositivoConfirmacao;

	}

	let aut = await Operacao.autorizarOperacao(uuid, autorizacao)
	let resposta = { sucessoOperacao: true, dataReferencia: new Date() }
	return resposta;
}

const confirmarOperacao = async ({ uuid, confirmacao }) => {
	const resposta = await Operacao.confirmarOperacao(uuid, confirmacao);
	let result = {
		sucessoOperacao: true,
		dataReferencia: new Date()
	}
	return result;
}

module.exports = {
	criarOperacao,
	consultarOperacoes,
	consultarOperacao,
	autorizarOperacao,
	confirmarOperacao
}