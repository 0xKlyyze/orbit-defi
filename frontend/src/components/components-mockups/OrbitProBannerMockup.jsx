import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Crown,
  Cpu
} from 'lucide-react';

// --- VISUAL CONSTANTS ---
const COLORS = {
  bg: '#050505',
  card: '#141414',
  primary: '#FFE066', // Orbit Yellow
  pro: '#8B5CF6',     // Pro Violet
  proGradient: 'linear-gradient(135deg, #8B5CF6 0%, #FFE066 100%)',
  glass: 'rgba(255, 255, 255, 0.03)'
};

// --- ANIMATION VARIANTS ---
const shimmerVariants = {
  initial: { x: '-100%' },
  animate: { 
    x: '100%',
    transition: { 
      repeat: Infinity, 
      duration: 3, 
      ease: "linear",
      repeatDelay: 2
    }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", bounce: 0.3, duration: 0.6 }
  },
  exit: { scale: 0.95, opacity: 0, y: 10 }
};

// --- SUB-COMPONENTS ---

const FeatureRow = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay, duration: 0.5 }}
    className="flex items-start gap-4 p-4 rounded-2xl bg-[#1A1A1A] border border-[#222] hover:border-[#8B5CF6]/50 transition-colors group"
  >
    <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:scale-110 transition-transform duration-300">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="text-white font-bold text-sm mb-1 group-hover:text-[#FFE066] transition-colors">{title}</h4>
      <p className="text-[#888] text-xs leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const PricingCard = ({ price, period, savings, onClick }) => (
  <div className="relative p-6 rounded-3xl bg-[#0A0A0A] border border-[#333] flex flex-col items-center overflow-hidden">
    {savings && (
      <div className="absolute top-0 right-0 bg-[#FFE066] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">
        {savings}
      </div>
    )}
    <p className="text-[#666] text-xs uppercase tracking-widest mb-2">{period}</p>
    <div className="flex items-baseline gap-1 mb-4">
      <span className="text-3xl font-bold text-white">${price}</span>
      <span className="text-[#444] text-sm">/mo</span>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); console.info('[Banner] Select Plan click', { period }); if (onClick) onClick(e); }}
      className="w-full py-3 rounded-xl bg-[#222] text-white text-sm font-medium hover:bg-[#333] transition-colors border border-[#333]"
    >
      Select Plan
    </button>
  </div>
);

// --- MAIN COMPONENT ---

const OrbitProBannerMockup = ({ mode = 'default', onSelectMonthly, onSelectYearly, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. THE COMPACT BANNER (Default State)
  if (!isExpanded) {
    return (
      <motion.div 
        layoutId="pro-container"
        onClick={() => setIsExpanded(true)}
        className="relative group cursor-pointer overflow-hidden rounded-[24px] p-[1px]" // p-1 for border effect
      >
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] via-[#FFE066] to-[#8B5CF6] opacity-30 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy"></div>
        
        {/* Inner Content */}
        <div className="relative h-full bg-[#141414] rounded-[23px] p-6 flex items-center justify-between overflow-hidden">
          
          {/* Shimmer Effect */}
          <motion.div 
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-0 pointer-events-none"
          />

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              <Sparkles className="text-white fill-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight group-hover:text-[#FFE066] transition-colors">
                Orbit Advanced
              </h3>
              <p className="text-[#888] text-xs group-hover:text-[#AAA] transition-colors">
                Unlock AI predictions & unlimited loops.
              </p>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center border border-[#333] group-hover:bg-[#FFE066] group-hover:text-black group-hover:border-[#FFE066] transition-all"
          >
            <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // 2. THE EXTENDED OVERLAY (Modal State)
  return (
    <AnimatePresence>
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsExpanded(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            layoutId="pro-container"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl bg-[#050505] rounded-[32px] border border-[#333] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); if (onClose) onClose(); }}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 text-[#666] hover:text-white hover:bg-[#222] transition-colors"
            >
              <X size={20} />
            </button>

            {/* LEFT SIDE: Visual & Value Prop */}
            <div className="md:w-5/12 bg-[#0A0A0A] p-8 relative flex flex-col justify-between overflow-hidden border-r border-[#222]">
              {/* Animated Background Orbits */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#222] rounded-full opacity-30 animate-[spin_60s_linear_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#333] rounded-full opacity-30 animate-[spin_40s_linear_infinite_reverse]" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-bold border border-[#8B5CF6]/20 mb-6">
                  <Crown size={12} />
                  <span>PREMIUM CLEARANCE</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                  Upgrade your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#FFE066]">
                    Command Center
                  </span>
                </h2>
                <p className="text-[#888] text-sm leading-relaxed">
                  Remove all limits. Let the Orbit AI Engine predict risks and optimize yields across your entire portfolio in real-time.
                </p>
              </div>

              {/* Trust Indicator */}
              <div className="relative z-10 mt-8 md:mt-0">
                <div className="flex items-center gap-[-10px]">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-[#333] -ml-2 first:ml-0"></div>
                   ))}
                   <span className="ml-3 text-xs text-[#666] font-medium">+1,200 Pro Commanders</span>
                </div>
              </div>

              {/* Gradient Glow */}
              <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#8B5CF6] rounded-full blur-[120px] opacity-20"></div>
            </div>

            {/* RIGHT SIDE: Features & Pricing */}
            <div className="md:w-7/12 p-8 bg-[#050505]">
              <div className="space-y-4 mb-8">
                <FeatureRow 
                  icon={Cpu} 
                  title="AI Risk Engine" 
                  desc="Real-time predictive liquidation alerts and health decay simulation."
                  delay={0.1}
                />
                <FeatureRow 
                  icon={Zap} 
                  title="Unlimited Loops" 
                  desc="Create infinite advanced strategies and track complex arb paths."
                  delay={0.2}
                />
                <FeatureRow 
                  icon={ShieldAlert} 
                  title="Priority Liquidations" 
                  desc="Get notified via SMS/Telegram 5 blocks before on-chain events."
                  delay={0.3}
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <PricingCard price="29" period="Monthly" onClick={onSelectMonthly} />
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#FFE066]/30 flex flex-col items-center overflow-hidden group cursor-pointer hover:border-[#FFE066] transition-colors">
                   <div className="absolute top-0 right-0 bg-[#FFE066] text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                      SAVE 20%
                   </div>
                   <p className="text-[#FFE066] text-xs uppercase tracking-widest mb-2 font-bold">Yearly</p>
                   <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-white">$24</span>
                      <span className="text-[#444] text-sm">/mo</span>
                   </div>
                   <button
                     onClick={(e) => { e.stopPropagation(); console.info('[Banner] Initialize Year click'); if (onSelectYearly) onSelectYearly(e); }}
                     className="w-full py-3 rounded-xl bg-[#FFE066] text-black text-sm font-bold hover:bg-[#FFD633] transition-colors shadow-[0_0_20px_rgba(255,224,102,0.3)]"
                   >
                      Initialize Year
                   </button>
                   {/* Shine Effect on Button */}
                   <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine pointer-events-none" />
                </div>
              </div>

              <div className="text-center">
                 <p className="text-[#444] text-[10px]">
                    7-day money-back guarantee. Cancel anytime.
                 </p>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrbitProBannerMockup;
