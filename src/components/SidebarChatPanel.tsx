'use client';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Avatar from 'react-avatar';
import { useAuth } from '@/context/AuthContext';

import styles from "@/app/assets/styles/MainPage.module.css";

const TABS = ['Contacts', 'NFTs', 'Tokens', 'Chats'];

const SidebarChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Chats');
  type Message = {
    sender: string;
    text: string;
    time: Date;
    audioURL?: string;
  };

  const user = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    { sender: 'admin', text: 'Welcome user, let me know if you need something...', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const lowerText = userMsg.text.toLowerCase();
    let response = null;

    if (lowerText.includes('/nfts')) {
      setActiveTab('NFTs');
      response = 'Switching to your NFT collection!';
    } else if (lowerText.includes('/tokens')) {
      setActiveTab('Tokens');
      response = 'Showing your token details.';
    } else if (lowerText.includes('/contacts')) {
      setActiveTab('Contacts');
      response = 'Opening your contact list.';
    } else if (lowerText.includes('/help')) {
      response = 'Available commands: /nfts, /tokens, /contacts, /help';
    } else {
      response = `You said: "${userMsg.text}". I'm here to help! Try /help for commands.`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'admin', text: response, time: new Date() }]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    setAudioChunks([]);

    recorder.ondataavailable = (e) => {
      setAudioChunks((prev) => [...prev, e.data]);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioURL = URL.createObjectURL(audioBlob);
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: '[Audio Message]', audioURL, time: new Date() },
        { sender: 'admin', text: 'Got your audio. Processing NFT command...', time: new Date() },
      ]);
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const nftItems = [
    { id: 1, title: 'SynthCat #432', image: '/nft1.png', owner: '0xA12...', status: 'online' },
    { id: 2, title: 'MetaBird #87', image: '/nft2.png', owner: '0xB34...', status: 'offline' },
    { id: 3, title: 'NeonFrog #23', image: '/nft3.png', owner: '0xC56...', status: 'error' },
    { id: 4, title: 'CyberTiger #112', image: '/nft5.png', owner: '0xD78...', status: 'online' },
    { id: 5, title: 'VoidWolf #999', image: '/nft2.png', owner: '0xE90...', status: 'offline' },
    { id: 6, title: 'GlitchBear #303', image: '/nft1.png', owner: '0xF21...', status: 'online' },
    { id: 7, title: 'PixelWhale #77', image: '/nft5.png', owner: '0x1A3...', status: 'error' },
    { id: 8, title: 'QuantumRex #204', image: '/nft1.png', owner: '0x4B5...', status: 'online' },
    { id: 9, title: 'DreamSloth #666', image: '/nft65.png', owner: '0x8C9...', status: 'offline' },
  ];

  const contacts = [
    { id: '1', name: 'Alice', isFriend: true, isOnline: true },
    { id: '2', name: 'Bob', isFriend: false, isOnline: false },
    { id: '3', name: 'Charlie', isFriend: true, isOnline: true },
    { id: '4', name: 'Luis', isFriend: false, isOnline: true },
    { id: '5', name: 'Marvin', isFriend: false, isOnline: false },
    { id: '6', name: 'Elida', isFriend: true, isOnline: false },
    { id: '7', name: 'Nina', isFriend: true, isOnline: true },
    { id: '8', name: 'Victor', isFriend: false, isOnline: true },
    { id: '9', name: 'Zoe', isFriend: true, isOnline: false },
    { id: '10', name: 'Quinn', isFriend: false, isOnline: true },
  ];

  const tokens = [
    { symbol: 'ETH', balance: 2.15, usd: 7183.20 },
    { symbol: 'BBX', balance: 1200, usd: 360.00 },
    { symbol: 'USDC', balance: 540.5, usd: 540.50 },
    { symbol: 'SOL', balance: 43.2, usd: 652.00 },
    { symbol: 'MATIC', balance: 800, usd: 640.00 },
    { symbol: 'DOGE', balance: 10500, usd: 730.50 },
    { symbol: 'AVAX', balance: 62, usd: 1860.00 },
  ];

  return (
    <>
      <button className="floating-button" onClick={toggleSidebar}>
        {isOpen ? '✖' : '💬'}
      </button>

      <div ref={panelRef} className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>

        <div className="tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab ${tab === activeTab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content fade-in">
          {activeTab === 'Contacts' && (
            <div className="contacts-list">
              {contacts.map(c => (
                <>
                    <div key={c.id} className={`contact-card ${!c.isFriend ? 'pending' : ''}`} style={{ width: !c.isFriend ? '200px' : 'auto' }}>
                        <Avatar name={c.name} size="30" round className="contact-avatar" />
                        <span>{c.name}</span>
                        {c.isOnline ? (
                            <span className="status-badge online"></span>
                        ) : (
                            <span className="status-badge offline" style={{ animation: 'none' }}></span>
                        )}
                    </div>
                    {!c.isFriend && (
                        <button className='invite-button' onClick={() => toast.success(`Invite sent to ${c.name}`)}>Invite</button>
                    )}
                </>
              ))}
            </div>
          )}

          {activeTab === 'NFTs' && (
            <div className="nft-list">
              {nftItems.map(nft => (
                <div key={nft.id} className="nft-card">
                  <img src={nft.image} alt={nft.title} className="nft-avatar" />
                  <div className="nft-info">
                    <div className="nft-title">{nft.title}</div>
                    <div className="nft-meta">
                      <span className={`status-badge ${nft.status}`}></span>
                      Owner: {nft.owner}
                    </div>
                    <div className="nft-actions">
                      <button className={styles.submitBtn}>View</button>
                      <button className={styles.submitBtn}>Buy</button>
                      <button className={styles.submitBtn}>Sell</button>
                      <button className={styles.submitBtn}>Share</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Tokens' && (
            <div className="token-stats">
              {tokens.map(t => (
                <div key={t.symbol} className="token-card">
                  <span className="token-symbol">{t.symbol}</span>
                  <span>{t.balance} ≈ ${t.usd.toLocaleString()}</span>
                </div>
              ))}
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#888' }}>
                🚀 Track real-time token data with your connected wallet soon...
              </p>
            </div>
          )}

          {activeTab === 'Chats' && (
            <div className="chat-area">
              <div className="messages">
                {messages.map((msg, i) => (
                  <>
                    {msg.sender === 'admin' && (
                        <Avatar color='var(--primary-color)' name="Admin Bot" size="30" round style={{ marginLeft: '226px', marginBottom: '-15px' }} />
                    )}
                    <div key={i} className={`chat-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`}>
                        <div>
                            <strong>{msg.sender === 'admin' ? 'Admin' : 'You'}</strong>:
                            {msg.audioURL ? (
                                <audio controls src={msg.audioURL} />
                            ) : (
                                <span> {msg.text}</span>
                            )}
                            <div style={{ fontSize: '10px', color: 'black', textAlign: 'right', marginTop: '5px' }}>
                                {formatTime(new Date(msg.time))}
                            </div>
                        </div>
                    </div>
                  </>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                />
                <button onClick={handleSend}>Send</button>
                <button onClick={recording ? stopRecording : startRecording}>
                  {recording ? '⏹️ Stop' : '🎙️ Record'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarChatPanel;
