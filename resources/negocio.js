let express = require('express')

let Operacao = require( global.pathRootApp + '/controllers/operacao-controller')
let CodigoBarras = require( global.pathRootApp + '/controllers/codigo-barras-controller')
let Pagamento = require( global.pathRootApp + '/controllers/pagamento-controller')


const router = express.Router();

router.route('/operacao').post(Operacao.gerar)
router.route('/operacoes').get(Operacao.recuperar)
router.route('/operacoes/:uuid').get(Operacao.consultar)
router.route('/operacoes/:uuid/autorizacao').post(Operacao.autorizar)
router.route('/operacoes/:uuid/confirmacao').post(Operacao.receber)



router.route('/operacoes/:uuid/pagamento').post(Pagamento.register)
router.route('/pagamentos/').get(Pagamento.list)
router.route('/pagamentos/:uuid').get(Pagamento.detail)
router.route('/pagamentos/:uuid/confirmacao').post(Pagamento.check)


router.route('/codigo-barras/:codigoBarras').get(CodigoBarras.detail)


module.exports = router;
