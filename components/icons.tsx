
import * as React from "react";

import { IconSvgProps } from "@/types";
interface LogoLoaderProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    width?: number;
    height?: number;
  }
  
export function LogoLoader({ 
    size = 24, 
    width, 
    height, 
    ...props 
  }: LogoLoaderProps) {
    const svgWidth = size || width || 48;
    const svgHeight = size || height || 48;
    
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={svgWidth}
        height={svgHeight}
        preserveAspectRatio="xMidYMid meet"
        {...props}
      >
        <defs>
          <filter
            id="gooey"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
          <filter
            id="shadow"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx={0}
              dy={0}
              stdDeviation="0.5"
              floodColor="#f97316"
              floodOpacity="0.5"
            />
          </filter>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9736" />
            <stop offset="100%" stopColor="#f05d14" />
          </linearGradient>
        </defs>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes morphSquare {
                0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }
                15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }
                30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }
                40%, 100% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1); }
              }
              
              @keyframes blob1Appear {
                0%, 30% { transform: translate(0, 0) scale(0); opacity: 0; }
                40% { transform: translate(-2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }
                50% { transform: translate(-1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }
                60%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
              }
              
              @keyframes blob2Appear {
                0%, 35% { transform: translate(0, 0) scale(0); opacity: 0; }
                45% { transform: translate(2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }
                55% { transform: translate(1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }
                65%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
              }
              
              @keyframes blob3Appear {
                0%, 40% { transform: translate(0, 0) scale(0); opacity: 0; }
                50% { transform: translate(2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }
                60% { transform: translate(1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }
                70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
              }
              
              @keyframes blob4Appear {
                0%, 45% { transform: translate(0, 0) scale(0); opacity: 0; }
                55% { transform: translate(-2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }
                65% { transform: translate(-1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }
                75%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
              }
              
              @keyframes finalRotateAndSplash {
                0%, 70% { transform: rotate(0deg) scale(1); }
                75% { transform: rotate(90deg) scale(1.05); }
                80% { transform: rotate(180deg) scale(0.95); }
                85% { transform: rotate(270deg) scale(1.02); }
                90%, 100% { transform: rotate(360deg) scale(1); }
              }
              
              @keyframes pulse {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.2); }
              }
              
              @keyframes restart {
                0%, 95% { opacity: 1; }
                97.5% { opacity: 0.7; }
                100% { opacity: 1; }
              }
              
              :root {
                --animation-duration: 2.2s;
              }
              
              .container {
                animation: restart var(--animation-duration) infinite;
                filter: url(#gooey);
              }
              
              .square {
                fill: url(#orangeGradient);
                transform-origin: 12px 12px;
                animation: morphSquare var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite, 
                           pulse var(--animation-duration) ease-in-out infinite;
                filter: url(#shadow);
              }
              
              .blob {
                fill: url(#orangeGradient);
                transform-origin: 12px 12px;
                filter: url(#shadow);
              }
              
              #blob1 {
                animation: blob1Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
                transform-origin: 6px 6px;
              }
              
              #blob2 {
                animation: blob2Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
                transform-origin: 18px 6px;
              }
              
              #blob3 {
                animation: blob3Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
                transform-origin: 18px 18px;
              }
              
              #blob4 {
                animation: blob4Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
                transform-origin: 6px 18px;
              }
              
              #finalShape {
                transform-origin: 12px 12px;
                animation: finalRotateAndSplash var(--animation-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
              }
            `
          }}
        />
        {/* Main container with gooey filter */}
        <g className="container">
          {/* Morphing square */}
          <path className="square" d="M7,7 h10 v10 h-10 z" />
          {/* Liquid blobs appearing as corners */}
          <g id="finalShape">
            <path id="blob1" className="blob" d="M8 5a3 3 0 1 0-3 3h3v-3z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M8 5a3 3 0 1 0-3 3h3v-3z;
                       M8 5a3 3 0 1 0-3 3h3c0.5,-1 0,-2 0,-3z;
                       M8 5a3 3 0 1 0-3 3h3v-3z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
            <path id="blob2" className="blob" d="M16 8h3a3 3 0 1 0-3-3v3z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M16 8h3a3 3 0 1 0-3-3v3z;
                       M16 8h3a3 3 0 1 0-3-3c-1,0.5 -2,0 -3,0 h3z;
                       M16 8h3a3 3 0 1 0-3-3v3z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
            <path id="blob3" className="blob" d="M16 16h3a3 3 0 1 1-3 3v-3z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M16 16h3a3 3 0 1 1-3 3v-3z;
                       M16 16h3a3 3 0 1 1-3 3c-1,-0.5 -2,0 -3,0 h3z;
                       M16 16h3a3 3 0 1 1-3 3v-3z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
            <path id="blob4" className="blob" d="M5 16a3 3 0 1 0 3 3v-3H5z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M5 16a3 3 0 1 0 3 3v-3H5z;
                       M5 16a3 3 0 1 0 3 3c0.5,-1 0,-2 0,-3H5z;
                       M5 16a3 3 0 1 0 3 3v-3H5z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
          </g>
        </g>
      </svg>
    );
  }
  
  
  
  export function SuccessLoader(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        {...props}
      >
        <defs>
          <filter
            id="gooey-check"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
          <filter
            id="shadow-check"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx={0}
              dy={0}
              stdDeviation="0.5"
              floodColor="#f97316"
              floodOpacity="0.5"
            />
          </filter>
          <linearGradient id="orangeGradient-check" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9736" />
            <stop offset="100%" stopColor="#f05d14" />
          </linearGradient>
        </defs>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes morphToCheck {
            0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }
            15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }
            30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }
            40% { d: path('M9,9 h6 v6 h-6 z'); transform: rotate(0deg) scale(1); }
            45% { d: path('M9,9 l6,6'); transform: scale(1); }
            50% { d: path('M9,13 l3,3'); transform: scale(1); opacity: 0.7; }
            55% { d: path('M8,13 l4,4 l5,-8'); transform: scale(1); opacity: 0.8; }
            60%, 70% { d: path('M7,13 l5,5 l6,-10'); transform: scale(1.05); opacity: 1; }
            80%, 100% { d: path('M7,13 l5,5 l6,-10'); transform: scale(1); opacity: 1; }
          }
          
          @keyframes finalPulse {
            0%, 70% { transform: translate(0, 0); }
            72% { transform: translate(-0.5px, 0.5px); }
            74% { transform: translate(1px, -0.5px); }
            76% { transform: translate(-1px, -0.5px); }
            78% { transform: translate(0.5px, 1px); }
            80% { transform: translate(-0.5px, -1px); }
            82% { transform: translate(1px, 0.5px); }
            84% { transform: translate(-0.5px, 0.5px); }
            86% { transform: translate(0.5px, -0.5px); }
            88%, 100% { transform: translate(0, 0); }
          }
  
          @keyframes blobAnimation {
            0%, 20% { r: 0; opacity: 0; }
            30% { r: 1.5; opacity: 0.2; }
            40% { r: 1; opacity: 0.4; }
            50% { r: 0.5; opacity: 0.6; }
            60%, 100% { r: 0; opacity: 0; }
          }
          
          :root {
            --animation-duration: 2.2s;
          }
          
          svg {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
          }
  
          .container-check {
            filter: url(#gooey-check);
          }
          
          .checkmark {
            fill: none;
            stroke: url(#orangeGradient-check);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            transform-origin: 12px 12px;
            animation: morphToCheck var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            filter: url(#shadow-check);
          }
          
          #check-finalShape {
            transform-origin: 12px 12px;
            animation: finalPulse var(--animation-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
          }
  
          .blob-effect {
            fill: url(#orangeGradient-check);
            filter: url(#shadow-check);
          }
        `
          }}
        />
        {/* Container with gooey filter */}
        <g className="container-check">
          <g id="check-finalShape">
            {/* Morphing square to check */}
            <path className="checkmark" d="M7,7 h10 v10 h-10 z" />
            
            {/* Small blob effects that appear briefly during the animation */}
            <circle className="blob-effect" cx="7" cy="7" r="0">
              <animate
                attributeName="r"
                begin="0s"
                dur="2.2s"
                values="0;1.5;1;0.5;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                begin="0s"
                dur="2.2s"
                values="0;0.2;0.4;0.6;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
            </circle>
            
            <circle className="blob-effect" cx="17" cy="7" r="0">
              <animate
                attributeName="r"
                begin="0.1s"
                dur="2.2s"
                values="0;1.5;1;0.5;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                begin="0.1s"
                dur="2.2s"
                values="0;0.2;0.4;0.6;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline" 
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
            </circle>
            
            <circle className="blob-effect" cx="17" cy="17" r="0">
              <animate
                attributeName="r"
                begin="0.2s"
                dur="2.2s"
                values="0;1.5;1;0.5;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                begin="0.2s"
                dur="2.2s"
                values="0;0.2;0.4;0.6;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
            </circle>
            
            <circle className="blob-effect" cx="7" cy="17" r="0">
              <animate
                attributeName="r"
                begin="0.3s"
                dur="2.2s"
                values="0;1.5;1;0.5;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                begin="0.3s"
                dur="2.2s"
                values="0;0.2;0.4;0.6;0"
                keyTimes="0;0.3;0.4;0.5;0.6"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
                fill="freeze"
              />
            </circle>
          </g>
        </g>
      </svg>
    );
  }
  
  export function FailLoader(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        {...props}
      >
        <defs>
          <filter
            id="gooey-fail"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
          <filter
            id="shadow-fail"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx={0}
              dy={0}
              stdDeviation="0.5"
              floodColor="#f97316"
              floodOpacity="0.5"
            />
          </filter>
          <linearGradient id="orangeGradient-fail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9736" />
            <stop offset="100%" stopColor="#f05d14" />
          </linearGradient>
        </defs>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes morphToX {
            0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }
            15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }
            30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }
            40% { d: path('M9,9 h6 v6 h-6 z'); transform: rotate(0deg) scale(1); }
            45% { d: path('M9,9 l6,6'); transform: scale(1); }
            50% { d: path('M9,9 l6,6 m0,0 l-6,-6'); transform: scale(1); opacity: 0.7; }
            55% { d: path('M8,8 l8,8 m0,-8 l-8,8'); transform: scale(1); opacity: 0.8; }
            60%, 70% { d: path('M8,8 l8,8 m0,-8 l-8,8'); transform: scale(1.05); opacity: 1; }
            80%, 100% { d: path('M8,8 l8,8 m0,-8 l-8,8'); transform: scale(1); opacity: 1; }
          }
          
          @keyframes blob1Appear {
            0%, 30% { transform: translate(0, 0) scale(0); opacity: 0; }
            40% { transform: translate(-2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }
            50% { transform: translate(-1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }
            60%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          }
          
          @keyframes blob2Appear {
            0%, 35% { transform: translate(0, 0) scale(0); opacity: 0; }
            45% { transform: translate(2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }
            55% { transform: translate(1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }
            65%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          }
          
          @keyframes blob3Appear {
            0%, 40% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { transform: translate(2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }
            60% { transform: translate(1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }
            70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          }
          
          @keyframes blob4Appear {
            0%, 45% { transform: translate(0, 0) scale(0); opacity: 0; }
            55% { transform: translate(-2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }
            65% { transform: translate(-1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }
            75%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
          }
          
          @keyframes finalShake {
            0%, 70% { transform: translate(0, 0); }
            72% { transform: translate(-0.5px, 0.5px); }
            74% { transform: translate(1px, -0.5px); }
            76% { transform: translate(-1px, -0.5px); }
            78% { transform: translate(0.5px, 1px); }
            80% { transform: translate(-0.5px, -1px); }
            82% { transform: translate(1px, 0.5px); }
            84% { transform: translate(-0.5px, 0.5px); }
            86% { transform: translate(0.5px, -0.5px); }
            88%, 100% { transform: translate(0, 0); }
          }
          
          @keyframes pulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.2); }
          }
          
          @keyframes restart {
            0%, 95% { opacity: 1; }
            97.5% { opacity: 0.7; }
            100% { opacity: 1; }
          }
          
          :root {
            --animation-duration: 2.2s;
          }
          
          svg {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
          }
          
          .container-fail {
            filter: url(#gooey-fail);
          }
          
          .xmark {
            fill: none;
            stroke: url(#orangeGradient-fail);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            transform-origin: 12px 12px;
            animation: morphToX var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            filter: url(#shadow-fail);
          }
          
          .blob-fail {
            fill: url(#orangeGradient-fail);
            transform-origin: 12px 12px;
            filter: url(#shadow-fail);
          }
          
          #fail-blob1 {
            animation: blob1Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 6px 6px;
          }
          
          #fail-blob2 {
            animation: blob2Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 18px 6px;
          }
          
          #fail-blob3 {
            animation: blob3Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 18px 18px;
          }
          
          #fail-blob4 {
            animation: blob4Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            transform-origin: 6px 18px;
          }
          
          #fail-finalShape {
            transform-origin: 12px 12px;
            animation: finalShake var(--animation-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
          }
        `
          }}
        />
        {/* Main container with gooey filter */}
        <g className="container-fail">
          {/* Morphing square to X */}
          <path className="xmark" d="M7,7 h10 v10 h-10 z" />
          {/* Liquid blobs appearing as corners */}
          <g id="fail-finalShape">
            <path id="fail-blob1" className="blob-fail" d="M8 5a3 3 0 1 0-3 3h3v-3z">
              <animate
                attributeName="d"
                dur="2.2s"
                fill="freeze"
                values="M8 5a3 3 0 1 0-3 3h3v-3z;
                       M8 5a3 3 0 1 0-3 3h3c0.5,-1 0,-2 0,-3z;
                       M8 5a3 3 0 1 0-3 3h3v-3z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
            <path id="fail-blob2" className="blob-fail" d="M16 8h3a3 3 0 1 0-3-3v3z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M16 8h3a3 3 0 1 0-3-3v3z;
                       M16 8h3a3 3 0 1 0-3-3c-1,0.5 -2,0 -3,0 h3z;
                       M16 8h3a3 3 0 1 0-3-3v3z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
            <path id="fail-blob3" className="blob-fail" d="M16 16h3a3 3 0 1 1-3 3v-3z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M16 16h3a3 3 0 1 1-3 3v-3z;
                       M16 16h3a3 3 0 1 1-3 3c-1,-0.5 -2,0 -3,0 h3z;
                       M16 16h3a3 3 0 1 1-3 3v-3z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
            <path id="fail-blob4" className="blob-fail" d="M5 16a3 3 0 1 0 3 3v-3H5z">
              <animate
                attributeName="d"
                dur="2.2s"
                repeatCount="indefinite"
                values="M5 16a3 3 0 1 0 3 3v-3H5z;
                       M5 16a3 3 0 1 0 3 3c0.5,-1 0,-2 0,-3H5z;
                       M5 16a3 3 0 1 0 3 3v-3H5z"
                calcMode="spline"
                keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
              />
            </path>
          </g>
        </g>
      </svg>
    );
  }
  
  
  export function LogoMappr(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        {...props}
      >
        <defs>
          <filter
            id="gooey"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
          </filter>
          <filter
            id="shadow"
            filterUnits="userSpaceOnUse"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx={0}
              dy={0}
              stdDeviation="0.5"
              floodColor="#f97316"
              floodOpacity="0.5"
            />
          </filter>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9736" />
            <stop offset="100%" stopColor="#f05d14" />
          </linearGradient>
        </defs>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "\n    @keyframes morphSquare {\n      0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }\n      15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }\n      30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }\n      40%, 100% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1); }\n    }\n    \n    @keyframes blob1Appear {\n      0%, 30% { transform: translate(0, 0) scale(0); opacity: 0; }\n      40% { transform: translate(-2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      50% { transform: translate(-1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }\n      60%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob2Appear {\n      0%, 35% { transform: translate(0, 0) scale(0); opacity: 0; }\n      45% { transform: translate(2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      55% { transform: translate(1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }\n      65%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob3Appear {\n      0%, 40% { transform: translate(0, 0) scale(0); opacity: 0; }\n      50% { transform: translate(2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      60% { transform: translate(1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }\n      70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob4Appear {\n      0%, 45% { transform: translate(0, 0) scale(0); opacity: 0; }\n      55% { transform: translate(-2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      65% { transform: translate(-1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }\n      75%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes finalRotateAndSplash {\n      0%, 70% { transform: rotate(0deg) scale(1); }\n      75% { transform: rotate(90deg) scale(1.05); }\n      80% { transform: rotate(180deg) scale(0.95); }\n      85% { transform: rotate(270deg) scale(1.02); }\n      90%, 100% { transform: rotate(360deg) scale(1); }\n    }\n    \n    @keyframes pulse {\n      0%, 100% { filter: brightness(1); }\n      50% { filter: brightness(1.2); }\n    }\n    \n    @keyframes restart {\n      0%, 95% { opacity: 1; }\n      97.5% { opacity: 0.7; }\n      100% { opacity: 1; }\n    }\n    \n    :root {\n       }\n        .container {\n           filter: url(#gooey);\n    }\n      .square {\n      fill: url(#orangeGradient);\n      transform-origin: 12px 12px;\n   }\n     .blob {\n      fill: url(#orangeGradient);\n      transform-origin: 12px 12px;\n      filter: url(#shadow);\n    }  "
          }}
        />
        {/* Main container with gooey filter */}
        <g className="container">
          {/* Morphing square */}
          <path className="square" d="M7,7 h10 v10 h-10 z" />
          {/* Liquid blobs appearing as corners */}
          <g id="finalShape">
            <path id="blob1" className="blob" d="M8 5a3 3 0 1 0-3 3h3v-3z">
             
            </path>
            <path id="blob2" className="blob" d="M16 8h3a3 3 0 1 0-3-3v3z">
         
            </path>
            <path id="blob3" className="blob" d="M16 16h3a3 3 0 1 1-3 3v-3z">
         
            </path>
            <path id="blob4" className="blob" d="M5 16a3 3 0 1 0 3 3v-3H5z">
        
            </path>
          </g>
        </g>
      </svg>
    );
  }