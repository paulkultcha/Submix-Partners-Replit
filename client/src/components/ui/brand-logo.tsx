import { cn } from "@/lib/utils";
import submixLogoWhite from "@assets/Logo Submix-2_1752241965983.png";
import submixLogoBlack from "@assets/Logo Submix-1_1752241965983.png";
import submixLogoWhiteStacked from "@assets/Logo Submix_1752241965984.png";
import submixLogoBlackHorizontal from "@assets/Logo Submix-3_1752241965984.png";
import submixFavicon from "@assets/Favicon 180x180_1752241965983.png";

interface BrandLogoProps {
  variant?: 'default' | 'white' | 'dark' | 'favicon' | 'stacked' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function BrandLogo({ variant = 'default', size = 'md', className }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-10 w-auto',
    xl: 'h-12 w-auto',
  };

  const logoSources = {
    default: submixLogoBlack,
    white: submixLogoWhite,
    dark: submixLogoBlack,
    favicon: submixFavicon,
    stacked: submixLogoWhiteStacked,
    horizontal: submixLogoBlackHorizontal,
  };

  return (
    <img 
      src={logoSources[variant]} 
      alt="Submix Logo" 
      className={cn(sizeClasses[size], className)}
    />
  );
}

// Favicon component for browser tab
export function BrandFavicon({ size = 'md', className }: Pick<BrandLogoProps, 'size' | 'className'>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  return (
    <img 
      src={submixFavicon} 
      alt="Submix" 
      className={cn(sizeClasses[size], 'rounded', className)}
    />
  );
}