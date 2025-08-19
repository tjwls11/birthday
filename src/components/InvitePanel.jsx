import React, { useState } from 'react'
import seatImg from '../assets/seat-chart.png' // 좌석표 이미지 추가

export default function InvitePanel({ open, onClose, photoUrl }) {
  const [seatOpen, setSeatOpen] = useState(false)

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.()
  }

  return (
    <div
      className={`invite-panel ${open ? 'open' : ''}`}
      aria-hidden={!open}
      onClick={handleBackdrop}
    >
      <div className="invite-card" role="dialog" aria-modal="true">
        <button className="invite-close" aria-label="닫기" onClick={onClose}>
          ×
        </button>

        <div
          className="invite-photo"
          style={{
            backgroundImage: `url('${photoUrl || ''}')`,
          }}
        />

        <div className="invite-row">
          <span className="invite-label">날짜</span> 8/20
        </div>
        <div className="invite-row">
          <span className="invite-label">시간</span> 19:00
        </div>
        <div className="invite-row">
          <span className="invite-label">장소</span>
          <a
            href="https://naver.me/FYqIDxTP"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#c2255c', textDecoration: 'underline' }}
          >
            서울 마포구 와우산로 15길 40 302호
          </a>
        </div>
        <div className="invite-row">
          <span className="invite-label">인원</span> 26명
          <button
            style={{
              marginLeft: '10px',
              padding: '4px 10px',
              background: '#ff9eb5',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => setSeatOpen(true)}
          >
            좌석 보기
          </button>
        </div>
        <div className="invite-row">
          <span className="invite-label">참석비</span> 30,000원
        </div>
        <div className="invite-row">
          <span className="invite-label">드레스코드</span> 무채색
        </div>

        <div className="invite-title">BIRTHDAY PARTY</div>
        <div className="invite-subtitle">생일파티에 초대합니다!</div>
      </div>

      {/* 좌석표 팝업 */}
      {seatOpen && (
        <div
          className="seat-panel"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSeatOpen(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            className="seat-card"
            style={{
              background: '#fffafc',
              padding: '20px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '600px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              className="seat-close"
              aria-label="좌석표 닫기"
              onClick={() => setSeatOpen(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                fontSize: '22px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              ×
            </button>

            <h2 style={{ marginBottom: '15px' }}>테이블 좌석 배치</h2>
            <img
              src={seatImg}
              alt="좌석표"
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
