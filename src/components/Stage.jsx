import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import kitty from '../assets/kitty-ui.png'
import iconMessage from '../assets/icon-message-pink.png'
import iconCamera from '../assets/icon-camera-pink.png'
import bgmFile from '../assets/bgm.mp3'

export default function Stage({ onEnvelopeToggle }) {
  const nav = useNavigate()
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const handleHotspotKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEnvelopeToggle?.()
    }
  }

  // 🔊 재생/정지 토글
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          console.log('자동재생 차단됨. 사용자 입력 필요!')
        })
    }
  }

  // 공통 스타일
  const circleImgStyle = {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
  }
  const circleBtnStyle = {
    width: 100,
    height: 100,
    border: 'none',
    background: 'none',
    padding: 0,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }

  // 상단 바 높이(아이콘 영역을 이 높이만큼 아래로 밀어줌)
  const TOPBAR_H = 48 // px

  return (
    <div className="stage-wrap">
      {/* 🔊 BGM 오디오 */}
      <audio ref={audioRef} src={bgmFile} loop />

      {/* 🔝 상단 고정 재생바 (모바일 safe-area 고려) */}
      <div
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff0f5',
          border: '2px solid #ff9eb5',
          borderRadius: '20px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          fontFamily: '"Cute Font", cursive',
          boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
          // 좁은 화면에서 최대폭 제한
          maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <span style={{ fontSize: '18px', color: '#ff4d88' }}>🎵 BGM</span>
        <button
          onClick={togglePlay}
          style={{
            border: 'none',
            background: '#ffb6c1',
            borderRadius: '14px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#fff',
          }}
        >
          {playing ? '⏸ 일시정지' : '▶ 재생'}
        </button>
      </div>

      <div
        className="stage"
        // ⬇️ 상단바 높이만큼 여백을 줘서 아이콘/키티가 겹치지 않게
        style={{
          paddingTop: `calc(${TOPBAR_H}px + env(safe-area-inset-top, 0px) + 16px)`,
        }}
      >
        {/* 상단 중앙 아이콘(메시지 / 카메라) */}
        <div className="icon-buttons in-stage">
          <button
            type="button"
            className="icon-btn"
            aria-label="메시지"
            title="메시지"
            onClick={() => nav('/message')}
            style={circleBtnStyle}
          >
            <img
              src={iconMessage}
              alt=""
              aria-hidden="true"
              draggable="false"
              style={circleImgStyle}
            />
          </button>

          <button
            type="button"
            className="icon-btn"
            aria-label="카메라"
            title="카메라"
            onClick={() => nav('/album')}
            style={circleBtnStyle}
          >
            <img
              src={iconCamera}
              alt=""
              aria-hidden="true"
              draggable="false"
              style={circleImgStyle}
            />
          </button>
        </div>

        {/* 키티 이미지 */}
        <img
          src={kitty}
          alt="편지를 들고 있는 헬로키티"
          className="kitty-img"
          draggable="false"
          style={{ paddingTop: '40px' }}
        />

        {/* 봉투 클릭 핫스팟 */}
        <button
          type="button"
          className="hotspot-env"
          aria-label="초대장 열기"
          title="봉투 열기"
          aria-describedby="envelope-hint"
          onClick={onEnvelopeToggle}
          onKeyDown={handleHotspotKeyDown}
        />

        {/* 안내 문구 */}
        <p id="envelope-hint" className="envelope-hint">
          봉투를 클릭해주세요
        </p>
      </div>
    </div>
  )
}
