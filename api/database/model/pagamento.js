const { Err, Logger, Request } = require('../../util');
const { Pagamento, SITUACAO } = require('../schema/pagamento');
const { Operacao } = require('../db');

const DEFAULT_MONGOOSE_LIMIT = 30;
const DEFAULT_MONGOOSE_SKIP = 0;

module.exports = (db, mongoose, promise) => {

    let Schema = mongoose.Schema;
    let pagamentoSchema = new Schema(Pagamento, { 
        collection: 'Pagamento',
        toJSON: {
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.__v;
            }
        }
    });

    pagamentoSchema.methods.chamarCallbackURI = function() {

        const pagamentoCallbackURI = this.callbackURI +
                    '?tipo=pagamento' + 
                    '&uuidOperacao=' +
                    this.uuidOperacaoFinanceira +
                    '&uuidPagamento=' +
                    this.uuid +
                    '&situacao=' + 
                    this.situacao;
    
        Request.get(pagamentoCallbackURI);
    }

    let PagamentoModel = db.model('Pagamento', pagamentoSchema);

    PagamentoModel.SITUACAO = SITUACAO;

    PagamentoModel.incluirPagamento = async (pag, operacao) => {
        Logger.debug('Inclusão de Pagamento');

        pag.dataHoraPagamento = Date.now();
        pag.situacao = SITUACAO.REALIZADO;
        pag.uuidOperacaoFinanceira = operacao.uuid;
        pag.callbackURI = operacao.callbackURI;

        let session;
        try {
            session = await db.startSession();
            session.startTransaction();
            let pagamento = new PagamentoModel(pag);
            pagamento = await pagamento.save();
            operacao.pagamentos.push(pagamento._id);
            await operacao.save();
            await session.commitTransaction();
            return PagamentoModel.findOne({ uuid: pag.uuid });
        } catch(err) {
            Logger.warn(err);
            session.abortTransaction();
            throw err;
        }
    },

	PagamentoModel.recuperarOperacoes = async ({ idRequisicao, cnpjInstituicao, cpfCnpjPagador, uuidOperacaoFinanceira, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
        Logger.debug('Consulta de Pagamentos');

        let query = {}
        if(cnpjInstituicao){
            query = { ...query, cnpjInstituicao: cnpjInstituicao }
        }
        if(idRequisicao){
            query = { ...query, idRequisicao: idRequisicao }
        }
        if(cpfCnpjPagador){
            query = { ...query, "pagador.cpfCnpj": cpfCnpjPagador }
        }
        if(periodoInicio){
            query = { ...query, dataHoraPagamento: { ...query.dataHoraPagamento, $gte: periodoInicio } }
        }
        if(periodoFim){
            query = { ...query, dataHoraPagamento: { ...query.dataHoraPagamento, $lte: periodoFim } }
        }

        const limit = tamanhoPagina ? parseInt(tamanhoPagina) : DEFAULT_MONGOOSE_LIMIT;
        const skip = paginaInicial ? parseInt(paginaInicial) * limit : DEFAULT_MONGOOSE_SKIP;
        const opt = { skip, limit }
        return await PagamentoModel.find(query, null, opt);
	},

	PagamentoModel.consultarPagamento = async ( uuid, cnpjInstituicao ) => {
        Logger.debug('Consulta de Pagamento');

        let query = { uuid }
        if(cnpjInstituicao) {
            query.cnpjInstituicao = cnpjInstituicao;
        }

        return await PagamentoModel.findOne(query);
	},

	PagamentoModel.confirmarPagamento = async (uuid, confirmacaoPagamento) => {
        Logger.debug('Confirmação de Pagamento');

        const situacao = (confirmacaoPagamento.pagamentoConfirmado) ? SITUACAO.CONFIRMADO : SITUACAO.CANCELADO;
        confirmacaoPagamento.dataHoraConfirmacao = Date.now();
        return await PagamentoModel.findOneAndUpdate({ uuid, situacao: SITUACAO.REALIZADO }, { situacao, confirmacaoPagamento });
	}

    return PagamentoModel;
}