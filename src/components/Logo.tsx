import React from 'react';
import { ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  variant?: 'main' | 'alt';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  style, 
  variant = 'main' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 22 };
      case 'medium':
        return { width: 120, height: 32 };
      case 'large':
        return { width: 180, height: 48 };
      case 'xlarge':
        return { width: 240, height: 64 };
      default:
        return { width: 120, height: 32 };
    }
  };

  // SVG content for the logos
  const getSvgContent = () => {
    switch (variant) {
      case 'alt':
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
    <!-- Palette: champagne‑gold on transparent -->
    <g fill="#D4AF37">
        <!-- Stylised 'C' with integrated play‑button motif -->
        <path d="M90 30
                 A70 70 0 1 0 90 170" stroke="#D4AF37" stroke-width="8" fill="none" stroke-linecap="round"/>
        <polygon points="90,60 130,100 90,140"/>
    </g>

    <!-- Word‑mark - adjusted positioning and simplified -->
    <text x="160" y="140"
          font-family="Arial, sans-serif"
          font-size="80"
          fill="#D4AF37"
          font-weight="bold">
        ineMatch
    </text>
</svg>`;
      default:
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="551.08" height="148" viewBox="0 0 551.08 148">
  <g>
    <path d="M74,4C35.34,4,4,35.34,4,74s31.34,70,70,70" fill="none" stroke="#d4af37" stroke-linecap="round" stroke-width="8"/>
    <polygon points="74 34 114 74 74 114 74 34" fill="#d4af37"/>
  </g>
  <text x="134" y="109" font-family="Arial, sans-serif" font-size="96" fill="#d4af37" letter-spacing="0.04em">ineMatch</text>
</svg>`;
    }
  };

  return (
    <SvgXml
      xml={getSvgContent()}
      width={getSize().width}
      height={getSize().height}
      style={style}
    />
  );
};

export default Logo; 