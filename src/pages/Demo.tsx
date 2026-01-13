import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChairIcon } from '@/components/icons/ChairIcon';
import { Sparkles, ArrowLeft, ArrowRight, Check, Car, Sofa, LayoutGrid, User, CheckCircle, HelpCircle, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { carMakes, carModels } from '@/data/carData';
import { isThreeRowVehicle, getVehicleSeatConfig, getTotalSeats, VehicleSeatConfig } from '@/data/vehicleRows';

const Demo: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [hasThreeRows, setHasThreeRows] = useState(false);
  const [seatConfig, setSeatConfig] = useState<VehicleSeatConfig>({ rows: 2, seatsPerRow: [2, 3] });
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [preferences, setPreferences] = useState({
    preferredRow: '',
    preferWindow: false,
    preferEmptyMiddle: false,
  });

  // Check if user is logged in and fetch their vehicle
  useEffect(() => {
    const fetchUserVehicle = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: vehicles, error } = await supabase
            .from('vehicles')
            .select('make, model')
            .eq('user_id', session.user.id)
            .limit(1);
          
          if (!error && vehicles && vehicles.length > 0) {
            setCarMake(vehicles[0].make);
            setCarModel(vehicles[0].model);
            const config = getVehicleSeatConfig(vehicles[0].make, vehicles[0].model);
            setHasThreeRows(config.rows === 3);
            setSeatConfig(config);
            setStep(1); // Skip car selection if already have vehicle
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      }
      setLoadingVehicle(false);
    };
    
    fetchUserVehicle();
  }, []);

  // Update row count and seat config when car changes
  useEffect(() => {
    if (carMake && carModel) {
      const config = getVehicleSeatConfig(carMake, carModel);
      setHasThreeRows(config.rows === 3);
      setSeatConfig(config);
    }
  }, [carMake, carModel]);

  // Check if selected row has a middle seat
  const getSeatsInSelectedRow = () => {
    if (!preferences.preferredRow) return 3;
    const rowIndex = preferences.preferredRow === 'front' ? 0 : 
                     preferences.preferredRow === 'middle' ? 1 : 
                     hasThreeRows ? 2 : 1;
    return seatConfig.seatsPerRow[rowIndex] || 3;
  };
  
  const selectedRowHasMiddleSeat = getSeatsInSelectedRow() >= 3;

  const getSteps = () => {
    const baseSteps = [
      {
        title: 'Select Your Vehicle',
        subtitle: 'Tell us about your car so we can show the right seating options.',
      },
      {
        title: 'Choose Your Preferred Row',
        subtitle: hasThreeRows 
          ? 'Your vehicle has 3 rows. Which row do you prefer?' 
          : 'Do you prefer sitting in the front or back?',
      },
      {
        title: selectedRowHasMiddleSeat ? 'Window or Middle?' : 'Left or Right Side?',
        subtitle: selectedRowHasMiddleSeat 
          ? 'Which side seat do you prefer?'
          : `The ${preferences.preferredRow} row has 2 seats. Which side do you prefer?`,
      },
    ];
    
    // Only add "Empty Middle Seat" step if the selected row has a middle seat
    if (selectedRowHasMiddleSeat) {
      baseSteps.push({
        title: 'Empty Middle Seat?',
        subtitle: 'If the middle seat is empty, would you prefer sitting next to it?',
      });
    }
    
    baseSteps.push({
      title: 'Your Preferences Saved!',
      subtitle: 'Here\'s how FairChair will prioritize your seating.',
    });
    
    return baseSteps;
  };

  const steps = getSteps();

  // Show loading state while checking for existing vehicle
  if (loadingVehicle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <ChairIcon className="w-10 h-10 text-primary animate-pulse" filled />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent" />
          </div>
          <span className="text-xl font-bold text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

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

          {/* Step 0: Vehicle selection */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="carMake">Car Make</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
                  <Select 
                    value={carMake} 
                    onValueChange={(value) => {
                      setCarMake(value);
                      setCarModel('');
                    }}
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select car make" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      {carMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carModel">Car Model</Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
                  <Select 
                    value={carModel} 
                    onValueChange={setCarModel}
                    disabled={!carMake}
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder={carMake ? "Select car model" : "Select make first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-50">
                      {carMake && carModels[carMake]?.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {carMake && carModel && (
                <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    Your {carMake} {carModel} has{' '}
                    <span className="font-semibold text-foreground">
                      {getTotalSeats(carMake, carModel)} seats
                    </span>
                    {' '}({seatConfig.rows} rows: {seatConfig.seatsPerRow.join('-')} configuration).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Row preference */}
          {step === 1 && (
            <div className={`grid ${hasThreeRows ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
              <button
                onClick={() => setPreferences({ ...preferences, preferredRow: 'front' })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferredRow === 'front' ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">Front Row</h3>
                <p className="text-sm text-muted-foreground">Passenger seat</p>
                {preferences.preferredRow === 'front' && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
              
              {hasThreeRows && (
                <button
                  onClick={() => setPreferences({ ...preferences, preferredRow: 'middle' })}
                  className={`card-interactive p-6 text-center ${
                    preferences.preferredRow === 'middle' ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">Middle Row</h3>
                  <p className="text-sm text-muted-foreground">Second row seats</p>
                  {preferences.preferredRow === 'middle' && (
                    <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                  )}
                </button>
              )}
              
              <button
                onClick={() => setPreferences({ ...preferences, preferredRow: 'back' })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferredRow === 'back' ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Sofa className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{hasThreeRows ? 'Back Row' : 'Back Row'}</h3>
                <p className="text-sm text-muted-foreground">{hasThreeRows ? 'Third row seats' : 'More space in the back'}</p>
                {preferences.preferredRow === 'back' && (
                  <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                )}
              </button>
            </div>
          )}

          {/* Step 2: Window preference */}
          {step === 2 && (() => {
            // Get the number of seats in the selected row
            const rowIndex = preferences.preferredRow === 'front' ? 0 : 
                             preferences.preferredRow === 'middle' ? 1 : 
                             hasThreeRows ? 2 : 1;
            const seatsInRow = seatConfig.seatsPerRow[rowIndex] || 3;
            const hasMiddleSeat = seatsInRow >= 3;
            
            // If no middle seat in this row, show left/right window preference instead
            if (!hasMiddleSeat) {
              return (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-xl mb-4">
                    <p className="text-sm text-muted-foreground text-center">
                      The {preferences.preferredRow} row has {seatsInRow} seats (both window seats - no middle seat).
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, preferWindow: true })}
                      className={`card-interactive p-6 text-center ${
                        preferences.preferWindow ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <LayoutGrid className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">Left Side</h3>
                      <p className="text-sm text-muted-foreground">Behind the driver</p>
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
                        <LayoutGrid className="w-8 h-8 text-accent" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">Right Side</h3>
                      <p className="text-sm text-muted-foreground">Behind the passenger</p>
                      {!preferences.preferWindow && preferences.preferredRow && (
                        <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                      )}
                    </button>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPreferences({ ...preferences, preferWindow: true })}
                  className={`card-interactive p-6 text-center ${
                    preferences.preferWindow ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-primary" />
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
                    <User className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">Middle Seat</h3>
                  <p className="text-sm text-muted-foreground">Cozy in the center</p>
                  {!preferences.preferWindow && preferences.preferredRow && (
                    <Check className="w-5 h-5 text-primary mx-auto mt-3" />
                  )}
                </button>
              </div>
            );
          })()}

          {/* Step 3: Empty middle preference - only shown if row has middle seat */}
          {step === 3 && selectedRowHasMiddleSeat && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPreferences({ ...preferences, preferEmptyMiddle: true })}
                className={`card-interactive p-6 text-center ${
                  preferences.preferEmptyMiddle ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
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
                  !preferences.preferEmptyMiddle && step === 3 ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-1">Doesn't Matter</h3>
                <p className="text-sm text-muted-foreground">I'm flexible</p>
              </button>
            </div>
          )}

          {/* Summary Step - last step */}
          {step === steps.length - 1 && (
            <div className="space-y-6">
              {/* Car visualization */}
              <div className="bg-muted/50 rounded-2xl p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Car className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {carMake} {carModel} ({getTotalSeats(carMake, carModel)} seats) - Your Ideal Seat
                  </span>
                </div>
                
                {/* Car seats grid */}
                <div className="max-w-xs mx-auto">
                  {/* Front row - always 2 seats */}
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
                  
                  {/* Middle row (for 3-row vehicles) */}
                  {hasThreeRows && (
                    <div className={`grid gap-3 mb-4`} style={{ gridTemplateColumns: `repeat(${seatConfig.seatsPerRow[1]}, minmax(0, 1fr))` }}>
                      {Array.from({ length: seatConfig.seatsPerRow[1] }).map((_, index) => {
                        const isLeft = index === 0;
                        const isRight = index === seatConfig.seatsPerRow[1] - 1;
                        const isMiddle = !isLeft && !isRight;
                        const isHighlighted = preferences.preferredRow === 'middle' && 
                          ((preferences.preferWindow && (isLeft || isRight)) || (!preferences.preferWindow && isMiddle));
                        const seatLabel = seatConfig.seatsPerRow[1] === 2 
                          ? (isLeft ? 'Left' : 'Right')
                          : (isLeft ? 'Left' : isRight ? 'Right' : 'Middle');
                        
                        return (
                          <div key={index} className={`p-4 rounded-xl flex flex-col items-center ${
                            isHighlighted ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                          }`}>
                            <ChairIcon 
                              className={`w-8 h-8 ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}
                              filled={isHighlighted}
                            />
                            <span className={`text-xs mt-1 ${isHighlighted ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                              {seatLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Back row - dynamic based on seat config */}
                  {(() => {
                    const backRowSeats = hasThreeRows ? seatConfig.seatsPerRow[2] : seatConfig.seatsPerRow[1];
                    return (
                      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${backRowSeats}, minmax(0, 1fr))` }}>
                        {Array.from({ length: backRowSeats }).map((_, index) => {
                          const isLeft = index === 0;
                          const isRight = index === backRowSeats - 1;
                          const isMiddle = !isLeft && !isRight;
                          const isHighlighted = preferences.preferredRow === 'back' && 
                            ((preferences.preferWindow && (isLeft || isRight)) || (!preferences.preferWindow && isMiddle));
                          const seatLabel = backRowSeats === 2 
                            ? (isLeft ? 'Left' : 'Right')
                            : (isLeft ? 'Left' : isRight ? 'Right' : 'Middle');
                          
                          return (
                            <div key={index} className={`p-4 rounded-xl flex flex-col items-center ${
                              isHighlighted ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted'
                            }`}>
                              <ChairIcon 
                                className={`w-8 h-8 ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}
                                filled={isHighlighted}
                              />
                              <span className={`text-xs mt-1 ${isHighlighted ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                                {seatLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Preferences summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preferred row</p>
                    <p className="font-semibold text-foreground capitalize">{preferences.preferredRow} row</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seat position</p>
                    <p className="font-semibold text-foreground">
                      {selectedRowHasMiddleSeat 
                        ? (preferences.preferWindow ? 'Window seat' : 'Middle seat')
                        : (preferences.preferWindow ? 'Left side' : 'Right side')
                      }
                    </p>
                  </div>
                </div>
                {selectedRowHasMiddleSeat && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      {preferences.preferEmptyMiddle ? <CheckCircle className="w-5 h-5 text-success" /> : <HelpCircle className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Empty middle seat bonus</p>
                      <p className="font-semibold text-foreground">{preferences.preferEmptyMiddle ? 'Yes, prefer it!' : 'No preference'}</p>
                    </div>
                  </div>
                )}
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
        {step < steps.length - 1 && (
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => {
                if (step === 0) {
                  navigate('/');
                } else {
                  setStep(step - 1);
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              variant="hero"
              onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
              disabled={(step === 0 && (!carMake || !carModel)) || (step === 1 && !preferences.preferredRow)}
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
