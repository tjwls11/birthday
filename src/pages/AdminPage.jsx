import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

// 구글폰트 불러오기
const loadFont = () => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Cute+Font&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}
loadFont()

export default function AdminPage() {
  const [list, setList] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setList(msgs)
    })
    return () => unsub()
  }, [])

  return (
    <div
      style={{
        fontFamily: '"Cute Font", cursive',
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0px, transparent 26px, rgba(255,192,203,0.25) 27px)',
        backgroundSize: '100% 27px',
        minHeight: '100vh',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <h3
        style={{
          fontSize: '28px',
          textAlign: 'center',
          color: '#ff5c8a',
          marginBottom: '16px',
          textShadow: '2px 2px 0 #ffe4ec',
        }}
      >
        🎀 편지 페이지 🎀
      </h3>

      {/* 큰 고정 박스 */}
      <div
        style={{
          background: '#fff',
          border: '3px dashed #ff9eb5',
          borderRadius: '18px',
          boxShadow: '4px 4px 0 #ffc8d9',
          padding: '20px',
          width: '90vw', // 화면 가로 90%
          height: '80vh', // 화면 세로 80%
          maxWidth: '1000px', // PC에서 너무 커지지 않게
          margin: '0 auto',
          overflowY: 'auto', // 메시지 많으면 스크롤
          boxSizing: 'border-box',
        }}
      >
        {list.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa' }}>
            💌 아직 메시지가 없어요 💌
          </p>
        ) : (
          list.map((m) => (
            <div
              key={m.id}
              style={{
                background: '#fff8fb',
                border: '2px solid #ffd6e0',
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '14px',
                boxShadow: '2px 2px 0 #ffcad4',
                wordBreak: 'break-word',
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <b style={{ color: '#ff3e6c', fontSize: '20px' }}>
                  {m.nickname}
                </b>{' '}
                <small style={{ color: '#888', fontSize: '14px' }}>
                  (
                  {m.createdAt?.toDate
                    ? m.createdAt.toDate().toLocaleString()
                    : '시간 없음'}
                  )
                </small>
              </div>
              <div
                style={{
                  whiteSpace: 'pre-line',
                  fontSize: '18px',
                  color: '#444',
                }}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
