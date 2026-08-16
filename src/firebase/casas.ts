import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from './config'

export interface Casa {
  id: string
  title: string
  images: string[]
  createdAt: Timestamp | null
}

export async function createCasa(title: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Debes iniciar sesión')
  const docRef = await addDoc(collection(db, 'casas'), {
    ownerId: user.uid,
    title,
    images: [],
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

// El procesamiento (webp, máx 1500px, calidad 70) ocurre en el servidor
// (functions/src/index.ts, disparada al subir el archivo original) para
// garantizar que ninguna imagen final quede sin procesar.
export async function uploadCasaImage(casaId: string, file: File) {
  const path = `casas/${casaId}/uploads/${crypto.randomUUID()}-${file.name}`
  const objectRef = storageRef(storage, path)
  await uploadBytes(objectRef, file, { contentType: file.type })
}

// Ordena en el cliente por fecha de creación para no requerir un índice
// compuesto (ownerId + createdAt) en Firestore.
export function watchMyCasas(uid: string, callback: (casas: Casa[]) => void) {
  const q = query(collection(db, 'casas'), where('ownerId', '==', uid))
  return onSnapshot(q, (snap) => {
    const casas = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Casa)
    casas.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
    callback(casas)
  })
}
