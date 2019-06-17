# Descrição

A solução QRPague utiliza as tecnologias de QRCode e API para implementar operações financeiras de saque, pagamentos e transferência entre instituições distintas, sendo elas financeiras ou não. Esta API fornece um conjunto de serviços de emissão, autorização e confirmação de operações financeiras online. O uso das APIs deve obedecer os fluxos de processo disponíveis no GitHub do projeto para cada natureza de operação (saque, transferência ou pagamento).

# Pré-requisitos

- **Docker** >= 17.12.0-ce
- **docker-compose (OPCIONAL)** >= 1.21.0

# 1. Instalação

Para rodar o serviço você irá utilizar uma solução de contêiners através de uma imagem Docker.
***OBS**.:Em nosso tutorial utilizaremos o `docker-compose` para facilitar a configuração do ambiente*.

- Primeiro faça o download do projeto para sua máquina local, através do comando: `git clone https://github.com/qrpague/qrpague-server.git`
- Na pasta raiz do projeto, **execute um dos seguintes comandos**:

## 1.1 Com Docker

```
docker run -d -t -i \ 
    -e PORT=8080 \
    -e NODE_PROJECT='QR-Pague Service' \
    -e LOG_LEVEL='debug' \
    -e MONGO_CONNECTION ='mongodb://localhost:27017/qrpague' \
    -e MONGOOSE_DEBUG='true' \
    -e SERVER_URL ='http://127.0.0.1:8080' \
    -e ERROR_MESSAGE_FILE='./api/templates/message/error-messages.yaml' \
    -e INSTITUICOES_FILE='./api/templates/instituicoes/instituicoes.yaml' \
    -e QRPAGUE_IMAGE_URL='https://avatars1.githubusercontent.com/u/43270555?s=460&v=4' \
    -p 9999:8080 \
    --name qrpague-api qrpague/qrpague-api
```

## 1.2 Com docker-compose

```
docker-compose up
```

# 2. Configurações

## 2.1 Variáveis de ambiente

- `MONGO_CONNECTION` **OBRIGATÓRIA**
    - Conexão do MongoDB.
- `SERVER_URL` **OBRIGATÓRIA**
    - URL do serviço de API.
- `ERROR_MESSAGE_FILE` **OPCIONAL | DEFAULT = Arquivo de template já determinado no projeto**
    - FilePath do arquivo de mensagens de erro.
- `INSTITUICOES_FILE` **OPCIONAL | DEFAULT = Arquivo de template já determinado no projeto, porém você DEVE substituí-lo**
    - FilePath do arquivo responsável por carregar as informações das instituições autorizadas pelo QRpague.
    - **É DESEJÁVEL que você preencha esta variável e substitua o arquivo existente, pois este arquivo possui preenchimento padrão apenas para fins didáticos e ilustrativos.**
- `QRPAGUE_IMAGE_URL` **OPCIONAL | DEFAULT = 'https://avatars1.githubusercontent.com/u/43270555?s=460&v=4'**
    - URL do ícone do QRPague
- `PORT` **OPCIONAL | DEFAULT = 8080**
    - Porta na qual o serviço irá subir.
- `NODE_PROJECT` **OPCIONAL | DEFAULT = 'QRPAGUE-Service'**
    - Nome do micro-serviço.
- `LOG_LEVEL` **OPCIONAL | DEFAULT = 'error' | VALUES = (trace, debug, info, warn, error, fatal)**
    - Level do log.
- `MONGOOSE_DEBUG` **OPCIONAL | DEFAULT = 'false' | VALUES = (true, false)**
    - Booleano para ativar modo debug do MongoDB.
 
## 2.2 Arquivo de mensagem de erro

Na maioria dos projetos de serviços REST, as mensagens de erro não são tratadas com padronização adequada. Para fazer isso, o serviço QRPague fornece um mecanismo de padronização de mensagem de erro baseado na [RFC-7807][rfc].

**OBSERVAÇÕES**

- **O serviço do QRPague já vem com um arquivo default de mensagens de erro, mas você pode substituir este arquivo através da variável de ambiente `ERROR_MESSAGE_FILE`.**
- **O arquivo de mensagens de erro serve para a substituição do arquivo padrão no projeto, caso seja necessária a adaptação conforme sua preferência.**
- **Caso deseje substituir o arquivo, favor seguir orientação no exemplo abaixo:**


[rfc]: <https://tools.ietf.org/html/rfc7807>

### 2.2.1 Exemplo

O arquivo de mensagens precisa ser um arquivo YAML conforme exemplo abaixo:

**OBS.: Qualquer formatação divergente ao padrão afetará a subida do serviço.**

```
erros:
    - insercao_operacao:
        codigoErro: 1000
        mensagemErro: Erro de inserção de operação
        detalhes:
            - erro_ao_salvar:
                codigoDetalheErro: 1
                detalheErro: A operação ${uuid} não pode ser salva
            - operacao_existente:
                codigoDetalheErro: 2
                detalheErro: A operação ${uuid} já existe e não pode ser incluída novamente
            - id_requisicao_existente:
                codigoDetalheErro: 3
                detalheErro: A operação com a requisição ${idRequisicao} já foi incluída
```

