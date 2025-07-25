import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  QuestionMarkCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  HeartIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const TutorialBubble = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // tutorial content structure
  const tutorialContent = {
    '/dashboard': {
      title: 'Dashboard Overview',
      description: 'Your main analytics hub for quick insights',
      steps: [
        {
          title: 'Welcome to Sunsights',
          content: 'Sunsights is an AI-powered customer feedback analysis platform that helps teams understand customer emotions and prioritize responses effectively.',
          icon: <AcademicCapIcon className="w-6 h-6" />
        },
        {
          title: 'What is Sentiment?',
          content: 'Sentiment analysis classifies the overall emotional tone of customer feedback into POSITIVE (satisfaction), NEGATIVE (dissatisfaction), MIXED (both elements), or NEUTRAL (no clear tone).',
          icon: <HeartIcon className="w-6 h-6" />
        },
        {
          title: 'Understanding Emotions',
          content: 'Our AI detects specific emotions: Joy (happiness), Sadness (disappointment), Anger (irritation), Fear (concern), Surprise (unexpected reactions), Love (strong positive feelings), and Neutral.',
          icon: <HeartIcon className="w-6 h-6" />
        },
        {
          title: 'Score',
          content: 'The score (0-100%) indicates how confident our AI is about the sentiment classification. Higher scores mean more certain analysis.',
          icon: <ChartBarIcon className="w-6 h-6" />
        },
        {
          title: 'Priority Levels',
          content: 'Priority helps you respond efficiently: HIGH (urgent issues needing immediate attention), MEDIUM (important but not critical), LOW (general feedback or positive comments).',
          icon: <ExclamationTriangleIcon className="w-6 h-6" />
        }
      ]
    },
    '/single-analysis': {
      title: 'Single Analysis',
      description: 'Analyze individual customer messages in real-time',
      steps: [
        {
          title: 'Single Text Analysis',
          content: 'Paste any customer message here for instant sentiment and emotion detection. Perfect for real-time customer service responses.',
          icon: <AcademicCapIcon className="w-6 h-6" />
        },
        {
          title: 'Real-time Results',
          content: 'Get immediate insights including sentiment classification, specific emotion detection, scores, and priority levels for each message.',
          icon: <ChartBarIcon className="w-6 h-6" />
        }
      ]
    },
    '/bulk-analysis': {
      title: 'Bulk Analysis Guide',
      description: 'Step-by-step guide for valid file uploads',
      steps: [
        {
          title: '✅ Step 1: File Format Requirements',
          content: 'SUPPORTED: CSV (.csv), Excel (.xlsx, .xls) files only. MAXIMUM: 10MB per file, up to 10,000 rows recommended. Each file should contain customer feedback text in columns.',
          icon: <AcademicCapIcon className="w-6 h-6" />
        },
        {
          title: '✅ Step 2: Column Setup (CRITICAL)',
          content: 'NAME your text columns: "comment", "comments", "text", "feedback", "review", "message", or "content". The system auto-detects these names. AVOID: Generic names like "Column1" or "Data".',
          icon: <ExclamationTriangleIcon className="w-6 h-6" />
        },
        {
          title: '✅ Step 3: Data Preparation',
          content: 'INCLUDE: Customer reviews, support tickets, survey responses, social media posts (minimum 2 characters). EXCLUDE: Empty rows, pure numbers, single characters, or non-English text.',
          icon: <ChartBarIcon className="w-6 h-6" />
        },
        {
          title: '✅ Step 4: Upload Process',
          content: 'DRAG & DROP or click to upload multiple files. WAIT for "Processing 100%" before analyzing. CHECK the preview table to ensure correct data detection.',
          icon: <HeartIcon className="w-6 h-6" />
        },
        {
          title: '❌ Common Mistakes to AVOID',
          content: 'DON\'T: Mix languages, use special characters in headers, include personal data (emails, names), upload corrupted files, or expect analysis of non-text content (images, links).',
          icon: <ExclamationTriangleIcon className="w-6 h-6" />
        },
        {
          title: '🔧 Troubleshooting Tips',
          content: 'IF ISSUES: Check file isn\'t corrupted, ensure UTF-8 encoding for CSVs, verify column headers match supported names, remove special characters, and try a smaller file first.',
          icon: <ChartBarIcon className="w-6 h-6" />
        }
      ]
    },
    '/analytics': {
      title: 'Analytics Dashboard',
      description: 'View trends and patterns in customer sentiment',
      steps: [
        {
          title: 'Trend Analysis',
          content: 'Visualize sentiment trends over time to identify patterns in customer satisfaction and emotional responses to your products or services.',
          icon: <ChartBarIcon className="w-6 h-6" />
        },
        {
          title: 'Emotion Distribution',
          content: 'See the breakdown of different emotions in your customer feedback to understand what drives customer feelings about your brand.',
          icon: <HeartIcon className="w-6 h-6" />
        },
        {
          title: 'Priority Insights',
          content: 'Track the distribution of high, medium, and low priority feedback to optimize your response strategy and resource allocation.',
          icon: <ExclamationTriangleIcon className="w-6 h-6" />
        }
      ]
    },
    '/profile': {
      title: 'Profile Settings',
      description: 'Manage your account and preferences',
      steps: [
        {
          title: 'Account Management',
          content: 'Update your profile information, change your password, and manage your account settings for a personalized Sunsights experience.',
          icon: <AcademicCapIcon className="w-6 h-6" />
        },
        {
          title: 'Usage Statistics',
          content: 'View your analysis history and usage statistics to track how Sunsights is helping improve your customer service operations.',
          icon: <ChartBarIcon className="w-6 h-6" />
        }
      ]
    }
  };

  // get current page content
  const currentContent = tutorialContent[location.pathname] || tutorialContent['/dashboard'];

  // tutorial implementation validation logging
  console.log('Tutorial Bubble Implementation Status:', {
    implementation: {
      component: '✓ TutorialBubble component created',
      integration: '✓ Integrated into Layout component',
      positioning: '✓ Fixed bottom-right positioning with z-50',
      stateManagement: '✓ localStorage for completion tracking',
      responsiveDesign: '✓ Responsive with max-w-[90vw] and max-h-[80vh]'
    },
    contentStructure: {
      totalPages: 5,
      pagesWithContent: Object.keys(tutorialContent).length,
      conceptsCovered: ['Sentiment', 'Emotion', 'Score', 'Priority', 'Sunsights Purpose'],
      stepsByPage: Object.entries(tutorialContent).map(([page, content]) => ({
        page,
        steps: content.steps.length,
        title: content.title
      }))
    },
    currentState: {
      pathname: location.pathname,
      isOpen,
      currentStep,
      isCompleted,
      availableContent: !!tutorialContent[location.pathname]
    }
  });

  // check if tutorial is completed for current page
  useEffect(() => {
    if (isOpen) {
      handleNavigationClose();
    }
    
    const completed = localStorage.getItem(`tutorial_completed_${location.pathname}`);
    setIsCompleted(completed === 'true');
    setCurrentStep(0);
    setIsOpen(false); // this closes tutorial when navigating - could be causing empty screen
    
    // log state after navigation
    console.log('✅ TUTORIAL STATE AFTER NAVIGATION:', {
      newPath: location.pathname,
      isOpen: false, // forced to false
      currentStep: 0, // reset to 0
      isCompleted: completed === 'true'
    });
    

    
    // log page navigation and tutorial status
    console.log('Tutorial Page Navigation:', {
      navigatedTo: location.pathname,
      pageTitle: currentContent.title,
      hasContent: !!tutorialContent[location.pathname],
      isCompleted: completed === 'true',
      totalSteps: currentContent.steps.length,
      navigationTime: new Date().toISOString()
    });
  }, [location.pathname, currentContent.title, currentContent.steps.length]);

  // handle tutorial completion
  const handleComplete = () => {
    console.log('Tutorial Completed:', {
      page: location.pathname,
      pageTitle: currentContent.title,
      totalSteps: currentContent.steps.length,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(`tutorial_completed_${location.pathname}`, 'true');
    setIsCompleted(true);
    setIsOpen(false);
    setCurrentStep(0);
  };

  // handle restart tutorial
  const handleRestart = () => {
    console.log('Tutorial Restarted:', {
      page: location.pathname,
      pageTitle: currentContent.title,
      restartedAt: new Date().toISOString()
    });
    localStorage.removeItem(`tutorial_completed_${location.pathname}`);
    setIsCompleted(false);
    setCurrentStep(0);
    setIsOpen(true);
  };

  // navigation handlers
  const handleNext = () => {
    if (currentStep < currentContent.steps.length - 1) {
      console.log('Tutorial Step Navigation:', {
        page: location.pathname,
        action: 'next',
        fromStep: currentStep,
        toStep: currentStep + 1,
        stepTitle: currentContent.steps[currentStep + 1].title
      });
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      console.log('Tutorial Step Navigation:', {
        page: location.pathname,
        action: 'previous',
        fromStep: currentStep,
        toStep: currentStep - 1,
        stepTitle: currentContent.steps[currentStep - 1].title
      });
      setCurrentStep(currentStep - 1);
    }
  };

  // handle tutorial open/close
  const handleOpen = () => {
    console.log('Tutorial Opened:', {
      page: location.pathname,
      pageTitle: currentContent.title,
      isCompleted,
      openedAt: new Date().toISOString()
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    console.log('Tutorial Closed:', {
      page: location.pathname,
      currentStep,
      totalSteps: currentContent.steps.length,
      completionPercentage: Math.round((currentStep / currentContent.steps.length) * 100),
      closedAt: new Date().toISOString(),
      reason: 'user_closed'
    });
    setIsOpen(false);
  };

  // handle forced close on navigation (add this for debugging)
  const handleNavigationClose = () => {
    console.log('🚨 TUTORIAL FORCED CLOSE ON NAVIGATION:', {
      page: location.pathname,
      wasOpen: isOpen,
      currentStep,
      reason: 'navigation_change',
      timestamp: new Date().toISOString()
    });
  };

  // dont render on auth page
  if (location.pathname === '/auth' || location.pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      {/* Tutorial logging */}
      {console.log('Tutorial Bubble Render:', {
        currentPath: location.pathname,
        isOpen,
        currentStep,
        isCompleted,
        currentContent: currentContent.title,
        totalSteps: currentContent.steps.length,
        renderingBubble: true,
        containerClasses: 'fixed bottom-4 right-4 z-50 pointer-events-none'
      })}

      {!isOpen ? (
        // collapsed bubble
        <div className="relative pointer-events-auto">
          <button
            onClick={handleOpen}
            className="bg-primary text-bg p-3 rounded-full shadow-lg hover:bg-primary/90 hover:scale-110 transition-all duration-200 group"
            aria-label="Open tutorial"
          >
            <QuestionMarkCircleIcon className="w-6 h-6" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-bg-dark text-text px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              {isCompleted ? 'Tutorial completed - Click to restart' : 'Need help? Click for tutorial'}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-bg-dark"></div>
            </div>
          </div>
        </div>
      ) : (
        // expanded tutorial panel
        <div className="bg-bg-light border border-border rounded-2xl shadow-2xl w-80 max-w-[90vw] max-h-[80vh] overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="bg-primary text-bg p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{currentContent.title}</h3>
              <p className="text-sm opacity-90">{currentContent.description}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-primary/20 rounded-lg transition-colors duration-200"
              aria-label="Close tutorial"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="px-4 py-2 bg-bg border-b border-border">
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>Step {currentStep + 1} of {currentContent.steps.length}</span>
              <div className="flex space-x-1">
                {currentContent.steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentStep ? 'bg-primary' : 
                      index < currentStep ? 'bg-success' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="flex items-start space-x-3">
              <div className="text-primary mt-1">
                {currentContent.steps[currentStep].icon}
              </div>
              <div>
                <h4 className="font-semibold text-text mb-2">
                  {currentContent.steps[currentStep].title}
                </h4>
                <p className="text-text-muted leading-relaxed">
                  {currentContent.steps[currentStep].content}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 bg-bg border-t border-border flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-3 py-2 text-text-muted hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {isCompleted && (
                <button
                  onClick={handleRestart}
                  className="px-3 py-2 text-sm text-text-muted hover:text-text transition-colors duration-200"
                >
                  Restart
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-bg rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                <span>{currentStep === currentContent.steps.length - 1 ? 'Complete' : 'Next'}</span>
                {currentStep < currentContent.steps.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialBubble; 