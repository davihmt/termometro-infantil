// ===== CONFIGURAÇÃO DO FIREBASE =====
// ATENÇÃO: você vai substituir estes valores pelos seus.
// Passo a passo no README ou nas instruções do projeto.

const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "COLE_AQUI_SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://COLE_AQUI_SEU_PROJETO-default-rtdb.firebaseio.com",
  projectId: "COLE_AQUI_SEU_PROJETO",
  storageBucket: "COLE_AQUI_SEU_PROJETO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "COLE_AQUI_SEU_APP_ID"
};

// Inicializa o Firebase (compat)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
