import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const carouselContent = [
  {
    title: "Emotion Analysis Platform",
    description: "Unleash the Power of AI to Understand Emotions in Text and Speech",
    image: "/imageA.png",
    highlight: "Real-time sentiment analysis with advanced AI technology"
  },
  {
    title: "Data-Driven Insights",
    description: "Transform Your Understanding of Customer Emotions",
    image: "/imageB.png",
    highlight: "Comprehensive analytics and visualization tools"
  },
  {
    title: "Bulk Analysis Made Easy",
    description: "Process Thousands of Comments in Minutes",
    image: "/imageC.png",
    highlight: "Efficient batch processing for large-scale analysis"
  }
];

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  
  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Add forgot password validation logging  
  useEffect(() => {
    console.log('🔍 FORGOT PASSWORD FEATURE VALIDATION:', {
      backendSupport: {
        endpoints: ['/api/auth/forgot-password', '/api/auth/reset-password'],
        tokenGeneration: 'JWT with 1-hour expiration',
        databaseField: 'reset_token in users table',
        validation: 'Token verification with additional_claims'
      },
      frontendImplementation: {
        currentState: 'NO UI implemented',
        requiredStates: ['showForgotPassword', 'forgotPasswordEmail', 'forgotPasswordLoading', 'forgotPasswordSent'],
        requiredFunctions: ['handleForgotPassword', 'resetForgotPasswordState'],
        uiFlow: 'Login form -> Forgot password link -> Email input -> Success message'
      },
      implementationGaps: {
        gap1: 'No forgot password link in login form',
        gap2: 'No forgot password modal/form',
        gap3: 'No email input for password reset',
        gap4: 'No success/error handling for forgot password',
        gap5: 'No integration with backend endpoints'
      }
    });
  }, []);

  // Add useEffect to log color scheme debugging info
  useEffect(() => {
    console.log('Auth Debug - Logo Size Still Too Small Analysis:', {
      currentImplementation: {
        size: '1.25rem (20px)',
        approach: 'Inline styles',
        logoIcon: 'h-16 (4rem = 64px)',
        userFeedback: 'Still looks small'
      },
      sizeComparisonIssues: {
        issue1: '1.25rem vs 4rem icon creates massive imbalance',
        issue2: '1.25rem increment from 1.125rem too conservative',
        issue3: 'Gradient text appears lighter/smaller than solid text',
        issue4: 'Dark theme requires larger text for proper visibility',
        issue5: 'Need substantial size jump for visual impact',
        issue6: 'Typography hierarchy needs bigger logo prominence',
        issue7: 'Screen density might make text appear smaller'
      },
      betterSizeOptions: {
        option1: '1.5rem (24px) - 50% larger than original',
        option2: '1.75rem (28px) - Better balance with icon',
        option3: '2rem (32px) - Strong visual presence',
        option4: '2.25rem (36px) - Prominent branding'
      },
      recommendedChoice: {
        size: '2rem (32px)',
        reasoning: 'Good balance with 4rem icon, strong presence, not overwhelming',
        ratio: '1:2 text-to-icon ratio (reasonable proportion)'
      },
      projectColors: {
        primary: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
        secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary')
      }
    });

    // Log design analysis
    console.log('Auth Design Analysis:', {
      currentDesignElements: {
        hasCarousel: true,
        hasAnimations: true,
        hasHoverEffects: true,
        hasGradients: true,
        hasBlurEffects: false,
        hasFloatingElements: false,
        hasParticles: false,
        hasModernInputs: false,
        hasLoadingStates: true,
        hasProgressIndicators: false
      },
      formInteractivity: {
        hasFloatingLabels: false,
        hasInputGroups: false,
        hasVisualFeedback: true,
        hasPasswordStrength: false,
        hasAutoComplete: false,
        hasModernStyling: false
      },
      visualDepth: {
        hasGlassmorphism: false,
        hasLayeredDesign: false,
        hasDepthEffects: false,
        hasAdvancedShadows: false,
        hasModernCards: false
      },
      timestamp: new Date().toISOString()
    });

    // Log JSX structure validation
    console.log('Auth JSX Structure Validation:', {
      issue: 'Missing closing div tag for relative z-10 pt-2 container',
      expectedStructure: {
        form: 'should contain progress indicator + relative z-10 div wrapper',
        relativeDiv: 'should wrap all form inputs and button',
        closingTags: 'relative div should close before form closes'
      },
      currentProblem: 'div className="relative z-10 pt-2" is missing its closing </div>',
      location: 'After button and form toggle section, before </form>',
      timestamp: new Date().toISOString()
    });

    // Log JSX structure fix validation
    console.log('Auth JSX Structure Fix Applied:', {
      issue: 'RESOLVED - Added missing closing div tag',
      fixApplied: 'Added </div> after form toggle section',
      structureNow: {
        form: 'Contains progress indicator + relative z-10 div wrapper ✓',
        relativeDiv: 'Wraps all form inputs and button ✓',
        closingTags: 'relative div closes before form closes ✓'
      },
      expectedResult: 'JSX should compile without errors',
      timestamp: new Date().toISOString()
    });

    // Log design analysis for cluttered appearance
    console.log('Auth Design Issues Analysis:', {
      identifiedProblems: {
        1: 'Missing card container - form lacks proper visual containment',
        2: 'Excessive visual effects layering - multiple overlapping hover effects',
        3: 'Inconsistent spacing - form fields may lack proper visual separation',
        4: 'Overwhelming hover states - too many simultaneous hover effects',
        5: 'Complex input styling - multiple background layers and effects',
        6: 'Button over-styling - complex gradient effects and transforms',
        7: 'Lack of visual hierarchy - all elements competing for attention'
      },
      mostLikelyIssues: {
        primary: 'Missing card container for proper visual organization',
        secondary: 'Excessive layered effects creating visual noise'
      },
      currentFormStructure: {
        hasCardWrapper: false,
        hasProperSpacing: 'needs validation',
        visualEffectsCount: 'multiple overlapping (gradient overlays, glow, scale, backdrop-blur)',
        inputComplexity: 'high (bg-bg/50, backdrop-blur-sm, border, focus:ring-2, hover effects)',
        buttonComplexity: 'very high (gradient bg, hover gradient, scale, translate, shadow effects)'
      },
      recommendedSolutions: {
        1: 'Add card wrapper around entire form',
        2: 'Simplify input styling - reduce layered effects',
        3: 'Streamline button design - focus on single primary effect',
        4: 'Improve spacing consistency between form elements',
        5: 'Reduce competing visual effects for better hierarchy'
      },
      timestamp: new Date().toISOString()
    });

    // Log current form element styling complexity
    console.log('Auth Form Styling Complexity Analysis:', {
      formContainer: {
        classes: 'space-y-6 bg-bg-light/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-border-muted/50 relative overflow-hidden',
        effectsCount: 7,
        hasCardWrapper: false,
        needsSimplification: true
      },
      inputFields: {
        classes: 'w-full px-4 py-4 bg-bg/50 backdrop-blur-sm border border-border-muted rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-text placeholder-text-muted/50 hover:bg-bg/70 focus:bg-bg/90 input-glow',
        effectsCount: 9,
        hasOverlayEffects: true,
        needsSimplification: true
      },
      submitButton: {
        classes: 'w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-bg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-500 disabled:opacity-50 hover:shadow-2xl transform hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-hidden group',
        effectsCount: 12,
        hasComplexHoverStates: true,
        needsSimplification: true
      },
      visualNoise: {
        gradientOverlays: 'multiple on inputs and buttons',
        hoverEffects: 'scale, translate, glow, background changes',
        focusEffects: 'ring, border, background changes',
        backgroundEffects: 'backdrop-blur, multiple bg layers',
        shadowEffects: 'shadow-lg, hover:shadow-2xl, hover:shadow-3xl'
      },
      timestamp: new Date().toISOString()
    });

    // Log spacing and layout issues
    console.log('Auth Layout & Spacing Analysis:', {
      currentSpacing: {
        formContainer: 'space-y-6',
        formPadding: 'p-8',
        inputPadding: 'px-4 py-4',
        buttonPadding: 'py-4 px-6',
        labelMargin: 'mb-2'
      },
      cardStructure: {
        hasOuterCard: false,
        hasInnerCard: false,
        formIsCard: true,
        needsCardWrapper: true,
        recommendedStructure: 'outer card -> inner form card -> form elements'
      },
      visualHierarchy: {
        allElementsCompeting: true,
        needsClearHierarchy: true,
        tooManyEffects: true,
        recommendedApproach: 'reduce effects, focus on key interactions'
      },
      timestamp: new Date().toISOString()
    });

    // Log validation of assumptions
    console.log('Auth Design Assumptions Validation:', {
      assumption1: {
        description: 'Missing card container causes visual disorganization',
        evidence: 'Form directly styled as card without proper wrapper',
        validated: true,
        severity: 'high'
      },
      assumption2: {
        description: 'Excessive layered effects create visual noise',
        evidence: 'Multiple simultaneous hover/focus effects on each element',
        validated: true,
        severity: 'high'
      },
      assumption3: {
        description: 'Inconsistent spacing between elements',
        evidence: 'Need to validate actual spacing measurements',
        validated: 'needs measurement',
        severity: 'medium'
      },
      assumption4: {
        description: 'Button over-styling creates cluttered appearance',
        evidence: '12+ CSS classes with complex hover states',
        validated: true,
        severity: 'high'
      },
      nextSteps: {
        1: 'Add proper card wrapper structure',
        2: 'Simplify input styling to 3-4 key effects',
        3: 'Streamline button to single primary hover effect',
        4: 'Improve spacing consistency',
        5: 'Reduce competing visual effects'
      },
      timestamp: new Date().toISOString()
    });

    // Log analysis of provided image vs current design
    console.log('Auth Design Reference Image Analysis:', {
      providedImageFeatures: {
        1: 'Single card layout - entire content in one centered card',
        2: 'Horizontal layout - left illustration, right form',
        3: 'Clean white background - minimal, simple background',
        4: 'Minimal styling - clean form fields without complex effects',
        5: 'Consistent spacing - proper padding and margins',
        6: 'Simple button - clean, solid button without gradients',
        7: 'Centered content - properly centered in viewport'
      },
      currentDesignDifferences: {
        1: 'Multiple separate elements - no unified card container',
        2: 'Complex background - gradient, particles, blur effects',
        3: 'Over-styled form fields - multiple effects and animations',
        4: 'Complex button - gradients, transforms, shadows',
        5: 'Inconsistent spacing - various padding/margin values',
        6: 'Not properly centered - multiple containers',
        7: 'Too many visual effects - competing elements'
      },
      keyDesignGaps: {
        primary: 'Missing unified card container for entire layout',
        secondary: 'Over-complex styling vs simple, clean approach',
        tertiary: 'Background complexity vs minimal clean background'
      },
      timestamp: new Date().toISOString()
    });

    // Log specific layout structure differences
    console.log('Auth Layout Structure Comparison:', {
      providedImageStructure: {
        container: 'Single centered card container',
        background: 'Clean, minimal background',
        leftSide: 'Illustration area with simple styling',
        rightSide: 'Form area with clean inputs',
        formFields: 'Simple, clean input styling',
        button: 'Solid color button, no gradients',
        spacing: 'Consistent padding throughout'
      },
      currentStructure: {
        container: 'Multiple separate containers (particles, illustration, form)',
        background: 'Complex gradient with floating particles',
        leftSide: 'Complex carousel with multiple animations',
        rightSide: 'Form with card wrapper and complex styling',
        formFields: 'Multiple effects (backdrop-blur, gradients, hover states)',
        button: 'Complex gradient + transforms + shadows',
        spacing: 'Various spacing values across elements'
      },
      requiredChanges: {
        1: 'Create single unified card container',
        2: 'Simplify background to clean, minimal approach',
        3: 'Replace complex carousel with simple illustration',
        4: 'Simplify form styling to clean, minimal approach',
        5: 'Use solid button instead of gradient',
        6: 'Standardize spacing throughout',
        7: 'Center entire layout properly'
      },
      timestamp: new Date().toISOString()
    });

    // Log styling complexity analysis
    console.log('Auth Styling Complexity vs Reference:', {
      referenceImageStyling: {
        background: 'Clean, light background',
        card: 'Simple white card with subtle shadow',
        inputs: 'Clean border, simple focus states',
        button: 'Solid color, simple hover',
        illustration: 'Simple, clean illustration area',
        typography: 'Clean, readable fonts',
        effects: 'Minimal, subtle effects only'
      },
      currentStyling: {
        background: 'Complex gradient + particles + blur',
        card: 'Multiple cards with backdrop-blur + gradients',
        inputs: 'backdrop-blur + gradients + multiple hover states',
        button: 'Complex gradient + transforms + shadows',
        illustration: 'Complex carousel + animations',
        typography: 'Multiple gradient text effects',
        effects: 'Excessive animations and effects'
      },
      simplificationNeeded: {
        background: 'Remove particles, use simple background',
        card: 'Single card with simple shadow',
        inputs: 'Simple border and focus states',
        button: 'Solid color with simple hover',
        illustration: 'Static illustration, no carousel',
        typography: 'Clean, simple text styling',
        effects: 'Minimal, purposeful effects only'
      },
      timestamp: new Date().toISOString()
    });

    // Log most likely design issues
    console.log('Auth Design Issues - Most Likely Sources:', {
      issue1: {
        description: 'Missing unified card container',
        evidence: 'Current design has separate containers instead of single card',
        impact: 'Layout not properly unified and centered',
        severity: 'high',
        solution: 'Create single card container for entire layout'
      },
      issue2: {
        description: 'Over-complex styling vs clean reference',
        evidence: 'Multiple effects, gradients, animations vs simple clean design',
        impact: 'Visual noise and complexity vs clean, professional look',
        severity: 'high',
        solution: 'Simplify all styling to match clean reference approach'
      },
      issue3: {
        description: 'Background complexity vs minimal approach',
        evidence: 'Particles, gradients, blur effects vs clean background',
        impact: 'Distracting from main content',
        severity: 'medium',
        solution: 'Use simple, clean background'
      },
      issue4: {
        description: 'Inconsistent spacing and layout',
        evidence: 'Multiple padding/margin values vs consistent spacing',
        impact: 'Uneven visual rhythm',
        severity: 'medium',
        solution: 'Standardize spacing throughout'
      },
      issue5: {
        description: 'Complex carousel vs simple illustration',
        evidence: 'Animated carousel vs static illustration area',
        impact: 'Unnecessary complexity',
        severity: 'medium',
        solution: 'Replace with simple illustration display'
      },
      validatedAssumptions: {
        assumption1: 'Need unified card container - VALIDATED',
        assumption2: 'Over-complex styling - VALIDATED'
      },
      timestamp: new Date().toISOString()
    });

    // Log carousel functionality analysis
    console.log('Auth Carousel Functionality Analysis:', {
      currentIssues: {
        1: 'Carousel animation stopped working - images not cycling',
        2: 'Missing background behind card - needs proper layered background',
        3: 'Static single image instead of rotating carousel',
        4: 'CSS animations removed during redesign',
        5: 'Carousel container and classes removed',
        6: 'Missing carousel dots and navigation',
        7: 'Text content not cycling with images'
      },
      originalCarouselFeatures: {
        hasImageRotation: false,
        hasTextRotation: false,
        hasCarouselDots: false,
        hasCarouselContainer: false,
        hasAnimationClasses: false,
        hasTimingControls: false,
        carouselContent: 'Available but not being used'
      },
      missingCarouselElements: {
        carouselContainer: 'div with carousel-container class',
        carouselImages: 'Images with carousel-image class and data-index',
        carouselText: 'Text with carousel-text class and data-index',
        carouselDots: 'Dots with carousel-dot class and data-index',
        cssAnimations: 'CSS keyframes for carousel, dotHighlight',
        animationTiming: '15s infinite animation with delays'
      },
      backgroundDesignIssues: {
        missingOuterBackground: 'No background color behind card',
        needsLayeredBackground: 'Card should sit on colored background',
        referenceImageBackground: 'Light blue/teal background behind white card',
        currentBackground: 'Gradient background with card directly on it',
        requiredStructure: 'Outer background -> Card container -> Content'
      },
      timestamp: new Date().toISOString()
    });

    // Log specific carousel problems
    console.log('Auth Carousel Problems Validation:', {
      problem1: {
        description: 'Carousel animation CSS removed during redesign',
        evidence: 'CSS animations exist in index.css but not being used',
        impact: 'Images not rotating, static display only',
        severity: 'high',
        solution: 'Re-implement carousel container with proper classes'
      },
      problem2: {
        description: 'Missing carousel HTML structure',
        evidence: 'Only single img tag instead of carousel container',
        impact: 'No image cycling functionality',
        severity: 'high',
        solution: 'Add carousel-container with all images and proper data-index'
      },
      problem3: {
        description: 'Missing background layer behind card',
        evidence: 'Card directly on gradient background',
        impact: 'Does not match reference image design',
        severity: 'medium',
        solution: 'Add proper background color behind card'
      },
      problem4: {
        description: 'carouselContent array not being utilized',
        evidence: 'Array exists but only using first image',
        impact: 'Multiple images and text not displayed',
        severity: 'medium',
        solution: 'Map through carouselContent array properly'
      },
      problem5: {
        description: 'Missing carousel dots navigation',
        evidence: 'No dots displayed for carousel navigation',
        impact: 'No visual indication of carousel progress',
        severity: 'low',
        solution: 'Add carousel dots with proper animation'
      },
      mostLikelyIssues: {
        primary: 'Carousel HTML structure completely removed',
        secondary: 'Missing background layer behind card'
      },
      timestamp: new Date().toISOString()
    });

    // Log background design analysis
    console.log('Auth Background Design Analysis:', {
      referenceImageBackground: {
        structure: 'Light blue/teal background -> White card -> Content',
        outerBackground: 'Light blue/teal color',
        cardBackground: 'White/light color',
        cardShadow: 'Subtle shadow around card',
        cardBorderRadius: 'Rounded corners on card'
      },
      currentBackground: {
        structure: 'Gradient background -> Card -> Content',
        outerBackground: 'Gradient from bg-light to bg',
        cardBackground: 'bg color (same as outer)',
        cardShadow: 'shadow-2xl',
        cardBorderRadius: 'rounded-3xl'
      },
      requiredChanges: {
        1: 'Add proper background color behind card',
        2: 'Make card background contrast with outer background',
        3: 'Match reference image color scheme',
        4: 'Ensure proper visual hierarchy'
      },
      colorSchemeNeeded: {
        outerBackground: 'Light blue/teal similar to reference',
        cardBackground: 'White or light color for contrast',
        cardShadow: 'Subtle shadow for depth',
        cardPadding: 'Proper spacing around card'
      },
      timestamp: new Date().toISOString()
    });

    // Log validation of most likely issues
    console.log('Auth Issues Validation - Final Analysis:', {
      validatedIssue1: {
        description: 'Carousel functionality completely removed',
        evidence: 'Single img tag instead of carousel structure',
        validated: true,
        severity: 'high',
        quickFix: 'Restore carousel-container with all images'
      },
      validatedIssue2: {
        description: 'Missing layered background design',
        evidence: 'Card directly on gradient, no contrast background',
        validated: true,
        severity: 'medium',
        quickFix: 'Add proper background color behind card'
      },
      implementationPlan: {
        1: 'Add carousel container with all 3 images',
        2: 'Restore carousel CSS classes and animations',
        3: 'Add carousel dots navigation',
        4: 'Implement proper background layers',
        5: 'Test carousel timing and transitions'
      },
      timestamp: new Date().toISOString()
    });

    // Log current color scheme issues
    console.log('Auth Color Scheme Issues Analysis:', {
      currentColorIssues: {
        1: 'Using hardcoded blue/teal colors instead of project theme',
        2: 'Background uses from-blue-100 to-teal-100 instead of CSS variables',
        3: 'Not using project color palette (primary, secondary, bg, etc.)',
        4: 'Inconsistent with rest of application styling',
        5: 'Should use existing color system from index.css',
        6: 'White background should use bg-light or bg CSS variable',
        7: 'Colors not adapting to dark/light mode properly'
      },
      projectColorScheme: {
        primary: 'hsl(220, 78%, 24%) in light mode, hsl(220, 78%, 76%) in dark mode',
        secondary: 'hsl(40, 53%, 40%) in light mode, hsl(40, 53%, 60%) in dark mode',
        bg: 'hsl(222, 55%, 95%) in light mode, hsl(222, 55%, 5%) in dark mode',
        bgLight: 'hsl(220, 35%, 90%) in light mode, hsl(220, 35%, 10%) in dark mode',
        text: 'hsl(220, 100%, 2%) in light mode, hsl(220, 100%, 98%) in dark mode',
        textMuted: 'hsl(220, 35%, 27%) in light mode, hsl(220, 35%, 73%) in dark mode'
      },
      hardcodedColors: {
        currentBackground: 'bg-gradient-to-br from-blue-100 to-teal-100',
        currentCard: 'bg-white',
        shouldBeBackground: 'bg-gradient-to-br from-bg-light to-bg',
        shouldBeCard: 'bg-bg-light'
      },
      appCssColors: {
        primary: '#606c38',
        primaryDark: '#283618',
        light: '#fefae0',
        accent: '#dda15e',
        accentDark: '#bc6c25'
      },
      timestamp: new Date().toISOString()
    });

    // Log logo positioning issues
    console.log('Auth Logo Positioning Issues Analysis:', {
      currentPositioningIssues: {
        1: 'Logo and title currently centered in illustration section',
        2: 'Should be positioned towards top-left of the card',
        3: 'Current layout uses justify-center items-center',
        4: 'Text content is in center of left section',
        5: 'User wants logo/title/description leaning towards top-left',
        6: 'Current flex layout centers everything vertically',
        7: 'Need to change alignment and positioning'
      },
      currentLayout: {
        containerAlignment: 'flex flex-col justify-center items-center',
        logoSection: 'text-center mb-8',
        textSection: 'text-center',
        imageSection: 'flex-1 flex items-center justify-center',
        overallAlignment: 'Everything centered vertically and horizontally'
      },
      requiredChanges: {
        containerAlignment: 'flex flex-col justify-start items-start',
        logoSection: 'text-left mb-8',
        textSection: 'text-left',
        imageSection: 'flex-1 flex items-center justify-center (keep centered)',
        overallAlignment: 'Logo/text top-left, image centered'
      },
      layoutStructure: {
        current: 'justify-center items-center -> everything centered',
        needed: 'justify-start items-start -> content starts from top-left',
        logoAlignment: 'flex justify-center -> flex justify-start',
        textAlignment: 'text-center -> text-left'
      },
      timestamp: new Date().toISOString()
    });

    // Log most likely sources of problems
    console.log('Auth Design Problems - Most Likely Sources:', {
      problem1: {
        description: 'Hardcoded blue/teal colors instead of project theme',
        evidence: 'bg-gradient-to-br from-blue-100 to-teal-100, bg-white',
        impact: 'Inconsistent with app theme, no dark mode support',
        severity: 'high',
        solution: 'Replace with CSS variables (bg, bg-light, primary, secondary)'
      },
      problem2: {
        description: 'Logo and content centered instead of top-left aligned',
        evidence: 'justify-center items-center, text-center classes',
        impact: 'Logo not positioned as requested by user',
        severity: 'high',
        solution: 'Change to justify-start items-start, text-left alignment'
      },
      problem3: {
        description: 'Not using project color palette consistently',
        evidence: 'Hardcoded colors vs available CSS variables',
        impact: 'Visual inconsistency with rest of application',
        severity: 'medium',
        solution: 'Use primary, secondary, bg, bg-light variables'
      },
      problem4: {
        description: 'Card background not adapting to theme',
        evidence: 'bg-white hardcoded instead of CSS variable',
        impact: 'No dark mode support for card background',
        severity: 'medium',
        solution: 'Use bg-light or bg CSS variable'
      },
      problem5: {
        description: 'Input fields using hardcoded white background',
        evidence: 'bg-white in input className',
        impact: 'Form inputs not themed properly',
        severity: 'low',
        solution: 'Use bg CSS variable for inputs'
      },
      mostLikelyIssues: {
        primary: 'Hardcoded colors instead of project theme variables',
        secondary: 'Logo/content centered instead of top-left positioned'
      },
      validatedAssumptions: {
        assumption1: 'Color scheme not using project variables - VALIDATED',
        assumption2: 'Logo positioning not as requested - VALIDATED'
      },
      timestamp: new Date().toISOString()
    });

    // Log implementation plan
    console.log('Auth Design Fix Implementation Plan:', {
      colorFixes: {
        1: 'Replace from-blue-100 to-teal-100 with from-bg-light to-bg',
        2: 'Change bg-white to bg-bg-light for card',
        3: 'Update input bg-white to bg-bg',
        4: 'Ensure all colors use CSS variables',
        5: 'Test dark mode compatibility'
      },
      positioningFixes: {
        1: 'Change justify-center to justify-start for container',
        2: 'Change items-center to items-start for container',
        3: 'Change text-center to text-left for logo/text sections',
        4: 'Adjust flex layout to align content to top-left',
        5: 'Keep image section centered as it looks good'
      },
      testingRequired: {
        1: 'Verify colors match project theme',
        2: 'Test dark mode compatibility',
        3: 'Confirm logo positioning is top-left',
        4: 'Ensure carousel still works properly',
        5: 'Check responsive behavior'
      },
      timestamp: new Date().toISOString()
    });
  }, []);

  const handleInputFocus = (fieldName) => {
    console.log('Auth Input Focus:', {
      field: fieldName,
      timestamp: new Date().toISOString(),
      currentFormData: {
        hasName: !!formData.name,
        hasEmail: !!formData.email,
        hasPassword: !!formData.password
      }
    });
  };

  const handleInputBlur = (fieldName) => {
    console.log('Auth Input Blur:', {
      field: fieldName,
      timestamp: new Date().toISOString()
    });
  };

  const handleFormToggle = (newMode) => {
    console.log('Auth Form Toggle:', {
      from: isLogin ? 'login' : 'register',
      to: newMode ? 'login' : 'register',
      timestamp: new Date().toISOString()
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    
    try {
      console.log('🔍 FORGOT PASSWORD: Sending request for email:', forgotPasswordEmail);
      
      const response = await axios.post('/api/auth/forgot-password', {
        email: forgotPasswordEmail.trim()
      });

      console.log('🔍 FORGOT PASSWORD: Success response:', response.data);
      setForgotPasswordSent(true);
      toast.success('Password reset instructions sent to your email');
      
      // For development: show the token in console (remove in production)
      if (response.data.reset_token) {
        console.log('🔧 DEV: Reset token:', response.data.reset_token);
        console.log('🔧 DEV: You can use this token to test password reset');
      }
      
    } catch (error) {
      console.error('🔍 FORGOT PASSWORD: Error:', error);
      console.error('🔍 Error response:', error.response?.data);
      console.error('🔍 Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    console.log('🔄 FORGOT PASSWORD: Resetting state');
    setShowForgotPassword(false);
    setForgotPasswordEmail('');
    setForgotPasswordLoading(false);
    setForgotPasswordSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate input
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      console.log('Attempting authentication:', {
        endpoint,
        email: formData.email,
        hasPassword: !!formData.password,
        hasName: !!formData.name
      });

      const response = await axios.post(endpoint, {
        email: formData.email.trim(),
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name.trim() })
      });

      console.log('Authentication successful:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user
      });

      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success(`Successfully ${isLogin ? 'logged in' : 'registered'}!`);
        onAuthSuccess(user);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = 'An error occurred during authentication';
      
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        console.error('No response received');
        errorMessage = 'Unable to reach the server. Please check your connection.';
      } else {
        console.error('Request setup error:', error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // DEPTH & ALIGNMENT ANALYSIS LOGS
  console.log('Auth Card Depth & Logo Alignment Analysis:', {
    userFeedback: {
      request1: 'Add depth to the card',
      request2: 'Move brand logo and name slightly left, align with description'
    },
    currentDepthAnalysis: {
      cardShadow: 'shadow-2xl - Basic depth',
      backgroundContrast: 'bg-bg-light vs bg-gradient-to-br from-bg-light to-bg',
      borderRadius: 'rounded-3xl - Good',
      elevation: 'Single shadow layer - May need enhancement',
      innerShadows: 'None - Missing interior depth',
      layering: 'Basic z-index - May need improvement'
    },
    depthEnhancementOptions: {
      option1: 'Multiple shadow layers (shadow-2xl + custom shadows)',
      option2: 'Inset shadows for interior depth',
      option3: 'Border styling for definition',
      option4: 'Background layering with gradients',
      option5: 'Enhanced contrast between card and background'
    },
    currentLogoAlignment: {
      logoContainer: 'div className="flex items-center mb-6"',
      logoImage: 'h-16 w-auto mr-4',
      logoText: 'font-bold bg-gradient-to-r...',
      parentContainer: 'div className="mb-8 w-full"',
      descriptionContainer: 'div className="relative h-32 mb-8"',
      descriptionText: 'p className="text-lg text-text-muted max-w-md text-left"'
    },
    alignmentIssueAnalysis: {
      issue1: 'Logo container may have different left margin than description',
      issue2: 'Description has max-w-md constraint affecting alignment',
      issue3: 'Logo flex container vs description text alignment mismatch',
      issue4: 'Parent container padding may not match description alignment',
      issue5: 'Logo image mr-4 may create misalignment with text'
    },
    validationNeeded: {
      depth: 'Test current shadow-2xl effectiveness',
      alignment: 'Measure logo vs description left edge alignment',
      contrast: 'Check card vs background visual separation',
      layering: 'Verify z-index and elevation perception'
    }
  });

    // Add useEffect for form layout and element analysis
  useEffect(() => {
    const analyzeFormLayout = () => {
      const passwordField = document.querySelector('input[name="password"]');
      const forgotPasswordButton = document.querySelector('button[type="button"]');
      const submitButton = document.querySelector('button[type="submit"]');
      const copyrightText = document.querySelector('div.mt-8 p');
      
      // Find the specific forgot password button (not password toggle)
      const forgotPasswordLink = Array.from(document.querySelectorAll('button[type="button"]'))
        .find(btn => btn.textContent.includes('Forgot password'));
      
      if (passwordField && submitButton && copyrightText) {
        const passwordRect = passwordField.getBoundingClientRect();
        const submitRect = submitButton.getBoundingClientRect();
        const copyrightRect = copyrightText.getBoundingClientRect();
        const forgotPasswordRect = forgotPasswordLink ? forgotPasswordLink.getBoundingClientRect() : null;
        
        console.log('Form Layout Analysis:', {
          currentLayout: {
            passwordField: {
              bottom: passwordRect.bottom,
              height: passwordRect.height
            },
            forgotPasswordLink: forgotPasswordRect ? {
              exists: true,
              top: forgotPasswordRect.top,
              bottom: forgotPasswordRect.bottom,
              height: forgotPasswordRect.height,
              functionality: 'Placeholder only - no click handler',
              spacingFromPassword: forgotPasswordRect.top - passwordRect.bottom,
              spacingToSubmit: submitRect.top - forgotPasswordRect.bottom
            } : {
              exists: false,
              note: 'Forgot password not found or not rendered'
            },
            submitButton: {
              top: submitRect.top,
              height: submitRect.height
            },
            copyrightText: {
              currentText: copyrightText.textContent,
              needsUpdate: copyrightText.textContent.includes('2024')
            }
          },
          spacingAnalysis: {
            passwordToSubmit: submitRect.top - passwordRect.bottom,
            passwordToForgot: forgotPasswordRect ? forgotPasswordRect.top - passwordRect.bottom : 'N/A',
            forgotToSubmit: forgotPasswordRect ? submitRect.top - forgotPasswordRect.bottom : 'N/A',
            expectedSpacingAfterRemoval: 'Password field to submit button direct spacing'
          },
          modificationsNeeded: {
            copyright: {
              change: 'Replace "2024" with "2025"',
              complexity: 'Simple text replacement',
              impact: 'None'
            },
            forgotPassword: {
              change: 'Remove entire conditional JSX block',
              complexity: 'Remove {isLogin && (...)} section',
              layoutImpact: 'May need to adjust spacing',
              currentSpacing: forgotPasswordRect ? `${forgotPasswordRect.height}px + margins` : 'N/A'
            }
          }
        });
      }
    };
    
         // Analyze form layout after component mounts
     setTimeout(analyzeFormLayout, 100);
   }, []);

   // Tutorial content structure analysis
   console.log('Tutorial Content Structure Analysis:', {
     tutorialContent: {
       generalIntroduction: {
         title: 'Welcome to Sunsights',
         content: 'AI-powered customer feedback analysis platform that helps teams understand customer emotions and prioritize responses effectively.',
         audience: 'Customer service teams, support managers, business analysts'
       },
       coreConceptsExplanation: {
         sentiment: {
           definition: 'Overall emotional tone classification',
           types: ['POSITIVE - Customer satisfaction/approval', 'NEGATIVE - Customer dissatisfaction/complaints', 'MIXED - Both positive and negative elements', 'NEUTRAL - No clear emotional tone'],
           example: 'POSITIVE: "Great service!" vs NEGATIVE: "Poor experience"'
         },
         emotion: {
           definition: 'Specific emotional state detection',
           types: ['Joy - Happiness, satisfaction, delight', 'Sadness - Disappointment, frustration', 'Anger - Irritation, outrage', 'Fear - Concern, anxiety', 'Surprise - Unexpected reactions', 'Love - Strong positive feelings', 'Neutral - No specific emotion'],
           example: 'Joy: "I love this product!" vs Anger: "This is terrible!"'
         },
         score: {
           definition: 'Confidence level in sentiment analysis',
           range: '0-100% confidence percentage',
           interpretation: 'Higher scores indicate more certain classification',
           example: '85% confidence means the AI is highly certain about the sentiment'
         },
         priority: {
           definition: 'Urgency level for response based on sentiment and emotion',
           levels: ['High - Urgent issues requiring immediate attention', 'Medium - Important but not critical', 'Low - General feedback or positive comments'],
           factors: 'Based on sentiment negativity, emotion intensity, and content analysis'
         }
       },
       pageSpecificContent: {
         dashboard: 'Overview of your analytics and quick text analysis',
         singleAnalysis: 'Analyze individual customer messages in real-time',
         bulkAnalysis: 'Process multiple customer feedbacks from CSV/Excel files',
         analytics: 'View trends and patterns in customer sentiment over time',
         profile: 'Manage your account settings and preferences'
       }
     },
     implementationStrategy: {
       componentStructure: 'Reusable TutorialBubble component with dynamic content',
       contentDelivery: 'Multi-step tutorial with navigation controls',
       visualDesign: 'Bubble with arrow pointing to relevant UI elements',
       interactionModel: 'Click to expand, navigate through steps, dismiss when complete'
     }
   });

   // Implementation validation and planning
   console.log('Tutorial Implementation Validation:', {
     validatedApproach: {
       componentLocation: 'Create TutorialBubble component in components directory',
       integrationPoint: 'Add to Layout component for consistent positioning across all pages',
       positioning: 'Fixed bottom-right with responsive adjustments',
       zIndex: 'High z-index to appear above all other elements'
     },
     contentManagement: {
       dataStructure: 'Tutorial steps object with page-specific content',
       stateManagement: 'React useState for current step, localStorage for completion tracking',
       contentSwitching: 'Dynamic content based on current route/page',
       progressTracking: 'Step counter and completion indicators'
     },
     userExperience: {
       initialState: 'Collapsed bubble with help icon',
       expandedState: 'Full tutorial panel with navigation controls',
       navigation: 'Previous/Next buttons, step indicators, close button',
       completion: 'Mark as completed, option to restart tutorial'
     },
     technicalImplementation: {
       dependencies: 'React hooks, React Router for location detection',
       styling: 'Tailwind classes for responsive design',
       animations: 'Smooth transitions for expand/collapse',
       accessibility: 'ARIA labels, keyboard navigation support'
     },
     testingPlan: {
       functionality: 'Test tutorial on all 5 pages',
       responsiveness: 'Verify positioning on different screen sizes',
       stateManagement: 'Test completion tracking across page navigation',
       accessibility: 'Keyboard navigation and screen reader compatibility'
     }
   });

   // Pre-implementation validation logging
   console.log('Pre-Implementation Validation:', {
     tasksSummary: {
       task1: {
         description: 'Change copyright year from 2024 to 2025',
         currentValue: '© 2024 all rights reserved',
         targetValue: '© 2025 all rights reserved',
         implementation: 'Simple text replacement in JSX',
         risk: 'None'
       },
       task2: {
         description: 'Remove "Forgot Password" functionality',
         currentImplementation: 'Conditional JSX block: {isLogin && (...)}',
         targetImplementation: 'Complete removal of conditional block',
         implementation: 'Delete entire conditional rendering section',
         risk: 'Low - may affect form spacing'
       }
     },
     validationChecks: {
       copyrightLocation: 'Found in Copyright section at line ~1190',
       forgotPasswordLocation: 'Found in conditional block at line ~1145',
       forgotPasswordFunctionality: 'Button has no onClick handler - placeholder only',
       formSpacing: 'Uses space-y-6 class for consistent spacing',
       layoutImpact: 'Removing forgot password should maintain form spacing due to space-y-6'
     },
     implementationPlan: {
       step1: 'Change copyright text from 2024 to 2025',
       step2: 'Remove entire forgot password conditional block',
       step3: 'Verify form spacing remains consistent',
       step4: 'Test form layout and functionality'
     },
     expectedResults: {
       copyright: 'Updated year displayed correctly',
       forgotPassword: 'Section completely removed',
       formLayout: 'Consistent spacing maintained',
       functionality: 'No impact on form submission or validation'
     }
   });

   // TUTORIAL BUBBLE IMPLEMENTATION ANALYSIS
   console.log('Tutorial Bubble Implementation Analysis:', {
     userRequest: 'Add tutorial bubble on bottom right of every relevant page explaining Sunsights purpose and key concepts',
     scopeAnalysis: {
       relevantPages: [
         'Dashboard - Main overview and quick analysis',
         'SingleAnalysis - Individual text analysis',
         'BulkAnalysis - File upload and batch processing',
         'Analytics - Charts and trends visualization',
         'Profile - User settings and account management'
       ],
       excludedPages: [
         'Auth - Login/registration page (not relevant for tutorial)'
       ],
       totalPagesNeeded: 5
     },
     conceptsToExplain: {
       sunsightsPurpose: 'AI-powered customer feedback analysis platform',
       sentiment: 'POSITIVE/NEGATIVE/MIXED/NEUTRAL classification with confidence score',
       emotion: 'Joy, Sadness, Anger, Fear, Surprise, Love, Neutral detection',
       score: 'Confidence percentage (0-100%) for sentiment analysis',
       priority: 'High/Medium/Low priority levels for response urgency',
       additionalConcepts: ['Response suggestions', 'Trend analysis', 'Batch processing']
     },
     implementationChallenges: {
       multiPageComplexity: 'Need consistent tutorial across 5 different pages',
       contentOrganization: 'Complex AI concepts need simple explanations',
       stateManagement: 'Tutorial state persistence across navigation',
       layoutIntegration: 'Bottom right positioning with responsive design',
       userExperience: 'Contextual content per page while maintaining consistency',
       performance: 'Tutorial component impact on page load times',
       accessibility: 'Keyboard navigation and screen reader support'
     },
     proposedSolution: {
       approach: 'Create reusable TutorialBubble component',
       placement: 'Add to Layout component for consistent positioning',
       content: 'Dynamic content based on current page context',
       state: 'LocalStorage for tutorial completion tracking',
       styling: 'Fixed bottom-right position with z-index layering'
     }
   });

   // COPYRIGHT AND FORGOT PASSWORD MODIFICATION ANALYSIS
   console.log('Copyright & Forgot Password Modification Analysis:', {
     userRequests: {
       request1: 'Change copyright from 2024 to 2025',
       request2: 'Remove "Forgot Password" functionality'
     },
     currentImplementation: {
       copyright: {
         currentText: '© 2024 all rights reserved',
         location: 'Copyright section at bottom of form',
         styling: 'text-xs text-text-muted hover:text-text transition-colors duration-200',
         complexity: 'Simple text replacement'
       },
       forgotPassword: {
         currentImplementation: 'Conditional rendering with {isLogin && (...)}',
         location: 'Between password field and submit button',
         styling: 'text-sm text-primary hover:text-primary/80 hover:underline transition-all duration-200',
         functionality: 'Button with no click handler - placeholder only'
       }
     },
     potentialIssues: {
       copyrightChange: {
         complexity: 'Low - simple text replacement',
         impact: 'Minimal - no layout or functionality changes',
         risk: 'None'
       },
       forgotPasswordRemoval: {
         complexity: 'Low - remove conditional JSX block',
         layoutImpact: 'May affect spacing between password field and submit button',
         functionalityImpact: 'None - button has no actual functionality',
         hoverEffectCleanup: 'Need to remove hover effect references from logs'
       }
     },
     analysisRequired: {
       currentSpacing: 'Measure spacing between password field and submit button',
       forgotPasswordUsage: 'Check if forgot password has any event handlers',
       layoutConsistency: 'Ensure form layout remains balanced after removal',
       hoverEffectReferences: 'Update hover effect logs to remove forgot password references'
     }
   });

  // HOVER EFFECTS ANALYSIS LOGS
  console.log('Auth Page Hover Effects Analysis:', {
    userRequest: 'Add hover effects on necessary elements for haptic feedback purposes',
    currentHoverEffectsAudit: {
      existingHoverEffects: {
        passwordToggle: 'hover:text-primary transition-colors duration-200',
        forgotPassword: 'hover:text-primary/80 transition-colors duration-200',
        submitButton: 'hover:bg-primary/90 transition-all duration-200',
        formToggle: 'hover:text-primary/80 transition-colors duration-200',
        carouselDots: 'Basic hover effect in CSS'
      },
      missingHoverEffects: {
        inputFields: 'No hover states - only focus states',
        logoElements: 'No hover feedback on logo/brand name',
        cardContainer: 'No hover depth enhancement',
        carouselImages: 'No hover effects on images',
        formLabels: 'No hover states on labels',
        copyrightText: 'No hover effects on footer text'
      }
    },
    hapticFeedbackRequirements: {
      visual: 'Color changes, shadows, transforms',
      interactive: 'Scale, translate, glow effects',
      responsive: 'Smooth transitions and animations',
      accessibility: 'Clear focus and hover states'
    },
    elementsNeedingHoverEffects: {
      highPriority: [
        'Input fields - hover border/background changes',
        'Main card - hover depth enhancement',
        'Logo elements - hover glow/scale effects',
        'Carousel images - hover scale/shadow effects'
      ],
      mediumPriority: [
        'Carousel dots - enhanced hover effects',
        'Form labels - hover color changes',
        'Copyright text - subtle hover effects'
      ],
      lowPriority: [
        'Background elements - subtle hover responses',
        'Text elements - hover color transitions'
      ]
    },
    implementationPlan: {
      step1: 'Add input field hover states',
      step2: 'Enhance card hover depth',
      step3: 'Add logo hover effects',
      step4: 'Implement carousel hover effects',
      step5: 'Add subtle hover effects to secondary elements'
    }
  });

  return (
    <div className="page-background min-h-screen bg-gradient-to-br from-bg-light to-bg flex items-center justify-center p-4">
      {/* Single Card Container - matches reference image */}
      <div className="main-card-container w-full max-w-6xl bg-bg-light rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left Side - Illustration Section */}
          <div className="lg:w-3/5 bg-bg-light p-8 lg:p-12 flex flex-col justify-start items-start relative">
            {/* Logo and Title - Top Left Aligned */}
            <div className="mb-8 w-full">
              <div className="logo-container flex items-center mb-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
                <img 
                  src="/sunsightsLogo.png" 
                  alt="Sunsights" 
                  className="h-16 w-auto mr-4 hover:drop-shadow-lg transition-all duration-300" 
                />
                <h1 
                  className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hover:drop-shadow-sm transition-all duration-300"
                  style={{ fontSize: '2rem' }}
                >
                  Sunsights
                </h1>
              </div>
              
              {/* Carousel Text Content - Left Aligned */}
              <div className="relative h-32 mb-8">
                {carouselContent.map((content, index) => (
                  <div 
                    key={index} 
                    className="carousel-text absolute top-0 left-0 w-full" 
                    data-index={index}
                  >
                    <h2 className="text-base font-bold text-text mb-2 text-left">
                      {content.title.includes('Performance') ? (
                        <>
                          Unlock Your Team <span className="text-primary">Performance</span>
                        </>
                      ) : (
                        content.title
                      )}
                    </h2>
                    <p className="description-text text-lg text-text-muted max-w-md text-left">
                      {content.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Images - Centered */}
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="w-full max-w-lg">
                <div className="carousel-container h-80 relative">
                  {carouselContent.map((content, index) => (
                    <img
                      key={index}
                      src={content.image}
                      alt={`${content.title} Illustration`}
                      className="carousel-image w-full h-full object-contain hover:scale-110 hover:drop-shadow-lg transition-all duration-300 cursor-pointer"
                      data-index={index}
                    />
                  ))}
                </div>
                
                {/* Carousel Dots */}
                <div className="mt-6 flex justify-center space-x-3">
                  {carouselContent.map((_, index) => (
                    <div
                      key={index}
                      className="carousel-dot h-3 w-3 rounded-full bg-primary/60 hover:bg-primary hover:scale-125 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      data-index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-bg-light">
            <div className="w-full max-w-md mx-auto">
              
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-base font-bold text-text mb-2">
                  {isLogin ? 'Welcome to Sunsights' : 'Create Account'}
                </h3>
                <p className="text-text-muted">
                  {isLogin ? 'Unlock Your Team Performance' : 'Join us and start analyzing emotions'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Field - Only for Registration */}
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      className="w-full px-4 py-3 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleInputFocus('name')}
                      onBlur={() => handleInputBlur('name')}
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('email')}
                    onBlur={() => handleInputBlur('email')}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3 pr-12 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleInputFocus('password')}
                      onBlur={() => handleInputBlur('password')}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary hover:scale-110 transition-all duration-200"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link - Only shown during login */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bg mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isLogin ? 'Login' : 'Register'
                  )}
                </button>

                {/* Form Toggle */}
                <div className="text-center">
                  <p className="text-sm text-text-muted">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        handleFormToggle(!isLogin);
                        setIsLogin(!isLogin);
                        setFormData({ email: '', password: '', name: '' });
                      }}
                      className="text-primary hover:text-primary/80 hover:underline font-medium transition-all duration-200"
                    >
                      {isLogin ? 'Register' : 'Login'}
                    </button>
                  </p>
                </div>
              </form>

              {/* Copyright */}
              <div className="mt-8 text-center">
                <p className="text-xs text-text-muted hover:text-text transition-colors duration-200">
                  © 2025 all rights reserved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-bg-light rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-text mb-2">
                {forgotPasswordSent ? 'Check Your Email' : 'Reset Password'}
              </h3>
              <p className="text-text-muted">
                {forgotPasswordSent 
                  ? 'We sent password reset instructions to your email address.'
                  : 'Enter your email address and we\'ll send you password reset instructions.'
                }
              </p>
            </div>

            {!forgotPasswordSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-text mb-2">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-border-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary hover:bg-bg-light hover:shadow-md transition-all duration-200 text-text placeholder-text-muted bg-bg"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={resetForgotPasswordState}
                    className="flex-1 py-3 px-4 border border-border-muted text-text hover:bg-bg hover:scale-105 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 py-3 px-4 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bg mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Email'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    If an account exists with this email, you will receive password reset instructions within a few minutes.
                  </p>
                  <p className="text-xs text-text-muted">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordSent(false);
                      setForgotPasswordEmail('');
                    }}
                    className="flex-1 py-3 px-4 border border-border-muted text-text hover:bg-bg hover:scale-105 rounded-lg transition-all duration-200"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={resetForgotPasswordState}
                    className="flex-1 py-3 px-4 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 hover:scale-105 hover:shadow-lg transition-all duration-200"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
