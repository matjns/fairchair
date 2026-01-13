import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Modes } from '@/components/landing/Modes';
import { Footer } from '@/components/landing/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Modes />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
