import test from 'node:test';
import assert from 'node:assert/strict';
import { serve, detalhes } from '../src/filtro.js';

const casos = [
  ['[Remoto] Pessoa Desenvolvedora Java Júnior - Acme', true],
  ['[Híbrido] Estágio em Desenvolvimento Front-end - Nubank', true],
  ['Programa de Trainee 2027 - Banco', true],
  ['[Remoto] Analista de Dados Jr - Consultoria', true],
  ['Vaga: Estagiário de QA - Rio Branco', true],
  ['[Remoto] Desenvolvedor Backend Sênior Node - XPTO', false],
  ['[Remoto] Dev Full-stack Pleno - Startup', false],
  ['[São Paulo] Tech Lead Java - Empresa', false],
  ['[Remoto] Pessoa Desenvolvedora Pleno/Sênior React', false],
  ['[Remoto] Arquiteto de Software', false],
];

for (const [titulo, esperado] of casos) {
  test(`${esperado ? 'passa' : 'barra'}: ${titulo}`, () => {
    assert.equal(serve({ titulo, etiquetas: [] }), esperado);
  });
}

test('extrai nível, modalidade, stack e empresa do título', () => {
  const d = detalhes({ titulo: '[Remoto] Pessoa Desenvolvedora Java Júnior - Acme Tecnologia' });
  assert.equal(d.modalidade, 'Remoto');
  assert.equal(d.nivel, 'Júnior');
  assert.equal(d.stack, 'Java');
  assert.equal(d.empresa, 'Acme Tecnologia');
});
