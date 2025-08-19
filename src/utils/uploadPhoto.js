// src/utils/uploadPhoto.js
import { db, storage } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export const uploadPhoto = async (file) => {
  if (!file) return

  // 1. Storage에 업로드
  const fileRef = ref(storage, `photos/${Date.now()}-${file.name}`)
  await uploadBytes(fileRef, file)

  // 2. 다운로드 URL 가져오기
  const url = await getDownloadURL(fileRef)

  // 3. Firestore에 기록
  await addDoc(collection(db, 'photos'), {
    url,
    createdAt: serverTimestamp(),
  })

  return url
}
