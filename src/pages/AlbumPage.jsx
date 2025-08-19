import React, { useEffect, useMemo, useState, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useNavigate } from 'react-router-dom'

import homeIcon from '../assets/home-icon.png'

export default function AlbumPage() {
  // -------------------- 🔒 오픈 가드 --------------------
  // 공개 시각을 "고정된 날짜/시간(KST)"로 설정
  const OPEN_AT_KST_ISO = '2025-08-20T17:00:00+09:00'

  // 고정 시각을 UTC epoch(ms)로
  const targetEpoch = useMemo(() => Date.parse(OPEN_AT_KST_ISO), [])
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const isOpen = now >= targetEpoch
  const remain = Math.max(0, targetEpoch - now)
  const hh = String(Math.floor(remain / 3600000)).padStart(2, '0')
  const mm = String(Math.floor((remain % 3600000) / 60000)).padStart(2, '0')
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, '0')

  // -------------------- 📸 앨범 로직 --------------------
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const fileInputRef = useRef(null)
  const nav = useNavigate()

  // 오픈 "이후"에만 Firestore 읽기
  useEffect(() => {
    if (!isOpen) return
    const fetchPhotos = async () => {
      const querySnapshot = await getDocs(collection(db, 'photos'))
      const list = querySnapshot.docs.map((doc) => doc.data())
      setPhotos(list)
    }
    fetchPhotos()
  }, [isOpen])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const memo =
      prompt('✨사진에 대한 코멘트 남겨주세요! (없으면 패스!)✨') || ''
    try {
      const storageRef = ref(storage, `photos/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await addDoc(collection(db, 'photos'), { url, memo })
      setPhotos((prev) => [...prev, { url, memo }])
    } catch (err) {
      console.error('업로드 실패:', err)
      alert('업로드 실패')
    }
  }

  // -------------------- ⏳ 오픈 전 화면 --------------------
  if (!isOpen) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {/* 홈 버튼 (고정) */}
        <button
          onClick={() => (window.location.href = '/')}
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="홈으로"
          title="홈으로"
        >
          <img src={homeIcon} alt="" style={{ width: 44, height: 44 }} />
        </button>

        <h1 style={{ margin: 0, fontSize: 24 }}> 2025.08.20 앨범</h1>
        <p style={{ margin: 0, color: '#666' }}>
          <b>2025-08-20 17:00</b> 이후에 열립니다.
        </p>
        <div
          style={{
            marginTop: 8,
            padding: '10px 16px',
            border: '2px solid #c4b5fd',
            borderRadius: 12,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          오픈까지 {hh}:{mm}:{ss}
        </div>

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

  // -------------------- ✅ 오픈 이후 실제 앨범 화면 --------------------
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
          aria-label="홈으로"
          title="홈으로"
        >
          <img src={homeIcon} alt="" style={{ width: 50, height: 50 }} />
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
