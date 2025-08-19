import React, { useEffect, useState, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'

import homeIcon from '../assets/home-icon.png'

export default function AlbumPage() {
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const fileInputRef = useRef(null)
  const nav = useNavigate()

  // Firestore에서 사진 목록 불러오기
  useEffect(() => {
    const fetchPhotos = async () => {
      const querySnapshot = await getDocs(collection(db, 'photos'))
      const list = querySnapshot.docs.map((doc) => doc.data())
      setPhotos(list)
    }
    fetchPhotos()
  }, [])

  // 📂 업로드 버튼 클릭 → 파일선택창 열기
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 📂 파일 선택 후 업로드
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // memo 입력 (선택사항)
    const memo =
      prompt('✨사진에 대한 코멘트 남겨주세요! (없으면 패스!)✨') || ''

    try {
      // Storage 참조 만들기
      const storageRef = ref(storage, `photos/${Date.now()}-${file.name}`)

      // ✅ Firebase SDK로 업로드 (CORS 문제 없음)
      await uploadBytes(storageRef, file)

      // ✅ 업로드된 파일의 다운로드 URL 가져오기
      const url = await getDownloadURL(storageRef)

      // Firestore에 저장
      await addDoc(collection(db, 'photos'), { url, memo })

      // 화면에 즉시 반영
      setPhotos((prev) => [...prev, { url, memo }])
    } catch (err) {
      console.error('업로드 실패:', err)
      alert('업로드 실패')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* 상단 바 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: '12px 24px',

          backdropFilter: 'blur(6px)',

          zIndex: 100,
        }}
      >
        {/* 홈버튼 */}
        <button
          onClick={() => (window.location.href = '/')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <img src={homeIcon} alt="홈으로" style={{ width: 50, height: 50 }} />
        </button>

        {/* 사진 꾸미러가기 */}

        <button type="button" className="btn" onClick={() => nav('/camera')}>
          사진 꾸미러가기
        </button>
      </div>

      {/* 제목 */}
      <h2
        style={{
          margin: '100px 0 20px',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#d63384',
        }}
      >
        2025.08.20 앨범
      </h2>

      {/* 업로드 버튼 */}
      <button className="btn ghost" onClick={handleUploadClick}>
        사진 업로드
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* 사진 목록 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px',
          padding: '20px',
          width: '100%',
        }}
      >
        {photos.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              padding: '8px',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedPhoto(p.url)}
          >
            <img
              src={p.url}
              alt="photo"
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
            {p.memo && (
              <p style={{ marginTop: 8, fontSize: '14px', color: '#444' }}>
                {p.memo}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* 전체보기 모달 */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <img
            src={selectedPhoto}
            alt="fullscreen"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}

      {/* 버튼 스타일 */}
      <style>{`
        .btn {
          background: linear-gradient(135deg, #ff69b4, #ff85c7);
          color: #fff;
          border: 0;
          border-radius: 9999px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(255,105,180,.25);
          transition: all .2s ease;
        }
        .btn:hover { filter: brightness(1.05); }
        .btn.ghost {
          background: #fff;
          color: #ff69b4;
          border: 2px solid #ff69b4;
          box-shadow: none;
        }
      `}</style>
    </div>
  )
}
