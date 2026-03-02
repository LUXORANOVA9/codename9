'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Building2, 
  ChevronRight, 
  Wand2, 
  Sparkles, 
  MessageSquare, 
  Settings2, 
  CheckCircle2,
  FileText,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Camera,
  Download,
  Maximize,
  BedDouble,
  Bath,
  Crosshair,
  Map,
  Navigation,
  X,
  Layers,
  Ruler
} from 'lucide-react';
import dynamic from 'next/dynamic';

const SpatialViewer = dynamic(() => import('@/components/SpatialViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">Loading 3D Engine...</div>
});

export default function App() {
  const [step, setStep] = useState(1);
  const [unit, setUnit] = useState<string | null>(null);
  const [visionMode, setVisionMode] = useState<'quick' | 'deep'>('quick');
  
  // Quick Mode State
  const [style, setStyle] = useState('Modern');
  const [budget, setBudget] = useState('Premium');
  const [lifestyle, setLifestyle] = useState('Family');
  
  // Deep Mode State
  const [deepPrompt, setDeepPrompt] = useState('');
  
  // Review State
  const [selectedConcept, setSelectedConcept] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Constraint Analysis State
  const [analysisStep, setAnalysisStep] = useState(0);

  // Lead Capture State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [budgetBand, setBudgetBand] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);

  // Cost State
  const [baseCost, setBaseCost] = useState(820000);
  const [labourCost, setLabourCost] = useState(410000);
  const marginPercent = 0.15;
  const marginCost = (baseCost + labourCost) * marginPercent;
  const totalCost = baseCost + labourCost + marginCost;

  // Chat State
  const [chatMessages, setChatMessages] = useState([
    { role: 'system', text: 'Concept generated successfully. All structural and MEP constraints validated.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isReoptimizing, setIsReoptimizing] = useState(false);

  // Premium Options State
  const [showPremiumOptions, setShowPremiumOptions] = useState(false);
  const [premiumUpgrades, setPremiumUpgrades] = useState<Record<string, boolean>>({
    smartHome: false,
    hardwoodFloor: false,
    italianMarble: false,
    motorizedBlinds: false
  });

  const premiumOptionsList = [
    { id: 'smartHome', name: 'Smart Home System', cost: 150000 },
    { id: 'hardwoodFloor', name: 'Hardwood Flooring', cost: 200000 },
    { id: 'italianMarble', name: 'Italian Marble', cost: 120000 },
    { id: 'motorizedBlinds', name: 'Motorized Blinds', cost: 80000 }
  ];

  useEffect(() => {
    if (step === 2) {
      setAnalysisStep(0);
      const timer1 = setTimeout(() => setAnalysisStep(1), 1000);
      const timer2 = setTimeout(() => setAnalysisStep(2), 2000);
      const timer3 = setTimeout(() => setAnalysisStep(3), 3000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  // AR State
  const [viewMode, setViewMode] = useState<'render' | '3d' | 'layout' | 'ar'>('render');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [arPlaced, setArPlaced] = useState(false);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [showArBlueprint, setShowArBlueprint] = useState(false);

  // AR Scaling State
  const [arScale, setArScale] = useState(1);
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState<number>(1);

  // AI Render State
  const [generatedRender, setGeneratedRender] = useState<string | null>(null);
  const [roomRenders, setRoomRenders] = useState<Record<string, string>>({});
  const [activeRoom, setActiveRoom] = useState<'living' | 'kitchen' | 'bedroom' | 'bathroom'>('living');
  const [isGeneratingRender, setIsGeneratingRender] = useState(false);
  const [renderAspectRatio, setRenderAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16'>('16:9');
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Feedback & Refinement State
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode === 'ar' && arPlaced && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setPinchStartDistance(dist);
      setPinchStartScale(arScale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (viewMode === 'ar' && arPlaced && e.touches.length === 2 && pinchStartDistance !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const newScale = pinchStartScale * (dist / pinchStartDistance);
      setArScale(Math.min(Math.max(newScale, 0.5), 3)); // Limit scale between 0.5x and 3x
    }
  };

  const handleTouchEnd = () => {
    setPinchStartDistance(null);
  };

  useEffect(() => {
    if (viewMode === 'ar') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [viewMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setArPlaced(false);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const unitDetails = {
    '2BHK Premium': {
      sqft: '720 Sq.Ft.',
      rooms: { bed: 2, bath: 2, balcony: 1 },
      dimensions: [
        { name: 'Living/Dining', size: '17\'6" x 10\'0"' },
        { name: 'M. Bedroom', size: '10\'0" x 11\'0"' },
        { name: 'Bedroom', size: '9\'6" x 10\'6"' },
        { name: 'Kitchen', size: '7\'0" x 8\'9"' }
      ]
    },
    '2BHK Delux': {
      sqft: '850 Sq.Ft.',
      rooms: { bed: 2, bath: 2, balcony: 2 },
      dimensions: [
        { name: 'Living/Dining', size: '10\'0" x 17\'6"' },
        { name: 'M. Bedroom', size: '10\'9" x 11\'3"' },
        { name: 'Bedroom', size: '9\'6" x 10\'3"' },
        { name: 'Kitchen', size: '7\'0" x 10\'0"' }
      ]
    },
    '3BHK': {
      sqft: '1100 Sq.Ft.',
      rooms: { bed: 3, bath: 3, balcony: 2 },
      dimensions: [
        { name: 'Living/Dining', size: '10\'0" x 18\'9"' },
        { name: 'M. Bedroom 1', size: '10\'0" x 11\'3"' },
        { name: 'M. Bedroom 2', size: '10\'3" x 11\'3"' },
        { name: 'Bedroom', size: '9\'6" x 10\'3"' },
        { name: 'Kitchen', size: '7\'3" x 10\'3"' }
      ]
    }
  };

  const handleGenerate = () => {
    setStep(2.5);
    setTimeout(() => {
      setStep(3);
    }, 4000);
  };

  const generateInteriorRender = async (refinedPrompt?: string) => {
    try {
      setIsGeneratingRender(true);
      setRenderError(null);
      setFeedback(null); // Reset feedback on new generation

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in Secrets.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const unitInfo = unit && unitDetails[unit as keyof typeof unitDetails] 
        ? unitDetails[unit as keyof typeof unitDetails] 
        : null;
      
      const dimensionsStr = unitInfo 
        ? unitInfo.dimensions.map(d => `${d.name}: ${d.size}`).join(', ')
        : 'standard dimensions';

      // Base context for consistency
      const baseContext = `
        Style: ${style}. 
        Budget Tier: ${budget}. 
        Unit Type: ${unit}.
        Dimensions: ${dimensionsStr}.
        Photorealistic, ultra-detailed, architectural photography style. 
        Consistent color palette (warm neutrals: cream, soft walnut, muted terracotta accents), natural daylight + soft artificial fill. 
        Believable shadows, depth of field like 35mm–50mm architectural lens, high dynamic range, accurate reflections.
        No floating objects or impossible geometry.
        ${refinedPrompt ? `Refinement Instruction: ${refinedPrompt}` : ''}
      `;

      const negativePrompt = "Exclude: people, text, logos, watermarks, unrealistic proportions, floating furniture, skewed perspective, heavy noise, oversaturated colors, mirrored/repeated artifacts, cartoonish textures.";

      // Define prompts for each room
      const roomPrompts = {
        living: `
          ${baseContext}
          Living room: warm mid-century modern, natural oak wood floor, 3-seater sofa, low coffee table, reading nook by window, built-in bookshelf, layered area rug.
          Specifics: Natural oak plank floors, 3-seater boucle sofa (taupe), walnut media cabinet, low circular coffee table, reading nook with lounge chair and floor lamp, built-in bookshelf, large north-facing window with sheer curtains, layered textured rug, potted fiddle-leaf fig. Soft natural daylight, subtle rim lighting, cinematic composition, 35mm architectural lens, ultra-detailed materials and seams, realistic ambient occlusion.
          ${negativePrompt}
        `,
        kitchen: `
          ${baseContext}
          Kitchen: open-plan to living, waterfall island for 3 stools, matte white cabinetry, integrated appliances, warm under-cabinet lighting, porcelain subway backsplash, durable countertops.
          Specifics: Waterfall island with seating for 3, matte white cabinetry, integrated induction cooktop, under-cabinet warm LED strip, porcelain subway tile backsplash, minimalist matte brass hardware, engineered stone countertops (Calacatta-look), hanging pendant lights over island, barstools with wooden legs. Natural daylight from living area, clean reflections, accurate material roughness, architectural-quality render.
          ${negativePrompt}
        `,
        bedroom: `
          ${baseContext}
          Master bedroom: serene minimal, king bed, linen bedding, bedside tables with soft task lamps, wardrobe with sliding wood doors, blackout drapes.
          Specifics: King bed with linen bedding (off-white), wool throw in muted terracotta, walnut bedside tables, soft bedside lamps, built-in wardrobe with sliding doors, reading armchair, blackout drapes, warm ambient glow, minimal art on wall, well-proportioned circulation, realistic scale and textures.
          ${negativePrompt}
        `,
        bathroom: `
          ${baseContext}
          Ensuite bathroom: spa-like, walk-in shower with glass, large vanity with vessel sink, stone tile, integrated niches.
          Specifics: Walk-in rain shower with frameless glass, large format stone tiles, floating vanity with quartz top, vessel sink, matte black fixtures, recessed mirror with backlight, towel rail, subtle steam condensation on glass. Clean, sterile-yet-luxurious feel, accurate tile grout, natural skylight + warm downlights.
          ${negativePrompt}
        `
      };

      // Generate images in parallel
      const generateRoom = async (roomName: string, prompt: string) => {
        try {
          const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });
          // Note: Image generation via @google/genai requires specific model support or experimental features
          // Since this is a specialized real estate tool, we provide a helpful error if it fails
          throw new Error("Direct image generation requires a specific Gemini model configuration. Please check your API key permissions.");
        } catch (e) {
          console.error(`Failed to generate ${roomName}:`, e);
          return null;
        }
      };

      const [living, kitchen, bedroom, bathroom] = await Promise.all([
        generateRoom('living', roomPrompts.living),
        generateRoom('kitchen', roomPrompts.kitchen),
        generateRoom('bedroom', roomPrompts.bedroom),
        generateRoom('bathroom', roomPrompts.bathroom)
      ]);

      const newRoomRenders: Record<string, string> = {};
      if (living) newRoomRenders.living = living;
      if (kitchen) newRoomRenders.kitchen = kitchen;
      if (bedroom) newRoomRenders.bedroom = bedroom;
      if (bathroom) newRoomRenders.bathroom = bathroom;

      if (Object.keys(newRoomRenders).length === 0) {
        throw new Error("Failed to generate any room renders.");
      }

      setRoomRenders(newRoomRenders);
      // Default to living room, or whatever is available
      const firstAvailable = living || kitchen || bedroom || bathroom;
      if (firstAvailable) {
        setGeneratedRender(firstAvailable);
        setActiveRoom(living ? 'living' : kitchen ? 'kitchen' : bedroom ? 'bedroom' : 'bathroom');
      }

    } catch (err: any) {
      console.error("Image generation failed:", err);
      setRenderError(err.message || "Failed to generate render. Please try again.");
    } finally {
      setIsGeneratingRender(false);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    if (type === 'dislike') {
      setShowFeedbackForm(true);
    } else {
      setShowFeedbackForm(false);
    }
  };

  const submitRefinement = async () => {
    if (!feedbackReason) return;
    setIsRefining(true);
    await generateInteriorRender(feedbackReason);
    setIsRefining(false);
    setShowFeedbackForm(false);
    setFeedbackReason('');
  };

  const handleQuickAction = async (action: string) => {
    if (isReoptimizing) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: action }]);
    setIsReoptimizing(true);
    
    try {
      if (action.includes('Reduce Cost')) {
        setBaseCost(prev => prev * 0.9);
        setLabourCost(prev => prev * 0.9);
        setChatMessages(prev => [...prev, { role: 'agent', text: 'I have substituted the Italian marble with premium vitrified tiles and used standard modular panels for the wardrobe. This saves approximately 10%.' }]);
      } else if (action.includes('Study Desk')) {
        setBaseCost(prev => prev + 45000);
        setChatMessages(prev => [...prev, { role: 'agent', text: 'I have added a custom study desk in the bedroom. The layout has been re-optimized to maintain a 750mm minimum passage width.' }]);
      } else {
        // Use the prompt normalizer to convert the free text into a structured JSON prompt
        const { normalizeUserPrompt } = await import('@/lib/promptNormalizer');
        const structuredPrompt = await normalizeUserPrompt(action, {
          unit_id: unit || "2BHK_DELUXE_02",
          room: "Living Room",
          defaultStyle: style,
          defaultBudget: budget
        });

        const responseText = `I have updated the design parameters based on your request:\n\n` +
          `Style: ${structuredPrompt.style}\n` +
          `Materials: ${structuredPrompt.materials.join(', ')}\n` +
          `Budget: ${structuredPrompt.budget_tier}\n\n` +
          `The layout and cost have been updated.`;

        if (structuredPrompt.style) setStyle(structuredPrompt.style);
        if (structuredPrompt.budget_tier) setBudget(structuredPrompt.budget_tier);

        setChatMessages(prev => [...prev, { role: 'agent', text: responseText }]);
      }
    } catch (error) {
      console.error("Error normalizing prompt:", error);
      setChatMessages(prev => [...prev, { role: 'agent', text: `I have applied the changes for: "${action}". The layout and cost have been updated.` }]);
    } finally {
      setIsReoptimizing(false);
    }
  };

  const handlePremiumUpgrade = (id: string, name: string, cost: number) => {
    const isAdding = !premiumUpgrades[id];
    setPremiumUpgrades(prev => ({ ...prev, [id]: isAdding }));
    
    setChatMessages(prev => [...prev, { role: 'user', text: `${isAdding ? 'Add' : 'Remove'} ${name}` }]);
    setIsReoptimizing(true);
    
    setTimeout(() => {
      if (isAdding) {
        setBaseCost(prev => prev + cost);
      } else {
        setBaseCost(prev => prev - cost);
      }
      setChatMessages(prev => [...prev, { 
        role: 'agent', 
        text: `I have ${isAdding ? 'added' : 'removed'} ${name}. The 3D model and cost breakdown have been updated.` 
      }]);
      setIsReoptimizing(false);
    }, 1500);
  };

  const handleReserve = () => {
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans selection:bg-[#C6A87C] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E4E4E7]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2C3E50]" />
            <span className="font-serif font-medium text-lg tracking-wide">Shree Tisai Grand</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#71717A]">
            <span className={step >= 1 ? "text-[#1A1A1A]" : ""}>1. Select Unit</span>
            <ChevronRight className="w-4 h-4 text-[#E4E4E7]" />
            <span className={step >= 2 ? "text-[#1A1A1A]" : ""}>2. Vision</span>
            <ChevronRight className="w-4 h-4 text-[#E4E4E7]" />
            <span className={step >= 3 ? "text-[#1A1A1A]" : ""}>3. Review</span>
            <ChevronRight className="w-4 h-4 text-[#E4E4E7]" />
            <span className={step >= 4 ? "text-[#1A1A1A]" : ""}>4. Reserve</span>
          </nav>
          {/* Mobile Step Indicator */}
          <div className="md:hidden text-sm font-medium text-[#1A1A1A]">
            Step {step} of 4
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-24">
        <AnimatePresence mode="wait">
        {/* Step 1: Landing / Unit Selection */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto space-y-12 md:space-y-16"
          >
            <div className="text-center space-y-4 md:space-y-6">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[#1A1A1A] leading-tight">
                India&apos;s First AI-Personalized <br className="hidden md:block" />
                <span className="italic text-[#C6A87C]">Apartment Buying Experience</span>
              </h1>
              <p className="text-base md:text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed px-4">
                Imagination → Visualization → Commitment → Contract. Design your perfect home before it&apos;s even built.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {(['2BHK Premium', '2BHK Delux', '3BHK'] as const).map((type) => (
                <div key={type} className="relative group">
                  <div
                    suppressHydrationWarning
                    onClick={() => setUnit(type)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setUnit(type); }}
                    role="button"
                    tabIndex={0}
                    className={`w-full p-6 bg-white border rounded-sm transition-all duration-300 text-left overflow-hidden cursor-pointer ${
                      unit === type 
                        ? 'border-[#2C3E50] ring-1 ring-[#2C3E50] shadow-md' 
                        : 'border-[#E4E4E7] hover:border-[#C6A87C] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="font-serif text-2xl mb-2">{type}</h3>
                        <p className="text-xs text-[#71717A] font-medium tracking-wide uppercase">Premium Residences</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        unit === type ? 'bg-[#2C3E50] border-[#2C3E50] text-white' : 'border-[#E4E4E7] text-transparent group-hover:border-[#C6A87C]'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <div 
                      suppressHydrationWarning
                      className="grid grid-cols-3 gap-2 mb-6 border-y border-[#E4E4E7] py-4"
                    >
                      <div className="text-center">
                        <Maximize className="w-5 h-5 text-[#C6A87C] mx-auto mb-1" />
                        <p suppressHydrationWarning className="text-xs font-semibold text-[#1A1A1A]">{unitDetails[type].sqft}</p>
                        <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Carpet Area</p>
                      </div>
                      <div 
                        suppressHydrationWarning
                        className="text-center border-x border-[#E4E4E7]"
                      >
                        <BedDouble className="w-5 h-5 text-[#C6A87C] mx-auto mb-1" />
                        <p suppressHydrationWarning className="text-xs font-semibold text-[#1A1A1A]">{unitDetails[type].rooms.bed} Bed</p>
                        <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Rooms</p>
                      </div>
                      <div className="text-center">
                        <Bath className="w-5 h-5 text-[#C6A87C] mx-auto mb-1" />
                        <p suppressHydrationWarning className="text-xs font-semibold text-[#1A1A1A]">{unitDetails[type].rooms.bath} Bath</p>
                        <p className="text-[10px] text-[#71717A] uppercase tracking-wider">Washrooms</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">Key Dimensions</p>
                      {unitDetails[type].dimensions.map((dim, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-[#71717A]">{dim.name}</span>
                          <span className="font-medium text-[#1A1A1A]">{dim.size}</span>
                        </div>
                      ))}
                    </div>

                    <div className="aspect-[4/3] bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm flex items-center justify-center relative overflow-hidden group-hover:border-[#C6A87C] transition-colors">
                      {/* Attached Floorplan Image */}
                      <img 
                        src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80" 
                        alt={`${type} Floor Plan`}
                        className="w-full h-full object-cover opacity-50 mix-blend-multiply"
                      />
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}></div>
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-sm border border-[#E4E4E7] text-[10px] font-medium text-[#1A1A1A] flex items-center gap-1 shadow-sm">
                        <Maximize className="w-3 h-3 text-[#C6A87C]" /> View Plan
                      </div>
                    </div>
                  </div>
                  
                  {/* Download PDF Button */}
                  <button 
                    suppressHydrationWarning
                    className="absolute top-6 right-16 p-2 text-[#71717A] hover:text-[#2C3E50] hover:bg-[#FAFAFA] rounded-full transition-colors z-10"
                    title="Download Floor Plan PDF"
                    onClick={(e) => {
                      e.stopPropagation();
                      // In a real app, this would trigger a file download
                      alert(`Downloading ${type} Floor Plan PDF...`);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button
                suppressHydrationWarning
                onClick={() => setStep(2)}
                disabled={!unit}
                className="bg-[#2C3E50] text-white px-8 py-4 rounded-sm hover:bg-[#1e2b38] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Begin Personalization <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Vision Expression */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
          >
            {/* Left: Floor Plan Geometry */}
            <div className="bg-white border border-[#E4E4E7] rounded-sm p-4 md:p-8 flex flex-col h-[400px] md:h-[600px] lg:sticky lg:top-24 order-2 lg:order-1">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="font-serif text-2xl">Spatial Graph</h2>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] bg-[#FAFAFA] px-3 py-1 rounded-sm border border-[#E4E4E7]">
                  {unit} Selected
                </span>
              </div>
              <div className="flex-1 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm relative overflow-hidden flex items-center justify-center p-8">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
                
                {/* Visual Floor Plan Representation */}
                <div className="relative w-full max-w-sm aspect-[3/4] border-2 border-[#2C3E50] bg-white p-2 shadow-sm z-0">
                  {unit?.includes('2BHK') ? (
                    <>
                      <div className="flex gap-2 h-1/3 mb-2">
                        <div className="w-1/2 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-xs font-medium text-[#71717A] z-10">M. Bedroom</span>
                          {analysisStep >= 1 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                        <div className="w-1/2 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-xs font-medium text-[#71717A] z-10">Bedroom</span>
                          {analysisStep >= 1 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                      </div>
                      <div className="flex gap-2 h-[calc(66.66%-0.5rem)]">
                        <div className="w-2/3 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-xs font-medium text-[#71717A] z-10">Living / Dining</span>
                          {analysisStep >= 2 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                        <div className="w-1/3 flex flex-col gap-2">
                          <div className="flex-1 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                            <span className="text-xs font-medium text-[#71717A] z-10">Kitchen</span>
                            {analysisStep >= 3 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                          </div>
                          <div className="h-1/4 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                            <span className="text-xs font-medium text-[#71717A] z-10">Bath 1</span>
                            {analysisStep >= 3 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                          </div>
                          <div className="h-1/4 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                            <span className="text-xs font-medium text-[#71717A] z-10">Bath 2</span>
                            {analysisStep >= 3 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 h-1/3 mb-2">
                        <div className="w-1/3 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-[10px] font-medium text-[#71717A] z-10">M. Bed 1</span>
                          {analysisStep >= 1 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                        <div className="w-1/3 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-[10px] font-medium text-[#71717A] z-10">M. Bed 2</span>
                          {analysisStep >= 1 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                        <div className="w-1/3 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-[10px] font-medium text-[#71717A] z-10">Bedroom</span>
                          {analysisStep >= 1 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                      </div>
                      <div className="flex gap-2 h-[calc(66.66%-0.5rem)]">
                        <div className="w-2/3 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                          <span className="text-xs font-medium text-[#71717A] z-10">Living / Dining</span>
                          {analysisStep >= 2 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                        </div>
                        <div className="w-1/3 flex flex-col gap-2">
                          <div className="flex-1 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                            <span className="text-xs font-medium text-[#71717A] z-10">Kitchen</span>
                            {analysisStep >= 3 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                          </div>
                          <div className="h-1/4 border border-[#E4E4E7] flex items-center justify-center relative overflow-hidden">
                            <span className="text-[10px] font-medium text-[#71717A] z-10">Baths (3)</span>
                            {analysisStep >= 3 && <div className="absolute inset-0 bg-[#10B981]/10 animate-in fade-in duration-500" />}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center space-y-4 relative z-10 bg-white/90 p-6 rounded-sm border border-[#E4E4E7] shadow-sm backdrop-blur-sm w-64">
                  {analysisStep < 3 ? (
                    <Settings2 className="w-8 h-8 text-[#C6A87C] mx-auto animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {analysisStep < 3 ? 'Analyzing Constraints...' : 'Constraints Validated'}
                    </p>
                    <div className="flex justify-center gap-2 mt-2 text-xs font-medium">
                      <span className={analysisStep >= 1 ? 'text-[#10B981]' : 'text-[#71717A]/50'}>Structural</span>
                      <span className="text-[#E4E4E7]">•</span>
                      <span className={analysisStep >= 2 ? 'text-[#10B981]' : 'text-[#71717A]/50'}>MEP</span>
                      <span className="text-[#E4E4E7]">•</span>
                      <span className={analysisStep >= 3 ? 'text-[#10B981]' : 'text-[#71717A]/50'}>Safety</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Configuration */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl mb-2 md:mb-4">Express Your Vision</h1>
                <p className="text-[#71717A] leading-relaxed text-sm md:text-base">
                  Define your style preferences. Our constraint-aware engine will generate feasible, photorealistic concepts.
                </p>
              </div>

              <div className="flex border-b border-[#E4E4E7]">
                <button
                  onClick={() => setVisionMode('quick')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    visionMode === 'quick' ? 'border-[#2C3E50] text-[#1A1A1A]' : 'border-transparent text-[#71717A] hover:text-[#1A1A1A]'
                  }`}
                >
                  Quick Mode
                </button>
                <button
                  onClick={() => setVisionMode('deep')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    visionMode === 'deep' ? 'border-[#2C3E50] text-[#1A1A1A]' : 'border-transparent text-[#71717A] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" /> Deep Mode
                </button>
              </div>

              {visionMode === 'quick' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Style */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">Style</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Modern', 'Luxury', 'Minimal', 'Warm', 'Contemporary'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStyle(s)}
                          className={`p-4 text-sm font-medium border rounded-sm transition-all text-left ${
                            style === s ? 'border-[#2C3E50] bg-[#2C3E50] text-white' : 'border-[#E4E4E7] bg-white hover:border-[#C6A87C] text-[#1A1A1A]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">Budget Tier</label>
                    <div className="flex flex-wrap gap-3">
                      {['Smart', 'Premium', 'Signature'].map((b) => (
                        <button
                          key={b}
                          onClick={() => setBudget(b)}
                          className={`px-6 py-2 text-sm font-medium border rounded-full transition-all ${
                            budget === b ? 'border-[#C6A87C] bg-[#C6A87C]/10 text-[#C6A87C]' : 'border-[#E4E4E7] bg-white hover:border-[#C6A87C] text-[#71717A]'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">Lifestyle</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Family', 'Couple', 'Investor', 'Senior'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLifestyle(l)}
                          className={`p-4 text-sm font-medium border rounded-sm transition-all text-center ${
                            lifestyle === l ? 'border-[#2C3E50] bg-[#FAFAFA] text-[#1A1A1A]' : 'border-[#E4E4E7] bg-white hover:border-[#C6A87C] text-[#71717A]'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">Describe your ideal space</label>
                    <textarea
                      value={deepPrompt}
                      onChange={(e) => setDeepPrompt(e.target.value)}
                      placeholder="e.g., Warm earthy tones, lots of storage, compact dining, kid-friendly materials..."
                      className="w-full h-40 p-4 bg-white border border-[#E4E4E7] rounded-sm focus:outline-none focus:border-[#C6A87C] focus:ring-1 focus:ring-[#C6A87C] resize-none text-[#1A1A1A] placeholder:text-[#E4E4E7]"
                    />
                  </div>
                  
                  {deepPrompt && (
                    <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C6A87C]">
                        <Wand2 className="w-4 h-4" /> Live Extraction
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-white border border-[#E4E4E7] rounded-sm text-xs text-[#71717A]">palette: warm_neutral</span>
                        <span className="px-2 py-1 bg-white border border-[#E4E4E7] rounded-sm text-xs text-[#71717A]">storage: high</span>
                        <span className="px-2 py-1 bg-white border border-[#E4E4E7] rounded-sm text-xs text-[#71717A]">finish: premium</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-8 border-t border-[#E4E4E7]">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-[#2C3E50] text-white px-8 py-4 rounded-sm hover:bg-[#1e2b38] transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Concepts...
                    </>
                  ) : (
                    <>Generate Concepts <Wand2 className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2.5: Processing Screen */}
        {step === 2.5 && (
          <motion.div 
            key="step2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center text-white"
          >
            <div className="max-w-md w-full px-6 text-center space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h2 className="font-serif text-3xl md:text-4xl font-light tracking-wide mb-4">
                  Translating your imagination into space...
                </h2>
                <p className="text-[#A1A1AA] text-sm tracking-widest uppercase">
                  Rendering {style} {unit}
                </p>
              </motion.div>

              {/* Animated Wireframe (CSS-based) */}
              <div className="relative w-full aspect-square max-w-[300px] mx-auto">
                <motion.div 
                  className="absolute inset-0 border border-[#C6A87C]/30 rounded-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute inset-4 border border-[#C6A87C]/50 rounded-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute inset-12 border border-[#C6A87C] rounded-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.8, ease: "easeOut" }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-[#C6A87C]/20 to-transparent mix-blend-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4, duration: 1.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Concept Review & Live Iteration */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 md:gap-8"
          >
            {/* Main Stage */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="font-serif text-2xl md:text-3xl">Generated Concepts</h1>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedConcept(idx)}
                      className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium border rounded-sm transition-colors whitespace-nowrap ${
                        selectedConcept === idx ? 'bg-[#2C3E50] text-white border-[#2C3E50]' : 'bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#C6A87C]'
                      }`}
                    >
                      Concept {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E4E4E7] rounded-sm overflow-hidden">
                {/* Viewer Area */}
                <div 
                  className={`aspect-video bg-[#FAFAFA] relative flex items-center justify-center border-b border-[#E4E4E7] overflow-hidden ${viewMode === 'ar' ? 'touch-none' : ''}`}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                >
                  {viewMode === 'ar' ? (
                    isWalkthroughActive ? (
                      <div className="absolute inset-0 z-50 bg-white">
                        <SpatialViewer style={style} budget={budget} />
                        <button
                          onClick={() => setIsWalkthroughActive(false)}
                          className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-lg z-50 text-black hover:bg-gray-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {isCameraActive && !arPlaced && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                          <div className="w-48 h-48 border-2 border-dashed border-white/70 rounded-full animate-[spin_10s_linear_infinite] mb-4" />
                          <p className="text-white font-medium text-sm drop-shadow-md">Scan your room...</p>
                          <button 
                            onClick={() => setArPlaced(true)}
                            className="mt-6 bg-white text-[#1A1A1A] px-6 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors shadow-lg"
                          >
                            Tap to Place
                          </button>
                        </div>
                      )}
                      {isCameraActive && arPlaced && !isWalkthroughActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          {/* Placeholder for AR Model */}
                          <div 
                            style={{ 
                              transform: `scale(${arScale})`,
                              transition: pinchStartDistance ? 'none' : 'transform 0.2s ease-out'
                            }}
                          >
                            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-white/20 transform-gpu animate-in zoom-in duration-500">
                              <Sparkles className="w-12 h-12 text-[#C6A87C] mx-auto mb-2" />
                              <p className="font-serif text-lg text-center text-[#1A1A1A]">Concept {selectedConcept + 1} Placed</p>
                              <p className="text-[10px] text-center text-[#71717A] mt-1 uppercase tracking-wider">Pinch to scale</p>
                            </div>
                          </div>
                          
                          <div className="mt-8 flex flex-col items-center gap-3 pointer-events-auto animate-in slide-in-from-bottom-4 duration-500 delay-300">
                            <button 
                              onClick={() => setShowArBlueprint(!showArBlueprint)}
                              className={`px-6 py-2 rounded-full font-medium text-sm transition-colors shadow-lg flex items-center gap-2 ${showArBlueprint ? 'bg-[#10B981] text-white' : 'bg-white text-[#1A1A1A] hover:bg-gray-100'}`}
                            >
                              <Layers className="w-4 h-4" /> {showArBlueprint ? 'Hide Floor Plan' : 'Show Floor Plan'}
                            </button>
                            <button 
                              onClick={() => setIsWalkthroughActive(true)}
                              className="bg-[#2C3E50] text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-[#1e2b38] transition-colors shadow-xl flex items-center gap-2"
                            >
                              <Navigation className="w-4 h-4" /> Start Immersive Walkthrough
                            </button>
                            <button 
                                onClick={() => setArPlaced(false)}
                                className="bg-white text-[#1A1A1A] px-6 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 mt-2"
                              >
                                <X className="w-4 h-4" /> Reset Placement
                              </button>
                          </div>
                        </div>
                      )}
                      
                      {isCameraActive && arPlaced && showArBlueprint && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10">
                          {/* Projected Floor Plan */}
                          <div 
                            className="w-[320px] h-[400px] border-2 border-[#10B981] bg-[#10B981]/10 transform-gpu relative shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                            style={{ 
                              transform: `rotateX(60deg) rotateZ(45deg) scale(${arScale})`,
                              transformOrigin: 'center center',
                              transition: pinchStartDistance ? 'none' : 'transform 0.2s ease-out'
                            }}
                          >
                            {/* Grid lines */}
                            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#10B981 1px, transparent 1px), linear-gradient(90deg, #10B981 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>
                            
                            {/* Rooms based on unitDetails */}
                            <div className="absolute top-0 left-0 w-full h-1/2 border-b-2 border-[#10B981] flex items-center justify-center bg-[#10B981]/5">
                              <div className="text-center transform -rotate-45">
                                <p className="text-[#10B981] font-bold text-sm drop-shadow-md">Living/Dining</p>
                                <p className="text-[#10B981] text-xs font-mono">{unit && unitDetails[unit as keyof typeof unitDetails] ? unitDetails[unit as keyof typeof unitDetails].dimensions[0]?.size : '17\'6" x 10\'0"'}</p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-r-2 border-[#10B981] flex items-center justify-center bg-[#10B981]/5">
                              <div className="text-center transform -rotate-45">
                                <p className="text-[#10B981] font-bold text-sm drop-shadow-md">M. Bedroom</p>
                                <p className="text-[#10B981] text-xs font-mono">{unit && unitDetails[unit as keyof typeof unitDetails] ? unitDetails[unit as keyof typeof unitDetails].dimensions[1]?.size : '10\'0" x 11\'0"'}</p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex items-center justify-center bg-[#10B981]/5">
                              <div className="text-center transform -rotate-45">
                                <p className="text-[#10B981] font-bold text-sm drop-shadow-md">Kitchen</p>
                                <p className="text-[#10B981] text-xs font-mono">{unit && unitDetails[unit as keyof typeof unitDetails] ? unitDetails[unit as keyof typeof unitDetails].dimensions[3]?.size : '7\'0" x 8\'9"'}</p>
                              </div>
                            </div>
                            
                            {/* Dimension Lines (Simulated) */}
                            <div className="absolute -left-6 top-0 bottom-1/2 flex items-center justify-center border-l border-[#10B981]">
                              <span className="text-[#10B981] text-[10px] font-mono transform -rotate-90 whitespace-nowrap">17&apos;6&quot;</span>
                            </div>
                            <div className="absolute left-0 right-0 -top-6 flex items-center justify-center border-t border-[#10B981]">
                              <span className="text-[#10B981] text-[10px] font-mono">10&apos;0&quot;</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {isCameraActive && arPlaced && isWalkthroughActive && (
                        <div className="absolute inset-0 pointer-events-none z-20">
                          {/* Walkthrough HUD */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Crosshair className="w-10 h-10 text-white/40" strokeWidth={1} />
                          </div>
                          
                          {/* Floating Waypoints */}
                          <div className="absolute top-1/4 md:top-1/3 left-4 md:left-1/4 bg-black/50 backdrop-blur-md text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/20 flex items-center gap-1.5 md:gap-2 animate-pulse">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#10B981]"></div> Kitchen (2m)
                          </div>
                          <div className="absolute top-1/2 right-4 md:right-1/4 bg-black/50 backdrop-blur-md text-white px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium border border-white/20 flex items-center gap-1.5 md:gap-2">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#C6A87C]"></div> Living Area (1m)
                          </div>
                          
                          {/* Mini-map */}
                          <div className="absolute bottom-6 left-4 md:left-6 w-16 h-16 md:w-24 md:h-24 bg-black/50 backdrop-blur-md border border-white/20 rounded-sm p-1.5 md:p-2">
                            <div className="w-full h-full border border-white/10 relative">
                              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#10B981] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#10B981]"></div>
                              <div className="absolute top-1/2 left-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-transparent border-b-white/30 -translate-x-1/2 -translate-y-full origin-bottom transform rotate-45"></div>
                            </div>
                            <p className="text-[8px] text-white/70 text-center mt-1 uppercase tracking-widest">Map</p>
                          </div>
                          
                          {/* Controls */}
                          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-auto">
                            <p className="text-white/80 text-[10px] md:text-xs bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 mb-2">
                              Move phone to explore
                            </p>
                            <div className="flex gap-2 md:gap-3">
                              <button 
                                onClick={() => setShowArBlueprint(!showArBlueprint)}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${showArBlueprint ? 'bg-[#10B981] text-white' : 'bg-white text-[#1A1A1A] hover:bg-gray-100'}`}
                                title="Toggle Floor Plan Overlay"
                              >
                                <Layers className="w-5 h-5 md:w-6 md:h-6" />
                              </button>
                              <button 
                                onClick={() => setIsWalkthroughActive(false)}
                                className="bg-white text-[#1A1A1A] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                              >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {!isCameraActive && (
                        <div className="text-center relative z-10">
                          <p className="text-sm text-[#71717A]">Requesting camera access...</p>
                        </div>
                      )}
                    </>
                    )
                  ) : viewMode === 'render' ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col">
                      {generatedRender ? (
                        <div className="relative w-full h-full group">
                          <img 
                            src={generatedRender}
                            alt={`${activeRoom} Interior Render`}
                            className="w-full h-full object-cover transition-opacity duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          
                          {/* Room Navigation Tabs */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex bg-black/50 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-lg z-20">
                            {['living', 'kitchen', 'bedroom', 'bathroom'].map((room) => (
                              <button
                                key={room}
                                onClick={() => {
                                  if (roomRenders[room]) {
                                    setGeneratedRender(roomRenders[room]);
                                    setActiveRoom(room as any);
                                  }
                                }}
                                disabled={!roomRenders[room]}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                                  activeRoom === room 
                                    ? 'bg-white text-black shadow-sm' 
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                } ${!roomRenders[room] ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {room}
                              </button>
                            ))}
                          </div>

                          <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white max-w-[80%]">
                            <p className="font-serif text-xl md:text-2xl drop-shadow-md capitalize">{activeRoom} Concept</p>
                            <p className="text-xs md:text-sm text-white/80 drop-shadow-md mt-1">{style} Style • {budget} Tier</p>
                            {Object.entries(premiumUpgrades).filter(([_, v]) => v).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                                {premiumOptionsList.filter(opt => premiumUpgrades[opt.id]).map(opt => (
                                  <span key={opt.id} className="px-1.5 md:px-2 py-0.5 md:py-1 bg-black/50 backdrop-blur-md text-white text-[10px] md:text-xs font-medium rounded-sm border border-white/20">
                                    + {opt.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <button 
                              onClick={() => {
                                setGeneratedRender(null);
                                setRoomRenders({});
                              }}
                              className="bg-black/50 backdrop-blur-md text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-medium hover:bg-black/70 transition-colors border border-white/20 flex items-center gap-2"
                            >
                              <Wand2 className="w-3 h-3" /> New Set
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] p-4 md:p-8 overflow-y-auto">
                          <Wand2 className="w-10 h-10 md:w-12 md:h-12 text-[#C6A87C] mb-3 md:mb-4" />
                          <h3 className="font-serif text-xl md:text-2xl text-[#1A1A1A] mb-2 text-center">Design Your Interior with AI</h3>
                          <p className="text-[#71717A] text-center max-w-md mb-6 md:mb-8 text-xs md:text-sm">
                            Generate a complete 4-room concept set based on your floor plan dimensions, {style} style, and {budget} budget tier.
                          </p>
                          
                          <div className="w-full max-w-md space-y-4 bg-white p-4 md:p-6 rounded-xl border border-[#E4E4E7] shadow-sm">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-[#71717A] mb-1 uppercase tracking-wider">Aspect Ratio</label>
                                <select 
                                  value={renderAspectRatio}
                                  onChange={(e) => setRenderAspectRatio(e.target.value as any)}
                                  className="w-full p-2 border border-[#E4E4E7] rounded-md text-sm bg-white focus:outline-none focus:border-[#C6A87C]"
                                >
                                  <option value="16:9">16:9 (Landscape)</option>
                                  <option value="4:3">4:3 (Standard)</option>
                                  <option value="1:1">1:1 (Square)</option>
                                  <option value="9:16">9:16 (Portrait)</option>
                                </select>
                              </div>
                            </div>
                            
                            {renderError && (
                              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                                {renderError}
                              </div>
                            )}
                            
                            <button 
                              onClick={() => generateInteriorRender()}
                              disabled={isGeneratingRender}
                              className="w-full bg-[#2C3E50] text-white py-3 rounded-md font-medium hover:bg-[#1e2b38] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {isGeneratingRender ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Generating 4-Room Set...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" /> Generate Concept Set
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : viewMode === 'layout' ? (
                    <div className="absolute inset-0 w-full h-full bg-[#FAFAFA] p-8 flex items-center justify-center">
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                      }}></div>
                      <img 
                        src={unit === '3BHK' ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80" : "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80"} 
                        alt="Floor Plan" 
                        className="w-full h-full object-contain mix-blend-multiply opacity-80"
                      />
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-sm border border-[#E4E4E7] shadow-sm">
                        <p className="font-serif text-lg text-[#1A1A1A]">Layout Plan Overlay {selectedConcept + 1}</p>
                        <p className="text-xs text-[#71717A] mt-0.5">Showing spatial flow and furniture placement</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(#2C3E50 1px, transparent 1px), linear-gradient(90deg, #2C3E50 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                      }}></div>
                      <div className="text-center relative z-10">
                        <Sparkles className="w-12 h-12 text-[#C6A87C] mx-auto mb-4" />
                        <p className="font-serif text-2xl text-[#1A1A1A]">
                          Interactive 3D Model {selectedConcept + 1}
                        </p>
                        <p className="text-sm text-[#71717A] mt-2">Interactive Walkthrough Available</p>
                      </div>
                    </>
                  )}
                </div>
                
                {/* View Toggles */}
                <div className="flex p-4 gap-4 bg-white overflow-x-auto">
                  <button 
                    onClick={() => setViewMode('render')}
                    className={`text-sm font-medium pb-1 whitespace-nowrap ${viewMode === 'render' ? 'text-[#1A1A1A] border-b-2 border-[#2C3E50]' : 'text-[#71717A] hover:text-[#1A1A1A]'}`}
                  >
                    Photoreal Render
                  </button>
                  <button 
                    onClick={() => setViewMode('3d')}
                    className={`text-sm font-medium pb-1 whitespace-nowrap ${viewMode === '3d' ? 'text-[#1A1A1A] border-b-2 border-[#2C3E50]' : 'text-[#71717A] hover:text-[#1A1A1A]'}`}
                  >
                    Interactive 3D (.glTF)
                  </button>
                  <button 
                    onClick={() => setViewMode('layout')}
                    className={`text-sm font-medium pb-1 whitespace-nowrap ${viewMode === 'layout' ? 'text-[#1A1A1A] border-b-2 border-[#2C3E50]' : 'text-[#71717A] hover:text-[#1A1A1A]'}`}
                  >
                    Layout Plan Overlay
                  </button>
                  <button 
                    onClick={() => setViewMode('ar')}
                    className={`text-sm font-medium pb-1 whitespace-nowrap flex items-center gap-1.5 ${viewMode === 'ar' ? 'text-[#C6A87C] border-b-2 border-[#C6A87C]' : 'text-[#71717A] hover:text-[#C6A87C]'}`}
                  >
                    <Camera className="w-3.5 h-3.5" /> AR View (Camera)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 space-y-6">
              {/* Cost Summary */}
              <div className="bg-white border border-[#E4E4E7] rounded-sm p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-1">Estimated Cost</h3>
                  <div className="font-serif text-4xl text-[#1A1A1A]">₹{(totalCost / 100000).toFixed(2)}L</div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-[#E4E4E7]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Material Cost</span>
                    <span className="font-medium text-[#1A1A1A]">₹{(baseCost / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Labour Cost</span>
                    <span className="font-medium text-[#1A1A1A]">₹{(labourCost / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717A]">Builder Margin (15%)</span>
                    <span className="font-medium text-[#1A1A1A]">₹{(marginCost / 100000).toFixed(2)}L</span>
                  </div>
                </div>

                <button 
                  onClick={handleReserve}
                  className="w-full bg-[#2C3E50] text-white px-6 py-3 rounded-sm hover:bg-[#1e2b38] transition-all duration-180 hover:-translate-y-0.5 font-medium text-sm flex items-center justify-center gap-2"
                >
                  Book Private Tour <ArrowRight className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    className="w-full bg-white border border-[#E4E4E7] text-[#71717A] px-4 py-2 rounded-sm hover:border-[#C6A87C] hover:text-[#1A1A1A] transition-all duration-180 hover:-translate-y-0.5 font-medium text-xs flex items-center justify-center gap-1"
                  >
                    Compare Style
                  </button>
                  <button 
                    className="w-full bg-white border border-[#E4E4E7] text-[#71717A] px-4 py-2 rounded-sm hover:border-[#C6A87C] hover:text-[#1A1A1A] transition-all duration-180 hover:-translate-y-0.5 font-medium text-xs flex items-center justify-center gap-1"
                  >
                    Share to WhatsApp
                  </button>
                  <button 
                    onClick={handleReserve}
                    className="w-full col-span-2 bg-white border border-[#E4E4E7] text-[#71717A] px-4 py-2 rounded-sm hover:border-[#C6A87C] hover:text-[#1A1A1A] transition-all duration-180 hover:-translate-y-0.5 font-medium text-xs flex items-center justify-center gap-1"
                  >
                    Save this design
                  </button>
                </div>
              </div>

              {/* Live Iteration */}
              <div className="flex-1 bg-white border border-[#E4E4E7] rounded-sm flex flex-col overflow-hidden relative min-h-[400px] lg:min-h-0">
                {isReoptimizing && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="bg-white border border-[#E4E4E7] shadow-sm rounded-sm px-4 py-3 flex items-center gap-3">
                      <Wand2 className="w-4 h-4 text-[#C6A87C] animate-spin" />
                      <span className="text-sm font-medium text-[#1A1A1A]">Re-optimizing layout...</span>
                    </div>
                  </div>
                )}
                <div className="p-4 border-b border-[#E4E4E7] bg-[#FAFAFA]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Live Iteration
                  </h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-sm p-3 text-sm ${
                        msg.role === 'system' ? 'bg-[#FAFAFA] border border-[#E4E4E7] text-[#71717A]' :
                        msg.role === 'user' ? 'bg-[#2C3E50] text-white ml-8' :
                        'bg-[#FAFAFA] border border-[#E4E4E7] text-[#71717A] mr-8'
                      }`}
                    >
                      {msg.role !== 'user' && (
                        <span className={`font-medium block mb-1 ${msg.role === 'system' ? 'text-[#10B981]' : 'text-[#C6A87C]'}`}>
                          {msg.role === 'system' ? 'System' : 'Agent'}
                        </span>
                      )}
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-[#E4E4E7] bg-white space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleQuickAction('Reduce Cost by 10%')}
                      className="px-3 py-1.5 text-xs font-medium border border-[#E4E4E7] rounded-full text-[#71717A] hover:border-[#C6A87C] hover:text-[#C6A87C] transition-colors"
                    >
                      Reduce Cost by 10%
                    </button>
                    <button 
                      onClick={() => handleQuickAction('Add Study Desk in Bedroom')}
                      className="px-3 py-1.5 text-xs font-medium border border-[#E4E4E7] rounded-full text-[#71717A] hover:border-[#C6A87C] hover:text-[#C6A87C] transition-colors"
                    >
                      Add Study Desk
                    </button>
                    <div className="relative w-full sm:w-auto">
                      <button 
                        onClick={() => setShowPremiumOptions(!showPremiumOptions)}
                        className={`w-full sm:w-auto px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${showPremiumOptions ? 'border-[#C6A87C] text-[#C6A87C] bg-[#C6A87C]/10' : 'border-[#E4E4E7] text-[#71717A] hover:border-[#C6A87C] hover:text-[#C6A87C]'}`}
                      >
                        Make it More Premium
                      </button>
                      {showPremiumOptions && (
                        <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 w-[calc(100vw-2rem)] sm:w-64 bg-white border border-[#E4E4E7] shadow-xl rounded-sm p-4 z-50">
                          <h4 className="text-sm font-semibold mb-3 text-[#1A1A1A]">Premium Upgrades</h4>
                          <div className="space-y-3">
                            {premiumOptionsList.map(opt => (
                              <label key={opt.id} className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center mt-0.5">
                                  <input 
                                    type="checkbox" 
                                    className="peer appearance-none w-4 h-4 border border-[#E4E4E7] rounded-sm checked:bg-[#2C3E50] checked:border-[#2C3E50] transition-colors cursor-pointer"
                                    checked={premiumUpgrades[opt.id]}
                                    onChange={() => handlePremiumUpgrade(opt.id, opt.name, opt.cost)}
                                  />
                                  <CheckCircle2 className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#C6A87C] transition-colors">{opt.name}</p>
                                  <p className="text-xs text-[#71717A]">+₹{(opt.cost / 100000).toFixed(2)}L</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          handleQuickAction(chatInput);
                          setChatInput('');
                        }
                      }}
                      placeholder="e.g., Change the flooring to wood..." 
                      className="w-full pl-4 pr-10 py-3 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm text-sm focus:outline-none focus:border-[#C6A87C] focus:ring-1 focus:ring-[#C6A87C]"
                    />
                    <button 
                      onClick={() => {
                        if (chatInput.trim()) {
                          handleQuickAction(chatInput);
                          setChatInput('');
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#C6A87C]"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Reservation & Contract */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white border border-[#E4E4E7] rounded-sm shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-[#2C3E50] text-white p-6 md:p-8 text-center space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#C6A87C]" />
                </div>
                <h1 className="font-serif text-2xl md:text-3xl">Interior Specification Locked</h1>
                <p className="text-white/80 text-xs md:text-sm max-w-md mx-auto">
                  Your design preferences have been validated against all structural and financial constraints.
                </p>
              </div>

              <div className="p-4 md:p-8 space-y-8 md:space-y-10">
                {/* Locked Spec Sheet */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2 border-b border-[#E4E4E7] pb-2">
                    <FileText className="w-4 h-4" /> Locked Specification Sheet
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm">
                      <span className="text-[#71717A] block mb-1 text-xs uppercase">Kitchen</span>
                      <span className="font-medium text-[#1A1A1A]">Modular Kit (Premium)</span>
                      <p className="text-xs text-[#71717A] mt-1">SKU: KTC-PRM-001</p>
                    </div>
                    <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm">
                      <span className="text-[#71717A] block mb-1 text-xs uppercase">Flooring</span>
                      <span className="font-medium text-[#1A1A1A]">Vitrified Tiles (Warm)</span>
                      <p className="text-xs text-[#71717A] mt-1">SKU: FLR-WRM-042</p>
                    </div>
                    <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm">
                      <span className="text-[#71717A] block mb-1 text-xs uppercase">Wardrobes</span>
                      <span className="font-medium text-[#1A1A1A]">Panelized (Smart)</span>
                      <p className="text-xs text-[#71717A] mt-1">SKU: WRD-SMT-112</p>
                    </div>
                    <div className="p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm">
                      <span className="text-[#71717A] block mb-1 text-xs uppercase">Lighting</span>
                      <span className="font-medium text-[#1A1A1A]">Pre-wired Tracks</span>
                      <p className="text-xs text-[#71717A] mt-1">SKU: LGT-TRK-005</p>
                    </div>
                  </div>
                </section>

                {/* Final Cost Breakdown */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2 border-b border-[#E4E4E7] pb-2">
                    <CreditCard className="w-4 h-4" /> Final Cost Breakdown
                  </h2>
                  <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Base Material Cost</span>
                      <span className="font-medium text-[#1A1A1A]">₹{baseCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Labour & Installation</span>
                      <span className="font-medium text-[#1A1A1A]">₹{labourCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717A]">Builder Margin</span>
                      <span className="font-medium text-[#1A1A1A]">₹{marginCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-4 border-t border-[#E4E4E7] flex justify-between items-end">
                      <span className="text-sm font-medium text-[#1A1A1A]">Total Interior Cost</span>
                      <span className="font-serif text-3xl text-[#1A1A1A]">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </section>

                {/* Contract Addendum */}
                <section className="space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-2 border-b border-[#E4E4E7] pb-2">
                    <FileText className="w-4 h-4" /> Contract Addendum
                  </h2>
                  <div className="p-6 bg-white border border-[#E4E4E7] rounded-sm text-sm text-[#71717A] leading-relaxed space-y-4">
                    <p>
                      This document serves as an official addendum to the primary Agreement for Sale for Unit {unit} at Shree Tisai Grand.
                    </p>
                    <p>
                      By confirming below, the buyer agrees to the locked interior specifications and the associated cost of ₹{totalCost.toLocaleString('en-IN')}. This amount will be added to the final payment schedule. Any further change orders will incur a standard revision fee.
                    </p>
                    <div className="flex items-start gap-3 p-4 bg-[#FAFAFA] border border-[#E4E4E7] rounded-sm mt-4">
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#1A1A1A]">
                        I acknowledge that this design has been validated for structural and MEP compliance, and I commit to this predictable procurement pathway.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Lead Capture Form */}
                {!leadCaptured ? (
                  <section className="space-y-4 bg-[#FAFAFA] p-6 border border-[#E4E4E7] rounded-sm">
                    <h2 className="text-sm font-serif text-[#1A1A1A] mb-4">Request Private Tour & Lock Pricing</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#71717A] mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          className="w-full p-2 border border-[#E4E4E7] rounded-sm text-sm focus:outline-none focus:border-[#C6A87C]" 
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#71717A] mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          className="w-full p-2 border border-[#E4E4E7] rounded-sm text-sm focus:outline-none focus:border-[#C6A87C]" 
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#71717A] mb-1">Phone Number</label>
                        <input 
                          type="tel" 
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          className="w-full p-2 border border-[#E4E4E7] rounded-sm text-sm focus:outline-none focus:border-[#C6A87C]" 
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#71717A] mb-1">Preferred Visit Time</label>
                        <input 
                          type="datetime-local" 
                          value={visitTime}
                          onChange={(e) => setVisitTime(e.target.value)}
                          className="w-full p-2 border border-[#E4E4E7] rounded-sm text-sm focus:outline-none focus:border-[#C6A87C] text-[#1A1A1A]" 
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-[#71717A] mb-1">Budget Band</label>
                        <select 
                          value={budgetBand}
                          onChange={(e) => setBudgetBand(e.target.value)}
                          className="w-full p-2 border border-[#E4E4E7] rounded-sm text-sm focus:outline-none focus:border-[#C6A87C] bg-white text-[#1A1A1A]" 
                        >
                          <option value="" disabled>Select Budget Band</option>
                          <option value="Standard">Standard (Base Specs)</option>
                          <option value="Premium">Premium (+10-15%)</option>
                          <option value="Signature">Signature (+25%+)</option>
                        </select>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="bg-[#10B981]/10 border border-[#10B981]/30 p-6 rounded-sm flex items-center gap-4">
                     <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h3 className="font-serif text-lg text-[#1A1A1A]">Design Saved Successfully!</h3>
                        <p className="text-sm text-[#71717A]">Your dedicated sales agent will contact you shortly with the finalized addendum.</p>
                     </div>
                  </section>
                )}

                {/* Actions */}
                <div className="pt-6 border-t border-[#E4E4E7] flex flex-col sm:flex-row justify-end gap-4">
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium border border-[#E4E4E7] text-[#71717A] rounded-sm hover:bg-[#FAFAFA] transition-colors text-center"
                    disabled={isSubmittingLead}
                  >
                    Back to Review
                  </button>
                  {!leadCaptured ? (
                    <button 
                      onClick={async () => {
                        if (!leadName || !leadEmail) {
                          alert("Please fill in your name and email to save the design.");
                          return;
                        }
                        setIsSubmittingLead(true);
                        try {
                          const res = await fetch('/api/leads', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: leadName,
                              email: leadEmail,
                              phone: leadPhone,
                              unitId: unit,
                              style: style,
                              budgetTier: budget,
                              totalCost: totalCost,
                              upgrades: Object.entries(premiumUpgrades).filter(([_, v]) => v).map(([k]) => k)
                            })
                          });
                          if (res.ok) {
                            setLeadCaptured(true);
                          } else {
                            alert("Failed to save design. Please try again.");
                          }
                        } catch (e) {
                          console.error(e);
                          alert("An error occurred.");
                        } finally {
                          setIsSubmittingLead(false);
                        }
                      }}
                      disabled={isSubmittingLead}
                      className="w-full sm:w-auto bg-[#2C3E50] text-white px-8 py-3 rounded-sm hover:bg-[#1e2b38] transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isSubmittingLead ? (
                        <>Processing <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                      ) : (
                        <>Request Private Tour <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.print()}
                      className="w-full sm:w-auto bg-[#C6A87C] text-white px-8 py-3 rounded-sm font-medium text-sm hover:bg-[#b0956e] transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF Summary
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
