import React, { useState } from 'react';

export default function FarmerGreetingBar({ onPlayAudio, isPlaying }) {
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');

  const handleSpeedToggle = (speed) => {
    setPlaybackSpeed(speed);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      // cancel and re-trigger with new speed if user changes rate
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="greeting-assistant-bar">
      {/* Farmer Identity */}
      <div className="farmer-identity-section">
        <div className="tractor-icon-box" title="FPO Agricultural Member">
          {/* Tractor Icon SVG */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
            <path d="M14 14a5 5 0 1 0 10 0 5 5 0 1 0-10 0" />
            <path d="M6 14h8m-8 0v-4l4-3h4v7" />
            <path d="M14 8h3l2 3v3" />
          </svg>
        </div>

        <div>
          <div className="farmer-greeting-title">
            <span>नमस्ते, Ramesh Patel</span>
            <span className="fpo-member-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Khanna FPO Member
            </span>
          </div>
          <div className="farmer-crop-cluster-sub">
            4.2 Acres Gehu (Wheat - HD 3086) • Village Bhadson, Ludhiana Cluster
          </div>
        </div>
      </div>

      {/* Audio Voice Assistant Player Widget */}
      <div className="audio-assistant-widget">
        <button
          className="audio-play-circle-btn"
          onClick={() => onPlayAudio(parseFloat(playbackSpeed))}
          aria-label="Play Audio Advisory"
          title="Play audio advisory in vernacular"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div className="audio-label-group">
          <div className="audio-title-row">
            <span>ılııl</span>
            <span>मराठी / हिन्दी आवाज सहाय्यक</span>
          </div>
          <div className="audio-subtitle-sub">
            Tap to hear today's loan advisory & safe limit
          </div>
        </div>

        {/* Speed selectors */}
        <div className="audio-speed-group">
          <button
            className={`audio-speed-pill ${playbackSpeed === '1.0' ? 'active' : ''}`}
            onClick={() => handleSpeedToggle('1.0')}
          >
            1.0x
          </button>
          <button
            className={`audio-speed-pill ${playbackSpeed === '0.8' ? 'active' : ''}`}
            onClick={() => handleSpeedToggle('0.8')}
          >
            0.8x
          </button>
        </div>

        {/* Replay Button */}
        <button
          className="audio-replay-btn"
          onClick={() => onPlayAudio(parseFloat(playbackSpeed))}
          title="Replay Audio"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
