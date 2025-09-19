'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/assets/styles/layouts/Nav.module.css';
import stylesMain from "@/app/assets/styles/layouts/MainPage.module.css";
import { FaSignOutAlt, FaBell, FaCoins, FaMusic, FaBowlingBall } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { RiGalleryLine } from 'react-icons/ri';
import { BiCollection, BiGlasses } from 'react-icons/bi';
import { FaStore, FaChalkboardTeacher, FaCog, FaStoreAlt } from 'react-icons/fa';
import Avatar from 'react-avatar';
import { useAccount, useBalance } from "@starknet-react/core";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast from 'react-hot-toast';

type UserNotification = {
  id: string;
  text: string;
  visited: boolean;
};

export default function Nav() {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
  });

  const { user, authenticated, setAuthenticated, setRole, logout } = useAuth();
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

  useEffect(() => {
    const handleRouteChange = () => {
      setDropdownOpen(false);
      setNotifOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);


  const handleLogout = () => {
    setAuthenticated(false);
    setRole('user');
    router.push('/auth/login');
    logout();
    toast.success('Logged out successfully');
    setNotifications([]); // Clear notifications on logout
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

  const handleClearNotifications = () => {
    if (!user) {
      toast.error('User not found');
      return;
    }

    updateDoc(doc(db, 'accounts', user.uid), {
      notifications: [], // Clear all
    })
      .then(() => {
        toast.success('All notifications cleared');
        setNotifications([]); // Update local state
      })
      .catch((error) => {
        console.error('Error clearing notifications:', error);
        toast.error('Failed to clear notifications');
      });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer} onClick={() => router.push('/')}>
        <Image src="/images/logos/logo.webp" alt="blockbeats-logo" width={50} height={50} />
        {!authenticated && (
          <h1 className="glitch" data-text="BlockBeats">BlockBeats</h1>
        )}
      </div>

      <ul className={styles.navList}>
        {authenticated && (
          <>
            {/* 👤 User Menu */}
            <li id='personal-pts-balance-nav' className={styles.navItem}>
              <FaCoins className={styles.userStatIcon} />&nbsp;
              {user?.bbcPoints ? user.bbcPoints : 0}
            </li>
            <li className={`${styles.navItem} ${styles.dropdown}`} ref={dropdownRef}>
              <button className={styles.avatarButton} onClick={toggleDropdown}>
                <Avatar
                  size="40"
                  round={true}
                  name={user?.displayName || user?.email || 'User'}
                  color="var(--secondary-color)"
                />
                <span className={styles.userEmail}>
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {/* User Info Section */}
                  <div className={styles.userInfoSection}>
                    <Avatar
                      size="48"
                      round={true}
                      name={user?.displayName || user?.email || 'User'}
                      color="var(--secondary-color)"
                      className={styles.userAvatar}
                    />
                    <div className={styles.userName}>
                      {user?.displayName || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className={styles.userEmail}>
                      {user?.email}
                    </div>
                    <div className={styles.userStats}>
                      <div className={styles.userStat}>
                        <span className={styles.userStatIcon}>🤖</span>
                        <span>{user?.robotName || 'BEATO'}</span>
                      </div>
                      <div className={styles.userStat}>
                        <FaCoins className={styles.userStatIcon} />
                        <span className={styles.userStatValue}>{user?.bbcPoints || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  {/* Navigation Section */}
                  <Link href="/dashboard">
                    <div className={styles.dropdownItem}>
                      <MdDashboard className={styles.icon} /> Dashboard
                    </div>
                  </Link>
                  <Link href="/studio">
                    <div className={styles.dropdownItem}>
                      <FaMusic className={styles.icon} /> Studio
                    </div>
                  </Link>
                  <Link href="/collections">
                    <div className={styles.dropdownItem}>
                      <BiCollection className={styles.icon} /> Top Collections
                    </div>
                  </Link>
                  <Link href="/marketplace">
                    <div className={styles.dropdownItem}>
                      <FaStore className={styles.icon} /> Marketplace
                    </div>
                  </Link>
                  <Link href="/studio/tutorials">
                    <div className={styles.dropdownItem}>
                      <FaChalkboardTeacher className={styles.icon} /> Quick Tutorials
                    </div>
                  </Link>
                  <Link href="/profile">
                    <div className={styles.dropdownItem}>
                      <BiGlasses className={styles.icon} /> Profile
                    </div>
                  </Link>

                  <div className={styles.dropdownDivider} />

                  {/* Logout Section */}
                  <div className={`${styles.logout} flex-justify-center cursor-pointer p-25`} onClick={() => {
                    handleLogout();
                  }}>
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
                    <div className={styles.emptyState}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                      No notifications
                    </div>
                  ) : (
                    <>
                      <div className={styles.notificationHeader}>
                        Notifications ({notifications.length})
                      </div>
                      {notifications.length > 0 && (
                        <button
                          className={styles.clearButton}
                          onClick={handleClearNotifications}
                        >
                          Clear All
                        </button>
                      )}
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`${styles.notificationItem} ${!n.visited ? styles.unread : ''}`}
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
                          <p className={styles.notificationText}>
                            {n.text}
                          </p>
                          <div className={styles.notificationTimestamp}>
                            {!n.visited && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>● New</span>}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!authenticated && (
          <>
            <li className={styles.navItem}>
              {router.pathname === '/' ? (
                <Link href="/auth/login">LOGIN</Link>
              ) : ( 
                <Link href="/">HOME</Link>
              )}
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
