import Head from 'next/head';

const WelcomeMinimal = () => {
  const handleWalletClick = () => {
    console.log('🔘 Wallet button clicked!');
    alert('Wallet button works!');
  };

  const handleEmailClick = () => {
    console.log('📧 Email button clicked!');
    alert('Email button works!');
  };

  const handleTestClick = () => {
    console.log('🧪 Test button clicked!');
    alert('Test button works!');
  };

  return (
    <>
      <Head>
        <title>Welcome Minimal - BlockBeats</title>
      </Head>
      
      <div style={{
        padding: '50px',
        background: 'radial-gradient(circle at center, #0f0f2a 0%, #070713 100%)',
        color: '#00FFFF',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>🎵 BlockBeats Welcome (Minimal)</h1>
        <p>This is a minimal version to test if buttons work.</p>
        
        <div style={{ marginTop: '50px' }}>
          <button 
            onClick={handleWalletClick}
            style={{
              background: 'linear-gradient(45deg, #00FFFF, #ff0099)',
              color: '#000',
              border: 'none',
              padding: '20px 40px',
              fontSize: '18px',
              borderRadius: '10px',
              cursor: 'pointer',
              marginRight: '20px',
              marginBottom: '20px'
            }}
          >
            Test Connect Wallet
          </button>
          
          <button 
            onClick={handleEmailClick}
            style={{
              background: 'linear-gradient(45deg, #ff0099, #00FFFF)',
              color: '#000',
              border: 'none',
              padding: '20px 40px',
              fontSize: '18px',
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Test Join Now 🚀
          </button>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={handleTestClick}
            style={{
              background: '#00FFFF',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              fontSize: '14px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Simple Test Button
          </button>
        </div>
        
        <div style={{ marginTop: '50px' }}>
          <p>If these buttons work, the issue is with the complex welcome page.</p>
          <p>If they don't work, there's a fundamental JavaScript issue.</p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <a href="/welcome" style={{ color: '#00FFFF', textDecoration: 'none' }}>
            ← Back to Full Welcome Page
          </a>
          <br />
          <a href="/test-simple" style={{ color: '#00FFFF', textDecoration: 'none' }}>
            ← Go to Simple Test Page
          </a>
        </div>
      </div>
    </>
  );
};

export default WelcomeMinimal;