- Seu arquivo precisa iniciar com uma chave chamada `erros (array)` e seus **elementos filhos**.
- **Deve existir no arquivo pelo menos um elemento filho de `erros`**.
- Você pode dar o nome que desejar para todos os elementos filhos de **erros**, de acordo com sua preferência. Em nosso exemplo utilizamos `insercao_operacao`.
- Dentro do elemento erro `insercao_operacao` você precisa declarar alguns atributos obrigatórios, como:
    - `codigoErro (number)`: **Este campo representa um erro em sua forma mais genérica**.
    - `mensagemErro (string)`: **Este campo forma uma mensagem de erro genérica**.
    - `detalhes (array)`: **Cada erro pode ter um array de detalhes**. 
        - **Deve existir no arquivo pelo menos um elemento filho de `detalhes`**.
        - *Cada elemento filho de `detalhes` pode ter um nome conforme sua preferência.*
        - *No nosso exemplo os nomes são `erro_ao_salvar`, `operacao_existente` e `id_requisicao_existente`.*
        - **Os detalhes têm alguns atributos obrigatórios, como:**
            - `codigoDetalheErro (number)`: **Este campo representa um erro em sua forma mais específica**.
            - `detalheErro (string)`: **Este campo forma uma mensagem detalhada do erro**.

## 2.2 Arquivo de instituições

O serviço QRPague permite a autorização de instituições que podem operar no serviço do QRPague. Para tal efeito foi criado um arquivo de especificação das instituições no formato YAML.

**OBSERVAÇÕES**

- **O serviço do QRPague já vem com um arquivo default de instituições, mas você DEVE substituir este arquivo através da variável de ambiente `INSTITUICOES_FILE`.**
- **Caso deseje substituir o arquivo, favor seguir orientação no exemplo abaixo:**

### 2.2.2 Exemplo

O arquivo de instituições precisa ser um arquivo YAML conforme exemplo abaixo:

**OBS.: Qualquer formatação divergente ao padrão afetará a subida do serviço.**

```
instituicoes:
    - sicoob:
        nome: Sicoob Confederação
        cnpj: 04.891.850/0001-88
        chavePublica: MIIBCgKCAQEA+xGZ/wcz9ugFpP07Nspo6U17l0YhFiFpxxU4pTk3Lifz9R3zsIsuERwta7+fWIfxOo208ett/jhskiVodSEt3QBGh4XBipyWopKwZ93HHaDVZAALi/2A+xTBtWdEo7XGUujKDvC2/aZKukfjpOiUI8AhLAfjmlcD/UZ1QPh0mHsglRNCmpCwmwSXA9VNmhz+PiB+Dml4WWnKW/VHo2ujTXxq7+efMU4H2fny3Se3KYOsFPFGZ1TNQSYlFuShWrHPtiLmUdPoP6CV2mML1tk+l7DIIqXrQhLUKDACeM5roMx0kLhUWB8P+0uj1CNlNN4JRZlC7xFfqiMbFRU9Z4N6YwIDAQAB
    - caixa_economica_federal:
        nome: Caixa Econômica Federal
        cnpj: 00.360.305/0001-04
        chavePublica: MIIBCgKCAQEA+xGZ/wcz9ugFpP07Nspo6U17l0YhFiFpxxU4pTk3Lifz9R3zsIsuERwta7+fWIfxOo208ett/jhskiVodSEt3QBGh4XBipyWopKwZ93HHaDVZAALi/2A+xTBtWdEo7XGUujKDvC2/aZKukfjpOiUI8AhLAfjmlcD/UZ1QPh0mHsglRNCmpCwmwSXA9VNmhz+PiB+Dml4WWnKW/VHo2ujTXxq7+efMU4H2fny3Se3KYOsFPFGZ1TNQSYlFuShWrHPtiLmUdPoP6CV2mML1tk+l7DIIqXrQhLUKDACeM5roMx0kLhUWB8P+0uj1CNlNN4JRZlC7xFfqiMbFRU9Z4N6YwIDAQAB
    - banco_do_brasil:
        nome: Banco do Brasil
        cnpj: 00.000.000/0001-91
        chavePublica: MIIBCgKCAQEA+xGZ/wcz9ugFpP07Nspo6U17l0YhFiFpxxU4pTk3Lifz9R3zsIsuERwta7+fWIfxOo208ett/jhskiVodSEt3QBGh4XBipyWopKwZ93HHaDVZAALi/2A+xTBtWdEo7XGUujKDvC2/aZKukfjpOiUI8AhLAfjmlcD/UZ1QPh0mHsglRNCmpCwmwSXA9VNmhz+PiB+Dml4WWnKW/VHo2ujTXxq7+efMU4H2fny3Se3KYOsFPFGZ1TNQSYlFuShWrHPtiLmUdPoP6CV2mML1tk+l7DIIqXrQhLUKDACeM5roMx0kLhUWB8P+0uj1CNlNN4JRZlC7xFfqiMbFRU9Z4N6YwIDAQAB
```

- Seu arquivo precisa iniciar com uma chave chamada `instituicoes (array)` e seus **elementos filhos**.
- **Deve existir no arquivo pelo menos um elemento filho de `instituicoes`**.
- Você pode dar o nome que desejar para todos os elementos filhos de **instituicoes**, de acordo com sua preferência. Em nosso exemplo utilizamos `sicoob`, `caixa_economica_federal` e `banco_do_brasil`.
- Dentro de cada elemento da instituição, você precisa declarar alguns atributos obrigatórios, como:
    - `nome (string)`: **Este campo representa o nome da instituição**.
    - `cnpj (string)`: **Este campo representa o CNPJ da instituição**.
    - `chavePublica (string)`: **Este campo representa a chave pública da instituição**.