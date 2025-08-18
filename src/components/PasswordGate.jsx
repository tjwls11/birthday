import React, { useState } from 'react'

const CORRECT = '0824'
const PROFILE_URL =
  'https://i.pinimg.com/1200x/d4/75/9a/d4759a1b084499c715a995869b0840a2.jpg'

export default function PasswordGate({ onSuccess }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  function submit() {
    if (pw === CORRECT) {
      setErr('')
      onSuccess?.()
    } else {
      setErr('비밀번호가 틀렸습니다!')
      setPw('')
    }
  }

  return (
    <div className="gate">
      <div className="gate-card">
        <img className="avatar-img" src={PROFILE_URL} alt="profile" />
        <h2>비밀번호를 입력해주세요</h2>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="비밀번호 입력"
        />
        <button className="btn" onClick={submit}>
          입장
        </button>
        <div className="hint">hint: 나연이의 생일</div>
        {err && <div className="err">{err}</div>}
      </div>
    </div>
  )
}
