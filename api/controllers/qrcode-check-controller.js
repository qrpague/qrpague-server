'use strict';

let Api = require(global.pathRootApp + '/tools/request-api')
let url = require('url')
let tlsSocket = require('tls')

let fs = require('fs')

module.exports = {


	validar: async function (req, res, next) {

		try {

			const urlQRPague = req.body.urlQRPague;
			if (!urlQRPague) {
				return res.status(401).send({});
			}

			let host = url.parse(urlQRPague).host;


			const socket = tlsSocket.connect(443, host, async () => {

				console.log(socket.getPeerCertificate(true))

				let fingerPrint = socket.fingerPrint

				if ( !serverKeysCheck(fingerPrint)) {
					next("QRPAGUE_SERVER_CHECK_QRCODE_AUTHORIZED_FALSE_#0001")
				}

				if (!socket.authorized) {
					next("QRPAGUE_SERVER_CHECK_QRCODE_AUTHORIZED_FALSE_#0002")
				}

				let operacaoDigital = await operacao(urlQRPague)
				if (!operacaoDigital) {
					next("QRPAGUE_SERVER_CHECK_QRCODE_OPERACAO_DIGITAL_INVALIDA_#0003")
				}


				res.status(200).send(operacaoDigital)

				process.stdin.pipe(socket);
				process.stdin.resume();
			});

		} catch (error) {
			next(error)
		}
	},

}

async function operacao(urlQRPague) {

	let options = {
		method: 'GET',
		uri: urlQRPague,

		headers: {
			'Content-Type': 'application/json',
			'user-agent': 'qrpague-validation'
		}
	};

	return await Api.request(options)


}

function serverKeysCheck(fingerPrint) {

	return new Promise((result, reject) => {
		let pathFolder = global.pathRootApp + '/server-keys'

		fs.readdir(pathFolder, function (err, items) {
			for (var i = 0; i < items.length; i++) {
				console.log(items[i]);

				const serverKey = fs.readFileSync(global.pathRootApp + '/server-keys/' + items[i], "utf8")
				if (serverKey == fingerPrint) {
					return result(serverKey)
				}

			}

			return reject()

		})
		return reject()


	})


}