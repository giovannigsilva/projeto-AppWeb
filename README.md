# Aplicativo de Chat com IA - KORU PROGRAMA DESENVOLVE GRUPO BOTICARIO

Este projeto é uma aplicação web simples que permite interagir com um modelo de linguagem da OpenAI. O usuário pode fazer uma pergunta, e a aplicação se conecta à API da OpenAI para buscar e exibir a resposta.

-----

## Conceito da Aplicação

O fluxo da aplicação é direto:

1.  O usuário insere sua pergunta em um campo de texto.
2.  Clica no botão **"Perguntar"**.
3.  A aplicação faz uma requisição para a API da OpenAI.
4.  A resposta da IA é exibida na tela.

-----

## Interface do Aplicativo

A interface do usuário é dividida em três partes principais:

  * **Cabeçalho**: Contém o título da aplicação, um campo para a chave da API e um menu para selecionar o modelo de IA.
  * **Área Principal**: Inclui o campo de texto para a pergunta, o botão de envio e a área onde a resposta da IA será exibida.
  * **Estados Visuais**: Feedback claro para o usuário, mostrando quando a aplicação está carregando ou se ocorreu algum erro.

-----

## Requisitos Funcionais

A aplicação foi desenvolvida com os seguintes requisitos em mente:

### 1\. Estrutura HTML Básica

  * **Título**: Um cabeçalho claro para a aplicação.
  * **Configurações**: Campos para a chave da API da OpenAI e um menu suspenso para a seleção do modelo (por exemplo, GPT-4.1 Nano).
  * **Interação**: Uma área principal com um input de texto para a pergunta, um botão para enviar e uma `div` para exibir a resposta.

### 2\. Interface de Entrada

  * **Input da Pergunta**: Um campo de texto para o usuário digitar sua pergunta.
  * **Botão de Envio**: Um botão **"Perguntar"** que envia a requisição.
  * **API Key**: Um campo de senha para inserir a chave da API, garantindo que o texto não fique visível.
  * **Seleção de Modelo**: Um dropdown para escolher o modelo de IA a ser utilizado na requisição.

### 3\. Exibição da Resposta

  * A resposta da IA é mostrada em uma área dedicada, formatada para facilitar a leitura.
  * Esta área fica oculta por padrão e só é exibida após o recebimento de uma resposta válida.

### 4\. Estados de Loading

  * Um indicador de carregamento é exibido enquanto a aplicação aguarda a resposta da API.
  * O botão de envio é desabilitado durante este período para evitar múltiplas requisições.

### 5\. Tratamento de Erros

  * A aplicação valida se a chave da API e a pergunta foram inseridas antes de enviar a requisição.
  * Mensagens de erro amigáveis são exibidas para o usuário em caso de campos vazios ou problemas de conexão com a API.

### 6\. Integração com a API da IA

  * A requisição é feita para o endpoint da OpenAI usando o método `POST`.
  * A aplicação envia a pergunta e a chave da API como parte da requisição.
  * A resposta é processada e exibida na tela.
  * A comunicação com a API é feita usando `fetch()` e `async/await`.

### 7\. Layout Responsivo Básico

  * A interface é otimizada para funcionar bem em desktops.
  * O layout é organizado e centralizado para uma melhor experiência do usuário.

-----

## Estrutura de Arquivos

O projeto segue uma estrutura de arquivos padrão:

```
projeto-ia/
├── index.html
├── style.css
└── script.js
```
