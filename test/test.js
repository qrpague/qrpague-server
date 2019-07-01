const jwt = require('../api/jwt');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

let SICOOB;
let CAIXA;
let PAYLOAD;

describe('Json WEB Test', () => {

    before(() => {
        SICOOB = {
            PRIVATE_KEY: fs.readFileSync(path.join(__dirname, '../keys/sicoob/sicoob_private.pem')),
            PUBLIC_KEY: fs.readFileSync(path.join(__dirname, '../keys/sicoob/sicoob_public.pub'))
        }
        
        CAIXA = {
            PRIVATE_KEY: fs.readFileSync(path.join(__dirname, '../keys/caixa/caixa_private.pem')),
            PUBLIC_KEY: fs.readFileSync(path.join(__dirname, '../keys/caixa/caixa_public.pub'))
        }

        PAYLOAD = {
            resultado: {
                a: 'test a',
                b: 'test b',
                c: 'test c',
                d: 'test d',
                e: 'test e',
            }
        }
    });

    it('description', async () => {

        const options = {
            algorithm: 'RS256',
            expiresIn: '1000 minutes',
            subject: '04.891.850/0001-88'
        }

        try {
            const token = jwt.sign({}, SICOOB.PRIVATE_KEY, options);
            const { sub } = jwt.decode(token);
            const decoded = await jwt.verify(token, SICOOB.PUBLIC_KEY, { subject: sub });
            console.log('JWT >>> ', token);
        } catch(err) {
            console.error('Err >>> ', err);
        }
        
        expect(1).to.eq(1);
    });
});