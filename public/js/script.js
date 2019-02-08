 

function truncateNumber(num, n) {

	let m = Math.pow(10, n);

	return Math.trunc(num * m) / m;

}

function Msg(msg, type) {
	$(type).notify({
		message: { text: msg },
		transition: 'fade',
		closable: false,
		fadeOut: { enabled: true, delay: 3000 }
	}).show();
}



function requestApiSMS( $http, urlQrcode , valorTotal , number) {


    let urlQrcode = urlQrcode
    let telefone = number 
    let valor = valorTotal
    var rest = {
        method: 'POST',
        url: connectApp.url_sms_gateway + "?url=" + urlQrcode + "&to=" + telefone + "&value=" + valor,
        headers: { 'Content-Type': 'application/json' },
        data: {}
    }

    return $http(rest)

}
