import React from 'react'

export default function InvitePanel({ open, onClose, photoUrl }) {
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
          <span className="invite-label">인원</span> 24명
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
    </div>
  )
}
