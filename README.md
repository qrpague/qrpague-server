# Descrição

A solução QRPague utiliza as tecnologias de QRCode e API para implementar operações financeiras de saque, pagamentos e transferência entre instituições distintas, sendo elas financeiras ou não. Esta API fornece um conjunto de serviços de emissão, autorização e confirmação de operações financeiras online. O uso das APIs deve obedecer os fluxos de processo disponíveis no GitHub do projeto para cada natureza de operação (saque, transferência ou pagamento).

# Pré-requisitos

- **Docker** >= 17.12.0-ce
- **docker-compose (OPCIONAL)** >= 1.21.0

# 1. Instalação

Para rodar o serviço você irá utilizar uma solução de contêiners através de uma imagem Docker.
**Em nosso tutorial utilizaremos o `docker-compose` para facilitar a configuração do ambiente**.

- Primeiro faça o download do projeto para sua máquina local, através do comando: `git clone https://github.com/qrpague/qrpague-server.git`
- Na pasta raiz do projeto, **execute um dos seguintes comandos**:

## 1.1 Docker

```
docker run -e MONGO_CONNECTION='mongodb://localhost:27017/qrpague' \ 
-e SERVER_URL='http://127.0.0.1:8080' \
-p 9999:8080 \
--name qrpague-api qrpague/qrpague-api
```

## 1.2 Docker-compose

### 1.2.1 Docker-compose simples

```
docker-compose up
```

### 1.2.2 Docker-compose completo - Demonstrando o uso das variáveis opcionais

```
docker-compose -f docker-compose-full.yaml up
```

# 2. Configurações

## 2.1 Variáveis de ambiente

- `MONGO_CONNECTION`
    - **OBRIGATÓRIA**
    - Conexão do MongoDB.
- `SERVER_URL`
    - **OBRIGATÓRIA**
    - URL do serviço de API.
- `MY_PRIVATE_KEY`
    - **OBRIGATÓRIA**
    - Chave privada assimétrica para assinatura e criptografia.
- `ERROR_MESSAGE_FILE`
    - **OPCIONAL | DEFAULT = Arquivo de template já determinado no projeto**
    - FilePath do arquivo de mensagens de erro.
- `INSTITUICOES_FILE`
    - **OPCIONAL | DEFAULT = Arquivo de template já determinado no projeto, porém você DEVE substituí-lo**
    - FilePath do arquivo responsável por carregar as informações das instituições autorizadas pelo QRpague.
    - **É DESEJÁVEL que você preencha esta variável e substitua o arquivo existente, pois este arquivo possui preenchimento padrão apenas para fins didáticos e ilustrativos.**
- `QRPAGUE_IMAGE_URL`
    - **OPCIONAL | DEFAULT = 'https://avatars1.githubusercontent.com/u/43270555?s=460&v=4'**
    - URL do ícone do QRPague
- `PORT` 
    - **OPCIONAL | DEFAULT = 8080**
    - Porta na qual o serviço irá subir.
- `NODE_PROJECT`
    - **OPCIONAL | DEFAULT = 'QRPAGUE-Service'**
    - Nome do micro-serviço.
- `LOG_LEVEL`
    - **OPCIONAL | DEFAULT = 'error' | VALUES = (trace, debug, info, warn, error, fatal)**
    - Level do log.
- `MONGOOSE_DEBUG`
    - **OPCIONAL | DEFAULT = 'false' | VALUES = (true, false)**
    - Booleano para ativar modo debug do MongoDB.
 
## 2.2 Arquivo de mensagem de erro

Na maioria dos projetos de serviços REST, as mensagens de erro não são tratadas com padronização adequada. Para fazer isso, o serviço QRPague fornece um mecanismo de padronização de mensagem de erro baseado na [RFC-7807][rfc].

**OBSERVAÇÕES**

- **O serviço do QRPague já vem com um arquivo padrão de mensagens de erro, mas você pode substituir este arquivo através da variável de ambiente `ERROR_MESSAGE_FILE`.**
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

- **O serviço do QRPague já vem com um arquivo padrão de instituições, mas você DEVE substituir este arquivo através da variável de ambiente `INSTITUICOES_FILE`.**
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

# 3. Mensagens de erro

As mensagens abaixo são tratadas e que possuem semântica negocial no módulo do QRPague.

## 3.1 Operação Financeira Digital

### **Inserção de uma operação `(POST) - /operacoes`**

- **Código de Erro**: 1000
- **Mensagem de erro**: Erro de inserção de operação

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | A operação ${uuid} não pode ser salva |
| 2 | A operação ${uuid} já existe e não pode ser incluída |
| 3 | A operação com a requisição ${idRequisicao} já foi incluída |

### **Consulta de operações `(GET) - /operacoes` ou `(GET) - /operacoes/{uuid}`**

- **Código de Erro**: 2000
- **Mensagem de erro**: Erro de consulta de operação

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | A operação ${uuid} não existe |
| 2 | A instituição de cnpj ${cnpj} não está autorizada |
| 3 | O CNPJ não foi informado |

### **Confirmação de operação `(PUT) - /operacoes/{uuid}/confirmacao`**

- **Código de Erro**: 6000
- **Mensagem de erro**: Erro de confirmação de pagamento

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | A operação ${uuid} não existe |
| 2 | A operação ${uuid} já foi confirmada/cancelada |

## 3.2 Pagamento

### **Inserção de um pagamento `(POST) - /pagamentos`**

- **Código de Erro**: 3000
- **Mensagem de erro**: Erro de inserção de pagamento

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | A operação ${uuidOperacao} não existe ou já foi confirmada/cancelada |
| 2 | A instituição de cnpj ${cnpj} não está autorizada |
| 3 | O pagamento ${uuid} não pode ser salvo |
| 4 | O pagamento ${uuid} já existe e não pode ser incluído novamente |
| 5 | O pagamento com a requisição ${idRequisicao} já foi incluído |
| 6 | O CNPJ não foi informado |

### **Consulta de pagamentos `(GET) - /pagamentos` ou `(GET) - /pagamentos/{uuid}`**

- **Código de Erro**: 4000
- **Mensagem de erro**: Erro de consulta de pagamento

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | O pagamento ${uuid} não existe ou não pertence ao cnpj ${cnpj} |
| 2 | A instituição de cnpj ${cnpj} não está autorizada |
| 3 | O CNPJ não foi informado |

### **Confirmação de pagamento `(PUT) - /pagamentos/{uuid}/confirmacao`**

- **Código de Erro**: 5000
- **Mensagem de erro**: Erro de confirmação de pagamento

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | O pagamento ${uuid} não existe |
| 2 | O pagamento ${uuid} já foi confirmado/cancelado |
| 3 | O CNPJ não foi informado |
| 4 | A instituição de cnpj ${cnpj} não está autorizada |
| 5 | A operação ${uuidOperacao} não existe ou já foi confirmada/cancelada |
| 6 | O pagamento não pode ser efetuado porque a operação ${uuidOperacao} não é mais válida |

## 3.3 Requisição

Erros que podem ocorrer nas requisições http.

- **Código de Erro**: 997000
- **Mensagem de erro**: Erro na requisição

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | O campo '${campo}' é obrigatório |

## 3.4 JSON WEB Token

Erros que podem ocorrer com relação ao token JWT.

- **Código de Erro**: 999000
- **Mensagem de erro**: Erro no JSON Web Token

#### **Erros específicos**

| Código de Detalhamento | Detalhe |
| -- | -- |
| 1 | O token não foi informado |
| 2 | Assinatura inválida para o token informado |
| 3 | Houve um erro na decodificação do token |
| 4 | O token está expirado |