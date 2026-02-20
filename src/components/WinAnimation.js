import React, { useEffect, useState } from 'react';
import './WinAnimation.css';

const WinAnimation = ({ onRestart }) => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="win-overlay">
            <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className={`confetti`} style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: i % 2 === 0 ? '#d4af37' : '#ffffff',
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 4}s`,
                    }}></div>
                ))}
            </div>

            <div className={showContent ? 'win-content show' : 'win-content'}>
                <h1 className="win-title">MAGNIFICENT</h1>
                <h2 className="win-subtitle">ROYAL VICTORY</h2>

                <button className="restart-btn" onClick={onRestart}>
                    RE-ENTER ARENA
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .confetti {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 10px;
          animation: fall linear infinite;
        }
      `}} />
        </div>
    );
};

export default WinAnimation;
