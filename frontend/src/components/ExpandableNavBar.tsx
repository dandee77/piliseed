import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, MessageCircleIcon, BarChart3Icon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface ExpandableNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
}
export function ExpandableNavBar({
  activeTab,
  setActiveTab,
  isExpanded
}: ExpandableNavBarProps) {
  const navigate = useNavigate();
  const handleHomeClick = () => {
    setActiveTab('home');
    navigate('/');
  };
  const handleChatClick = () => {
    setActiveTab('chat');
    navigate('/chat');
  };
  const handleHistoryClick = () => {
    setActiveTab('history');
    navigate('/history');
  };
  // Calculate position for white highlighter based on active tab and expansion state
  const getActivePosition = () => {
    if (!isExpanded) {
      if (activeTab === 'home') return 17;
      if (activeTab === 'chat') return 68;
      if (activeTab === 'history') return 122;
    } else {
      if (activeTab === 'home') return 12;
      if (activeTab === 'data') return 76;
      if (activeTab === 'chat') return 140;
      if (activeTab === 'history') return 204;
    }
    return 12;
  };
  return <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 px-5 pointer-events-none z-50">
      <motion.div className="bg-green-600 rounded-full shadow-2xl flex items-center justify-center gap-1 px-3 py-3 relative pointer-events-auto border-2 border-white/20 backdrop-blur-sm" initial={false} animate={{
      width: isExpanded ? '264px' : '192px'
    }} transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30
    }}>
        <AnimatePresence>
          {isExpanded && <>
              <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="absolute left-3 top-3 w-12 h-12 bg-black/20 rounded-full" />
              <motion.div className="absolute left-3 top-3 bottom-3 bg-black/10 rounded-full" initial={{
            width: 48
          }} animate={{
            width: 128
          }} exit={{
            width: 48
          }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }} />
            </>}
        </AnimatePresence>
        {/* Sliding white highlight with glow */}
        <motion.div className="absolute w-12 h-12 bg-white rounded-full shadow-lg" style={{
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)'
      }} animate={{
        left: getActivePosition()
      }} transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30
      }} />
        <button onClick={handleHomeClick} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10">
          <HomeIcon className={`w-6 h-6 ${activeTab === 'home' ? 'text-green-600' : 'text-white'}`} />
        </button>
        <AnimatePresence>
          {isExpanded && <motion.button initial={{
          opacity: 0,
          x: -10,
          width: 0
        }} animate={{
          opacity: 1,
          x: 0,
          width: 48
        }} exit={{
          opacity: 0,
          x: -10,
          width: 0
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} onClick={() => setActiveTab('data')} className="h-12 rounded-full flex items-center justify-center relative z-10">
              <BarChart3Icon className={`w-6 h-6 ${activeTab === 'data' ? 'text-green-600' : 'text-white'}`} />
            </motion.button>}
        </AnimatePresence>
        <button onClick={handleChatClick} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10">
          <MessageCircleIcon className={`w-6 h-6 ${activeTab === 'chat' ? 'text-green-600' : 'text-white'}`} />
        </button>
        <button onClick={handleHistoryClick} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10">
          <ClockIcon className={`w-6 h-6 ${activeTab === 'history' ? 'text-green-600' : 'text-white'}`} />
        </button>
      </motion.div>
    </div>;
}