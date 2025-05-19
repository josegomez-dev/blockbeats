import Image from 'next/image'
import React from 'react'

export default function UnauthorizedMessage() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ height: 200 }} />
      <Image
        style={{ filter: 'invert(1) drop-shadow(0 0 0.3rem #ffffff70)' }}
        src="/banner-logo.png"
        alt="Catarsis Musical Logo"
        width={200}
        height={200}
        priority
      />
      <p>Please log in to view your profile.</p>
    </div> // Simple message if not authenticated
  )
}
