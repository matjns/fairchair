// Vehicles with 3 rows (minivans, large SUVs, etc.)
// This is a comprehensive list - vehicles not in this list are assumed to have 2 rows

export const threeRowVehicles: Record<string, string[]> = {
  // American brands
  'Buick': ['Enclave'],
  'Cadillac': ['Escalade', 'Escalade ESV', 'XT6'],
  'Chevrolet': ['Suburban', 'Tahoe', 'Traverse', 'Blazer EV'],
  'Chrysler': ['Pacifica', 'Pacifica Hybrid', 'Voyager', 'Grand Caravan'],
  'Dodge': ['Durango', 'Grand Caravan'],
  'Ford': ['Expedition', 'Expedition MAX', 'Explorer', 'Flex', 'Transit Connect'],
  'GMC': ['Yukon', 'Yukon XL', 'Acadia'],
  'Jeep': ['Grand Cherokee L', 'Wagoneer', 'Grand Wagoneer'],
  'Lincoln': ['Navigator', 'Navigator L', 'Aviator'],
  'Tesla': ['Model X', 'Model Y'],
  
  // German brands
  'Audi': ['Q7', 'Q8'],
  'BMW': ['X5', 'X7'],
  'Mercedes-Benz': ['GLE', 'GLS', 'GLB', 'Metris', 'Sprinter'],
  'Volkswagen': ['Atlas', 'Atlas Cross Sport', 'ID. Buzz', 'Tiguan'],
  
  // Japanese brands
  'Honda': ['Odyssey', 'Pilot', 'Passport'],
  'Infiniti': ['QX60', 'QX80'],
  'Lexus': ['GX', 'LX', 'TX'],
  'Mazda': ['CX-9', 'CX-90'],
  'Mitsubishi': ['Outlander'],
  'Nissan': ['Armada', 'Pathfinder', 'Quest'],
  'Subaru': ['Ascent'],
  'Toyota': ['4Runner', 'Grand Highlander', 'Highlander', 'Land Cruiser', 'Sequoia', 'Sienna'],
  
  // Korean brands
  'Genesis': ['GV80'],
  'Hyundai': ['Palisade', 'Santa Fe'],
  'Kia': ['Carnival', 'Sorento', 'Telluride', 'EV9'],
  
  // European brands
  'Land Rover': ['Defender 130', 'Discovery', 'Range Rover'],
  'Volvo': ['XC90'],
  
  // Chinese brands
  'BYD': ['Tang'],
  'NIO': ['ES8'],
};

export function getVehicleRowCount(make: string, model: string): number {
  const threeRowModels = threeRowVehicles[make];
  if (threeRowModels && threeRowModels.includes(model)) {
    return 3;
  }
  return 2;
}

export function isThreeRowVehicle(make: string, model: string): boolean {
  return getVehicleRowCount(make, model) === 3;
}
