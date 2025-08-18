import React, { useState } from 'react'
import Stage from '../components/Stage'
import InvitePanel from '../components/InvitePanel'

export default function Home() {
  const [isInviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      <Stage onEnvelopeToggle={() => setInviteOpen(true)} />
      <InvitePanel
        open={isInviteOpen}
        onClose={() => setInviteOpen(false)}
        photoUrl="https://i.pinimg.com/1200x/51/fa/2c/51fa2ca3099856fbcb8569a1e88ddee9.jpg"
      />
    </>
  )
}
