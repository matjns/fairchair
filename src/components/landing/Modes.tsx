import React from 'react';
import { ListChecks, Brain, Trophy } from 'lucide-react';

const modes = [
  {
    icon: ListChecks,
    title: 'Chore Mode',
    emoji: '🧹',
    description: 'The more chores you do, the better your chances at the best seat! Track chores and reward responsibility.',
    features: ['Track daily chores', 'Fair point system', 'Motivates kids'],
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Brain,
    title: 'Quiz Mode',
    emoji: '🧠',
    description: 'Answer trivia questions to compete for seats! Choose from different topics and difficulty levels.',
    features: ['Multiple topics', 'Timed challenges', 'Learn while you play'],
    gradient: 'from-accent to-accent/70',
  },
];

export const Modes: React.FC = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Two Fun Ways to Decide
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pick the mode that works best for your family
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {modes.map((mode) => (
            <div 
              key={mode.title}
              className="card-interactive p-8 group"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{mode.emoji}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {mode.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {mode.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {mode.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
