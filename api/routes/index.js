let express = require('express')

let Operacao = require('../controller/operacoes-controller');
let Pagamento = require('../controller/pagamento-controller');

const router = express.Router();

router.route('/operacoes').post(Operacao.criarOperacao)
router.route('/operacoes').get(Operacao.consultarOperacoes)
router.route('/operacoes/:uuid').get(Operacao.consultarOperacao)
router.route('/operacoes/:uuid/autorizacao').post(Operacao.autorizarOperacao)
router.route('/operacoes/:uuid/confirmacao').post(Operacao.confirmarOperacao)

router.route('/operacoes/:uuid/pagamentos').post(Pagamento.criarPagamento)

module.exports = router;
