import  express from 'express'
import qrpagueController from  '/controllers/qrpague-controller'


const router = express.Router();
 	
router.route('/operacao').post( qrpagueController.gerar )
router.route('/operacoes').get( qrpagueController.recuperarOperacoes )
router.route('/operacoes/:uuid').get( qrpagueController.consultarOperacao )
router.route('/operacoes/:uuid/autorizacao').post( qrpagueController.autorizarOperacao )
router.route('/operacoes/:uuid/confirmacao').post( qrpagueController.receberConfirmacao )
router.route('/codigo-barras/:codigoBarras').get( qrpagueController.retornaCodigoBarra )

module.exports = router;
