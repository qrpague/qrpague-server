const QRCode = require('qrcode');
const Validador = require('boleto-brasileiro-validator');
const { Operacao } = require('../database/db');
const { APPLICATION_IMAGE } = require('../util/http/content-type');
const { Err, Request, Response, Logger, YAMLReader } = require('../util');
const { Instituicao } = require('../regras');
const path = ('path');
const fs = require('fs');

const QRPAGUE_URL = process.env.QRPAGUE_URL;
const SERVER_URL = process.env.SERVER_URL;
const WHATSAPP_IMAGE_URL = process.env.WHATSAPP_IMAGE_URL;
const WHATSAPP_TEMPLATE_FILE = process.env.WHATSAPP_TEMPLATE_FILE;

const MONGO = { ERROR_NAME: 'MongoError', DUPLICATE_KEY_CODE: 11000 }

const criarOperacao = async ({ contentType, operacaoFinanceira }) => {
	try {
		const resultado = await Operacao.incluirOperacao(operacaoFinanceira);
		let resposta;
		if (contentType === APPLICATION_IMAGE) {
			resposta = await QRCode.toDataURL(JSON.stringify(operacaoFinanceira));
		} else {
			resposta = QRPAGUE_URL + '/' + resultado.uuid
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

const consultarOperacoes = async ({ idRequisicao, cnpjInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
	const options = {
		cnpjInstituicao,
		cpfCnpjBeneficiario,
		idRequisicao,
		paginaInicial,
		tamanhoPagina,
		periodoInicio,
		periodoFim
	}
	const resposta = await Operacao.recuperarOperacoes(options);
	return resposta;
}

const consultarOperacao = async ({  uuid, cnpjInstituicao, originalUrl, userAgent, isWhatsApp }) => {

	const instituicaoSolicitante = Instituicao.buscar(cnpjInstituicao);
	if(!instituicaoSolicitante) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 2, { cnpj: cnpjInstituicao });
	}

	let operacao = await Operacao.consultarOperacao(uuid);
	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 1, { uuid });
	}
	if (isWhatsApp) {
		operacao = buildWhatsappContent({ operacao, originalUrl })
	}
	return operacao;
}

const autorizarOperacao = async ({ uuid, autorizacao }) => {
	const operacao = await Operacao.consultarOperacao(uuid);
	if (!operacao) {
		Err.throwError(Response.HTTP_STATUS.BAD_REQUEST, 2000, 1, { uuid });
	}
	const urlCallBack = operacao.callback;
	if (!urlCallBack) {
		autorizacao.dispositivoConfirmacao = {}
	} else {
		const dispositivoConfirmacao = await Request.post(urlCallBack, operacao);
		autorizacao.dispositivoConfirmacao = dispositivoConfirmacao;
	}
	await Operacao.autorizarOperacao(uuid, autorizacao);
	let resposta = { sucessoOperacao: true, dataReferencia: new Date() }
	return resposta;
}

const confirmarOperacao = async ({ uuid, confirmacao }) => {
	const resposta = await Operacao.confirmarOperacao(uuid, confirmacao);
	const result = { sucessoOperacao: true, dataReferencia: new Date() }
	return result;
}

const buildWhatsappContent = ({ operacao, originalUrl }) => {
	const urlOperacao = SERVER_URL + originalUrl;
	const whatsappLink = WHATSAPP_TEMPLATE_FILE;
	const type = 'website';
	let content = fs.readFileSync(whatsappLink , "utf8");
	let tipo;
	let descricao;
	switch( operacao.tipoOperacao ) {
		case OPERACAO.TRANSFERENCIA: 
			tipo = 'Transferência digital.';  
			descricao = `Tíquete de transferência no valor de R$ ${operacao.valor}`;
		break
	}
	content = content.replaceAll( '$TITLE$' , ' ' + tipo  )
	content = content.replaceAll( '$URL$' , urlOperacao )
	content = content.replaceAll( '$DESCRIPTION$' , descricao )
	content = content.replaceAll( '$URL_IMAGE$' , WHATSAPP_IMAGE_URL )
	content = content.replaceAll( '$TYPE$' , type )
	return content;
}

module.exports = {
	criarOperacao,
	consultarOperacoes,
	consultarOperacao,
	autorizarOperacao,
	confirmarOperacao
}