const QRCode = require('qrcode');
const Validador = require('boleto-brasileiro-validator');
const { Operacao } = require('../database/db');
const { APPLICATION_IMAGE } = require('../enum/content-type');
const { Err, Request, Response, Logger } = require('../util');
const path = ('path');
const fs = require('fs');

const criarOperacao = async ({ tipo, operacaoFinanceira }) => {
	let resultado;
	try {
		resultado = await Operacao.incluirOperacao(operacaoFinanceira);
	} catch(err) {
		Logger.warn(err);
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 1000, 1);
	}

	let resposta;
	if (tipo == APPLICATION_IMAGE) {
		resposta = await QRCode.toDataURL(JSON.stringify(operacaoFinanceira));
	} else {
		resposta = process.env.QRPAGUE_URL + '/' + resultado._id
	}
	return resposta;
}

const consultarOperacoes = async ({ cnpjInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
	let options = { 
		cnpjInstituicao,
		cpfCnpjBeneficiario,
		paginaInicial,
		tamanhoPagina,
		periodoInicio,
		periodoFim
	}
	let resposta = await Operacao.recuperarOperacoes(options)
	return resposta;
}

const consultarOperacao = async function ({ uuid, cnpjInstituicao, userAgent, isWhatsApp }) {

	let operacao = await Operacao.consultarOperacao(uuid);

	if (!operacao) {
		// TODO: definir mensagem de exceção
		Err.throwError(401, 1000, 1);
	}

	
	if ( !isWhatsApp ) {
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