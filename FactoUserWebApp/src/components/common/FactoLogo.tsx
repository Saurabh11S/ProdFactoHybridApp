import React from 'react';

interface FactoLogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const FactoLogo: React.FC<FactoLogoProps> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  style = {}
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Premium Fintech Gradient - Blue to Deep Blue */}
        <linearGradient id="factoPremiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#007AFF', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#0056CC', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#003D99', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Accent gradient for rupee symbol */}
        <linearGradient id="factoAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00D4FF', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#007AFF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0056CC', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Shadow filter for depth */}
        <filter id="factoShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="1" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* FACTO curved on top - more pronounced curve */}
      <path id="factoTopCurve" d="M 20 60 Q 100 20, 180 60" fill="none"/>
      <text 
        fontFamily="'Segoe UI', 'Roboto', 'Arial', sans-serif" 
        fontSize="24" 
        fontWeight="700" 
        fill="url(#factoPremiumGradient)" 
        filter="url(#factoShadow)"
        letterSpacing="2"
      >
        <textPath href="#factoTopCurve" startOffset="50%" textAnchor="middle" method="align" spacing="auto">
          <tspan dy="-4">FACTO</tspan>
        </textPath>
      </text>
      
      {/* FACTO curved on bottom - inverted curve */}
      <path id="factoBottomCurve" d="M 20 140 Q 100 180, 180 140" fill="none"/>
      <text 
        fontFamily="'Segoe UI', 'Roboto', 'Arial', sans-serif" 
        fontSize="24" 
        fontWeight="700" 
        fill="url(#factoPremiumGradient)" 
        filter="url(#factoShadow)"
        letterSpacing="2"
      >
        <textPath href="#factoBottomCurve" startOffset="50%" textAnchor="middle" method="align" spacing="auto">
          <tspan dy="4">FACTO</tspan>
        </textPath>
      </text>
      
      {/* ₹ symbol in the center - larger and prominent */}
      <text 
        x="100" 
        y="108" 
        fontFamily="'Segoe UI', 'Roboto', 'Arial', sans-serif" 
        fontSize="68" 
        fontWeight="700" 
        fill="url(#factoAccentGradient)" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        filter="url(#factoShadow)"
      >
        ₹
      </text>
    </svg>
  );
};

export default FactoLogo;

