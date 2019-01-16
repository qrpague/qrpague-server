
var Config = {

	PROTOCOL: 'https',
	HTTP_PORT : 9092,
	HTTP_HOST : '127.0.0.1',
	HOST : 'qrpague.com',
	URL_DATABASE : '0.0.0.0:10001/QRPAGUE',
	QRPAGUE_URL_QRCODE_CREATE: '0.0.0.0:9092/operacoes/',

 
};

module.exports = Config;



String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};