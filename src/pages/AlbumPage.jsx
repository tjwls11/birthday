import React, { useEffect, useMemo, useState, useRef } from 'react'
import { db, storage } from '../firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import homeIcon from '../assets/home-icon.png'

export default function AlbumPage() {
  // -------------------- 📸 앨범 로직 --------------------
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const fileInputRef = useRef(null)

  // Firestore 읽기 (마운트 시)
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'photos'))
        const list = querySnapshot.docs.map((doc) => doc.data())
        setPhotos(list)
      } catch (err) {
        console.error('사진 불러오기 실패:', err)
        alert('사진 불러오기 실패')
      }
    }
    fetchPhotos()
  }, [])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const memo = prompt('✨사진에 대한 코멘트 남겨주세요! (없으면 패스!)✨') || ''
    try {
      const storageRef = ref(storage, `photos/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await addDoc(collection(db, 'photos'), { url, memo })

      // 업로드 후 로컬 상태에도 반영 + 마지막 페이지로 이동
      setPhotos((prev) => {
        const updated = [...prev, { url, memo }]
        // 아래에서 totalPages 재계산을 위해 반환만 하고, 페이지 이동은 setTimeout으로 다음 렌더에서 처리
        setTimeout(() => {
          const totalPagesAfter = Math.max(1, Math.ceil(updated.length / PAGE_SIZE))
          setPage(totalPagesAfter)
        }, 0)
        return updated
      })
    } catch (err) {
      console.error('업로드 실패:', err)
      alert('업로드 실패')
    }
  }

  // -------------------- 📄 페이지네이션 (2장/페이지) --------------------
  const PAGE_SIZE = 2
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(photos.length / PAGE_SIZE))

  // 사진 개수가 줄어들거나 늘어날 때 현재 페이지가 범위를 벗어나지 않도록 보정
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const pagedPhotos = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return photos.slice(start, end)
  }, [photos, page])

  const canPrev = page > 1
  const canNext = page < totalPages

  // -------------------- UI --------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* 상단 바 (고정) */}
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
        {/* 가운데 공간 채우기 (버튼 삭제에 따른 레이아웃 균형) */}
        <div style={{ width: 50, height: 50 }} />
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

      {/* 사진 목록 (페이지별) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px',
          padding: '20px',
          width: '100%',
        }}
      >
        {pagedPhotos.map((p, i) => (
          <div
            key={`${page}-${i}-${p.url}`}
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

      {/* 페이지네이션 컨트롤 */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
        <button className="btn" disabled={!canPrev} onClick={() => canPrev && setPage((p) => p - 1)}>
          이전
        </button>
        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {page} / {totalPages}
        </span>
        <button className="btn" disabled={!canNext} onClick={() => canNext && setPage((p) => p + 1)}>
          다음
        </button>
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
        .btn:disabled { opacity: .5; cursor: not-allowed; }
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
