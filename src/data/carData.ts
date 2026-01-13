export const carMakes = [
  // American
  'Buick',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ford',
  'GMC',
  'Jeep',
  'Lincoln',
  'Ram',
  'Tesla',
  
  // German
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Mini',
  'Opel',
  'Porsche',
  'Smart',
  'Volkswagen',
  
  // Japanese
  'Acura',
  'Daihatsu',
  'Honda',
  'Infiniti',
  'Isuzu',
  'Lexus',
  'Mazda',
  'Mitsubishi',
  'Nissan',
  'Scion',
  'Subaru',
  'Suzuki',
  'Toyota',
  
  // Korean
  'Genesis',
  'Hyundai',
  'Kia',
  'SsangYong',
  
  // Italian
  'Alfa Romeo',
  'Ferrari',
  'Fiat',
  'Lamborghini',
  'Maserati',
  
  // French
  'Citroën',
  'DS',
  'Peugeot',
  'Renault',
  
  // British
  'Aston Martin',
  'Bentley',
  'Jaguar',
  'Land Rover',
  'Lotus',
  'McLaren',
  'MG',
  'Rolls-Royce',
  'Vauxhall',
  
  // Swedish
  'Koenigsegg',
  'Polestar',
  'Saab',
  'Volvo',
  
  // Chinese
  'BYD',
  'Changan',
  'Chery',
  'Dongfeng',
  'FAW',
  'Geely',
  'Great Wall',
  'Haval',
  'Hongqi',
  'Li Auto',
  'Lynk & Co',
  'NIO',
  'Ora',
  'Wuling',
  'XPeng',
  'Zeekr',
  
  // Indian
  'Mahindra',
  'Maruti Suzuki',
  'Tata',
  
  // Other
  'Cupra',
  'Dacia',
  'Lada',
  'Lucid',
  'Rivian',
  'Seat',
  'Skoda',
  'VinFast',
] as const;

