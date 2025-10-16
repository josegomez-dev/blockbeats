'use client';

import React, { useState } from 'react';
import styles from './ProfileTabs.module.css';

interface Tab {
  id: string;
  label: string;
  icon: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface ProfileTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabHeaders}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabHeader} ${activeTab === tab.id ? styles.active : ''} ${tab.disabled ? styles.disabled : ''}`}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.disabled && <span className={styles.disabledIcon}>🚧</span>}
          </button>
        ))}
      </div>
      
      <div className={styles.tabContent}>
        {activeTabContent}
      </div>
    </div>
  );
};

export default ProfileTabs;
