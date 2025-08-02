import { TabKey } from "@/lib/wallet-analytics/types";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Activity, Image } from "lucide-react";

// Modern Tabs Component
const ModernTabs: React.FC<{
    selectedTab: TabKey;
    onTabChange: (tab: TabKey) => void;
    tokenCount: number;
    nftCount: number;
    children: React.ReactNode;
  }> = ({ selectedTab, onTabChange, tokenCount, nftCount, children }) => {
    const tabs = [
 
      {
        key: 'tokens' as TabKey,
        label: 'Tokens',
        count: tokenCount,
        icon: Coins,
        color: 'bg-primary-500'
      },
      {
        key: 'nfts' as TabKey,
        label: 'NFTs',
        count: nftCount,
        icon: Image,
        color: 'secondary'
      },
      {
        key: 'transactions' as TabKey,
        label: 'History',
        count: null,
        icon: Activity,
        color: 'warning'
      }
    ];
  
    return (
      <div className='w-full rounded-2xl lg:rounded-3xl border border-divider bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl animate-in fade-in-0 duration-100 slide-in-from-bottom-6 p-4 pb-0'>
                 {/* Gradient overlay */}
                 <div className="absolute inset-0 rounded-2xl lg:rounded-3xl  bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5" />
        <div className="pb-0">
          <div className="flex items-center justify-between w-full">
            {/* Custom Tab Design */}
            <div className="flex items-center gap-1 p-1 bg-default-200 rounded-2xl">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`relative flex items-center gap-2 px-2 py-1 rounded-xl text-sm font-medium transition-all duration-75 ${
                    selectedTab === tab.key
                      ? 'bg-default-100 shadow-sm text-foreground'
                      : 'text-default-600 hover:text-foreground hover:bg-default-200/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors `}>
                    <tab.icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <span className='text-xs font-semibold'>{tab.label}</span>
                  {tab.count !== null && (
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={selectedTab === tab.key ? tab.color as any : 'default'}
                      className="text-[10px] min-w-6 h-5 bg-danger-500/20"
                    >
                      {tab.count}
                    </Chip>
                  )}
                  
                  {selectedTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r from-${tab.color}/5 to-${tab.color}/10 rounded-lg -z-10`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
                    />
                  )}
                </button>
              ))}
            </div>
  
       
          </div>
        </div>
        
        <div className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.1 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };
  
  export default ModernTabs;