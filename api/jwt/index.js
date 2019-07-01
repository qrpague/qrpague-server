const jwt = require('jsonwebtoken');

const CONSTANTS = {
    TOKEN_NAME: 'token-instituicao'
}

const sign = (payload, key, options) => {
    const token = jwt.sign(payload, key, options);
    return token
}

const verify = async (token, key, options) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, key, options, function(err, decoded) {
            if(err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        })
    });
}

const decode = (token, options = { complete: false }) => {
    const decoded = jwt.decode(token, options);
    return decoded;
}

module.exports = {
    sign,
    verify,
    decode,
    CONSTANTS
}