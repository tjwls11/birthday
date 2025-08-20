import React, { useRef, useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import homeIcon from '../assets/home-icon.png'
import bgImg from '../assets/message-bg.png'

export default function MessagePage() {
  const [formOpen, setFormOpen] = useState(false)
  const [nickname, setNickname] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
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

  // Firestore 구독 (실시간 반영)
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setMessages(data)
    })
    return () => unsub()
  }, [])

  // 메시지 수만큼 풍선 다시 그림
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.innerHTML = ''
    messages.forEach(() => spawnBalloon(el))
  }, [messages])

  async function submit(e) {
    e.preventDefault()
    if (!nickname.trim() || !text.trim()) return

    await addDoc(collection(db, 'messages'), {
      nickname,
      text,
      createdAt: serverTimestamp(),
    })

    setNickname('')
    setText('')
    setFormOpen(false)
  }

  function spawnBalloon(el) {
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
          top: '150px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          fontSize: '17px',
          color: 'deeppink',
          whiteSpace: 'nowrap',
        }}
      >
        나연이에게 축하메시지를 보내주세요 <br />
        메시지를 보낼 때마다 풍선이 추가됩니다
      </p>

      <img
        src={bgImg}
        alt="배경"
        className="msg-bg-img"
        style={{
          width: 'min(300px, 94vw)',
          height: 'auto',
          display: 'block',
          margin: '300px auto 0',
          filter: 'brightness(0.92)',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      <div id="balloon-container" ref={containerRef} />

      <button
        className="fab"
        onClick={() => setFormOpen(true)}
        aria-label="메시지 작성"
      >
        💌
      </button>

      {formOpen && (
        <div className="msg-modal" onClick={() => setFormOpen(false)}>
          <div className="msg-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ textAlign: 'center' }}>
              🎈나연이에게 메시지 남기기 🎈
            </h3>
            <form onSubmit={submit}>
              <input
                placeholder="이름"
                maxLength={12}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <textarea
                placeholder="메시지를 적어주세요!"
                maxLength={5000}
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
