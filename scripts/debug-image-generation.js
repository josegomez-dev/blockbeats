// Test function to debug NFT image generation
// Add this to your browser console to test image generation

window.testNFTImageGeneration = async function(nftId) {
  console.log('🧪 Testing NFT image generation for:', nftId);
  
  // Find the NFT data
  const nftElement = document.querySelector(`[data-nft-id="${nftId}"]`);
  if (!nftElement) {
    console.log('❌ NFT element not found');
    return;
  }
  
  // Get the pixel preview element
  const pixelPreview = document.getElementById(`pixel-preview-${nftId}`);
  if (!pixelPreview) {
    console.log('❌ Pixel preview element not found');
    return;
  }
  
  console.log('✅ Found pixel preview element:', pixelPreview);
  
  // Test html2canvas capture
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(pixelPreview, {
      backgroundColor: '#000',
      width: 512,
      height: 512,
      scale: 1,
      useCORS: true,
      allowTaint: true,
    });
    
    console.log('✅ html2canvas test successful');
    
    // Create a test image
    const testImg = document.createElement('img');
    testImg.src = canvas.toDataURL('image/png');
    testImg.style.position = 'fixed';
    testImg.style.top = '10px';
    testImg.style.right = '10px';
    testImg.style.width = '200px';
    testImg.style.height = '200px';
    testImg.style.border = '2px solid red';
    testImg.style.zIndex = '9999';
    document.body.appendChild(testImg);
    
    console.log('✅ Test image displayed on screen');
    
    // Remove after 5 seconds
    setTimeout(() => {
      document.body.removeChild(testImg);
    }, 5000);
    
  } catch (error) {
    console.error('❌ html2canvas test failed:', error);
  }
};

console.log('🧪 Test function loaded. Usage: testNFTImageGeneration("your-nft-id")');
