// ===== storage.js - regras do jogo (compartilhado entre index e admin) =====

// --- Escala de 9 níveis ---
// Pontos vão de -4 a +4. Nível = pontos + 5 (fica entre 1 e 9).
const NIVEIS = {
  1: { nome: 'Dia crítico',        emoji: '😢' },
  2: { nome: 'Muito difícil',      emoji: '😟' },
  3: { nome: 'Comportamento difícil', emoji: '😕' },
  4: { nome: 'Alerta leve',        emoji: '😐' },
  5: { nome: 'Neutro',             emoji: '🙂' },
  6: { nome: 'Bom, com ressalvas', emoji: '😊' },
  7: { nome: 'Bom',                emoji: '😄' },
  8: { nome: 'Muito bom',          emoji: '😁' },
  9: { nome: 'Dia excepcional!',   emoji: '🌟' },
};

const PONTUACAO_MIN = -4;
const PONTUACAO_MAX = 4;

// --- Tipos de evento e seus valores ---
const TIPOS_EVENTO = [
  { id: 'tarefa',       label: '✅ Tarefa concluída',        pontos: +1 },
  { id: 'positivo',     label: '👏 Comportamento positivo',  pontos: +1 },
  { id: 'excepcional',  label: '🌟 Atitude excepcional',     pontos: +2 },
  { id: 'tarefa_nao',   label: '⚠️ Tarefa não concluída',    pontos: -1 },
  { id: 'ruim',         label: '❌ Comportamento ruim',      pontos: -2 },
  { id: 'grave',        label: '🚨 Comportamento grave',     pontos: -3 },
];

// --- Funções auxiliares ---

// Data de hoje no formato yyyy-mm-dd (usada para reset diário)
function hoje() {
  const d = new Date();
  return d.toLocaleDateString('sv-SE'); // formato yyyy-mm-dd
}

// Converte pontos (-4 a +4) em nível (1 a 9)
function nivelDe(pontos) {
  const p = Math.max(PONTUACAO_MIN, Math.min(PONTUACAO_MAX, pontos));
  return p + 5;
}

// Garante o reset diário: se a criança ainda está "no dia anterior",
// grava a cor final no histórico e zera os pontos.
// Essa função roda em todos os aparelhos, então quem abrir primeiro faz o reset.
async function garantirResetDiario(childId, crianca) {
  const hojeStr = hoje();
  if (crianca.ultimoDia === hojeStr) return; // já está no dia certo

  const diaAnterior = crianca.ultimoDia;
  // Se tinha um dia anterior registrado, salva a cor final no histórico
  if (diaAnterior && typeof crianca.pontos === 'number') {
    await db.ref(`historico/${childId}/${diaAnterior}`).set({
      pontos: crianca.pontos,
      nivel: nivelDe(crianca.pontos),
      data: diaAnterior,
    });
  }

  // Zera para o novo dia
  await db.ref(`criancas/${childId}`).update({
    pontos: 0,
    ultimoDia: hojeStr,
  });
}

// Atualiza os pontos de uma criança no Firebase (com teto e piso)
async function atualizarPontos(childId, pontosAtuais, delta) {
  const novos = Math.max(PONTUACAO_MIN, Math.min(PONTUACAO_MAX, pontosAtuais + delta));
  await db.ref(`criancas/${childId}/pontos`).set(novos);
  return novos;
}
