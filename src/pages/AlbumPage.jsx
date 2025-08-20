// src/pages/AlbumPage.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { db, storage } from '../firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import homeIcon from '../assets/home-icon.png'

export default function AlbumPage() {
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 2
  const WINDOW_LEN = 5

  const fileInputRef = useRef(null)

  // 실시간 구독 (업로드 시간순)
  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setPhotos(list)
      },
      (err) => console.error('onSnapshot error:', err)
    )
    return () => unsub()
  }, [])

  // 총 페이지
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(photos.length / PAGE_SIZE)),
    [photos.length]
  )

  // 새 사진 추가되면 마지막 페이지로
  useEffect(() => {
    setCurrentPage((prev) => {
      const next = Math.min(totalPages, Math.max(1, prev))
      if (totalPages !== prev && totalPages > prev) return totalPages
      return next
    })
  }, [totalPages])

  // 현재 페이지 데이터
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return photos.slice(start, start + PAGE_SIZE)
  }, [photos, currentPage])

  // 페이지 이동
  const goPage = useCallback(
    (p) => setCurrentPage(Math.min(totalPages, Math.max(1, p))),
    [totalPages]
  )

  // 업로드 트리거
  const handleUploadClick = () => fileInputRef.current?.click()

  // 업로드 → URL → Firestore 저장
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const memo = prompt('✨사진에 대한 코멘트 남겨주세요! (없으면 패스!)✨') || ''

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `photos/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      await addDoc(collection(db, 'photos'), {
        url,
        memo,
        createdAt: serverTimestamp(),
      })
      alert('사진이 업로드되었어요!')
    } catch (err) {
      console.error('업로드/저장 실패:', err)
      alert('업로드/저장 실패: ' + (err?.message || '알 수 없는 오류'))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ----- 페이지네이션: 이전/다음 = 한 칸 이동, 숫자 버튼 최대 5개 슬라이딩 -----
  const windowStart = useMemo(() => {
    if (totalPages <= WINDOW_LEN) return 1
    // current를 중앙 근처에 두되 경계에서는 고정
    const half = Math.floor(WINDOW_LEN / 2) // 2
    let start = currentPage - half
    if (start < 1) start = 1
    if (start + WINDOW_LEN - 1 > totalPages) start = totalPages - WINDOW_LEN + 1
    return start
  }, [currentPage, totalPages])

  const windowEnd = Math.min(totalPages, windowStart + WINDOW_LEN - 1)
  const windowPages = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd]
  )

  const canPrevPage = currentPage > 1
  const canNextPage = currentPage < totalPages
  // -------------------------------------------------------

  return (
    <div className="album-root">
      {/* 상단 바 */}
      <div className="album-header">
        <button
          onClick={() => (window.location.href = '/')}
          className="album-icon-btn"
          aria-label="홈으로"
          title="홈으로"
        >
          <img src={homeIcon} alt="" draggable="false" />
        </button>
      </div>

      {/* 본문 컨테이너 */}
      <main className="album-content">
        <section className="album-top">
          <div className="album-title-wrap">
            <h2 className="album-title">2025.08.20 앨범</h2>
            <p className="album-subtitle">
              오늘을 추억하기 위한 사진을 업로드해주세요.<br />
              사진을 클릭하면 전체크기로 보입니다.
            </p>
          </div>

          <div className="album-actions">
            <button
              className="album-btn album-btn--ghost"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? '업로드 중…' : '사진 업로드'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/* 사진 2장 그리드 */}
        <section className="album-grid">
          {pageSlice.map((p) => (
            <div
              key={p.id || p.url}
              className="album-card"
              onClick={() => setSelectedPhoto(p.url)}
            >
              <img
                src={p.url}
                alt="photo"
                loading="lazy"
                decoding="async"
                className="album-img"
              />
              {p.memo && <p className="album-memo">{p.memo}</p>}
            </div>
          ))}

          {photos.length === 0 && (
            <p className="album-empty">
              아직 사진이 없어요. ↑ ‘사진 업로드’를 눌러 추가해보세요!
            </p>
          )}
        </section>
      </main>

      {/* 페이지네이션 (하단 고정, 배경 제거, 이전/다음 = 한 칸 이동) */}
      {photos.length > 0 && (
        <nav className="album-pagination" aria-label="페이지 이동">
          <div className="album-pagination__inner">
            {/* 한 칸 이전 */}
            <button
              className="album-page-btn album-page-btn--nav"
              disabled={!canPrevPage}
              onClick={() => goPage(currentPage - 1)}
            >
              이전
            </button>

            {/* 숫자 버튼 (최대 5개) */}
            {windowPages.map((p) => (
              <button
                key={p}
                className={`album-page-btn ${
                  currentPage === p ? 'album-page-btn--active' : ''
                }`}
                onClick={() => goPage(p)}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            {/* 한 칸 다음 */}
            <button
              className="album-page-btn album-page-btn--nav"
              disabled={!canNextPage}
              onClick={() => goPage(currentPage + 1)}
            >
              다음
            </button>
          </div>
        </nav>
      )}

      {/* 전체보기 모달 */}
      {selectedPhoto && (
        <div className="album-modal" onClick={() => setSelectedPhoto(null)}>
          <img
            src={selectedPhoto}
            alt="fullscreen"
            className="album-modal-img"
          />
        </div>
      )}

      <style>{`
        :root {
          --album-header-h: 64px;
          --album-max-w: 960px;
          --album-grid-gap: 16px;
          --album-bottom-safe: calc(env(safe-area-inset-bottom, 0px) + 12px);
          --pink: #ff69b4;
        }

        .album-root {
          min-height: 100vh;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
          color: #222;
          background: transparent; /* 전체 배경 투명 */
        }

        /* 상단바 */
        .album-header {
          position: static;
          height: var(--album-header-h);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 12px 16px;
          background: none;
          z-index: 100;
        }
        .album-icon-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          line-height: 0;
        }
        .album-icon-btn img {
          width: 44px;
          height: 44px;
          display: block;
        }

        /* 본문 */
        .album-content {
          padding: 12px 16px 120px; /* 하단 고정 네비 공간 확보 */
          max-width: var(--album-max-w);
          margin: 0 auto;
          box-sizing: border-box;
          width: 100%;
        }

        .album-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .album-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .album-title {
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 800;
          color: #d63384;
          margin: 0;
        }
        .album-subtitle {
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
          color: #555;
        }

        .album-actions {
          display: flex;
          gap: 8px;
        }

        .album-btn {
          background: linear-gradient(135deg, var(--pink), #ff85c7);
          color: #fff;
          border: 0;
          border-radius: 9999px;
          padding: 10px 18px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          transition: transform .04s ease;
        }
        .album-btn--ghost {
          background: #fff;
          color: var(--pink);
          border: 2px solid var(--pink);
        }
        .album-btn:active { transform: translateY(1px); }
        .album-btn:disabled { opacity: .6; cursor: not-allowed; }

        /* 그리드 */
        .album-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(220px, 1fr));
          gap: var(--album-grid-gap);
          width: 100%;
          margin-top: 16px;
        }
        @media (max-width: 560px) {
          .album-grid { grid-template-columns: 1fr; }
        }

        .album-card {
          background: #fff; /* 카드 내부 배경 (필요 없으면 transparent로) */
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.16);
          padding: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .album-img {
          width: 100%;
          height: 240px;
          object-fit: cover;
          border-radius: 12px;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
        }
        .album-memo {
          margin-top: 8px;
          font-size: 14px;
          color: #444;
          word-break: break-word;
          white-space: pre-wrap;
        }
        .album-empty {
          grid-column: 1 / -1;
          color: #666;
          text-align: center;
        }

        /* 페이지네이션 (고정, 배경 제거) */
        .album-pagination {
          position: fixed;
          left: 0;
          right: 0;
          bottom: var(--album-bottom-safe);
          display: flex;
          justify-content: center;
          z-index: 110;
          pointer-events: none;
        }
        .album-pagination__inner {
          pointer-events: auto;
          display: flex;
          gap: 8px;
          padding: 0;
          border-radius: 9999px;
          background: transparent; /* 배경 제거 */
          backdrop-filter: none;    /* 블러 제거 */
          box-shadow: none;         /* 그림자 제거 */
          max-width: calc(var(--album-max-w) + 32px);
        }

        .album-page-btn {
          min-width: 44px;
          height: 40px;
          padding: 0 12px;
          border-radius: 9999px;
          border: 2px solid var(--pink);
          background: var(--pink);
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: transform .04s ease;
        }
        .album-page-btn--nav {
          font-weight: 700;
        }
        .album-page-btn--active {
          background: #fff;
          color: var(--pink);
        }
        .album-page-btn:active { transform: translateY(1px); }
        .album-page-btn:disabled { opacity: .45; cursor: not-allowed; }

        /* 모달 */
        .album-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }
        .album-modal-img {
          max-width: 90%;
          max-height: 90%;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
        }
      `}</style>
    </div>
  )
}
