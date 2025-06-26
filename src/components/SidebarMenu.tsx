'use client';
import React, { useState, useEffect } from 'react';
import styles from '@/app/assets/styles/SidebarMenu.module.css'; 
import { FaHome, FaGamepad, FaStore, FaChalkboardTeacher } from 'react-icons/fa';
import { RiGalleryLine } from 'react-icons/ri';
import { BiCollection } from 'react-icons/bi';
import Link from 'next/link';

const SidebarMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is within 50px from the left edge
      if (e.clientX < 50) {
        setIsExpanded(true);
      } else if (e.clientX > 200 && isExpanded) {
        // Optionally collapse if mouse moves away
        setIsExpanded(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isExpanded]);

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', href: '/dashboard' },
    { icon: <RiGalleryLine />, label: 'My Gallery', href: '/creations' },
    { icon: <BiCollection />, label: 'Top Collections', href: '/collections' },
    { icon: <FaStore />, label: 'Marketplace', href: '/marketplace' },
    { icon: <FaChalkboardTeacher />, label: 'Quick Tutorials', href: '/tutorials' },
  ];

  return (
    <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}>
      <ul className={styles.menuList}>
        {menuItems.map((item, index) => (
          <li key={index} className={styles.menuItem}>
            <Link href={item.href} className={styles.menuLink}>
              <span className={styles.icon}>{item.icon}</span>
              {isExpanded && <span className={styles.label}>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
