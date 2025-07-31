'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Link } from "@heroui/link";
import { 
  ArrowRight, 
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react';

const MoneyMapprHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [cubeHover, setCubeHover] = useState(null);
  const [particles, setParticles] = useState([]);
  const containerRef = useRef(null);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Page load animation
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }));
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y > 100 ? -5 : particle.y + particle.speed * 0.1,
        x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.1
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const cubeData = [
    { 
      id: 1, 
      position: 'top-12 left-12', 
      size: 'w-20 h-20', 
      color: 'from-emerald-400 to-teal-500',
      rotation: '-rotate-12',
      data: 'Crypto',
      value: '$127K',
      change: '+12.5%'
    },
    { 
      id: 2, 
      position: 'top-12 right-12', 
      size: 'w-20 h-20', 
      color: 'from-blue-400 to-indigo-500',
      rotation: 'rotate-12',
      data: 'Banking',
      value: '$89K',
      change: '+8.2%'
    },
    { 
      id: 3, 
      position: 'left-0 top-1/2 -translate-y-1/2', 
      size: 'w-24 h-24', 
      color: 'from-purple-400 to-violet-500',
      rotation: '-rotate-6',
      data: 'Business',
      value: '$234K',
      change: '+15.7%'
    },
    { 
      id: 4, 
      position: 'right-0 top-1/2 -translate-y-1/2', 
      size: 'w-24 h-24', 
      color: 'from-pink-400 to-rose-500',
      rotation: 'rotate-6',
      data: 'Analytics',
      value: '$156K',
      change: '+22.1%'
    },
    { 
      id: 5, 
      position: 'bottom-12 left-12', 
      size: 'w-20 h-20', 
      color: 'from-amber-400 to-orange-500',
      rotation: 'rotate-12',
      data: 'DeFi',
      value: '$67K',
      change: '+31.4%'
    },
    { 
      id: 6, 
      position: 'bottom-12 right-12', 
      size: 'w-20 h-20', 
      color: 'from-cyan-400 to-blue-500',
      rotation: '-rotate-12',
      data: 'NFTs',
      value: '$43K',
      change: '+5.9%'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      
      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              transform: `scale(${particle.size})`,
              animation: `twinkle ${3 + particle.id % 3}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Navigation with glassmorphism */}
      <nav className={`relative z-50 flex items-center justify-between p-6 lg:px-12 backdrop-blur-xl bg-white/5 border-b border-white/10 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center relative group cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-sm transition-transform group-hover:rotate-180 duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {['Home', 'Solutions', 'Pricing', 'Resources'].map((item, index) => (
            <Link 
              key={item}
              href="#" 
              className="text-white/90 hover:text-orange-400 transition-all duration-300 font-medium relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-white/90 hover:text-white hover:bg-white/10 font-medium transition-all duration-300"
          >
            Login
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-6 font-medium backdrop-blur-sm transition-all duration-300 hover:scale-105">
            Sign up
          </Button>
        </div>

        <Button
          isIconOnly
          variant="ghost"
          className="lg:hidden text-white hover:bg-white/10 transition-all duration-300"
          onPress={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </div>
        </Button>
      </nav>

      {/* Mobile Menu with slide animation */}
      <div className={`lg:hidden absolute top-20 left-0 right-0 z-40 backdrop-blur-xl bg-slate-900/95 border-b border-white/10 transition-all duration-500 ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="p-6 space-y-4">
          {['Home', 'Solutions', 'Pricing', 'Resources'].map((item, index) => (
            <Link 
              key={item}
              href="#" 
              className="block text-white/80 hover:text-orange-400 py-2 transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12" ref={containerRef}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
            
            {/* Left Column - Content with staggered animations */}
            <div className="space-y-8 lg:pr-12">
              
              {/* Badge with pulse animation */}
              <div className={`inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <Badge size="sm" className="bg-orange-500 text-white text-xs px-2 py-1 rounded-md font-medium animate-pulse">
                  New
                </Badge>
                <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
                  Introducing our new most advanced Web3 aggregation
                </span>
              </div>

              {/* Animated headline */}
              <div className={`space-y-6 transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  <span className="inline-block animate-in slide-in-from-left duration-700">Aggregate on</span>
                  <br />
                  <span className="inline-block animate-in slide-in-from-left duration-700 delay-200 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">decentralized</span>
                  <br />
                  <span className="inline-block animate-in slide-in-from-left duration-700 delay-400">financial protocol</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-white/70 leading-relaxed max-w-lg font-medium">
                  MoneyMappr is a leading provider of cutting-edge decentralized solutions, powering the next 
                  <span className="text-orange-400 font-semibold"> generation </span>
                  of DeFi, GameFi, and Metaverse projects.
                </p>
              </div>

              {/* Interactive stats */}
              <div className={`grid grid-cols-3 gap-4 transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {[
                  { label: 'Active Users', value: '10K+', icon: <Activity className="w-4 h-4" /> },
                  { label: 'Total Volume', value: '$2.5B', icon: <TrendingUp className="w-4 h-4" /> },
                  { label: 'Protocols', value: '50+', icon: <Zap className="w-4 h-4" /> }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-orange-400 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                      <span className="text-xs text-white/60">{stat.label}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* CTA Button with magnetic effect */}
              <div className={`pt-4 transition-all duration-1000 delay-900 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <Button 
                  size="lg" 
                  className="bg-white hover:bg-white/90 text-black border-0 rounded-full px-8 py-3 text-base font-semibold flex items-center gap-2 group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
                  }}
                >
                  <span className="relative z-10">Schedule demo</span>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center ml-2 group-hover:bg-orange-600 transition-all duration-300 group-hover:rotate-90 relative z-10">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </Button>
              </div>
            </div>

            {/* Right Column - Interactive 3D Visualization */}
            <div className="relative flex items-center justify-center lg:h-[600px]">
              
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                
                {/* Data connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 400">
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8"/>
                      <stop offset="50%" stopColor="#F97316" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4"/>
                    </linearGradient>
                  </defs>
                  {cubeData.map((cube, index) => (
                    <line
                      key={index}
                      x1="200"
                      y1="200"
                      x2={cube.position.includes('left') ? "100" : cube.position.includes('right') ? "300" : "200"}
                      y2={cube.position.includes('top') ? "100" : cube.position.includes('bottom') ? "300" : "200"}
                      stroke="url(#connectionGradient)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity={cubeHover === cube.id ? "1" : "0.3"}
                      className="transition-all duration-300"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;10"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </line>
                  ))}
                </svg>

                {/* Interactive Cubes */}
                {cubeData.map((cube, index) => (
                  <div
                    key={cube.id}
                    className={`absolute ${cube.position} ${cube.size} transform ${cube.rotation} cursor-pointer group z-10 transition-all duration-500`}
                    style={{ 
                      perspective: '1000px',
                      animationDelay: `${index * 200}ms`,
                      transform: `${cube.rotation} translate(${mousePosition.x * (index + 1) * 2}px, ${mousePosition.y * (index + 1) * 2}px)`
                    }}
                    onMouseEnter={() => setCubeHover(cube.id)}
                    onMouseLeave={() => setCubeHover(null)}
                  >
                    <div 
                      className="w-full h-full relative transform-gpu group-hover:scale-110 transition-all duration-300" 
                      style={{ 
                        transformStyle: 'preserve-3d', 
                        transform: `rotateX(15deg) rotateY(-15deg) ${cubeHover === cube.id ? 'rotateY(25deg)' : ''}` 
                      }}
                    >
                      {/* Front face */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cube.color} rounded-lg shadow-2xl group-hover:shadow-orange-500/25`} />
                      {/* Top face */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cube.color.replace('400', '300').replace('500', '400')} rounded-lg origin-bottom transform -skew-x-12 -translate-y-2 shadow-xl opacity-80`} />
                      {/* Right face */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cube.color.replace('400', '500').replace('500', '600')} rounded-lg origin-left transform skew-y-12 translate-x-2 shadow-xl opacity-60`} />
                      
                      {/* Data overlay */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-bold transition-all duration-300 ${cubeHover === cube.id ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-center">
                          <div className="mb-1">{cube.data}</div>
                          <div className="text-orange-200">{cube.value}</div>
                          <div className="text-green-300">{cube.change}</div>
                        </div>
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cube.color} rounded-lg blur-xl transition-all duration-300 ${cubeHover === cube.id ? 'opacity-50 scale-125' : 'opacity-0'}`} />
                  </div>
                ))}

                {/* Center Large Cube - Main Hub */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 transform rotate-3 cursor-pointer group z-20"
                  style={{ 
                    perspective: '1000px',
                    transform: `rotate(3deg) translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`
                  }}
                  onMouseEnter={() => setCubeHover('center')}
                  onMouseLeave={() => setCubeHover(null)}
                >
                  <div 
                    className="w-full h-full relative transform-gpu group-hover:scale-110 transition-all duration-500" 
                    style={{ 
                      transformStyle: 'preserve-3d', 
                      transform: `rotateX(25deg) rotateY(-25deg) ${cubeHover === 'center' ? 'rotateY(45deg) rotateX(35deg)' : ''}` 
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-2xl group-hover:shadow-orange-500/50" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-red-400 rounded-xl origin-bottom transform -skew-x-12 -translate-y-4 shadow-xl opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl origin-left transform skew-y-12 translate-x-4 shadow-xl opacity-60" />
                    
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className={`transition-all duration-300 ${cubeHover === 'center' ? 'animate-spin' : ''}`}>
                        <Zap className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  {/* Intense glow for center */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur-2xl transition-all duration-500 ${cubeHover === 'center' ? 'opacity-70 scale-150' : 'opacity-30 scale-110'}`} />
                </div>

                {/* Ambient lighting effects */}
                <div className="absolute inset-0 bg-gradient-radial from-orange-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-purple-500/10 via-transparent to-transparent rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-20">
        <Button
          isIconOnly
          variant="ghost"
          className="w-12 h-12 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
        >
          <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
        </Button>
      </div>

      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Responsive gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl transition-all duration-1000"
          style={{
            top: `${25 + mousePosition.y * 5}%`,
            left: `${25 + mousePosition.x * 5}%`
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-1000"
          style={{
            bottom: `${25 - mousePosition.y * 5}%`,
            right: `${25 - mousePosition.x * 5}%`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-2xl transition-all duration-1000"
          style={{
            top: `${50 + mousePosition.y * 3}%`,
            right: `${33 + mousePosition.x * 3}%`
          }}
        />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.2; transform: scale(0.5); }
        }
        
        .animate-in {
          animation: slideIn 0.7s ease-out forwards;
        }
        
        .slide-in-from-left {
          transform: translateX(-50px);
          opacity: 0;
        }
        
        @keyframes slideIn {
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MoneyMapprHomepage;