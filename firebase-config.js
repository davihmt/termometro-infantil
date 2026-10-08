// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgO2CpNuHVHILDvd5uz7VIlG5peG1hLWY",
  authDomain: "termometro-infantil.firebaseapp.com",
  databaseURL: "https://termometro-infantil-default-rtdb.firebaseio.com",
  projectId: "termometro-infantil",
  storageBucket: "termometro-infantil.firebasestorage.app",
  messagingSenderId: "766557242567",
  appId: "1:766557242567:web:826ab1315bb252a6116ae2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);