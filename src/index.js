import { config } from './config.js';
import { buscarVagas } from './github.js';
import { serve, ehEntrada } from './filtro.js';
import { postar } from './discord.js';
import { ler, gravar } from './estado.js';

const DRY = process.env.DRY_RUN === '1';
const WEBHOOK = process.env.DISCORD_WEBHOOK;

if (!DRY && !WEBHOOK) {
  console.error('Falta DISCORD_WEBHOOK. Para testar sem postar, use DRY_RUN=1.');
  process.exit(1);
}

const estado = await ler();
const jaVistos = new Set(estado.vistos);

console.log(`Caçador de Vagas${DRY ? ' (DRY RUN, nada é postado)' : ''}`);
console.log(`Última execução: ${estado.ultimaExecucao ?? 'nunca'}\n`);

const candidatas = [];
const problemas = [];

for (const repo of config.repos) {
  try {
    const vagas = await buscarVagas(repo, config.porRepo);
    const novas = vagas.filter((v) => !jaVistos.has(v.id) && serve(v));
    console.log(`${repo}: ${vagas.length} abertas, ${novas.length} novas que servem`);
    candidatas.push(...novas);
  } catch (e) {
    problemas.push(`${repo}: ${e.message}`);
    console.log(`${repo}: ${e.message}`);
  }
}

// Vaga que se declara de entrada vai na frente. Entre iguais, a mais antiga
// primeiro, pra o canal ficar em ordem cronológica e a vaga não vencer na fila.
candidatas.sort((a, b) => {
  const pa = ehEntrada(a) ? 0 : 1;
  const pb = ehEntrada(b) ? 0 : 1;
  if (pa !== pb) return pa - pb;
  return new Date(a.criadaEm) - new Date(b.criadaEm);
});

const enviar = candidatas.slice(0, config.maxPorExecucao);
const cortadas = candidatas.length - enviar.length;

console.log(`\nPara postar: ${enviar.length}${cortadas > 0 ? ` (${cortadas} ficaram pra próxima)` : ''}`);
for (const v of enviar) console.log(`  ${ehEntrada(v) ? '*' : ' '} ${v.titulo}  ${v.url}`);

if (!DRY && enviar.length) {
  await postar(WEBHOOK, enviar);
  console.log('\nPostadas.');
}

// Só marca como visto o que realmente foi postado. Assim, se o webhook cair,
// as vagas voltam na próxima execução em vez de sumirem para sempre.
if (!DRY) await gravar(estado, enviar.map((v) => v.id));

// Falha só quando nenhuma origem respondeu. Rodada sem vaga nova é o normal,
// e uma origem quebrada não pode reprovar a execução inteira.
if (problemas.length === config.repos.length) {
  console.error('\nNenhuma das origens respondeu.');
  process.exit(1);
}
if (problemas.length) {
  console.log(`\nAviso, ${problemas.length} origem(ns) com problema:`);
  for (const p of problemas) console.log(`  ${p}`);
}
