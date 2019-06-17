const { Config, Logger } = require('../api/util');
const Regras = require('../api/regras');
const Middlewares = require('./middleware/middlewares');

const CONFIG_OPTIONS = {
    ERROR_MESSAGE_FILE: process.env.ERROR_MESSAGE_FILE || path.join(__dirname, '../api/templates/mensagens/error-messages.yaml'),
    NODE_PROJECT: process.env.NODE_PROJECT || 'QRPAGUE-Service',
    LOG_LEVEL: process.env.LOG_LEVEL
}

const RULE_OPTIONS = {
    INSTITUICOES_FILE: process.env.INSTITUICOES_FILE  || path.join(__dirname, '../api/templates/instituicoes/autorizadas.yaml')
}

const setupMiddlewares = (app) => {
    Middlewares.setup(app);
}

const setupConfigOptions = () => {
    let configOptions = {}
    if(CONFIG_OPTIONS.ERROR_MESSAGE_FILE) {
        configOptions = { ...configOptions, messages: { filePath: CONFIG_OPTIONS.ERROR_MESSAGE_FILE } }
    }
    if(CONFIG_OPTIONS.NODE_PROJECT || CONFIG_OPTIONS.LOG_LEVEL) {
        configOptions = { ...configOptions, logger: { name: CONFIG_OPTIONS.NODE_PROJECT, level: CONFIG_OPTIONS.LOG_LEVEL } }
    }
    Config.setup(configOptions);
}

const setupRuleOptions = () => {
    let ruleOptions = {}
    if(RULE_OPTIONS.INSTITUICOES_FILE) {
        ruleOptions = { ...ruleOptions, instituicoes: { filePath: RULE_OPTIONS. INSTITUICOES_FILE } }
    }
    Regras.setup(ruleOptions);
}

module.exports = (app) => {

    setupMiddlewares(app);
    setupConfigOptions();
    setupRuleOptions();

    require('../api/database/db');
}
