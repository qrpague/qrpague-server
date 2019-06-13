const { Logger } = require('../util');
const mongoose = require('mongoose');
const operacao = require('./model/operacao');

const MONGO_CONNECTION = process.env.MONGO_CONNECTION || 'mongodb://localhost:27017/QRPAGUE';
const MONGOOSE_DEBUG = process.env.MONGOOSE_DEBUG;

let db;

const connect = () => {

    db = mongoose.createConnection(MONGO_CONNECTION);
    db.Promise = global.Promise;

    if(MONGOOSE_DEBUG == 'true') {
        mongoose.set("debug", (collectionName, method, query, doc) => {
            Logger.debug(`${collectionName}.${method}`, JSON.stringify(query), doc);
        });
    }

    db.on('connected', function () {
        Logger.info('[MONGO] - Mongoose connected on', MONGO_CONNECTION);
    });
    db.on('error', function (err) {
        Logger.error('[MONGO] - An error ocurred on mongoose connection:', err);
    });
    db.on('disconnected', function () {
        Logger.warn('[MONGO] - Mongoose has been disconnected.');
    });
}

connect();

module.exports = {
    mongoose: mongoose,
    promise: mongoose.Promise,
    Operacao: operacao(db, mongoose, mongoose.Promise)
}