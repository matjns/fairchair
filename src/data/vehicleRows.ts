// Vehicles with 3 rows (minivans, large SUVs, etc.)
// This is a comprehensive list - vehicles not in this list are assumed to have 2 rows

// Seat configuration: [front, middle, back] - represents seats per row
// Default 3-row config is [2, 3, 3] = 8 seats
// Default 2-row config is [2, 3] = 5 seats

export interface VehicleSeatConfig {
  rows: number;
  seatsPerRow: number[]; // [front, middle, back?]
}

// Vehicles with custom seat configurations (not the default 2-3-3)
export const vehicleSeatConfigs: Record<string, Record<string, VehicleSeatConfig>> = {
  'Toyota': {
    'Sienna': { rows: 3, seatsPerRow: [2, 2, 3] }, // 7 seats (2 front, 2 captain's chairs in middle, 3-seat bench in back)
    '4Runner': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
    'Highlander': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7-8 seats depending on config, using 7 as common
    'Grand Highlander': { rows: 3, seatsPerRow: [2, 3, 3] }, // 8 seats
    'Sequoia': { rows: 3, seatsPerRow: [2, 3, 3] }, // 8 seats
    'Land Cruiser': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
  },
  'Honda': {
    'Odyssey': { rows: 3, seatsPerRow: [2, 3, 3] }, // 8 seats
    'Pilot': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7-8 seats, using 7 as common
    'Passport': { rows: 2, seatsPerRow: [2, 3] }, // 5 seats (2-row only)
  },
  'Chrysler': {
    'Pacifica': { rows: 3, seatsPerRow: [2, 2, 3] }, // 7 seats with Stow 'n Go
    'Pacifica Hybrid': { rows: 3, seatsPerRow: [2, 2, 3] },
    'Voyager': { rows: 3, seatsPerRow: [2, 3, 2] },
  },
  'Kia': {
    'Carnival': { rows: 3, seatsPerRow: [2, 3, 3] }, // 8 seats
    'Sorento': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
    'Telluride': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7-8 seats
    'EV9': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
  },
  'Hyundai': {
    'Palisade': { rows: 3, seatsPerRow: [2, 3, 3] }, // 8 seats
    'Santa Fe': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
  },
  'Mazda': {
    'CX-9': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
    'CX-90': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7-8 seats
  },
  'Subaru': {
    'Ascent': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7-8 seats
  },
  'Volkswagen': {
    'Atlas': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
    'Atlas Cross Sport': { rows: 2, seatsPerRow: [2, 3] }, // 5 seats (2-row only)
    'ID. Buzz': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
    'Tiguan': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7 seats
  },
  'Nissan': {
    'Pathfinder': { rows: 3, seatsPerRow: [2, 3, 2] }, // 7-8 seats
    'Armada': { rows: 3, seatsPerRow: [2, 3, 3] }, // 8 seats
  },
};

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

export function getVehicleSeatConfig(make: string, model: string): VehicleSeatConfig {
  // Check for custom configuration first
  const customConfig = vehicleSeatConfigs[make]?.[model];
  if (customConfig) {
    return customConfig;
  }
  
  // Check if it's a 3-row vehicle with default config
  const threeRowModels = threeRowVehicles[make];
  if (threeRowModels && threeRowModels.includes(model)) {
    return { rows: 3, seatsPerRow: [2, 3, 3] }; // Default 8-seat config
  }
  
  // Default 2-row config
  return { rows: 2, seatsPerRow: [2, 3] }; // Default 5-seat config
}

export function getVehicleRowCount(make: string, model: string): number {
  return getVehicleSeatConfig(make, model).rows;
}

export function isThreeRowVehicle(make: string, model: string): boolean {
  return getVehicleRowCount(make, model) === 3;
}

export function getTotalSeats(make: string, model: string): number {
  const config = getVehicleSeatConfig(make, model);
  return config.seatsPerRow.reduce((sum, seats) => sum + seats, 0);
}

// Canonical seat id + label given the seat's position in the layout.
export function getSeatDescriptor(
  rowIdx: number,
  colIdx: number,
  totalRows: number,
  seatsInRow: number,
): { id: string; rowName: string; colName: string; label: string } {
  const rowName =
    totalRows === 3
      ? ['front', 'middle', 'back'][rowIdx]
      : ['front', 'back'][rowIdx];
  let colName: string;
  if (seatsInRow === 2) colName = colIdx === 0 ? 'left' : 'right';
  else if (seatsInRow === 3) colName = ['left', 'middle', 'right'][colIdx];
  else colName = String(colIdx);
  const rowLabel = rowName.charAt(0).toUpperCase() + rowName.slice(1);
  const colLabel = colName.charAt(0).toUpperCase() + colName.slice(1);
  return { id: `${rowName}-${colName}`, rowName, colName, label: `${rowLabel} ${colLabel}` };
}

// All non-front seat choices a kid can pick as their favorite.
// (Front seats are reserved for adults.)
export const FAVORITE_SEAT_OPTIONS: { id: string; label: string }[] = [
  { id: 'middle-left', label: 'Middle Row · Left' },
  { id: 'middle-middle', label: 'Middle Row · Middle' },
  { id: 'middle-right', label: 'Middle Row · Right' },
  { id: 'back-left', label: 'Back Row · Left' },
  { id: 'back-middle', label: 'Back Row · Middle' },
  { id: 'back-right', label: 'Back Row · Right' },
];
