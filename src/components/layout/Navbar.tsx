import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { Sparkles, Menu, X, Users } from 'lucide-react';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <ChairIcon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" filled />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fair<span className="text-primary">Chair</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/demo" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link 
              to="/family-profiles" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              Family
            </Link>
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Log In
            </Button>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link 
                to="/demo" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                to="/family-profiles" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                Family Profiles
              </Link>
              <Button variant="ghost" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                Log In
              </Button>
              <Button variant="hero" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
