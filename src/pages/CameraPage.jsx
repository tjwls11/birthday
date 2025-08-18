import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import Moveable from 'react-moveable'
import * as htmlToImage from 'html-to-image'

import homeIcon from '../assets/home-icon.png'
import { STICKER_CATEGORIES } from './stickerCategories'

export default function CameraPage() {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [usingCamera, setUsingCamera] = useState(false)
  const [facing, setFacing] = useState('user')

  const [stickers, setStickers] = useState([])
  const [selectedStickerId, setSelectedStickerId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

  const [message, setMessage] = useState('')
  const webcamRef = useRef(null)
  const fileInputRef = useRef(null)
  const photoAreaRef = useRef(null)

  // 📸 사진 촬영
  const capture = () => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()
    setPhotoUrl(imageSrc)
    setUsingCamera(false)
  }

  // 📂 사진 가져오기
  const pickPhoto = () => fileInputRef.current?.click()
  const onPhotoPicked = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Blob → DataURL 변환
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoUrl(reader.result) // ✅ base64 DataURL 저장
    }
    reader.readAsDataURL(file)

    setUsingCamera(false)
  }

  // 💾 사진 저장
  const savePhoto = async () => {
    if (!photoAreaRef.current) return

    const prevSelected = selectedStickerId
    setSelectedStickerId(null)

    setTimeout(async () => {
      try {
        const dataUrl = await htmlToImage.toPng(photoAreaRef.current, {
          cacheBust: true,
          pixelRatio: 2,
        })
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'photo.png'
        link.click()

        setMessage('사진이 저장되었습니다 ✅')
        setTimeout(() => setMessage(''), 2000)
      } catch (err) {
        console.error('저장 실패:', err)
        setMessage('저장 실패 ❌')
        setTimeout(() => setMessage(''), 2000)
      }

      if (prevSelected) setSelectedStickerId(prevSelected)
    }, 50)
  }

  // ❌ 취소
  const cancelPhoto = () => {
    setPhotoUrl(null)
    setUsingCamera(false)
    setStickers([])
  }

  // ➕ 스티커 추가
  const addSticker = (src) => {
    if (!photoUrl) return alert('사진이 있을 때만 스티커를 붙일 수 있어요!')
    const id = Date.now()
    setStickers((prev) => [
      ...prev,
      { id, src, x: 100, y: 100, width: 80, height: 80, rotation: 0 },
    ])
  }

  // 🗑️ 스티커 삭제
  const removeSticker = () => {
    if (!selectedStickerId) return
    setStickers((prev) => prev.filter((s) => s.id !== selectedStickerId))
    setSelectedStickerId(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        position: 'relative',
      }}
    >
      {/* 🏠 홈 버튼 */}
      <button
        onClick={() => (window.location.href = '/')}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <img src={homeIcon} alt="홈으로" style={{ width: 36, height: 36 }} />
      </button>

      {/* 상단 버튼 */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className="btn ghost" onClick={cancelPhoto}>
          취소
        </button>
        <button className="btn" onClick={savePhoto}>
          사진 저장
        </button>
        <button
          className="btn ghost"
          onClick={removeSticker}
          disabled={!selectedStickerId}
        >
          스티커 삭제
        </button>
      </div>

      {/* 파일 선택 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onPhotoPicked}
        style={{ display: 'none' }}
      />

      {/* 📷 사진 + 스티커 들어가는 영역 */}
      <div
        ref={photoAreaRef}
        style={{
          width: '90vw',
          maxWidth: '600px',
          aspectRatio: '2 / 3',
          border: '3px solid #c4b5fd',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          background: '#fff',
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="uploaded"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#fff',
            }}
          />
        ) : usingCamera ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/png"
              videoConstraints={{ facingMode: facing }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8,
              }}
            >
              <button
                className="btn ghost"
                onClick={() =>
                  setFacing((p) => (p === 'user' ? 'environment' : 'user'))
                }
              >
                전/후면 전환
              </button>
              <button className="btn" onClick={capture}>
                촬영
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 16 }}>
              카메라 또는 사진 선택
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => setUsingCamera(true)}>
                카메라
              </button>
              <button className="btn ghost" onClick={pickPhoto}>
                사진 가져오기
              </button>
            </div>
          </div>
        )}

        {/* 🖼️ 스티커들 */}
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            data-id={sticker.id}
            style={{
              position: 'absolute',
              top: sticker.y,
              left: sticker.x,
              width: sticker.width,
              height: sticker.height,
              transform: `rotate(${sticker.rotation}deg)`,
            }}
            onClick={() => setSelectedStickerId(sticker.id)}
          >
            <img
              src={sticker.src}
              alt="sticker"
              style={{
                width: '100%',
                height: '100%',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        ))}

        {/* 🎛️ Moveable 컨트롤 */}
        {selectedStickerId && (
          <Moveable
            target={document.querySelector(`[data-id='${selectedStickerId}']`)}
            draggable={true}
            resizable={true}
            rotatable={true}
            onDrag={({ beforeTranslate }) => {
              setStickers((prev) =>
                prev.map((s) =>
                  s.id === selectedStickerId
                    ? { ...s, x: beforeTranslate[0], y: beforeTranslate[1] }
                    : s
                )
              )
            }}
            onResize={({ width, height }) => {
              setStickers((prev) =>
                prev.map((s) =>
                  s.id === selectedStickerId ? { ...s, width, height } : s
                )
              )
            }}
            onRotate={({ beforeRotate }) => {
              setStickers((prev) =>
                prev.map((s) =>
                  s.id === selectedStickerId
                    ? { ...s, rotation: beforeRotate }
                    : s
                )
              )
            }}
          />
        )}
      </div>

      {/* 📂 스티커 카테고리 버튼 */}
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {Object.keys(STICKER_CATEGORIES).map((key) => (
          <button
            key={key}
            onClick={() =>
              setActiveCategory((prev) => (prev === key ? null : key))
            }
            style={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              border: '2px solid #c4b5fd',
              background: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src={STICKER_CATEGORIES[key].stickers[0]}
              alt={STICKER_CATEGORIES[key].name}
              style={{ width: 40, height: 40 }}
            />
          </button>
        ))}
      </div>

      {/* 📌 카테고리 열리면 스티커 리스트 (가로 스크롤) */}
      {activeCategory && (
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            overflowX: 'auto',
            gap: 12,
            padding: '8px',
            border: '2px solid #c4b5fd',
            borderRadius: '12px',
            maxWidth: '90vw',
          }}
        >
          {STICKER_CATEGORIES[activeCategory].stickers.map((s, i) => (
            <button
              key={i}
              onClick={() => addSticker(s)}
              style={{
                minWidth: 64,
                minHeight: 64,
                borderRadius: '12px',
                border: '2px solid #c4b5fd',
                background: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <img
                src={s}
                alt={`sticker${i}`}
                style={{ width: 40, height: 40 }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ✅ 저장/실패 메시지 */}
      {message && (
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {/* 버튼 스타일 */}
      <style>{`
        .btn {
          background: linear-gradient(135deg, #ff69b4, #ff85c7);
          color: #fff;
          border: 0;
          border-radius: 9999px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(255,105,180,.25);
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
