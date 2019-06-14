const { YAMLReader } = require('../../util');
const path = require('path');

const INST_CONST = 'I_';
const PUB_KEY_CONST = 'P_';

const InstituicaoInfo = class InstituicaoInfo {

    constructor(yamlFilePath) {
        const schemaValidatorFilePath = path.join(__dirname, 'instituicao-schema.json');
        this.doc = formatarDocumento(YAMLReader.readYAML(yamlFilePath, schemaValidatorFilePath));
    }

    buscar(cnpj) {
        return recuperarPorCnpj( this.doc, cnpj );
    }

    buscarPorChavePublica(chavePublica) {
        return recuperarPorChavePublica( this.doc, chavePublica );
    }
}

const recuperarPorCnpj = (doc, cnpj) => {
    return recuperar(doc, INST_CONST, cnpj);
}

const recuperarPorChavePublica = (doc, chavePublica) => {
    return recuperar(doc, PUB_KEY_CONST, chavePublica);
}

const recuperar = (doc, sigla, valorChaveComposta) => {
    let instituicao = doc[sigla + valorChaveComposta];
    let instance;
    if(!instituicao) {
        return undefined;
    }
    let result = {
        nome: instituicao.nome,
        cnpj: instituicao.cnpj,
        chavePublica: instituicao.chavePublica
    }
    return result;
}

const formatarDocumento = (doc) => {
    let newDoc = {};
    for (let i=0; i<doc.instituicoes.length; i++) {
        let instituicaoObject = doc.instituicoes[i];
        let instituicaoValue = Object.values(instituicaoObject)[0];
        const value = {
            nome: instituicaoValue.nome,
            cnpj: instituicaoValue.cnpj,
            chavePublica: instituicaoValue.chavePublica
        }
        newDoc[INST_CONST + instituicaoValue.cnpj] = value;
        newDoc[PUB_KEY_CONST + instituicaoValue.chavePublica] = value;
    }
    return newDoc;
}

module.exports = InstituicaoInfo;