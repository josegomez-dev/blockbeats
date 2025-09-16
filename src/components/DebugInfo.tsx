import { useEffect, useState } from 'react';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      userAgent: navigator.userAgent,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      location: window.location.href,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
      isClient: typeof window !== 'undefined',
      hasNavigator: typeof navigator !== 'undefined',
    });
  }, []);

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DEBUG) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      wordBreak: 'break-word'
    }}>
      <h4>Debug Info</h4>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
};

export default DebugInfo;
