// ===== app.js - página inicial: mostra os termômetros em tempo real =====

// Mostra a data de hoje no topo
document.getElementById('dataHoje').textContent =
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

const grade = document.getElementById('grade');

// ESCUTA EM TEMPO REAL: toda vez que qualquer dado mudar no Firebase
// (evento lançado por qualquer aparelho), esta função roda de novo
// e redesenha os termômetros. É isso que mantém todos os dispositivos sincronizados.
db.ref('criancas').on('value', async (snapshot) => {
  const dados = snapshot.val();
  grade.innerHTML = '';

  if (!dados) {
    grade.innerHTML = '<p style="color:#888">Nenhuma criança cadastrada ainda.<br>Vá em ⚙️ Admin para cadastrar.</p>';
    return;
  }

  // Para cada criança: verifica reset diário e desenha o termômetro
  for (const [id, crianca] of Object.entries(dados)) {
    await garantirResetDiario(id, crianca);

    // Pega os pontos atualizados (podem ter zerado agora)
    const pontos = (crianca.ultimoDia === hoje()) ? crianca.pontos : 0;
    const nivel = nivelDe(pontos);

    grade.appendChild(criarTermometro(crianca, nivel, pontos));
  }
});

// Cria o cartão com o termômetro vertical de uma criança
function criarTermometro(crianca, nivel, pontos) {
  const cartao = document.createElement('div');
  cartao.className = 'cartao-termometro';

  // Nome e idade
  const titulo = document.createElement('h2');
  titulo.textContent = crianca.nome;
  cartao.appendChild(titulo);

  const idade = document.createElement('p');
  idade.className = 'idade';
  idade.textContent = crianca.idade ? `${crianca.idade} anos` : '';
  cartao.appendChild(idade);

  // Corpo do termômetro: 9 segmentos (1 embaixo ... 9 no topo)
  const term = document.createElement('div');
  term.className = 'termometro';

  for (let n = 1; n <= 9; n++) {
    const seg = document.createElement('div');
    seg.className = `segmento nivel-${n}`;
    if (n <= nivel) seg.classList.add('ativo');   // preenchido até o nível atual
    if (n === nivel) seg.classList.add('atual');  // marca o nível exato
    term.appendChild(seg);
  }
  cartao.appendChild(term);

  // Rótulo do nível
  const info = NIVEIS[nivel];
  const rotulo = document.createElement('p');
  rotulo.className = 'rotulo-nivel';
  rotulo.textContent = `${info.emoji} ${info.nome}`;
  cartao.appendChild(rotulo);

  if (nivel === 9) {
    const estrela = document.createElement('span');
    estrela.className = 'estrela';
    estrela.textContent = '⭐⭐⭐';
    cartao.appendChild(estrela);
  }

  // Pontos (para conferência dos pais)
  const pts = document.createElement('p');
  pts.className = 'pontos';
  pts.textContent = `Pontos: ${pontos > 0 ? '+' : ''}${pontos}`;
  cartao.appendChild(pts);

  return cartao;
}
