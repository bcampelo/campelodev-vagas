import { readFile, writeFile } from 'node:fs/promises';

const ARQUIVO = new URL('../data/vistos.json', import.meta.url);
const TETO = 3000; // guarda os últimos N ids, o resto é história

export async function ler() {
  try {
    return JSON.parse(await readFile(ARQUIVO, 'utf8'));
  } catch {
    return { vistos: [], ultimaExecucao: null };
  }
}

export async function gravar(estado, novosIds) {
  const vistos = [...novosIds, ...estado.vistos].slice(0, TETO);
  await writeFile(
    ARQUIVO,
    JSON.stringify({ vistos, ultimaExecucao: new Date().toISOString() }, null, 2) + '\n'
  );
}
