import React from 'react';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <ChairIcon className="w-8 h-8 text-primary" filled />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fair<span className="text-primary">Chair</span>
            </span>
          </div>

          {/* Tagline */}
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-accent fill-accent" /> for families everywhere
          </p>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} FairChair. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
