import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import styles from '@/app/assets/styles/Nav.module.css'
import { FaSignOutAlt } from 'react-icons/fa'
import Avatar from 'react-avatar';

export default function Nav() {
  const { user, role, authenticated, setAuthenticated, setRole } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    setAuthenticated(false)
    setRole('user') // Reset the role to default
    router.push('/')
  }

  return (
    <nav className={`${styles.navbar} bg-gray-800 text-white`}>
      <div className="flex items-center">
        <Link href="/" onClick={() => router.push('/')}>
          <div className="logo-container">
              <Image
                className={styles.logo}
                src="/logo.png"
                alt="blockbeats-logo"
                width={50}
                height={50}
                priority
              />
            <h1 className="glitch" data-text="BlockBeats">BlockBeats</h1>
          </div>
        </Link>
      </div>
      <ul className={`${styles['nav-list']} flex-row-reverse`}>
        {authenticated && (
          <li>
            <Avatar 
              size="50" 
              textSizeRatio={1.75} 
              name={user?.email || 'Jhon Doe'} 
              // facebook-id={'facebookId'}
              // md5Email={'md5Email'}
              // twitterHandle='twitterHandle'
              // instagramId='instagramId'
              // githubHandle='githubHandle'
              // skypeId='skypeId'
              alt={'user-profile-picture'}
              round={true}
              color='var(--secondary-color)'
            />
            &nbsp;
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              <FaSignOutAlt />
            </button>
          </li>
        )}
        
        {!authenticated && (
          <>
            <li className={styles['nav-link']}>
              <Link href="/blockbeats-whitepaper.pdf">🛩️</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
