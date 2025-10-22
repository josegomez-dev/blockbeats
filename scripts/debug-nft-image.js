// Debug function to test NFT image generation
// Run this in your browser console to debug the image generation

window.debugNFTImage = async function(nftId) {
  console.log('🔍 Debugging NFT image generation for:', nftId);
  
  // Find the NFT card
  const nftCard = document.querySelector(`[data-nft-id="${nftId}"]`);
  if (!nftCard) {
    console.log('❌ NFT card not found');
    return;
  }
  
  // Get the pixel preview element
  const pixelPreview = document.getElementById(`pixel-preview-${nftId}`);
  if (!pixelPreview) {
    console.log('❌ Pixel preview element not found');
    return;
  }
  
  console.log('✅ Found pixel preview element:', pixelPreview);
  
  // Check if there are pixel elements inside
  const pixelElements = pixelPreview.querySelectorAll('.pixel-note');
  console.log('🎨 Found pixel elements:', pixelElements.length);
  
  if (pixelElements.length > 0) {
    console.log('📊 Sample pixel element:', pixelElements[0]);
    console.log('🎨 Sample pixel style:', pixelElements[0].style.backgroundColor);
  }
  
  // Test html2canvas capture
  try {
    const html2canvas = (await import('html2canvas')).default;
    
    console.log('🔄 Testing html2canvas capture...');
    const canvas = await html2canvas(pixelPreview, {
      backgroundColor: '#000',
      width: 512,
      height: 512,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      onclone: (clonedDoc) => {
        const clonedPixels = clonedDoc.querySelectorAll('.pixel-note');
        console.log('📋 Cloned pixel elements:', clonedPixels.length);
        if (clonedPixels.length > 0) {
          console.log('🎨 Cloned pixel style:', clonedPixels[0].style.backgroundColor);
        }
      }
    });
    
    console.log('✅ html2canvas test successful');
    
    // Display the result
    const testImg = document.createElement('img');
    testImg.src = canvas.toDataURL('image/png');
    testImg.style.position = 'fixed';
    testImg.style.top = '10px';
    testImg.style.right = '10px';
    testImg.style.width = '300px';
    testImg.style.height = '300px';
    testImg.style.border = '3px solid red';
    testImg.style.zIndex = '9999';
    testImg.style.backgroundColor = '#fff';
    document.body.appendChild(testImg);
    
    console.log('✅ Test image displayed on screen');
    
    // Remove after 10 seconds
    setTimeout(() => {
      if (document.body.contains(testImg)) {
        document.body.removeChild(testImg);
      }
    }, 10000);
    
  } catch (error) {
    console.error('❌ html2canvas test failed:', error);
  }
};

// Also create a function to inspect NFT data
window.inspectNFTData = function(nftId) {
  console.log('🔍 Inspecting NFT data for:', nftId);
  
  // Try to find the NFT data in the page
  const nftCards = document.querySelectorAll('[data-nft-id]');
  console.log('Found NFT cards:', nftCards.length);
  
  // Look for any data attributes or React props
  nftCards.forEach((card, index) => {
    const cardId = card.getAttribute('data-nft-id');
    if (cardId === nftId) {
      console.log(`NFT Card ${index}:`, card);
      console.log('All attributes:', Array.from(card.attributes).map(attr => `${attr.name}="${attr.value}"`));
    }
  });
};

console.log('🧪 Debug functions loaded:');
console.log('  - debugNFTImage("your-nft-id") - Test image generation');
console.log('  - inspectNFTData("your-nft-id") - Inspect NFT data structure');
