import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export const useSEO = (props: SEOProps = {}) => {
  const {
    title = 'BlockBeats 3.0 - Web3 Music Creation Platform',
    description = 'Create, mint, and trade musical NFTs on Starknet. Web3\'s first community-powered musical signature generator with MIDI support, gamification, and NFT marketplace.',
    image = 'https://blockbeats-tau.vercel.app/images/logos/logo.webp',
    url = 'https://blockbeats-tau.vercel.app',
    type = 'website',
    keywords = [
      'BlockBeats',
      'Web3 music',
      'NFT music',
      'Starknet',
      'music creation',
      'MIDI',
      'crypto music',
      'blockchain music',
      'musical NFTs',
      'music marketplace',
      'Argent X',
      'Braavos',
      'music generator',
      'pixel music',
      'drum machine',
      'music studio'
    ],
    author = 'BlockBeats Team',
    publishedTime,
    modifiedTime,
    section,
    tags = []
  } = props;
  const fullTitle = title.includes('BlockBeats') ? title : `${title} | BlockBeats 3.0`;
  const fullDescription = description;
  const fullImage = image.startsWith('http') ? image : `https://blockbeats-tau.vercel.app${image}`;
  const fullUrl = url.startsWith('http') ? url : `https://blockbeats-tau.vercel.app${url}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="BlockBeats 3.0" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@blockbeats" />
      <meta name="twitter:creator" content="@blockbeats" />
      
      {/* Additional Meta Tags */}
      <meta name="application-name" content="BlockBeats 3.0" />
      <meta name="apple-mobile-web-app-title" content="BlockBeats" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.length > 0 && (
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BlockBeats 3.0",
            "description": fullDescription,
            "url": fullUrl,
            "image": fullImage,
            "applicationCategory": "MusicApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "BlockBeats Team",
              "url": "https://blockbeats-tau.vercel.app"
            },
            "keywords": keywords.join(', '),
            "inLanguage": "en-US"
          })
        }}
      />
    </Head>
  );
};
