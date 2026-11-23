import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5JjnL_Noja2bqnIuvcVLCL_oVgFBiKaM",
  authDomain: "galpon-de-pollos.firebaseapp.com",
  databaseURL: "https://galpon-de-pollos-default-rtdb.firebaseio.com",
  projectId: "galpon-de-pollos",
  storageBucket: "galpon-de-pollos.firebasestorage.app",
  messagingSenderId: "963179027661",
  appId: "1:963179027661:web:7f613748cf7fc21f949d84",
  measurementId: "G-F9BVDXGZ8Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);


