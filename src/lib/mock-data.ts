import type { CollectionObject, Museum, MuseumDocument, User } from "./types";

export const img = (seed: string) => `https://picsum.photos/seed/${seed}/1600/1100`;
export const avatarImg = (seed: string) => `https://picsum.photos/seed/${seed}/300/300`;

const doc = (
  id: string,
  name: string,
  type: MuseumDocument["type"],
  size: string,
): MuseumDocument => ({ id, name, type, size, url: "#" });

export const users: User[] = [
  {
    id: "u1",
    name: "Marcus Vandermeer",
    username: "pa3mvr",
    avatar: avatarImg("marcus-op"),
    bio: "Licensed since 1978. Restoring WWII field radios in a barn in Friesland. CW only, 40m mostly.",
    location: "Leeuwarden, Netherlands",
    joined: "2023-04-11",
  },
  {
    id: "u2",
    name: "Elena Marchetti",
    username: "i2elm",
    avatar: avatarImg("elena-op"),
    bio: "Avionics engineer by day, collector of cockpit radio stacks by night. Ex-Alitalia maintenance.",
    location: "Bologna, Italy",
    joined: "2022-11-02",
  },
  {
    id: "u3",
    name: "Hiroshi Tanaka",
    username: "ja1hkt",
    avatar: avatarImg("hiroshi-op"),
    bio: "Boat anchors, hollow state, and the smell of warm bakelite. Also far too many mechanical watches.",
    location: "Yokohama, Japan",
    joined: "2021-06-30",
  },
  {
    id: "u4",
    name: "Sofia Reyes",
    username: "sofiareyes",
    avatar: avatarImg("sofia-op"),
    bio: "Documentary photographer. I collect the cameras I wish I had used.",
    location: "Mexico City, Mexico",
    joined: "2024-01-19",
  },
];

export const museums: Museum[] = [
  {
    id: "m1",
    slug: "signals-of-the-front",
    ownerId: "u1",
    title: "Signals of the Front",
    description:
      "Field radios, backpack transceivers and manpacks from 1938 to 1962. Every set in this museum has been opened, documented and — where possible — brought back to life on the air.",
    cover: img("wwii-field-radio-museum"),
    category: "Military Gear",
    isPublic: true,
    createdAt: "2023-04-20",
  },
  {
    id: "m2",
    slug: "hollow-state-shack",
    ownerId: "u1",
    title: "The Hollow State Shack",
    description:
      "Amateur radio equipment from the golden age of glowing glass: boat anchor receivers, AM transmitters and station accessories.",
    cover: img("ham-shack-tubes"),
    category: "Radios",
    isPublic: true,
    createdAt: "2023-09-05",
  },
  {
    id: "m3",
    slug: "cockpit-stack",
    ownerId: "u2",
    title: "Cockpit Stack",
    description:
      "Aircraft communication and navigation radios pulled from airframes across four decades — from wartime command sets to early VOR/ILS receivers.",
    cover: img("aircraft-avionics-panel"),
    category: "Aircraft Avionics",
    isPublic: true,
    createdAt: "2022-11-15",
  },
  {
    id: "m4",
    slug: "boat-anchors-yokohama",
    ownerId: "u3",
    title: "Boat Anchors of Yokohama",
    description:
      "Japanese and American receivers of extraordinary weight. Curated, aligned and photographed under studio light.",
    cover: img("boatanchor-receiver"),
    category: "Radios",
    isPublic: true,
    createdAt: "2021-07-08",
  },
  {
    id: "m5",
    slug: "tool-watches",
    ownerId: "u3",
    title: "Instruments for the Wrist",
    description: "Tool watches with a job to do: divers, pilots and field watches, 1950s onward.",
    cover: img("vintage-tool-watch"),
    category: "Watches",
    isPublic: true,
    createdAt: "2023-02-14",
  },
  {
    id: "m6",
    slug: "silver-halide",
    ownerId: "u4",
    title: "Silver Halide",
    description:
      "Rangefinders, TLRs and press cameras that shaped 20th century reportage. All shutters tested, all lenses cleaned.",
    cover: img("vintage-camera-shelf"),
    category: "Cameras",
    isPublic: true,
    createdAt: "2024-02-01",
  },
];

const o = (
  data: Omit<CollectionObject, "images" | "documents" | "modelUrl" | "createdAt"> &
    Partial<Pick<CollectionObject, "images" | "documents" | "modelUrl" | "createdAt">>,
): CollectionObject => ({
  modelUrl: null,
  documents: [],
  createdAt: "2024-05-01",
  images: [img(data.id + "-a"), img(data.id + "-b"), img(data.id + "-c")],
  ...data,
});

