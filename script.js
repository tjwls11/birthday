// 요소
const passwordBtn = document.getElementById('password-btn')
const passwordInput = document.getElementById('password-input')
const passwordScreen = document.getElementById('password-screen')
const animationText = document.getElementById('animation-text')

const stage = document.getElementById('stage')
const envelopeToggle = document.getElementById('envelope-toggle')
const inviteBody = document.getElementById('invite-body')
const msgHotspot = document.getElementById('msg-hotspot')

const messageSection = document.getElementById('message-section')
const balloonContainer = document.getElementById('balloon-container')
const messageForm = document.getElementById('message-form')
const nicknameInput = document.getElementById('nickname-input')
const messageInput = document.getElementById('message-input')
const keepOpenChk = document.getElementById('keep-open')
const cancelFormBtn = document.getElementById('cancel-form')
const fabToggle = document.getElementById('fab-toggle')

// 설정
const CORRECT = '0824'
const STORAGE_KEY = 'bd_msgs_v1'
const RAINBOW = [
  [255, 59, 48],
  [255, 149, 0],
  [255, 214, 10],
  [52, 199, 89],
  [0, 122, 255],
  [88, 86, 214],
  [175, 82, 222],
]

// 로그인
if (passwordBtn) passwordBtn.addEventListener('click', handleLogin)
if (passwordInput) {
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin()
  })
}

function handleLogin() {
  if (!passwordInput) return
  if (passwordInput.value === CORRECT) {
    if (passwordScreen && passwordScreen.parentNode)
      passwordScreen.parentNode.removeChild(passwordScreen)
    playIntroAnimation(() => {
      if (stage) {
        stage.classList.remove('hidden')
        stage.setAttribute('aria-hidden', 'false')
      }
    })
  } else {
    alert('비밀번호가 틀렸습니다!')
    passwordInput.value = ''
    passwordInput.focus()
  }
}

// 인트로 애니메이션
function playIntroAnimation(done) {
  if (!animationText) {
    done && done()
    return
  }
  animationText.style.display = 'flex'
  animationText.style.animation = 'none'
  void animationText.offsetWidth
  setTimeout(() => {
    animationText.style.animation = 'slideUpFadeOut 1s forwards'
    setTimeout(() => {
      animationText.style.display = 'none'
      animationText.style.animation = 'none'
      done && done()
    }, 1000)
  }, 5000)
}

// 봉투 토글
if (envelopeToggle && inviteBody) {
  envelopeToggle.addEventListener('click', () => {
    const open = envelopeToggle.getAttribute('aria-expanded') === 'true'
    envelopeToggle.setAttribute('aria-expanded', String(!open))
    inviteBody.classList.toggle('open', !open)
    inviteBody.setAttribute('aria-hidden', String(open))
    if (!open && stage)
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
}

// 말풍선 → 메시지 섹션
if (msgHotspot) {
  msgHotspot.addEventListener('click', () => {
    showMessageSection()
  })
}

// 메시지 폼 열기/닫기/전송
if (fabToggle) {
  fabToggle.addEventListener('click', () => {
    if (messageForm) messageForm.style.display = 'flex'
    fabToggle.style.display = 'none'
    nicknameInput && nicknameInput.focus()
  })
}
if (cancelFormBtn) {
  cancelFormBtn.addEventListener('click', () => {
    if (messageInput) messageInput.value = ''
    if (messageForm) messageForm.style.display = 'none'
    if (fabToggle) fabToggle.style.display = 'flex'
  })
}
if (messageForm) {
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const nick = (nicknameInput?.value || '').trim()
    const msg = (messageInput?.value || '').trim()
    if (!nick || !msg) return

    const msgs = loadMessages()
    msgs.push({ n: nick, m: msg, t: Date.now() })
    saveMessages(msgs)

    spawnBalloon()

    if (keepOpenChk?.checked) {
      if (messageInput) {
        messageInput.value = ''
        messageInput.focus()
      }
    } else {
      if (messageInput) messageInput.value = ''
      if (messageForm) messageForm.style.display = 'none'
      if (fabToggle) fabToggle.style.display = 'flex'
    }
  })
}

function showMessageSection() {
  if (!messageSection) return
  messageSection.style.display = 'flex'
  if (messageForm) messageForm.style.display = 'none'
  if (fabToggle) fabToggle.style.display = 'flex'
  const msgs = loadMessages()
  for (let i = 0; i < msgs.length; i++) spawnBalloon(true, i)
}

// 풍선
function spawnBalloon(isInitial = false, index = 0) {
  if (!balloonContainer) return
  const rect = balloonContainer.getBoundingClientRect()
  const w = rect.width || balloonContainer.offsetWidth || 300
  const h = rect.height || balloonContainer.offsetHeight || 300

  const startX = randRange(w * 0.18, w * 0.82)
  const startY = randRange(h * 0.25, h * 0.75)

  const b = document.createElement('div')
  b.className = 'balloon-float'
  const size = randRange(36, 58)
  b.style.width = `${size}px`
  b.style.height = `${size}px`
  b.style.left = `${startX - size / 2}px`
  b.style.top = `${startY - size / 2}px`

  const [r, g, bl] = RAINBOW[Math.floor(Math.random() * RAINBOW.length)]
  const alpha = randRange(0.22, 0.4)
  b.style.setProperty('--balloon-bg', `rgba(${r},${g},${bl},${alpha})`)
  b.style.setProperty('--balloon-border', `rgba(${r},${g},${bl},0.9)`)

  const dur = randRange(5, 9)
  const drift = randRange(3, 6)
  const mx = randRange(10, 28)
  b.style.setProperty('--dur', `${dur}s`)
  b.style.setProperty('--drift', `${drift}s`)
  b.style.setProperty('--mx', `${mx}px`)

  if (isInitial) {
    b.style.animationDelay = `${(index % 6) * 0.3}s, ${(index % 5) * 0.25}s`
  }
  balloonContainer.appendChild(b)
}

// 저장/로드
function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}
function saveMessages(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
  } catch (e) {}
}

// 유틸
function randRange(min, max) {
  return Math.random() * (max - min) + min
}
