import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CarIcon } from '@/components/icons/CarIcon';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { ArrowRight, Users, Sparkles, Car, UserCircle, ListChecks, Brain, Shuffle, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warning/5 rounded-full blur-3xl" />
      </div>

      {/* Animated car */}
      <div className="absolute bottom-32 left-0 animate-car-drive opacity-20 pointer-events-none">
        <CarIcon className="w-32 h-16" />
      </div>

      <div className="relative z-30 max-w-5xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in-up">
          <div className="relative">
            <ChairIcon className="w-12 h-12 text-primary" filled />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-bounce-gentle" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
            Fair<span className="text-primary">Chair</span>
          </h1>
        </div>

        {/* Tagline */}
        <h2 
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 text-balance animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          No More Fighting Over
          <span className="block text-primary mt-2">The Best Seat!</span>
        </h2>

        <p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          The fun and fair way for families to decide who sits where. 
          Use quizzes, track chores, and let everyone get their turn at the window seat!
        </p>

        {/* CTA Buttons - Only show when not logged in */}
        {isLoggedIn === false && (
          <div 
            className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button 
              type="button"
              variant="hero" 
              size="xl"
              onClick={() => navigate('/auth')}
              className="group cursor-pointer"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="xl"
              onClick={() => navigate('/demo')}
              className="cursor-pointer"
            >
              See How It Works
            </Button>
          </div>
        )}

        {/* Show different CTA when logged in */}
        {isLoggedIn === true && (
          <div 
            className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button 
              type="button"
              variant="hero" 
              size="xl"
              onClick={() => navigate('/quiz-mode')}
              className="group cursor-pointer"
            >
              Start a Quiz Battle
              <Brain className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              type="button"
              variant="outline" 
              size="xl"
              onClick={() => navigate('/family-profiles')}
              className="cursor-pointer"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Family
            </Button>
          </div>
        )}

        {/* Feature pills */}
        <div 
          className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <FeaturePill icon={Car} text="Multiple Vehicles" />
          <FeaturePill icon={Users} text="Family Profiles" />
          <FeaturePill icon={ListChecks} text="Chore Tracking" />
          <FeaturePill icon={Brain} text="Fun Quizzes" />
          <FeaturePill icon={Shuffle} text="Random/Fair" />
        </div>
      </div>

      {/* Floating seat illustrations */}
      <div className="absolute top-1/4 left-10 hidden lg:block animate-bounce-gentle pointer-events-none" style={{ animationDelay: '0.5s' }}>
        <div className="card-elevated p-4 rotate-[-12deg]">
          <ChairIcon className="w-10 h-10 text-primary" filled />
        </div>
      </div>
      <div className="absolute top-1/3 right-16 hidden lg:block animate-bounce-gentle pointer-events-none" style={{ animationDelay: '1s' }}>
        <div className="card-elevated p-4 rotate-[8deg]">
          <ChairIcon className="w-10 h-10 text-accent" />
        </div>
      </div>
      <div className="absolute bottom-1/3 right-24 hidden lg:block animate-bounce-gentle pointer-events-none" style={{ animationDelay: '1.5s' }}>
        <div className="card-elevated p-4 rotate-[-5deg]">
          <Users className="w-10 h-10 text-success" />
        </div>
      </div>
    </section>
  );
};

const FeaturePill: React.FC<{ icon: LucideIcon; text: string }> = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 bg-card shadow-soft rounded-full px-4 py-2 border border-border/50">
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-sm font-medium text-foreground">{text}</span>
  </div>
);
