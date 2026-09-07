import { readFile } from 'node:fs/promises';

const bruto = JSON.parse(
  await readFile(new URL('../config.json', import.meta.url), 'utf8')
);

// Toda chave do config.json que é uma regex em texto vira RegExp aqui.
// Assim dá pra ajustar o filtro sem abrir o código.
const REGEX = ['nivel', 'senioridade', 'muitaExperiencia', 'stack', 'remoto'];

export const config = { ...bruto };
for (const chave of REGEX) {
  if (typeof bruto[chave] !== 'string') {
    throw new Error(`config.json: falta a regex "${chave}"`);
  }
  config[chave] = new RegExp(bruto[chave], 'i');
}
