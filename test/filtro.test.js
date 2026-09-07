import test from 'node:test';
import assert from 'node:assert/strict';
import { serve, ehEntrada, detalhes } from '../src/filtro.js';

const hoje = new Date().toISOString();
const vaga = (titulo, extra = {}) => ({
  titulo,
  etiquetas: [],
  corpo: '',
  criadaEm: hoje,
  ...extra,
});

const casos = [
  // se declara de entrada, passa sempre
  ['[Remoto] Pessoa Desenvolvedora Java Júnior - Acme', true],
  ['[Híbrido] Estágio em Desenvolvimento Front-end - Nubank', true],
  ['Programa de Trainee 2027 - Banco', true],
  ['[Remoto] Analista de Dados Jr - Consultoria', true],
  ['Vaga: Estagiário de QA - Rio Branco', true],
  ['[Remoto] Dev Júnior/Pleno Node - Startup', true],

  // não diz o nível, agora passa
  ['[Remoto] Pessoa Desenvolvedora Back-end Java - Acme', true],
  ['[São Paulo] Desenvolvedor Front-end React', true],
  ['Analista de Testes - Empresa', true],

  // se declara acima do nível de entrada, barra
  ['[Remoto] Desenvolvedor Backend Sênior Node - XPTO', false],
  ['[Remoto] Dev Full-stack Pleno - Startup', false],
  ['[São Paulo] Tech Lead Java - Empresa', false],
  ['[Remoto] Pessoa Desenvolvedora Pleno/Sênior React', false],
  ['[Remoto] Arquiteto de Software', false],
  ['Coordenador de Engenharia - Empresa', false],
];

for (const [titulo, esperado] of casos) {
  test(`${esperado ? 'passa' : 'barra'}: ${titulo}`, () => {
    assert.equal(serve(vaga(titulo)), esperado);
  });
}

test('barra vaga que pede 5+ anos no corpo', () => {
  assert.equal(serve(vaga('[Remoto] Dev Node', { corpo: 'Requisitos: 5+ anos de experiência' })), false);
});

test('não confunde "1 a 3 anos" com exigência alta', () => {
  assert.equal(serve(vaga('[Remoto] Dev Node', { corpo: 'De 1 a 3 anos de experiência' })), true);
});

test('barra vaga velha demais', () => {
  const antiga = new Date(Date.now() - 40 * 86400000).toISOString();
  assert.equal(serve(vaga('[Remoto] Dev Java Júnior', { criadaEm: antiga })), false);
});

test('usa as etiquetas além do título', () => {
  assert.equal(serve(vaga('[Remoto] Dev Node', { etiquetas: ['senior'] })), false);
  assert.equal(serve(vaga('[Remoto] Dev Node', { etiquetas: ['junior'] })), true);
});

test('ehEntrada separa quem se declara de entrada', () => {
  assert.equal(ehEntrada(vaga('[Remoto] Dev Java Júnior')), true);
  assert.equal(ehEntrada(vaga('[Remoto] Dev Java')), false);
});

test('extrai nível, modalidade, stack e empresa do título', () => {
  const d = detalhes(vaga('[Remoto] Pessoa Desenvolvedora Java Júnior - Acme Tecnologia'));
  assert.equal(d.modalidade, 'Remoto');
  assert.equal(d.nivel, 'Júnior');
  assert.equal(d.stack, 'Java');
  assert.equal(d.empresa, 'Acme Tecnologia');
});
