'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  Activity,
  Users,
  CheckCircle,
  ArrowUpRight,
  Play,
  Sparkles,
  Lock,
  Network,
  ChevronDown,
  Triangle,
  Hexagon,
  Circle,
  Star,
  Target,
  Rocket,
  Brain,
  Cpu,
  FileText,
  Award,
  Menu,
  X,
  Globe,
  Database,
  Gauge
} from 'lucide-react';
import { LogoMappr } from '@/components/icons';

// Constants
const ANIMATION_DELAYS = {
  HERO_BADGE: 0,
  HERO_TITLE: 200,
  HERO_SUBTITLE: 400,
  HERO_BUTTONS: 600,
  FLOATING_BASE: 100
};

// Hooks
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }
      setLastScrollY(scrollY > 0 ? scrollY : 0);
    };
    window.addEventListener('scroll', updateScrollDirection);
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection, lastScrollY]);

  return scrollDirection;
};

// Components
const NavigationBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Analytics', href: '#analytics' },
    { name: 'Strategies', href: '#strategies' },
    { name: 'Academy', href: '#academy' }
  ];

  return (
    <nav className={`fixed top-4 w-full z-50 transition-all duration-200 bg-transparent ${scrollDirection === 'down' && isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-4 border border-divider bg-content2 rounded-2xl">
        <div className="flex items-center justify-between h-14 lg:h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer relative">
            <div className="relative">
              <LogoMappr className='w-9 h-9' />
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg blur opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
            </div>
            <span className="text-sm lg:text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              MoneyMappr
            </span>
                {/* Status Badge */}
                <div className="flex items-center gap-2 bg-green-500/10 backdrop-blur-sm rounded-md px-1.5 py-0 border border-green-400/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-green-300">Beta</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigationItems.map((item, index) => (
              <a 
                key={item.name}
                href={item.href} 
                className="relative  transition-all duration-200 font-medium group text-sm"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-200" />
              </a>
            ))}
            
        
          </div>

          {/* Mobile Menu Button & CTA */}
          <div className="flex items-center gap-4">
            <Button 
              size="sm"
              onClick={() => window.location.href = '/dashboard'} // Replace with actual app link
              radius='md'
              className="hidden sm:flex bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200 "
            >
              Launch App
            </Button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-orange-400 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-white/80 hover:text-orange-400 transition-colors duration-300 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold"
              >
                Launch App
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const FloatingElement: React.FC<{
  element: {
    name: string;
    value: string;
    icon: React.ReactNode;
    position: Record<string, string>;
    color?: string;
  };
}> = ({ element }) => (
  <div
    className="absolute animate-in fade-in-50  hover:scale-105 transition-transform duration-200"
    style={element.position}
  >
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-400/30 transition-all duration-200 shadow-xl">
      <CardBody className="p-3 flex items-center gap-2.5">
        <div className={`${element.color || 'text-orange-400'} flex-shrink-0`}>
          {element.icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{element.name}</p>
          <p className="text-xs text-white/60">{element.value}</p>
        </div>
      </CardBody>
    </Card>
  </div>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}> = ({ icon, title, description, index }) => (
  <Card 
    className="h-full bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl border border-white/10 hover:border-orange-400/30 transition-all duration-500 group cursor-pointer shadow-xl hover:shadow-orange-500/10"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <CardBody className="p-6 lg:p-8 h-full flex flex-col">
      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <div className="text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
          {icon}
        </div>
      </div>
      
      <h3 className="text-lg lg:text-xl font-bold mb-3 text-white group-hover:text-orange-100 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-sm lg:text-base text-white/60 mb-4 flex-grow leading-relaxed group-hover:text-white/80 transition-colors duration-300">
        {description}
      </p>
      
      <div className="flex items-center gap-2 text-orange-400 group-hover:gap-3 transition-all duration-300 mt-auto">
        <span className="text-sm font-medium">Learn more</span>
        <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
      </div>
    </CardBody>
  </Card>
);

const StatCard: React.FC<{
  stat: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  };
  index: number;
}> = ({ stat, index }) => (
  <div 
    className="group cursor-pointer animate-in fade-in-50 duration-500"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="text-center p-4 lg:p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-orange-400/30 transition-all duration-300 hover:scale-105">
      <div className={`flex items-center justify-center gap-2 mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
        {stat.icon}
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">
        {stat.value}
      </p>
      <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
        {stat.label}
      </p>
    </div>
  </div>
);

// Main Component
const MoneyMapprHomepage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const floatingElements = useMemo(() => [
    { 
      name: 'Ethereum', 
      value: '$2,845', 
      icon: <Triangle className="w-4 h-4" />, 
      position: { top: '20%', left: '5%' },
      color: 'text-blue-400'
    },
    { 
      name: 'Polygon', 
      value: '$1.34', 
      icon: <Hexagon className="w-4 h-4" />, 
      position: { top: '30%', right: '8%' },
      color: 'text-purple-400'
    },
    { 
      name: 'Arbitrum', 
      value: '$1.89', 
      icon: <Circle className="w-4 h-4" />, 
      position: { bottom: '35%', left: '3%' },
      color: 'text-cyan-400'
    },
    { 
      name: 'Optimism', 
      value: '$2.15', 
      icon: <Zap className="w-4 h-4" />, 
      position: { bottom: '25%', right: '5%' },
      color: 'text-red-400'
    }
  ], []);

  const features = useMemo(() => [
    {
      icon: <Wallet className="w-6 h-6 lg:w-7 lg:h-7" />,
      title: 'Multi-Chain Portfolio',
      description: 'Track assets across 50+ blockchains with real-time sync and advanced analytics for optimal portfolio management.'
    },
    {
      icon: <Brain className="w-6 h-6 lg:w-7 lg:h-7" />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent market analysis, performance predictions, and personalized investment recommendations.'
    },
    {
      icon: <Shield className="w-6 h-6 lg:w-7 lg:h-7" />,
      title: 'Bank-Grade Security',
      description: 'Non-custodial architecture with zero-knowledge proofs and end-to-end encryption for ultimate protection.'
    },
    {
      icon: <Network className="w-6 h-6 lg:w-7 lg:h-7" />,
      title: 'Cross-Chain DeFi',
      description: 'Execute cross-chain swaps and manage complex DeFi strategies from a single intuitive interface.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 lg:w-7 lg:h-7" />,
      title: 'Advanced Analytics',
      description: 'Institutional-grade tools for performance metrics, risk analysis, and yield optimization strategies.'
    },
    {
      icon: <Rocket className="w-6 h-6 lg:w-7 lg:h-7" />,
      title: 'Strategy Automation',
      description: 'Automate yield farming, liquidity provision, and rebalancing with customizable risk parameters.'
    }
  ], []);

  const stats = useMemo(() => [
    { label: "Total Value Locked", value: "$12.8B", icon: <TrendingUp className="w-5 h-5" />, color: "text-green-400" },
    { label: "Active Users", value: "2.1M", icon: <Users className="w-5 h-5" />, color: "text-blue-400" },
    { label: "Supported Protocols", value: "1,200+", icon: <Network className="w-5 h-5" />, color: "text-purple-400" },
    { label: "Network Uptime", value: "99.98%", icon: <Activity className="w-5 h-5" />, color: "text-orange-400" }
  ], []);

  const partners = useMemo(() => [
    { name: 'Uniswap', logo: '🦄' },
    { name: 'Aave', logo: '👻' },
    { name: 'Compound', logo: '🏛️' },
    { name: 'Curve', logo: '🌊' },
    { name: 'Balancer', logo: '⚖️' },
    { name: 'SushiSwap', logo: '🍣' }
  ], []);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40" />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        
        {/* Floating Elements */}
        <div className="hidden lg:block">
          {floatingElements.map((element, index) => (
            <FloatingElement 
              key={index} 
              element={element}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto relative z-10">
          
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-400/30 mb-6 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">Next-Gen DeFi Platform</span>
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Main Headline */}
          <div className={`mb-8 transition-all duration-1000 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-4">
              Master Your{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                DeFi
              </span>
              {' '}Universe
            </h1>
            
            <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Experience next-generation decentralized finance with AI-powered analytics and institutional-grade security
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              Launch App
            </Button>
            <Button 
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-orange-400/50"
              startContent={<Play className="w-5 h-5" />}
            >
              Watch Demo
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className={`flex flex-col items-center gap-2 text-white/40 transition-all duration-1000 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <ChevronDown className="w-5 h-5 animate-bounce" />
            <span className="text-sm">Discover More</span>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="relative py-12 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/60 text-sm font-medium tracking-wide uppercase mb-8">
            Trusted by Leading DeFi Protocols
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-50 hover:opacity-70 transition-opacity duration-500">
            {partners.map((partner, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 hover:scale-110 transition-all duration-300 cursor-pointer group"
              >
                <span className="text-xl lg:text-2xl">{partner.logo}</span>
                <span className="text-white/60 font-semibold group-hover:text-orange-400 transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Everything you need to dominate DeFi with cutting-edge tools and insights
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                {...feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
              <StatCard 
                key={index}
                stat={stat}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-600/10 to-red-500/10 rounded-2xl lg:rounded-3xl blur-2xl" />
            
            <div className="relative bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl rounded-2xl lg:rounded-3xl p-8 lg:p-12 border border-orange-500/20 shadow-2xl">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">
                Ready to Transform Your Portfolio?
              </h2>
              
              <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                Join millions who trust MoneyMappr for DeFi investments. Start your journey today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105"
                  endContent={<Rocket className="w-5 h-5" />}
                >
                  Launch Portfolio
                </Button>
                <Button 
                  size="lg"
                  className="bg-white text-black font-semibold hover:bg-white/90 transition-all duration-300"
                  startContent={<FileText className="w-5 h-5" />}
                >
                  Documentation
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-white/50">
                {[
                  { icon: <CheckCircle className="w-4 h-4 text-green-400" />, text: "Non-custodial" },
                  { icon: <Zap className="w-4 h-4 text-yellow-400" />, text: "Lightning Fast" },
                  { icon: <Award className="w-4 h-4 text-blue-400" />, text: "Industry Leading" },
                  { icon: <Lock className="w-4 h-4 text-purple-400" />, text: "Bank-Grade Security" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 hover:text-white/70 transition-colors duration-300">
                    {item.icon}
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in-50 {
          animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MoneyMapprHomepage;