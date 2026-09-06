# campelodev-vagas

Bot que garimpa vagas de júnior e estágio nos repositórios de vagas da comunidade dev brasileira e posta no Discord do CampeloDev.

Roda inteiro no GitHub Actions. Sem servidor, sem custo e sem token de bot.

## Como funciona

De hora em hora o Action busca as issues abertas mais recentes dos repositórios listados em `config.json`, descarta o que já foi postado, aplica o filtro de senioridade e manda o que sobrou para um webhook do Discord.

O que já foi postado fica em `data/vistos.json`, que o próprio Action commita de volta. É o que impede a mesma vaga de aparecer duas vezes.

```
config.json          repositórios e regras de filtro
src/github.js        busca as issues
src/filtro.js        decide o que entra no canal
src/discord.js       monta o embed e posta
src/estado.js        deduplicação
src/index.js         orquestra
```

## Filtro

Só passa vaga de entrada, ou seja, júnior, estágio, trainee ou iniciante. A regra é estreita de propósito. Canal sem filtro recebe dezenas de vagas de sênior por dia, e canal que gera notificação inútil é canal mutado.

Para afrouxar ou apertar, mexa no `config.json`, não no código.

## Rodar local

```bash
DRY_RUN=1 node src/index.js
```

Mostra o que seria postado sem tocar no Discord. Sem `GITHUB_TOKEN` a API do GitHub libera 60 requisições por hora, o que basta para testar.

Para postar de verdade:

```bash
DISCORD_WEBHOOK="https://discord.com/api/webhooks/..." node src/index.js
```

## Configurar no GitHub

1. Suba o repositório.
2. Em Settings, Secrets and variables, Actions, crie o secret `DISCORD_WEBHOOK` com a URL do webhook do canal.
3. Em Actions, rode o workflow uma vez pela mão em Run workflow para conferir a saída.

O `GITHUB_TOKEN` é fornecido pelo próprio Actions e sobe o limite da API para 5.000 requisições por hora. Não precisa criar nada.

## Detalhes que economizam dor de cabeça

O GitHub desativa workflows agendados em repositório sem nenhuma atividade por 60 dias. Um commit qualquer religa.

Se o webhook vazar, apague ele no Discord e crie outro. Não existe revogação parcial.

Uma vaga só é marcada como vista depois de postada com sucesso. Se o webhook cair no meio, ela volta na próxima execução em vez de sumir.

## Licença

MIT
