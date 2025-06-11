// SidebarMenu.tsx
'use client';
import React, { useState } from 'react';
import styles from '@/app/assets/styles/SidebarMenu.module.css'; 
import { FaHome, FaGamepad, FaStore, FaChalkboardTeacher, FaCog } from 'react-icons/fa';
import { RiGalleryLine } from 'react-icons/ri';
import { BiCollection } from 'react-icons/bi';


const SidebarMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard' },
    { icon: <RiGalleryLine />, label: 'Gallery' },
    { icon: <BiCollection />, label: 'Collections' },
    { icon: <FaStore />, label: 'Marketplace' },
    { icon: <FaChalkboardTeacher />, label: 'Tutorials & Guides' },
    { icon: <FaGamepad />, label: 'MiniGames Hub' },
    { icon: <FaCog />, label: 'Analytics' },
    { icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}>
      <button className={styles.toggleButton} onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '<' : '>'}
      </button>
      <ul className={styles.menuList}>
        {menuItems.map((item, index) => (
          <li key={index} className={styles.menuItem}>
            <span className={styles.icon}>{item.icon}</span>
            {isExpanded && <span className={styles.label}>{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