export const objects: CollectionObject[] = [
  o({
    id: "o1",
    museumId: "m1",
    title: "SCR-536 “Handie-Talkie”",
    description:
      "The first true handheld two-way radio issued to infantry. Five tubes, a collapsible antenna that switches the set on when extended, and an operating philosophy of beautiful simplicity.",
    year: "1943",
    manufacturer: "Galvin Manufacturing (Motorola)",
    model: "BC-611-F",
    category: "Military Gear",
    tags: ["WWII", "AM", "handheld", "US Army", "tube"],
    condition: "Excellent",
    featured: true,
    modelUrl: "/models/bc611.glb",
    specs: [
      { key: "Frequency range", value: "3.5 – 6.0 MHz (crystal controlled)" },
      { key: "Modulation", value: "AM voice" },
      { key: "RF output", value: "360 mW" },
      { key: "Tubes", value: "1R5, 1S5, 1T4, 3S4, 3Q5GT" },
      { key: "Power", value: "BA-37 (1.5 V) + BA-38 (103.5 V) dry batteries" },
      { key: "Weight", value: "2.3 kg with batteries" },
      { key: "Range", value: "1.6 km land / 8 km over water" },
    ],
    history:
      "Acquired from the estate of a Dutch resistance historian in 2019. The case carries a hand-scratched '3rd BN' marking and a repair tag dated 11-1944 from a signal depot in Bastogne. Recapped with period-correct paper capacitors; original crystal retained and still on frequency.",
    documents: [
      doc("d1", "TM 11-235 Operator Manual", "Manual", "8.4 MB"),
      doc("d2", "BC-611 Schematic Sheet", "Schematic", "1.2 MB"),
      doc("d3", "1944 Signal Depot Repair Tag (scan)", "Photo scan", "640 KB"),
    ],
  }),
  o({
    id: "o2",
    museumId: "m1",
    title: "Wireless Set No. 19 Mk III",
    description:
      "The workhorse tank radio of the British and Commonwealth armies. Three sets in one chassis: an HF set, a VHF B-set for troop chatter and an intercom amplifier.",
    year: "1942",
    manufacturer: "Pye Radio Ltd.",
    model: "WS19 Mk III",
    category: "Military Gear",
    tags: ["WWII", "tank", "HF", "British", "CW"],
    condition: "Good",
    featured: true,
    specs: [
      { key: "A-set range", value: "2 – 8 MHz" },
      { key: "B-set range", value: "229 – 241 MHz" },
      { key: "Modes", value: "CW / MCW / R-T" },
      { key: "Output", value: "8 W (A-set)" },
      { key: "Supply", value: "12 V or 24 V vibrator supply unit" },
      { key: "Weight", value: "17 kg (set only)" },
    ],
    history:
      "Recovered from a Sherman hull used as a farm windbreak near Falaise. The variometer was seized solid with sixty years of chaff dust; after three weekends of gentle work it now tunes end to end. First contact after restoration: a 40 m CW QSO with a station in Norway.",
    documents: [
      doc("d4", "WS19 Working Instructions (1943)", "Manual", "12.1 MB"),
      doc("d5", "Power Supply Unit Circuit", "Schematic", "980 KB"),
    ],
  }),
  o({
    id: "o3",
    museumId: "m1",
    title: "Torn.Fu.d2 Backpack Transceiver",
    description:
      "German infantry pack set, built with the obsessive mechanical quality of prewar Berlin. Dial mechanism runs like a lens focus helicoid.",
    year: "1939",
    manufacturer: "Telefunken",
    model: "Torn.Fu.d2",
    category: "Military Gear",
    tags: ["WWII", "Wehrmacht", "manpack", "AM"],
    condition: "Fair",
    specs: [
      { key: "Frequency range", value: "33.8 – 38.0 MHz" },
      { key: "Modes", value: "A1 / A3" },
      { key: "Output", value: "0.9 W" },
      { key: "Tubes", value: "RV2 P800 ×5" },
      { key: "Case", value: "Cast aluminium, rubber gasketed" },
    ],
    history:
      "Bought as two boxes of parts at a Belgian flea market. The receiver section is complete and original; the transmitter deck required a reproduction coil former turned on a watchmaker's lathe.",
    documents: [doc("d6", "D 972/1 Gerätbeschreibung", "Manual", "6.7 MB")],
  }),
  o({
    id: "o4",
    museumId: "m1",
    title: "RT-77/GRC-9 “Angry Nine”",
    description:
      "Cold-war era portable HF station famous among partisans, expeditions and, later, ham radio field day operators. Hand-cranked generator optional but strongly encouraged.",
    year: "1951",
    manufacturer: "Stewart-Warner",
    model: "RT-77/GRC-9",
    category: "Military Gear",
    tags: ["Cold War", "HF", "portable", "CW"],
    condition: "Excellent",
    specs: [
      { key: "Frequency range", value: "2 – 12 MHz in 3 bands" },
      { key: "Output", value: "15 W CW / 5 W AM" },
      { key: "Power options", value: "GN-58 hand generator, DY-88, vibrator pack" },
      { key: "Weight", value: "18 kg complete station" },
    ],
    history:
      "Ex-Danish Home Guard, deregistered 1988. Complete with canvas accessory bag, spare tube kit and a still-sealed tin of dial lamps.",
    documents: [
      doc("d7", "TM 11-263 Field Manual", "Manual", "9.9 MB"),
      doc("d8", "GN-58 Generator Service Notes", "PDF", "1.8 MB"),
    ],
  }),
  o({
    id: "o5",
    museumId: "m1",
    title: "Wireless Set No. 38 Mk II",
    description:
      "Lightweight infantry walkie set with a chest harness, throat microphone and an antenna that never survived contact with a hedgerow.",
    year: "1944",
    manufacturer: "Ever Ready",
    model: "WS38 Mk II",
    category: "Military Gear",
    tags: ["WWII", "British", "manpack", "VHF"],
    condition: "Good",
    specs: [
      { key: "Frequency range", value: "7.4 – 9.0 MHz" },
      { key: "Output", value: "200 mW" },
      { key: "Range", value: "Approx. 1 km" },
      { key: "Tubes", value: "ARP12 ×2, ATP4 ×3" },
    ],
    history:
      "Complete with original webbing and headgear. Sold to me by a retired signaller who had carried the identical model as a nineteen-year-old.",
  }),
  o({
    id: "o6",
    museumId: "m2",
    title: "Collins 75A-4 Receiver",
    description:
      "The receiver that defined selectivity. Mechanical filters, a PTO that tracks to within a kilohertz across the band, and a dial you can read like a book.",
    year: "1955",
    manufacturer: "Collins Radio Company",
    model: "75A-4",
    category: "Radios",
    tags: ["boat anchor", "receiver", "SSB", "Collins"],
    condition: "Mint",
    featured: true,
    modelUrl: "/models/75a4.glb",
    specs: [
      { key: "Coverage", value: "80, 40, 20, 15, 11, 10 m amateur bands" },
      { key: "IF", value: "500 kHz mechanical filter" },
      { key: "Selectivity", value: "0.8 / 1.5 / 3.1 kHz" },
      { key: "Tubes", value: "17" },
      { key: "Dial accuracy", value: "±1 kHz" },
      { key: "Weight", value: "16 kg" },
    ],
    history:
      "Second owner. Purchased from the widow of a W2 who had used it on 20 m phone every Sunday morning for forty-one years. The logbooks came with it; they now sit under the receiver on the same shelf.",
    documents: [
      doc("d9", "75A-4 Instruction Book", "Manual", "14.2 MB"),
      doc("d10", "Mechanical Filter Alignment Notes", "PDF", "740 KB"),
    ],
  }),
  o({
    id: "o7",
    museumId: "m2",
    title: "Johnson Viking Ranger II",
    description:
      "A 75 watt AM and CW transmitter with a built-in VFO and the warm, forgiving audio that AM operators still chase today.",
    year: "1961",
    manufacturer: "E.F. Johnson",
    model: "Viking Ranger II",
    category: "Radios",
    tags: ["AM", "transmitter", "boat anchor"],
    condition: "Good",
    specs: [
      { key: "Input power", value: "75 W CW / 65 W AM" },
      { key: "Bands", value: "160 – 6 m" },
      { key: "Final", value: "6146" },
      { key: "Weight", value: "22 kg" },
    ],
    history:
      "Bought locally for the price of the coffee we drank while discussing it. Full recap, new power resistors, and the original grey wrinkle finish carefully preserved rather than repainted.",
    documents: [doc("d11", "Viking Ranger II Manual", "Manual", "5.5 MB")],
  }),
  o({
    id: "o8",
    museumId: "m2",
    title: "Hammarlund HQ-129X",
    description:
      "Prewar-styled general coverage communications receiver with a crystal filter and a wonderfully damped bandspread dial.",
    year: "1946",
    manufacturer: "Hammarlund",
    model: "HQ-129X",
    category: "Radios",
    tags: ["receiver", "general coverage", "tube"],
    condition: "Excellent",
    specs: [
      { key: "Coverage", value: "540 kHz – 31 MHz" },
      { key: "Tubes", value: "11" },
      { key: "Crystal filter", value: "6 positions" },
      { key: "Audio output", value: "1.5 W" },
    ],
    history:
      "Sat in a Rotterdam attic under a blanket since 1974. Aside from a mouse nest in the speaker cavity, remarkably untouched.",
  }),
  o({
    id: "o9",
    museumId: "m2",
    title: "Vibroplex Original Bug",
    description:
      "Semi-automatic telegraph key. Chrome, japanned base, and the distinctive swing that lets an experienced ear recognise its operator.",
    year: "1948",
    manufacturer: "Vibroplex",
    model: "Original Deluxe",
    category: "Radios",
    tags: ["CW", "key", "accessory"],
    condition: "Mint",
    specs: [
      { key: "Serial", value: "182xxx" },
      { key: "Base", value: "Japanned steel, gold pinstripe" },
      { key: "Contacts", value: "Original coin silver" },
    ],
    history:
      "Named 'Bessie' by its previous owner, whose callsign is engraved on the underside of the base with a hand punch.",
    documents: [doc("d12", "Vibroplex Adjustment Guide", "PDF", "410 KB")],
  }),
  o({
    id: "o10",
    museumId: "m2",
    title: "Drake TR-4C Transceiver",
    description:
      "Compact, elegant and desperately handsome. The black-and-grey Drake styling still looks contemporary in a modern shack.",
    year: "1973",
    manufacturer: "R.L. Drake Company",
    model: "TR-4C",
    category: "Radios",
    tags: ["SSB", "transceiver", "HF"],
    condition: "Excellent",
    specs: [
      { key: "Bands", value: "80 – 10 m" },
      { key: "Modes", value: "SSB / CW / AM" },
      { key: "Input", value: "300 W PEP" },
      { key: "Finals", value: "6JB6A ×3" },
    ],
    history: "Complete station with AC-4 supply, MS-4 speaker and original Drake microphone.",
  }),
  o({
    id: "o11",
    museumId: "m3",
    title: "SCR-522 VHF Command Set",
    description:
      "Four-channel crystal controlled VHF set fitted to Spitfires, Mustangs and countless jeeps. The channel selector is a joy of mechanical engineering.",
    year: "1943",
    manufacturer: "Bendix Radio",
    model: "BC-625 / BC-624",
    category: "Aircraft Avionics",
    tags: ["WWII", "aircraft", "VHF", "AM"],
    condition: "Good",
    featured: true,
    specs: [
      { key: "Frequency range", value: "100 – 156 MHz" },
      { key: "Channels", value: "4, crystal controlled" },
      { key: "Output", value: "8 – 9 W" },
      { key: "Supply", value: "28 V DC dynamotor" },
    ],
    history:
      "Removed from a Piper stored in a hangar at Bologna Aeroporto during a 1990s clear-out. Data plate intact, inspection stamps legible.",
    documents: [
      doc("d13", "AN 16-30SCR522-3 Handbook", "Manual", "11.3 MB"),
      doc("d14", "Dynamotor Wiring Diagram", "Schematic", "820 KB"),
    ],
  }),
  o({
    id: "o12",
    museumId: "m3",
    title: "ARC-5 “Command Set” Receiver",
    description:
      "The receiver that launched a thousand ham conversions. Surplus by the crate-load in 1946 and beloved ever since.",
    year: "1944",
    manufacturer: "Western Electric",
    model: "R-25/ARC-5",
    category: "Aircraft Avionics",
    tags: ["WWII", "receiver", "surplus", "aircraft"],
    condition: "Excellent",
    specs: [
      { key: "Coverage", value: "3.0 – 6.0 MHz" },
      { key: "Tubes", value: "12SK7 ×3, 12K8, 12SR7, 12A6" },
      { key: "Supply", value: "28 V DC / 250 V dynamotor" },
      { key: "Weight", value: "3.9 kg" },
    ],
    history:
      "Unconverted — the rarest state for an ARC-5. Still wearing its original rack shock mount and Army-Navy acceptance stamp.",
    documents: [doc("d15", "ARC-5 Series Overview", "PDF", "3.4 MB")],
  }),
  o({
    id: "o13",
    museumId: "m3",
    title: "Bendix RA-10 Aircraft Receiver",
    description:
      "Prewar airline radio compass receiver, all cast housings and turned aluminium. Built when an airliner cockpit was a workshop.",
    year: "1938",
    manufacturer: "Bendix Radio",
    model: "RA-10DB",
    category: "Aircraft Avionics",
    tags: ["prewar", "airline", "navigation"],
    condition: "Fair",
    specs: [
      { key: "Coverage", value: "150 kHz – 10 MHz" },
      { key: "Function", value: "Communications + radio range" },
      { key: "Control", value: "Remote flexible shaft tuning" },
    ],
    history:
      "Ex-Ala Littoria stock, found in a crate of spares with the original inventory card still tied to the handle.",
  }),
  o({
    id: "o14",
    museumId: "m3",
    title: "King KX-170B NAV/COM",
    description:
      "The radio in half the general aviation panels of the 1970s. Green-lit, unfussy and remarkably reliable.",
    year: "1974",
    manufacturer: "King Radio Corporation",
    model: "KX-170B",
    category: "Aircraft Avionics",
    tags: ["GA", "NAV/COM", "VOR", "solid state"],
    condition: "Excellent",
    specs: [
      { key: "COM channels", value: "720 (25 kHz spacing)" },
      { key: "NAV channels", value: "200" },
      { key: "COM output", value: "10 W" },
      { key: "Supply", value: "14 V DC" },
    ],
    history:
      "Pulled from a Cessna 172 during an avionics upgrade. Bench tested and within spec on all channels.",
    documents: [
      doc("d16", "KX-170B Maintenance Manual", "Manual", "7.2 MB"),
      doc("d17", "Bench Test Report 2024", "PDF", "220 KB"),
    ],
  }),
  o({
    id: "o15",
    museumId: "m3",
    title: "Marconi AD-307 Headset",
    description:
      "Leather-and-bakelite flying helmet headset. Impedance so high it whispers, comfort so low you remember every hour of the flight.",
    year: "1941",
    manufacturer: "Marconi",
    model: "AD-307",
    category: "Aircraft Avionics",
    tags: ["accessory", "headset", "WWII"],
    condition: "Good",
    specs: [
      { key: "Impedance", value: "4000 Ω" },
      { key: "Materials", value: "Leather, bakelite, cotton-braided cable" },
    ],
    history: "Complete with original oxygen mask microphone lead and period cloth tags.",
  }),
  o({
    id: "o16",
    museumId: "m4",
    title: "Trio 9R-59DS Receiver",
    description:
      "The receiver that introduced a generation of Japanese teenagers to shortwave. Beautifully lit dial, honest performance.",
    year: "1968",
    manufacturer: "Trio (Kenwood)",
    model: "9R-59DS",
    category: "Radios",
    tags: ["shortwave", "receiver", "Japan"],
    condition: "Excellent",
    specs: [
      { key: "Coverage", value: "550 kHz – 30 MHz, 4 bands" },
      { key: "Modes", value: "AM / SSB / CW (BFO)" },
      { key: "Tubes", value: "8" },
    ],
    history:
      "My first receiver, bought used in 1979, sold in 1991, and — astonishingly — bought back from the same shop in 2016. Serial number confirmed against an old photograph.",
    documents: [doc("d18", "9R-59DS Instruction Manual", "Manual", "4.1 MB")],
  }),
  o({
    id: "o17",
    museumId: "m4",
    title: "National NC-183D",
    description:
      "Dual conversion double-preselector receiver of tremendous heft. Push-pull audio output that can fill a room.",
    year: "1952",
    manufacturer: "National Radio Company",
    model: "NC-183D",
    category: "Radios",
    tags: ["boat anchor", "receiver", "dual conversion"],
    condition: "Good",
    specs: [
      { key: "Coverage", value: "540 kHz – 31 MHz + 48 – 56 MHz" },
      { key: "Tubes", value: "15" },
      { key: "Audio", value: "8 W push-pull" },
      { key: "Weight", value: "27 kg" },
    ],
    history:
      "Shipped from Oregon in a crate built by the seller's grandson. Arrived without a single loose knob.",
  }),
  o({
    id: "o18",
    museumId: "m4",
    title: "Yaesu FT-101ZD",
    description:
      "Hybrid transceiver, solid state driver and tube finals, the bridge between two eras of amateur radio design.",
    year: "1979",
    manufacturer: "Yaesu Musen",
    model: "FT-101ZD Mk III",
    category: "Radios",
    tags: ["hybrid", "HF", "SSB", "transceiver"],
    condition: "Excellent",
    specs: [
      { key: "Bands", value: "160 – 10 m" },
      { key: "Output", value: "100 W" },
      { key: "Finals", value: "6146B ×2" },
      { key: "Modes", value: "SSB / CW / AM / FSK" },
    ],
    history:
      "Single owner before me, with the original box, packing foam, warranty card and dealer receipt from Akihabara.",
    documents: [
      doc("d19", "FT-101ZD Operating Manual", "Manual", "6.9 MB"),
      doc("d20", "Original Dealer Receipt (scan)", "Photo scan", "310 KB"),
    ],
  }),
  o({
    id: "o19",
    museumId: "m5",
    title: "Seiko 6105-8110 Diver",
    description:
      "Cushion-cased 150 m diver with the unmistakable asymmetric crown guard. Patina earned honestly.",
    year: "1974",
    manufacturer: "Seiko",
    model: "6105-8110",
    category: "Watches",
    tags: ["diver", "automatic", "Japan"],
    condition: "Good",
    specs: [
      { key: "Movement", value: "Seiko 6105B, 17 jewels, 21,600 vph" },
      { key: "Case", value: "44 mm cushion, stainless steel" },
      { key: "Water resistance", value: "150 m (original spec)" },
      { key: "Crystal", value: "Hardlex, replaced 2019" },
    ],
    history:
      "Bought from a retired commercial diver in Shizuoka. Service records from 1981 and 1996 included.",
  }),
  o({
    id: "o20",
    museumId: "m5",
    title: "Breitling Navitimer 806",
    description:
      "The pilot's slide rule on the wrist. All-black dial, beaded bezel, and a chronograph that still snaps back cleanly.",
    year: "1967",
    manufacturer: "Breitling",
    model: "806",
    category: "Watches",
    tags: ["chronograph", "pilot", "manual wind"],
    condition: "Excellent",
    specs: [
      { key: "Movement", value: "Venus 178, column wheel" },
      { key: "Case", value: "41 mm stainless steel" },
      { key: "Complication", value: "Circular slide rule bezel" },
    ],
    history:
      "AOPA-marked dial variant. Serviced by a Geneva watchmaker in 2021 with original parts retained.",
    documents: [doc("d21", "2021 Service Report", "PDF", "180 KB")],
  }),
  o({
    id: "o21",
    museumId: "m6",
    title: "Leica M3 Double Stroke",
    description:
      "The high point of mechanical rangefinder design. 0.91× finder, brass gears, a shutter that sounds like a closing vault.",
    year: "1955",
    manufacturer: "Ernst Leitz Wetzlar",
    model: "M3 (DS)",
    category: "Cameras",
    tags: ["rangefinder", "35mm", "Leica"],
    condition: "Excellent",
    featured: true,
    specs: [
      { key: "Format", value: "35 mm, 24 × 36 mm" },
      { key: "Shutter", value: "1 s – 1/1000 s, cloth focal plane" },
      { key: "Finder", value: "0.91× with 50/90/135 framelines" },
      { key: "Serial", value: "78xxxx" },
    ],
    history:
      "Belonged to a Mexico City newspaper photographer who covered the 1968 Olympics. Two small dents on the baseplate that I have declined to have removed.",
    documents: [doc("d22", "Leica M3 Instruction Booklet", "Manual", "2.6 MB")],
  }),
  o({
    id: "o22",
    museumId: "m6",
    title: "Rolleiflex 3.5F",
    description:
      "Twin lens reflex with a Zeiss Planar and a waist-level finder that turns every frame into a small ceremony.",
    year: "1962",
    manufacturer: "Franke & Heidecke",
    model: "3.5F Type 3",
    category: "Cameras",
    tags: ["TLR", "medium format", "120"],
    condition: "Mint",
    specs: [
      { key: "Format", value: "6 × 6 cm on 120 film" },
      { key: "Taking lens", value: "Zeiss Planar 75 mm f/3.5" },
      { key: "Shutter", value: "Synchro-Compur, 1 s – 1/500 s" },
      { key: "Meter", value: "Selenium, still accurate to ⅓ stop" },
    ],
    history: "Complete with original leather case, lens hood and unused Rolleinar close-up set.",
  }),
];

export const findUser = (id: string) => users.find((u) => u.id === id);
export const findUserByUsername = (username: string) =>
  users.find((u) => u.username.toLowerCase() === username.toLowerCase());
