import { config } from './config.js';
import { buscarVagas } from './github.js';
import { serve } from './filtro.js';
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

// mais antigas primeiro, pra o canal ficar em ordem cronológica
candidatas.sort((a, b) => new Date(a.criadaEm) - new Date(b.criadaEm));

const cortadas = candidatas.length - config.maxPorExecucao;
const enviar = candidatas.slice(0, config.maxPorExecucao);

console.log(`\nPara postar: ${enviar.length}${cortadas > 0 ? ` (${cortadas} ficaram pra próxima)` : ''}`);
for (const v of enviar) console.log(`  · ${v.titulo}  ${v.url}`);

if (!DRY && enviar.length) {
  await postar(WEBHOOK, enviar);
  console.log('\nPostadas.');
}

// Só marca como visto o que realmente foi postado. Assim, se o webhook cair,
// as vagas voltam na próxima execução em vez de sumirem para sempre.
if (!DRY) await gravar(estado, enviar.map((v) => v.id));

if (problemas.length && !enviar.length) {
  console.error('\nNenhuma vaga postada e houve erro de origem.');
  process.exit(1);
}
