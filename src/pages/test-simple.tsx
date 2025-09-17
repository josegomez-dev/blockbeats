import Head from 'next/head';

const TestSimple = () => {
  const handleClick = () => {
    console.log('🧪 Simple test button clicked!');
    alert('Simple test button works!');
  };

  const handleClick2 = () => {
    console.log('🧪 Another test button clicked!');
    document.body.style.backgroundColor = document.body.style.backgroundColor === 'red' ? 'blue' : 'red';
  };

  return (
    <>
      <Head>
        <title>Simple Test Page</title>
      </Head>
      
      <div style={{
        padding: '50px',
        background: '#0a0a0a',
        color: '#00FFFF',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>🧪 Simple Test Page</h1>
        <p>This is a minimal test page to check if JavaScript works at all.</p>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={handleClick}
            style={{
              background: '#00FFFF',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              fontSize: '16px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '20px'
            }}
          >
            Test Button 1 (Alert)
          </button>
          
          <button 
            onClick={handleClick2}
            style={{
              background: '#ff0099',
              color: '#fff',
              border: 'none',
              padding: '15px 30px',
              fontSize: '16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Button 2 (Change Color)
          </button>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <p>If these buttons work, JavaScript is functioning.</p>
          <p>If they don't work, there's a fundamental JavaScript issue.</p>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <a href="/welcome" style={{ color: '#00FFFF', textDecoration: 'none' }}>
            ← Back to Welcome Page
          </a>
        </div>
      </div>
    </>
  );
};

export default TestSimple;
