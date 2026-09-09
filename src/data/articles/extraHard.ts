import { Article } from './types';

export const extraHardArticles: Article[] = [
  {
    id: 'x-dna',
    topic: 'Science',
    subtopic: 'Biology',
    level: 'extra-hard',
    title: 'DNA: The Instruction Book of Life',
    body: `Every living thing on Earth, from a bacterium in a hot spring to the person reading this sentence, carries its instructions in the same kind of molecule: deoxyribonucleic acid, or DNA. Understanding it took almost a century of careful, sometimes contested, work.

The story begins in a monastery garden. Between 1856 and 1863 an Austrian monk named Gregor Mendel bred pea plants and counted their offspring. He showed that traits pass in discrete units, not as blended fluids, and that some units are dominant while others are recessive. His paper was published in 1866 and then almost entirely ignored for thirty-four years, until three botanists rediscovered his rules in 1900.

Meanwhile chemists were closing in on the molecule itself. In 1869 a Swiss physician, Friedrich Miescher, isolated a strange acidic substance from the nuclei of white blood cells found in surgical bandages. He called it nuclein. Nobody suspected it held heredity, because most scientists assumed proteins were too varied and interesting to be replaced in that role by a boring acid.

Two experiments changed minds. In 1928 Frederick Griffith found that harmless pneumonia bacteria could be transformed into deadly ones by something released from dead deadly cells. In 1944 Oswald Avery and colleagues showed that the transforming substance was DNA, not protein. In 1952 Alfred Hershey and Martha Chase used viruses labelled with radioactive tags and confirmed that DNA, not protein, carries genetic information into cells.

Now the question was structure. Erwin Chargaff measured the four bases in DNA, adenine, thymine, guanine and cytosine, and found a pattern in every species: the amount of adenine always equalled the amount of thymine, and guanine always equalled cytosine. Rosalind Franklin, working at King's College London with Maurice Wilkins, produced X-ray diffraction images of extraordinary quality. Her image known as Photo 51, along with her measurements showing the molecule was helical with the phosphate backbone on the outside, was crucial evidence.

At Cambridge, James Watson and Francis Crick were building models. Shown Franklin's data without her knowledge, they published a one-page paper in the journal Nature in April 1953 describing a double helix: two strands running in opposite directions, twisted around each other, with the bases paired in the middle, adenine always to thymine and guanine always to cytosine. Because each base has only one partner, either strand is a template for rebuilding the other, which explains at a stroke how genetic information copies itself. Watson, Crick and Wilkins shared the Nobel Prize in 1962. Franklin had died of ovarian cancer in 1958 at thirty-seven and the prize is not awarded posthumously; her contribution went underacknowledged for decades.

The rest of the twentieth century filled in how the instructions are read. A gene is a stretch of DNA. It is transcribed into a messenger molecule, RNA, which travels to a ribosome where it is translated into a chain of amino acids that folds into a protein. The genetic code works in three-letter words called codons; there are sixty-four codons for twenty amino acids plus stop signals, so the code is redundant. Marshall Nirenberg and others cracked it in the 1960s. A human cell holds about three billion base pairs of DNA divided among forty-six chromosomes, and if the DNA in one cell were stretched out it would be about two metres long. Only a small fraction codes for proteins; much of the rest regulates when genes switch on.

Reading and writing DNA came next. Frederick Sanger developed practical sequencing in 1977, work that earned him a second Nobel Prize. The Human Genome Project, an international public effort begun in 1990 and racing a private company led by Craig Venter, published a draft human sequence in 2001 and a finished version in 2003. Costs collapsed from billions of dollars to a few hundred. In 2012 Jennifer Doudna and Emmanuelle Charpentier showed that a bacterial defence system called CRISPR-Cas9 could be aimed at any chosen DNA sequence and cut it, making precise editing possible; they won the Nobel Prize in 2020. Messenger RNA vaccines, deployed at enormous scale during the COVID-19 pandemic, were another direct descendant of this knowledge.

DNA also rewrote history and law. Because mutations accumulate at a rough rate, comparing sequences reveals how species and populations are related, and ancient DNA extracted from bones has shown that modern humans interbred with Neanderthals. Forensic DNA profiling, invented by Alec Jeffreys in 1984, has convicted the guilty and freed the innocent. What began as a curiosity in a bandage is now the most powerful lens biology has.`,
    facts: [
      { text: 'Gregor Mendel discovered inheritance rules with pea plants', keywords: ['mendel'] },
      { text: 'Traits pass as dominant and recessive units', keywords: ['recessive'] },
      { text: 'Friedrich Miescher isolated nuclein in 1869', keywords: ['miescher'] },
      { text: 'Griffith found bacterial transformation in 1928', keywords: ['griffith'] },
      { text: 'Avery showed DNA was the transforming material', keywords: ['avery'] },
      { text: 'Hershey and Chase confirmed DNA carries genes', keywords: ['hershey'] },
      { text: 'Chargaff found A equals T and G equals C', keywords: ['chargaff'] },
      { text: 'The four bases are adenine, thymine, guanine and cytosine', keywords: ['adenine'] },
      { text: 'Rosalind Franklin made the X-ray image Photo 51', keywords: ['franklin'] },
      { text: 'Maurice Wilkins worked at King\u2019s College London', keywords: ['wilkins'] },
      { text: 'Watson and Crick described the double helix in 1953', keywords: ['watson'] },
      { text: 'The structure is a double helix', keywords: ['double helix'] },
      { text: 'They published in Nature in 1953', keywords: ['1953'] },
      { text: 'Base pairing explains how DNA copies itself', keywords: ['copies'] },
      { text: 'The Nobel Prize went to Watson, Crick and Wilkins in 1962', keywords: ['nobel'] },
      { text: 'DNA is transcribed to RNA then translated into protein', keywords: ['protein'] },
      { text: 'Codons are three-letter words of the genetic code', keywords: ['codon'] },
      { text: 'A human cell has about three billion base pairs', keywords: ['three billion'] },
      { text: 'Humans have 46 chromosomes', keywords: ['46'] },
      { text: 'Sanger developed DNA sequencing in 1977', keywords: ['sanger'] },
      { text: 'The Human Genome Project published a draft in 2001', keywords: ['genome'] },
      { text: 'Craig Venter led the private sequencing effort', keywords: ['venter'] },
      { text: 'CRISPR-Cas9 allows precise gene editing', keywords: ['crispr'] },
      { text: 'Doudna and Charpentier developed CRISPR editing', keywords: ['doudna'] },
      { text: 'Ancient DNA shows interbreeding with Neanderthals', keywords: ['neanderthal'] },
      { text: 'Alec Jeffreys invented DNA fingerprinting in 1984', keywords: ['jeffreys'] },
    ],
  },
  {
    id: 'x-automobile',
    topic: 'History',
    subtopic: 'Cars',
    level: 'extra-hard',
    title: 'The Automobile Changes Everything',
    body: `For most of human history the fastest way to travel over land was a horse. Then, in the space of about forty years, a noisy machine replaced it everywhere, and the shape of cities, work and family life changed with it.

Steam came first. In 1769 the French military engineer Nicolas-Joseph Cugnot built a steam-powered three-wheeled tractor to haul cannon, and promptly drove it into a wall in what may be the first automobile accident. Steam carriages ran in Britain in the 1830s until railway interests and road tolls, including laws requiring a man with a red flag to walk ahead of any road vehicle, strangled them.

The internal combustion engine made the modern car possible. Étienne Lenoir built a working gas engine in 1860. In 1876 the German Nikolaus Otto perfected the four-stroke cycle of intake, compression, power and exhaust that nearly every petrol engine still uses. Then in 1886 Karl Benz patented the Benz Patent-Motorwagen, a three-wheeler with a single-cylinder engine, widely counted as the first true automobile. Independently, Gottlieb Daimler and Wilhelm Maybach fitted a small high-speed engine to a carriage the same year. The person who proved the car was practical was Bertha Benz, Karl's wife, who in 1888 drove roughly 106 kilometres from Mannheim to Pforzheim with her two sons, without telling him, buying fuel at a pharmacy and fixing the machine along the way. Rudolf Diesel patented his heavier, more efficient compression-ignition engine in 1892. Benz and Daimler's companies merged in 1926 to form Daimler-Benz, maker of Mercedes-Benz.

Cars remained expensive toys until manufacturing changed. Ransom Olds used a stationary assembly process early on, but it was Henry Ford who transformed everything. Ford introduced the Model T in 1908, a simple, tough, high-clearance car designed for terrible roads. In 1913 his Highland Park plant adopted the moving assembly line, borrowed conceptually from meatpacking, and the time to build a car fell from over twelve hours to about ninety minutes. Prices dropped from around 850 dollars to under 300. In 1914 Ford shocked industry by paying five dollars a day, roughly double the going wage, which cut ruinous worker turnover and let his own employees buy his cars. By the time production ended in 1927 about fifteen million Model Ts had been sold.

General Motors, assembled from many brands by William Durant and then organised by Alfred Sloan, beat Ford at marketing with a ladder of brands, annual model changes and instalment credit. Meanwhile engineers made cars usable by everyone: Charles Kettering's electric starter in 1912 removed the dangerous hand crank, and closed steel bodies, hydraulic brakes and automatic transmissions followed.

The consequences reached far beyond transport. Governments paved enormous road networks, from Germany's autobahns in the 1930s to the American Interstate Highway System authorised in 1956. Suburbs spread outward because workers no longer had to live near a streetcar line. Motels, drive-in restaurants, shopping malls and petrol stations were all invented to serve drivers. Whole economies came to depend on oil, and geopolitics followed, as the oil shocks of 1973 and 1979 demonstrated when fuel prices spiked and small, efficient Japanese cars from Toyota and Honda seized a large share of the American market. Toyota also pioneered lean production, using just-in-time parts delivery and giving assembly workers the power to stop the line, a system studied worldwide.

Safety and pollution eventually forced regulation. Ralph Nader's 1965 book Unsafe at Any Speed pushed American lawmakers to require seat belts and crash standards, and Nils Bohlin's three-point seat belt, patented by Volvo in 1959 and released for all makers to use, has saved more than a million lives. Catalytic converters and unleaded petrol in the 1970s cut smog and removed a serious source of lead poisoning. Even so, road crashes still kill well over a million people each year.

The most recent turn is a return to an old idea. Electric cars were common around 1900 and lost out to petrol because batteries stored too little energy. Lithium-ion cells changed that arithmetic. Toyota's Prius made hybrids mainstream from 1997, and Tesla, along with Chinese manufacturers such as BYD, pushed full electric cars into the mass market in the 2010s and 2020s, while software and sensors began taking over parts of driving itself.`,
    facts: [
      { text: 'Cugnot built a steam vehicle in 1769', keywords: ['cugnot'] },
      { text: 'Nikolaus Otto perfected the four-stroke engine in 1876', keywords: ['otto'] },
      { text: 'Lenoir built an early gas engine', keywords: ['lenoir'] },
      { text: 'Karl Benz patented the first true automobile in 1886', keywords: ['benz'] },
      { text: 'The patent year was 1886', keywords: ['1886'] },
      { text: 'Daimler and Maybach built an engine-powered carriage', keywords: ['daimler'] },
      { text: 'Bertha Benz made the first long drive in 1888', keywords: ['bertha'] },
      { text: 'Rudolf Diesel patented his engine in 1892', keywords: ['diesel'] },
      { text: 'Ford introduced the Model T in 1908', keywords: ['model t'] },
      { text: 'The moving assembly line began in 1913', keywords: ['assembly line'] },
      { text: 'Assembly time fell to about ninety minutes', keywords: ['ninety'] },
      { text: 'Ford paid five dollars a day from 1914', keywords: ['five dollars'] },
      { text: 'About fifteen million Model Ts were built', keywords: ['fifteen million'] },
      { text: 'Alfred Sloan organised General Motors with many brands', keywords: ['sloan'] },
      { text: 'Kettering invented the electric starter in 1912', keywords: ['starter'] },
      { text: 'The US Interstate Highway System was authorised in 1956', keywords: ['interstate'] },
      { text: 'Cars created suburbs, motels and malls', keywords: ['suburb'] },
      { text: 'The oil shocks of the 1970s boosted Japanese cars', keywords: ['oil'] },
      { text: 'Toyota pioneered lean, just-in-time production', keywords: ['toyota'] },
      { text: 'Nader\u2019s Unsafe at Any Speed forced safety rules', keywords: ['nader'] },
      { text: 'Volvo\u2019s Bohlin invented the three-point seat belt', keywords: ['seat belt'] },
      { text: 'Catalytic converters and unleaded petrol cut pollution', keywords: ['catalytic'] },
      { text: 'The Toyota Prius made hybrids mainstream', keywords: ['prius'] },
      { text: 'Lithium-ion batteries enabled modern electric cars', keywords: ['lithium'] },
      { text: 'Tesla pushed electric cars into the mass market', keywords: ['tesla'] },
    ],
  },
  {
    id: 'x-migration',
    topic: 'Animals',
    subtopic: 'Birds',
    level: 'extra-hard',
    title: 'The Great Journeys of Birds',
    body: `Twice a year, something like fifty billion birds pick themselves up and cross the planet. Migration is one of the most demanding behaviours in nature, and for most of history nobody understood it. Aristotle believed swallows hibernated in mud, and a widely printed seventeenth-century theory held that they flew to the Moon. The truth was uncovered slowly, one clue at a time.

One of the first hard clues arrived in 1822, when a white stork was shot in Germany with an African hunting spear, made of central African wood, lodged through its neck. The bird had clearly flown home carrying it. German ornithologists called such a bird a Pfeilstorch, or arrow stork, and about two dozen were recorded. Systematic bird ringing, attaching a numbered metal band to a leg, began in Denmark in 1899 and turned migration into a measurable science. Radar in the Second World War revealed mysterious echoes operators nicknamed angels, which turned out to be flocks migrating at night. Modern satellite tags and tiny geolocators weighing less than a gram now trace individual routes.

The records are astonishing. The Arctic tern breeds in the Arctic and winters in Antarctic waters, flying a wandering route that can total about 70,000 kilometres a year, so a tern living thirty years covers more than the distance to the Moon and back three times. It also sees more daylight than any other animal. The bar-tailed godwit holds the record for non-stop flight: birds tracked from Alaska to New Zealand have flown roughly 11,000 to 13,500 kilometres in eight to eleven days without landing, eating or drinking, halving their body weight and even shrinking their digestive organs before departure to save weight. Bar-headed geese cross the Himalayas at altitudes where the air holds a third of the oxygen at sea level, aided by blood that binds oxygen unusually tightly. The tiny ruby-throated hummingbird crosses the Gulf of Mexico in a single flight, and the great snipe has been clocked flying over 90 kilometres per hour in level flight.

How do they find the way? Birds use several overlapping compasses. They read the position of the sun, correcting for the time of day with an internal clock. Night migrants learn the rotation of the star field around the celestial pole as nestlings; the researcher Stephen Emlen proved this by testing indigo buntings in a planetarium and rotating the artificial sky. They also sense the Earth's magnetic field, which gives both direction and, through the angle of the field lines, a sense of latitude. The leading explanation involves light-sensitive proteins called cryptochromes in the eye, whose chemistry is affected by magnetic fields, effectively letting a bird see magnetic direction. Some species use smell, and many follow landmarks such as coastlines, mountain ridges and river valleys.

Navigation is more than a compass, though. In a classic experiment the Dutch scientist A. C. Perdeck captured thousands of starlings migrating through the Netherlands and released them in Switzerland. Adults corrected course and reached their normal wintering grounds, showing true navigation towards a known goal. First-year birds flew the same direction and distance they would have flown from home and ended up in the wrong place entirely, showing that young birds start with an inherited compass heading and clock, and learn a real map from experience.

The timing is inherited too. Caged migratory birds become restless at exactly the season they would normally travel, a behaviour German scientists named Zugunruhe, and they do it even with no view of the sky. The trigger is day length, which is why warming springs create a hidden danger: a bird may arrive on schedule and find that the caterpillars it feeds its chicks peaked two weeks earlier. Biologists call this a phenological mismatch, and it has been measured in pied flycatchers in Europe.

Journeys are shaped by geography and physics. Soaring birds such as storks, cranes, eagles and hawks need rising columns of warm air, which do not form over water, so they funnel through narrow land bridges: Gibraltar, the Bosphorus, Panama and the Israeli Rift Valley, where hundreds of thousands can pass in a day. Small songbirds instead fly at night, when the air is cooler and calmer and predators are fewer, and they refuel at stopover sites, doubling their weight in fat before a barrier crossing. Geese fly in a V so that each bird rides the upwash from the wing tip of the one ahead, saving energy, and they take turns at the front.

Migration is dangerous, and human structures make it worse. Migrating birds are killed in enormous numbers by collisions with glass buildings and communication towers, and artificial light draws night migrants off course, which is why cities from Toronto to New York now run lights-out programmes during migration. Draining a single crucial wetland can break a route used for thousands of years, because a stopover is not optional. The Convention on Migratory Species and treaties like the North American Migratory Bird Treaty Act of 1918 exist because no country can protect a migrant alone. That is the deepest lesson of migration: a bird that hatches in a Canadian forest and winters in a Peruvian one belongs to both places, and needs them both to survive.`,
    facts: [
      { text: 'Aristotle wrongly thought swallows hibernated in mud', keywords: ['aristotle'] },
      { text: 'A stork found in 1822 carried an African spear', keywords: ['stork'] },
      { text: 'Such a bird is called a Pfeilstorch or arrow stork', keywords: ['pfeilstorch'] },
      { text: 'Bird ringing began in Denmark in 1899', keywords: ['ringing'] },
      { text: 'Wartime radar operators called flocks angels', keywords: ['radar'] },
      { text: 'The Arctic tern flies about 70,000 km a year', keywords: ['tern'] },
      { text: 'The bar-tailed godwit flies non-stop from Alaska to New Zealand', keywords: ['godwit'] },
      { text: 'That flight covers roughly 11,000 to 13,500 km', keywords: ['11,000'] },
      { text: 'Godwits shrink their organs and halve their weight', keywords: ['weight'] },
      { text: 'Bar-headed geese cross the Himalayas', keywords: ['bar-headed'] },
      { text: 'Hummingbirds cross the Gulf of Mexico non-stop', keywords: ['hummingbird'] },
      { text: 'Birds navigate using the sun and an internal clock', keywords: ['sun'] },
      { text: 'Night migrants learn the rotation of the stars', keywords: ['stars'] },
      { text: 'Emlen tested indigo buntings in a planetarium', keywords: ['emlen'] },
      { text: 'Birds sense the Earth\u2019s magnetic field', keywords: ['magnetic'] },
      { text: 'Cryptochrome proteins may allow magnetic sensing', keywords: ['cryptochrome'] },
      { text: 'Perdeck displaced starlings to Switzerland', keywords: ['starling'] },
      { text: 'Adults corrected course but young birds did not', keywords: ['adults'] },
      { text: 'Caged birds show restlessness called Zugunruhe', keywords: ['zugunruhe'] },
      { text: 'Day length triggers migration timing', keywords: ['day length'] },
      { text: 'Warming causes phenological mismatch with food peaks', keywords: ['mismatch'] },
      { text: 'Soaring birds funnel through places like Gibraltar and Panama', keywords: ['gibraltar'] },
      { text: 'Thermals do not form over water', keywords: ['thermal'] },
      { text: 'Songbirds refuel at stopover sites', keywords: ['stopover'] },
      { text: 'Geese fly in a V to save energy', keywords: ['v'] },
      { text: 'Glass buildings and lights kill many migrants', keywords: ['glass'] },
      { text: 'Cities run lights-out programmes during migration', keywords: ['lights'] },
      { text: 'The Migratory Bird Treaty Act dates from 1918', keywords: ['1918'] },
    ],
  },
  {
    id: 'x-olympics',
    topic: 'Sports',
    subtopic: 'Olympic Sports',
    level: 'extra-hard',
    title: 'The Olympic Games, Ancient and Modern',
    body: `The Olympic Games are the oldest continuing idea in sport, revived after a gap of roughly fifteen hundred years and now the largest peacetime gathering of nations on Earth.

The ancient Games were held at Olympia, a sanctuary in the western Peloponnese in Greece, in honour of Zeus. Tradition dates the first festival to 776 BC, when a cook named Coroebus won the only event, a sprint of one stadion, about 192 metres. Over centuries the programme grew to include longer runs, wrestling, boxing, the brutal all-in contest called pankration, chariot and horse racing, and the pentathlon. Competitors were men from Greek cities, they competed naked, and married women were barred from watching the main events. Winners received a wreath of wild olive, but their cities showered them with money, statues and free meals for life. A sacred truce, the ekecheiria, protected travellers going to and from the Games. Held every four years, the interval itself, an Olympiad, became a way of counting time. The Roman emperor Theodosius I, promoting Christianity, is credited with ending the Games around AD 393.

The revival was largely the work of one determined Frenchman. Pierre de Coubertin, a young aristocrat convinced that physical education had made British schools and armies strong, proposed reviving the Games at a congress in Paris in 1894, where the International Olympic Committee was founded. The first modern Games opened in Athens in 1896 with about 240 athletes from fourteen nations, all men, competing in nine sports. A new event, the marathon, was invented for the occasion, inspired by the legend of a messenger running from Marathon to Athens; a Greek water-carrier named Spyridon Louis won it and became a national hero.

The early modern Games were shaky. The 1900 Paris and 1904 St Louis editions were tacked onto world fairs and dragged on for months. Women first competed in 1900, in tennis and golf. The 1908 London marathon, measured from Windsor Castle to the stadium, fixed the distance at 42.195 kilometres, which is why that awkward number is now standard everywhere. In 1912 Jim Thorpe won both the pentathlon and decathlon, then was stripped of his medals for having been paid small sums to play semi-professional baseball; they were restored decades after his death.

Politics has never left the Games. They were cancelled in 1916, 1940 and 1944 because of world wars. Berlin in 1936 was staged as Nazi propaganda, and the African American sprinter Jesse Owens answered it by winning four gold medals. In 1968 in Mexico City, Tommie Smith and John Carlos raised gloved fists on the podium for human rights. In 1972 in Munich, Palestinian gunmen took Israeli team members hostage and eleven athletes and coaches died. The United States led a boycott of Moscow in 1980 over the invasion of Afghanistan, and the Soviet bloc boycotted Los Angeles in 1984 in reply. South Africa was excluded for decades over apartheid.

The Games also changed shape. Winter Olympics began at Chamonix in 1924 and, after 1992, were shifted to alternate with the summer Games every two years, so that one Olympics falls every other year. The strict amateur rule, long used to keep working-class athletes out, crumbled in the 1970s and 1980s; professionals were admitted, and the 1992 basketball Dream Team of NBA stars marked the change. Los Angeles in 1984, run at a profit using existing venues and heavy sponsorship, made hosting look lucrative, and bidding grew fierce enough to produce a bribery scandal over Salt Lake City in the late 1990s that forced IOC reforms. More recently, spiralling costs have made cities wary, and the IOC has begun awarding Games to hosts able to reuse facilities.

Doping has been the other long shadow. Amphetamine use contributed to the death of cyclist Knud Enemark Jensen in 1960, testing began in 1968, and Ben Johnson's disqualification after winning the 1988 hundred metres was a landmark scandal. The World Anti-Doping Agency was created in 1999, and a state-run Russian doping programme uncovered after the 2014 Sochi Games led to years of sanctions.

Certain athletes define the modern Games. The swimmer Michael Phelps has won twenty-three gold medals, more than any Olympian. The sprinter Usain Bolt won the hundred and two hundred metres at three consecutive Games. The gymnast Larisa Latynina held the medal record for nearly half a century, and Simone Biles reshaped what gymnastics could look like. The Paralympic Games, growing from a 1948 archery competition for injured British veterans organised by Ludwig Guttmann, now follow every Olympics in the same city. Through all of it the ritual holds: the rings representing five inhabited continents, a flame lit at Olympia and carried by relay, an athletes' oath, and the host handing the flag to the next city.`,
    facts: [
      { text: 'Ancient Games were held at Olympia in Greece', keywords: ['olympia'] },
      { text: 'They honoured Zeus', keywords: ['zeus'] },
      { text: 'Tradition dates the first Games to 776 BC', keywords: ['776'] },
      { text: 'The first event was a sprint called the stadion', keywords: ['stadion'] },
      { text: 'Coroebus was the first recorded winner', keywords: ['coroebus'] },
      { text: 'Winners received an olive wreath', keywords: ['wreath'] },
      { text: 'Pankration was an all-in fighting event', keywords: ['pankration'] },
      { text: 'A sacred truce protected travellers', keywords: ['truce'] },
      { text: 'Theodosius ended the ancient Games around AD 393', keywords: ['theodosius'] },
      { text: 'Pierre de Coubertin revived the Games', keywords: ['coubertin'] },
      { text: 'The IOC was founded in 1894', keywords: ['1894'] },
      { text: 'The first modern Games were in Athens in 1896', keywords: ['1896'] },
      { text: 'The marathon was invented for the modern Games', keywords: ['marathon'] },
      { text: 'Spyridon Louis won the first marathon', keywords: ['louis'] },
      { text: 'Women first competed in 1900', keywords: ['1900'] },
      { text: 'The 1908 London Games fixed the marathon at 42.195 km', keywords: ['42.195'] },
      { text: 'Jim Thorpe was stripped of his 1912 medals', keywords: ['thorpe'] },
      { text: 'Jesse Owens won four golds in Berlin in 1936', keywords: ['owens'] },
      { text: 'Smith and Carlos protested in 1968', keywords: ['1968'] },
      { text: 'Eleven Israeli team members died in Munich in 1972', keywords: ['munich'] },
      { text: 'The US boycotted Moscow in 1980', keywords: ['boycott'] },
      { text: 'Winter Olympics began at Chamonix in 1924', keywords: ['chamonix'] },
      { text: 'Professionals were admitted, shown by the 1992 Dream Team', keywords: ['dream team'] },
      { text: 'The Salt Lake City bribery scandal forced IOC reform', keywords: ['salt lake'] },
      { text: 'Ben Johnson was disqualified for doping in 1988', keywords: ['johnson'] },
      { text: 'WADA was created in 1999', keywords: ['wada'] },
      { text: 'Michael Phelps has 23 Olympic golds', keywords: ['phelps'] },
      { text: 'Usain Bolt won sprints at three Games', keywords: ['bolt'] },
      { text: 'The Paralympics grew from Guttmann\u2019s 1948 event', keywords: ['paralympic'] },
      { text: 'The five rings represent inhabited continents', keywords: ['rings'] },
      { text: 'A flame is lit at Olympia and carried by relay', keywords: ['flame'] },
    ],
  },
];
