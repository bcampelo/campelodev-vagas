import { config } from './config.js';

/**
 * Decide se a vaga entra no canal.
 *
 * A regra é estreita de propósito. Canal sem filtro recebe 40 vagas de sênior
 * por dia e todo mundo muta, e canal mudo é canal morto. Só passa vaga que
 * alguém da comunidade pode de fato se candidatar hoje, ou seja, júnior,
 * estágio, trainee ou entrada.
 *
 * Se um dia quiser afrouxar, mexa em `nivel` no config.json, não aqui.
 */
export function serve(vaga) {
  const texto = `${vaga.titulo} ${vaga.etiquetas.join(' ')}`;

  if (!config.nivel.test(texto)) return false;

  // "Júnior ou Pleno" passa. "Pleno/Sênior" com um "jr" solto no meio, não.
  const pedeSenioridade = config.bloqueio.test(vaga.titulo);
  const ehEntrada = config.nivel.test(vaga.titulo);
  if (pedeSenioridade && !ehEntrada) return false;

  return true;
}

/** Separa "[Remoto] Dev Java Júnior - Empresa" nas partes que vão pro embed. */
export function detalhes(vaga) {
  const modalidade = vaga.titulo.match(config.remoto)?.[0] ?? null;
  const nivel = vaga.titulo.match(config.nivel)?.[0] ?? null;
  const stack = vaga.titulo.match(config.stack)?.[0] ?? null;
  const partes = vaga.titulo.split(/\s+[-–—|]\s+/);
  const empresa = partes.length > 1 ? partes.at(-1).trim() : null;
  return { modalidade, nivel, stack, empresa };
}
