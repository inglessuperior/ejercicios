// firebase-config.js
// Este archivo se importa en todas las páginas que necesiten login o guardar resultados.
// Súbelo a la raíz de tu repositorio de GitHub (o a una carpeta /js/ y ajusta las rutas
// de import en las demás páginas).

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAuNomcNThiw0HkaY9qt_wzRal3OEwRsEo",
  authDomain: "curso-superior-d1686.firebaseapp.com",
  projectId: "curso-superior-d1686",
  storageBucket: "curso-superior-d1686.firebasestorage.app",
  messagingSenderId: "149526429301",
  appId: "1:149526429301:web:c8f0bc178cc6b3aa1c423c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Funciones de autenticación ----------

export async function registrarAlumno(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function iniciarSesion(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function cerrarSesion() {
  await signOut(auth);
}

// Llama a `callback(user)` cada vez que cambia el estado de sesión.
// `user` es null si no hay nadie logueado.
export function observarSesion(callback) {
  onAuthStateChanged(auth, callback);
}

// ---------- Funciones de resultados (Firestore) ----------

// Guarda el resultado de un ejercicio para el alumno actualmente logueado.
export async function guardarResultado({ modulo, ejercicio, tipo, aciertos, total }) {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay alumno con sesión iniciada.");

  await addDoc(collection(db, "resultados"), {
    uid: user.uid,
    email: user.email,
    modulo,
    ejercicio,
    tipo,        // "multiple-choice" | "drag-drop" | "fill-blank" | "matching" | etc.
    aciertos,
    total,
    fecha: serverTimestamp()
  });
}

// Obtiene todos los resultados del alumno actualmente logueado, más recientes primero.
export async function obtenerMisResultados() {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay alumno con sesión iniciada.");

  const q = query(
    collection(db, "resultados"),
    where("uid", "==", user.uid),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export { auth, db };
