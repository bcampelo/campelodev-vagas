import { readFile } from 'node:fs/promises';

const bruto = JSON.parse(
  await readFile(new URL('../config.json', import.meta.url), 'utf8')
);

export const config = {
  ...bruto,
  nivel: new RegExp(bruto.nivel, 'i'),
  stack: new RegExp(bruto.stack, 'i'),
  remoto: new RegExp(bruto.remoto, 'i'),
  bloqueio: new RegExp(bruto.bloqueio, 'i'),
};
