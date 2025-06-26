// SidebarMenu.tsx
'use client';
import React, { useState } from 'react';
import styles from '@/app/assets/styles/SidebarMenu.module.css'; 
import { FaHome, FaGamepad, FaStore, FaChalkboardTeacher, FaCog, FaStoreAlt } from 'react-icons/fa';
import { RiGalleryLine } from 'react-icons/ri';
import { BiCollection } from 'react-icons/bi';
import Link from 'next/link';


const SidebarMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', href: '/dashboard' },
    { icon: <RiGalleryLine />, label: 'My Creations', href: '/creations' },
    { icon: <BiCollection />, label: 'Top Collections', href: '/collections' },
    { icon: <FaChalkboardTeacher />, label: 'Tutorials & Guides', href: '/tutorials' },
    { icon: <FaStore />, label: 'Marketplace', href: '/marketplace' },
  ];

  return (
    <div className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}>
      <button className={styles.toggleButton} onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '<' : '>'}
      </button>
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
