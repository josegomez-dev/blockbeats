'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/assets/styles/Nav.module.css';
import { FaSignOutAlt, FaUserCircle, FaCog, FaBell, FaDashcube, FaHeadphones } from 'react-icons/fa';
import { RiGalleryView } from "react-icons/ri";
import Avatar from 'react-avatar';
import { useAccount, useBalance } from "@starknet-react/core";
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';

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

  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  // Sync notifications from user context
  useEffect(() => {
    if (Array.isArray(user?.notifications)) {
      setNotifications(
        user.notifications.map((n: any) => ({
          id: n.id,
          text: n.text,
          visited: n.visited,
        }))
      );
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.visited).length;

  const handleLogout = () => {
    setAuthenticated(false);
    setRole('user');
    router.push('/');
  };

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const toggleNotif = () => {
    setNotifOpen(prev => {
      if (!prev) {
        // Mark all notifications as visited
        setNotifications((prevNotifs) =>
          prevNotifs.map((n) => ({ ...n, visited: true }))
        );
      }
      return !prev;
    });
  };

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
        <Image src="/logo.webp" alt="blockbeats-logo" width={50} height={50} />
        {!authenticated && (
          <h1 className="glitch" data-text="BlockBeats">BlockBeats</h1>
        )}
      </div>

      <ul className={styles.navList}>
        {authenticated && (
          <>
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
                  <div className={`${styles.dropdownItem}`} >
                    <FaUserCircle className={styles.icon} /> {user?.displayName || user?.email}
                  </div>
                  <div className={`${styles.dropdownItem} black-color`} style={{ marginBottom: '-15px' }}>
                    Wallet Address: <span className='gold-color' style={{marginTop: '-15px' }}>{address?.slice(0, 6)} {data?.formatted.slice(0, 6)}... {data?.symbol} </span>
                  </div>
                  <div className={`${styles.dropdownItem} black-color`} style={{ marginBottom: '-15px' }}>
                    Starknet Wallet Address: <span className='gold-color' style={{marginTop: '-15px' }}>{address?.slice(0, 6)} {data?.formatted.slice(0, 6)}... {data?.symbol} </span>
                  </div>
                  <div className={`${styles.dropdownItem} neon-color`}>
                    <Image
                      src="/coins.webp"
                      alt="blockbeats-logo"
                      width={30}
                      height={30}
                      className='pulse-animation'
                    />&nbsp;
                    <div style={{ color: 'lightgreen' }}>
                      {data?.formatted?.slice(0, 8)}...
                    </div>
                  </div>
                  <hr />
                  <Link href="/dashboard">
                    <div className={styles.dropdownItem}>
                      <FaDashcube className={styles.icon} /> Dashboard
                    </div>
                  </Link>
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
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`${styles.dropdownItem}`}
                        onClick={() => {
                          // update in firebase 
                          if (user) {
                            // find this notification and remove it from the notifications array
                            const updatedNotifications = (user.notifications ?? []).filter((notif: any) => notif.id !== n.id);
                          
                            updateDoc(doc(db, 'accounts', user.uid), {
                              notifications: updatedNotifications,
                            })
                            .then(() => {
                              toast.success('Notification marked as read');
                            })
                            .catch((error) => {
                              console.error('Error updating document: ', error);
                              toast.error('Error marking notification as read');
                            });

                            setNotifications((prev) =>
                              prev.filter((notif) => notif.id !== n.id)
                            );
                            

                          } else {
                            toast.error('User not found');
                          }

                          setNotifications((prev) =>
                            prev.map((notif) =>
                              notif.id === n.id ? { ...notif, visited: true } : notif
                            )
                          );
                        }}
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