export const carModels: Record<string, string[]> = {
  // American
  'Buick': ['Enclave', 'Encore', 'Encore GX', 'Envision', 'Envista', 'LaCrosse', 'Regal'],
  'Cadillac': ['CT4', 'CT5', 'CT6', 'Escalade', 'Escalade ESV', 'Lyriq', 'Optiq', 'XT4', 'XT5', 'XT6', 'Celestiq'],
  'Chevrolet': ['Avalanche', 'Blazer', 'Bolt EUV', 'Bolt EV', 'Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Express', 'Impala', 'Malibu', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Trax'],
  'Chrysler': ['200', '300', 'Pacifica', 'Voyager'],
  'Dodge': ['Avenger', 'Challenger', 'Charger', 'Dart', 'Durango', 'Grand Caravan', 'Hornet', 'Journey', 'Nitro'],
  'Ford': ['Bronco', 'Bronco Sport', 'C-Max', 'EcoSport', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-150 Lightning', 'F-250', 'F-350', 'Fiesta', 'Flex', 'Focus', 'Fusion', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Taurus', 'Transit', 'Transit Connect'],
  'GMC': ['Acadia', 'Canyon', 'Hummer EV', 'Hummer EV SUV', 'Jimmy', 'Savana', 'Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Terrain', 'Yukon', 'Yukon XL'],
  'Jeep': ['Cherokee', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee L', 'Grand Wagoneer', 'Liberty', 'Patriot', 'Renegade', 'Wagoneer', 'Wrangler', 'Wrangler Unlimited'],
  'Lincoln': ['Aviator', 'Continental', 'Corsair', 'MKC', 'MKS', 'MKT', 'MKX', 'MKZ', 'Nautilus', 'Navigator', 'Navigator L', 'Town Car'],
  'Ram': ['1500', '1500 Classic', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster', 'Semi'],
  
  // German
  'Audi': ['A1', 'A3', 'A4', 'A4 Allroad', 'A5', 'A6', 'A6 Allroad', 'A7', 'A8', 'e-tron', 'e-tron GT', 'e-tron S', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q5 Sportback', 'Q6 e-tron', 'Q7', 'Q8', 'Q8 e-tron', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'RS e-tron GT', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'SQ5', 'SQ7', 'SQ8', 'TT'],
  'BMW': ['1 Series', '2 Series', '2 Series Active Tourer', '2 Series Gran Coupe', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'iX1', 'iX2', 'iX3', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM', 'Z4'],
  'Mercedes-Benz': ['A-Class', 'AMG GT', 'B-Class', 'C-Class', 'CLA', 'CLE', 'CLS', 'E-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV', 'EQV', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLS', 'Maybach GLS', 'Maybach S-Class', 'S-Class', 'SL', 'SLC', 'Sprinter', 'V-Class', 'Vito'],
  'Mini': ['Clubman', 'Convertible', 'Countryman', 'Coupe', 'Electric', 'Hardtop 2 Door', 'Hardtop 4 Door', 'Paceman', 'Roadster'],
  'Opel': ['Adam', 'Ampera', 'Astra', 'Combo', 'Corsa', 'Crossland', 'Grandland', 'Insignia', 'Karl', 'Meriva', 'Mokka', 'Movano', 'Vivaro', 'Zafira'],
  'Porsche': ['718 Boxster', '718 Cayman', '718 Spyder', '911', '918 Spyder', 'Cayenne', 'Cayenne Coupe', 'Macan', 'Panamera', 'Taycan', 'Taycan Cross Turismo', 'Taycan Sport Turismo'],
  'Smart': ['EQ Fortwo', 'EQ Fortwo Cabrio', 'Forfour', 'Fortwo', '#1', '#3'],
  'Volkswagen': ['Amarok', 'Arteon', 'Atlas', 'Atlas Cross Sport', 'Beetle', 'Caddy', 'California', 'CC', 'Crafter', 'e-Golf', 'Golf', 'Golf GTI', 'Golf R', 'ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID.7', 'ID. Buzz', 'Jetta', 'Jetta GLI', 'Multivan', 'Passat', 'Phaeton', 'Polo', 'Scirocco', 'Sharan', 'T-Cross', 'T-Roc', 'Taos', 'Tiguan', 'Tiguan Allspace', 'Touareg', 'Touran', 'Transporter', 'Up'],
  
  // Japanese
  'Acura': ['ILX', 'Integra', 'MDX', 'NSX', 'RDX', 'RLX', 'TL', 'TLX', 'TSX', 'ZDX'],
  'Daihatsu': ['Ayla', 'Boon', 'Cast', 'Copen', 'Gran Max', 'Hijet', 'Mira', 'Move', 'Rocky', 'Sigra', 'Taft', 'Tanto', 'Terios', 'Thor', 'Wake', 'Xenia'],
  'Honda': ['Accord', 'BR-V', 'City', 'Civic', 'Clarity', 'CR-V', 'CR-Z', 'e', 'Element', 'Fit', 'HR-V', 'Insight', 'Jazz', 'N-Box', 'Odyssey', 'Passport', 'Pilot', 'Prologue', 'Ridgeline', 'S2000', 'Vezel', 'WR-V', 'ZR-V'],
  'Infiniti': ['EX', 'FX', 'G', 'JX', 'M', 'Q30', 'Q40', 'Q45', 'Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX55', 'QX60', 'QX70', 'QX80'],
  'Isuzu': ['Ascender', 'D-Max', 'i-Series', 'MU-X', 'Rodeo', 'Trooper', 'VehiCROSS'],
  'Lexus': ['CT', 'ES', 'GS', 'GX', 'HS', 'IS', 'LC', 'LFA', 'LM', 'LS', 'LX', 'NX', 'RC', 'RX', 'RZ', 'SC', 'TX', 'UX'],
  'Mazda': ['2', '3', '5', '6', 'BT-50', 'CX-3', 'CX-30', 'CX-4', 'CX-5', 'CX-50', 'CX-60', 'CX-7', 'CX-70', 'CX-8', 'CX-80', 'CX-9', 'CX-90', 'MX-30', 'MX-5 Miata', 'RX-7', 'RX-8', 'Tribute'],
  'Mitsubishi': ['3000GT', 'ASX', 'Attrage', 'Delica', 'Eclipse', 'Eclipse Cross', 'Endeavor', 'Galant', 'i-MiEV', 'L200', 'Lancer', 'Mirage', 'Montero', 'Outlander', 'Outlander PHEV', 'Outlander Sport', 'Pajero', 'Pajero Sport', 'RVR', 'Triton', 'Xpander'],
  'Nissan': ['350Z', '370Z', 'Altima', 'Ariya', 'Armada', 'Cube', 'Frontier', 'GT-R', 'Juke', 'Kicks', 'Leaf', 'Maxima', 'Micra', 'Murano', 'Navara', 'Note', 'NV', 'NV200', 'Pathfinder', 'Patrol', 'Pulsar', 'Qashqai', 'Quest', 'Rogue', 'Rogue Sport', 'Sentra', 'Sylphy', 'Terra', 'Titan', 'Titan XD', 'Versa', 'X-Trail', 'Z'],
  'Scion': ['FR-S', 'iA', 'iM', 'iQ', 'tC', 'xA', 'xB', 'xD'],
  'Subaru': ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Levorg', 'Outback', 'Sambar', 'Solterra', 'Tribeca', 'WRX', 'XV'],
  'Suzuki': ['Alto', 'Baleno', 'Carry', 'Celerio', 'Ciaz', 'Dzire', 'Ertiga', 'Fronx', 'Grand Vitara', 'Hustler', 'Ignis', 'Jimny', 'Kizashi', 'S-Cross', 'S-Presso', 'Solio', 'Spacia', 'Swift', 'SX4', 'Vitara', 'Wagon R', 'XL6', 'XL7'],
  'Toyota': ['4Runner', '86', 'Alphard', 'Aqua', 'Avalon', 'Avanza', 'Avensis', 'Aygo', 'bZ3', 'bZ4X', 'C-HR', 'Camry', 'Century', 'Corolla', 'Corolla Cross', 'Corolla Hatchback', 'Crown', 'FJ Cruiser', 'Fortuner', 'GR86', 'GR Corolla', 'GR Supra', 'GR Yaris', 'Harrier', 'Hiace', 'Highlander', 'Hilux', 'Innova', 'Land Cruiser', 'Land Cruiser Prado', 'Matrix', 'Mirai', 'Prius', 'Prius Prime', 'Proace', 'RAV4', 'RAV4 Prime', 'Rush', 'Sequoia', 'Sienna', 'Sienta', 'Supra', 'Tacoma', 'Tundra', 'Vellfire', 'Venza', 'Verso', 'Vios', 'Voxy', 'Yaris', 'Yaris Cross'],
  
  // Korean
  'Genesis': ['Electrified G80', 'Electrified GV70', 'G70', 'G80', 'G90', 'GV60', 'GV70', 'GV80', 'GV80 Coupe'],
  'Hyundai': ['Accent', 'Alcazar', 'Atos', 'Azera', 'Bayon', 'Casper', 'Creta', 'Elantra', 'Elantra N', 'Grandeur', 'i10', 'i20', 'i20 N', 'i30', 'i30 N', 'Ioniq', 'Ioniq 5', 'Ioniq 5 N', 'Ioniq 6', 'Kona', 'Kona Electric', 'Kona N', 'Nexo', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Sonata N Line', 'Staria', 'Tucson', 'Veloster', 'Veloster N', 'Venue', 'Verna'],
  'Kia': ['Cadenza', 'Carnival', 'Ceed', 'Cerato', 'Clarus', 'EV3', 'EV5', 'EV6', 'EV9', 'Forte', 'K3', 'K5', 'K8', 'K9', 'Mohave', 'Niro', 'Niro EV', 'Optima', 'Picanto', 'ProCeed', 'Rio', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Stonic', 'Telluride', 'Venga', 'XCeed'],
  'SsangYong': ['Actyon', 'Korando', 'Kyron', 'Musso', 'Rexton', 'Rodius', 'Tivoli', 'Torres', 'XLV'],
  
  // Italian
  'Alfa Romeo': ['147', '156', '159', '166', '4C', 'Brera', 'Giulia', 'Giulietta', 'MiTo', 'Spider', 'Stelvio', 'Tonale'],
  'Ferrari': ['296 GTB', '296 GTS', '488', '812', 'California', 'F12', 'F8', 'LaFerrari', 'Portofino', 'Purosangue', 'Roma', 'SF90'],
  'Fiat': ['124 Spider', '500', '500 Abarth', '500e', '500L', '500X', 'Bravo', 'Doblo', 'Ducato', 'Egea', 'Fiorino', 'Freemont', 'Linea', 'Panda', 'Panda Cross', 'Punto', 'Qubo', 'Scudo', 'Tipo', 'Topolino', 'Toro'],
  'Lamborghini': ['Aventador', 'Centenario', 'Countach', 'Diablo', 'Gallardo', 'Huracan', 'Murcielago', 'Revuelto', 'Sian', 'Urus'],
  'Maserati': ['Ghibli', 'GranCabrio', 'GranTurismo', 'Grecale', 'Levante', 'MC20', 'Quattroporte'],
  
  // French
  'Citroën': ['Ami', 'Berlingo', 'C1', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Picasso', 'C4 X', 'C5', 'C5 Aircross', 'C5 X', 'DS3', 'DS4', 'DS5', 'e-C4', 'e-Mehari', 'Grand C4 Picasso', 'Jumpy', 'SpaceTourer'],
  'DS': ['3', '3 Crossback', '4', '4 Crossback', '5', '7', '7 Crossback', '9'],
  'Peugeot': ['108', '2008', '206', '207', '208', '3008', '301', '308', '4008', '5008', '508', '508 SW', 'Boxer', 'e-2008', 'e-208', 'e-308', 'e-3008', 'e-5008', 'Expert', 'Partner', 'Rifter', 'Traveller'],
  'Renault': ['Arkana', 'Austral', 'Captur', 'Clio', 'Duster', 'Espace', 'Express', 'Fluence', 'Grand Scenic', 'Kadjar', 'Kangoo', 'Koleos', 'Kwid', 'Laguna', 'Latitude', 'Master', 'Megane', 'Megane E-Tech', 'Rafale', 'Scenic', 'Scenic E-Tech', 'Symbol', 'Talisman', 'Trafic', 'Twingo', 'Twizy', 'Zoe'],
  
  // British
  'Aston Martin': ['Cygnet', 'DB11', 'DB12', 'DBS', 'DBX', 'One-77', 'Rapide', 'V8 Vantage', 'V12 Vantage', 'Valkyrie', 'Valhalla', 'Vantage', 'Vanquish', 'Virage', 'Vulcan'],
  'Bentley': ['Azure', 'Bentayga', 'Continental GT', 'Continental GTC', 'Flying Spur', 'Mulsanne'],
  'Jaguar': ['E-Pace', 'E-Type', 'F-Pace', 'F-Type', 'I-Pace', 'S-Type', 'X-Type', 'XE', 'XF', 'XJ', 'XK'],
  'Land Rover': ['Defender', 'Defender 90', 'Defender 110', 'Defender 130', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
  'Lotus': ['Eletre', 'Elise', 'Emeya', 'Emira', 'Evija', 'Evora', 'Exige'],
  'McLaren': ['540C', '570GT', '570S', '600LT', '620R', '650S', '675LT', '720S', '750S', '765LT', 'Artura', 'GT', 'P1', 'Senna', 'Speedtail'],
  'MG': ['3', '4', '5', '6', 'Cyberster', 'GS', 'HS', 'Marvel R', 'MG4', 'MG5', 'MG7', 'ZS', 'ZS EV'],
  'Rolls-Royce': ['Cullinan', 'Dawn', 'Ghost', 'Phantom', 'Spectre', 'Wraith'],
  'Vauxhall': ['Adam', 'Ampera', 'Astra', 'Combo', 'Corsa', 'Crossland', 'Grandland', 'Insignia', 'Meriva', 'Mokka', 'Movano', 'Vivaro', 'Zafira'],
  
  // Swedish
  'Koenigsegg': ['Agera', 'CC', 'CCR', 'CCX', 'Gemera', 'Jesko', 'One:1', 'Regera'],
  'Polestar': ['1', '2', '3', '4', '5', '6'],
  'Saab': ['9-2X', '9-3', '9-4X', '9-5', '9-7X', '900', '9000'],
  'Volvo': ['C30', 'C40', 'C70', 'EX30', 'EX40', 'EX90', 'S40', 'S60', 'S80', 'S90', 'V40', 'V60', 'V60 Cross Country', 'V70', 'V90', 'V90 Cross Country', 'XC40', 'XC60', 'XC70', 'XC90'],
  
  // Chinese
  'BYD': ['Atto 3', 'Dolphin', 'e2', 'e6', 'Han', 'Qin', 'Seal', 'Seal U', 'Seagull', 'Song', 'Song Plus', 'Tang', 'Yuan', 'Yuan Plus'],
  'Changan': ['CS15', 'CS35', 'CS55', 'CS75', 'CS85', 'CS95', 'Deepal S7', 'Eado', 'Lumin', 'Raeton', 'Uni-K', 'Uni-T', 'Uni-V'],
  'Chery': ['Arrizo', 'eQ', 'eQ1', 'Omoda 5', 'QQ', 'Tiggo 2', 'Tiggo 3', 'Tiggo 4', 'Tiggo 5', 'Tiggo 7', 'Tiggo 8'],
  'Dongfeng': ['580', 'A60', 'AX7', 'E70', 'Fengshen', 'Fengxing', 'Glory 560', 'H30', 'Rich', 'S30', 'Voyah Free'],
  'FAW': ['Bestune B70', 'Bestune T33', 'Bestune T55', 'Bestune T77', 'Bestune T99', 'Hongqi E-HS9', 'Hongqi H5', 'Hongqi H9', 'Jiefang'],
  'Geely': ['Azkarra', 'Binrui', 'Binyue', 'Bo Yue', 'Coolray', 'Emgrand', 'Icon', 'Okavango', 'Preface', 'Tugella', 'Xingyue'],
  'Great Wall': ['C30', 'Florid', 'H1', 'H2', 'H5', 'H6', 'H9', 'M4', 'Pao', 'Sailor', 'Steed', 'Voleex', 'Wingle'],
  'Haval': ['Big Dog', 'Dargo', 'F5', 'F7', 'F7x', 'H1', 'H2', 'H4', 'H5', 'H6', 'H9', 'Jolion'],
  'Hongqi': ['E-HS3', 'E-HS9', 'E-QM5', 'H5', 'H7', 'H9', 'HS3', 'HS5', 'HS7', 'L5', 'S9'],
  'Li Auto': ['L6', 'L7', 'L8', 'L9', 'Mega', 'One'],
  'Lynk & Co': ['01', '02', '03', '05', '06', '09'],
  'NIO': ['EC6', 'EC7', 'EL6', 'EL7', 'EL8', 'EP9', 'ES6', 'ES7', 'ES8', 'ET5', 'ET5 Touring', 'ET7', 'ET9'],
  'Ora': ['Ballet Cat', 'Black Cat', 'Funky Cat', 'Good Cat', 'Lightning Cat', 'Punk Cat', 'White Cat'],
  'Wuling': ['Air EV', 'Almaz', 'Asta', 'Bingo', 'Confero', 'Cortez', 'Formo', 'Hongguang', 'Hongguang Mini EV', 'Journey', 'Starlight'],
  'XPeng': ['G3', 'G6', 'G9', 'P5', 'P7', 'X9'],
  'Zeekr': ['001', '007', '009', 'X'],
  
  // Indian
  'Mahindra': ['Alturas G4', 'Bolero', 'e2o', 'eKUV100', 'eXUV300', 'KUV100', 'Marazzo', 'Scorpio', 'Scorpio-N', 'Thar', 'TUV300', 'XUV300', 'XUV400', 'XUV500', 'XUV700', 'Xylo'],
  'Maruti Suzuki': ['Alto', 'Alto K10', 'Baleno', 'Brezza', 'Celerio', 'Ciaz', 'Dzire', 'Eeco', 'Ertiga', 'Fronx', 'Grand Vitara', 'Ignis', 'Invicto', 'Jimny', 'S-Presso', 'Swift', 'Wagon R', 'XL6'],
  'Tata': ['Altroz', 'Curvv', 'Harrier', 'Hexa', 'Indica', 'Nano', 'Nexon', 'Punch', 'Safari', 'Safari Storme', 'Tiago', 'Tigor', 'Zest'],
  
  // Other
  'Cupra': ['Ateca', 'Born', 'Formentor', 'Leon', 'Tavascan', 'Terramar'],
  'Dacia': ['Duster', 'Jogger', 'Logan', 'Sandero', 'Spring'],
  'Lada': ['4x4', 'Granta', 'Largus', 'Niva', 'Niva Legend', 'Niva Travel', 'Vesta', 'XRAY'],
  'Lucid': ['Air', 'Gravity'],
  'Rivian': ['R1S', 'R1T', 'R2', 'R3'],
  'Seat': ['Alhambra', 'Arona', 'Ateca', 'Ibiza', 'Leon', 'Mii', 'Tarraco', 'Toledo'],
  'Skoda': ['Citigo', 'Elroq', 'Enyaq', 'Enyaq Coupe', 'Fabia', 'Kamiq', 'Karoq', 'Kodiaq', 'Octavia', 'Rapid', 'Roomster', 'Scala', 'Superb', 'Yeti'],
  'VinFast': ['VF 3', 'VF 5', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34'],
};
