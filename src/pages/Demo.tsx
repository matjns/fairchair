import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { Sparkles, ArrowLeft, ArrowRight, Check, Car } from 'lucide-react';

const seatPositions = [
  { id: 'driver', label: 'Driver', row: 'front', position: 'left' },
  { id: 'front-passenger', label: 'Front Passenger', row: 'front', position: 'right' },
  { id: 'back-left', label: 'Back Left', row: 'back', position: 'left' },
  { id: 'back-middle', label: 'Back Middle', row: 'back', position: 'middle' },
  { id: 'back-right', label: 'Back Right', row: 'back', position: 'right' },
];

const Demo: React.FC = () => {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    preferredRow: '',
    preferWindow: false,
    preferEmptyMiddle: false,
  });

  const steps = [
    {
      title: 'Choose Your Preferred Row',
      subtitle: 'Do you prefer sitting in the front or back?',
    },
    {
      title: 'Window or Middle?',
      subtitle: 'Which side seat do you prefer?',
    },
    {
      title: 'Empty Middle Seat?',
      subtitle: 'If the middle seat is empty, would you prefer sitting next to it?',
    },
    {
      title: 'Your Preferences Saved!',
      subtitle: 'Here\'s how FairChair will prioritize your seating.',
    },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <ChairIcon className="w-8 h-8 text-primary" filled />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fair<span className="text-primary">Chair</span>
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-primary">{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-hero transition-all duration-500 rounded-full"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="card-elevated p-8 mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {steps[step].title}
          </h1>
          <p className="text-muted-foreground mb-8">
            {steps[step].subtitle}
          </p>

          {/* Step 0: Row preference */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPreferences({ ...preferences, preferredRow: 'front' })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferredRow === 'front' ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚘</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">Front Row</h3>
                <p className="text-sm text-muted-foreground">Passenger seat next to driver</p>
                {preferences.preferredRow === 'front' && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
              
              <button
                onClick={() => setPreferences({ ...preferences, preferredRow: 'back' })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferredRow === 'back' ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛋️</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">Back Row</h3>
                <p className="text-sm text-muted-foreground">More space in the back</p>
                {preferences.preferredRow === 'back' && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
            </div>
          )}

          {/* Step 1: Window preference */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPreferences({ ...preferences, preferWindow: true })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferWindow ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🪟</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">Window Seat</h3>
                <p className="text-sm text-muted-foreground">Love that view!</p>
                {preferences.preferWindow && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
              
              <button
                onClick={() => setPreferences({ ...preferences, preferWindow: false })}
                className={`card-interactive p-6 text-center ${
                  !preferences.preferWindow && preferences.preferredRow ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🧍</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">Middle Seat</h3>
                <p className="text-sm text-muted-foreground">Cozy in the center</p>
                {!preferences.preferWindow && preferences.preferredRow && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
            </div>
          )}

          {/* Step 2: Empty middle preference */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPreferences({ ...preferences, preferEmptyMiddle: true })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferEmptyMiddle ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">Yes!</h3>
                <p className="text-sm text-muted-foreground">More elbow room is great</p>
                {preferences.preferEmptyMiddle && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
              
              <button
                onClick={() => setPreferences({ ...preferences, preferEmptyMiddle: false })}
                className={`card-interactive p-6 text-center ${
                  !preferences.preferEmptyMiddle && step === 2 ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤷</span>
                </div>
                <h3 className="font-bold text-foreground mb-1">Doesn't Matter</h3>
                <p className="text-sm text-muted-foreground">I'm flexible</p>
              </button>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Car visualization */}
              <div className="bg-muted/50 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Car className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Your Ideal Seat</span>
                </div>
                
                {/* Car seats grid */}
                <div className="max-w-xs mx-auto">
                  {/* Front row */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-muted flex flex-col items-center">
                      <ChairIcon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Driver</span>
                    </div>
                    <div className={`p-4 rounded-xl flex flex-col items-center ${
                      preferences.preferredRow === 'front' ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                    }`}>
                      <ChairIcon 
                        className={`w-8 h-8 ${preferences.preferredRow === 'front' ? 'text-primary' : 'text-muted-foreground'}`} 
                        filled={preferences.preferredRow === 'front'}
                      />
                      <span className={`text-xs mt-1 ${preferences.preferredRow === 'front' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        Passenger
                      </span>
                    </div>
                  </div>
                  
                  {/* Back row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-4 rounded-xl flex flex-col items-center ${
                      preferences.preferredRow === 'back' && preferences.preferWindow ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                    }`}>
                      <ChairIcon 
                        className={`w-8 h-8 ${preferences.preferredRow === 'back' && preferences.preferWindow ? 'text-primary' : 'text-muted-foreground'}`}
                        filled={preferences.preferredRow === 'back' && preferences.preferWindow}
                      />
                      <span className={`text-xs mt-1 ${preferences.preferredRow === 'back' && preferences.preferWindow ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        Left
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl flex flex-col items-center ${
                      preferences.preferredRow === 'back' && !preferences.preferWindow ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                    }`}>
                      <ChairIcon 
                        className={`w-8 h-8 ${preferences.preferredRow === 'back' && !preferences.preferWindow ? 'text-primary' : 'text-muted-foreground'}`}
                        filled={preferences.preferredRow === 'back' && !preferences.preferWindow}
                      />
                      <span className={`text-xs mt-1 ${preferences.preferredRow === 'back' && !preferences.preferWindow ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        Middle
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl flex flex-col items-center ${
                      preferences.preferredRow === 'back' && preferences.preferWindow ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                    }`}>
                      <ChairIcon 
                        className={`w-8 h-8 ${preferences.preferredRow === 'back' && preferences.preferWindow ? 'text-primary' : 'text-muted-foreground'}`}
                        filled={preferences.preferredRow === 'back' && preferences.preferWindow}
                      />
                      <span className={`text-xs mt-1 ${preferences.preferredRow === 'back' && preferences.preferWindow ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        Right
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span>🚗</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred row</p>
                    <p className="font-semibold text-foreground capitalize">{preferences.preferredRow} row</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span>{preferences.preferWindow ? '🪟' : '🧍'}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seat position</p>
                    <p className="font-semibold text-foreground">{preferences.preferWindow ? 'Window seat' : 'Middle seat'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <span>{preferences.preferEmptyMiddle ? '✅' : '🤷'}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Empty middle seat bonus</p>
                    <p className="font-semibold text-foreground">{preferences.preferEmptyMiddle ? 'Yes, prefer it!' : 'No preference'}</p>
                  </div>
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to="/auth">
                  Create Your Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {step < 3 && (
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              variant="hero"
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={step === 0 && !preferences.preferredRow}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Demo;
