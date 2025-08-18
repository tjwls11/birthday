import React from 'react'
import { useNavigate } from 'react-router-dom'
import kitty from '../assets/kitty-ui.png'
import iconMessage from '../assets/icon-message-pink.png'
import iconCamera from '../assets/icon-camera-pink.png'

export default function Stage({ onEnvelopeToggle }) {
  const nav = useNavigate()

  const handleHotspotKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEnvelopeToggle?.()
    }
  }

  // 공통 스타일
  const circleImgStyle = {
    width: 100,
    height: 100,
    borderRadius: '50%', // 원형 크롭
    objectFit: 'cover', // 꽉 채우고 넘치는 부분은 잘라냄
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

  return (
    <div className="stage-wrap">
      <div className="stage">
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
            onClick={() => nav('/camera')}
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
