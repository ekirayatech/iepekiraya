import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentPIAR, UsuarioPerfilCatalogItem, AjusteRazonableItem } from '../types/piar';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const ESTUDIANTES_COL = 'estudiantes';

export const getEstudiantes = async (): Promise<StudentPIAR[]> => {
  const querySnapshot = await getDocs(collection(db, ESTUDIANTES_COL));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentPIAR));
};

export const saveEstudiante = async (estudiante: StudentPIAR) => {
  await setDoc(doc(db, ESTUDIANTES_COL, estudiante.id), estudiante);
};

export const deleteEstudiante = async (id: string) => {
  await deleteDoc(doc(db, ESTUDIANTES_COL, id));
};

export const getUsuarios = async (): Promise<UsuarioPerfilCatalogItem[]> => {
  const querySnapshot = await getDocs(collection(db, 'usuarios'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UsuarioPerfilCatalogItem));
};
export const saveUsuario = async (usuario: UsuarioPerfilCatalogItem) => {
  await setDoc(doc(db, 'usuarios', usuario.id), usuario);
};

export const getBancoAjustes = async (): Promise<AjusteRazonableItem[]> => {
  const querySnapshot = await getDocs(collection(db, 'bancoAjustes'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AjusteRazonableItem));
};


export const saveAjuste = async (ajuste: AjusteRazonableItem) => {
  await setDoc(doc(db, 'bancoAjustes', ajuste.id), ajuste);
};

export const deleteAjuste = async (id: string) => {
  await deleteDoc(doc(db, 'bancoAjustes', id));
};

