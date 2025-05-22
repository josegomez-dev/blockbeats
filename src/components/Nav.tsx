'use client';
import React, { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/assets/styles/Nav.module.css';
import { FaSignOutAlt, FaUserCircle, FaCog, FaBell, FaDashcube, FaHeadphones } from 'react-icons/fa';
import { RiGalleryView } from "react-icons/ri";
import { GiWallet } from "react-icons/gi";
import Avatar from 'react-avatar';
import { useAccount, useBalance } from "@starknet-react/core";

type UserNotification = {
  id: string;
  text: string;
  visited: boolean;
};

export default function Nav() {
  const { address } = useAccount();
  const { data } = useBalance({
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  });

  const { user, authenticated, setAuthenticated, setRole } = useAuth();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<UserNotification[]>(
    Array.isArray(user?.notifications)
      ? user.notifications.map((n: any) => ({
          id: n.id,
          text: n.text,
          visited: n.visited,
        }))
      : []
  );

  const unreadCount = notifications.filter((n: UserNotification) => !n.visited).length;

  const handleLogout = () => {
    setAuthenticated(false);
    setRole('user');
    router.push('/');
  };

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const toggleNotif = () => setNotifOpen(prev => !prev);

  const closeDropdowns = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setNotifOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer} onClick={() => router.push('/')}>
        <Image src="/logo.png" alt="blockbeats-logo" width={50} height={50} />
        {!authenticated && (
          <>
            <h1 className="glitch" data-text="BlockBeats">BlockBeats</h1>
          </>
        )}
      </div>

      <ul className={styles.navList}>
        {authenticated && (
          <>
            <span>
              {/* <GiWallet/>   */}
              <Image
                src="/coins.png"
                alt="blockbeats-logo"
                width={30}
                height={30}
                className='pulse-animation'
              />
              <div style={{ color: 'lightgreen' }}>
                {data?.formatted?.slice(0, 8)}...
              </div>
              {/* <span style={{ color: '#0ff' }}>{data?.symbol}</span> */}
            </span>

            {/* 👤 User Menu */}
            <li className={`${styles.navItem} ${styles.dropdown}`} ref={dropdownRef}>
              <button className={styles.avatarButton} onClick={toggleDropdown}>
                <Avatar
                  size="40"
                  round={true}
                  name={user?.email || 'User'}
                  color="var(--secondary-color)"
                />
                <span className={styles.userEmail}>
                  {user?.email?.split('@')[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownItem}>
                    <FaUserCircle className={styles.icon} /> {user?.displayName || user?.email}
                  </div>
                  <div className={styles.dropdownItem}>
                    <GiWallet className={styles.icon} /> Wallet: {address?.slice(0, 6)}... {data?.formatted} {data?.symbol}
                  </div>
                  <hr />
                  {/* <Link href="/profile">
                    <div className={styles.dropdownItem}>
                      <FaUserCircle className={styles.icon} /> Profile
                    </div>
                  </Link> */}
                  <Link href="/dashboard">
                    <div className={styles.dropdownItem}>
                      <FaDashcube className={styles.icon} /> Dashboard
                    </div>
                  </Link>
                  {/* <Link href="/machine">
                    <div className={styles.dropdownItem}>
                      <FaHeadphones className={styles.icon} /> Drawing Machine
                    </div>
                  </Link> */}
                  <Link href="/gallery">
                    <div className={styles.dropdownItem}>
                      <RiGalleryView className={styles.icon} /> Gallery
                    </div>
                  </Link>
                  <div className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>
                    <FaSignOutAlt className={styles.icon} /> Logout
                  </div>
                </div>
              )}
            </li>

            &nbsp; &nbsp; &nbsp;

            {/* 🔔 Notification Icon with Counter */}
            <div className={styles.notificationWrapper} ref={notifRef}>
              <button className={styles.notifButton} onClick={toggleNotif}>
                <FaBell />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className={styles.notificationDropdown}>
                  {notifications.length === 0 ? (
                    <div className={styles.dropdownItem}>No notifications</div>
                  ) : (
                    notifications.map((n: UserNotification) => (
                      <div
                        key={n.id}
                        className={`${styles.dropdownItem} ${!n.visited ? styles.unread : ''}`}
                      >
                        {n.text}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </>
        )}

        {!authenticated && (
          <li className={styles.navItem}>
            <Link href="/blockbeats-whitepaper.pdf">🛩️</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
