import { Article } from './types';

export const hardArticles: Article[] = [
  {
    id: 'h-periodic-table',
    topic: 'Science',
    subtopic: 'Chemistry',
    level: 'hard',
    title: 'The Periodic Table: Order Out of Chaos',
    body: `By the middle of the 1800s chemists had discovered more than sixty elements, but nobody could agree on how they fit together. Several scientists noticed patterns. The German chemist Johann Döbereiner grouped elements into triads of three with similar behaviour. The Englishman John Newlands pointed out that properties seemed to repeat every eighth element, an idea he called the law of octaves, and other chemists laughed at him for comparing chemistry to music.

The breakthrough came in 1869 from a Russian chemist, Dmitri Mendeleev. He wrote the known elements on cards and arranged them in order of increasing atomic weight. When he lined them up, chemically similar elements fell into the same vertical columns. His genius move was what he did with the gaps. Rather than force the table to be neat, Mendeleev left empty spaces where he believed undiscovered elements belonged, and he predicted their weights and properties. When gallium, scandium and germanium were later found and matched his predictions closely, the table was accepted. A German chemist, Julius Lothar Meyer, reached a similar arrangement at nearly the same time, but Mendeleev's bold predictions won him the credit.

One puzzle remained: a few elements sat in the wrong place if you strictly followed atomic weight. In 1913 the English physicist Henry Moseley solved it. Using X-rays, he showed that each element has a whole number, the atomic number, equal to the count of protons in its nucleus. Ordering the table by atomic number rather than weight removed the exceptions. Moseley was killed in the First World War at the age of twenty-seven.

The modern table has rows called periods and columns called groups. Elements in a group share a similar arrangement of outer electrons, which is why they react in similar ways. Group 1, the alkali metals, are soft and violently reactive with water. Group 17, the halogens, are aggressive non-metals. Group 18, the noble gases, discovered largely by William Ramsay in the 1890s, barely react at all because their outer shells are full. Between them sit the transition metals, and below the main body sit two long rows, the lanthanides and actinides.

Today the table holds 118 confirmed elements. Everything from hydrogen to uranium, element 92, occurs naturally. Heavier elements are made in particle accelerators and often exist for only fractions of a second. Element 101 is named mendelevium, a permanent thank-you to the chemist who saw the pattern first.`,
    facts: [
      { text: 'Mendeleev published his table in 1869', keywords: ['mendeleev'] },
      { text: 'The publication year was 1869', keywords: ['1869'] },
      { text: 'He ordered elements by atomic weight', keywords: ['atomic weight'] },
      { text: 'He left gaps for undiscovered elements', keywords: ['gaps'] },
      { text: 'Gallium, scandium and germanium confirmed his predictions', keywords: ['gallium'] },
      { text: 'Lothar Meyer found a similar arrangement', keywords: ['meyer'] },
      { text: 'Newlands proposed the law of octaves', keywords: ['newlands'] },
      { text: 'Döbereiner grouped elements into triads', keywords: ['triads'] },
      { text: 'Moseley introduced the atomic number in 1913', keywords: ['moseley'] },
      { text: 'Atomic number equals the number of protons', keywords: ['protons'] },
      { text: 'Rows are periods and columns are groups', keywords: ['periods'] },
      { text: 'Group 1 are the alkali metals', keywords: ['alkali'] },
      { text: 'Group 17 are the halogens', keywords: ['halogens'] },
      { text: 'Group 18 are the noble gases', keywords: ['noble'] },
      { text: 'Ramsay discovered noble gases in the 1890s', keywords: ['ramsay'] },
      { text: 'There are 118 confirmed elements', keywords: ['118'] },
      { text: 'Element 101 is mendelevium', keywords: ['mendelevium'] },
    ],
  },
  {
    id: 'h-algebra',
    topic: 'Math',
    subtopic: 'Algebra',
    level: 'hard',
    title: 'Where Algebra Came From',
    body: `Algebra is the branch of mathematics in which letters stand for unknown numbers. Its history stretches across several civilisations and more than three thousand years.

Babylonian clay tablets from about 1800 BC show scribes solving problems that we would write today as quadratic equations, although they used words and tables rather than symbols. Egyptian papyri contain similar problems about dividing bread and beer. The Greeks preferred geometry: Euclid proved algebraic identities by drawing squares and rectangles. Around AD 250 a Greek writer in Alexandria named Diophantus wrote the Arithmetica, a collection of problems with whole-number solutions. He used a few abbreviations, so he is called the father of syncopated, or shorthand, algebra.

The word algebra itself comes from Arabic. Around AD 820 the Persian scholar Muhammad ibn Musa al-Khwarizmi, working in Baghdad, wrote a book whose title contained the phrase al-jabr, meaning restoration or completion, the act of moving a term to the other side of an equation. Al-Khwarizmi explained how to solve linear and quadratic equations systematically, and his name, passed through Latin, gave us the word algorithm. In India, Brahmagupta had already written rules for negative numbers and zero in the seventh century.

Europe caught up slowly. The Italian mathematician Fibonacci carried Hindu-Arabic numerals and Arabic methods into Europe in 1202. In the 1500s a fierce competition broke out in Italy over solving cubic and quartic equations, involving Scipione del Ferro, Niccolò Tartaglia, Gerolamo Cardano and Lodovico Ferrari, complete with broken promises and public challenges. Cardano published the solutions in his book Ars Magna in 1545.

Modern symbolic notation arrived with François Viète in the late 1500s, who used letters for both unknowns and known quantities, and with René Descartes, who in 1637 popularised using letters near the end of the alphabet, such as x, y and z, for unknowns. Descartes also joined algebra to geometry by putting equations on a coordinate grid.

The final surprise came in the 1800s. Mathematicians had assumed every polynomial equation could be solved with a formula. Niels Henrik Abel proved that no general formula exists for equations of degree five, and Évariste Galois, who died in a duel at twenty, explained exactly why by inventing group theory. Algebra had grown from a way of finding unknown numbers into the study of structure itself.`,
    facts: [
      { text: 'Babylonians solved quadratic-style problems around 1800 BC', keywords: ['babylon'] },
      { text: 'Diophantus wrote the Arithmetica', keywords: ['diophantus'] },
      { text: 'Al-Khwarizmi wrote the book that gave algebra its name', keywords: ['khwarizmi'] },
      { text: 'Al-jabr means restoration or completion', keywords: ['al-jabr'] },
      { text: 'He worked in Baghdad around AD 820', keywords: ['baghdad'] },
      { text: 'The word algorithm comes from his name', keywords: ['algorithm'] },
      { text: 'Brahmagupta wrote rules for zero and negative numbers', keywords: ['brahmagupta'] },
      { text: 'Fibonacci brought Hindu-Arabic numerals to Europe in 1202', keywords: ['fibonacci'] },
      { text: 'Cardano published Ars Magna in 1545', keywords: ['cardano'] },
      { text: 'Tartaglia was part of the cubic equation contest', keywords: ['tartaglia'] },
      { text: 'Viète used letters for knowns and unknowns', keywords: ['vi'] },
      { text: 'Descartes popularised x, y and z for unknowns in 1637', keywords: ['descartes'] },
      { text: 'Abel proved no general formula exists for degree five', keywords: ['abel'] },
      { text: 'Galois invented group theory', keywords: ['galois'] },
    ],
  },
  {
    id: 'h-antarctica',
    topic: 'Geography',
    subtopic: 'Poles',
    level: 'hard',
    title: 'Antarctica: The Coldest Continent',
    body: `Antarctica is the fifth largest continent, covering about 14 million square kilometres, and it is unlike anywhere else on Earth. Roughly 98 percent of it is buried under ice that averages nearly two kilometres thick and reaches over four kilometres in places. That single ice sheet holds about 60 to 70 percent of all the fresh water on the planet. If it melted completely, global sea level would rise by roughly 58 metres.

It is the coldest, driest and windiest continent. The lowest natural air temperature ever recorded on Earth, about minus 89.2 degrees Celsius, was measured at the Russian station Vostok in July 1983. Much of the interior receives so little precipitation that it counts as a desert, and some dry valleys have seen almost no rain for millions of years. Winds pouring downhill off the ice, called katabatic winds, can exceed 300 kilometres per hour.

The South Pole itself sits on a high plateau. Norwegian explorer Roald Amundsen reached it first, on 14 December 1911, using dogs and skis. The British party led by Robert Falcon Scott arrived about five weeks later and died on the return journey. Earlier, Ernest Shackleton had come close, and his later Endurance expedition became famous when his ship was crushed by ice and his entire crew survived.

No country owns Antarctica. The Antarctic Treaty, signed in 1959 by twelve nations and in force from 1961, sets the continent aside for peaceful scientific use, bans military activity and nuclear testing, and freezes all territorial claims. Later agreements banned mining. Roughly thirty countries operate research stations, and the population swings from a few thousand in summer to about a thousand hardy residents in winter.

Nothing large lives permanently on the land. The biggest fully land animal is a wingless midge about a centimetre long. The famous wildlife, including emperor penguins, Weddell seals, leopard seals and whales, depends on the sea. Emperor penguins are the only bird that breeds through the Antarctic winter, with males balancing a single egg on their feet in the dark.

Antarctic science matters far beyond the ice. Ice cores drilled there hold air bubbles that record the atmosphere for hundreds of thousands of years, which is how scientists know how carbon dioxide has changed. British researchers working over the continent discovered the ozone hole in 1985, a finding that led the world to ban ozone-destroying chemicals.`,
    facts: [
      { text: 'Antarctica covers about 14 million square kilometres', keywords: ['14 million'] },
      { text: 'About 98 percent is covered by ice', keywords: ['98'] },
      { text: 'It holds most of the world\u2019s fresh water', keywords: ['fresh water'] },
      { text: 'The coldest recorded temperature was about minus 89.2 C', keywords: ['89'] },
      { text: 'That record was set at Vostok station', keywords: ['vostok'] },
      { text: 'The interior is technically a desert', keywords: ['desert'] },
      { text: 'Katabatic winds blow downhill off the ice', keywords: ['katabatic'] },
      { text: 'Amundsen reached the South Pole first in 1911', keywords: ['amundsen'] },
      { text: 'Scott arrived later and died returning', keywords: ['scott'] },
      { text: 'Shackleton led the Endurance expedition', keywords: ['shackleton'] },
      { text: 'The Antarctic Treaty was signed in 1959', keywords: ['treaty'] },
      { text: 'The treaty bans military activity and territorial claims', keywords: ['military'] },
      { text: 'Emperor penguins breed through the winter', keywords: ['penguin'] },
      { text: 'Ice cores record ancient atmosphere', keywords: ['ice core'] },
      { text: 'The ozone hole was discovered in 1985', keywords: ['ozone'] },
    ],
  },
  {
    id: 'h-space-race',
    topic: 'History',
    subtopic: 'Space',
    level: 'hard',
    title: 'The Space Race',
    body: `The space race was a twenty-year contest between the United States and the Soviet Union, fought with rockets instead of armies. Both sides had captured German engineers and V-2 rocket technology at the end of the Second World War, and both understood that a rocket able to reach orbit could also carry a nuclear warhead.

The Soviets struck first. On 4 October 1957 they launched Sputnik 1, a polished metal sphere the size of a beach ball that beeped as it circled the Earth. Americans were stunned. A month later Sputnik 2 carried a dog named Laika. The United States answered with the embarrassing failure of Vanguard, then succeeded with Explorer 1 in January 1958, a satellite built by Wernher von Braun's team that discovered the Van Allen radiation belts. Congress created NASA later that year.

The Soviet lead continued. Luna 2 hit the Moon in 1959 and Luna 3 photographed its far side. On 12 April 1961 Yuri Gagarin became the first human in space, orbiting once aboard Vostok 1. Alan Shepard flew a short suborbital hop three weeks later, and John Glenn orbited in 1962. In 1963 Valentina Tereshkova became the first woman in space, and in 1965 Alexei Leonov made the first spacewalk.

President John F. Kennedy responded to Gagarin's flight by setting an audacious goal in May 1961: landing a man on the Moon and returning him safely before the decade ended. NASA built the Gemini programme to practise rendezvous, docking and long flights, then the Apollo programme to go to the Moon. Progress cost lives. In January 1967 a fire in the Apollo 1 capsule killed Gus Grissom, Ed White and Roger Chaffee during a ground test. That same year the Soviet cosmonaut Vladimir Komarov died when Soyuz 1's parachute failed.

The Soviet Moon effort stalled. Their chief designer, Sergei Korolev, died in 1966, and their giant N1 rocket failed on every test launch. NASA pressed ahead. Apollo 8 carried humans around the Moon at Christmas 1968, and on 20 July 1969 Apollo 11 landed. Neil Armstrong and Buzz Aldrin walked on the surface while Michael Collins orbited above.

Five more Apollo crews landed, and Apollo 13 survived an oxygen tank explosion in 1970. The rivalry cooled with the Apollo-Soyuz docking in 1975, when American and Soviet crews shook hands in orbit.`,
    facts: [
      { text: 'Sputnik 1 launched on 4 October 1957', keywords: ['sputnik'] },
      { text: 'The launch year was 1957', keywords: ['1957'] },
      { text: 'The dog Laika flew on Sputnik 2', keywords: ['laika'] },
      { text: 'Explorer 1 was the first US satellite', keywords: ['explorer'] },
      { text: 'Explorer 1 found the Van Allen belts', keywords: ['van allen'] },
      { text: 'Wernher von Braun led US rocket work', keywords: ['von braun'] },
      { text: 'NASA was created in 1958', keywords: ['nasa'] },
      { text: 'Yuri Gagarin was first human in space in 1961', keywords: ['gagarin'] },
      { text: 'Alan Shepard made the first US flight', keywords: ['shepard'] },
      { text: 'Valentina Tereshkova was the first woman in space', keywords: ['tereshkova'] },
      { text: 'Alexei Leonov made the first spacewalk', keywords: ['leonov'] },
      { text: 'Kennedy set the Moon goal in 1961', keywords: ['kennedy'] },
      { text: 'The Apollo 1 fire killed three astronauts', keywords: ['apollo 1'] },
      { text: 'Komarov died on Soyuz 1', keywords: ['komarov'] },
      { text: 'Korolev was the Soviet chief designer', keywords: ['korolev'] },
      { text: 'The Soviet N1 rocket kept failing', keywords: ['n1'] },
      { text: 'Apollo 11 landed on 20 July 1969', keywords: ['1969'] },
      { text: 'Apollo-Soyuz docked in 1975', keywords: ['soyuz'] },
    ],
  },
  {
    id: 'h-dino-extinction',
    topic: 'Animals',
    subtopic: 'Extinct Animals',
    level: 'hard',
    title: 'The Day the Dinosaurs Died',
    body: `About 66 million years ago, at the end of the Cretaceous period, roughly three quarters of all species on Earth disappeared. Every non-bird dinosaur died out, along with the flying pterosaurs, the swimming mosasaurs and plesiosaurs, the coiled-shell ammonites, and huge numbers of plants and plankton. Scientists call it the Cretaceous-Paleogene, or K-Pg, extinction.

For a long time nobody knew the cause. Then in 1980 a team including the physicist Luis Alvarez and his geologist son Walter Alvarez reported something strange in a thin clay layer that marks the boundary in rocks worldwide. The layer was rich in iridium, a metal rare in Earth's crust but common in asteroids. They proposed that a giant asteroid had struck the planet.

The crater was found a decade later, buried under the Yucatán Peninsula in Mexico and partly under the sea. Named Chicxulub, it is about 180 kilometres wide and dates to exactly the right moment. The impacting body was probably around 10 to 12 kilometres across and hit at tens of kilometres per second, releasing energy far greater than all the world's nuclear weapons combined.

The immediate effects were violent: a colossal fireball, earthquakes, and tsunamis that swept hundreds of kilometres inland. Rock blasted into space fell back as glowing debris, heating the sky and igniting fires. Yet the real killer was the aftermath. Vaporised rock and sulphur formed a haze that blocked sunlight for months or years. Photosynthesis collapsed, food chains failed from the bottom up, and temperatures plunged in what is often called an impact winter. Later, carbon dioxide released by the impact and by volcanoes caused long-term warming and acidified the oceans.

The asteroid was probably not acting alone. In India, immense volcanic eruptions known as the Deccan Traps were pouring out lava and gases around the same period, and many researchers think this stressed ecosystems before the impact finished the job.

Survival was a lottery. Animals that were small, could burrow, lived in water, or ate seeds, insects and dead matter had the best chances. Mammals, which had lived for over 100 million years in the shadow of dinosaurs, survived and then diversified rapidly into the empty world. So did one dinosaur lineage: birds. Every sparrow and eagle alive today is a living dinosaur.`,
    facts: [
      { text: 'The extinction happened about 66 million years ago', keywords: ['66'] },
      { text: 'It ended the Cretaceous period', keywords: ['cretaceous'] },
      { text: 'About three quarters of species died out', keywords: ['species'] },
      { text: 'Pterosaurs and ammonites also died out', keywords: ['ammonite'] },
      { text: 'The Alvarez team proposed an asteroid impact in 1980', keywords: ['alvarez'] },
      { text: 'A layer rich in iridium was the key clue', keywords: ['iridium'] },
      { text: 'The crater is called Chicxulub', keywords: ['chicxulub'] },
      { text: 'The crater is in the Yucatan Peninsula in Mexico', keywords: ['yucat'] },
      { text: 'The crater is about 180 km wide', keywords: ['180'] },
      { text: 'The asteroid was roughly 10 to 12 km across', keywords: ['10'] },
      { text: 'Tsunamis and fires followed the impact', keywords: ['tsunami'] },
      { text: 'Dust and sulphur blocked sunlight, causing an impact winter', keywords: ['sunlight'] },
      { text: 'Deccan Traps volcanoes erupted around the same time', keywords: ['deccan'] },
      { text: 'Small burrowing and water animals survived best', keywords: ['small'] },
      { text: 'Mammals then diversified', keywords: ['mammals'] },
      { text: 'Birds are surviving dinosaurs', keywords: ['birds'] },
    ],
  },
  {
    id: 'h-world-cup',
    topic: 'Sports',
    subtopic: 'Soccer',
    level: 'hard',
    title: 'The Story of the World Cup',
    body: `The FIFA World Cup is the biggest single-sport tournament on Earth, and it began as a gamble. FIFA, football's governing body, was founded in 1904, but for decades the Olympic tournament served as the unofficial world championship. FIFA president Jules Rimet pushed for a competition open to professionals, and in 1930 Uruguay, then Olympic champion and celebrating a century of independence, hosted the first World Cup.

Only thirteen teams took part, because a long boat trip to South America discouraged Europeans. Uruguay beat neighbour Argentina 4-2 in the final in Montevideo. Italy won the next two tournaments, in 1934 at home and in 1938 in France. Then the Second World War cancelled the events of 1942 and 1946.

The 1950 tournament in Brazil produced the most famous upset in the sport's history. Brazil needed only a draw in the final match at the vast Maracanã stadium but lost 2-1 to Uruguay, a national trauma remembered as the Maracanazo. In 1954 West Germany shocked Hungary's brilliant side. In 1958 a seventeen-year-old Brazilian called Pelé announced himself, scoring in the final as Brazil won in Sweden. Pelé went on to win three World Cups, in 1958, 1962 and 1970, a record no other player holds.

England won its only title in 1966 at home, beating West Germany 4-2 after extra time, with Geoff Hurst scoring a hat-trick. Argentina won in 1978 and again in 1986, when Diego Maradona both punched a goal past England and then scored what many call the greatest goal ever in the same match. Italy's 1982 win, France's 1998 triumph on home soil, Spain's first title in 2010, and Germany's 7-1 destruction of Brazil in Brazil in 2014 are other landmarks. In 2022 Argentina beat France on penalties after a 3-3 final, giving Lionel Messi the trophy he lacked.

The tournament itself has grown enormously. The finals expanded from 16 teams to 24 in 1982, to 32 in 1998, and will hold 48 teams from 2026, when the United States, Canada and Mexico host together. The original trophy, named after Jules Rimet, was awarded permanently to Brazil in 1970 and later stolen and never recovered; the current trophy has been used since 1974. A separate Women's World Cup began in 1991 and has been won most often by the United States.`,
    facts: [
      { text: 'The first World Cup was in 1930', keywords: ['1930'] },
      { text: 'Uruguay hosted and won the first tournament', keywords: ['uruguay'] },
      { text: 'FIFA president Jules Rimet pushed for it', keywords: ['rimet'] },
      { text: 'Only thirteen teams entered the first edition', keywords: ['thirteen'] },
      { text: 'Italy won in 1934 and 1938', keywords: ['italy'] },
      { text: 'The war cancelled the 1942 and 1946 tournaments', keywords: ['1942'] },
      { text: 'Uruguay beat Brazil in 1950 at the Maracana', keywords: ['maracan'] },
      { text: 'Pele first starred as a teenager in 1958', keywords: ['1958'] },
      { text: 'Pele won three World Cups', keywords: ['pel'] },
      { text: 'England won in 1966 with a Hurst hat-trick', keywords: ['1966'] },
      { text: 'Maradona led Argentina to the 1986 title', keywords: ['maradona'] },
      { text: 'Germany beat Brazil 7-1 in 2014', keywords: ['7-1'] },
      { text: 'Argentina and Messi won in 2022', keywords: ['messi'] },
      { text: 'The finals grew to 32 teams in 1998', keywords: ['32'] },
      { text: '48 teams will play from 2026', keywords: ['48'] },
      { text: 'The Women\u2019s World Cup began in 1991', keywords: ['women'] },
    ],
  },
  {
    id: 'h-fdr',
    topic: 'Presidents',
    subtopic: 'Franklin D. Roosevelt',
    level: 'hard',
    title: 'Franklin Roosevelt and the New Deal',
    body: `Franklin Delano Roosevelt was the thirty-second president of the United States and the only person elected four times, in 1932, 1936, 1940 and 1944. He was born in 1882 into a wealthy New York family and was a distant cousin of President Theodore Roosevelt, whose niece Eleanor he married. In 1921, at age thirty-nine, he was struck by a paralytic illness long diagnosed as polio and never walked unaided again, a fact he largely hid from the public.

Roosevelt took office in March 1933 at the depth of the Great Depression. A quarter of American workers had no job, thousands of banks had collapsed, and farm prices had crashed. In his first inaugural address he told the country that the only thing to fear was fear itself. He immediately declared a bank holiday, closing every bank until inspectors could certify the sound ones, and explained his reasoning directly to citizens in radio talks that became known as fireside chats.

His programme, the New Deal, poured out of Congress in the famous first hundred days. The Civilian Conservation Corps put young men to work planting trees and building parks. The Works Progress Administration later employed millions on roads, bridges, schools, and even art and theatre projects. The Tennessee Valley Authority built dams and brought electricity to a poor region. The Securities and Exchange Commission was created to police the stock market, and federal deposit insurance guaranteed ordinary savings. The Social Security Act of 1935 created old-age pensions and unemployment insurance, and the Wagner Act protected labour unions. Critics on the right called it socialism; critics on the left said it did too little. The Supreme Court struck down several early programmes, and Roosevelt's attempt in 1937 to add justices to the court failed badly and cost him political support.

The Depression eased but did not end until war spending arrived. Roosevelt supported Britain before America entered the fighting, through Lend-Lease, and after the Japanese attack on Pearl Harbor in December 1941 he led the country through the Second World War. He also authorised the internment of about 120,000 Japanese Americans, now widely regarded as a grave injustice, and the secret Manhattan Project.

Roosevelt met Churchill and Stalin at Tehran and Yalta to plan the post-war world and championed the idea of the United Nations. He died of a cerebral haemorrhage on 12 April 1945 at Warm Springs, Georgia, weeks before Germany surrendered. Harry Truman succeeded him. The Twenty-second Amendment, ratified in 1951, limited future presidents to two terms.`,
    facts: [
      { text: 'FDR was the 32nd president', keywords: ['32'] },
      { text: 'He was elected four times', keywords: ['four'] },
      { text: 'He first took office in 1933', keywords: ['1933'] },
      { text: 'He was paralysed by illness diagnosed as polio', keywords: ['polio'] },
      { text: 'He married Eleanor Roosevelt', keywords: ['eleanor'] },
      { text: 'He led during the Great Depression', keywords: ['depression'] },
      { text: 'He declared a bank holiday', keywords: ['bank'] },
      { text: 'He spoke to the country in fireside chats', keywords: ['fireside'] },
      { text: 'His programme was called the New Deal', keywords: ['new deal'] },
      { text: 'The CCC gave young men conservation jobs', keywords: ['civilian conservation'] },
      { text: 'The WPA employed millions on public works', keywords: ['wpa'] },
      { text: 'The TVA brought electricity to the Tennessee Valley', keywords: ['tennessee'] },
      { text: 'Social Security passed in 1935', keywords: ['social security'] },
      { text: 'His court-packing plan in 1937 failed', keywords: ['court'] },
      { text: 'Lend-Lease helped Britain before US entry', keywords: ['lend'] },
      { text: 'Pearl Harbor was attacked in December 1941', keywords: ['pearl harbor'] },
      { text: 'He authorised Japanese American internment', keywords: ['internment'] },
      { text: 'He died in April 1945', keywords: ['1945'] },
      { text: 'Truman succeeded him', keywords: ['truman'] },
    ],
  },
  {
    id: 'h-internet',
    topic: 'Other',
    subtopic: 'Anything',
    level: 'hard',
    title: 'How the Internet Was Built',
    body: `The internet was not invented by one person on one day. It grew from an idea about survivable communication. In the early 1960s Paul Baran in the United States and Donald Davies in Britain independently proposed chopping messages into small pieces that travel separately and are reassembled at the far end. Davies called the idea packet switching. Unlike a telephone call, which needs a dedicated circuit, packets can take any available path, so a network can lose parts of itself and keep working.

In 1969 the United States Defense Department's research agency, ARPA, connected four university computers in a network called ARPANET. The first link ran between UCLA and the Stanford Research Institute, and the first message crashed after two letters. Email appeared in 1971, when Ray Tomlinson sent a message between machines and chose the @ sign to separate a user from a host.

Different networks still could not talk to each other. Vinton Cerf and Robert Kahn solved that in the 1970s by designing a common language, the protocols TCP and IP, which let any network pass traffic to any other. The word internet is short for internetworking. ARPANET switched to TCP/IP on 1 January 1983, a date many treat as the internet's birthday. Two years later the domain name system gave humans readable addresses like example.com instead of strings of numbers.

The internet was still a tool for researchers. That changed because of Tim Berners-Lee, a British scientist at CERN, the physics laboratory near Geneva. In 1989 he proposed a system of documents linked by hypertext, and by 1991 he had built the first web browser, the first web server, and the language HTML, along with the addressing scheme we call URLs. Crucially, CERN placed the World Wide Web in the public domain in 1993, so anyone could use it without paying. The same year the Mosaic browser made the web easy for ordinary people, and traffic exploded.

Growth brought new problems and inventions: search engines to find things, encryption so shopping was safe, undersea fibre-optic cables carrying almost all international traffic, and wireless networks. By the mid 2020s more than five billion people were online, most of them through mobile phones. The design principle from the beginning, that the network stays simple and the clever work happens at the edges, is a large part of why it scaled so far.`,
    facts: [
      { text: 'Packet switching was proposed by Baran and Davies', keywords: ['packet'] },
      { text: 'Donald Davies named packet switching', keywords: ['davies'] },
      { text: 'ARPANET connected four computers in 1969', keywords: ['arpanet'] },
      { text: 'The first link was UCLA to Stanford Research Institute', keywords: ['ucla'] },
      { text: 'Ray Tomlinson sent early email and chose the @ sign', keywords: ['tomlinson'] },
      { text: 'Cerf and Kahn designed TCP/IP', keywords: ['cerf'] },
      { text: 'TCP/IP protocols let networks join up', keywords: ['tcp'] },
      { text: 'ARPANET switched to TCP/IP in 1983', keywords: ['1983'] },
      { text: 'The domain name system arrived in 1985', keywords: ['domain'] },
      { text: 'Tim Berners-Lee invented the World Wide Web', keywords: ['berners'] },
      { text: 'He worked at CERN', keywords: ['cern'] },
      { text: 'He proposed the web in 1989', keywords: ['1989'] },
      { text: 'He created HTML and URLs', keywords: ['html'] },
      { text: 'CERN released the web to the public domain in 1993', keywords: ['1993'] },
      { text: 'The Mosaic browser popularised the web', keywords: ['mosaic'] },
      { text: 'Undersea fibre cables carry global traffic', keywords: ['cable'] },
      { text: 'Over five billion people are online', keywords: ['billion'] },
    ],
  },
];
