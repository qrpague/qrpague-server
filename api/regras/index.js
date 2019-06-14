const InstituicaoInfo = require('./instituicao/instituicao-info');
const { Err } = require('../util');

let INST_DOC;

const setup = (options) => {

    if(options && options.instituicoes && options.instituicoes.filePath) {
        let instituicaoOptions = { ...options.instituicoes }
        const instituicaoFilePath = instituicaoOptions.filePath;
        INST_DOC = new InstituicaoInfo(instituicaoFilePath);
    }
}

const buscarInstituicao = (cnpj) => {
    if(!INST_DOC) {
        Err.throwInternalError(new Error(`Você precisa inicializar a configuração do arquivo YAML de instituições através da variável 'INSTITUICOES_FILE'.`));
    }
    return INST_DOC.buscar(cnpj);
}

const buscarInstituicaoPorChavePublica = (chavePublica) => {
    if(!INST_DOC) {
        Err.throwInternalError(new Error(`Você precisa inicializar a configuração do arquivo YAML de instituições através da variável 'INSTITUICOES_FILE'.`));
    }
    return INST_DOC.buscarPorChavePublica(chavePublica);
}

module.exports = {
    setup,
    Instituicao: {
        buscar: buscarInstituicao,
        buscarPorChavePublica: buscarInstituicaoPorChavePublica
    }
}