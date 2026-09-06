import { detalhes } from './filtro.js';

const VERDE = 0x05df48;
const LIMITE_TITULO = 240;

function embed(vaga) {
  const { modalidade, nivel, empresa } = detalhes(vaga);

  const campos = [];
  if (nivel) campos.push({ name: 'Nível', value: capitalizar(nivel), inline: true });
  if (modalidade) campos.push({ name: 'Modalidade', value: capitalizar(modalidade), inline: true });
  if (empresa && empresa.length <= 60) campos.push({ name: 'Empresa', value: empresa, inline: true });

  return {
    title: cortar(vaga.titulo, LIMITE_TITULO),
    url: vaga.url,
    color: VERDE,
    fields: campos,
    footer: { text: vaga.repo },
    timestamp: vaga.criadaEm,
  };
}

export async function postar(webhook, vagas) {
  for (const vaga of vagas) {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Caçador de Vagas',
        embeds: [embed(vaga)],
      }),
    });

    if (res.status === 429) {
      const espera = ((await res.json()).retry_after ?? 2) * 1000;
      await dormir(espera + 300);
      await postar(webhook, [vaga]);
      continue;
    }
    if (!res.ok) throw new Error(`webhook respondeu ${res.status} ${await res.text()}`);

    await dormir(1500); // o Discord aceita 30 mensagens por minuto por webhook
  }
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const cortar = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
