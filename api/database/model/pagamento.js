const uuidv4 = require('uuid/v4');
const { Err, Logger } = require('../../util');
const { Pagamento, SITUACAO } = require('../schema/pagamento');
const { Operacao } = require('../db');

const DEFAULT_MONGOOSE_LIMIT = 30;
const DEFAULT_MONGOOSE_SKIP = 0;

module.exports = (db, mongoose, promise) => {

    let Schema = mongoose.Schema;
    let pagamentoSchema = new Schema(Pagamento, { collection: 'Pagamento' });
    let PagamentoModel = db.model('Pagamento', pagamentoSchema);

    PagamentoModel.SITUACAO = SITUACAO;

    PagamentoModel.incluirPagamento = async (pag, operacao) => {
        Logger.debug('Inclusão de Pagamento');
        
        pag.uuid = uuidv4();
        pag.dataHoraPagamento = new Date();
        pag.situacao = SITUACAO.REALIZADO;

        let session;
        try {
            session = await db.startSession();
            session.startTransaction();
            let pagamento = new PagamentoModel(pag);
            await pagamento.save();
            await session.commitTransaction();
            return PagamentoModel.findOne({ uuid: pag.uuid })
        } catch(err) {
            Logger.warn(err);
            session.abortTransaction();
            throw err;
        }
    },

	PagamentoModel.recuperarOperacoes = async ({ idRequisicao, cnpjInstituicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
        Logger.debug('Consulta de Operações Financeiras');

        let query = {}
        if(cnpjInstituicao){
            query = { ...query, cnpjInstituicao: cnpjInstituicao }
        }
        if(idRequisicao){
            query = { ...query, idRequisicao: idRequisicao }
        }
        if(idRequisicao){
            query = { ...query, idRequisicao: idRequisicao }
        }
        if(periodoInicio){
            query = { ...query, dataHoraSolicitacao: { ...query.dataHoraSolicitacao, $gte: periodoInicio } }
        }
        if(periodoFim){
            query = { ...query, dataHoraSolicitacao: { ...query.dataHoraSolicitacao, $lte: periodoFim } }
        }

        const limit = tamanhoPagina ? tamanhoPagina : DEFAULT_MONGOOSE_LIMIT;
        const skip = paginaInicial ? paginaInicial * limit : DEFAULT_MONGOOSE_SKIP;
        const opt = { skip, limit }
        return await PagamentoModel.find(query, null, opt);
	},

	PagamentoModel.consultarPagamento = async ( uuid ) => {
        Logger.debug('Consulta da Operação de uuid');

        return await PagamentoModel.findOne({ uuid });
	},

	PagamentoModel.confirmarPagamento = async (uuid, confirmacaoPagamento) => {
        Logger.debug('Confirmação da Operação de uuid');

        const situacao = (confirmacaoPagamento.operacaoConfirmada) ? SITUACAO.CONFIRMADO : SITUACAO.CANCELADO;
        return await PagamentoModel.findOneAndUpdate({ uuid }, { situacao, confirmacaoPagamento });
	}

    return PagamentoModel;
}