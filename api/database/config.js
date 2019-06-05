const mongoose = require('mongoose');
const operacao = require('./model/operacao');

let dbURI = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/QRPAGUE';
let db;

const connect = () => {

    db = mongoose.createConnection(dbURI);
    db.Promise = global.Promise;

    db.on('connected', function () {
        logger.info('[MONGO] - Mongoose connected on ' + dbURI);
    });
    db.on('error', function (err) {
        logger.error('[MONGO] - An error ocurred on mongoose connection: ' + err);
    });
    db.on('disconnected', function () {
        logger.warn('[MONGO] - Mongoose has been disconnected.');
    });
}

connect();

module.exports = {
    mongoose: mongoose,
    promise: mongoose.Promise,
    Operacao: operacao(db, mongoose, promise)
}