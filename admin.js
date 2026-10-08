// ===== admin.js - painel para lançar eventos e cadastrar crianças =====

// Preenche o select de tipos de evento
const selEvento = document.getElementById('selEvento');
TIPOS_EVENTO.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t.id;
  opt.textContent = `${t.label} (${t.pontos > 0 ? '+' : ''}${t.pontos})`;
  selEvento.appendChild(opt);
});

const selCrianca = document.getElementById('selCrianca');
const listaEventos = document.getElementById('listaEventos');

// ESCUTA EM TEMPO REAL as crianças: mantém o select atualizado
db.ref('criancas').on('value', async (snapshot) => {
  const dados = snapshot.val();
  selCrianca.innerHTML = '';

  if (!dados) {
    selCrianca.innerHTML = '<option value="">Cadastre uma criança primeiro</option>';
    return;
  }

  for (const [id, crianca] of Object.entries(dados)) {
    await garantirResetDiario(id, crianca); // reset diário também roda aqui

    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = crianca.nome;
    selCrianca.appendChild(opt);
  }

  carregarEventos();
});

// Quando trocar de criança, mostra os eventos dela
selCrianca.addEventListener('change', carregarEventos);

// Cadastra uma nova criança (começa o dia no nível 5, pontos = 0)
async function cadastrarCrianca() {
  const nome = document.getElementById('novoNome').value.trim();
  const idade = parseInt(document.getElementById('novaIdade').value);

  if (!nome) { alert('Digite o nome da criança.'); return; }

  await db.ref('criancas').push({
    nome,
    idade: idade || null,
    pontos: 0,
    ultimoDia: hoje(),
  });

  document.getElementById('novoNome').value = '';
  document.getElementById('novaIdade').value = '';
}

// Lança um evento: grava no histórico e move o termômetro
async function lancarEvento() {
  const childId = selCrianca.value;
  const tipo = TIPOS_EVENTO.find(t => t.id === selEvento.value);
  const nota = document.getElementById('txtNota').value.trim();

  if (!childId || !tipo) return;

  const snap = await db.ref(`criancas/${childId}`).get();
  const crianca = snap.val();
  if (!crianca) return;

  await garantirResetDiario(childId, crianca);
  const pontosAtuais = (await db.ref(`criancas/${childId}/pontos`).get()).val() || 0;

  // Grava o evento de hoje (com chave única, ordenada por hora)
  const novoEvento = await db.ref(`eventos/${childId}/${hoje()}`).push({
    tipo: tipo.id,
    label: tipo.label,
    pontos: tipo.pontos,
    nota,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });

  // Guarda a chave do último evento (para permitir "desfazer")
  await db.ref(`ultimoEvento/${childId}`).set(novoEvento.key);

  // Atualiza os pontos (o termômetro sobe/desce sozinho em todos os aparelhos)
  await atualizarPontos(childId, pontosAtuais, tipo.pontos);

  document.getElementById('txtNota').value = '';
}

// Desfaz o último evento lançado para a criança selecionada
async function desfazerUltimo() {
  const childId = selCrianca.value;
  if (!childId) return;

  const keySnap = await db.ref(`ultimoEvento/${childId}`).get();
  const eventoKey = keySnap.val();
  if (!eventoKey) { alert('Nenhum evento para desfazer hoje.'); return; }

  const evSnap = await db.ref(`eventos/${childId}/${hoje()}/${eventoKey}`).get();
  const evento = evSnap.val();
  if (!evento) { alert('Evento não encontrado.'); return; }

  const pontosAtuais = (await db.ref(`criancas/${childId}/pontos`).get()).val() || 0;

  await db.ref(`eventos/${childId}/${hoje()}/${eventoKey}`).remove();
  await db.ref(`ultimoEvento/${childId}`).remove();
  await atualizarPontos(childId, pontosAtuais, -evento.pontos); // reverte o valor
}

// Mostra os eventos de hoje da criança selecionada (tempo real)
function carregarEventos() {
  const childId = selCrianca.value;
  listaEventos.innerHTML = '<p class="sem-eventos">Carregando...</p>';

  if (!childId) { listaEventos.innerHTML = ''; return; }

  db.ref(`eventos/${childId}/${hoje()}`).on('value', (snapshot) => {
    const dados = snapshot.val();
    listaEventos.innerHTML = '';

    if (!dados) {
      listaEventos.innerHTML = '<p class="sem-eventos">Nenhum evento hoje.</p>';
      return;
    }

    // Inverte para mostrar do mais recente ao mais antigo
    const eventos = Object.entries(dados).reverse();
    eventos.forEach(([id, ev]) => {
      const div = document.createElement('div');
      div.className = 'evento';
      const classe = ev.pontos > 0 ? 'pts-pos' : 'pts-neg';
      div.innerHTML = `
        <span>${ev.hora} — ${ev.label}${ev.nota ? ` <em>(${ev.nota})</em>` : ''}</span>
        <span class="${classe}">${ev.pontos > 0 ? '+' : ''}${ev.pontos}</span>
      `;
      listaEventos.appendChild(div);
    });
  });
}
