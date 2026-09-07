import { config } from './config.js';

/**
 * Decide se a vaga entra no canal.
 *
 * A lógica é por exclusão, não por inclusão. O filtro antigo só deixava passar
 * quem escrevia "júnior" ou "estágio" no título, e a maioria das vagas não
 * escreve nível nenhum. Resultado, quase tudo era barrado.
 *
 * Agora a pergunta é outra. Em vez de "essa vaga diz que é de entrada?",
 * a pergunta é "essa vaga diz que NÃO é pra quem está começando?".
 * Quem não diz nada passa, porque na dúvida a pessoa lê e decide sozinha.
 */
export function serve(vaga) {
  const texto = `${vaga.titulo} ${(vaga.etiquetas || []).join(' ')}`;

  // Vaga velha provavelmente já foi preenchida, e enche o canal à toa.
  if (config.maxDias && vaga.criadaEm) {
    const dias = (Date.now() - new Date(vaga.criadaEm).getTime()) / 86400000;
    if (dias > config.maxDias) return false;
  }

  // Diz que é de entrada, passa sempre, mesmo que também cite pleno.
  if (ehEntrada(vaga)) return true;

  // Diz que é sênior, pleno, lead ou gestão, barra.
  if (config.senioridade.test(texto)) return false;

  // Pede "5+ anos" no corpo, barra. O "+" é obrigatório na regex de propósito,
  // senão "1 a 3 anos" seria barrado por engano.
  if (config.muitaExperiencia.test(vaga.corpo || '')) return false;

  // Não disse o nível. Passa.
  return true;
}

/** A vaga se declara de entrada. Usado no filtro e na ordem de postagem. */
export function ehEntrada(vaga) {
  return config.nivel.test(`${vaga.titulo} ${(vaga.etiquetas || []).join(' ')}`);
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
