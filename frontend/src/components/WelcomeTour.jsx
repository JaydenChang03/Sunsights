import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';

const WelcomeTour = () => {
  const [runTour, setRunTour] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const steps = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="welcome-step text-center p-6">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-2xl font-bold mb-3">Welcome to Sunsights!</h2>
          <p className="text-lg">Your journey into photo sentiment analysis begins here.</p>
          <p className="text-sm mt-4 text-gray-300">Let's take a quick tour to discover all the amazing features.</p>
        </div>
      ),
      disableBeacon: true,
      styles: {
        options: {
          overlayColor: 'rgba(0, 0, 0, 0.85)',
        }
      }
    },
    {
      target: '[data-tour="dashboard"]',
      content: (
        <div className="tour-step p-4">
          <h3 className="text-xl font-semibold mb-2">📊 Your Dashboard</h3>
          <p>This is your command center! Get a quick overview of your analysis activity and recent insights.</p>
          <div className="mt-3 text-sm text-gray-300">Pro tip: Check your dashboard daily for new insights!</div>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '[data-tour="single-analysis"]',
      content: (
        <div className="tour-step p-4">
          <h3 className="text-xl font-semibold mb-2">🔍 Single Analysis</h3>
          <p>Analyze comments instantly! Just type or paste your text and hit Enter.</p>
          <div className="mt-3 text-sm text-gray-300">
            Quick Tip: Use Shift+Enter for new lines in your comments.
          </div>
        </div>
      ),
    },
    {
      target: '[data-tour="bulk-analysis"]',
      content: (
        <div className="tour-step p-4">
          <h3 className="text-xl font-semibold mb-2">📦 Bulk Analysis</h3>
          <p>Need to analyze multiple comments at once? Upload them here and get insights in bulk!</p>
          <div className="mt-3 text-sm text-gray-300">
            Perfect for analyzing large sets of feedback or comments.
          </div>
        </div>
      ),
    },
    {
      target: '[data-tour="analytics"]',
      content: (
        <div className="tour-step p-4">
          <h3 className="text-xl font-semibold mb-2">📈 Analytics</h3>
          <p>Dive deep into your analysis trends and patterns over time.</p>
          <div className="mt-3 text-sm text-gray-300">
            Watch your insights grow and evolve as you analyze more content!
          </div>
        </div>
      ),
    },
    {
      target: '[data-tour="profile"]',
      content: (
        <div className="tour-step p-4">
          <h3 className="text-xl font-semibold mb-2">👤 Your Profile</h3>
          <p>Track your achievements, customize your profile, and see your activity history.</p>
          <div className="mt-3 text-sm text-gray-300">
            Earn badges as you use Sunsights and build your reputation!
          </div>
        </div>
      ),
    },
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="welcome-step text-center p-6">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-3">You're All Set!</h2>
          <p className="text-lg">Ready to start analyzing?</p>
          <div className="mt-4 p-3 bg-green-800 bg-opacity-30 rounded-lg">
            <p className="text-sm">Head over to Single Analysis to try your first comment analysis!</p>
          </div>
        </div>
      ),
    },
  ];

  const handleTourCallback = (data) => {
    const { status, index, type } = data;
    
    // Navigate to different sections during the tour
    if (status === STATUS.RUNNING && type === 'step:after') {
      switch(index) {
        case 1:
          navigate('/dashboard');
          break;
        case 2:
          navigate('/single-analysis');
          break;
        case 3:
          navigate('/bulk-analysis');
          break;
        case 4:
          navigate('/analytics');
          break;
        case 5:
          navigate('/profile');
          break;
        default:
          break;
      }
    }

    // Mark tour as completed when finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      localStorage.setItem('hasSeenTour', 'true');
      setRunTour(false);
      navigate('/single-analysis'); // Direct users to start analyzing
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleTourCallback}
      styles={{
        options: {
          primaryColor: '#4F6F52',
          textColor: '#ECE3CE',
          backgroundColor: '#3A4D39',
          arrowColor: '#3A4D39',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1000,
        },
        tooltip: {
          padding: '0',
          borderRadius: '12px',
          backgroundColor: '#3A4D39',
          filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#739072',
          color: '#ECE3CE',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: '16px',
          border: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#4F6F52',
            transform: 'translateY(-1px)',
          },
        },
        buttonBack: {
          color: '#ECE3CE',
          marginRight: '10px',
          padding: '10px 20px',
          fontSize: '16px',
          '&:hover': {
            color: '#739072',
          },
        },
        buttonSkip: {
          color: '#ECE3CE',
          opacity: 0.7,
          '&:hover': {
            opacity: 1,
            color: '#ECE3CE',
          },
        },
        buttonClose: {
          display: 'none',
        },
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
          },
        },
      }}
    />
  );
};

export default WelcomeTour;
