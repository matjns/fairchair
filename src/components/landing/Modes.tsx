import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Brain, Trophy, Shuffle, ArrowRight } from 'lucide-react';

const modes = [
  {
    id: 'chore',
    icon: ListChecks,
    title: 'Chore Mode',
    description: 'The more chores you do, the better your chances at the best seat! Track chores and reward responsibility.',
    features: ['Track daily chores', 'Fair point system', 'Motivates kids'],
    gradient: 'from-primary to-primary/70',
  },
  {
    id: 'quiz',
    icon: Brain,
    title: 'Quiz Mode',
    description: 'Answer trivia questions to compete for seats! Choose from different topics and difficulty levels.',
    features: ['Multiple topics', 'Timed challenges', 'Learn while you play'],
    gradient: 'from-accent to-accent/70',
  },
  {
    id: 'random',
    icon: Shuffle,
    title: 'Random/Fair Mode',
    description: 'Let the app randomly assign seats based on preferences while ensuring everyone gets fair turns over time.',
    features: ['Respects preferences', 'Tracks seat history', 'Automatic fairness'],
    gradient: 'from-warning to-warning/70',
  },
];

export const Modes: React.FC = () => {
  const navigate = useNavigate();

  const handleModeClick = (modeId: string) => {
    navigate(`/demo?mode=${modeId}`);
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Three Fun Ways to Decide
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Pick the mode that works best for your family
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {modes.map((mode) => (
            <button 
              key={mode.title}
              onClick={() => handleModeClick(mode.id)}
              className="card-interactive p-8 group text-left cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <mode.icon className="w-8 h-8 text-white" />
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
              <ul className="space-y-3 mb-6">
                {mode.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                <span>Try this mode</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
