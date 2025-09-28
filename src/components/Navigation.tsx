import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
  showHome?: boolean;
  showBack?: boolean;
  customBackAction?: () => void;
  customHomeAction?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  className,
  showHome = true,
  showBack = true,
  customBackAction,
  customHomeAction
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';

  const handleBack = () => {
    if (customBackAction) {
      customBackAction();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    if (customHomeAction) {
      customHomeAction();
    } else {
      navigate('/');
    }
  };

  // Don't show navigation on home page unless explicitly requested
  if (isHomePage && !showHome && !showBack) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showBack && !isHomePage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      
      {showHome && !isHomePage && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleHome}
          className="text-muted-foreground hover:text-foreground h-10 w-10"
        >
          <Home className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};