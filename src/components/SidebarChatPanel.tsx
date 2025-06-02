'use client';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import Avatar from 'react-avatar';
import { useAuth } from '@/context/AuthContext';
import styles from "@/app/assets/styles/MainPage.module.css";
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import PixelPreview from './PixelPreview';

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
  const [nftItems, setNftItems] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      const querySnapshot = await getDocs(collection(db, "signatures"));
      const nfts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNftItems(nfts);
      console.log("NFTs fetched:", nfts);
    };
    fetchNFTs();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      const contactsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setContacts(contactsData);
      console.log("Contacts fetched:", contactsData);
    };
    fetchContacts();
  }, []);

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
    let response: string;

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
        <div style={{ textAlign: "center", margin: "0 auto", marginBottom: "25px" }}>
          <Image src="/logo.webp" alt="blockbeats-logo" width={50} height={50} />
          <h3 className="glitch" data-text="BlockBeats">BlockBeats</h3>
        </div>

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
                <React.Fragment key={c.id}>
                  <div className={`contact-card ${!c.isFriend ? 'pending' : ''}`} style={{ width: !c.isFriend ? '200px' : 'auto' }}>
                    <Avatar name={c.email.split('@')[0]} size="30" round className="contact-avatar" />
                    <span style={{ width: '100px', overflow: 'auto' }}>{c.email.split('@')[0]}</span>
                    {c.isOnline ? (
                      <span className="status-badge online"></span>
                    ) : (
                      <span className="status-badge offline" style={{ animation: 'none' }}></span>
                    )}
                  </div>
                  {!c.isFriend && (
                    <button className='invite-button' onClick={() => toast.success(`Invite sent to ${c.name}`)}>Invite</button>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {activeTab === 'NFTs' && (
            <div className="nft-list">
              {nftItems.map(nft => (
                <div key={nft.id} className="nft-card">
                  <div style={{ padding: '5px 10px ', margin: '0 auto' }}>
                    <PixelPreview
                      colorMap={nft?.colorMap}
                      notesCount={nft?.notesPlayed.length}
                      size={50}
                    />
                    <div className="nft-meta" style={{ fontSize: '8px', color: '#555' }}>
                      {/* <span className={`status-badge ${nft.status}`}></span> */}
                      Owner: {nft.createdBy.slice(0, 6)}...
                    </div>
                  </div>
                  {/* <img src={nft.image} alt={nft.title} className="nft-avatar" /> */}
                  <div className="nft-info">
                    <h3 className="nft-title">{nft.songName}</h3>
                    
                    <div className="nft-actions">
                      <button className={styles.submitBtn}>View</button>
                      <button className={styles.submitBtn}>Buy</button>
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
                  <React.Fragment key={`${msg.sender}-${msg.time.getTime()}`}>
                    {msg.sender === 'admin' && (
                      <Avatar
                        color='var(--primary-color)'
                        name="Admin Bot"
                        size="30"
                        round
                        style={{ marginLeft: '226px', marginBottom: '-15px' }}
                      />
                    )}
                    <div className={`chat-bubble ${msg.sender === 'admin' ? 'admin' : 'user'}`}>
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
                  </React.Fragment>
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
                  {recording ? '⏹️ Stop' : '⏺️'}
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
