const yaml = require('js-yaml'),
      fs   = require('fs'),
      path = require('path'),
      Ajv = require('ajv');

const ENCODE = 'utf8';

const validate = (doc, schemaValidatorFilePath) => {
    const jsonFile = fs.readFileSync(schemaValidatorFilePath, ENCODE);
    const schema = JSON.parse(jsonFile);
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(doc);
    if (!valid) 
        throw new Error(JSON.stringify(validate.errors));
    return doc;
}

const readYAML = (filePath, schemaValidatorFilePath) => {
    const yamlFile = fs.readFileSync(filePath, ENCODE);
    let doc = yaml.safeLoad(yamlFile);
    if(schemaValidatorFilePath){
        validate(doc, schemaValidatorFilePath);
    }
    return doc;
}

module.exports = {
    readYAML
}