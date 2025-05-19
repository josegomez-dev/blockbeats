import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="preloader-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Preloader;
