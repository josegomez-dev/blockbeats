'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/assets/styles/Nav.module.css';
import stylesMain from "@/app/assets/styles/MainPage.module.css";
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

  type AnimatedBalanceProps = {
    start: number;
    end: number;
    duration?: number;
  };

  const AnimatedBalance: React.FC<AnimatedBalanceProps> = ({ start, end, duration = 1000 }) => {
    const [displayedValue, setDisplayedValue] = useState(start);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      const difference = end - start;
      if (difference === 0) return;

      setIsAnimating(true); // Start animation

      const increment = difference / (duration / 30); // change every 30ms
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          current = end;
          clearInterval(timer);
          setIsAnimating(false); // Stop animation
        }
        setDisplayedValue(Math.floor(current));
      }, 30);

      return () => clearInterval(timer);
    }, [start, end, duration]);

    return (
      <span className={isAnimating ? "pulse-animation" : ""}>
        {displayedValue}
    </span>
    );
  };


  const getCoinsToAdd = user?.bbcPoints ? user.bbcPoints + 100 : 100;


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
        <Image src="/logo.webp" alt="blockbeats-logo" width={50} height={50} />
        {!authenticated && (
          <h1 className="glitch" data-text="BlockBeats">BlockBeats</h1>
        )}
      </div>

      <ul className={styles.navList}>
        {authenticated && (
          <>
            {/* 👤 User Menu */}
            <li className={styles.navItem}>
              <AnimatedBalance start={user?.bbcPoints || 0} end={getCoinsToAdd} />&nbsp;
              <span className="glitch">BBC</span>
              <div style={{ display: 'inline-block', marginTop: '15px' }}>
                <Image
                  src="/coins.webp"
                  alt="blockbeats-logo"
                  width={25}
                  height={25}
                />
              </div>
            </li>
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
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px', color: 'white' }}>
                    <Avatar name={user?.email.split('@')[0]} size="30" round className="contact-avatar" />
                    &nbsp;
                    {user?.displayName || user?.email}
                  </div>
                  {user?.walletStored ? (
                    <div className={`${styles.dropdownItem} black-color`} style={{ marginBottom: '-15px' }}>
                    Address:&nbsp;<span className='gold-color' style={{marginTop: '-15px' }}>{user?.walletStored?.slice(0, 5)}... {data?.symbol} </span>
                  </div> ) : (
                    <div style={{ margin: '15px 25px', marginTop: '5px' }}>
                        <button
                          className={stylesMain.submitBtnLarge}
                          // onClick={readWalletAddress}
                        >
                          <span>Connect Wallet</span>
                          <img src="/starknet-logo.svg" style={{ position: 'absolute', top: 30, margin: '0 auto', left: 10 }} alt="blockbeats-logo" width={60} />
                        </button>
                        <br />
                    </div>
                  )}
                  <hr />
                  <Link href="/dashboard">
                    <div className={styles.dropdownItem}>
                      <FaDashcube className={styles.icon} /> Dashboard
                    </div>
                  </Link>
                  <Link href="/gallery">
                    <div className={styles.dropdownItem}>
                      <RiGalleryView className={styles.icon} /> Marketplace
                    </div>
                  </Link>
                  <Link href="/fans">
                    <div className={styles.dropdownItem}>
                      <RiGalleryView className={styles.icon} /> Fans Club &nbsp; <button style={{ padding: '0 10px' }}>Buy MERCH</button>
                    </div>
                  </Link>
                  {/* <Link href="/">
                    <div className={styles.dropdownItem}>
                      <RiGalleryView className={styles.icon} /> NEWS / Tutorials
                    </div>
                  </Link>
                  <Link href="/">
                    <div className={styles.dropdownItem}>
                      <RiGalleryView className={styles.icon} /> Help / FAQ / Contact
                    </div>
                  </Link> */}
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
                    notifications.map((n, index) => (
                     <>
                        {index === 0 && (
                          <div className={styles.clearButtonWrapper} key="clear-notifications">
                            <button
                              className={styles.clearButton}
                              onClick={handleClearNotifications}
                            >
                              Clear Notifications
                            </button>
                            <br />
                          </div>
                        )}

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
                      <hr />
                     </>
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
