const { Err, Logger } = require('../../util');
const { Operacao, SITUACAO, TIPO_OPERACAO } = require('../schema/operacao-financeira');

const DEFAULT_MONGOOSE_LIMIT = 30;
const DEFAULT_MONGOOSE_SKIP = 0;

const validarDatas = ({ dataHoraSolicitacao, dataHoraVencimento }) => {
    if(dataHoraVencimento.getTime() <= dataHoraSolicitacao.getTime()){
        throw new Error(
            `A dataHoraVencimento - ${dataHoraVencimento} deve ser maior que
             a dataHoraSolicitacao - ${dataHoraSolicitacao}`
        );
    }
}

module.exports = (db, mongoose, promise) => {
    
    let Schema = mongoose.Schema;
    let operacaoSchema = new Schema(Operacao, { collection: 'Operacao' });

    operacaoSchema.pre('save', function (next) {
        try {
            validarDatas(this);
            next();
        } catch(err) {
            next(err);
        }
    })

    let OperacaoModel = db.model('Operacao', operacaoSchema);

    OperacaoModel.TIPO_OPERACAO = TIPO_OPERACAO;
    OperacaoModel.SITUACAO = SITUACAO;

    OperacaoModel.incluirOperacao = async (op) => {
        Logger.debug('Inclusão de Operação Financeira');

        op.dataHoraSolicitacao = new Date();
        op.dataHoraVencimento = new Date(op.dataHoraVencimento);
        let operacao = new OperacaoModel(op);
		return await operacao.save();
    },

	OperacaoModel.recuperarOperacoes = async ({ idRequisicao, cpfCnpjBeneficiario, paginaInicial, tamanhoPagina, periodoInicio, periodoFim }) => {
        Logger.debug('Consulta de Operações Financeiras');

        let query = {}
        if(idRequisicao){
            query = { ...query, idRequisicao: idRequisicao }
        }
        if(cpfCnpjBeneficiario){
            query = { ...query, "beneficiario.cpfCnpj": cpfCnpjBeneficiario }
        }
        if(periodoInicio){
            query = { ...query, dataHoraSolicitacao: { ...query.dataHoraSolicitacao, $gte: periodoInicio } }
        }
        if(periodoFim){
            query = { ...query, dataHoraSolicitacao: { ...query.dataHoraSolicitacao, $lte: periodoFim } }
        }

        const limit = tamanhoPagina ? parseInt(tamanhoPagina) : DEFAULT_MONGOOSE_LIMIT;
        const skip = paginaInicial ? parseInt(paginaInicial) * limit : DEFAULT_MONGOOSE_SKIP;
        const opt = { skip, limit }
        return await OperacaoModel.find(query, null, opt).populate('pagamentos');
	},

	OperacaoModel.consultarOperacao = async ( uuid ) => {
        Logger.debug('Consulta de Operação Financeira');

        return await OperacaoModel.findOne({ uuid }).populate('pagamentos');
	},

	OperacaoModel.autorizarOperacao = async (uuid, autorizacaoOperacao) => {
        Logger.debug('Autorização de Operação Financeira');

		const situacao = (autorizacaoOperacao.operacaoAutorizada) ? SITUACAO.AUTORIZADO : SITUACAO.CANCELADO;
        return await Asset.findOneAndUpdate({ uuid }, { situacao, autorizacaoOperacao });
	},

	OperacaoModel.confirmarOperacao = async (uuid, confirmacaoOperacao) => {
        Logger.debug('Confirmação de Operação Financeira');

        const situacao = (confirmacaoOperacao.operacaoConfirmada) ? SITUACAO.AUTORIZADO : SITUACAO.CANCELADO;
        return await Asset.findOneAndUpdate({ uuid }, { situacao, confirmacaoOperacao });
	}

    return OperacaoModel;
}