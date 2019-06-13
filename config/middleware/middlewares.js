const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const bodyParser = require('body-parser')

const setup = (app) => {
    const publicFolder = path.join(__dirname, '/public/');
    const options = { 'index': 'index.html' }
    app.use('/qrpague-admin', express.static(publicFolder, options));
    app.use(methodOverride());
    app.use(bodyParser.text())
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
}

module.exports = {
    setup
}