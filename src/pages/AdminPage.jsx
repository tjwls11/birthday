import React, { useEffect, useState } from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [list, setList] = useState([])
  const [loaded, setLoaded] = useState(false)

  async function load() {
    setLoaded(false)
    try {
      const res = await fetch(
        `${API_BASE}/api/messages?key=${encodeURIComponent(key)}`
      )
      if (!res.ok) throw new Error('권한 오류 또는 서버 오류')
      const data = await res.json()
      setList(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    // 자동 로드는 보안상 비활성. 필요시 아래 호출
  }, [])

  return (
    <div className="admin-wrap">
      <div className="admin-card">
        <h3>🎂 관리자 페이지 (주인공 전용)</h3>
        <input
          placeholder="관리자 키"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button className="btn" onClick={load}>
            불러오기
          </button>
        </div>
      </div>

      <div className="admin-card">
        <h4>메시지 목록</h4>
        {!loaded ? (
          <p>불러오는 중...</p>
        ) : (
          <div className="admin-list">
            {list.length === 0 ? (
              <p>메시지가 없습니다.</p>
            ) : (
              list.map((m) => (
                <div className="admin-item" key={m._id}>
                  <div>
                    <b>{m.nickname}</b>{' '}
                    <small>({new Date(m.createdAt).toLocaleString()})</small>
                  </div>
                  <div>{m.text}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
