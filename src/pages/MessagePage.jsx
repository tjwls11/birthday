import React, { useRef, useState } from 'react'
import homeIcon from '../assets/home-icon.png' // 홈 버튼 이미지 (분홍색)
import bgImg from '../assets/message-bg.png' // 배경 이미지
import hachuping from '../assets/hachuping.png'

export default function MessagePage() {
  const [formOpen, setFormOpen] = useState(false)
  const [nickname, setNickname] = useState('')
  const [text, setText] = useState('')
  const containerRef = useRef(null)

  const RAINBOW = [
    [255, 59, 48],
    [255, 149, 0],
    [255, 214, 10],
    [52, 199, 89],
    [0, 122, 255],
    [88, 86, 214],
    [175, 82, 222],
  ]

  function submit(e) {
    e.preventDefault()
    if (!nickname.trim() || !text.trim()) return

    // 풍선 여러 개 추가
    spawnBalloon()

    // 입력값 초기화
    setNickname('')
    setText('')
    setFormOpen(false)
  }

  function spawnBalloon() {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const w = rect.width || window.innerWidth
    const h = rect.height || window.innerHeight
    const x = rand(w * 0.18, w * 0.82)
    const y = rand(h * 0.25, h * 0.75)

    const b = document.createElement('div')
    b.className = 'balloon-float'

    const size = rand(36, 58)
    b.style.width = `${size}px`
    b.style.height = `${size}px`
    b.style.left = `${x - size / 2}px`
    b.style.top = `${y - size / 2}px`

    const [r, g, bl] = RAINBOW[Math.floor(Math.random() * RAINBOW.length)]
    const alpha = rand(0.22, 0.4)
    b.style.setProperty('--balloon-bg', `rgba(${r},${g},${bl},${alpha})`)
    b.style.setProperty('--balloon-border', `rgba(${r},${g},${bl},0.9)`)

    const dur = rand(5, 9)
    const drift = rand(3, 6)
    const mx = rand(10, 28)
    b.style.setProperty('--dur', `${dur}s`)
    b.style.setProperty('--drift', `${drift}s`)
    b.style.setProperty('--mx', `${mx}px`)

    el.appendChild(b)
    setTimeout(() => b.remove(), 12000)
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min
  }

  return (
    <div className="message-page" style={{ position: 'relative' }}>
      {/* 홈 버튼 */}
      <button className="home-btn" onClick={() => (window.location.href = '/')}>
        <img src={homeIcon} alt="홈으로" />
      </button>
      <p
        style={{
          position: 'absolute',
          top: '80px', // 화면 상단에서 60px 내려옴
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '17px',
          color: 'deeppink',
          whiteSpace: 'nowrap',
        }}
      >
        나연이에게 축하메시지를 보내주세요 <br />
        메시지를 보낼 때마다 풍선이 추가됩니다{' '}
      </p>
      {/* 배경 이미지를 태그로 넣어서 크기 쉽게 제어 */}
      <img
        src={bgImg}
        alt="배경"
        className="msg-bg-img"
        style={{
          width: 'min(300px, 94vw)',
          height: 'auto',
          display: 'block',
          margin: '200px auto 0', // ← 위쪽 여백 줘서 이미지 아래로 내리기
          filter: 'brightness(0.92)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* 풍선 올라가는 영역 */}
      <div id="balloon-container" ref={containerRef} />

      {/* 오른쪽 하단 메시지 버튼 */}
      <button
        className="fab"
        onClick={() => setFormOpen(true)}
        aria-label="메시지 작성"
      >
        💌
      </button>

      {/* 메시지 입력 폼 (모달) */}
      {formOpen && (
        <div className="msg-modal" onClick={() => setFormOpen(false)}>
          <div className="msg-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center' }}>
              🎈나연이에게 메시지 남기기 🎈
            </h3>
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: 'red',
                marginTop: '-8px',
              }}
            >
              *작성한 메시지는 오늘의 주인공에게 전달됩니다*
            </p>
            <form onSubmit={submit}>
              <input
                placeholder="이름"
                maxLength={12}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{ marginBottom: '5px' }}
              />
              <textarea
                placeholder="메시지를 적어주세요!"
                maxLength={120}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div className="msg-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setFormOpen(false)}
                >
                  닫기
                </button>
                <button className="btn">보내기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
