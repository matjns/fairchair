import React from 'react';
import { UserPlus, Users, Settings2, Gamepad2 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Account',
    description: 'Sign up in seconds and create your family profile.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    title: 'Add Family Members',
    description: 'Invite everyone who rides together - kids, parents, grandparents!',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Settings2,
    title: 'Set Preferences',
    description: 'Each person sets their seating preferences - window, middle, front, back.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Gamepad2,
    title: 'Choose Your Mode',
    description: 'Pick Chore Mode or Quiz Mode to fairly decide who gets which seat!',
    color: 'bg-warning/10 text-warning',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get your family set up in minutes and start having fair car rides!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="card-elevated p-6 relative group hover:scale-105 transition-transform duration-300"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-button">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4`}>
                <step.icon className="w-7 h-7" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>

              {/* Connector line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
