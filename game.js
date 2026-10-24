"use strict";
/* =====================================================================
   CARD SHOP TYCOON 3: THE COLLECTOR'S VAULT
   Part 1 of the script: rules, numbers and the franchise catalog.
   ===================================================================== */

const SAVE_VERSION = 3;
const GOAL = 2500000;
const HOLO_MULT = 2.5;
const BUY_MARKUP = 0.02;          // the showroom sells to you 2% above market
const SELL_CUT = 0.05;            // and buys from you 5% below market
const TREND_POWER = 0.07;
const TREND_DAYS = [4, 10];
const AUCTION_FEE = 0.08;
const AUCTION_RESERVE = 0.80;
const AUCTION_CLOCK = 3.6;        // seconds of silence before the hammer falls
const BOUNTY = 0.20;              // the Collectors' Guild pays 20% of a forger's asking price
const DELIVERY_PREMIUM = 1.15;
const HAGGLE_CHANCES = [0.75, 0.50, 0.25];
const HISTORY_DAYS = 60;
const GALLERY_RATE = 0.0015;      // daily ticket income as a share of the Collection's value

const RARITIES = [
  { name: "Legendary", short: "Legendary", key: "L", color: "#f2c14e", value: [400, 1500], printed: 300,
    stock: [4, 10], drift: 0.0005, vol: 0.030, impact: 0.005, pts: 1, weight: 50 },
  { name: "Mythic", short: "Mythic", key: "M", color: "#fb7185", value: [2500, 9000], printed: 80,
    stock: [1, 4], drift: 0.0020, vol: 0.035, impact: 0.010, pts: 3, weight: 30 },
  { name: "Royal Mythic", short: "Royal", key: "R", color: "#b79cff", value: [12000, 40000], printed: 20,
    stock: [0, 2], drift: 0.0035, vol: 0.040, impact: 0.020, pts: 8, weight: 13 },
  { name: "Cosmic Mythic", short: "Cosmic", key: "C", color: "#5eead4", value: [60000, 200000], printed: 6,
    stock: [0, 1], drift: 0.0045, vol: 0.045, impact: 0.030, pts: 20, weight: 5 },
  { name: "Ultra Mythic", short: "Ultra", key: "U", color: "#ffffff", value: [400000, 1500000], printed: 2,
    stock: [0, 1], drift: 0.0060, vol: 0.050, impact: 0.040, pts: 50, weight: 2 },
];

// A franchise is a set of four cards. Own all four in your Collection and the set is worth more than its parts.
const TIERS = {
  classic:  { name: "Classic",  mult: 1.35, pts: 5 },
  standard: { name: "Standard", mult: 1.50, pts: 12 },
  premium:  { name: "Premium",  mult: 1.65, pts: 30 },
  grail:    { name: "Grail",    mult: 1.80, pts: 80 },
};

// land: the scenery behind the art.  cards: [name, rarity, subject, options]
const FRANCHISES = [
  { id: "drago", name: "Call of Drago", tier: "standard", studio: "Ember Forge Studios", start: true,
    sky: ["#14040a", "#5a0f12", "#d9481c"], dark: "#120406", glow: "#ff7a2f", land: "volcano",
    motto: "The mountain remembers its king.",
    cards: [["Drago, the Ember King", 2, "dragon", { pose: "rear" }],
            ["Heart of the Volcano", 1, "gem", { shape: "heart" }],
            ["Ashwing Sentinel", 0, "dragon", { pose: "perch" }],
            ["Emberfall Rider", 0, "figure", { hat: "helm", weapon: "spear", cape: true }]] },
  { id: "ronin", name: "Neon Ronin Saga", tier: "classic", studio: "Kurogane Works", start: true,
    sky: ["#0b0620", "#3a0d55", "#e0338f"], dark: "#08051a", glow: "#3ff0ff", land: "city",
    motto: "A blade is only as honest as its owner.",
    cards: [["Neon Ronin", 1, "figure", { hat: "straw", weapon: "sword", cape: true }],
            ["Street Blade Kira", 0, "figure", { hat: "hood", weapon: "sword", hair: true }],
            ["Lantern Alley", 0, "lantern", { count: 5 }],
            ["Midnight Katana", 0, "sword", { katana: true }]] },
  { id: "ironcrown", name: "Iron Crown Chronicles", tier: "classic", studio: "Old Anvil Press", start: true,
    sky: ["#0a1020", "#26375a", "#9fb4d8"], dark: "#070b14", glow: "#cfe3ff", land: "castle",
    motto: "Whoever wears it carries the whole realm.",
    cards: [["The Iron Crown", 1, "crown", {}],
            ["Steel Vanguard", 0, "figure", { hat: "helm", weapon: "sword", cape: true, shield: true }],
            ["Banner of Iron", 0, "banner", {}],
            ["Forge Keeper", 0, "figure", { hat: "none", weapon: "hammer", beard: true }]] },
  { id: "opera", name: "Phantom Opera House", tier: "classic", studio: "Velvet Lantern Co.", start: true,
    sky: ["#12030a", "#45071c", "#b3264a"], dark: "#0c0207", glow: "#ffd7a8", land: "theater",
    motto: "Every seat is taken. Every seat is empty.",
    cards: [["The Masked Maestro", 1, "mask", {}],
            ["Crimson Rose Aria", 0, "rose", {}],
            ["Chandelier Ghost", 0, "chandelier", {}],
            ["Velvet Curtain Call", 0, "structure", { kind: "opera" }]] },
  { id: "abyss", name: "Abyssal Tides", tier: "standard", studio: "Deepwell Games", start: true,
    sky: ["#010812", "#04304a", "#1c8a99"], dark: "#01070d", glow: "#7cf6e4", land: "abyss",
    motto: "Nothing that sinks is ever truly lost.",
    cards: [["Kraken Sovereign", 2, "kraken", {}],
            ["Tidecaller Siren", 1, "figure", { hat: "tiara", weapon: "staff", hair: true }],
            ["Drowned Lantern", 0, "lantern", { count: 1 }],
            ["Pearl of the Deep", 0, "gem", { shape: "pearl" }]] },
  { id: "celestial", name: "Celestial Court", tier: "premium", studio: "Halcyon Studio", start: true,
    sky: ["#1b1430", "#6c5a9e", "#f3d9a2"], dark: "#1a1430", glow: "#fff1c4", land: "clouds",
    motto: "Above the clouds, every vow is kept.",
    cards: [["Seraph of Dawn", 3, "figure", { wings: true, halo: true, weapon: "sword", hair: true }],
            ["Archon of Light", 2, "figure", { wings: true, hat: "crown", weapon: "staff" }],
            ["Halo Warden", 1, "figure", { halo: true, weapon: "spear", hat: "helm", shield: true }],
            ["Choir of Stars", 1, "orb", { count: 7 }]] },
  { id: "solar", name: "Solar Dynasty", tier: "grail", studio: "Golden Meridian", start: true,
    sky: ["#2a0e02", "#a3420a", "#ffc65a"], dark: "#1d0a02", glow: "#ffe08a", land: "desert",
    motto: "The sun does not rise. It is summoned.",
    cards: [["Sun Emperor Ra'zul", 4, "figure", { hat: "headdress", weapon: "staff", cape: true, halo: true }],
            ["Golden Phoenix", 3, "phoenix", {}],
            ["Obelisk of Dawn", 2, "structure", { kind: "obelisk" }],
            ["Sandstorm Pharaoh", 2, "figure", { hat: "headdress", weapon: "spear" }]] },
  // later launches
  { id: "grove", name: "Verdant Grove", tier: "classic", studio: "Mossy Stone Games",
    sky: ["#03120c", "#0f4a35", "#8fd18b"], dark: "#020c07", glow: "#c9ff9c", land: "forest",
    motto: "Old roots, older secrets.",
    cards: [["Elder Oak Spirit", 1, "tree", {}],
            ["Bloom Sprite", 0, "orb", { count: 1, wings: true }],
            ["Thorn Ranger", 0, "figure", { hat: "hood", weapon: "bow", cape: true }],
            ["Mossling", 0, "mech", { stone: true }]] },
  { id: "syndicate", name: "Shadow Syndicate", tier: "classic", studio: "Noir Alley Ltd.",
    sky: ["#050507", "#1d1d26", "#5d6274"], dark: "#030304", glow: "#e8e2c9", land: "noir",
    motto: "Everybody owes somebody.",
    cards: [["The Faceless Don", 1, "figure", { hat: "fedora", weapon: "none", coat: true }],
            ["Black Card Ace", 0, "playcard", {}],
            ["Silent Knife", 0, "sword", { dagger: true }],
            ["Smoke Courier", 0, "figure", { hat: "hood", weapon: "none", coat: true }]] },
  { id: "ash", name: "Kingdom of Ash", tier: "standard", studio: "Cinderfall Interactive",
    sky: ["#0d0a0a", "#3b2a26", "#c2552b"], dark: "#090606", glow: "#ffab5e", land: "ash",
    motto: "Kingdoms burn. Crowns don't.",
    cards: [["Ash King Morwen", 2, "figure", { hat: "crown", weapon: "sword", cape: true }],
            ["Cinder Keep", 1, "structure", { kind: "castle" }],
            ["Ember Knight", 0, "figure", { hat: "helm", weapon: "lance", shield: true }],
            ["The Last Lantern", 0, "lantern", { count: 1 }]] },
  { id: "mecha", name: "Mecha Titans", tier: "standard", studio: "Steel Horizon",
    sky: ["#060b14", "#16314f", "#f0a33a"], dark: "#04070d", glow: "#58d4ff", land: "ruins",
    motto: "Built for one war. Kept for the next.",
    cards: [["Titan Prime", 2, "mech", {}],
            ["Gear Colossus", 1, "mech", { heavy: true }],
            ["Rocket Fist", 0, "mech", { fist: true }],
            ["Pilot Rei", 0, "figure", { hat: "pilot", weapon: "none", hair: true }]] },
  { id: "arcane", name: "Arcane Library", tier: "standard", studio: "Inkwell & Quill",
    sky: ["#0a0614", "#2f1b52", "#8d63d8"], dark: "#07040f", glow: "#ffd98a", land: "arcane",
    motto: "Every book is a door. Some are locked from the inside.",
    cards: [["The Grand Archivist", 2, "figure", { hat: "hood", weapon: "staff", beard: true, cape: true }],
            ["Living Grimoire", 1, "book", {}],
            ["Candle Familiar", 0, "candle", {}],
            ["Eye of the Index", 0, "eye", {}]] },
  { id: "starbound", name: "Starbound Odyssey", tier: "premium", studio: "Farlight Publishing",
    sky: ["#02030a", "#0d1840", "#4a3a9a"], dark: "#010208", glow: "#9ad1ff", land: "space",
    motto: "Past the last star, the map is blank.",
    cards: [["Starship Valiant", 3, "ship", {}],
            ["Nebula Drifter", 2, "planet", { rings: true }],
            ["Captain Orion Vale", 1, "figure", { hat: "none", weapon: "none", coat: true, cape: true }],
            ["Comet Courier", 1, "planet", { comet: true }]] },
  { id: "frost", name: "Frost Throne", tier: "premium", studio: "Northlight Studio",
    sky: ["#020814", "#123a5c", "#7fe0d8"], dark: "#020812", glow: "#c8fbff", land: "ice",
    motto: "The cold does not hate you. It simply waits.",
    cards: [["Winter Empress Ilya", 3, "figure", { hat: "tiara", weapon: "staff", cape: true, hair: true }],
            ["Glacier Wyrm", 2, "wyrm", {}],
            ["Ice Lancer", 1, "figure", { hat: "helm", weapon: "lance", cape: true }],
            ["Frozen Citadel", 1, "structure", { kind: "citadel" }]] },
  { id: "clockwork", name: "Clockwork Empire", tier: "premium", studio: "Brass & Bellows",
    sky: ["#120a04", "#4a2c10", "#d39a4a"], dark: "#0d0703", glow: "#ffd28a", land: "brass",
    motto: "Tick by tick, the empire grows.",
    cards: [["The Clockwork Czar", 3, "figure", { hat: "crown", weapon: "staff", coat: true, gears: true }],
            ["Brass Dragoon", 2, "dragon", { pose: "rear", brass: true }],
            ["Gearheart Automaton", 1, "mech", { gears: true }],
            ["Steam Zeppelin", 1, "ship", { zeppelin: true }]] },
  { id: "jade", name: "Jade Dynasty", tier: "premium", studio: "Lotus Gate Games",
    sky: ["#04120e", "#185045", "#e7d7a8"], dark: "#03100b", glow: "#9fffd6", land: "mist",
    motto: "Patience is the sharpest blade.",
    cards: [["Jade Emperor", 3, "figure", { hat: "crown", weapon: "sword", coat: true, beard: true }],
            ["Lotus Dragon", 2, "wyrm", { lotus: true }],
            ["Temple Guardian", 1, "structure", { kind: "pagoda" }],
            ["Lantern Festival", 1, "lantern", { count: 9, sky: true }]] },
  { id: "leviathan", name: "Storm Leviathan", tier: "grail", studio: "Tempest House",
    sky: ["#03060c", "#1a2a3c", "#5c7d96"], dark: "#020409", glow: "#bfe8ff", land: "storm",
    motto: "The sea has one ruler, and it is awake.",
    cards: [["Leviathan Unbound", 4, "wyrm", { sea: true }],
            ["Thunder Serpent", 3, "wyrm", { lightning: true }],
            ["Tempest Admiral", 2, "figure", { hat: "tricorn", weapon: "sword", coat: true }],
            ["Lighthouse at World's End", 2, "structure", { kind: "lighthouse" }]] },
  { id: "void", name: "Void Monarch", tier: "grail", studio: "Null Sector Arts",
    sky: ["#000000", "#12041f", "#5a1a8a"], dark: "#000000", glow: "#d68cff", land: "void",
    motto: "It ate the stars first. Then it learned to wait.",
    cards: [["Void Monarch Xal", 4, "figure", { hat: "crown", weapon: "staff", wings: true, cape: true }],
            ["Event Horizon", 3, "planet", { hole: true }],
            ["Star Eater", 2, "kraken", { cosmic: true }],
            ["Null Herald", 2, "eye", { void: true }]] },
];

// Four interlocking illustrations per panorama, read left-to-right, then down.
FRANCHISES.push(
  { id: "astral", name: "Astral Convergence", tier: "classic", studio: "Starlace Atelier", start: true, panorama: true,
    sky: ["#020419", "#241954", "#a452a8"], dark: "#050516", glow: "#8ef4ff", land: "space",
    motto: "Four fragments. One infinite sky.",
    cards: [["Convergence I · The Rising Moon", 1, "planet", { rings: true }], ["Convergence II · Starfall", 0, "planet", {}],
      ["Convergence III · The Silent Orbit", 0, "planet", {}], ["Convergence IV · The Last Light", 0, "planet", {}]] },
  { id: "eldermural", name: "The Elder Dragon Mural", tier: "standard", studio: "Ember Forge Studios", start: true, panorama: true,
    sky: ["#120515", "#50263c", "#e78a4a"], dark: "#12060d", glow: "#ffcd78", land: "volcano",
    motto: "Reunite the wings and the ancient one awakens.",
    cards: [["Elder I · Crown of Fire", 2, "dragon", { pose: "rear" }], ["Elder II · Eastern Wing", 1, "dragon", {}],
      ["Elder III · Ember Heart", 0, "dragon", {}], ["Elder IV · Ashen Tail", 0, "dragon", {}]] },
  { id: "coral", name: "Coral Kingdom", tier: "standard", studio: "Deepwell Games",
    sky: ["#021320", "#09545b", "#54c7b1"], dark: "#021318", glow: "#ffb4cf", land: "abyss",
    motto: "A crown beneath every tide.",
    cards: [["Coral Queen Nerissa", 2, "figure", { hat: "tiara", weapon: "staff", hair: true }], ["Sapphire Nautilus", 1, "gem", { shape: "pearl" }],
      ["Reef Keeper", 0, "kraken", {}], ["Sea Glass Lantern", 0, "lantern", { count: 3 }]] },
  { id: "eclipse", name: "Eclipse Cathedral", tier: "grail", studio: "Null Sector Arts", panorama: true,
    sky: ["#010108", "#231342", "#7f609d"], dark: "#030208", glow: "#ffd7ac", land: "castle",
    motto: "The cathedral opens only when the heavens align.",
    cards: [["Eclipse I · Celestial Gate", 3, "structure", { kind: "castle" }], ["Eclipse II · Moonspire", 2, "structure", {}],
      ["Eclipse III · Twilight Nave", 2, "structure", {}], ["Eclipse IV · Star Sanctuary", 1, "structure", {}]] }
);

const RANKS = [[0, "Appraiser", 0], [10000, "Dealer", 625], [20000, "Curator", 1250],
  [37500, "Connoisseur", 2500], [75000, "Gallery Owner", 5000], [150000, "Auctioneer", 10000],
  [300000, "Magnate", 20000], [625000, "Baron", 37500], [1250000, "Mogul", 75000],
  [2500000, "Vault Tycoon", 125000]];

const CRATES = [
  { id: "gold", name: "Gold Crate", cards: 3, odds: [88, 11, 1, 0, 0], holo: 0.06, unlock: 0, color: "#e6bd57",
    blurb: "Mostly Legendaries with a shot at a Mythic." },
  { id: "royal", name: "Royal Crate", cards: 4, odds: [40, 45, 13, 2, 0], holo: 0.10, unlock: 37500, color: "#b79cff",
    blurb: "Mythics and Royals, and a rare Cosmic." },
  { id: "cosmic", name: "Cosmic Vault", cards: 3, odds: [0, 30, 50, 18, 2], holo: 0.15, unlock: 150000, color: "#5eead4",
    blurb: "Royals and Cosmics, and a whisper of an Ultra." },
];
const BOOSTER_HOLO = 0.08;

const CUSTOMER_KINDS = {
  "Royal Heir": { side: "buy", mult: [1.08, 1.30], stars: [4, 5], weight: 50, risk: 0,
    lines: ["Father says I may buy one treasure today. I choose {card}.",
            "{card} would look divine in the east wing.",
            "I simply must have {card} before my birthday gala."] },
  "Museum Curator": { side: "buy", mult: [1.02, 1.10], stars: [3, 5], weight: 22, risk: 0,
    lines: ["The museum needs {qty} {card} for a new exhibit.",
            "Acquiring {qty} copies of {card} for the permanent collection."] },
  "Mystery Bidder": { side: "buy", mult: [1.35, 1.90], stars: [1, 1], weight: 18, risk: 0.35,
    lines: ["My client pays a fortune for {card}... if he still wants it.",
            "{card}. Name your price. Unless I vanish."] },
  "Set Hunter": { side: "set", mult: [0.98, 1.18], stars: [4, 5], weight: 0, risk: 0,
    lines: ["I collect complete sets only. Bring me all four {franchise} cards.",
            "The full {franchise} set, all four, and I pay the complete set price.",
            "My gallery has a hole shaped exactly like the {franchise} set."] },
  "Estate Sale": { side: "sell", mult: [0.75, 0.92], stars: [3, 4], weight: 45, risk: 0.08,
    lines: ["Late Uncle Reginald's {card}. We just want it gone.",
            "Inherited {card}. Honestly, I prefer yachts."] },
  "Back-Alley Broker": { side: "sell", mult: [0.62, 0.85], stars: [1, 1], weight: 25, risk: 0.40,
    lines: ["Totally genuine {card}. No receipts. No questions.",
            "{card}, fell off an armored truck. Super cheap."] },
  "Private Collector": { side: "sell", mult: [0.90, 1.08], stars: [4, 5], weight: 25, risk: 0.05,
    lines: ["A HOLO {card} from my private vault. Mint condition.",
            "Parting with my holo {card}. Fair price for a fellow connoisseur."] },
};

// How a forgery gives itself away. Each one can be seen in the 3D inspector.
const TELLS = {
  serial: { name: "Serial number", hint: "Check the serial on the back. It can't be higher than the print run.",
            caught: "The serial number is higher than the number of copies ever printed." },
  seal: { name: "Hologram seal", hint: "Tilt the back. A real authenticity seal shimmers in rainbow colors.",
          caught: "The seal on the back is flat ink. It doesn't shimmer when you tilt it." },
  spelling: { name: "Misspelled name", hint: "Compare the name on the back with the front.",
              caught: "The name on the back is misspelled." },
  edge: { name: "Plain edges", hint: "Turn it sideways. Luxury cards have gilded gold edges.",
          caught: "The edges are plain white card stock, not gilded." },
  foil: { name: "Flat foil", hint: "Tilt the front under the light. Real foil flashes like metal.",
          caught: "The gold frame is printed yellow ink, not real foil. It never flashes." },
};
const TELL_KEYS = Object.keys(TELLS);

const GRADES = {
  10: { label: "GEM MINT", mult: 2.2 }, 9: { label: "MINT", mult: 1.45 }, 8: { label: "NEAR MINT", mult: 1.1 },
  7: { label: "LIGHTLY PLAYED", mult: 0.85 }, 6: { label: "PLAYED", mult: 0.7 }, 5: { label: "HEAVILY PLAYED", mult: 0.55 },
};
const GRADE_ODDS = [[10, 7], [9, 22], [8, 30], [7, 20], [6, 13], [5, 8]];
// Raw condition is observable; a lab certifies it rather than rolling new damage.
const RAW_CONDITION_MULT = { 5: 0.35, 6: 0.55, 7: 0.75, 8: 1, 9: 1.3, 10: 1.85 };
const CONDITION_NAMES = { 5: "Torn & creased", 6: "Edge wear", 7: "Lightly played", 8: "Near mint", 9: "Mint", 10: "Pristine" };
const MISPRINTS = { "Double strike": 4, "Offset foil": 3 };
const rollCondition = () => wpick(...unzip(GRADE_ODDS));
const rollMisprint = () => rnd() < 0.025 ? pick(Object.keys(MISPRINTS)) : "";
const physicalCondition = cp => Math.max(5, (cp.condition || cp.grade || 8) - (cp.dmg ? 2 : 0));

const ROLES = {
  negotiator: { name: "Negotiator", desc: "Salon buyers pay 4% more and haggling works more often." },
  appraiser: { name: "Appraiser", desc: "Looks over every seller's card and warns you about most forgeries." },
  scout: { name: "Scout", desc: "Brings a market tip every morning about a card that's about to start rising." },
  accountant: { name: "Accountant", desc: "Cuts showroom fees: you pay 1% over market and get 3.5% under." },
  curator: { name: "Curator", desc: "Gallery ticket income +40% and extra prestige for your Collection." },
  auctioneer: { name: "Auctioneer", desc: "Auction house fees halved and bidders get more excited." },
};

const DIFFICULTIES = {
  relaxed: { name: "Relaxed", cash: 12000, forge: 0.6, rival: 0.8, blurb: "More starting cash, fewer forgers, slower rivals." },
  classic: { name: "Classic", cash: 7500, forge: 1.0, rival: 1.0, blurb: "The way the luxury trade was meant to be played." },
  cutthroat: { name: "Cutthroat", cash: 5000, forge: 1.4, rival: 1.3, blurb: "Less cash, more forgers, hungrier rivals." },
};

const SHOP_COLORS = {
  gold: { name: "Gold", accent: "#d9b45a", soft: "#3a2f17" },
  rose: { name: "Rose", accent: "#e88aa2", soft: "#3a1b25" },
  emerald: { name: "Emerald", accent: "#4fc99c", soft: "#123126" },
  sapphire: { name: "Sapphire", accent: "#7aa8ff", soft: "#17243f" },
};

const UPGRADES = [
  { id: "display", name: "Display Cases", costs: [6000, 25000, 90000],
    desc: "One more collector visits the Salon every day, per level." },
  { id: "marketing", name: "Marketing Campaign", costs: [8000, 32000, 120000],
    desc: "Buyers in the Salon pay 3% more, per level." },
  { id: "lounge", name: "Espresso Lounge", costs: [5000],
    desc: "Relaxed collectors. Haggling works 15% more often." },
  { id: "uv", name: "UV Inspection Lamp", costs: [4000],
    desc: "Adds a UV light to the inspector. Genuine cards glow with a hidden watermark, fakes stay dark." },
  { id: "lab", name: "Grading Bench", costs: [10000, 45000],
    desc: "One more grading slot per level, and results come back in one day." },
  { id: "climate", name: "Climate Vault", costs: [20000],
    desc: "Protects cards you lend out from damage. Grading always certifies their existing condition." },
  { id: "auction", name: "Auction House Membership", costs: [15000, 75000],
    desc: "Lower seller fees (8% to 6% to 4%). Level 2 lets you consign twice a day." },
  { id: "wing", name: "Gallery Wing", costs: [12000, 60000, 240000],
    desc: "Gallery ticket income +50% per level." },
];

const QUEST_KINDS = [["deliver", 26], ["pair", 8], ["profit", 10], ["busted", 9], ["deals", 10], ["auction", 8],
  ["consign", 6], ["crate", 6], ["holo", 4], ["inspect", 6], ["worth", 7], ["set", 7], ["album", 7], ["grade", 6]];

const TROPHIES = [
  ["first_job", "First Commission", "Complete a commission", 2500],
  ["eagle_eye", "Eagle Eye", "Catch 3 forgers", 5000],
  ["gavel", "Gavel Master", "Win 3 auctions", 10000],
  ["crate_raider", "Crate Raider", "Open 10 crates", 5000],
  ["regular", "Salon Regular", "Close 20 deals in the Salon", 7500],
  ["full_set", "Full Set", "Complete a franchise in your Collection", 7500],
  ["gem_mint", "Gem Mint", "Get a card graded 10", 10000],
  ["pen_pal", "Pen Pal", "Answer 10 letters", 5000],
  ["prismatic", "Prismatic", "Own a holo Royal Mythic or rarer", 15000],
  ["big_ticket", "Big Ticket", "Make $50,000 profit in one sale", 20000],
  ["top_town", "Top of the Town", "Pass every rival shop in net worth", 25000],
  ["patron", "Patron of the Arts", "Complete 15 commissions", 40000],
  ["one_of_one", "One of One", "Own an Ultra Mythic", 50000],
  ["baron_sets", "Franchise Baron", "Hold 5 complete sets in your Collection", 60000],
  ["millionaire", "Millionaire", "Reach $1,000,000 net worth", 60000],
  ["grail_keeper", "Grail Keeper", "Complete a Grail franchise", 150000],
];

const RIVALS = [
  { id: "marlow", shop: "Marlow's Emporium", owner: "Vincent Marlow", start: 11000, color: "#e0a458",
    quote: ["Cute little shop you have there.", "I'd sell that card if I were you. To me."] },
  { id: "griffin", shop: "The Gilded Griffin", owner: "Lady Octavia Brandt", start: 16000, color: "#b79cff",
    quote: ["Darling, my gallery has a waiting list.", "One must collect with taste, not just money."] },
  { id: "kaito", shop: "Kaito's Card Den", owner: "Kaito Mori", start: 6000, color: "#5ec8e6",
    quote: ["Race you to the top!", "I just pulled something huge. Not telling."] },
];

const COLLECTORS = ["Marco", "Yuki", "Beatrix", "Kenji", "Sofia", "Rico", "Ines", "Dante", "Mika", "Lorenzo",
  "Lena", "Anton", "Carla", "Hiro", "Nina", "Felix", "Jessa", "Omar", "Priya", "Tobias", "Amara", "Viktor"];
const CLIENTS = ["Countess Ravela", "Sheikh Amari", "Sir Pemberton", "Madame Okoro", "Duke Halvorsen",
  "Ms. Takahashi", "Don Velasco", "Lady Ashcombe", "Mr. Sterling", "Baroness Liu", "Professor Quill"];
const BIDDERS = ["Count Orlov", "Lady V", "Mr. Gold", "The Archduke", "A phone bidder", "Mrs. Fairfax",
  "Paddle 12", "Ms. Ito", "An online bidder", "Signor Bellini", "Paddle 47", "Dr. Achebe"];
const ARTISTS = ["M. Ardent", "Lio Veras", "K. Hoshino", "Sable Quinn", "R. Okonkwo", "Elsa Marr", "T. Vance",
  "Iri Calder", "J. Montclair", "Noor Haddad"];
const LORE = ["Said to have been traded for a small island.", "Only shown in public once every ten years.",
  "Its last owner kept it in a bank vault in Geneva.", "Collectors whisper its name at auctions.",
  "The ink was mixed with real gold leaf.", "Printed on the night of a solar eclipse.",
  "A museum offered a whole wing for it. The owner said no.", "The artist burned the printing plates afterwards.",
  "Every copy is signed by the artist in silver.", "Legend says it brings luck to whoever owns it.",
  "It once stopped a royal wedding.", "Kept in a case that costs more than a car."];
const ABILITY_WORDS = ["Ember", "Crown", "Tide", "Veil", "Echo", "Gilded", "Starfall", "Oath", "Shroud", "Radiant",
  "Iron", "Moon", "Thorn", "Storm", "Void", "Jade", "Clock", "Ash"];
const ABILITY_NOUNS = ["Ascension", "Decree", "Requiem", "Bargain", "Resonance", "Vigil", "Mandate", "Eclipse",
  "Cadence", "Inheritance"];
const ABILITY_TEXT = ["When displayed beside another {f} card, both shine brighter.",
  "Once per season, the owner may name a price. The market listens.",
  "Gains +500 power for every {f} card in the same collection.",
  "Cannot be traded on a rainy day. Collectors swear by it.",
  "If this card is graded 10, its owner is invited to every gala.",
  "Reveals the true value of one card in your vault.",
  "Its foil was pressed from a single bar of gold.",
  "Protects its owner from one bad deal, then fades."];
/* =====================================================================
   Part 2: the game engine. Every rule lives here; the screen only shows
   the state S and calls these functions.
   ===================================================================== */

const FR = Object.fromEntries(FRANCHISES.map(f => [f.id, f]));
const rnd = Math.random;
const uni = (a, b) => a + (b - a) * rnd();
const rint = (a, b) => Math.floor(a + (b - a + 1) * rnd());
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function wpick(items, weights) {
  let total = 0;
  for (const w of weights) total += Math.max(0, w);
  let r = rnd() * total;
  for (let i = 0; i < items.length; i++) { r -= Math.max(0, weights[i]); if (r <= 0) return items[i]; }
  return items[items.length - 1];
}
function gauss() { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function nice(x) { if (x <= 0) return 0; const mag = 10 ** Math.max(0, Math.floor(Math.log10(x)) - 1); return Math.round(x / mag) * mag; }
const fmt2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
function money(x) { return (x < 0 ? "-$" : "$") + fmt2.format(Math.abs(x)); }
function money0(x) { return (x < 0 ? "-$" : "$") + fmt0.format(Math.abs(Math.round(x))); }
function short(x) {
  const a = Math.abs(x), s = x < 0 ? "-$" : "$";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e4) return s + (a / 1e3).toFixed(1) + "k";
  if (a >= 100) return s + fmt0.format(a);
  return s + a.toFixed(2);
}
function signed(x) { return (x >= 0 ? "+" : "-") + money(Math.abs(x)).replace("-", ""); }
function profitText(x) { return x >= 0 ? `+${money(x)} profit` : `${money(Math.abs(x))} loss`; }
function plural(n, word, many) { return `${fmt0.format(n)} ${n === 1 ? word : (many || word + "s")}`; }
const round5 = p => +(+p).toPrecision(5);

class GameError extends Error {}
const fail = msg => { throw new GameError(msg); };

let S = null;              // the whole saved game
let FRESH = [];            // log lines the screen has not shown yet

// ------------------------------------------------------------------ basics
function say(text, tone = "info") {
  const e = { d: S.day, t: text, k: tone };
  S.log.push(e);
  if (S.log.length > 150) S.log.splice(0, S.log.length - 150);
  FRESH.push(e);
}
const card = cid => S.cards[cid];
const franchiseOf = cid => FR[S.cards[cid].fid];
const cidsOf = fid => FR[fid].cards.map((_, i) => `${fid}-${i}`);
const allCards = () => Object.values(S.cards);
const ofRarity = r => allCards().filter(c => c.r === r);
const hasRole = role => S.shop.partners.some(p => p.role === role);
const roleName = role => (S.shop.partners.find(p => p.role === role) || {}).name || "";
const diff = () => DIFFICULTIES[S.diff] || DIFFICULTIES.classic;
const buyMarkup = () => hasRole("accountant") ? 0.01 : BUY_MARKUP;
const sellCut = () => hasRole("accountant") ? 0.035 : SELL_CUT;
const buyPrice = c => c.price * (1 + buyMarkup());
const isConvention = () => S.day % 7 === 0 || S.buffs.convention === S.day;

// ------------------------------------------------------------------ copies
function addCopy(cid, o = {}) {
  const c = S.cards[cid];
  const cp = { id: S.nextId++, cid, holo: !!o.holo, grade: o.grade || 0, cost: o.cost || 0,
    serial: o.serial || rint(1, c.printed), place: o.place || "vault", until: 0, dmg: 0, risk: 0, day: S.day,
    condition: o.grade || o.condition || rollCondition(), misprint: o.misprint ?? rollMisprint() };
  S.copies.push(cp);
  return cp;
}
const copyById = id => S.copies.find(cp => cp.id === id);
function removeCopy(cp) { const i = S.copies.indexOf(cp); if (i >= 0) S.copies.splice(i, 1); }
const copyMult = cp => (cp.holo ? HOLO_MULT : 1) * (MISPRINTS[cp.misprint] || 1)
  * (cp.grade && !cp.dmg ? GRADES[cp.grade].mult : RAW_CONDITION_MULT[physicalCondition(cp)]);
const copyValue = cp => S.cards[cp.cid].price * copyMult(cp);
const copySell = cp => copyValue(cp) * (1 - sellCut());
const copiesOf = (cid, place) => S.copies.filter(cp => cp.cid === cid && (!place || cp.place === place));
const plainCopies = cid => copiesOf(cid, "vault").filter(cp => !cp.holo && !cp.grade && !cp.dmg && !cp.misprint);
const ownsCard = cid => S.copies.some(cp => cp.cid === cid && ["vault", "album", "safe"].includes(cp.place));
function copyLabel(cp) {
  const bits = [];
  if (cp.holo) bits.push("HOLO");
  if (cp.misprint) bits.push(cp.misprint.toUpperCase());
  if (cp.grade) bits.push(`${GRADES[cp.grade].label} ${cp.grade}`);
  if (cp.dmg) bits.push("SCRATCHED");
  return (bits.length ? bits.join(" ") + " " : "") + S.cards[cp.cid].name;
}
const groupKey = cp => `${cp.cid}|${cp.holo ? 1 : 0}|${cp.grade}|${cp.dmg ? 1 : 0}|${physicalCondition(cp)}|${cp.misprint || ""}`;
function groups(place = "vault") {
  const map = new Map();
  for (const cp of S.copies) {
    if (cp.place !== place) continue;
    const k = groupKey(cp);
    if (!map.has(k)) map.set(k, { key: k, cid: cp.cid, holo: cp.holo, grade: cp.grade, dmg: cp.dmg, condition: physicalCondition(cp), misprint: cp.misprint, copies: [], cost: 0 });
    const g = map.get(k);
    g.copies.push(cp);
    g.cost += cp.cost;
  }
  return [...map.values()].map(g => Object.assign(g, { qty: g.copies.length, avg: g.cost / g.copies.length,
    unit: copyValue(g.copies[0]) }));
}

// ------------------------------------------------------------------ collection
const inAlbum = cp => cp.place === "album" || (cp.place === "loan" && cp.home === "album");
const albumCopy = cid => S.copies.find(cp => cp.cid === cid && inAlbum(cp));
function setStatus(fid) {
  const f = FR[fid], ids = cidsOf(fid);
  const slots = ids.map(cid => albumCopy(cid) || null);
  const have = slots.filter(Boolean).length;
  const raw = slots.reduce((a, cp) => a + (cp ? copyValue(cp) : 0), 0);
  const complete = have === 4;
  const marketSum = ids.reduce((a, cid) => a + (S.cards[cid] ? S.cards[cid].price : 0), 0);
  const mult = TIERS[f.tier].mult + (f.panorama ? 0.5 : 0);
  return { fid, slots, have, complete, raw, value: complete ? raw * mult : raw,
    mult, marketSum, setPrice: marketSum * mult };
}
const launchedSets = () => S.launched.map(setStatus);
const albumValue = () => launchedSets().reduce((a, s) => a + s.value, 0);
const completeSets = () => launchedSets().filter(s => s.complete);
function prestige() {
  let p = S.prestigeBonus;
  for (const s of launchedSets()) {
    let fp = 0;
    for (const cp of s.slots) {
      if (!cp) continue;
      fp += RARITIES[S.cards[cp.cid].r].pts * (cp.holo ? 2 : 1) * (cp.grade === 10 ? 2 : cp.grade >= 9 ? 1.5 : 1);
    }
    if (s.complete) fp = fp * 1.25 + TIERS[FR[s.fid].tier].pts;
    p += fp;
  }
  return Math.round(p * (hasRole("curator") ? 1.25 : 1));
}
const LEVELS = [0, 10, 25, 50, 90, 150, 240, 380, 600, 900, 1400, 2200];
function collectorLevel(p = prestige()) {
  let lv = 0;
  for (let i = 0; i < LEVELS.length; i++) if (p >= LEVELS[i]) lv = i;
  return { lv: lv + 1, next: LEVELS[lv + 1] || null, prev: LEVELS[lv] };
}
function galleryIncome() {
  return albumValue() * GALLERY_RATE * (1 + 0.5 * S.up.wing) * (hasRole("curator") ? 1.4 : 1)
    * (1 + 0.04 * (collectorLevel().lv - 1));
}
function bestVaultCopy(cid) {
  return copiesOf(cid, "vault").sort((a, b) => copyValue(b) - copyValue(a))[0] || null;
}
function toAlbum(copyId) {
  const cp = copyById(copyId);
  if (!cp || cp.place !== "vault") fail("That copy isn't in your vault.");
  const old = albumCopy(cp.cid);
  if (old && old.place === "loan") fail(`The ${S.cards[cp.cid].name} in your Collection is on loan until day ${old.until}.`);
  if (old) old.place = "vault";
  cp.place = "album";
  const s = setStatus(S.cards[cp.cid].fid);
  progress("album");
  say(`Added ${copyLabel(cp)} to your Collection.` + (s.complete ? ` The ${FR[s.fid].name} set is COMPLETE!` : ""),
    s.complete ? "gold" : "info");
  if (s.complete) S.stats.sets++;
  return s;
}
function fromAlbum(cid) {
  const cp = albumCopy(cid);
  if (!cp) fail("That slot is empty.");
  if (cp.place === "loan") fail(`It's on loan until day ${cp.until}.`);
  cp.place = "vault";
  say(`Moved ${copyLabel(cp)} back to your trading vault.`, "muted");
}

function moveToSafe(copyId) {
  const cp = copyById(copyId);
  if (!cp || cp.place !== "vault") fail("Move this card to your trading vault first.");
  cp.place = "safe";
  say(`Locked ${copyLabel(cp)} in your safe box. It is protected from sales and loans.`, "good");
}
function fromSafe(copyId) {
  const cp = copyById(copyId);
  if (!cp || cp.place !== "safe") fail("That card is not in your safe box.");
  cp.place = "vault";
  say(`Unlocked ${copyLabel(cp)} and returned it to your trading vault.`);
}

// ------------------------------------------------------------------ worth & ranks
function holdingsValue() {
  let v = 0;
  for (const cp of S.copies) if (!inAlbum(cp)) v += copyValue(cp);
  return v;
}
const netWorth = () => S.cash + holdingsValue() + albumValue();
const rankIndex = () => { let i = 0; RANKS.forEach((r, k) => { if (S.best >= r[0]) i = k; }); return i; };
function rivalPlace() { const me = netWorth(); return 1 + S.rivals.filter(r => r.worth > me).length; }

// ------------------------------------------------------------------ advice
function fair(c) { return c.base * Math.pow(c.printed / Math.max(c.supply, 1), 0.6); }
const isHot = c => c.trend >= 0.35, isCold = c => c.trend <= -0.35, isEnding = c => c.tdays <= 1;
function change(c, days) { const h = c.hist; const old = h[Math.max(0, h.length - 1 - days)]; return old > 0 ? (c.price / old - 1) * 100 : 0; }

// (word, short reason, long reason, tone). g is a vault group or null for the showroom.
function advice(c, g) {
  const rising = isHot(c), falling = isCold(c), ending = isEnding(c);
  const gap = c.price / Math.max(fair(c), 0.01);
  if (g && g.qty) {
    const each = copySell(g.copies[0]) - g.avg;
    if (each > 0 && (falling || (rising && ending) || gap > 1.2))
      return ["SELL", `Sell now: ${signed(each)}`, "You're in profit and the price is about to drop. Selling now locks in your money.", "sell"];
    if (rising && !ending) return ["HOLD", "Hold: still rising", "The price is still climbing. Keep it, and sell when this box says SELL.", "hold"];
    if (each > 0 && each >= 0.15 * Math.max(g.avg, 0.01))
      return ["SELL", `Sell: ${signed(each)}`, "The price is well above what you paid. Selling now is a safe win.", "sell"];
    if (falling) return ["HOLD", "Hold: will recover", "It's dropping right now, but rare cards usually come back. Wait for a better price.", "hold"];
    return ["HOLD", "Hold for now", "Nothing exciting yet. Check again tomorrow.", "hold"];
  }
  if (rising && !ending) return ["BUY", "Buy: it's rising", "The price is climbing and should keep going for a few days. Buy now, then sell when this box says SELL.", "buy"];
  if (gap < 0.85 && !falling) return ["BUY", "Buy: it's a bargain", "It's selling for less than it's really worth, so the price will likely creep back up.", "buy"];
  if (falling) return ["WAIT", "Wait: still dropping", "The price is still sliding. Wait until it stops falling before you buy.", "wait"];
  if (rising && ending) return ["WAIT", "Wait: rise is ending", "It already went up and the climb is almost over. Buying now would be late.", "wait"];
  if (gap > 1.2) return ["WAIT", "Wait: too pricey now", "It costs more than it's really worth right now, so it will probably come down.", "wait"];
  return ["OK", "Steady price", "The price is calm. Nothing to do with this one right now.", "muted"];
}

// ------------------------------------------------------------------ the market
function launch(fid, quiet) {
  const f = FR[fid];
  if (S.launched.includes(fid)) return;
  S.launched.push(fid);
  f.cards.forEach(([name, r], idx) => {
    const info = RARITIES[r];
    const price = Math.exp(uni(Math.log(info.value[0]), Math.log(info.value[1])));
    const printed = Math.max(1, Math.round(info.printed * uni(0.7, 1.3)));
    const c = { cid: `${fid}-${idx}`, fid, idx, name, r, base: price, price, printed, supply: printed,
      stock: rint(...info.stock), trend: 0, tdays: 0, next: null, hist: [round5(price)], seed: rint(1, 2 ** 30), released: S.day };
    if (!quiet) { c.trend = uni(0.3, 0.9); c.tdays = rint(2, 5); }
    S.cards[c.cid] = c;
  });
  if (!quiet) say(`NEW FRANCHISE: ${f.name} premieres today! Four new ${TIERS[f.tier].name} cards are in the Showroom. Collect all four for a ×${setStatus(fid).mult} set bonus.`, "new");
}
function tickPrices() {
  for (const c of allCards()) {
    const info = RARITIES[c.r];
    if (c.tdays <= 0) {
      c.trend = c.next != null ? c.next : clamp(gauss() * 0.5, -1, 1);
      c.next = null;
      c.tdays = rint(...TREND_DAYS);
    }
    c.tdays -= 1;
    c.base *= Math.exp(info.drift);
    c.supply *= 1 - uni(0, 0.003);
    const ch = c.trend * TREND_POWER + gauss() * info.vol + 0.05 * Math.log(fair(c) / c.price);
    c.price = Math.max(1, c.price * Math.exp(ch));
    c.hist.push(round5(c.price));
    if (c.hist.length > HISTORY_DAYS) c.hist.splice(0, c.hist.length - HISTORY_DAYS);
  }
}
function restock() { for (const c of allCards()) c.stock = rint(...RARITIES[c.r].stock); }

function eventTarget(rule = () => true) {
  const mine = [...new Set(S.copies.map(cp => cp.cid))].map(card).filter(c => c && rule(c));
  const pool = allCards().filter(rule);
  if (mine.length && rnd() < 0.5) return pick(mine);
  return pool.length ? pick(pool) : null;
}
function randomEvent() {
  if (rnd() > 0.6) return;
  const kind = wpick(["hype", "bust", "reprint", "flood", "boom", "crash", "lucky", "anime", "reboot"],
    [20, 12, 10, 10, 10, 7, 14, 11, 5]);
  const cards = allCards();
  if (kind === "hype") {
    const c = eventTarget();
    c.trend = 1; c.tdays = rint(3, 5); c.price *= 1.2;
    say(`RED CARPET! A movie star wore ${c.name} on a necklace. Tip: if you own it, sell in a day or two.`, "good");
  } else if (kind === "bust") {
    const c = eventTarget();
    c.trend = -1; c.tdays = rint(3, 5); c.price *= 0.85;
    say(`SCANDAL! ${c.name} was linked to a forgery ring. Tip: wait until it stops falling to buy.`, "bad");
  } else if (kind === "reprint") {
    const c = eventTarget(x => x.r <= 1);
    if (!c) return;
    c.supply *= 1.6; c.base *= 0.88; c.price *= 0.9;
    say(`REISSUE! The publisher is printing an anniversary run of ${c.name}. Tip: sell it now, it will keep dropping.`, "bad");
  } else if (kind === "flood") {
    const c = eventTarget(x => x.r >= 1 && x.r <= 3 && x.supply >= 3);
    if (!c) return;
    const lost = c.supply * 0.35;
    c.supply -= lost; c.price *= 1.15;
    say(`VAULT FLOOD! ${fmt0.format(Math.max(1, Math.floor(lost)))} copies of ${c.name} were ruined. Tip: buy it now, it will keep rising.`, "good");
  } else if (kind === "boom") {
    const gain = uni(0.08, 0.18);
    cards.forEach(c => c.price *= 1 + gain);
    say(`BILLIONAIRE BUYING SPREE! Every card rose ${Math.round(gain * 100)}%. Tip: a good day to sell.`, "good");
  } else if (kind === "crash") {
    const drop = uni(0.08, 0.15);
    cards.forEach(c => c.price *= 1 - drop);
    say(`MARKET DIP! Every card fell ${Math.round(drop * 100)}%. Tip: prices bounce back, go bargain hunting!`, "bad");
  } else if (kind === "lucky") {
    const pool = ofRarity(rnd() < 0.15 ? 1 : 0);
    const c = pick(pool.length ? pool : cards);
    const holo = rnd() < 0.1;
    addCopy(c.cid, { holo, cost: 0 });
    say(`LUCKY FIND! A ${holo ? "HOLO " : ""}${c.name} turned up in an old safe deposit box. It's in your vault.`, "good");
  } else if (kind === "anime" || kind === "reboot") {
    const owned = S.launched.filter(fid => cidsOf(fid).some(ownsCard));
    const fid = owned.length && rnd() < 0.5 ? pick(owned) : pick(S.launched);
    const up = kind === "anime";
    for (const cid of cidsOf(fid)) {
      const c = S.cards[cid];
      c.trend = up ? uni(0.7, 1) : -uni(0.6, 0.9); c.tdays = rint(3, 6); c.price *= up ? 1.08 : 0.93;
    }
    say(up ? `ANIME DEAL! ${FR[fid].name} is getting an animated series. All four cards are rising. Tip: copies you own are worth more every day.`
           : `REBOOT FLOP! The new ${FR[fid].name} movie bombed. All four cards are sliding. Tip: a cheap time to collect the set.`, up ? "good" : "bad");
  }
}

// ------------------------------------------------------------------ the salon
function pickFor(cards, mult = 1) {
  const wealth = Math.max(netWorth(), 500);
  return wpick(cards, cards.map(c => { const r = c.price * mult / wealth; return r >= 0.02 && r <= 0.25 ? 1 : r < 0.02 ? 0.3 : 0.04; }));
}
function buyerBoost() {
  return 1 + 0.03 * S.up.marketing + (hasRole("negotiator") ? 0.04 : 0) + (S.buffs.goodwill >= S.day ? 0.05 : 0);
}
function newCustomers() {
  S.customers = [];
  const n = pick([3, 4, 4]) + S.up.display + (isConvention() ? 2 : 0);
  const sides = ["buy", "buy", "sell"];
  while (sides.length < n) sides.push(pick(["buy", "buy", "sell", "sell"]));
  if (isConvention() || rnd() < 0.4) sides[rint(0, sides.length - 1)] = "set";
  const used = new Set(), names = shuffle(COLLECTORS);
  for (const side of shuffle(sides)) {
    const c = makeCustomer(side, used);
    if (c) { c.name = names[S.customers.length % names.length]; S.customers.push(c); used.add(c.cid || c.fid); }
  }
}
function makeCustomer(side, used) {
  const kinds = Object.keys(CUSTOMER_KINDS).filter(k => CUSTOMER_KINDS[k].side === side);
  const kind = side === "set" ? "Set Hunter" : wpick(kinds, kinds.map(k => CUSTOMER_KINDS[k].weight));
  const info = CUSTOMER_KINDS[kind];
  const base = { id: S.nextCust++, name: pick(COLLECTORS), kind, side, haggles: 0, state: "open", stamp: "", tone: "",
    stars: rint(...info.stars), flagged: false, tell: "", hint: "", holo: false, grade: 0, qty: 1 };
  if (side === "set") {
    const opts = S.launched.filter(fid => !used.has(fid));
    if (!opts.length) return null;
    const weights = opts.map(fid => {
      const ids = cidsOf(fid);
      const have = ids.filter(ownsCard).length;
      const missing = ids.filter(cid => !ownsCard(cid)).reduce((a, cid) => a + buyPrice(S.cards[cid]), 0);
      return (1 + have * have) * (missing <= S.cash * 1.2 ? 1 : 0.12);
    });
    const fid = wpick(opts, weights);
    const st = setStatus(fid);
    return Object.assign(base, { fid, price: round5(st.setPrice * uni(...info.mult) * buyerBoost()),
      line: pick(info.lines).replace("{franchise}", FR[fid].name) });
  }
  let cards = allCards().filter(c => !used.has(c.cid));
  let c, price;
  if (side === "buy") {
    let mine = [...new Set(S.copies.filter(cp => cp.place === "vault" && !cp.holo && !cp.grade && !cp.dmg && !cp.misprint).map(cp => cp.cid))]
      .filter(cid => !used.has(cid)).map(card);
    if (kind === "Museum Curator") { mine = mine.filter(x => x.r <= 2); cards = cards.filter(x => x.r <= 2); }
    if (!cards.length && !mine.length) return null;
    const pool = mine.length && (rnd() < 0.6 || !cards.length) ? mine : cards;
    c = pickFor(pool);
    base.qty = kind === "Museum Curator" ? rint(2, 5) : 1;
    price = c.price * uni(...info.mult) * buyerBoost();
  } else {
    if (!cards.length) return null;
    base.holo = kind === "Private Collector";
    if (kind === "Private Collector" && rnd() < 0.3) base.grade = pick([8, 9, 9, 10]);
    base.condition = base.grade || rollCondition(); base.misprint = rollMisprint();
    const mult = copyMult(base);
    c = pickFor(cards, mult);
    price = c.price * mult * uni(...info.mult);
  }
  base.flagged = rnd() < info.risk * (side === "sell" ? diff().forge : 1);
  if (base.flagged && side === "sell") base.tell = pick(TELL_KEYS);
  base.serial = base.tell === "serial" ? c.printed + rint(1, Math.max(2, Math.floor(c.printed / 3))) : rint(1, c.printed);
  if (side === "sell" && hasRole("appraiser")) {
    if (base.flagged && rnd() < 0.75) base.hint = base.tell;
    else if (!base.flagged && rnd() < 0.5) base.hint = "clean";
  }
  return Object.assign(base, { cid: c.cid, price: round5(Math.max(1, price)),
    line: pick(info.lines).replace("{card}", c.name).replace("{qty}", base.qty) });
}
function closeCustomer(cu, stamp, tone) { cu.state = "done"; cu.stamp = stamp; cu.tone = tone; }
function recordSale(qty, profit) {
  S.stats.sold += qty; S.stats.profit += profit; S.stats.bestSale = Math.max(S.stats.bestSale, profit);
  progress("profit", profit);
}
function takeCopies(list) { let basis = 0; for (const cp of list) { basis += cp.cost; removeCopy(cp); } return basis; }

function deal(cu) {
  if (cu.state !== "open") fail("That deal is already closed.");
  if (cu.side === "set") return dealSet(cu);
  const c = S.cards[cu.cid];
  if (!c) fail("That card is gone.");
  if (cu.side === "buy") {
    const have = plainCopies(c.cid);
    if (!have.length) fail(`You need a regular copy of ${c.name} in your vault. Check the Showroom!`);
    const n = Math.min(have.length, cu.qty);
    if (cu.flagged) {
      closeCustomer(cu, "BACKED OUT", "muted");
      say(`${cu.name} backed out at the last second. You still have your ${c.name}.`);
      return { ok: false, amount: 0, profit: 0 };
    }
    const basis = takeCopies(have.slice(0, n));
    const amount = cu.price * n, profit = amount - basis;
    S.cash += amount;
    recordSale(n, profit);
    S.stats.deals++; progress("deals");
    closeCustomer(cu, "SOLD!", "good");
    say(`Sold ${n} × ${c.name} to ${cu.name} for ${money(amount)} (${profitText(profit)}).`, profit >= 0 ? "good" : "bad");
    return { ok: true, amount, profit };
  }
  if (cu.price > S.cash) fail(`You need ${money(cu.price)} but only have ${money(S.cash)}.`);
  S.cash -= cu.price;
  S.stats.bought++;
  const label = `${cu.holo ? "HOLO " : ""}${cu.grade ? "graded " + cu.grade + " " : ""}${c.name}`;
  if (cu.flagged) {
    S.stats.lost++; S.stats.profit -= cu.price;
    closeCustomer(cu, "FAKE!", "bad");
    say(`FAKE! The ${label} from ${cu.name} was a forgery. ${money(cu.price)} gone. ${TELLS[cu.tell].caught}`, "bad");
    return { ok: false, amount: cu.price, profit: -cu.price };
  }
  const cp = addCopy(c.cid, { holo: cu.holo, grade: cu.grade, condition: cu.condition, misprint: cu.misprint || "", cost: cu.price, serial: cu.serial });
  S.stats.deals++; progress("deals");
  closeCustomer(cu, "AUTHENTIC", "good");
  say(`Bought a genuine ${label} from ${cu.name} for ${money(cu.price)}.`, "good");
  return { ok: true, amount: cu.price, profit: copyValue(cp) - cu.price };
}
// Which copies a Set Hunter would take: one per card, cheapest first, vault before Collection.
function setPlan(fid) {
  const out = [];
  for (const cid of cidsOf(fid)) {
    const opts = S.copies.filter(cp => cp.cid === cid && (cp.place === "vault" || cp.place === "album"))
      .sort((a, b) => (a.place === "album") - (b.place === "album") || copyValue(a) - copyValue(b));
    out.push(opts[0] || null);
  }
  return out;
}
function dealSet(cu) {
  const plan = setPlan(cu.fid);
  if (plan.some(x => !x)) fail(`You need all four ${FR[cu.fid].name} cards. You have ${plan.filter(Boolean).length} of 4.`);
  const basis = takeCopies(plan);
  S.cash += cu.price;
  const profit = cu.price - basis;
  recordSale(4, profit);
  S.stats.deals++; S.stats.setsSold = (S.stats.setsSold || 0) + 1; progress("deals");
  closeCustomer(cu, "SET SOLD!", "good");
  say(`Sold the complete ${FR[cu.fid].name} set to ${cu.name} for ${money(cu.price)} (${profitText(profit)}).`, "good");
  return { ok: true, amount: cu.price, profit };
}
function setMissing(fid) { return setPlan(fid).map((cp, i) => cp ? null : cidsOf(fid)[i]).filter(Boolean); }
function setFlipQuote(cu) {
  if (cu.side !== "set" || cu.state !== "open") return null;
  const miss = setMissing(cu.fid);
  if (!miss.length) return null;
  let cost = 0;
  for (const cid of miss) { const c = S.cards[cid]; if (c.stock <= 0) return { blocked: c.name }; cost += buyPrice(c); }
  return { miss, cost };
}
function flipSet(cu) {
  const q = setFlipQuote(cu);
  if (!q) fail("You already have every card for this set.");
  if (q.blocked) fail(`The Showroom is sold out of ${q.blocked} today.`);
  if (q.cost > S.cash) fail(`You need ${money(q.cost)} to buy the missing cards. You have ${money(S.cash)}.`);
  for (const cid of q.miss) buy(cid, 1);
  return dealSet(cu);
}
function accuse(cu) {
  if (cu.state !== "open" || cu.side !== "sell") fail("That deal is already closed.");
  const c = S.cards[cu.cid];
  if (cu.flagged) {
    const bounty = round5(cu.price * BOUNTY);
    S.cash += bounty; S.stats.busted++; progress("busted");
    closeCustomer(cu, "BUSTED!", "good");
    say(`BUSTED! ${cu.name}'s ${c.name} was a forgery. ${TELLS[cu.tell].caught} The Collectors' Guild paid you a ${money(bounty)} bounty.`, "good");
    return { ok: true, bounty };
  }
  closeCustomer(cu, "INSULTED", "muted");
  say(`${cu.name}'s ${c.name} was genuine. They stormed out, deeply insulted.`, "bad");
  return { ok: false, bounty: 0 };
}
function flipQuote(cu) {
  const c = S.cards[cu.cid];
  if (!c || cu.side !== "buy" || cu.state !== "open") return null;
  const need = Math.min(cu.qty - plainCopies(c.cid).length, c.stock);
  if (need <= 0) return null;
  let price = c.price, cost = 0;
  for (let i = 0; i < need; i++) { cost += price * (1 + buyMarkup()); price *= 1 + RARITIES[c.r].impact; }
  return { need, cost };
}
function flip(cu) {
  const q = flipQuote(cu);
  if (!q) fail("The Showroom doesn't have that card today.");
  if (q.cost > S.cash) fail(`You need ${money(q.cost)} to buy them first. You have ${money(S.cash)}.`);
  buy(cu.cid, q.need);
  return deal(cu);
}
function haggleChance(cu) {
  const base = HAGGLE_CHANCES[cu.haggles];
  if (base == null) return 0;
  return Math.min(0.95, base + (hasRole("negotiator") ? 0.1 : 0) + (S.up.lounge ? 0.15 : 0));
}
function haggle(cu) {
  if (cu.state !== "open") fail("That deal is already closed.");
  if (cu.haggles >= HAGGLE_CHANCES.length) fail(`${cu.name} won't budge any further.`);
  const chance = haggleChance(cu);
  cu.haggles++;
  if (rnd() < chance) { cu.price = round5(cu.price * (cu.side === "sell" ? 0.88 : 1.12)); return true; }
  closeCustomer(cu, "WALKED OUT", "muted");
  say(`${cu.name} got fed up with your haggling and walked out.`, "bad");
  return false;
}
function passCustomer(cu) { closeCustomer(cu, "PASSED", "muted"); }

// ------------------------------------------------------------------ auctions
const increment = p => Math.max(1, nice(p * 0.05));
const auctionFee = () => (AUCTION_FEE - 0.02 * S.up.auction) * (hasRole("auctioneer") ? 0.5 : 1);
const consignLimit = () => S.up.auction >= 2 ? 2 : 1;
function newLot() {
  const worth = Math.max(netWorth(), 2000);
  const sets = S.launched.filter(fid => { const p = setStatus(fid).setPrice; return p >= worth * 0.08 && p <= worth * 0.9; });
  const bidN = rint(2, 4);
  if (sets.length && rnd() < 0.12) {
    const fid = pick(sets), value = setStatus(fid).setPrice;
    S.lot = { kind: "set", fid, cid: cidsOf(fid)[0], holo: false, grade: 0, value, start: nice(value * 0.55), state: "open",
      winner: "", price: 0, bidders: shuffle(BIDDERS).slice(0, bidN).map(n => ({ name: n, max: round5(value * uni(0.8, 1.25)) })) };
    return;
  }
  const cards = allCards();
  const c = wpick(cards, cards.map(x => { const r = x.price / worth; return r >= 0.04 && r <= 0.8 ? 2 + x.r : r < 0.04 ? 0.3 : 0.03; }));
  const holo = rnd() < 0.2 && c.price * HOLO_MULT <= worth;
  const grade = rnd() < 0.15 ? pick([8, 9, 9, 10]) : 0;
  const condition = grade || rollCondition(), misprint = rollMisprint();
  const value = c.price * copyMult({ holo, grade, condition, misprint });
  S.lot = { kind: "card", cid: c.cid, holo, grade, condition, misprint, value, start: nice(value * 0.55), state: "open", winner: "", price: 0,
    serial: rint(1, c.printed),
    bidders: shuffle(BIDDERS).slice(0, bidN).map(n => ({ name: n, max: round5(value * uni(0.8, 1.25)) })) };
}
function lotLabel(lot = S.lot) {
  if (lot.kind === "set") return `the complete ${FR[lot.fid].name} set`;
  return `${lot.holo ? "HOLO " : ""}${lot.grade ? "graded " + lot.grade + " " : ""}${S.cards[lot.cid].name}`;
}
function winLot(price) {
  const lot = S.lot;
  if (!lot || lot.state !== "open") fail("That lot is already closed.");
  if (price > S.cash) fail(`You can't cover your bid of ${money(price)}.`);
  S.cash -= price;
  if (lot.kind === "set") {
    const ids = cidsOf(lot.fid), sum = ids.reduce((a, cid) => a + S.cards[cid].price, 0);
    ids.forEach(cid => addCopy(cid, { cost: price * S.cards[cid].price / sum }));
  } else addCopy(lot.cid, { holo: lot.holo, grade: lot.grade, condition: lot.condition, misprint: lot.misprint || "", cost: price, serial: lot.serial });
  Object.assign(lot, { state: "done", winner: "You", price });
  S.stats.auctions++; S.stats.bought++; progress("auction");
  say(`SOLD to you! You won ${lotLabel(lot)} for ${money(price)} (worth about ${money(lot.value)}).`, "good");
}
function loseLot(winner, price) {
  const lot = S.lot;
  if (!lot || lot.state !== "open") return;
  Object.assign(lot, { state: "done", winner, price });
  if (winner) say(`Auction: ${lotLabel(lot)} went to ${winner} for ${money(price)}.`);
}
function runConsign(value) {
  const boost = hasRole("auctioneer") ? 0.05 : 0;
  const bidders = shuffle(BIDDERS).slice(0, rint(2, 4)).map(n => [n, value * uni(0.78 + boost, 1.3 + boost)]);
  let price = nice(value * 0.5), leader = "";
  const bids = [];
  while (bids.length < 80) {
    const nxt = bids.length ? price + increment(price) : price;
    const able = bidders.filter(b => b[1] >= nxt && b[0] !== leader);
    if (!able.length) break;
    leader = pick(able)[0]; price = nxt;
    bids.push([leader, price]);
  }
  return { bids, price, leader, reserve: value * AUCTION_RESERVE, sold: bids.length > 0 && price >= value * AUCTION_RESERVE };
}
function checkConsign() {
  if (S.consignDay !== S.day) { S.consignDay = S.day; S.consigns = 0; }
  if (S.consigns >= consignLimit()) fail(consignLimit() > 1 ? "You've used both consignment slots today. Come back tomorrow." : "The auction house takes one consignment per day. Come back tomorrow.");
}
function consign(copyId) {
  checkConsign();
  const cp = copyById(copyId);
  if (!cp || cp.place !== "vault") fail("That card isn't in your vault.");
  const value = copyValue(cp), r = runConsign(value);
  S.consigns++;
  const res = Object.assign(r, { label: copyLabel(cp), value, net: 0, profit: 0, cid: cp.cid, holo: cp.holo, grade: cp.grade });
  if (r.sold) {
    const basis = takeCopies([cp]);
    res.net = round5(r.price * (1 - auctionFee()));
    res.profit = res.net - basis;
    S.cash += res.net; recordSale(1, res.profit); S.stats.consigned++; progress("consign");
    say(`HAMMER! Your ${res.label} sold to ${r.leader} for ${money(r.price)}. You got ${money(res.net)} after the house fee (${profitText(res.profit)}).`, res.profit >= 0 ? "good" : "bad");
  } else say(`No sale. Bids for your ${res.label} stayed under the reserve, so you keep it.`, "muted");
  return res;
}
function consignSet(fid) {
  checkConsign();
  const st = setStatus(fid);
  if (!st.complete) fail("Only complete sets from your Collection can go under the hammer as a set.");
  if (st.slots.some(cp => cp.place !== "album")) fail("Part of that set is out on loan right now.");
  const r = runConsign(st.value);
  S.consigns++;
  const res = Object.assign(r, { label: `complete ${FR[fid].name} set`, value: st.value, net: 0, profit: 0, fid, set: true });
  if (r.sold) {
    const basis = takeCopies(st.slots);
    res.net = round5(r.price * (1 - auctionFee()));
    res.profit = res.net - basis;
    S.cash += res.net; recordSale(4, res.profit); S.stats.consigned++; progress("consign");
    say(`HAMMER! Your ${res.label} sold to ${r.leader} for ${money(r.price)}. You got ${money(res.net)} (${profitText(res.profit)}).`, "good");
  } else say(`No sale. Bids for your ${res.label} stayed under the reserve, so it stays in your Collection.`, "muted");
  return res;
}

// ------------------------------------------------------------------ crates & boosters
function crateUnlocked(i) { return S.best >= CRATES[i].unlock; }
function avgPrice(r, pool) { const p = (pool || allCards()).filter(c => c.r === r).map(c => c.price); return p.length ? p.reduce((a, b) => a + b, 0) / p.length : 0; }
function cratePrice(i) {
  const k = CRATES[i];
  let ev = 0;
  k.odds.forEach((o, r) => { ev += o / 100 * avgPrice(r); });
  ev *= k.cards * (1 + k.holo * (HOLO_MULT - 1));
  return round5(Math.max(50, ev * (isConvention() ? 0.9 : 1)));
}
function boosterOdds(fid) { return cidsOf(fid).map(cid => RARITIES[S.cards[cid].r].weight); }
function boosterPrice(fid) {
  const ids = cidsOf(fid), w = boosterOdds(fid), tw = w.reduce((a, b) => a + b, 0);
  let ev = 0;
  ids.forEach((cid, i) => { ev += w[i] / tw * S.cards[cid].price; });
  ev *= 3 * (1 + BOOSTER_HOLO * (HOLO_MULT - 1));
  return round5(Math.max(50, ev * (isConvention() ? 0.9 : 1)));
}
function pullCard(odds) {
  let r = wpick([0, 1, 2, 3, 4], odds);
  let pool = ofRarity(r);
  while (!pool.length && r > 0) { r--; pool = ofRarity(r); }
  return pick(pool).cid;
}
function payOut(pulls, cost) {
  const total = pulls.reduce((a, p) => a + S.cards[p.cid].price * (p.holo ? HOLO_MULT : 1), 0);
  return pulls.map(p => addCopy(p.cid, { holo: p.holo, cost: cost * S.cards[p.cid].price * (p.holo ? HOLO_MULT : 1) / total }));
}
function openCrate(i, priceOverride) {
  const k = CRATES[i];
  if (!crateUnlocked(i) && priceOverride == null) {
    const rank = RANKS.find(r => r[0] === k.unlock);
    fail(`The ${k.name} unlocks at the ${rank[1]} rank (${money(k.unlock)} net worth).`);
  }
  const cost = priceOverride != null ? priceOverride : cratePrice(i);
  if (cost > S.cash) fail(`The ${k.name} costs ${money(cost)}. You have ${money(S.cash)}.`);
  S.cash -= cost; S.stats.crates++;
  const pulls = [];
  for (let n = 0; n < k.cards; n++) pulls.push({ cid: pullCard(k.odds), holo: rnd() < k.holo });
  const got = payOut(pulls, cost);
  progress("crate", Math.max(...got.map(cp => S.cards[cp.cid].r)));
  return { copies: got, cost, name: k.name };
}
function openBooster(fid) {
  if (!S.launched.includes(fid)) fail("That franchise hasn't premiered yet.");
  const cost = boosterPrice(fid);
  if (cost > S.cash) fail(`The ${FR[fid].name} booster costs ${money(cost)}. You have ${money(S.cash)}.`);
  S.cash -= cost; S.stats.crates++;
  const ids = cidsOf(fid), w = boosterOdds(fid);
  const pulls = [0, 1, 2].map(() => ({ cid: wpick(ids, w), holo: rnd() < BOOSTER_HOLO }));
  const got = payOut(pulls, cost);
  progress("crate", Math.max(...got.map(cp => S.cards[cp.cid].r)));
  return { copies: got, cost, name: `${FR[fid].name} Booster` };
}

// ------------------------------------------------------------------ grading lab
const labSlots = () => 2 + S.up.lab;
const labDays = () => S.up.lab > 0 ? 1 : 2;
const gradeFee = cp => Math.max(75, nice(copyValue(cp) * 0.03));
function sendToLab(copyId) {
  const cp = copyById(copyId);
  if (!cp || cp.place !== "vault") fail("That copy isn't in your vault.");
  if (cp.grade) fail("That copy is already graded and sealed in a slab.");
  if (S.copies.filter(x => x.place === "lab").length >= labSlots()) fail(`All ${labSlots()} grading slots are busy. Results come back in the morning.`);
  const fee = gradeFee(cp);
  if (fee > S.cash) fail(`Grading costs ${money(fee)}. You have ${money(S.cash)}.`);
  S.cash -= fee; cp.cost += fee;
  cp.place = "lab"; cp.until = S.day + labDays();
  say(`Sent ${copyLabel(cp)} to Vault Grading Co. for ${money(fee)}. Results on day ${cp.until}.`);
}
function processReturns() {
  for (const cp of S.copies) {
    if (cp.place === "lab" && cp.until <= S.day) {
      const g = physicalCondition(cp);
      cp.condition = g; cp.dmg = 0;
      cp.grade = g; cp.place = "vault";
      S.stats.graded++; if (g === 10) S.stats.gems++;
      progress("grade", g);
      S.reveals.push(cp.id);
      say(`GRADED: your ${S.cards[cp.cid].name} came back ${GRADES[g].label} ${g}. It's now worth ${money(copyValue(cp))}.`, g >= 9 ? "gold" : g >= 8 ? "good" : "muted");
    } else if (cp.place === "loan" && cp.until <= S.day) {
      cp.place = cp.home || "vault";
      if (cp.risk && rnd() < cp.risk) {
        cp.condition = Math.max(5, physicalCondition(cp) - 2); cp.grade = 0; cp.dmg = 0;
        say(`Your ${S.cards[cp.cid].name} came back from the film set with visible damage. Condition: ${CONDITION_NAMES[cp.condition]}. Its value has fallen; the lab can verify the wear.`, "bad");
      }
      else say(`Your ${S.cards[cp.cid].name} is back from its loan, safe and sound.`, "muted");
      cp.risk = 0;
    }
  }
}
function unzip(pairs) { return [pairs.map(p => p[0]), pairs.map(p => p[1])]; }

// ------------------------------------------------------------------ upgrades
const upgradeLevel = id => S.up[id] || 0;
function upgradeCost(id) { const u = UPGRADES.find(x => x.id === id); return u.costs[upgradeLevel(id)]; }
function buyUpgrade(id) {
  const u = UPGRADES.find(x => x.id === id);
  const cost = upgradeCost(id);
  if (cost == null) fail(`${u.name} is already fully upgraded.`);
  if (cost > S.cash) fail(`${u.name} costs ${money(cost)}. You have ${money(S.cash)}.`);
  S.cash -= cost; S.up[id] = upgradeLevel(id) + 1;
  say(`UPGRADE: ${u.name}${u.costs.length > 1 ? " level " + S.up[id] : ""} is ready. ${u.desc}`, "gold");
}

// ------------------------------------------------------------------ commissions
function makeQuest(kind) {
  const worth = Math.max(netWorth(), 5000);
  const weights = QUEST_KINDS.map(([k, w]) => (k === "inspect" && S.day > 20) ? 1 : w);
  kind = kind || wpick(QUEST_KINDS.map(q => q[0]), weights);
  const client = pick(CLIENTS);
  const q = { id: S.nextQuest, kind, client, have: 0, need: 1, rarity: -1, fid: "", amount: 0, reward: nice(worth * 0.015),
    due: S.day + rint(4, 8), state: "open", seen: [], title: "", text: "" };
  const cards = allCards();
  if (kind === "deliver") {
    q.reward = 0;
    const fids = S.launched.filter(fid => cidsOf(fid).some(cid => { const c = S.cards[cid]; return c.stock && c.price <= worth * 0.3; }));
    if (fids.length && rnd() < 0.55) {
      q.fid = pick(fids);
      q.title = `${client} loves ${FR[q.fid].name}`;
      q.text = `Bring ${client} any ${FR[q.fid].name} card. They pay ${Math.round(DELIVERY_PREMIUM * 100)}% of its market price.`;
    } else {
      let r = 0;
      for (let rr = 0; rr < RARITIES.length; rr++) { const p = ofRarity(rr).map(c => c.price); if (p.length && Math.min(...p) <= worth * 0.25) r = rr; }
      q.rarity = r;
      q.title = `A ${RARITIES[r].name} for ${client}`;
      q.text = `${client} wants any ${RARITIES[r].name} card for a private gallery and pays ${Math.round(DELIVERY_PREMIUM * 100)}% of its market price.`;
    }
  } else if (kind === "pair") {
    const opts = S.launched.filter(fid => {
      const ids = cidsOf(fid), have = ids.filter(ownsCard).length;
      return have < 2 && ids.filter(cid => S.cards[cid].price <= worth * 0.25).length >= 2;
    });
    if (!opts.length) return null;
    q.fid = pick(opts); q.need = 2; q.reward = nice(worth * 0.02);
    q.title = `A pair from ${FR[q.fid].name}`;
    q.text = `${client} wants to see two different ${FR[q.fid].name} cards in your shop at the same time.`;
  } else if (kind === "set") {
    const opts = S.launched.filter(fid => {
      const st = setStatus(fid);
      return !st.complete && st.marketSum <= worth * 0.6 && cidsOf(fid).some(ownsCard);
    });
    if (!opts.length) return null;
    q.fid = pick(opts); q.need = 4; q.due = S.day + rint(7, 12); q.reward = nice(worth * 0.035);
    q.title = `Complete ${FR[q.fid].name}`;
    q.text = `${client} wants to visit your gallery and see all four ${FR[q.fid].name} cards in your Collection.`;
  } else if (kind === "album") {
    q.need = rint(2, 3); q.reward = nice(worth * 0.012);
    q.title = "Grow your Collection";
    q.text = `Add ${q.need} cards to your personal Collection. ${client} is writing a magazine piece about it.`;
  } else if (kind === "grade") {
    if (!S.copies.some(cp => cp.place === "vault" && !cp.grade) && !S.copies.some(cp => cp.place === "lab")) return null;
    q.reward = nice(worth * 0.02); q.due = S.day + rint(6, 10);
    q.title = "Mint condition";
    q.text = `Send a card to the Grading Lab and get it back graded 9 or 10.`;
  } else if (kind === "profit") {
    q.amount = nice(worth * 0.03);
    q.title = "Show me a big sale";
    q.text = `${client} will invest if you make one sale with at least ${money(q.amount)} profit.`;
  } else if (kind === "busted") {
    q.reward = nice(worth * 0.02);
    q.title = "Catch a forger";
    q.text = "Forgers are working the Salon. Inspect a seller's card in 3D, look for the tell, and call out a fake.";
  } else if (kind === "deals") {
    q.need = 3; q.title = "Work the Salon";
    q.text = `${client} wants to see you close 3 deals with collectors in the Salon.`;
  } else if (kind === "auction") {
    q.reward = nice(worth * 0.02); q.title = "Win at the Auction House";
    q.text = `${client} dares you to win a lot at the Auction House.`;
  } else if (kind === "consign") {
    q.title = "Under the hammer";
    q.text = "Put one of your own cards (or a complete set) up at the Auction House and sell it.";
  } else if (kind === "crate") {
    q.rarity = crateUnlocked(1) ? 2 : 1;
    q.title = `Pull a ${RARITIES[q.rarity].name}`;
    q.text = `Open crates or boosters until you pull a ${RARITIES[q.rarity].name} or anything rarer.`;
  } else if (kind === "holo") {
    q.need = S.copies.filter(cp => cp.holo).length + 1; q.reward = nice(worth * 0.02);
    q.title = "Holo hunter";
    q.text = `Own ${plural(q.need, "holo card")} at the same time. Crates, auctions and Private Collectors have them.`;
  } else if (kind === "inspect") {
    q.need = 3; q.reward = nice(worth * 0.01);
    q.title = "A closer look";
    q.text = "Pick up 3 different cards and inspect them in 3D.";
  } else if (kind === "worth") {
    q.amount = nice(netWorth() * 1.2);
    q.title = "Grow the empire";
    q.text = `Reach a net worth of ${money(q.amount)} before the deadline.`;
  }
  S.nextQuest++;
  return q;
}
function newQuests() {
  for (const q of S.quests) if (q.state === "open" && S.day > q.due) { q.state = "expired"; say(`Commission expired: ${q.title}.`, "muted"); }
  S.quests = S.quests.filter(q => q.state === "open");
  let tries = 0;
  while (S.quests.length < 3 && tries++ < 40) {
    const q = makeQuest();
    if (q && !S.quests.some(x => x.kind === q.kind)) S.quests.push(q);
  }
}
function questFits(q, c) { return q.fid ? c.fid === q.fid : c.r === q.rarity; }
function deliverPick(q) {
  const fits = [...new Set(S.copies.filter(cp => cp.place === "vault" && !cp.holo && !cp.grade && !cp.dmg && !cp.misprint).map(cp => cp.cid))]
    .map(card).filter(c => questFits(q, c));
  return fits.sort((a, b) => a.price - b.price)[0] || null;
}
function deliver(q) {
  if (q.state !== "open" || q.kind !== "deliver") fail("That commission is closed.");
  const c = deliverPick(q);
  if (!c) fail("You don't have a regular copy that fits in your vault. Look in the Showroom!");
  const pay = round5(c.price * DELIVERY_PREMIUM);
  const basis = takeCopies([plainCopies(c.cid)[0]]);
  S.cash += pay;
  const profit = pay - basis;
  q.state = "done"; q.reward = pay; S.stats.quests++;
  say(`COMMISSION COMPLETE: ${q.client} paid ${money(pay)} for your ${c.name} (${profitText(profit)}).`, "quest");
  recordSale(1, profit);
  return { pay, profit };
}
function progress(kind, value = 1) {
  for (const q of S.quests) {
    if (q.state !== "open" || q.kind !== kind) continue;
    if (kind === "profit") { if (value >= q.amount) q.have = 1; }
    else if (kind === "crate") { if (value >= q.rarity) q.have = 1; }
    else if (kind === "grade") { if (value >= 9) q.have = 1; }
    else q.have = Math.min(q.need, q.have + 1);
  }
}
function noteInspect(cid) {
  for (const q of S.quests) if (q.state === "open" && q.kind === "inspect" && !q.seen.includes(cid)) {
    q.seen.push(cid); q.have = Math.min(q.need, q.seen.length);
  }
}
function checkQuests() {
  for (const q of S.quests) {
    if (q.state !== "open" || q.kind === "deliver") continue;
    if (q.kind === "pair") q.have = Math.min(q.need, cidsOf(q.fid).filter(ownsCard).length);
    else if (q.kind === "set") q.have = setStatus(q.fid).have;
    else if (q.kind === "holo") q.have = Math.min(q.need, S.copies.filter(cp => cp.holo).length);
    else if (q.kind === "worth") q.have = netWorth() >= q.amount ? 1 : 0;
    if (q.have >= q.need) {
      q.state = "done"; S.cash += q.reward; S.stats.quests++;
      say(`COMMISSION COMPLETE: ${q.title}! ${q.client} paid you ${money(q.reward)}.`, "quest");
    }
  }
}

// ------------------------------------------------------------------ trophies
function trophyTests() {
  const s = S.stats, sets = completeSets();
  return {
    first_job: s.quests >= 1, eagle_eye: s.busted >= 3, gavel: s.auctions >= 3, crate_raider: s.crates >= 10,
    regular: s.deals >= 20, full_set: sets.length >= 1, gem_mint: s.gems >= 1, pen_pal: s.letters >= 10,
    prismatic: S.copies.some(cp => cp.holo && S.cards[cp.cid].r >= 2),
    big_ticket: s.bestSale >= 50000, top_town: S.day >= 10 && rivalPlace() === 1 && S.rivals.length > 0,
    patron: s.quests >= 15, one_of_one: S.copies.some(cp => S.cards[cp.cid].r === 4),
    baron_sets: sets.length >= 5, millionaire: Math.max(S.best, netWorth()) >= 1e6,
    grail_keeper: sets.some(st => FR[st.fid].tier === "grail"),
  };
}
function checkTrophies() {
  const t = trophyTests();
  for (const [k, name, desc, reward] of TROPHIES) {
    if (!S.trophies.includes(k) && t[k]) {
      S.trophies.push(k); S.cash += reward;
      say(`TROPHY: ${name}! ${desc}. You earned ${money(reward)}.`, "title");
    }
  }
}

// ------------------------------------------------------------------ rivals
function tickRivals() {
  const pace = diff().rival;
  for (const r of S.rivals) {
    const info = RIVALS.find(x => x.id === r.id);
    const g = Math.log(GOAL / info.start) / 140 * pace;
    let jump = 0;
    if (rnd() < 0.05) { jump = uni(0.1, 0.25); if (rnd() < 0.5) say(`RIVALS: ${info.shop} pulled something huge and jumped ahead.`, "muted"); }
    if (rnd() < 0.04) { jump = -uni(0.08, 0.18); if (rnd() < 0.5) say(`RIVALS: ${info.shop} got stuck with a forgery. Ouch.`, "muted"); }
    r.worth = Math.max(1000, r.worth * Math.exp(g + gauss() * 0.045 + jump));
    r.hist.push(Math.round(r.worth));
    if (r.hist.length > HISTORY_DAYS) r.hist.splice(0, r.hist.length - HISTORY_DAYS);
  }
}

// ------------------------------------------------------------------ morning mail
function vaultPicks(minV, maxV) {
  return S.copies.filter(cp => cp.place === "vault" && copyValue(cp) >= minV && copyValue(cp) <= maxV);
}
const LETTERS = {
  film(w) {
    const opts = vaultPicks(w * 0.01, w * 0.6);
    if (!opts.length) return null;
    const cp = pick(opts), fee = Math.max(100, nice(copyValue(cp) * 0.06));
    return { from: "Starlight Pictures", title: "A role for your card",
      body: `We're shooting a heist movie and need a real ${copyLabel(cp)} for a close-up. Three days on set, then it comes straight back. ${S.up.climate ? "Your Climate Vault case keeps it perfectly safe." : "Film sets can be rough on cards (about a 1 in 8 chance of a scratch)."}`,
      choices: [`Lend it (+${money0(fee)})`, "Decline"], data: { copy: cp.id, fee } };
  },
  binder(w) {
    const price = clamp(nice(w * 0.05), 300, 80000);
    return { from: "Sunday Flea Market", title: "A mystery binder",
      body: `A man at the flea market has an old binder he swears is full of luxury cards. He wants ${money0(price)} for it, no peeking. Could be treasure. Could be junk.`,
      choices: [`Buy it (${money0(price)})`, "Pass"], data: { price } };
  },
  influencer(w) {
    const fids = S.launched.filter(fid => cidsOf(fid).some(cid => copiesOf(cid, "vault").length));
    if (!fids.length) return null;
    const fid = pick(fids);
    const cp = cidsOf(fid).flatMap(cid => copiesOf(cid, "vault")).sort((a, b) => copyValue(a) - copyValue(b))[0];
    return { from: "@CardQueen (2.1M followers)", title: "Let's go viral",
      body: `I want to feature ${FR[fid].name} on my channel this week! Send me your ${copyLabel(cp)} as a gift and all four ${FR[fid].name} cards will be the talk of the town.`,
      choices: [`Gift it (worth ${money0(copyValue(cp))})`, "No thanks"], data: { copy: cp.id, fid } };
  },
  rival(w) {
    const opts = vaultPicks(w * 0.02, Infinity);
    if (!opts.length) return null;
    const cp = pick(opts), r = pick(RIVALS), offer = round5(copyValue(cp) * uni(1.18, 1.35));
    return { from: `${r.owner}, ${r.shop}`, title: "An offer from a rival",
      body: `${pick(r.quote)} I'll pay ${money(offer)} for your ${copyLabel(cp)}. That's ${Math.round((offer / copyValue(cp) - 1) * 100)}% over market. Don't keep me waiting.`,
      choices: [`Sell it (+${money0(offer)})`, "Decline"], data: { copy: cp.id, offer, rival: r.id } };
  },
  trade(w) {
    for (const fid of shuffle(S.launched)) {
      const ids = cidsOf(fid);
      if (ids.filter(ownsCard).length < 2) continue;
      const missing = ids.filter(cid => !ownsCard(cid));
      if (!missing.length) continue;
      const want = S.cards[pick(missing)];
      const give = S.copies.filter(cp => cp.place === "vault" && S.cards[cp.cid].fid !== fid
        && copyValue(cp) >= want.price * 0.8 && copyValue(cp) <= want.price * 1.3);
      if (!give.length) continue;
      const cp = pick(give);
      return { from: `${pick(COLLECTORS)}, a fellow collector`, title: "Trade offer",
        body: `I hear you're building the ${FR[fid].name} set. I'll trade you my ${want.name} (market ${money0(want.price)}) for your ${copyLabel(cp)} (market ${money0(copyValue(cp))}). Straight swap.`,
        choices: ["Trade", "Decline"], data: { copy: cp.id, want: want.cid } };
    }
    return null;
  },
  charity(w) {
    const cp = S.copies.filter(x => x.place === "vault").sort((a, b) => copyValue(a) - copyValue(b))[0];
    const check = clamp(nice(w * 0.01), 100, 25000);
    const choices = [`Send a check (${money0(check)})`, "Decline"];
    if (cp) choices.unshift(`Donate ${S.cards[cp.cid].name}`);
    return { from: "The Children's Hospital Gala", title: "A night for a good cause",
      body: `Our charity auction needs one treasure. Donors are honored on stage, and collectors remember generous shops: buyers in your Salon will pay a little more for a few days.${cp ? ` Your ${copyLabel(cp)} would be perfect.` : ""}`,
      choices, data: { copy: cp ? cp.id : 0, check } };
  },
  booth(w) {
    if (isConvention() || (S.day + 1) % 7 === 0) return null;
    const fee = clamp(nice(w * 0.02), 250, 30000);
    return { from: "Grand Collectors Convention", title: "Booth available tomorrow",
      body: `A booth opened up for tomorrow's pop-up convention. Rent it and tomorrow becomes a Convention Day for your shop: two extra collectors, a guaranteed Set Hunter, and 10% off crates.`,
      choices: [`Rent it (${money0(fee)})`, "Skip it"], data: { fee } };
  },
  sealed(w) {
    const opts = CRATES.map((k, i) => i).filter(crateUnlocked);
    const i = opts[opts.length - 1];
    const price = round5(cratePrice(i) * 0.75);
    if (price > S.cash * 0.6) return null;
    return { from: "An estate lawyer", title: `An unopened ${CRATES[i].name}`,
      body: `The estate includes a factory sealed ${CRATES[i].name} from years ago. Yours for ${money0(price)}, 25% under today's price. (Between us, a few of these have been resealed by crooks.)`,
      choices: [`Buy it (${money0(price)})`, "Pass"], data: { crate: i, price } };
  },
  museum(w) {
    const sets = completeSets();
    if (!sets.length) return null;
    const st = pick(sets), fee = nice(st.value * 0.04);
    return { from: "The National Museum of Cards", title: "Exhibit request",
      body: `We'd be honored to display your complete ${FR[st.fid].name} set for four days. The museum pays a ${money0(fee)} loan fee, and your gallery gains prestige.`,
      choices: [`Lend the set (+${money0(fee)})`, "Decline"], data: { fid: st.fid, fee } };
  },
};
const LETTER_WEIGHTS = { film: 12, binder: 12, influencer: 10, rival: 12, trade: 14, charity: 8, booth: 8, sealed: 8, museum: 10 };
function makeLetter() {
  if (S.day > 2 && rnd() > 0.65) return null;
  const w = Math.max(netWorth(), 5000);
  const kinds = shuffle(Object.keys(LETTERS)).filter(k => k !== S.lastLetter);
  const weights = kinds.map(k => LETTER_WEIGHTS[k]);
  for (let tries = 0; tries < 8 && kinds.length; tries++) {
    const k = wpick(kinds, weights);
    const letter = LETTERS[k](w);
    if (letter) { S.lastLetter = k; return Object.assign(letter, { kind: k, day: S.day }); }
    const i = kinds.indexOf(k); kinds.splice(i, 1); weights.splice(i, 1);
  }
  return null;
}
function answerLetter(choice) {
  const m = S.mail;
  if (!m) fail("No letter to answer.");
  const d = m.data, decline = choice === m.choices.length - 1;
  let result = { text: "You politely declined.", tone: "muted" };
  if (decline) { S.mail = null; S.stats.letters++; checkTrophies(); return result; }
  const cp = d.copy ? copyById(d.copy) : null;
  const gone = () => fail("That card isn't in your vault anymore.");
  if (m.kind === "film") {
    if (!cp || cp.place !== "vault") gone();
    cp.place = "loan"; cp.home = "vault"; cp.until = S.day + 3; cp.risk = S.up.climate ? 0 : 0.12;
    S.cash += d.fee;
    result = { text: `Your ${S.cards[cp.cid].name} is off to the film set until day ${cp.until}. You earned ${money(d.fee)}.`, tone: "good" };
  } else if (m.kind === "binder") {
    if (d.price > S.cash) fail(`You need ${money(d.price)}.`);
    S.cash -= d.price;
    const target = d.price * wpick([0.4, 0.7, 0.9, 1.1, 1.3, 1.8, 2.6], [12, 18, 20, 20, 14, 10, 6]);
    const pulls = [];
    let left = target;
    const pool = allCards().slice().sort((a, b) => b.price - a.price);
    for (let n = 0; n < 4; n++) {
      const fits = pool.filter(c => c.price <= left);
      const c = fits.length ? pick(fits.slice(0, 6)) : pool[pool.length - 1];
      pulls.push({ cid: c.cid, holo: false });
      left -= c.price;
      if (left < pool[pool.length - 1].price * 0.6) break;
    }
    const got = payOut(pulls, d.price);
    const total = got.reduce((a, x) => a + copyValue(x), 0);
    result = { text: `Inside the binder: ${got.map(x => S.cards[x.cid].name).join(", ")}. Worth ${money(total)} in total (${total >= d.price ? "a win!" : "not great"}).`,
      tone: total >= d.price ? "good" : "bad", copies: got };
  } else if (m.kind === "influencer") {
    if (!cp || cp.place !== "vault") gone();
    S.stats.profit -= cp.cost; removeCopy(cp);
    for (const cid of cidsOf(d.fid)) { const c = S.cards[cid]; c.trend = 1; c.tdays = rint(3, 5); c.price *= 1.06; }
    result = { text: `@CardQueen loved it! All four ${FR[d.fid].name} cards are trending up.`, tone: "good" };
  } else if (m.kind === "rival") {
    if (!cp || cp.place !== "vault") gone();
    const basis = takeCopies([cp]);
    S.cash += d.offer; recordSale(1, d.offer - basis);
    const r = S.rivals.find(x => x.id === d.rival); if (r) r.worth += d.offer * 0.8;
    result = { text: `Sold to your rival for ${money(d.offer)} (${profitText(d.offer - basis)}).`, tone: "good" };
  } else if (m.kind === "trade") {
    if (!cp || cp.place !== "vault") gone();
    const cost = cp.cost; removeCopy(cp);
    addCopy(d.want, { cost });
    result = { text: `Trade done. ${S.cards[d.want].name} is in your vault. Add it to your Collection!`, tone: "good" };
  } else if (m.kind === "charity") {
    if (cp && choice === 0) {
      if (cp.place !== "vault") gone();
      S.prestigeBonus += RARITIES[S.cards[cp.cid].r].pts * 3 + 2;
      S.stats.profit -= cp.cost; removeCopy(cp);
      S.buffs.goodwill = S.day + 5;
      result = { text: "The crowd gave you a standing ovation. +prestige, and Salon buyers pay 5% more for five days.", tone: "good" };
    } else {
      if (d.check > S.cash) fail(`You need ${money(d.check)}.`);
      S.cash -= d.check; S.prestigeBonus += 1; S.buffs.goodwill = S.day + 3;
      result = { text: "Your check was read aloud at the gala. Salon buyers pay 5% more for three days.", tone: "good" };
    }
  } else if (m.kind === "booth") {
    if (d.fee > S.cash) fail(`You need ${money(d.fee)}.`);
    S.cash -= d.fee; S.buffs.convention = S.day + 1;
    result = { text: "Booth booked. Tomorrow is a Convention Day!", tone: "good" };
  } else if (m.kind === "sealed") {
    if (d.price > S.cash) fail(`You need ${money(d.price)}.`);
    const opened = openCrate(d.crate, d.price);
    if (rnd() < 0.15) {
      const keep = opened.copies.sort((a, b) => copyValue(a) - copyValue(b))[0];
      for (const x of opened.copies) if (x !== keep) removeCopy(x);
      keep.cost = d.price;
      opened.copies = [keep];
      result = { text: `Resealed by crooks! Only a ${S.cards[keep.cid].name} was inside.`, tone: "bad", copies: opened.copies };
    } else result = { text: `Factory fresh! You pulled ${opened.copies.map(x => (x.holo ? "HOLO " : "") + S.cards[x.cid].name).join(", ")}.`, tone: "good", copies: opened.copies };
  } else if (m.kind === "museum") {
    const st = setStatus(d.fid);
    if (!st.complete || st.slots.some(x => x.place !== "album")) fail("The set isn't complete in your Collection anymore.");
    for (const x of st.slots) { x.place = "loan"; x.home = "album"; x.until = S.day + 4; x.risk = 0; }
    S.cash += d.fee; S.prestigeBonus += TIERS[FR[d.fid].tier].pts;
    result = { text: `The ${FR[d.fid].name} set is on exhibit until day ${S.day + 4}. You earned ${money(d.fee)} and prestige.`, tone: "good" };
  }
  S.mail = null;
  S.stats.letters++;
  say(`LETTER: ${result.text}`, result.tone);
  settle();
  return result;
}

// ------------------------------------------------------------------ player actions
function buy(cid, qty) {
  const c = S.cards[cid];
  if (!c) fail("That card is not in the Showroom.");
  if (c.stock <= 0) fail(`${c.name} is sold out today. New stock arrives tomorrow.`);
  if (buyPrice(c) > S.cash) fail(`You need ${money(buyPrice(c))} but only have ${money(S.cash)}.`);
  let got = 0, spent = 0;
  while (got < qty && c.stock > 0 && buyPrice(c) <= S.cash) {
    const each = buyPrice(c);
    S.cash -= each; spent += each; got++; c.stock--;
    c.price *= 1 + RARITIES[c.r].impact;
    // Showroom listings are standard near-mint stock, exactly as previewed.
    addCopy(cid, { cost: each, condition: 8, misprint: "" });
    S.stats.bought++;
  }
  return { got, spent };
}
function sellCopies(list) {
  if (list.some(cp => cp.place !== "vault")) fail("Unlock stored cards and return them to trading before selling.");
  let earned = 0, basis = 0;
  for (const cp of list) {
    const c = S.cards[cp.cid];
    earned += copySell(cp);
    c.price = Math.max(1, c.price * (1 - RARITIES[c.r].impact));
    if (!cp.holo && !cp.grade) c.stock++;
    basis += cp.cost; removeCopy(cp);
  }
  S.cash += earned;
  const profit = earned - basis;
  recordSale(list.length, profit);
  return { qty: list.length, earned, profit };
}
function sellGroup(key, qty) {
  const g = groups("vault").find(x => x.key === key);
  if (!g) fail("You don't have that card in your vault.");
  return sellCopies(g.copies.slice(0, Math.min(qty, g.qty)));
}
function sellAdvised() {
  const list = [];
  for (const g of groups("vault")) if (advice(S.cards[g.cid], g)[0] === "SELL") list.push(...g.copies);
  if (!list.length) fail("Nothing in your vault says SELL right now.");
  return sellCopies(list);
}

function nextDay() {
  const before = netWorth();
  S.day++;
  S.tip = null;
  tickPrices();
  if (S.queue.length && S.day >= S.nextLaunch) { launch(S.queue.shift()); S.nextLaunch = S.day + rint(4, 7); }
  randomEvent();
  restock();
  processReturns();
  const tickets = galleryIncome();
  S.lastTickets = tickets;
  if (tickets >= 1) { S.cash += tickets; S.stats.tickets = (S.stats.tickets || 0) + tickets; }
  tickRivals();
  if (hasRole("scout")) {
    const soon = allCards().filter(c => c.tdays <= 1 && !isHot(c));
    if (soon.length) {
      const c = pick(soon);
      c.next = uni(0.6, 1);
      S.tip = { cid: c.cid, text: `${roleName("scout")} (Scout): "Word on the street is ${c.name} starts climbing in a day or two. Buy before everyone else does."` };
    }
  }
  newCustomers(); newLot(); newQuests();
  S.mail = makeLetter();
  S.worth.push(Math.round(netWorth()));
  if (S.worth.length > HISTORY_DAYS) S.worth.splice(0, S.worth.length - HISTORY_DAYS);
  if (isConvention()) say("CONVENTION DAY! Extra collectors, a Set Hunter in the Salon, and 10% off every crate.", "gold");
  settle();
  return { before, after: netWorth(), tickets };
}

function settle() {
  checkQuests();
  checkTrophies();
  for (;;) {
    const before = rankIndex();
    S.best = Math.max(S.best, netWorth());
    const after = rankIndex();
    if (after === before) break;
    for (let i = before + 1; i <= after; i++) {
      const [need, name, bonus] = RANKS[i];
      S.cash += bonus;
      const unlocked = CRATES.filter(k => k.unlock === need).map(k => k.name);
      say(`RANK UP: ${name}! You earned a ${money(bonus)} bonus.${unlocked.length ? ` ${unlocked[0]}s are now unlocked!` : ""}`, "title");
    }
  }
  if (S.worth.length) S.worth[S.worth.length - 1] = Math.round(netWorth());
  if (!S.won && S.best >= GOAL) {
    S.won = true;
    const first = S.rivals.every(r => r.worth < GOAL);
    say(`YOU DID IT! ${S.shop.name} is the top luxury vault in the city. You became the Vault Tycoon on day ${S.day}${first ? ", ahead of every rival" : ""}!`, "win");
  }
  const active = S.copies.length > 0;
  if (!active) {
    const stocked = allCards().filter(c => c.stock > 0).map(buyPrice);
    const cheapest = Math.min(...stocked, cratePrice(0));
    const seller = S.customers.some(c => c.side === "sell" && c.state === "open" && c.price <= S.cash);
    S.over = S.cash < cheapest && !seller;
  } else S.over = false;
}

function newGame(setup) {
  const d = DIFFICULTIES[setup.diff] || DIFFICULTIES.classic;
  THUMBS.clear();
  FRESH = [];
  S = { v: SAVE_VERSION, created: Date.now(), savedAt: 0, day: 1, cash: d.cash, diff: setup.diff, color: setup.color || "gold",
    shop: { name: setup.shop, owner: setup.owner, partners: setup.partners || [] },
    cards: {}, launched: [], queue: [], nextLaunch: 5, copies: [], nextId: 1, customers: [], nextCust: 1,
    quests: [], nextQuest: 1, lot: null, consigns: 0, consignDay: 0, trophies: [], log: [], worth: [], best: 0,
    won: false, over: false, mail: null, lastLetter: "", reveals: [], tip: null, lastTickets: 0, prestigeBonus: 0,
    buffs: { goodwill: 0, convention: 0 },
    stats: { bought: 0, sold: 0, profit: 0, bestSale: 0, crates: 0, lost: 0, busted: 0, deals: 0, auctions: 0,
      consigned: 0, quests: 0, graded: 0, gems: 0, letters: 0, sets: 0, setsSold: 0, tickets: 0 },
    up: Object.fromEntries(UPGRADES.map(u => [u.id, 0])),
    rivals: RIVALS.map(r => ({ id: r.id, worth: r.start * (setup.diff === "relaxed" ? 0.8 : setup.diff === "cutthroat" ? 1.25 : 1), hist: [] })) };
  for (const f of FRANCHISES) if (f.start) launch(f.id, true);
  const rest = FRANCHISES.filter(f => !f.start);
  const order = { classic: 0, standard: 1, premium: 2, grail: 3 };
  S.queue = rest.map(f => [f.id, order[f.tier] + rnd() * 2.2]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  for (let i = 0; i < 30; i++) tickPrices();
  for (const c of allCards()) c.released = -30;
  restock();
  for (const c of shuffle(ofRarity(0)).slice(0, 2)) addCopy(c.cid, { cost: c.price });
  S.best = netWorth();
  S.worth = [Math.round(S.best)];
  for (const r of S.rivals) r.hist = [Math.round(r.worth)];
  newCustomers(); newLot(); newQuests();
  say(`Welcome to ${S.shop.name}! Your great aunt left you her luxury vault, two Legendary cards and ${money(d.cash)}. Tip: start your Collection, and look out for Call of Drago.`, "gold");
  settle();
}

function loadState(data) {
  if (!data || data.v !== SAVE_VERSION || !data.cards || !data.shop) throw new Error("not a Card Shop Tycoon 3 save");
  S = data;
  FRESH = [];
  S.buffs = S.buffs || { goodwill: 0, convention: 0 };
  S.reveals = S.reveals || [];
  // Preserve old shops and old certificates; new raw traits are deterministic.
  for (const cp of S.copies) {
    cp.condition = cp.grade || cp.condition || 8;
    cp.misprint = MISPRINTS[cp.misprint] ? cp.misprint : "";
  }
  for (const cu of S.customers || []) {
    cu.condition = cu.grade || cu.condition || 8; cu.misprint = cu.misprint || "";
  }
  if (S.lot) { S.lot.condition = S.lot.grade || S.lot.condition || 8; S.lot.misprint = S.lot.misprint || ""; }
  for (const f of FRANCHISES) {
    if (S.launched.includes(f.id) || S.queue.includes(f.id)) continue;
    if (f.start) launch(f.id, true); else S.queue.push(f.id);
  }
  THUMBS.clear();
  for (const u of UPGRADES) if (S.up[u.id] == null) S.up[u.id] = 0;
  return S;
}
/* =====================================================================
   Part 3: card printing. Every card face is painted on canvases:
   a color layer, a material layer (red = metal foil, green = holo,
   blue = embossed height) and a UV layer (what glows under a UV lamp).
   ===================================================================== */

const CW = 1000, CH = 1397;                       // a 63 × 88 mm card in print units
const FOILS = [
  { base: "#d6a945", hi: "#fff0b3", lo: "#6e4a12" },   // Legendary: gold
  { base: "#e39b84", hi: "#ffe3d8", lo: "#7a3527" },   // Mythic: rose gold
  { base: "#bfb2ea", hi: "#f6f2ff", lo: "#4a3d7c" },   // Royal: amethyst silver
  { base: "#a8e6df", hi: "#f2fffd", lo: "#2a6964" },   // Cosmic: platinum
  { base: "#efe6cf", hi: "#ffffff", lo: "#857652" },   // Ultra: white gold, prismatic
];
const FONT_DISPLAY = '"Cinzel", "Trajan Pro", "Times New Roman", Georgia, serif';
const FONT_BODY = '"Figtree", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

function seeded(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }
const M = (metal, holo, height) => `rgb(${Math.round(metal * 255)},${Math.round(holo * 255)},${Math.round(height * 255)})`;

function rrPath(x, y, w, h, r) {
  const p = new Path2D();
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.arcTo(x + w, y, x + w, y + r, r);
  p.lineTo(x + w, y + h - r); p.arcTo(x + w, y + h, x + w - r, y + h, r);
  p.lineTo(x + r, y + h); p.arcTo(x, y + h, x, y + h - r, r);
  p.lineTo(x, y + r); p.arcTo(x, y, x + r, y, r); p.closePath();
  return p;
}
function misspell(name) {
  const words = name.split(" ");
  let i = words.findIndex(w => w.length >= 5);
  if (i < 0) i = 0;
  const w = words[i];
  for (let j = Math.max(1, Math.floor(w.length / 2) - 1); j < w.length - 1; j++) {
    if (w[j] !== w[j + 1] && /[a-z]/i.test(w[j]) && /[a-z]/i.test(w[j + 1])) {
      words[i] = w.slice(0, j) + w[j + 1] + w[j] + w.slice(j + 2);
      return words.join(" ");
    }
  }
  return name + "e";
}
function serialText(serial, printed) {
  const n = String(Math.max(printed, 10)).length;
  return `No. ${String(serial).padStart(n, "0")} / ${String(printed).padStart(n, "0")}`;
}
function palette(f) {
  return { sky: f.sky, dark: f.dark, glow: f.glow, rim: mix(f.glow, "#ffffff", 0.35),
    mid: mix(f.dark, f.sky[1], 0.55), far: mix(f.sky[1], f.sky[2], 0.35) };
}
function newCanvas(w, h) { const c = document.createElement("canvas"); c.width = Math.round(w); c.height = Math.round(h); return c; }
function fitFont(ctx, text, weight, family, size, maxW) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > size * 0.45) { s -= 2; ctx.font = `${weight} ${s}px ${family}`; }
  return s;
}

/* ---------------------------------------------------------------- art helpers */
function silhouette(ctx, path, P, s, opt = {}) {
  ctx.save();
  if (opt.aura !== 0) { ctx.shadowColor = rgba(P.glow, 0.85); ctx.shadowBlur = (opt.aura || 26) * s; }
  ctx.fillStyle = P.dark; ctx.fill(path);
  ctx.restore();
  ctx.save();
  ctx.clip(path);
  ctx.fillStyle = opt.rim || P.rim; ctx.fill(path);
  ctx.translate(1.3 * s, 0.8 * s);
  const g = ctx.createLinearGradient(0, opt.top || 0, 0, opt.bottom || 400 * s);
  g.addColorStop(0, opt.body0 || mix(P.dark, P.mid, 0.55)); g.addColorStop(1, opt.body1 || P.dark);
  ctx.fillStyle = g; ctx.fill(path);
  ctx.restore();
}
function glowDot(ctx, x, y, r, color, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba("#ffffff", a)); g.addColorStop(0.25, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function local(path, x, y, s, flip) { const out = new Path2D(); out.addPath(path, new DOMMatrix([flip ? -s : s, 0, 0, s, x, y])); return out; }
function poly(pts, close = true) { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); if (close) p.closePath(); return p; }
// A tapered tube along a smooth curve (serpents, tentacles, tails)
function tube(pts, w0, w1, samples = 60) {
  const cr = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return [0, 1].map(k => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
  };
  const line = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const steps = Math.ceil(samples / (pts.length - 1));
    for (let k = 0; k < steps; k++) line.push(cr(p0, p1, p2, p3, k / steps));
  }
  line.push(pts[pts.length - 1]);
  const left = [], right = [];
  line.forEach((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const t = i / (line.length - 1), w = (w0 + (w1 - w0) * t) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]); right.push([p[0] - nx * w, p[1] - ny * w]);
  });
  return { path: poly(left.concat(right.reverse())), line, left, right: right.reverse() };
}

/* ---------------------------------------------------------------- scenery */
function ridge(ctx, w, h, y0, amp, n, rng, color, opt = {}) {
  ctx.beginPath(); ctx.moveTo(0, h);
  let x = 0; ctx.lineTo(0, y0 - rng() * amp);
  const step = w / n;
  while (x < w) {
    x += step * (0.6 + rng() * 0.8);
    const y = y0 - amp * (opt.round ? Math.pow(rng(), 0.7) : rng());
    if (opt.round) { const cx = x - step * 0.5; ctx.quadraticCurveTo(cx, y - amp * 0.4, x, y); }
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}
function skyline(ctx, w, h, base, maxH, rng, color, lit, density = 1) {
  let x = -10;
  ctx.fillStyle = color;
  const wins = [];
  while (x < w) {
    const bw = (18 + rng() * 46) * w / 840, bh = maxH * (0.35 + rng() * 0.65);
    ctx.fillRect(x, base - bh, bw, bh + h);
    if (rng() < 0.3) ctx.fillRect(x + bw * 0.4, base - bh - 18 * w / 840, 2 * w / 840, 18 * w / 840);
    for (let wy = base - bh + 8; wy < base - 6; wy += 11 * w / 840)
      for (let wx = x + 4; wx < x + bw - 6; wx += 9 * w / 840) if (rng() < 0.22 * density) wins.push([wx, wy]);
    x += bw + rng() * 6;
  }
  if (lit) { ctx.fillStyle = lit; for (const [wx, wy] of wins) ctx.fillRect(wx, wy, 3.2 * w / 840, 4.5 * w / 840); }
}
function particles(ctx, w, h, rng, kind, P) {
  const s = w / 840;
  if (kind === "stars") {
    for (let i = 0; i < 160; i++) { ctx.fillStyle = rgba("#ffffff", 0.2 + rng() * 0.8); const r = rng() < 0.92 ? 0.7 * s : 1.6 * s; ctx.fillRect(rng() * w, rng() * h * 0.75, r, r); }
    for (let i = 0; i < 5; i++) glowDot(ctx, rng() * w, rng() * h * 0.5, 7 * s, "#ffffff", 0.5);
  } else if (kind === "embers") {
    for (let i = 0; i < 70; i++) glowDot(ctx, rng() * w, rng() * h, (1.5 + rng() * 3.5) * s, rng() < 0.5 ? "#ff8a3a" : "#ffd27a", 0.5 + rng() * 0.5);
  } else if (kind === "bubbles") {
    ctx.strokeStyle = rgba(P.glow, 0.45); ctx.lineWidth = 1.2 * s;
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(rng() * w, rng() * h, (2 + rng() * 6) * s, 0, 7); ctx.stroke(); }
  } else if (kind === "snow") {
    for (let i = 0; i < 120; i++) { ctx.fillStyle = rgba("#ffffff", 0.3 + rng() * 0.6); ctx.beginPath(); ctx.arc(rng() * w, rng() * h, (0.8 + rng() * 2.2) * s, 0, 7); ctx.fill(); }
  } else if (kind === "rain") {
    ctx.strokeStyle = rgba("#cfe0ff", 0.22); ctx.lineWidth = 1 * s;
    for (let i = 0; i < 140; i++) { const x = rng() * w, y = rng() * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6 * s, y + 22 * s); ctx.stroke(); }
  } else if (kind === "motes") {
    for (let i = 0; i < 45; i++) glowDot(ctx, rng() * w, rng() * h, (2 + rng() * 4) * s, P.glow, 0.35 + rng() * 0.5);
  } else if (kind === "sand") {
    for (let i = 0; i < 160; i++) { ctx.fillStyle = rgba("#ffe0a0", 0.15 + rng() * 0.35); ctx.fillRect(rng() * w, rng() * h, 1.6 * s, 0.8 * s); }
  }
}
function lightRays(ctx, w, h, x, y, color, n, rng, a = 0.12) {
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const ang = Math.PI / 2 + (rng() - 0.5) * 1.3, len = h * 1.4, spread = 0.03 + rng() * 0.05;
    const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len);
    ctx.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len); ctx.fill();
  }
  ctx.restore();
}
function drawScene(ctx, w, h, f, P, rng) {
  const s = w / 840;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, f.sky[0]); sky.addColorStop(0.55, f.sky[1]); sky.addColorStop(0.9, f.sky[2]); sky.addColorStop(1, f.sky[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const land = f.land;
  const L = (t) => mix(P.dark, P.far, t);
  if (["space", "void", "arcane", "ice", "castle", "city", "noir"].includes(land)) particles(ctx, w, h, rng, "stars", P);
  if (land === "volcano") {
    glowDot(ctx, w * 0.5, h * 0.95, h * 0.9, "#ff5a1f", 0.55);
    ridge(ctx, w, h, h * 0.62, h * 0.18, 9, rng, L(0.45));
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = rgba("#ff7a2f", 0.8); ctx.lineWidth = 3 * s; ctx.shadowColor = "#ff5a1f"; ctx.shadowBlur = 14 * s;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); let x = rng() * w, y = h * 0.62; ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rng() - 0.5) * 40 * s; y += 22 * s; ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.restore();
    ridge(ctx, w, h, h * 0.86, h * 0.12, 7, rng, L(0.1));
    particles(ctx, w, h, rng, "embers", P);
  } else if (land === "city" || land === "noir" || land === "brass" || land === "ruins") {
    if (land === "city") glowDot(ctx, w * 0.72, h * 0.3, h * 0.42, "#ff4fa3", 0.55), glowDot(ctx, w * 0.72, h * 0.3, h * 0.16, "#ffd0ea", 0.9);
    if (land === "noir") glowDot(ctx, w * 0.25, h * 0.22, h * 0.25, "#e8e2c9", 0.35);
    if (land === "brass" || land === "ruins") glowDot(ctx, w * 0.5, h * 0.62, h * 0.7, P.sky[2], 0.5);
    skyline(ctx, w, h, h * 0.78, h * 0.5, rng, L(0.5), land === "ruins" ? null : rgba(P.glow, 0.5), 0.6);
    if (land === "brass") { ctx.fillStyle = L(0.35); for (let i = 0; i < 5; i++) { const x = rng() * w; ctx.fillRect(x, h * 0.2, 12 * s, h); glowDot(ctx, x + 6 * s, h * 0.18, 40 * s, "#d8c3a0", 0.25); } }
    skyline(ctx, w, h, h * 0.92, h * 0.38, rng, L(0.12), land === "city" ? rgba("#3ff0ff", 0.85) : land === "ruins" ? null : rgba(P.glow, 0.8), 1);
    if (land === "city") { for (let i = 0; i < 6; i++) { ctx.fillStyle = rgba(rng() < 0.5 ? "#ff3fb0" : "#3ff0ff", 0.9); ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12 * s; ctx.fillRect(rng() * w, h * (0.55 + rng() * 0.25), (10 + rng() * 26) * s, 4 * s); } ctx.shadowBlur = 0; }
    if (land === "noir") particles(ctx, w, h, rng, "rain", P);
  } else if (land === "castle" || land === "ash") {
    glowDot(ctx, w * 0.3, h * 0.28, h * 0.22, land === "ash" ? "#ff6a2a" : "#f2f6ff", land === "ash" ? 0.6 : 0.5);
    ridge(ctx, w, h, h * 0.66, h * 0.16, 6, rng, L(0.5), { round: true });
    ctx.fillStyle = L(0.35);
    for (let i = 0; i < 3; i++) { const x = rng() * w, y = h * (0.58 + rng() * 0.08); ctx.fillRect(x, y - 40 * s, 14 * s, 60 * s); ctx.fillRect(x - 10 * s, y - 10 * s, 34 * s, 40 * s); }
    ridge(ctx, w, h, h * 0.88, h * 0.1, 5, rng, L(0.12), { round: true });
    if (land === "ash") particles(ctx, w, h, rng, "embers", P);
  } else if (land === "theater") {
    const spot = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, h * 0.6);
    spot.addColorStop(0, rgba("#ffd7a8", 0.45)); spot.addColorStop(1, rgba("#ffd7a8", 0));
    ctx.fillStyle = spot; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = L(0.1); ctx.fillRect(0, h * 0.84, w, h);
    ctx.strokeStyle = rgba("#ffd7a8", 0.12); ctx.lineWidth = 1.5 * s;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * 20 * s, h * 0.84); ctx.lineTo(w / 2 + i * 90 * s, h); ctx.stroke(); }
    for (const side of [0, 1]) {
      for (let k = 0; k < 7; k++) {
        const x = side ? w - k * 16 * s - 16 * s : k * 16 * s;
        const g = ctx.createLinearGradient(x, 0, x + 16 * s, 0);
        g.addColorStop(0, "#3a0510"); g.addColorStop(0.5, "#9c1830"); g.addColorStop(1, "#3a0510");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 16 * s, 0);
        ctx.quadraticCurveTo(x + 16 * s + (side ? -1 : 1) * k * 6 * s, h * 0.6, x + 16 * s + (side ? -1 : 1) * k * 3 * s, h); ctx.lineTo(x, h); ctx.fill();
      }
    }
    const val = ctx.createLinearGradient(0, 0, 0, h * 0.12);
    val.addColorStop(0, "#5a0918"); val.addColorStop(1, "#2a030a");
    ctx.fillStyle = val; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.1);
    for (let i = 8; i >= 0; i--) ctx.quadraticCurveTo(w * (i + 0.5) / 9, h * 0.16, w * i / 9, h * 0.1);
    ctx.fill();
    particles(ctx, w, h, rng, "motes", P);
  } else if (land === "abyss") {
    lightRays(ctx, w, h, w * 0.6, -h * 0.1, "#bff8ff", 9, rng, 0.1);
    ctx.fillStyle = L(0.35); for (let i = 0; i < 9; i++) { const x = rng() * w; ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + (rng() - 0.5) * 60 * s, h * 0.7, x + (rng() - 0.5) * 30 * s, h * (0.45 + rng() * 0.2)); ctx.lineTo(x + 6 * s, h); ctx.fill(); }
    ridge(ctx, w, h, h * 0.92, h * 0.1, 8, rng, L(0.08), { round: true });
    particles(ctx, w, h, rng, "bubbles", P);
  } else if (land === "clouds") {
    glowDot(ctx, w * 0.5, h * 0.35, h * 0.7, "#fff4d6", 0.7);
    lightRays(ctx, w, h, w * 0.5, h * 0.2, "#fff1c4", 10, rng, 0.08);
    for (let layer = 0; layer < 3; layer++) {
      const y = h * (0.7 + layer * 0.11), col = mix(P.sky[2], layer === 2 ? "#ffffff" : P.sky[1], 0.3 + layer * 0.2);
      ctx.fillStyle = col;
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(rng() * w, y + rng() * 20 * s, (50 + rng() * 60) * s, 0, 7); ctx.fill(); }
    }
    particles(ctx, w, h, rng, "motes", P);
  } else if (land === "desert") {
    glowDot(ctx, w * 0.5, h * 0.5, h * 0.95, "#ffd27a", 0.55);
    ctx.fillStyle = "#fff2c4"; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.52, h * 0.24, 0, 7); ctx.fill();
    for (let layer = 0; layer < 3; layer++) {
      const base = h * (0.72 + layer * 0.1), col = mix(P.sky[2], P.dark, 0.35 + layer * 0.25);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 8 * s) ctx.lineTo(x, base + Math.sin(x / w * (3 + layer) * Math.PI + layer * 2 + rng()) * 18 * s);
      ctx.lineTo(w, h); ctx.fill();
    }
    particles(ctx, w, h, rng, "sand", P);
  } else if (land === "forest") {
    lightRays(ctx, w, h, w * 0.3, -h * 0.05, "#e9ffc4", 8, rng, 0.12);
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = mix(P.dark, P.far, 0.5 - layer * 0.2);
      const base = h * (0.62 + layer * 0.14);
      for (let x = -20; x < w + 20; x += (26 + rng() * 22) * s) {
        const th = (90 + rng() * 90) * s * (1 - layer * 0.15);
        ctx.beginPath(); ctx.moveTo(x, base - th); ctx.lineTo(x + th * 0.32, base + 10 * s); ctx.lineTo(x - th * 0.32, base + 10 * s); ctx.fill();
      }
      ctx.fillRect(0, base, w, h);
    }
    particles(ctx, w, h, rng, "motes", P);
  } else if (land === "arcane") {
    glowDot(ctx, w * 0.5, h * 0.4, h * 0.6, P.sky[2], 0.4);
    ctx.fillStyle = L(0.25);
    for (const x of [0.08, 0.92]) { ctx.fillRect(w * x - 26 * s, 0, 52 * s, h); ctx.fillRect(w * x - 36 * s, h * 0.1, 72 * s, 16 * s); }
    ctx.strokeStyle = rgba(P.glow, 0.35); ctx.lineWidth = 2 * s;
    for (let i = 0; i < 5; i++) { const x = w * (0.2 + rng() * 0.6), y = h * (0.1 + rng() * 0.4), r = (12 + rng() * 16) * s; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.moveTo(x - r * 0.6, y); ctx.lineTo(x + r * 0.6, y); ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x, y + r * 0.6); ctx.stroke(); }
    ctx.fillStyle = L(0.08); ctx.fillRect(0, h * 0.88, w, h);
    particles(ctx, w, h, rng, "motes", P);
  } else if (land === "space" || land === "void") {
    const neb = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, h * 0.8);
    neb.addColorStop(0, rgba(land === "void" ? "#7a2ab0" : "#5a4ad0", 0.45)); neb.addColorStop(1, rgba("#000000", 0));
    ctx.fillStyle = neb; ctx.fillRect(0, 0, w, h);
    if (land === "space") {
      const pg = ctx.createRadialGradient(w * 0.82, h * 0.86, h * 0.05, w * 0.85, h * 0.95, h * 0.45);
      pg.addColorStop(0, "#5b8ad6"); pg.addColorStop(0.7, "#1a2a5a"); pg.addColorStop(1, "#060a18");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(w * 0.85, h * 1.05, h * 0.42, 0, 7); ctx.fill();
    }
  } else if (land === "ice") {
    for (let i = 0; i < 4; i++) {
      const g = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.5);
      g.addColorStop(0, rgba(i % 2 ? "#7fffd4" : "#9ad1ff", 0)); g.addColorStop(0.5, rgba(i % 2 ? "#7fffd4" : "#b98aff", 0.28)); g.addColorStop(1, rgba("#7fffd4", 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, h * (0.2 + i * 0.06));
      for (let x = 0; x <= w; x += 20 * s) ctx.lineTo(x, h * (0.2 + i * 0.06) + Math.sin(x / w * 6 + i) * 24 * s);
      ctx.lineTo(w, h * 0.55); ctx.lineTo(0, h * 0.55); ctx.fill();
    }
    ridge(ctx, w, h, h * 0.66, h * 0.3, 7, rng, L(0.55));
    ridge(ctx, w, h, h * 0.86, h * 0.16, 9, rng, L(0.25));
    particles(ctx, w, h, rng, "snow", P);
  } else if (land === "mist") {
    glowDot(ctx, w * 0.7, h * 0.3, h * 0.2, "#fff8e0", 0.7);
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = mix(P.far, P.dark, 0.2 + layer * 0.3);
      for (let i = 0; i < 5; i++) {
        const x = rng() * w, hh = (120 + rng() * 160) * s * (1 - layer * 0.15), wd = (40 + rng() * 40) * s, base = h * (0.7 + layer * 0.1);
        ctx.beginPath(); ctx.moveTo(x - wd, base); ctx.bezierCurveTo(x - wd * 0.6, base - hh, x + wd * 0.2, base - hh * 1.05, x + wd, base); ctx.fill();
      }
      const fog = ctx.createLinearGradient(0, h * (0.6 + layer * 0.1), 0, h * (0.8 + layer * 0.1));
      fog.addColorStop(0, rgba(P.far, 0)); fog.addColorStop(1, rgba(P.far, 0.6));
      ctx.fillStyle = fog; ctx.fillRect(0, h * (0.6 + layer * 0.1), w, h * 0.3);
    }
  } else if (land === "storm") {
    ctx.save(); ctx.strokeStyle = "#e8f6ff"; ctx.lineWidth = 3 * s; ctx.shadowColor = "#bfe8ff"; ctx.shadowBlur = 20 * s;
    for (let b = 0; b < 2; b++) { let x = w * (0.2 + rng() * 0.6), y = 0; ctx.beginPath(); ctx.moveTo(x, y); while (y < h * 0.5) { x += (rng() - 0.5) * 50 * s; y += 25 * s; ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.restore();
    for (let layer = 0; layer < 3; layer++) {
      const base = h * (0.7 + layer * 0.1);
      ctx.fillStyle = mix(P.far, P.dark, 0.3 + layer * 0.3); ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 6 * s) ctx.lineTo(x, base + Math.sin(x / 40 / s + layer) * 8 * s + Math.sin(x / 13 / s) * 3 * s);
      ctx.lineTo(w, h); ctx.fill();
    }
    particles(ctx, w, h, rng, "rain", P);
  }
}

/* ---------------------------------------------------------------- subjects
   Each subject paints itself into the art window (w × h) and returns its
   silhouette path, used for the reverse holo mask. Drawn in a 100-unit box. */
const SUBJECTS = {
  dragon(ctx, w, h, P, rng, o) {
    const s = h / 100 * (o.pose === "perch" ? 0.8 : 1);
    const ox = w / 2 - 50 * s, oy = o.pose === "perch" ? h * 0.12 : h * 0.02;
    const p = new Path2D();
    const wing = (sh, wr, tips, root) => {
      const pts = [sh, [wr[0] + 2, wr[1] + 2], wr, tips[0]];
      const wp = new Path2D(); wp.moveTo(...sh); wp.lineTo(wr[0] + 3, wr[1] + 3); wp.lineTo(...wr); wp.lineTo(...tips[0]);
      for (let i = 1; i < tips.length; i++) {
        const a = tips[i - 1], b = tips[i], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        wp.quadraticCurveTo(m[0] + (wr[0] - m[0]) * 0.3, m[1] + (wr[1] - m[1]) * 0.3, ...b);
      }
      const last = tips[tips.length - 1], m = [(last[0] + root[0]) / 2, (last[1] + root[1]) / 2];
      wp.quadraticCurveTo(m[0] + (wr[0] - m[0]) * 0.2, m[1] + (wr[1] - m[1]) * 0.2, ...root); wp.closePath();
      return wp;
    };
    const spread = o.pose === "perch" ? 0.72 : 1;
    const sx = (x) => 50 + (x - 50) * spread;
    p.addPath(wing([54, 48], [sx(76), 14], [[sx(99), 22], [sx(97), 38], [sx(90), 52], [sx(76), 58]], [58, 60]));
    p.addPath(wing([46, 48], [sx(24), 18], [[sx(1), 26], [sx(4), 42], [sx(12), 55], [sx(26), 62]], [44, 62]));
    p.addPath(poly([[45, 54], [47, 40], [55, 32], [60, 20], [68, 18], [66, 30], [59, 42], [58, 56]]));
    p.addPath(poly([[60, 20], [64, 12], [62, 3], [69, 10], [72, 4], [73, 12], [82, 15], [83, 18], [76, 20], [82, 22], [74, 24], [64, 25]]));
    const body = new Path2D(); body.ellipse(51, 65, 13, 17, -0.15, 0, 7); p.addPath(body);
    p.addPath(poly([[54, 74], [61, 88], [67, 91], [56, 92], [48, 80]]));
    p.addPath(poly([[42, 72], [35, 88], [41, 92], [30, 92], [31, 78]]));
    const tail = tube([[42, 74], [30, 84], [18, 82], [8, 90], [2, 86]], 9, 1.2);
    p.addPath(tail.path);
    p.addPath(poly([[2, 86], [-3, 82], [0, 90], [6, 91]]));
    const world = local(p, ox, oy, s);
    if (o.pose === "perch") {
      const rock = poly([[w * 0.18, h], [w * 0.26, h * 0.86], [w * 0.4, h * 0.82], [w * 0.62, h * 0.8], [w * 0.74, h * 0.86], [w * 0.82, h]]);
      silhouette(ctx, rock, P, s, { aura: 0 });
    }
    if (o.brass) silhouette(ctx, world, P, s, { body0: "#8a5a22", body1: "#3a240c", rim: "#ffe0a0", aura: 18 });
    else silhouette(ctx, world, P, s);
    if (o.pose === "rear" && !o.brass) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const mx = ox + 83 * s, my = oy + 19 * s;
      const fire = ctx.createRadialGradient(mx, my, 0, mx + 20 * s, my + 10 * s, 26 * s);
      fire.addColorStop(0, "rgba(255,240,190,0.95)"); fire.addColorStop(0.35, "rgba(255,140,40,0.75)"); fire.addColorStop(1, "rgba(255,60,10,0)");
      ctx.fillStyle = fire; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 34 * s, my - 6 * s); ctx.quadraticCurveTo(mx + 44 * s, my + 10 * s, mx + 30 * s, my + 24 * s); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    glowDot(ctx, ox + 74 * s, oy + 15 * s, 3.2 * s, P.glow);
    return world;
  },
  wyrm(ctx, w, h, P, rng, o) {
    const pts = [[0.70, 0.18], [0.62, 0.30], [0.47, 0.38], [0.40, 0.53], [0.52, 0.66], [0.70, 0.68], [0.80, 0.80], [0.62, 0.93], [0.30, 0.90], [0.10, 0.80]]
      .map(([x, y]) => [x * w, y * h]);
    const T = tube(pts, h * 0.13, h * 0.012, 90);
    const p = new Path2D(); p.addPath(T.path);
    const hx = pts[0][0], hy = pts[0][1], hs = h / 100;
    p.addPath(local(poly([[-8, 4], [-2, -6], [6, -12], [5, -22], [11, -12], [20, -8], [30, -4], [31, 1], [20, 3], [28, 6], [10, 10]]), hx - 2 * hs, hy, hs));
    for (let i = 8; i < T.line.length - 10; i += 5) {
      const [x, y] = T.left[i], [cx, cy] = T.line[i];
      const nx = x - cx, ny = y - cy, len = Math.hypot(nx, ny) || 1;
      const sp = (1 - i / T.line.length) * h * 0.05 * (o.lightning ? 0.6 : 1);
      p.addPath(poly([[x - ny / len * sp * 0.4, y + nx / len * sp * 0.4], [x + nx / len * sp, y + ny / len * sp], [x + ny / len * sp * 0.4, y - nx / len * sp * 0.4]]));
    }
    const icy = o.lotus ? { body0: "#1f6b56", body1: "#06261d", rim: "#b8ffe0" } : P.glow === "#c8fbff" ? { body0: "#5a9ab8", body1: "#0c2a3c", rim: "#e8fdff" } : {};
    silhouette(ctx, p, P, hs, icy);
    glowDot(ctx, hx + 8 * hs, hy - 5 * hs, 3.5 * hs, P.glow);
    if (o.lightning) {
      ctx.save(); ctx.strokeStyle = "#f2fbff"; ctx.lineWidth = 2 * hs * 0.6; ctx.shadowColor = "#9fe0ff"; ctx.shadowBlur = 16 * hs;
      for (let b = 0; b < 4; b++) { const i = Math.floor(rng() * T.line.length); let [x, y] = T.line[i]; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rng() - 0.5) * 18 * hs; y += (rng() - 0.6) * 14 * hs; ctx.lineTo(x, y); } ctx.stroke(); }
      ctx.restore();
    }
    if (o.sea) {
      for (let layer = 0; layer < 2; layer++) {
        ctx.fillStyle = mix(P.far, P.dark, 0.45 + layer * 0.3); ctx.beginPath(); ctx.moveTo(0, h);
        const base = h * (0.82 + layer * 0.08);
        for (let x = 0; x <= w; x += 4) ctx.lineTo(x, base + Math.sin(x / (18 * hs) + layer * 2) * 3 * hs);
        ctx.lineTo(w, h); ctx.fill();
        ctx.strokeStyle = rgba("#e8f6ff", 0.4); ctx.lineWidth = 1.2 * hs * 0.5; ctx.stroke();
      }
    }
    if (o.lotus) for (let i = 0; i < 5; i++) {
      const x = w * (0.1 + rng() * 0.8), y = h * (0.86 + rng() * 0.1), r = (3 + rng() * 3) * hs;
      for (let k = -2; k <= 2; k++) { ctx.fillStyle = mix("#ffd1e8", "#ff7ab8", Math.abs(k) / 3); ctx.beginPath(); ctx.ellipse(x + k * r * 0.5, y - r * 0.4, r * 0.4, r, k * 0.35, 0, 7); ctx.fill(); }
    }
    return p;
  },
  phoenix(ctx, w, h, P, rng) {
    const s = h / 100, cx = w / 2, p = new Path2D();
    const feather = (x0, y0, ang, len, wid) => {
      const f = new Path2D(), ex = x0 + Math.cos(ang) * len, ey = y0 + Math.sin(ang) * len;
      const nx = -Math.sin(ang) * wid, ny = Math.cos(ang) * wid;
      f.moveTo(x0, y0); f.quadraticCurveTo((x0 + ex) / 2 + nx, (y0 + ey) / 2 + ny, ex, ey);
      f.quadraticCurveTo((x0 + ex) / 2 - nx, (y0 + ey) / 2 - ny, x0, y0); return f;
    };
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
      const ang = -Math.PI / 2 + side * (0.25 + i * 0.16), len = (52 - Math.abs(i - 3) * 3) * s;
      p.addPath(feather(cx + side * 4 * s, h * 0.44, ang, len, 4.2 * s));
    }
    for (let i = 0; i < 7; i++) p.addPath(feather(cx, h * 0.55, Math.PI / 2 + (i - 3) * 0.12, (40 + rng() * 14) * s, 3.2 * s));
    const body = new Path2D(); body.ellipse(cx, h * 0.5, 7 * s, 13 * s, 0, 0, 7); p.addPath(body);
    p.addPath(poly([[cx - 4 * s, h * 0.4], [cx, h * 0.24], [cx + 6 * s, h * 0.27], [cx + 12 * s, h * 0.3], [cx + 5 * s, h * 0.32], [cx + 5 * s, h * 0.42]]));
    ctx.save(); ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 40 * s;
    const g = ctx.createRadialGradient(cx, h * 0.45, 2 * s, cx, h * 0.45, 60 * s);
    g.addColorStop(0, "#fffbe0"); g.addColorStop(0.3, "#ffd34d"); g.addColorStop(0.65, "#ff7a1f"); g.addColorStop(1, "#b3200c");
    ctx.fillStyle = g; ctx.fill(p); ctx.restore();
    ctx.save(); ctx.clip(p); ctx.globalCompositeOperation = "overlay";
    ctx.strokeStyle = "rgba(120,30,0,0.5)"; ctx.lineWidth = 0.6 * s;
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.moveTo(cx, h * 0.46); ctx.lineTo(cx + Math.cos(i / 40 * 6.28) * 70 * s, h * 0.46 + Math.sin(i / 40 * 6.28) * 70 * s); ctx.stroke(); }
    ctx.restore();
    particles(ctx, w, h, rng, "embers", P);
    return p;
  },
  figure(ctx, w, h, P, rng, o) {
    const s = h / 100, ox = w / 2 - 50 * s, oy = h * 0.02;
    const back = new Path2D(), p = new Path2D(), fx = new Path2D();
    if (o.gears) {
      const g = new Path2D(); const cx = 50, cy = 40, R = 34;
      for (let i = 0; i < 24; i++) { const a0 = i / 24 * 6.283, a1 = (i + 0.5) / 24 * 6.283, rr = i % 2 ? R : R + 5; g.lineTo(cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr); g.lineTo(cx + Math.cos(a1) * rr, cy + Math.sin(a1) * rr); }
      g.closePath();
      silhouette(ctx, local(g, ox, oy, s), P, s, { body0: "#5a3a14", body1: "#2a1806", rim: "#ffd28a", aura: 8 });
    }
    if (o.wings) {
      const wing = new Path2D();
      for (let i = 0; i < 8; i++) {
        const a = -2.6 + i * 0.22, len = 46 - i * 2.2, x0 = 44, y0 = 40;
        const ex = x0 + Math.cos(a) * len, ey = y0 + Math.sin(a) * len;
        wing.moveTo(x0, y0); wing.quadraticCurveTo((x0 + ex) / 2 - Math.sin(a) * 5, (y0 + ey) / 2 + Math.cos(a) * 5, ex, ey);
        wing.quadraticCurveTo((x0 + ex) / 2 + Math.sin(a) * 5, (y0 + ey) / 2 - Math.cos(a) * 5, x0, y0);
      }
      const both = new Path2D(); both.addPath(wing); both.addPath(wing, new DOMMatrix([-1, 0, 0, 1, 100, 0]));
      const W = local(both, ox, oy, s);
      ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 30 * s;
      const dark = P.dark === "#000000";
      const wg = ctx.createLinearGradient(0, oy, 0, oy + 70 * s);
      wg.addColorStop(0, dark ? "#3a1a5a" : "#ffffff"); wg.addColorStop(1, dark ? "#0a0010" : mix(P.glow, P.sky[1], 0.5));
      ctx.fillStyle = wg; ctx.fill(W); ctx.restore();
      back.addPath(W);
    }
    if (o.halo) {
      ctx.save(); ctx.strokeStyle = "#fff6d0"; ctx.lineWidth = 2.4 * s; ctx.shadowColor = P.glow; ctx.shadowBlur = 26 * s;
      ctx.beginPath(); ctx.arc(ox + 50 * s, oy + 21 * s, 13 * s, 0, 7); ctx.stroke(); ctx.restore();
      glowDot(ctx, ox + 50 * s, oy + 21 * s, 30 * s, P.glow, 0.35);
    }
    if (o.cape) back.addPath(local(poly([[37, 34], [24, 60], [16, 82], [8, 100], [92, 100], [84, 82], [76, 60], [63, 34]]), ox, oy, s));
    if (o.hair) back.addPath(local(poly([[42, 18], [36, 30], [33, 46], [28, 60], [40, 52], [46, 30], [54, 30], [60, 52], [72, 60], [67, 46], [64, 30], [58, 18]]), ox, oy, s));
    const narrow = o.coat ? 0.8 : 1;
    const body = new Path2D();
    body.moveTo(38, 36); body.quadraticCurveTo(36 + (1 - narrow) * 8, 62, 27 + (1 - narrow) * 14, 100); body.lineTo(73 - (1 - narrow) * 14, 100);
    body.quadraticCurveTo(64 - (1 - narrow) * 8, 62, 62, 36); body.quadraticCurveTo(50, 31, 38, 36); body.closePath();
    p.addPath(body);
    const head = new Path2D(); head.arc(50, 23, 6.8, 0, 7); p.addPath(head);
    p.addPath(poly([[46.5, 28], [53.5, 28], [54, 34], [46, 34]]));
    p.addPath(poly([[38, 36], [33, 48], [31, 62], [35, 63], [38, 50], [42, 40]]));
    p.addPath(poly([[62, 36], [68, 46], [71, 60], [67, 61], [63, 49], [58, 40]]));
    const hats = {
      straw: [[28, 23], [50, 11], [72, 23], [62, 24.5], [38, 24.5]],
      crown: [[42.5, 19], [42, 9], [45.5, 13.5], [48, 6], [50, 12], [52, 6], [54.5, 13.5], [58, 9], [57.5, 19]],
      hood: [[39, 36], [38, 22], [42, 12], [50, 8], [58, 12], [62, 22], [61, 36], [56, 33], [56, 22], [50, 16], [44, 22], [44, 33]],
      helm: [[42.5, 30], [42, 20], [44, 14], [50, 12], [56, 14], [58, 20], [57.5, 30]],
      fedora: [[36, 19.5], [43, 18.5], [44, 11], [50, 9.5], [56, 11], [57, 18.5], [64, 19.5], [56, 21.5], [44, 21.5]],
      headdress: [[42, 18], [50, 12], [58, 18], [64, 41], [58, 41], [56.5, 27], [43.5, 27], [42, 41], [36, 41]],
      tiara: [[43.5, 18], [45, 13], [47.5, 15.5], [50, 10], [52.5, 15.5], [55, 13], [56.5, 18]],
      pilot: [[41.5, 28], [41, 18], [45, 13], [50, 12], [55, 13], [59, 18], [58.5, 28]],
      tricorn: [[34, 18], [42, 13], [50, 15], [58, 13], [66, 18], [56, 21], [44, 21]],
    };
    if (o.hat && hats[o.hat]) p.addPath(poly(hats[o.hat]));
    if (o.beard) p.addPath(poly([[45, 27], [50, 41], [55, 27]]));
    if (o.hat === "helm") p.addPath(poly([[50, 12], [54, 4], [62, 2], [58, 8], [52, 14]]));
    if (o.shield) p.addPath(poly([[22, 46], [37, 46], [37, 60], [29.5, 74], [22, 60]]));
    const weaponPts = {
      sword: [[67, 60], [69, 58], [84, 8], [85.5, 6.5], [85, 9], [71, 60]],
      spear: [[71.5, 98], [71.5, 12], [70, 12], [72.5, 3], [75, 12], [73.5, 12], [73.5, 98]],
      lance: [[66, 64], [70, 58], [96, 6], [72, 64]],
      staff: [[70.5, 98], [70.5, 16], [73.5, 16], [73.5, 98]],
      hammer: [[68, 70], [70, 70], [70, 30], [62, 30], [62, 22], [80, 22], [80, 30], [72, 30], [72, 70]],
    };
    if (o.weapon && weaponPts[o.weapon]) fx.addPath(poly(weaponPts[o.weapon]));
    if (o.weapon === "sword") fx.addPath(poly([[63, 60], [76, 56], [77, 58], [64, 62]]));
    if (o.weapon === "bow") { const b = new Path2D(); b.moveTo(30, 30); b.quadraticCurveTo(14, 50, 30, 74); b.lineTo(31, 72); b.quadraticCurveTo(18, 50, 31, 32); b.closePath(); fx.addPath(b); }
    const Back = local(back, ox, oy, s), Body = local(p, ox, oy, s), Fx = local(fx, ox, oy, s);
    if (o.cape) silhouette(ctx, local(poly([[37, 34], [24, 60], [16, 82], [8, 100], [92, 100], [84, 82], [76, 60], [63, 34]]), ox, oy, s), P, s, { body0: mix(P.dark, P.glow, 0.18), aura: 20 });
    if (o.hair) silhouette(ctx, local(poly([[42, 18], [36, 30], [33, 46], [28, 60], [40, 52], [46, 30], [54, 30], [60, 52], [72, 60], [67, 46], [64, 30], [58, 18]]), ox, oy, s), P, s, { body0: mix(P.dark, P.glow, 0.3), aura: 0 });
    silhouette(ctx, Body, P, s);
    if (o.weapon && o.weapon !== "none") {
      ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 18 * s;
      const mg = ctx.createLinearGradient(ox + 60 * s, oy, ox + 90 * s, oy + 70 * s);
      mg.addColorStop(0, "#ffffff"); mg.addColorStop(0.4, mix(P.glow, "#ffffff", 0.4)); mg.addColorStop(1, mix(P.glow, P.dark, 0.5));
      ctx.fillStyle = o.weapon === "staff" || o.weapon === "bow" ? mix(P.dark, P.glow, 0.3) : mg; ctx.fill(Fx); ctx.restore();
      if (o.weapon === "staff") glowDot(ctx, ox + 72 * s, oy + 13 * s, 9 * s, P.glow);
    }
    if (o.hat === "crown" || o.hat === "tiara") for (const x of [48, 50, 52]) glowDot(ctx, ox + x * s, oy + (o.hat === "crown" ? 8 : 12) * s, 1.8 * s, "#ffe9a8");
    if (["hood", "helm", "pilot"].includes(o.hat)) { glowDot(ctx, ox + 47.5 * s, oy + 23 * s, 1.6 * s, P.glow); glowDot(ctx, ox + 52.5 * s, oy + 23 * s, 1.6 * s, P.glow); }
    if (o.hat === "pilot") { ctx.fillStyle = rgba(P.glow, 0.7); ctx.beginPath(); ctx.ellipse(ox + 50 * s, oy + 22 * s, 6 * s, 2.4 * s, 0, 0, 7); ctx.fill(); }
    const all = new Path2D(); all.addPath(Back); all.addPath(Body); all.addPath(Fx);
    return all;
  },
  crown(ctx, w, h, P, rng) {
    const s = h / 100, ox = w / 2 - 50 * s, oy = h * 0.1;
    const cushion = new Path2D(); cushion.ellipse(50, 74, 34, 11, 0, 0, 7);
    const cw = local(cushion, ox, oy, s);
    const cg = ctx.createLinearGradient(0, oy + 63 * s, 0, oy + 85 * s); cg.addColorStop(0, "#9c1830"); cg.addColorStop(1, "#2a030a");
    ctx.fillStyle = cg; ctx.fill(cw);
    const c = poly([[24, 66], [20, 30], [33, 44], [38, 18], [50, 38], [62, 18], [67, 44], [80, 30], [76, 66]]);
    const band = new Path2D(); band.addPath(c); band.addPath(poly([[23, 58], [77, 58], [77, 68], [23, 68]]));
    const W = local(band, ox, oy, s);
    ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 40 * s;
    const g = ctx.createLinearGradient(ox + 20 * s, oy + 18 * s, ox + 80 * s, oy + 68 * s);
    g.addColorStop(0, "#f4f7ff"); g.addColorStop(0.35, "#9aa8c4"); g.addColorStop(0.55, "#e9eefc"); g.addColorStop(1, "#4c5872");
    ctx.fillStyle = g; ctx.fill(W); ctx.restore();
    for (const [x, y, col] of [[20, 30, "#ff4d6d"], [38, 18, "#5ec8ff"], [62, 18, "#5ec8ff"], [80, 30, "#ff4d6d"], [50, 63, "#7cffb2"], [33, 63, "#ff4d6d"], [67, 63, "#ff4d6d"]])
      glowDot(ctx, ox + x * s, oy + y * s, 4 * s, col);
    return W;
  },
  sword(ctx, w, h, P, rng, o) {
    const s = h / 100, cx = w / 2, p = new Path2D();
    if (o.katana) {
      const b = new Path2D(); b.moveTo(46, 66); b.quadraticCurveTo(44, 30, 60, 4); b.quadraticCurveTo(50, 34, 51, 66); b.closePath();
      p.addPath(local(b, cx - 50 * s, 0, s));
      const tsuba = new Path2D(); tsuba.ellipse(48.5, 68, 7, 2.4, 0, 0, 7);
      p.addPath(local(tsuba, cx - 50 * s, 0, s));
      p.addPath(local(poly([[46.5, 70], [50.5, 70], [50, 96], [47, 96]]), cx - 50 * s, 0, s));
    } else {
      const len = o.dagger ? 0.55 : 1, top = 90 - 80 * len;
      p.addPath(local(poly([[47, 66], [47, top + 8], [50, top], [53, top + 8], [53, 66]]), cx - 50 * s, 0, s));
      p.addPath(local(poly([[36, 66], [64, 66], [62, 70], [38, 70]]), cx - 50 * s, 0, s));
      p.addPath(local(poly([[48, 70], [52, 70], [52, 86], [48, 86]]), cx - 50 * s, 0, s));
      const pom = new Path2D(); pom.arc(50, 89, 3.4, 0, 7); p.addPath(local(pom, cx - 50 * s, 0, s));
    }
    const W = o.dagger ? local(p, w * 0.08, h * 0.12, 1) : p;
    ctx.save();
    if (o.dagger) { ctx.translate(w / 2, h / 2); ctx.rotate(-0.5); ctx.translate(-w / 2, -h / 2); }
    ctx.shadowColor = P.glow; ctx.shadowBlur = 34 * s;
    const g = ctx.createLinearGradient(cx - 6 * s, 0, cx + 6 * s, 0);
    g.addColorStop(0, "#5a6680"); g.addColorStop(0.45, "#ffffff"); g.addColorStop(0.55, "#c9d6f2"); g.addColorStop(1, "#3a4258");
    ctx.fillStyle = g; ctx.fill(W);
    ctx.restore();
    if (!o.katana && !o.dagger) {
      ctx.fillStyle = rgba(P.dark, 0.9); ctx.beginPath(); ctx.ellipse(cx, h * 0.97, 30 * s, 6 * s, 0, 0, 7); ctx.fill();
      glowDot(ctx, cx, h * 0.89, 5 * s, P.glow);
    }
    if (o.dagger) for (let i = 0; i < 6; i++) { ctx.fillStyle = rgba("#cfd3e0", 0.08); ctx.beginPath(); ctx.ellipse(w * (0.3 + rng() * 0.4), h * (0.6 + rng() * 0.3), 60 * s * rng() + 20 * s, 10 * s, rng(), 0, 7); ctx.fill(); }
    return W;
  },
  mask(ctx, w, h, P, rng) {
    const s = h / 100, ox = w / 2 - 50 * s, oy = 0;
    const m = new Path2D();
    m.moveTo(50, 14); m.bezierCurveTo(66, 12, 78, 24, 78, 42); m.bezierCurveTo(78, 60, 70, 74, 60, 84);
    m.bezierCurveTo(56, 88, 52, 88, 50, 86); m.lineTo(50, 14); m.closePath();
    const eye = new Path2D(); eye.ellipse(62, 40, 8, 4.5, -0.15, 0, 7);
    const M2 = local(m, ox, oy, s), E = local(eye, ox, oy, s);
    ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 40 * s;
    const g = ctx.createLinearGradient(ox + 50 * s, 0, ox + 80 * s, 0); g.addColorStop(0, "#ffffff"); g.addColorStop(0.7, "#d9d4cc"); g.addColorStop(1, "#8c867c");
    ctx.fillStyle = g; ctx.fill(M2); ctx.restore();
    ctx.fillStyle = "#0a0204"; ctx.fill(E);
    ctx.strokeStyle = "#c9a54a"; ctx.lineWidth = 0.8 * s;
    ctx.beginPath(); ctx.moveTo(ox + 52 * s, oy + 22 * s); ctx.bezierCurveTo(ox + 66 * s, oy + 26 * s, ox + 70 * s, oy + 32 * s, ox + 72 * s, oy + 50 * s); ctx.stroke();
    const rose = SUBJECTS.rose;
    ctx.save(); ctx.translate(w * 0.22, h * 0.38); ctx.scale(0.45, 0.45); rose(ctx, w, h, P, rng, { small: true }); ctx.restore();
    return M2;
  },
  rose(ctx, w, h, P, rng, o = {}) {
    const s = h / 100, cx = w / 2, cy = h * 0.4, p = new Path2D();
    ctx.strokeStyle = "#1f4a22"; ctx.lineWidth = 2.4 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy + 10 * s); ctx.bezierCurveTo(cx - 6 * s, cy + 40 * s, cx + 8 * s, cy + 50 * s, cx + 2 * s, h * 1.05); ctx.stroke();
    for (const [lx, ly, a] of [[cx - 2 * s, cy + 30 * s, -0.8], [cx + 3 * s, cy + 46 * s, 0.7]]) { ctx.fillStyle = "#2c6b33"; ctx.beginPath(); ctx.ellipse(lx + Math.cos(a) * 8 * s, ly, 9 * s, 3.6 * s, a, 0, 7); ctx.fill(); }
    if (!o.small) { ctx.save(); ctx.shadowColor = "#ff2a4a"; ctx.shadowBlur = 40 * s; ctx.fillStyle = "rgba(160,10,30,0.4)"; ctx.beginPath(); ctx.arc(cx, cy, 20 * s, 0, 7); ctx.fill(); ctx.restore(); }
    for (let ring = 0; ring < 4; ring++) {
      const n = 5 + ring, r = (20 - ring * 4.5) * s;
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.283 + ring * 0.6;
        const pe = new Path2D(); pe.ellipse(cx + Math.cos(a) * r * 0.45, cy + Math.sin(a) * r * 0.35, r * 0.65, r * 0.5, a, 0, 7);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
        g.addColorStop(0, "#4a0010"); g.addColorStop(0.6, ["#c4122f", "#d81b3a", "#e8304c", "#f04a62"][ring]); g.addColorStop(1, "#5a0414");
        ctx.fillStyle = g; ctx.fill(pe); ctx.strokeStyle = "rgba(40,0,8,0.5)"; ctx.lineWidth = 0.6 * s; ctx.stroke(pe);
        p.addPath(pe);
      }
    }
    return p;
  },
  lantern(ctx, w, h, P, rng, o) {
    const s = h / 100, p = new Path2D(), n = o.count || 1;
    const spots = [];
    if (n === 1) spots.push([w / 2, h * 0.5, 1]);
    else if (o.sky) for (let i = 0; i < n; i++) spots.push([w * (0.08 + rng() * 0.84), h * (0.12 + rng() * 0.6), 0.25 + rng() * 0.35]);
    else for (let i = 0; i < n; i++) { const t = i / (n - 1); spots.push([w * (0.12 + t * 0.76), h * (0.3 + Math.sin(t * Math.PI) * 0.16), 0.42]); }
    if (n > 1 && !o.sky) { ctx.strokeStyle = rgba("#000000", 0.6); ctx.lineWidth = 1 * s; ctx.beginPath(); spots.forEach(([x, y], i) => i ? ctx.lineTo(x, y - 18 * s * 0.42) : ctx.moveTo(x, y - 18 * s * 0.42)); ctx.stroke(); }
    spots.sort((a, b) => a[2] - b[2]);
    for (const [x, y, k] of spots) {
      const r = 22 * s * k;
      glowDot(ctx, x, y, r * 3, o.sky ? "#ffb347" : P.glow, 0.45);
      const body = new Path2D(); body.ellipse(x, y, r, r * 1.2, 0, 0, 7);
      const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 1.2);
      g.addColorStop(0, "#fff6d8"); g.addColorStop(0.5, o.sky ? "#ffb347" : "#ff6a3a"); g.addColorStop(1, o.sky ? "#c25a14" : "#9c1c18");
      ctx.fillStyle = g; ctx.fill(body);
      ctx.strokeStyle = rgba("#3a0a06", 0.5); ctx.lineWidth = 0.7 * s * k;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(i) * r * 0.3 + 0.5, r * 1.2, 0, 0, 7); ctx.stroke(); }
      ctx.fillStyle = "#2a1408"; ctx.fillRect(x - r * 0.5, y - r * 1.35, r, r * 0.2); ctx.fillRect(x - r * 0.5, y + r * 1.15, r, r * 0.2);
      if (n === 1) { ctx.strokeStyle = "#2a1408"; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(x, y - r * 1.35); ctx.lineTo(x, 0); ctx.stroke(); }
      p.addPath(body);
    }
    if (o.sky) particles(ctx, w, h, rng, "motes", Object.assign({}, P, { glow: "#ffb347" }));
    return p;
  },
  chandelier(ctx, w, h, P, rng) {
    const s = h / 100, cx = w / 2, p = new Path2D();
    ctx.strokeStyle = rgba(P.glow, 0.7); ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h * 0.25); ctx.stroke();
    for (let tier = 0; tier < 2; tier++) {
      const y = h * (0.42 + tier * 0.16), R = (36 - tier * 12) * s;
      ctx.strokeStyle = rgba("#e6d2a0", 0.75); ctx.lineWidth = 1.6 * s;
      ctx.beginPath(); ctx.ellipse(cx, y, R, R * 0.22, 0, 0, 7); ctx.stroke();
      for (let i = 0; i < 8 - tier * 2; i++) {
        const a = i / (8 - tier * 2) * 6.283, x = cx + Math.cos(a) * R, yy = y + Math.sin(a) * R * 0.22;
        ctx.beginPath(); ctx.moveTo(cx, y - 12 * s); ctx.quadraticCurveTo((cx + x) / 2, y - 14 * s, x, yy - 4 * s); ctx.stroke();
        glowDot(ctx, x, yy - 7 * s, 5 * s, "#ffd27a");
        ctx.fillStyle = rgba("#dff6ff", 0.8); ctx.beginPath(); ctx.moveTo(x, yy + 2 * s); ctx.lineTo(x + 1.5 * s, yy + 7 * s); ctx.lineTo(x, yy + 11 * s); ctx.lineTo(x - 1.5 * s, yy + 7 * s); ctx.fill();
        const c = new Path2D(); c.arc(x, yy, 3 * s, 0, 7); p.addPath(c);
      }
    }
    ctx.save(); ctx.globalAlpha = 0.28; ctx.shadowColor = "#bff8ff"; ctx.shadowBlur = 30 * s; ctx.fillStyle = "#dff6ff";
    ctx.beginPath(); ctx.moveTo(cx - 14 * s, h); ctx.quadraticCurveTo(cx - 18 * s, h * 0.78, cx - 6 * s, h * 0.7); ctx.arc(cx, h * 0.66, 6 * s, Math.PI, 0); ctx.quadraticCurveTo(cx + 18 * s, h * 0.78, cx + 14 * s, h); ctx.fill();
    ctx.restore();
    const body = new Path2D(); body.ellipse(cx, h * 0.36, 8 * s, 14 * s, 0, 0, 7); p.addPath(body);
    ctx.fillStyle = rgba("#e6d2a0", 0.6); ctx.fill(body);
    return p;
  },
  banner(ctx, w, h, P, rng) {
    const s = h / 100, cx = w * 0.45, p = new Path2D();
    const pole = poly([[cx - 1.2 * s, h], [cx - 1.2 * s, h * 0.06], [cx + 1.2 * s, h * 0.06], [cx + 1.2 * s, h]]);
    const cloth = new Path2D(); cloth.moveTo(cx, h * 0.1);
    for (let x = 0; x <= 40; x += 2) cloth.lineTo(cx + x * s, h * 0.1 + Math.sin(x / 7) * 2.5 * s);
    for (let y = 10; y <= 70; y += 6) cloth.lineTo(cx + 40 * s + Math.sin(y / 9) * 2 * s, h * y / 100);
    for (let x = 40; x >= 0; x -= 5) cloth.lineTo(cx + x * s, h * 0.7 + ((x / 5) % 2 ? 7 : 0) * s);
    cloth.closePath();
    silhouette(ctx, pole, P, s, { aura: 10 });
    ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 20 * s;
    const g = ctx.createLinearGradient(cx, 0, cx + 40 * s, 0); g.addColorStop(0, "#26375a"); g.addColorStop(0.5, "#4b6aa0"); g.addColorStop(1, "#1a2540");
    ctx.fillStyle = g; ctx.fill(cloth); ctx.restore();
    ctx.save(); ctx.translate(cx + 20 * s - 50 * s * 0.3, h * 0.24); ctx.scale(0.3, 0.3);
    ctx.fillStyle = "#d8e2f2"; ctx.fill(poly([[24 * s, 66 * s], [20 * s, 30 * s], [33 * s, 44 * s], [38 * s, 18 * s], [50 * s, 38 * s], [62 * s, 18 * s], [67 * s, 44 * s], [80 * s, 30 * s], [76 * s, 66 * s]]));
    ctx.restore();
    glowDot(ctx, cx, h * 0.05, 4 * s, P.glow);
    p.addPath(pole); p.addPath(cloth);
    return p;
  },
  book(ctx, w, h, P, rng) {
    const s = h / 100, cx = w / 2, cy = h * 0.58, p = new Path2D();
    lightRays(ctx, w, h, cx, cy, "#ffd98a", 10, rng, 0.14);
    const page = (dir) => { const q = new Path2D(); q.moveTo(cx, cy); q.quadraticCurveTo(cx + dir * 16 * s, cy - 10 * s, cx + dir * 36 * s, cy - 4 * s); q.lineTo(cx + dir * 34 * s, cy + 18 * s); q.quadraticCurveTo(cx + dir * 16 * s, cy + 12 * s, cx, cy + 22 * s); q.closePath(); return q; };
    const cover = new Path2D(); cover.addPath(poly([[cx - 38 * s, cy - 2 * s], [cx, cy + 26 * s], [cx + 38 * s, cy - 2 * s], [cx + 38 * s, cy + 22 * s], [cx, cy + 30 * s], [cx - 38 * s, cy + 22 * s]]));
    ctx.fillStyle = "#3a1830"; ctx.fill(cover);
    for (const dir of [-1, 1]) {
      const q = page(dir); const g = ctx.createLinearGradient(cx, cy, cx + dir * 36 * s, cy);
      g.addColorStop(0, "#b8a27a"); g.addColorStop(1, "#f6ecd2"); ctx.fillStyle = g; ctx.fill(q); p.addPath(q);
      ctx.strokeStyle = rgba("#5a4020", 0.35); ctx.lineWidth = 0.5 * s;
      for (let k = 1; k < 7; k++) { ctx.beginPath(); ctx.moveTo(cx + dir * 6 * s, cy + k * 2.4 * s); ctx.lineTo(cx + dir * 30 * s, cy - 2 * s + k * 2.6 * s); ctx.stroke(); }
    }
    p.addPath(cover);
    ctx.save(); ctx.strokeStyle = "#ffe7a8"; ctx.shadowColor = "#ffd98a"; ctx.shadowBlur = 12 * s; ctx.lineWidth = 1.2 * s;
    for (let i = 0; i < 12; i++) { const x = cx + (rng() - 0.5) * 50 * s, y = cy - (10 + rng() * 40) * s, r = (2 + rng() * 3) * s; ctx.beginPath(); ctx.arc(x, y, r, 0, 4 + rng() * 2); ctx.lineTo(x, y + r); ctx.stroke(); }
    ctx.restore();
    return p;
  },
  candle(ctx, w, h, P, rng) {
    const s = h / 100, cx = w / 2, p = new Path2D();
    glowDot(ctx, cx, h * 0.32, 60 * s, "#ffb347", 0.45);
    const body = new Path2D(); body.moveTo(cx - 12 * s, h * 0.95); body.lineTo(cx - 12 * s, h * 0.52);
    body.quadraticCurveTo(cx - 8 * s, h * 0.5, cx - 6 * s, h * 0.56); body.quadraticCurveTo(cx - 4 * s, h * 0.49, cx, h * 0.5);
    body.quadraticCurveTo(cx + 6 * s, h * 0.48, cx + 12 * s, h * 0.52); body.lineTo(cx + 12 * s, h * 0.62); body.quadraticCurveTo(cx + 15 * s, h * 0.68, cx + 12 * s, h * 0.72); body.lineTo(cx + 12 * s, h * 0.95); body.closePath();
    const g = ctx.createLinearGradient(cx - 12 * s, 0, cx + 12 * s, 0); g.addColorStop(0, "#c8b48a"); g.addColorStop(0.5, "#fff2d6"); g.addColorStop(1, "#a8926a");
    ctx.fillStyle = g; ctx.fill(body); p.addPath(body);
    ctx.fillStyle = "#1a1008"; ctx.fillRect(cx - 0.6 * s, h * 0.43, 1.2 * s, h * 0.07);
    const flame = new Path2D(); flame.moveTo(cx, h * 0.14); flame.quadraticCurveTo(cx + 12 * s, h * 0.32, cx, h * 0.46); flame.quadraticCurveTo(cx - 12 * s, h * 0.32, cx, h * 0.14);
    const fg = ctx.createRadialGradient(cx, h * 0.38, 1, cx, h * 0.34, 16 * s); fg.addColorStop(0, "#ffffff"); fg.addColorStop(0.4, "#ffe28a"); fg.addColorStop(1, "#ff7a1f");
    ctx.save(); ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 30 * s; ctx.fillStyle = fg; ctx.fill(flame); ctx.restore();
    ctx.fillStyle = "#3a1a08"; ctx.beginPath(); ctx.arc(cx - 3 * s, h * 0.34, 1.4 * s, 0, 7); ctx.arc(cx + 3 * s, h * 0.34, 1.4 * s, 0, 7); ctx.fill();
    p.addPath(flame);
    return p;
  },
  eye(ctx, w, h, P, rng, o) {
    const s = h / 100, cx = w / 2, cy = h * 0.5, p = new Path2D();
    ctx.save(); ctx.strokeStyle = rgba(P.glow, 0.6); ctx.lineWidth = 1.2 * s; ctx.shadowColor = P.glow; ctx.shadowBlur = 12 * s;
    for (const r of [40, 34]) { ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, 7); ctx.stroke(); }
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 34 * s, cy + Math.sin(a) * 34 * s); ctx.lineTo(cx + Math.cos(a) * (i % 2 ? 40 : 46) * s, cy + Math.sin(a) * (i % 2 ? 40 : 46) * s); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx, cy - 46 * s); ctx.lineTo(cx + 40 * s, cy + 23 * s); ctx.lineTo(cx - 40 * s, cy + 23 * s); ctx.closePath(); ctx.stroke();
    ctx.restore();
    if (o.void) { ctx.save(); ctx.strokeStyle = rgba("#1a0024", 0.9); ctx.lineWidth = 3 * s; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.bezierCurveTo(cx + Math.cos(a) * 30 * s, cy + Math.sin(a) * 30 * s, cx + Math.cos(a + 0.6) * 50 * s, cy + Math.sin(a + 0.6) * 50 * s, cx + Math.cos(a + 0.3) * 70 * s, cy + Math.sin(a + 0.3) * 70 * s); ctx.stroke(); } ctx.restore(); }
    const al = new Path2D(); al.moveTo(cx - 26 * s, cy); al.quadraticCurveTo(cx, cy - 18 * s, cx + 26 * s, cy); al.quadraticCurveTo(cx, cy + 18 * s, cx - 26 * s, cy); al.closePath();
    ctx.fillStyle = "#f4ead2"; ctx.fill(al);
    ctx.save(); ctx.clip(al);
    const ig = ctx.createRadialGradient(cx, cy, 1, cx, cy, 11 * s); ig.addColorStop(0, o.void ? "#ff9cf0" : "#ffe28a"); ig.addColorStop(0.6, o.void ? "#8a2ad0" : "#c46a10"); ig.addColorStop(1, "#1a0a00");
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(cx, cy, 11 * s, 0, 7); ctx.fill();
    ctx.fillStyle = "#050205"; ctx.beginPath(); ctx.ellipse(cx, cy, 2.4 * s, 8 * s, 0, 0, 7); ctx.fill();
    glowDot(ctx, cx + 4 * s, cy - 4 * s, 3 * s, "#ffffff");
    ctx.restore();
    p.addPath(al);
    return p;
  },
  gem(ctx, w, h, P, rng, o) {
    const s = h / 100, cx = w / 2, cy = h * 0.5, p = new Path2D();
    if (o.shape === "pearl") {
      const shell = new Path2D(); shell.moveTo(cx - 34 * s, cy + 18 * s); shell.quadraticCurveTo(cx, cy + 46 * s, cx + 34 * s, cy + 18 * s); shell.lineTo(cx, cy + 22 * s); shell.closePath();
      const top = new Path2D(); top.moveTo(cx - 34 * s, cy + 12 * s); top.quadraticCurveTo(cx, cy - 40 * s, cx + 34 * s, cy + 12 * s); top.lineTo(cx, cy + 6 * s); top.closePath();
      for (const sh of [top, shell]) { const g = ctx.createLinearGradient(0, cy - 30 * s, 0, cy + 40 * s); g.addColorStop(0, "#2c6b70"); g.addColorStop(1, "#0a2428"); ctx.fillStyle = g; ctx.fill(sh); ctx.strokeStyle = rgba("#bff8ff", 0.4); ctx.lineWidth = 0.8 * s; ctx.stroke(sh); }
      glowDot(ctx, cx, cy + 10 * s, 40 * s, "#bff8ff", 0.5);
      const pearl = new Path2D(); pearl.arc(cx, cy + 10 * s, 12 * s, 0, 7);
      const pg = ctx.createRadialGradient(cx - 4 * s, cy + 6 * s, 1, cx, cy + 10 * s, 13 * s); pg.addColorStop(0, "#ffffff"); pg.addColorStop(0.6, "#e6eef2"); pg.addColorStop(1, "#8aa0aa");
      ctx.fillStyle = pg; ctx.fill(pearl); p.addPath(pearl); p.addPath(shell);
      return p;
    }
    ctx.fillStyle = rgba(P.dark, 0.9); ctx.beginPath(); ctx.moveTo(cx - 40 * s, h); ctx.lineTo(cx - 26 * s, cy + 26 * s); ctx.lineTo(cx + 24 * s, cy + 24 * s); ctx.lineTo(cx + 42 * s, h); ctx.fill();
    glowDot(ctx, cx, cy, 60 * s, P.glow, 0.5);
    const heart = new Path2D();
    heart.moveTo(cx, cy + 28 * s); heart.bezierCurveTo(cx - 40 * s, cy + 2 * s, cx - 30 * s, cy - 30 * s, cx, cy - 14 * s);
    heart.bezierCurveTo(cx + 30 * s, cy - 30 * s, cx + 40 * s, cy + 2 * s, cx, cy + 28 * s); heart.closePath();
    ctx.save(); ctx.shadowColor = "#ff3a1a"; ctx.shadowBlur = 30 * s; ctx.fillStyle = "#b3100c"; ctx.fill(heart); ctx.restore();
    ctx.save(); ctx.clip(heart);
    const facets = [[cx, cy - 4 * s], [cx - 18 * s, cy - 14 * s], [cx + 18 * s, cy - 14 * s], [cx - 22 * s, cy + 4 * s], [cx + 22 * s, cy + 4 * s], [cx, cy + 26 * s]];
    for (let i = 0; i < facets.length; i++) for (let j = i + 1; j < facets.length; j++) {
      ctx.fillStyle = rgba(rng() < 0.5 ? "#ff8a5a" : "#5a0008", 0.35); ctx.beginPath(); ctx.moveTo(...facets[i]); ctx.lineTo(...facets[j]); ctx.lineTo(cx, cy - 4 * s); ctx.fill();
    }
    glowDot(ctx, cx - 10 * s, cy - 12 * s, 8 * s, "#ffffff", 0.8);
    ctx.restore();
    p.addPath(heart);
    return p;
  },
  playcard(ctx, w, h, P, rng) {
    const s = h / 100, cx = w / 2, cy = h * 0.5;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.16);
    const c = rrPath(-24 * s, -36 * s, 48 * s, 72 * s, 4 * s);
    ctx.shadowColor = P.glow; ctx.shadowBlur = 30 * s; ctx.fillStyle = "#0c0c10"; ctx.fill(c); ctx.shadowBlur = 0;
    ctx.strokeStyle = "#c9a54a"; ctx.lineWidth = 1 * s; ctx.stroke(c);
    const sp = new Path2D(); sp.moveTo(0, -18 * s); sp.bezierCurveTo(-20 * s, 0, -14 * s, 12 * s, 0, 6 * s); sp.bezierCurveTo(14 * s, 12 * s, 20 * s, 0, 0, -18 * s);
    sp.moveTo(0, 4 * s); sp.lineTo(-5 * s, 16 * s); sp.lineTo(5 * s, 16 * s); sp.closePath();
    const g = ctx.createLinearGradient(0, -18 * s, 0, 16 * s); g.addColorStop(0, "#fff0b3"); g.addColorStop(1, "#8a6a1e");
    ctx.fillStyle = g; ctx.fill(sp);
    ctx.fillStyle = "#e8d6a0"; ctx.font = `700 ${8 * s}px ${FONT_DISPLAY}`; ctx.fillText("A", -21 * s, -27 * s);
    ctx.restore();
    for (let i = 0; i < 7; i++) { const x = w * (0.1 + rng() * 0.8), y = h * (0.75 + rng() * 0.2); ctx.fillStyle = pick2(rng, ["#7a1020", "#0c0c10", "#c9a54a"]); ctx.beginPath(); ctx.ellipse(x, y, 7 * s, 2.4 * s, 0, 0, 7); ctx.fill(); ctx.strokeStyle = rgba("#ffffff", 0.3); ctx.stroke(); }
    const p = new Path2D(); p.addPath(c, new DOMMatrix().translate(cx, cy).rotate(-0.16 * 57.3)); return p;
  },
  structure(ctx, w, h, P, rng, o) {
    const s = h / 100, cx = w / 2, p = new Path2D(), lit = [];
    const base = h * 0.95;
    if (o.kind === "castle" || o.kind === "citadel") {
      const spiky = o.kind === "citadel";
      p.addPath(poly([[cx - 30 * s, base], [cx - 30 * s, base - 34 * s], [cx + 30 * s, base - 34 * s], [cx + 30 * s, base]]));
      for (const [tx, tw, th] of [[-30, 10, 56], [20, 10, 56], [-8, 16, 74]]) {
        const x = cx + tx * s;
        p.addPath(poly([[x, base], [x, base - th * s], [x + tw * s, base - th * s], [x + tw * s, base]]));
        if (spiky) p.addPath(poly([[x - 2 * s, base - th * s], [x + tw / 2 * s, base - (th + 22) * s], [x + (tw + 2) * s, base - th * s]]));
        else for (let k = 0; k < 3; k++) p.addPath(poly([[x + k * tw / 3 * s, base - th * s], [x + k * tw / 3 * s, base - (th + 4) * s], [x + (k + 0.5) * tw / 3 * s, base - (th + 4) * s], [x + (k + 0.5) * tw / 3 * s, base - th * s]]));
        lit.push([x + tw / 2 * s, base - (th - 10) * s]);
      }
      lit.push([cx, base - 20 * s]);
    } else if (o.kind === "pagoda") {
      for (let i = 0; i < 5; i++) {
        const y = base - i * 15 * s, wd = (34 - i * 5) * s;
        p.addPath(poly([[cx - wd * 0.7, y], [cx - wd * 0.7, y - 9 * s], [cx + wd * 0.7, y - 9 * s], [cx + wd * 0.7, y]]));
        const roof = new Path2D(); roof.moveTo(cx - wd - 4 * s, y - 7 * s); roof.quadraticCurveTo(cx - wd * 0.5, y - 10 * s, cx, y - 16 * s);
        roof.quadraticCurveTo(cx + wd * 0.5, y - 10 * s, cx + wd + 4 * s, y - 7 * s); roof.lineTo(cx, y - 11 * s); roof.closePath();
        p.addPath(roof); lit.push([cx, y - 4 * s]);
      }
      p.addPath(poly([[cx - 1 * s, base - 76 * s], [cx, base - 90 * s], [cx + 1 * s, base - 76 * s]]));
    } else if (o.kind === "obelisk") {
      p.addPath(poly([[cx - 12 * s, base], [cx - 8 * s, base - 70 * s], [cx, base - 82 * s], [cx + 8 * s, base - 70 * s], [cx + 12 * s, base]]));
      p.addPath(poly([[cx - 24 * s, base], [cx - 20 * s, base - 6 * s], [cx + 20 * s, base - 6 * s], [cx + 24 * s, base]]));
      lit.push([cx, base - 76 * s]);
    } else if (o.kind === "lighthouse") {
      p.addPath(poly([[cx - 40 * s, h], [cx - 30 * s, base - 8 * s], [cx + 10 * s, base - 12 * s], [cx + 36 * s, base - 4 * s], [cx + 44 * s, h]]));
      p.addPath(poly([[cx - 9 * s, base - 10 * s], [cx - 6 * s, base - 62 * s], [cx + 6 * s, base - 62 * s], [cx + 9 * s, base - 10 * s]]));
      p.addPath(poly([[cx - 8 * s, base - 62 * s], [cx - 8 * s, base - 72 * s], [cx, base - 78 * s], [cx + 8 * s, base - 72 * s], [cx + 8 * s, base - 62 * s]]));
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const bx = cx, by = base - 67 * s, bg = ctx.createLinearGradient(bx, by, bx - w * 0.6, by - h * 0.1);
      bg.addColorStop(0, "rgba(255,248,210,0.7)"); bg.addColorStop(1, "rgba(255,248,210,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - w * 0.7, by - h * 0.25); ctx.lineTo(bx - w * 0.7, by + h * 0.08); ctx.fill(); ctx.restore();
      lit.push([cx, base - 67 * s]);
    } else if (o.kind === "opera") {
      p.addPath(poly([[cx - 40 * s, base], [cx - 40 * s, base - 30 * s], [cx + 40 * s, base - 30 * s], [cx + 40 * s, base]]));
      p.addPath(poly([[cx - 44 * s, base - 30 * s], [cx, base - 44 * s], [cx + 44 * s, base - 30 * s]]));
      const dome = new Path2D(); dome.ellipse(cx, base - 44 * s, 18 * s, 16 * s, 0, Math.PI, 0); dome.closePath(); p.addPath(dome);
      p.addPath(poly([[cx - 1 * s, base - 60 * s], [cx, base - 70 * s], [cx + 1 * s, base - 60 * s]]));
      for (let i = -3; i <= 3; i++) lit.push([cx + i * 10 * s, base - 14 * s]);
    }
    silhouette(ctx, p, P, s, { aura: 24 });
    for (const [x, y] of lit) glowDot(ctx, x, y, 5 * s, P.glow);
    return p;
  },
  ship(ctx, w, h, P, rng, o) {
    const s = h / 100, cx = w / 2, cy = h * 0.48, p = new Path2D();
    if (o.zeppelin) {
      const env = new Path2D(); env.ellipse(cx, cy - 6 * s, 40 * s, 15 * s, -0.05, 0, 7);
      const g = ctx.createLinearGradient(0, cy - 21 * s, 0, cy + 9 * s); g.addColorStop(0, "#e8c890"); g.addColorStop(0.5, "#a8763a"); g.addColorStop(1, "#4a2c10");
      ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 24 * s; ctx.fillStyle = g; ctx.fill(env); ctx.restore();
      ctx.strokeStyle = rgba("#3a2008", 0.6); ctx.lineWidth = 0.8 * s;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(cx + i * 10 * s, cy - 6 * s, 2 * s + Math.abs(i) * 0.5 * s, 15 * s * Math.sqrt(1 - (i / 4) ** 2), 0, 0, 7); ctx.stroke(); }
      const gon = poly([[cx - 12 * s, cy + 10 * s], [cx + 12 * s, cy + 10 * s], [cx + 9 * s, cy + 18 * s], [cx - 9 * s, cy + 18 * s]]);
      ctx.fillStyle = "#3a2008"; ctx.fill(gon);
      for (let i = -2; i <= 2; i++) glowDot(ctx, cx + i * 4 * s, cy + 14 * s, 2 * s, "#ffd28a");
      ctx.fillStyle = "#3a2008"; ctx.fill(poly([[cx + 36 * s, cy - 6 * s], [cx + 48 * s, cy - 18 * s], [cx + 48 * s, cy + 6 * s]]));
      for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba("#ffffff", 0.08); ctx.beginPath(); ctx.arc(cx - 46 * s - i * 9 * s, cy - 4 * s - i * 3 * s, (5 + i * 2) * s, 0, 7); ctx.fill(); }
      p.addPath(env); p.addPath(gon);
      return p;
    }
    const hull = poly([[cx + 46 * s, cy], [cx + 10 * s, cy - 9 * s], [cx - 26 * s, cy - 8 * s], [cx - 34 * s, cy - 3 * s], [cx - 34 * s, cy + 5 * s], [cx - 26 * s, cy + 9 * s], [cx + 10 * s, cy + 8 * s]]);
    const wings = poly([[cx - 6 * s, cy - 6 * s], [cx - 24 * s, cy - 30 * s], [cx - 30 * s, cy - 30 * s], [cx - 22 * s, cy - 6 * s], [cx - 22 * s, cy + 6 * s], [cx - 30 * s, cy + 30 * s], [cx - 24 * s, cy + 30 * s], [cx - 6 * s, cy + 6 * s]]);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (const dy of [-4, 4]) { const g = ctx.createLinearGradient(cx - 34 * s, 0, cx - 90 * s, 0); g.addColorStop(0, "rgba(160,220,255,0.9)"); g.addColorStop(1, "rgba(80,120,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 34 * s, cy + dy * s - 3 * s); ctx.lineTo(cx - 100 * s, cy + dy * s); ctx.lineTo(cx - 34 * s, cy + dy * s + 3 * s); ctx.fill(); }
    ctx.restore();
    p.addPath(wings); p.addPath(hull);
    silhouette(ctx, p, P, s, { body0: "#8a9ab8", body1: "#1a2236", rim: "#e8f4ff", aura: 22 });
    ctx.fillStyle = rgba(P.glow, 0.85); ctx.beginPath(); ctx.ellipse(cx + 18 * s, cy - 2 * s, 7 * s, 2.4 * s, -0.1, 0, 7); ctx.fill();
    for (const dy of [-4, 4]) glowDot(ctx, cx - 34 * s, cy + dy * s, 5 * s, "#a0dcff");
    for (let i = 0; i < 6; i++) glowDot(ctx, cx - (10 - i * 6) * s, cy + 6 * s, 1.2 * s, P.glow);
    return p;
  },
  mech(ctx, w, h, P, rng, o) {
    const s = h / 100, ox = w / 2 - 50 * s, oy = h * 0.04, p = new Path2D();
    if (o.stone) {
      const blobs = [[50, 62, 22, 18], [50, 36, 13, 11], [30, 60, 8, 10], [70, 60, 8, 10], [40, 86, 8, 8], [60, 86, 8, 8]];
      for (const [x, y, rx, ry] of blobs) { const b = new Path2D(); b.ellipse(x, y, rx, ry, 0, 0, 7); p.addPath(b); }
      const W = local(p, ox, oy, s);
      silhouette(ctx, W, P, s, { body0: "#5a6a5a", body1: "#1a241a", rim: "#c9ff9c" });
      ctx.fillStyle = "#3f8a3a"; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(ox + (35 + rng() * 30) * s, oy + (28 + rng() * 30) * s, (3 + rng() * 4) * s, 2 * s, rng(), 0, 7); ctx.fill(); }
      glowDot(ctx, ox + 46 * s, oy + 36 * s, 2.4 * s, P.glow); glowDot(ctx, ox + 54 * s, oy + 36 * s, 2.4 * s, P.glow);
      return W;
    }
    if (o.fist) {
      p.addPath(poly([[30, 34], [62, 30], [70, 40], [70, 70], [60, 78], [32, 76], [26, 62]]));
      for (let i = 0; i < 4; i++) p.addPath(poly([[34 + i * 8, 30], [41 + i * 8, 30], [41 + i * 8, 22], [34 + i * 8, 22]]));
      p.addPath(poly([[60, 48], [76, 44], [80, 54], [66, 60]]));
      p.addPath(poly([[36, 76], [58, 78], [56, 96], [38, 96]]));
      const W = local(p, ox, oy, s);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const fl = ctx.createLinearGradient(0, oy + 90 * s, 0, h); fl.addColorStop(0, "rgba(255,200,90,0.95)"); fl.addColorStop(1, "rgba(255,80,20,0)");
      ctx.fillStyle = fl; ctx.beginPath(); ctx.moveTo(ox + 38 * s, oy + 96 * s); ctx.lineTo(ox + 47 * s, h * 1.1); ctx.lineTo(ox + 56 * s, oy + 96 * s); ctx.fill(); ctx.restore();
      silhouette(ctx, W, P, s, { body0: "#c87a2a", body1: "#3a1a08", rim: "#ffe0a0" });
      return W;
    }
    const k = o.heavy ? 1.25 : 1;
    p.addPath(poly([[50 - 7 * k, 12], [50 + 7 * k, 12], [50 + 8 * k, 22], [50 - 8 * k, 22]]));
    p.addPath(poly([[50 - 18 * k, 26], [50 + 18 * k, 26], [50 + 14 * k, 54], [50 - 14 * k, 54]]));
    p.addPath(poly([[50 - 30 * k, 24], [50 - 17 * k, 22], [50 - 16 * k, 34], [50 - 28 * k, 36]]));
    p.addPath(poly([[50 + 30 * k, 24], [50 + 17 * k, 22], [50 + 16 * k, 34], [50 + 28 * k, 36]]));
    p.addPath(poly([[50 - 28 * k, 36], [50 - 20 * k, 36], [50 - 22 * k, 66], [50 - 30 * k, 66]]));
    p.addPath(poly([[50 + 28 * k, 36], [50 + 20 * k, 36], [50 + 22 * k, 66], [50 + 30 * k, 66]]));
    p.addPath(poly([[50 - 12 * k, 54], [50 - 3, 54], [50 - 4, 96], [50 - 15 * k, 96]]));
    p.addPath(poly([[50 + 12 * k, 54], [50 + 3, 54], [50 + 4, 96], [50 + 15 * k, 96]]));
    const W = local(p, ox, oy, s);
    silhouette(ctx, W, P, s, { body0: o.gears ? "#8a5a22" : "#5a6c88", body1: o.gears ? "#2a1806" : "#141c2a", rim: o.gears ? "#ffd28a" : "#cfe8ff" });
    ctx.fillStyle = rgba(P.glow, 0.95); ctx.shadowColor = P.glow; ctx.shadowBlur = 14 * s;
    ctx.fillRect(ox + (50 - 6 * k) * s, oy + 16 * s, 12 * k * s, 2.2 * s); ctx.shadowBlur = 0;
    glowDot(ctx, ox + 50 * s, oy + 38 * s, (o.gears ? 7 : 5) * s, o.gears ? "#ffb347" : P.glow);
    return W;
  },
  tree(ctx, w, h, P, rng) {
    const s = h / 100, cx = w / 2, p = new Path2D();
    const trunk = new Path2D(); trunk.moveTo(cx - 14 * s, h); trunk.quadraticCurveTo(cx - 6 * s, h * 0.7, cx - 8 * s, h * 0.42);
    trunk.lineTo(cx + 8 * s, h * 0.42); trunk.quadraticCurveTo(cx + 6 * s, h * 0.7, cx + 14 * s, h); trunk.closePath();
    p.addPath(trunk);
    for (let i = 0; i < 26; i++) { const a = rng() * Math.PI, r = (8 + rng() * 26) * s, b = new Path2D(); b.arc(cx + Math.cos(a) * (36 * s) * rng() * 1.3 * (rng() < 0.5 ? -1 : 1), h * 0.32 - Math.sin(a) * 18 * s * rng(), r, 0, 7); p.addPath(b); }
    for (const side of [-1, 1]) p.addPath(poly([[cx + side * 10 * s, h * 0.9], [cx + side * 34 * s, h], [cx + side * 14 * s, h]]));
    silhouette(ctx, p, P, s, { body0: "#2a5a3a", body1: "#06140c", rim: "#d9ffb0", aura: 30 });
    glowDot(ctx, cx - 4 * s, h * 0.6, 3 * s, P.glow); glowDot(ctx, cx + 4 * s, h * 0.6, 3 * s, P.glow);
    particles(ctx, w, h, rng, "motes", P);
    return p;
  },
  kraken(ctx, w, h, P, rng, o) {
    const s = h / 100, p = new Path2D();
    if (o.cosmic) { const g = ctx.createRadialGradient(w / 2, h * 0.95, 0, w / 2, h * 0.95, 50 * s); g.addColorStop(0, "#000000"); g.addColorStop(0.7, "#2a0040"); g.addColorStop(1, "rgba(120,40,200,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
    for (let i = 0; i < 7; i++) {
      const bx = w * (0.12 + i * 0.13), dir = i < 3.5 ? -1 : 1, top = h * (0.08 + rng() * 0.25);
      const pts = [[bx, h * 1.02], [bx + dir * 10 * s, h * 0.7], [bx - dir * 8 * s, h * 0.45], [bx + dir * 12 * s, top + 10 * s], [bx + dir * 2 * s, top]];
      const T = tube(pts, 14 * s, 1.5 * s, 50);
      p.addPath(T.path);
      ctx.save();
      silhouette(ctx, T.path, P, s, { aura: 14, body0: o.cosmic ? "#3a1a5a" : "#1f5a63", body1: o.cosmic ? "#0a0014" : "#04161a" });
      ctx.fillStyle = rgba(P.glow, 0.45);
      for (let k = 6; k < T.line.length - 6; k += 4) { const [x, y] = T.right[k]; const [cx2, cy2] = T.line[k]; ctx.beginPath(); ctx.arc((x * 2 + cx2) / 3, (y * 2 + cy2) / 3, (1 - k / T.line.length) * 2.4 * s, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    glowDot(ctx, w * 0.5, h * 0.82, 7 * s, o.cosmic ? "#ff9cf0" : "#fff3a0");
    return p;
  },
  planet(ctx, w, h, P, rng, o) {
    const s = h / 100, cx = w / 2, cy = h * 0.5, p = new Path2D();
    if (o.hole) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = rgba(i === 1 ? "#ffd0a0" : "#d68cff", 0.6 - i * 0.15); ctx.lineWidth = (8 - i * 2) * s; ctx.shadowColor = "#ff9a4a"; ctx.shadowBlur = 30 * s; ctx.beginPath(); ctx.ellipse(cx, cy, (44 + i * 6) * s, (10 + i * 2) * s, -0.2, 0, 7); ctx.stroke(); }
      ctx.restore();
      glowDot(ctx, cx, cy, 30 * s, "#ffb36a", 0.6);
      const hole = new Path2D(); hole.arc(cx, cy, 16 * s, 0, 7);
      ctx.fillStyle = "#000000"; ctx.fill(hole);
      ctx.save(); ctx.strokeStyle = "rgba(255,220,180,0.9)"; ctx.lineWidth = 1.5 * s; ctx.shadowColor = "#ffb36a"; ctx.shadowBlur = 16 * s; ctx.stroke(hole); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "rgba(255,200,140,0.7)"; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.ellipse(cx, cy, 44 * s, 10 * s, -0.2, Math.PI * 0.05, Math.PI * 0.95); ctx.stroke(); ctx.restore();
      p.addPath(hole); return p;
    }
    if (o.comet) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const g = ctx.createLinearGradient(cx + 20 * s, cy - 10 * s, cx - 60 * s, cy + 30 * s); g.addColorStop(0, "rgba(200,240,255,0.9)"); g.addColorStop(1, "rgba(80,140,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx + 20 * s, cy - 16 * s); ctx.lineTo(cx - 70 * s, cy + 20 * s); ctx.lineTo(cx - 60 * s, cy + 40 * s); ctx.lineTo(cx + 22 * s, cy - 4 * s); ctx.fill(); ctx.restore();
      glowDot(ctx, cx + 21 * s, cy - 10 * s, 26 * s, "#bfe8ff", 0.9);
      const head = new Path2D(); head.arc(cx + 21 * s, cy - 10 * s, 6 * s, 0, 7);
      ctx.fillStyle = "#ffffff"; ctx.fill(head);
      p.addPath(head); return p;
    }
    const body = new Path2D(); body.arc(cx, cy, 26 * s, 0, 7);
    const ring = (front) => { ctx.save(); ctx.strokeStyle = rgba("#e8d8ff", 0.75); ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.ellipse(cx, cy, 48 * s, 12 * s, -0.35, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1.2 * s; ctx.strokeStyle = rgba("#ffffff", 0.5); ctx.beginPath(); ctx.ellipse(cx, cy, 42 * s, 10 * s, -0.35, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); ctx.stroke(); ctx.restore(); };
    if (o.rings) ring(false);
    ctx.save(); ctx.shadowColor = P.glow; ctx.shadowBlur = 40 * s;
    const g = ctx.createRadialGradient(cx - 10 * s, cy - 10 * s, 2 * s, cx, cy, 28 * s); g.addColorStop(0, "#e8d0ff"); g.addColorStop(0.5, "#8a5ad0"); g.addColorStop(1, "#1a0a3a");
    ctx.fillStyle = g; ctx.fill(body); ctx.restore();
    ctx.save(); ctx.clip(body); ctx.strokeStyle = rgba("#ffffff", 0.12); ctx.lineWidth = 3 * s;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy + i * 7 * s, 30 * s, 3 * s, -0.35, 0, 7); ctx.stroke(); } ctx.restore();
    if (o.rings) ring(true);
    p.addPath(body);
    return p;
  },
  orb(ctx, w, h, P, rng, o) {
    const s = h / 100, p = new Path2D(), n = o.count || 1;
    const pts = n === 1 ? [[w / 2, h * 0.48, 14]] : Array.from({ length: n }, (_, i) => { const a = Math.PI * (0.15 + 0.7 * i / (n - 1)); return [w / 2 - Math.cos(a) * 34 * s, h * 0.62 - Math.sin(a) * 34 * s, 7]; });
    for (const [x, y, r] of pts) {
      if (o.wings) for (const side of [-1, 1]) for (const k of [0, 1]) { ctx.fillStyle = rgba("#e8ffe0", 0.35); ctx.beginPath(); ctx.ellipse(x + side * (r + 8) * s, y - (6 - k * 10) * s, 12 * s, 5 * s, side * (0.5 - k), 0, 7); ctx.fill(); }
      glowDot(ctx, x, y, r * 3.2 * s, P.glow, 0.6);
      const b = new Path2D(); b.arc(x, y, r * s, 0, 7);
      const g = ctx.createRadialGradient(x - r * 0.3 * s, y - r * 0.3 * s, 1, x, y, r * s); g.addColorStop(0, "#ffffff"); g.addColorStop(1, mix(P.glow, "#ffffff", 0.2));
      ctx.fillStyle = g; ctx.fill(b); p.addPath(b);
      if (n > 1) { ctx.strokeStyle = rgba("#fff6d0", 0.8); ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.ellipse(x, y - r * 1.6 * s, r * 0.9 * s, r * 0.3 * s, 0, 0, 7); ctx.stroke(); }
    }
    particles(ctx, w, h, rng, "motes", P);
    return p;
  },
};
function pick2(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function paintArt(ctx, w, h, c, rng) {
  const f = FR[c.fid], P = palette(f);
  // Each panorama card is a crop of one identically seeded, four-card scene.
  if (f.panorama) {
    let sceneSeed = 2166136261;
    for (const ch of f.id) sceneSeed = Math.imul(sceneSeed ^ ch.charCodeAt(0), 16777619);
    const shared = seeded(sceneSeed), bigW = w * 2, bigH = h * 2;
    const scene = newCanvas(bigW, bigH), sx = scene.getContext("2d");
    const [, , subject, opts] = f.cards[0];
    drawScene(sx, bigW, bigH, f, P, shared);
    (SUBJECTS[subject] || SUBJECTS.orb)(sx, bigW, bigH, P, shared, opts || {});
    ctx.drawImage(scene, -(c.idx % 2) * w, -Math.floor(c.idx / 2) * h);
    return new Path2D();
  }
  const [, , subject, opts] = f.cards[c.idx];
  drawScene(ctx, w, h, f, P, rng);
  const path = (SUBJECTS[subject] || SUBJECTS.orb)(ctx, w, h, P, rng, opts || {}) || new Path2D();
  const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.95);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 900; i++) { ctx.fillStyle = rng() < 0.5 ? "#ffffff" : "#000000"; ctx.fillRect(rng() * w, rng() * h, 1.2, 1.2); }
  ctx.globalAlpha = 1;
  return path;
}

// Wear is printed on both faces before encapsulation, so a grading result
// verifies the visible card rather than replacing its physical condition.
function paintWear(colorCtx, materialCtx, c, o, back = false) {
  const condition = Math.max(5, Math.min(10, o.condition || o.grade || 9));
  const severity = (10 - condition) / 5;
  if (!severity) return;
  for (const ctx of [colorCtx, materialCtx].filter(Boolean)) {
    const rng = seeded((c.seed ^ ((o.serial || 1) * 7919)) >>> 0);
    const material = ctx === materialCtx;
    ctx.save(); ctx.clip(rrPath(0, 0, CW, CH, 46));
    // Irregular whitening on the cut edges exposes the paper fibers.
    for (let i = 0; i < Math.round(18 + severity * 70); i++) {
      const edge = i % 4, p = rng(), length = 5 + rng() * (14 + severity * 48);
      const depth = 1 + rng() * severity * 20;
      const x = edge === 0 ? 0 : edge === 1 ? CW - depth : p * CW;
      const y = edge === 2 ? 0 : edge === 3 ? CH - depth : p * CH;
      ctx.fillStyle = material ? M(0, 0, 0.03) : rgba("#e4d9bd", 0.4 + severity * 0.5);
      ctx.fillRect(x, y, edge < 2 ? depth : length, edge < 2 ? length : depth);
    }
    // Corner delamination is clear even in a small thumbnail.
    for (const [x, y, dx, dy] of [[0, 0, 1, 1], [CW, 0, -1, 1], [0, CH, 1, -1], [CW, CH, -1, -1]]) {
      const n = severity * (condition <= 6 ? 90 : 35);
      ctx.fillStyle = material ? M(0, 0, 0) : "#d5c7a9";
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx * n, y);
      ctx.lineTo(x + dx * n * 0.68, y + dy * n * 0.24);
      ctx.lineTo(x + dx * n * 0.38, y + dy * n * 0.45);
      ctx.lineTo(x, y + dy * n); ctx.closePath(); ctx.fill();
    }
    if (condition <= 8) {
      const count = condition <= 6 ? 12 : condition === 7 ? 7 : 3;
      for (let i = 0; i < count; i++) {
        const x = 80 + rng() * (CW - 160), y = 160 + rng() * (CH - 320);
        ctx.strokeStyle = material ? M(0, 0, 0.01) : rgba("#eee6d5", 0.18 + severity * 0.25);
        ctx.lineWidth = 1 + severity * 2.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12 + rng() * 120, y - 20 - rng() * 110); ctx.stroke();
      }
    }
    if (condition <= 6) {
      // A worn card has a long folded crease, with a dark groove and pale ridge.
      for (const offset of [0, 5]) {
        ctx.strokeStyle = material ? M(0, 0, offset ? 0.15 : 0) : offset ? "rgba(247,233,202,.55)" : "rgba(20,12,7,.6)";
        ctx.lineWidth = condition === 5 ? 7 : 4;
        ctx.beginPath(); ctx.moveTo(34, CH * (back ? 0.66 : 0.42) + offset);
        ctx.lineTo(CW * 0.5, CH * 0.57 + offset); ctx.lineTo(CW - 28, CH * 0.7 + offset); ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function paintPrintError(ctx, materialCtx, c, o) {
  if (!o.misprint) return;
  ctx.save(); ctx.clip(rrPath(48, 48, CW - 96, CH - 96, 22));
  if (o.misprint === "Double strike") {
    ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.52;
    ctx.fillStyle = "#ff558b"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    fitFont(ctx, c.name, 700, FONT_DISPLAY, 60, CW - 330);
    ctx.fillText(c.name, 119, 133);
    ctx.strokeStyle = "#50ecff"; ctx.lineWidth = 5;
    ctx.stroke(rrPath(92, 205, CW - 156, 600, 10));
  } else {
    // Offset foil remains distinct from the intentionally flat counterfeit foil.
    ctx.strokeStyle = "#ecb8ff"; ctx.lineWidth = 13;
    ctx.setLineDash([34, 12]); ctx.stroke(rrPath(72, 183, CW - 156, 600, 10));
    if (materialCtx) {
      materialCtx.save(); materialCtx.strokeStyle = M(1, 1, 0.9); materialCtx.lineWidth = 13;
      materialCtx.setLineDash([34, 12]); materialCtx.stroke(rrPath(72, 183, CW - 156, 600, 10)); materialCtx.restore();
    }
  }
  ctx.restore();
  ctx.save(); ctx.translate(CW - 90, 750); ctx.rotate(-Math.PI / 2);
  ctx.font = `800 20px ${FONT_BODY}`; ctx.fillStyle = "#ffe2a0"; ctx.textAlign = "center";
  ctx.fillText(`FACTORY ERROR · ${o.misprint.toUpperCase()}`, 0, 0); ctx.restore();
}

/* ---------------------------------------------------------------- the card faces */
// o: { holo, grade, serial, tell, px (width in pixels), gl (true when the 3D inspector will light it), mat (paint material layers) }
function paintFront(c, o) {
  const px = o.px || 1024, k = px / CW, H = Math.round(CH * k);
  const color = newCanvas(px, H), mat = o.mat ? newCanvas(px, H) : null, uv = o.mat ? newCanvas(Math.round(px / 2), Math.round(H / 2)) : null;
  const f = FR[c.fid], P = palette(f), foil = FOILS[c.r], rng = seeded(c.seed);
  const fakeFoil = o.tell === "foil", full = c.r === 4, ultra = c.r === 4;
  const ctxs = [color.getContext("2d")].concat(mat ? [mat.getContext("2d")] : []);
  ctxs.forEach(x => { x.setTransform(k, 0, 0, k, 0, 0); });
  const [cc, mc] = ctxs;
  const both = (fn) => { fn(cc, false); if (mc) fn(mc, true); };
  const foilStyle = (ctx, isMat, x0, y0, x1, y1, height = 0.5) => {
    if (isMat) return fakeFoil ? M(0, 0, height * 0.6) : M(1, ultra ? 0.55 : 0, height);
    if (fakeFoil) return "#c3a24c";
    if (o.gl) { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, foil.base); g.addColorStop(0.5, mix(foil.base, foil.hi, 0.25)); g.addColorStop(1, foil.base); return g; }
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, foil.lo); g.addColorStop(0.22, foil.hi); g.addColorStop(0.45, foil.base); g.addColorStop(0.62, foil.lo); g.addColorStop(0.8, foil.hi); g.addColorStop(1, foil.base);
    return g;
  };
  // card stock and foil frame
  both((ctx, m) => { ctx.fillStyle = m ? M(0, 0, 0) : "#0b0a0d"; ctx.fill(rrPath(0, 0, CW, CH, 46)); });
  both((ctx, m) => { ctx.fillStyle = foilStyle(ctx, m, 0, 0, CW, CH, 0.55); ctx.fill(rrPath(22, 22, CW - 44, CH - 44, 34)); });
  // engraved lines in the frame
  both((ctx, m) => {
    ctx.save(); ctx.clip(rrPath(22, 22, CW - 44, CH - 44, 34));
    ctx.strokeStyle = m ? (fakeFoil ? M(0, 0, 0.2) : M(1, ultra ? 0.55 : 0, 0.32)) : rgba(foil.lo, o.gl ? 0.5 : 0.35);
    ctx.lineWidth = 2.2;
    for (let i = -CH; i < CW + CH; i += 14) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + CH * 0.55, CH); ctx.stroke(); }
    ctx.restore();
  });
  // inner panel
  const inner = rrPath(48, 48, CW - 96, CH - 96, 22);
  both((ctx, m) => {
    if (m) { ctx.fillStyle = M(0, 0, 0.2); ctx.fill(inner); return; }
    const g = ctx.createLinearGradient(0, 48, 0, CH - 48); g.addColorStop(0, mix(P.dark, P.sky[1], 0.35)); g.addColorStop(1, P.dark);
    ctx.fillStyle = g; ctx.fill(inner);
  });
  // the art
  const ax = full ? 48 : 78, ay = full ? 48 : 196, aw = full ? CW - 96 : CW - 156, ah = full ? CH - 96 : 600;
  const art = newCanvas(aw * k, ah * k), actx = art.getContext("2d");
  const subj = paintArt(actx, art.width, art.height, c, rng);
  cc.save(); cc.clip(full ? inner : rrPath(ax, ay, aw, ah, 10)); cc.drawImage(art, ax, ay, aw, ah); cc.restore();
  if (mc) {
    mc.save(); mc.clip(full ? inner : rrPath(ax, ay, aw, ah, 10));
    mc.fillStyle = o.holo ? M(0, 1, 0.12) : M(0, 0, 0.12); mc.fillRect(ax, ay, aw, ah);
    if (o.holo) { mc.translate(ax, ay); mc.scale(aw / art.width, ah / art.height); mc.fillStyle = M(0, 0.28, 0.3); mc.fill(subj); }
    mc.restore();
  }
  if (o.holo) {
    cc.save(); cc.clip(full ? inner : rrPath(ax, ay, aw, ah, 10)); cc.globalCompositeOperation = "overlay";
    const hg = cc.createLinearGradient(ax, ay, ax + aw, ay + ah);
    ["#ff5fa2", "#ffd36b", "#7dffb0", "#6bd5ff", "#b98aff", "#ff5fa2"].forEach((col, i) => hg.addColorStop(i / 5, col));
    cc.globalAlpha = o.gl ? 0.25 : 0.65; cc.fillStyle = hg; cc.fillRect(ax, ay, aw, ah);
    cc.globalCompositeOperation = "screen";
    const sparkle = seeded(c.seed ^ 9181);
    for (let i = 0; i < 70; i++) {
      const x = ax + sparkle() * aw, y = ay + sparkle() * ah, s = 2 + sparkle() * 7;
      cc.globalAlpha = 0.2 + sparkle() * 0.5;
      cc.fillStyle = ["#ffaddd", "#fff5bf", "#b8ffeb", "#b2dcff"][i % 4];
      cc.fillRect(x - s, y - 0.8, s * 2, 1.6); cc.fillRect(x - 0.8, y - s, 1.6, s * 2);
      if (mc) { mc.fillStyle = M(0.5, 1, 0.65); mc.fillRect(x - s, y - 1, s * 2, 2); }
    }
    cc.restore();
  }
  // art window bevel
  if (!full) both((ctx, m) => { ctx.lineWidth = 9; ctx.strokeStyle = foilStyle(ctx, m, ax, ay, ax + aw, ay + ah, 0.7); ctx.stroke(rrPath(ax - 4, ay - 4, aw + 8, ah + 8, 12)); });
  // name plate
  const plate = rrPath(70, 70, CW - 140, 104, 20);
  both((ctx, m) => {
    ctx.fillStyle = m ? M(0, 0, 0.45) : (full ? "rgba(8,6,10,0.72)" : mix(P.dark, "#000000", 0.35)); ctx.fill(plate);
    ctx.lineWidth = 5; ctx.strokeStyle = foilStyle(ctx, m, 70, 70, CW - 70, 174, 0.7); ctx.stroke(plate);
  });
  const name = c.name;
  both((ctx, m) => {
    const size = fitFont(ctx, name, 700, FONT_DISPLAY, 60, CW - 330);
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    ctx.fillStyle = foilStyle(ctx, m, 100, 90, 600, 160, 0.95);
    if (!m && !o.gl) { ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 6; }
    ctx.fillText(name, 104, 124);
    ctx.shadowBlur = 0;
    void size;
  });
  // rarity gem
  const gx = CW - 128, gy = 122;
  both((ctx, m) => {
    ctx.fillStyle = foilStyle(ctx, m, gx - 40, gy - 40, gx + 40, gy + 40, 0.75);
    ctx.beginPath(); ctx.arc(gx, gy, 40, 0, 7); ctx.fill();
    if (m) { const g = ctx.createRadialGradient(gx - 6, gy - 6, 2, gx, gy, 30); g.addColorStop(0, M(0, ultra ? 1 : 0, 1)); g.addColorStop(1, M(0, ultra ? 1 : 0, 0.55)); ctx.fillStyle = g; }
    else { const g = ctx.createRadialGradient(gx - 9, gy - 10, 2, gx, gy, 32); g.addColorStop(0, "#ffffff"); g.addColorStop(0.35, RARITIES[c.r].color); g.addColorStop(1, mix(RARITIES[c.r].color, "#000000", 0.6)); ctx.fillStyle = g; }
    ctx.beginPath(); ctx.arc(gx, gy, 30, 0, 7); ctx.fill();
  });
  cc.fillStyle = "#ffffff"; cc.font = `700 26px ${FONT_DISPLAY}`; cc.textAlign = "center"; cc.textBaseline = "middle";
  cc.globalAlpha = 0.85; cc.fillText(RARITIES[c.r].key, gx, gy + 2); cc.globalAlpha = 1;
  // type line
  const ty = full ? 790 : 812;
  const typeBar = rrPath(78, ty, CW - 156, 62, 14);
  both((ctx, m) => {
    ctx.fillStyle = m ? M(0, 0, 0.4) : (full ? "rgba(8,6,10,0.7)" : mix(P.dark, "#000000", 0.25)); ctx.fill(typeBar);
    ctx.lineWidth = 4; ctx.strokeStyle = foilStyle(ctx, m, 78, ty, CW - 78, ty + 62, 0.65); ctx.stroke(typeBar);
  });
  cc.textAlign = "left"; cc.textBaseline = "middle"; cc.fillStyle = "#efe6d2";
  fitFont(cc, `${f.name} · ${RARITIES[c.r].name}`, 600, FONT_BODY, 30, CW - 330);
  cc.fillText(`${f.name} · ${RARITIES[c.r].name}`, 104, ty + 32);
  cc.textAlign = "right"; cc.font = `600 26px ${FONT_BODY}`; cc.fillStyle = rgba("#efe6d2", 0.75);
  cc.fillText(`${TIERS[f.tier].name} set · ${c.idx + 1}/4`, CW - 104, ty + 32);
  // text box
  const by = ty + 78, bh = 300;
  const box = rrPath(78, by, CW - 156, bh, 14);
  both((ctx, m) => {
    if (m) { ctx.fillStyle = M(0, 0, 0.15); ctx.fill(box); return; }
    if (full) { ctx.fillStyle = "rgba(10,8,14,0.62)"; ctx.fill(box); }
    else { const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, "#efe4cc"); g.addColorStop(1, "#d8c8a6"); ctx.fillStyle = g; ctx.fill(box); }
    ctx.lineWidth = 3; ctx.strokeStyle = foilStyle(ctx, m, 78, by, CW - 78, by + bh, 0.5); ctx.stroke(box);
  });
  const ink = full ? "#f2ead8" : "#2a1f14";
  const abil = `${ABILITY_WORDS[c.seed % ABILITY_WORDS.length]} ${ABILITY_NOUNS[(c.seed >> 4) % ABILITY_NOUNS.length]}`;
  cc.textAlign = "left"; cc.textBaseline = "alphabetic"; cc.fillStyle = ink;
  cc.font = `800 34px ${FONT_BODY}`; cc.fillText(abil, 108, by + 56);
  cc.font = `500 30px ${FONT_BODY}`;
  wrapText(cc, ABILITY_TEXT[(c.seed >> 8) % ABILITY_TEXT.length].replace("{f}", f.name), 108, by + 100, CW - 216, 38, 3);
  cc.strokeStyle = rgba(ink, 0.35); cc.lineWidth = 2; cc.beginPath(); cc.moveTo(140, by + 192); cc.lineTo(CW - 140, by + 192); cc.stroke();
  cc.font = `italic 400 28px Georgia, "Times New Roman", serif`; cc.fillStyle = rgba(ink, 0.85);
  wrapText(cc, `"${LORE[(c.seed >> 12) % LORE.length]}"`, 108, by + 236, CW - 216, 34, 2);
  // bottom row: power medallion, set symbol, serial stamp
  const ry = by + bh + 22;
  both((ctx, m) => {
    ctx.fillStyle = foilStyle(ctx, m, 80, ry, 260, ry + 96, 0.7);
    ctx.fill(rrPath(78, ry, 190, 92, 46));
    ctx.fillStyle = m ? M(0, 0, 0.35) : mix(P.dark, "#000000", 0.3);
    ctx.fill(rrPath(88, ry + 10, 170, 72, 36));
  });
  const power = [1200, 3400, 6800, 9200, 12000][c.r] + (c.seed % 9) * 100;
  cc.fillStyle = "#f6edd8"; cc.font = `800 36px ${FONT_BODY}`; cc.textAlign = "center"; cc.textBaseline = "middle";
  cc.fillText(fmt0.format(power), 173, ry + 44);
  cc.font = `700 16px ${FONT_BODY}`; cc.fillStyle = rgba("#f6edd8", 0.7); cc.fillText("POWER", 173, ry + 74);
  both((ctx, m) => {
    ctx.fillStyle = foilStyle(ctx, m, CW / 2 - 40, ry, CW / 2 + 40, ry + 90, 0.8);
    ctx.beginPath(); ctx.arc(CW / 2, ry + 46, 36, 0, 7); ctx.fill();
    ctx.fillStyle = m ? M(0, 0, 0.4) : mix(P.dark, "#000000", 0.2); ctx.beginPath(); ctx.arc(CW / 2, ry + 46, 29, 0, 7); ctx.fill();
  });
  cc.fillStyle = mix(f.glow, "#ffffff", 0.3); cc.font = `700 32px ${FONT_DISPLAY}`; cc.fillText(f.name.replace(/^(The|Call of) /, "")[0], CW / 2, ry + 48);
  const serialStr = serialText(o.serial || 1, c.printed);
  both((ctx, m) => {
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    fitFont(ctx, serialStr, 800, FONT_BODY, 32, 260);
    ctx.fillStyle = foilStyle(ctx, m, CW - 360, ry, CW - 80, ry + 90, 0.9);
    ctx.fillText(serialStr, CW - 86, ry + 34);
  });
  cc.textAlign = "right"; cc.font = `600 20px ${FONT_BODY}`; cc.fillStyle = rgba("#efe6d2", 0.7);
  cc.fillText(`Illus. ${ARTISTS[c.seed % ARTISTS.length]}`, CW - 86, ry + 72);
  // footer
  cc.textAlign = "center"; cc.font = `600 19px ${FONT_BODY}`; cc.fillStyle = rgba("#efe6d2", 0.6); cc.textBaseline = "middle";
  cc.fillText(`© 2026 ${f.studio} · Luxury Vault TCG · ${String(c.idx + 1).padStart(3, "0")}/004 ${RARITIES[c.r].key}`, CW / 2, CH - 70);
  if (ultra) {
    // Ultra Mythics have a unique full-art frame and cut diamond inlays.
    both((ctx, m) => {
      ctx.save(); ctx.strokeStyle = m ? M(1, 1, 0.9) : "#f2e3ff"; ctx.lineWidth = 3;
      ctx.stroke(rrPath(12, 12, CW - 24, CH - 24, 42));
      ctx.stroke(rrPath(37, 37, CW - 74, CH - 74, 25));
      for (let i = 0; i < 13; i++) {
        for (const x of [36, CW - 36]) {
          const y = 235 + i * 78;
          ctx.fillStyle = m ? M(1, 1, 0.95) : ["#fff2c4", "#d1b5ff", "#b1f7ff"][i % 3];
          ctx.beginPath(); ctx.moveTo(x, y - 17); ctx.lineTo(x + 13, y);
          ctx.lineTo(x, y + 17); ctx.lineTo(x - 13, y); ctx.closePath(); ctx.fill();
        }
      }
      for (const [x, y] of [[75, 70], [CW - 75, 70], [75, CH - 70], [CW - 75, CH - 70]]) {
        ctx.translate(x, y); ctx.beginPath();
        for (let j = 0; j < 16; j++) { const a = j * Math.PI / 8, r = j % 2 ? 10 : 34; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        ctx.closePath(); ctx.fill(); ctx.translate(-x, -y);
      }
      ctx.restore();
    });
    cc.save(); cc.fillStyle = "rgba(15,6,27,.82)"; cc.fill(rrPath(190, 188, 620, 62, 25));
    cc.textAlign = "center"; cc.textBaseline = "middle"; cc.fillStyle = "#ffedbc";
    cc.font = `800 24px ${FONT_DISPLAY}`; cc.fillText("ULTRA MYTHIC · SOVEREIGN EDITION", CW / 2, 220); cc.restore();
  }
  paintPrintError(cc, mc, c, o);
  paintWear(cc, mc, c, o);
  // UV layer: genuine cards hide a watermark, fakes glow faintly all over (cheap paper)
  if (uv) {
    const u = uv.getContext("2d"), uk = uv.width / CW;
    u.setTransform(uk, 0, 0, uk, 0, 0);
    u.fillStyle = o.tell ? "#1e1e1e" : "#000000"; u.fillRect(0, 0, CW, CH);
    if (!o.tell) {
      u.save(); u.translate(CW / 2, by + bh / 2); u.rotate(-0.5); u.fillStyle = "#cfcfcf"; u.font = `800 34px ${FONT_BODY}`; u.textAlign = "center";
      for (let yy = -500; yy <= 500; yy += 70) u.fillText("VAULT AUTHENTIC · VAULT AUTHENTIC · VAULT AUTHENTIC", 0, yy);
      u.restore();
      u.strokeStyle = "#ffffff"; u.lineWidth = 6; u.beginPath();
      for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 - Math.PI / 2, r = i % 2 ? 50 : 120; u.lineTo(ax + aw - 170 + Math.cos(a) * r, ay + 160 + Math.sin(a) * r); }
      u.closePath(); u.stroke();
      u.fillStyle = "#ffffff"; u.font = `700 36px ${FONT_DISPLAY}`; u.textAlign = "center"; u.fillText(serialStr, CW / 2, ay + ah - 40);
    }
  }
  return { color, mat, uv };
}
function wrapText(ctx, text, x, y, maxW, lh, maxLines) {
  const words = text.split(" ");
  let line = "", n = 0;
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y + n * lh); line = w; n++; if (n >= maxLines) return; }
    else line = t;
  }
  if (line && n < maxLines) ctx.fillText(line, x, y + n * lh);
}
function guilloche(ctx, cx, cy, R, r, d, turns, steps) {
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps * Math.PI * 2 * turns;
    const x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t), y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);
    i ? ctx.lineTo(cx + x, cy + y) : ctx.moveTo(cx + x, cy + y);
  }
  ctx.stroke();
}
function paintBack(c, o) {
  const px = o.px || 1024, k = px / CW, H = Math.round(CH * k);
  const color = newCanvas(px, H), mat = o.mat ? newCanvas(px, H) : null, uv = o.mat ? newCanvas(Math.round(px / 2), Math.round(H / 2)) : null;
  const tell = o.tell, foil = FOILS[0];
  const ctxs = [color.getContext("2d")].concat(mat ? [mat.getContext("2d")] : []);
  ctxs.forEach(x => x.setTransform(k, 0, 0, k, 0, 0));
  const [cc, mc] = ctxs;
  const both = (fn) => { fn(cc, false); if (mc) fn(mc, true); };
  const gold = (ctx, m, h = 0.6, x0 = 0, y0 = 0, x1 = CW, y1 = CH) => {
    if (m) return M(1, 0, h);
    if (o.gl) return foil.base;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, foil.lo); g.addColorStop(0.3, foil.hi); g.addColorStop(0.55, foil.base); g.addColorStop(0.8, foil.hi); g.addColorStop(1, foil.lo);
    return g;
  };
  both((ctx, m) => { ctx.fillStyle = m ? M(0, 0, 0) : "#0b0a0d"; ctx.fill(rrPath(0, 0, CW, CH, 46)); });
  both((ctx, m) => { ctx.fillStyle = gold(ctx, m, 0.55); ctx.fill(rrPath(22, 22, CW - 44, CH - 44, 34)); });
  const inner = rrPath(44, 44, CW - 88, CH - 88, 24);
  both((ctx, m) => {
    if (m) { ctx.fillStyle = M(0, 0, 0.2); ctx.fill(inner); return; }
    const g = ctx.createRadialGradient(CW / 2, CH / 2, 50, CW / 2, CH / 2, CH * 0.7);
    g.addColorStop(0, "#2a1440"); g.addColorStop(0.6, "#160a26"); g.addColorStop(1, "#08040f");
    ctx.fillStyle = g; ctx.fill(inner);
  });
  // banknote-style guilloche rosettes
  both((ctx, m) => {
    ctx.save(); ctx.clip(inner);
    ctx.lineWidth = m ? 2.4 : 1.6;
    ctx.strokeStyle = m ? M(0.7, 0, 0.42) : (o.gl ? rgba(foil.base, 0.75) : rgba("#d6a945", 0.55));
    guilloche(ctx, CW / 2, CH / 2, 330, 37, 120, 37, 3200);
    ctx.strokeStyle = m ? M(0.6, 0, 0.38) : rgba("#b98aff", 0.35);
    guilloche(ctx, CW / 2, CH / 2, 420, 53, 70, 53, 3400);
    for (const [x, y] of [[150, 150], [CW - 150, 150], [150, CH - 150], [CW - 150, CH - 150]]) {
      ctx.strokeStyle = m ? M(0.7, 0, 0.4) : rgba("#d6a945", 0.45);
      guilloche(ctx, x, y, 90, 13, 34, 13, 900);
    }
    ctx.restore();
  });
  // central crest
  both((ctx, m) => {
    ctx.fillStyle = m ? M(0, 0, 0.3) : "#0d0716"; ctx.beginPath(); ctx.arc(CW / 2, CH / 2 - 40, 190, 0, 7); ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = gold(ctx, m, 0.85, CW / 2 - 190, CH / 2 - 230, CW / 2 + 190, CH / 2 + 150); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CW / 2, CH / 2 - 40, 168, 0, 7); ctx.stroke();
    ctx.fillStyle = gold(ctx, m, 0.95, CW / 2 - 120, CH / 2 - 180, CW / 2 + 120, CH / 2 + 60);
    const crown = poly([[CW / 2 - 110, CH / 2 - 10], [CW / 2 - 120, CH / 2 - 150], [CW / 2 - 60, CH / 2 - 80], [CW / 2, CH / 2 - 190], [CW / 2 + 60, CH / 2 - 80], [CW / 2 + 120, CH / 2 - 150], [CW / 2 + 110, CH / 2 - 10]]);
    ctx.fill(crown);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    fitFont(ctx, "LUXURY VAULT", 700, FONT_DISPLAY, 48, 300);
    ctx.fillText("LUXURY VAULT", CW / 2, CH / 2 + 52);
  });
  cc.fillStyle = "#e8d6a0"; cc.textAlign = "center"; cc.textBaseline = "middle";
  fitFont(cc, "COLLECTOR'S EDITION", 700, FONT_DISPLAY, 24, 280);
  cc.fillText("COLLECTOR'S EDITION", CW / 2, CH / 2 + 98);
  cc.fillStyle = rgba("#efe6d2", 0.8); cc.font = `600 26px ${FONT_BODY}`;
  cc.fillText("TRADING CARD GAME · EST. 1997", CW / 2, CH / 2 + 196);
  // name and serial strip
  const sy = CH - 330;
  both((ctx, m) => {
    const strip = rrPath(90, sy, CW - 180, 120, 16);
    ctx.fillStyle = m ? M(0, 0, 0.35) : "rgba(6,3,12,0.85)"; ctx.fill(strip);
    ctx.lineWidth = 4; ctx.strokeStyle = gold(ctx, m, 0.6, 90, sy, CW - 90, sy + 120); ctx.stroke(strip);
  });
  const shownName = tell === "spelling" ? misspell(c.name) : c.name;
  cc.fillStyle = "#f2ead8"; cc.textAlign = "left"; cc.textBaseline = "middle";
  fitFont(cc, shownName.toUpperCase(), 700, FONT_DISPLAY, 38, CW - 440);
  cc.fillText(shownName.toUpperCase(), 120, sy + 42);
  cc.font = `700 30px ${FONT_BODY}`; cc.fillStyle = "#e8d6a0";
  cc.fillText(`SERIAL ${serialText(o.serial || 1, c.printed)}`, 120, sy + 88);
  // the authenticity seal
  const sx = CW - 210, sCy = sy + 60, sr = 78;
  const seal = new Path2D();
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + Math.PI / 8; i ? seal.lineTo(sx + Math.cos(a) * sr, sCy + Math.sin(a) * sr) : seal.moveTo(sx + Math.cos(a) * sr, sCy + Math.sin(a) * sr); }
  seal.closePath();
  const fakeSeal = tell === "seal";
  if (fakeSeal || !o.gl) {
    const g = cc.createLinearGradient(sx - sr, sCy - sr, sx + sr, sCy + sr);
    (fakeSeal ? ["#9a7f9a", "#9a9a7a", "#7f9a8a", "#7f8a9a"] : ["#ff8ac0", "#ffe08a", "#8affc0", "#8ad8ff", "#c08aff"]).forEach((col, i, arr) => g.addColorStop(i / (arr.length - 1), col));
    cc.fillStyle = g;
  } else cc.fillStyle = "#7d828e";
  cc.fill(seal);
  cc.strokeStyle = fakeSeal ? "#6a6a6a" : "#ffffff"; cc.lineWidth = 3; cc.stroke(seal);
  cc.fillStyle = fakeSeal ? "rgba(40,40,40,0.75)" : "rgba(30,20,40,0.65)"; cc.font = `800 22px ${FONT_BODY}`; cc.textAlign = "center";
  cc.fillText("VAULT", sx, sCy - 12); cc.fillText("GENUINE", sx, sCy + 16);
  if (mc) {
    mc.fillStyle = fakeSeal ? M(0, 0, 0.5) : M(0.85, 1, 0.65); mc.fill(seal);
    if (!fakeSeal) { mc.strokeStyle = M(0.5, 1, 0.9); mc.lineWidth = 2; for (let r = 12; r < sr; r += 12) { mc.beginPath(); mc.arc(sx, sCy, r, 0, 7); mc.stroke(); } }
  }
  cc.font = `600 19px ${FONT_BODY}`; cc.fillStyle = rgba("#efe6d2", 0.55); cc.textAlign = "center";
  cc.fillText("Authenticity guaranteed by the Collectors' Guild. Tilt to verify the seal.", CW / 2, CH - 150);
  cc.fillText("© 2026 Vaultworks Ltd. All rights reserved.", CW / 2, CH - 118);
  paintWear(cc, mc, c, o, true);
  if (uv) {
    const u = uv.getContext("2d"), uk = uv.width / CW;
    u.setTransform(uk, 0, 0, uk, 0, 0);
    u.fillStyle = tell ? "#1e1e1e" : "#000000"; u.fillRect(0, 0, CW, CH);
    if (!tell) {
      u.strokeStyle = "#ffffff"; u.lineWidth = 7;
      u.beginPath(); u.arc(CW / 2, CH / 2 - 40, 250, 0, 7); u.stroke();
      u.fillStyle = "#ffffff"; u.font = `700 80px ${FONT_DISPLAY}`; u.textAlign = "center"; u.textBaseline = "middle";
      u.fillText("GENUINE", CW / 2, CH / 2 - 40);
      u.font = `700 40px ${FONT_BODY}`; u.fillText(serialText(o.serial || 1, c.printed), CW / 2, CH / 2 + 40);
      u.save(); u.globalAlpha = 0.16; u.font = `700 26px ${FONT_BODY}`;
      for (let yy = 120; yy < CH; yy += 90) u.fillText("COLLECTORS' GUILD · COLLECTORS' GUILD · COLLECTORS' GUILD", CW / 2, yy);
      u.restore();
    }
  }
  return { color, mat, uv };
}

/* ---------------------------------------------------------------- thumbnails */
const THUMBS = new Map();
function thumbKey(cid, holo, grade, condition = grade || 8, misprint = "") { return `${cid}|${holo ? 1 : 0}|${grade || 0}|${condition}|${misprint}`; }
function thumbURL(cid, holo, grade, condition = grade || 8, misprint = "") {
  const k = thumbKey(cid, holo, grade, condition, misprint);
  if (THUMBS.has(k)) return THUMBS.get(k);
  const c = S.cards[cid];
  const { color } = paintFront(c, { px: 260, holo, grade, condition, misprint, serial: 1, gl: false });
  let url;
  try { url = color.toDataURL("image/jpeg", 0.86); } catch (e) { url = ""; }
  THUMBS.set(k, url);
  return url;
}
/* =====================================================================
   Part 4: the 3D inspector. A small physically based WebGL2 renderer:
   a real card with thickness and gilded edges, a laminate clear coat,
   metal foil, holographic film, embossing, a studio light you move with
   the pointer, a soft shadow on velvet, and an acrylic slab for graded
   cards. Falls back to CSS 3D when WebGL2 isn't available.
   ===================================================================== */

const M4 = {
  ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s;
    }
    return o;
  },
  persp(fovy, asp, n, f) {
    const t = 1 / Math.tan(fovy / 2), m = new Float32Array(16);
    m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m;
  },
  ortho(l, r, b, t, n, f) {
    const m = M4.ident();
    m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n);
    m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); return m;
  },
  look(eye, at, up) {
    const z = norm3(sub3(eye, at)), x = norm3(cross3(up, z)), y = cross3(z, x), m = M4.ident();
    m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
    m[12] = -dot3(x, eye); m[13] = -dot3(y, eye); m[14] = -dot3(z, eye); return m;
  },
  trans(x, y, z) { const m = M4.ident(); m[12] = x; m[13] = y; m[14] = z; return m; },
  rotX(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; },
  rotY(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; },
  rotZ(a) { const m = M4.ident(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; },
  mat3(m) { return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]); },
};
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

const CARD_W = 0.63, CARD_H = 0.88, CARD_T = 0.0095, CARD_R = 0.031;

const GLSL_COMMON = `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
uniform vec3 uKeyDir; uniform float uUV;
vec3 basis1(vec3 c){ vec3 up = abs(c.y) < 0.99 ? vec3(0,1,0) : vec3(1,0,0); return normalize(cross(up, c)); }
float softbox(vec3 d, vec3 c, vec2 hs, float soft){
  float k = dot(d, c); if (k <= 0.0) return 0.0;
  vec3 t1 = basis1(c); vec3 t2 = cross(c, t1);
  vec2 p = vec2(dot(d, t1), dot(d, t2)) / k;
  vec2 q = abs(p) - hs;
  float dist = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  return 1.0 - smoothstep(-soft, soft, dist);
}
const vec3 STRIP = vec3(0.86, 0.12, 0.49);
const vec3 TOP = vec3(-0.14, 0.95, 0.27);
vec3 env(vec3 d, float rough){
  float soft = 0.012 + rough * 0.55;
  float lit = 1.0 - uUV * 0.96;
  vec3 c = mix(vec3(0.008, 0.007, 0.011), vec3(0.04, 0.034, 0.046), smoothstep(-0.4, 0.9, d.y));
  float spread = mix(1.0, 0.42, rough);
  c += softbox(d, uKeyDir, vec2(0.40, 0.28), soft) * vec3(5.6, 5.2, 4.7) * lit * spread;
  c += softbox(d, normalize(STRIP), vec2(0.06, 0.70), soft) * vec3(2.3, 2.5, 3.0) * lit * spread;
  c += softbox(d, normalize(TOP), vec2(0.55, 0.22), soft) * vec3(1.0, 0.98, 0.95) * lit * spread;
  c += smoothstep(0.0, -0.7, d.y) * vec3(0.06, 0.04, 0.03) * lit;
  c += uUV * softbox(d, uKeyDir, vec2(0.30, 0.30), soft + 0.15) * vec3(0.28, 0.06, 0.85);
  return c;
}
vec3 ambient(vec3 n){
  vec3 a = mix(vec3(0.028, 0.026, 0.034), vec3(0.085, 0.08, 0.095), n.y * 0.5 + 0.5);
  a += max(dot(n, uKeyDir), 0.0) * vec3(0.30, 0.28, 0.26);
  a += max(dot(n, normalize(STRIP)), 0.0) * vec3(0.10, 0.11, 0.14);
  return a * (1.0 - uUV * 0.92) + uUV * vec3(0.018, 0.0, 0.05);
}
float ggx(vec3 n, vec3 v, vec3 l, float r){
  vec3 h = normalize(v + l); float a = r * r, a2 = a * a;
  float nh = max(dot(n, h), 0.0), d = nh * nh * (a2 - 1.0) + 1.0;
  float D = a2 / (3.14159 * d * d);
  float nl = max(dot(n, l), 0.0), nv = max(dot(n, v), 1e-3), k = (r + 1.0) * (r + 1.0) / 8.0;
  float G = nl / (nl * (1.0 - k) + k) * nv / (nv * (1.0 - k) + k);
  return D * G / (4.0 * nl * nv + 1e-4) * nl;
}
vec3 aces(vec3 x){ return clamp(x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
`;

const VS_CARD = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec2 aUv; layout(location=3) in float aFace;
uniform mat4 uModel, uView, uProj; uniform float uBend;
out vec3 vWorld; out vec3 vNor; out vec2 vUv; out float vFace; out vec3 vLocal;
void main(){
  vec3 p = aPos, n = aNor;
  p.z += -0.5 * uBend * p.x * p.x;
  n = normalize(vec3(n.x + uBend * p.x * n.z, n.y, n.z));
  vec4 w = uModel * vec4(p, 1.0);
  vWorld = w.xyz; vNor = normalize(mat3(uModel) * n); vUv = aUv; vFace = aFace; vLocal = aPos;
  gl_Position = uProj * uView * w;
}`;

const FS_CARD = `#version 300 es
precision highp float;
in vec3 vWorld; in vec3 vNor; in vec2 vUv; in float vFace; in vec3 vLocal;
uniform sampler2D uFC, uFM, uFU, uBC, uBM, uBU;
uniform vec3 uCam, uKeyCol; uniform mat3 uRot;
uniform float uEdgeGild, uExposure, uHoloKind, uFlat;
uniform vec2 uTexel;
out vec4 outColor;
${GLSL_COMMON}
void main(){
  vec2 gx = dFdx(vUv), gy = dFdy(vUv);
  vec3 V = normalize(uCam - vWorld);
  vec3 N = normalize(vNor);
  if (!gl_FrontFacing) N = -N;
  vec3 L = uKeyDir;
  vec3 col;
  if (abs(vFace) < 0.5) {
    // the card's edge: gilded on genuine luxury cards, plain stock on fakes
    float t = vLocal.z / ${CARD_T.toFixed(5)} + 0.5;
    float core = smoothstep(0.38, 0.5, t) * smoothstep(0.62, 0.5, t);
    float NoV = max(dot(N, V), 1e-3);
    if (uEdgeGild > 0.5) {
      vec3 F0 = vec3(1.0, 0.76, 0.36);
      float rough = 0.22 + vnoise(vUv * vec2(400.0, 3.0)) * 0.1;
      vec3 R = reflect(-V, N);
      vec3 F = F0 + (1.0 - F0) * pow(1.0 - NoV, 5.0);
      col = env(R, rough) * F + ggx(N, V, L, rough) * uKeyCol * F0 + ambient(N) * F0 * 0.15;
    } else {
      vec3 paper = mix(vec3(0.86, 0.84, 0.80), vec3(0.20, 0.20, 0.22), core);
      col = paper * (ambient(N) + uKeyCol * max(dot(N, L), 0.0) * 0.6);
    }
    outColor = vec4(pow(aces(col * uExposure), vec3(1.0 / 2.2)), 1.0);
    return;
  }
  bool front = vFace > 0.0;
  vec2 uv = vUv;
  vec4 base = front ? textureGrad(uFC, uv, gx, gy) : textureGrad(uBC, uv, gx, gy);
  vec4 mat = front ? textureGrad(uFM, uv, gx, gy) : textureGrad(uBM, uv, gx, gy);
  float glow = front ? textureGrad(uFU, uv, gx, gy).r : textureGrad(uBU, uv, gx, gy).r;
  vec3 albedo = base.rgb;
  float metal = mat.r, holo = mat.g;
  // tangent frame: +u and +v in world space
  vec3 Tu = uRot * vec3(front ? 1.0 : -1.0, 0.0, 0.0);
  vec3 Bv = uRot * vec3(0.0, -1.0, 0.0);
  // embossing from the height map
  vec2 du = vec2(uTexel.x * 1.6, 0.0), dv = vec2(0.0, uTexel.y * 1.6);
  float hl, hr, hd, hu;
  if (front) { hl = textureGrad(uFM, uv - du, gx, gy).b; hr = textureGrad(uFM, uv + du, gx, gy).b; hd = textureGrad(uFM, uv - dv, gx, gy).b; hu = textureGrad(uFM, uv + dv, gx, gy).b; }
  else { hl = textureGrad(uBM, uv - du, gx, gy).b; hr = textureGrad(uBM, uv + du, gx, gy).b; hd = textureGrad(uBM, uv - dv, gx, gy).b; hu = textureGrad(uBM, uv + dv, gx, gy).b; }
  float strength = 2.2 * (1.0 - uFlat);
  vec3 Ne = normalize(N - strength * ((hr - hl) * Tu + (hu - hd) * Bv));
  // paper tooth and brushed foil
  float paper = vnoise(uv * vec2(900.0, 1250.0)) - 0.5;
  float brush = vnoise(uv * vec2(70.0, 2200.0)) - 0.5;
  Ne = normalize(Ne + (Tu * paper + Bv * vnoise(uv * vec2(1250.0, 900.0) + 7.0) * 0.5) * 0.035 + Tu * brush * 0.09 * metal);
  vec3 R = reflect(-V, Ne);
  float NoV = max(dot(Ne, V), 1e-3), NoL = max(dot(Ne, L), 0.0);
  // holographic film: thin-film rainbow that slides with the viewing angle
  float view = dot(V, Tu) * 1.7 + dot(V, Bv) * 1.2;
  float bands = (uHoloKind > 1.5) ? (uv.x * 3.0 - uv.y * 2.0) : (uv.x * 4.0 + uv.y * 2.6);
  float phase = view * 1.6 + bands + vnoise(uv * 9.0) * 0.6;
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (phase + vec3(0.0, 0.33, 0.67)));
  rainbow = mix(rainbow, vec3(1.0), 0.15);
  // diffuse print with a laminate clear coat on top
  vec3 diffuse = albedo * (ambient(Ne) + uKeyCol * NoL) * (1.0 - metal);
  // foil: metal that only shows color where it reflects light
  float roughM = 0.15 + brush * 0.06;
  vec3 F0 = mix(albedo * 1.08, rainbow * mix(vec3(0.9), albedo, 0.35), holo * metal);
  vec3 Fm = F0 + (vec3(1.0) - F0) * pow(1.0 - NoV, 5.0);
  vec3 foil = (env(R, roughM) * Fm + ggx(Ne, V, L, roughM) * uKeyCol * F0 + ambient(Ne) * F0 * 0.18) * metal;
  // holo on printed areas: rainbow sheen where the studio light reflects
  float catchLight = dot(env(reflect(-V, Ne), 0.38), vec3(0.3, 0.5, 0.2)) + ggx(Ne, V, L, 0.32) * 0.6;
  float lum = dot(albedo, vec3(0.299, 0.587, 0.114));
  float broad = dot(env(reflect(-V, Ne), 0.95), vec3(0.3, 0.5, 0.2));
  vec3 holoCol = rainbow * (0.05 + catchLight * 0.5 + broad * mix(0.3, 0.9, metal)) * holo * mix(0.1 + lum * 0.8, 1.5, metal) * (1.0 - uFlat);
  if (uHoloKind > 0.5) {
    vec2 cell = floor(uv * vec2(150.0, 210.0));
    float rnd = hash(cell);
    vec3 tn = normalize(Ne + (Tu * (hash(cell + 3.1) - 0.5) + Bv * (hash(cell + 9.7) - 0.5)) * 0.9);
    float glint = pow(max(dot(reflect(-V, tn), L), 0.0), 220.0) * step(0.55, rnd) * 9.0;
    holoCol += rainbow * glint * holo * (1.0 - uFlat);
  }
  float Fc = 0.04 + 0.96 * pow(1.0 - max(dot(Ne, V), 0.0), 5.0);
  vec3 coat = (env(R, 0.075) * Fc + ggx(Ne, V, L, 0.08) * uKeyCol * 0.04) * (1.0 - metal * 0.6);
  col = diffuse * (1.0 - Fc) + foil + holoCol + coat;
  // under the UV lamp, genuine watermarks fluoresce
  col += uUV * glow * vec3(0.45, 0.78, 1.0) * 1.3;
  col += uUV * albedo * vec3(0.05, 0.0, 0.12);
  outColor = vec4(pow(aces(col * uExposure), vec3(1.0 / 2.2)), 1.0);
}`;

const FS_SHADOW = `#version 300 es
precision mediump float;
uniform float uAlpha;
out vec4 o; void main(){ o = vec4(uAlpha, 0.0, 0.0, 1.0); }`;

const VS_QUAD = `#version 300 es
layout(location=0) in vec2 aPos; out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS_BLUR = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir; out vec4 o;
void main(){
  float w[7] = float[](0.1964825501511404, 0.2969069646728344, 0.09447039785044732, 0.010381362401148057, 0.0, 0.0, 0.0);
  float s = texture(uTex, vUv).r * w[0];
  for (int i = 1; i < 4; i++) {
    float off = float(i) * 2.0 - 0.5;
    s += texture(uTex, vUv + uDir * off).r * w[i];
    s += texture(uTex, vUv - uDir * off).r * w[i];
  }
  o = vec4(s, 0.0, 0.0, 1.0);
}`;

const VS_BG = `#version 300 es
layout(location=0) in vec2 aPos;
uniform mat4 uView, uProj, uLightVP; uniform float uZ;
out vec3 vWorld; out vec4 vLight;
void main(){
  vec4 w = vec4(aPos.x * 4.0, aPos.y * 3.0, uZ, 1.0);
  vWorld = w.xyz; vLight = uLightVP * w;
  gl_Position = uProj * uView * w;
}`;

const FS_BG = `#version 300 es
precision highp float;
in vec3 vWorld; in vec4 vLight;
uniform sampler2D uShadow; uniform vec3 uCam, uKeyCol, uTint; uniform float uExposure;
out vec4 o;
${GLSL_COMMON}
void main(){
  vec3 N = vec3(0.0, 0.0, 1.0), V = normalize(uCam - vWorld);
  vec2 suv = vLight.xy / vLight.w * 0.5 + 0.5;
  float occ = 0.0;
  if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) occ = texture(uShadow, suv).r;
  // velvet: soft fibers and a sheen that grows at grazing angles
  float fib = vnoise(vWorld.xy * vec2(260.0, 90.0)) * 0.5 + vnoise(vWorld.xy * vec2(70.0, 520.0)) * 0.5;
  vec3 base = uTint * (0.75 + fib * 0.5);
  vec3 toKey = uKeyDir;
  float pool = exp(-dot(vWorld.xy - toKey.xy * 0.35, vWorld.xy - toKey.xy * 0.35) * 0.9);
  float NoL = max(dot(N, toKey), 0.0);
  vec3 light = ambient(N) * 0.7 + uKeyCol * NoL * pool * (1.0 - occ * 0.82);
  float sheen = pow(1.0 - max(dot(N, V), 0.0), 3.0) * 0.4 + 0.04;
  vec3 col = base * light + sheen * uKeyCol * 0.05 * pool;
  float vig = smoothstep(2.6, 0.6, length(vWorld.xy * vec2(0.7, 0.9)));
  col *= vig;
  o = vec4(pow(aces(col * uExposure), vec3(1.0 / 2.2)), 1.0);
}`;

const FS_SLAB = `#version 300 es
precision highp float;
in vec3 vWorld; in vec3 vNor; in vec2 vUv; in float vFace; in vec3 vLocal;
uniform vec3 uCam, uKeyCol, uHalf; uniform float uExposure;
out vec4 o;
${GLSL_COMMON}
void main(){
  vec3 V = normalize(uCam - vWorld), N = normalize(vNor);
  if (!gl_FrontFacing) N = -N;
  float NoV = abs(dot(N, V));
  vec3 R = reflect(-V, N);
  float F = 0.05 + 0.95 * pow(1.0 - NoV, 5.0);
  vec3 a = abs(vLocal) / uHalf;
  vec3 edgeD = 1.0 - a;
  float m1 = min(edgeD.x, edgeD.y), m2 = min(min(edgeD.x * uHalf.x, edgeD.y * uHalf.y), edgeD.z * uHalf.z);
  float bevel = 1.0 - smoothstep(0.0, 0.006, m2);
  vec3 col = env(R, 0.02) * F + ggx(N, V, uKeyDir, 0.05) * uKeyCol * 0.06 + vec3(0.6, 0.65, 0.7) * bevel * 0.12;
  float alpha = clamp(F * 0.8 + 0.018 + bevel * 0.25 + length(col) * 0.07, 0.0, 0.9);
  o = vec4(pow(aces(col * uExposure), vec3(1.0 / 2.2)), alpha);
  if (m1 < -1.0) discard;
}`;

/* ---------------------------------------------------------------- geometry */
function cardGeometry(w = CARD_W, h = CARD_H, t = CARD_T, r = CARD_R) {
  const rows = [], cols = 30, hw = w / 2, hh = h / 2;
  const arc = 10;
  for (let i = arc; i >= 1; i--) rows.push(-(hh - r) - r * Math.sin(i / arc * Math.PI / 2));
  const mid = 34;
  for (let i = 0; i <= mid; i++) rows.push(-(hh - r) + (2 * (hh - r)) * i / mid);
  for (let i = 1; i <= arc; i++) rows.push((hh - r) + r * Math.sin(i / arc * Math.PI / 2));
  const xExt = y => { const a = Math.abs(y); if (a <= hh - r + 1e-9) return hw; const d = Math.min(r, a - (hh - r)); return hw - r + Math.sqrt(Math.max(0, r * r - d * d)); };
  const V = [], I = [];
  const push = (x, y, z, nx, ny, nz, u, v, f) => { V.push(x, y, z, nx, ny, nz, u, v, f); return V.length / 9 - 1; };
  for (const side of [1, -1]) {
    const start = V.length / 9;
    rows.forEach(y => {
      const e = xExt(y);
      for (let c = 0; c <= cols; c++) {
        const x = -e + 2 * e * c / cols;
        push(x, y, side * t / 2, 0, 0, side, side > 0 ? 0.5 + x / w : 0.5 - x / w, 0.5 - y / h, side);
      }
    });
    for (let ri = 0; ri < rows.length - 1; ri++) for (let c = 0; c < cols; c++) {
      const a = start + ri * (cols + 1) + c, b = a + 1, d = a + cols + 1, e2 = d + 1;
      if (side > 0) I.push(a, b, e2, a, e2, d); else I.push(a, e2, b, a, d, e2);
    }
  }
  // perimeter, counter-clockwise
  const loop = [];
  for (let i = 0; i < rows.length - 1; i++) loop.push([xExt(rows[i]), rows[i]]);
  const top = rows[rows.length - 1], et = xExt(top);
  for (let c = cols; c > 0; c--) loop.push([-et + 2 * et * c / cols, top]);
  for (let i = rows.length - 1; i > 0; i--) loop.push([-xExt(rows[i]), rows[i]]);
  const bot = rows[0], eb = xExt(bot);
  for (let c = 0; c < cols; c++) loop.push([-eb + 2 * eb * c / cols, bot]);
  const n = loop.length;
  let per = 0;
  for (let i = 0; i < n; i++) {
    const p = loop[i], q = loop[(i + 1) % n];
    const tx = q[0] - p[0], ty = q[1] - p[1], len = Math.hypot(tx, ty) || 1;
    const pp = loop[(i - 1 + n) % n], qq = loop[(i + 2) % n];
    const n0 = norm3([q[1] - pp[1], -(q[0] - pp[0]), 0]), n1 = norm3([qq[1] - p[1], -(qq[0] - p[0]), 0]);
    const a = push(p[0], p[1], t / 2, n0[0], n0[1], 0, per, 0, 0), b = push(p[0], p[1], -t / 2, n0[0], n0[1], 0, per, 1, 0);
    per += len;
    const c2 = push(q[0], q[1], t / 2, n1[0], n1[1], 0, per, 0, 0), d = push(q[0], q[1], -t / 2, n1[0], n1[1], 0, per, 1, 0);
    I.push(a, b, d, a, d, c2);
  }
  return { v: new Float32Array(V), i: new Uint32Array(I) };
}
function boxGeometry(hx, hy, hz) {
  const V = [], I = [];
  const faces = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 1, 0], [0, 0, -1]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    [[0, -1, 0], [0, 0, -1], [1, 0, 0]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]];
  for (const [n, a, b] of faces) {
    const base = V.length / 9;
    for (const [s, t] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const p = [0, 1, 2].map(k => (n[k] + a[k] * s + b[k] * t) * [hx, hy, hz][k]);
      V.push(...p, ...n, (s + 1) / 2, (t + 1) / 2, 2);
    }
    I.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return { v: new Float32Array(V), i: new Uint32Array(I) };
}
function quadGeometry(x0, y0, x1, y1, z) {
  const V = [x0, y0, z, 0, 0, 1, 0, 1, 1, x1, y0, z, 0, 0, 1, 1, 1, 1, x1, y1, z, 0, 0, 1, 1, 0, 1, x0, y1, z, 0, 0, 1, 0, 0, 1,
    x0, y0, z - 0.0005, 0, 0, -1, 1, 1, -1, x1, y0, z - 0.0005, 0, 0, -1, 0, 1, -1, x1, y1, z - 0.0005, 0, 0, -1, 0, 0, -1, x0, y1, z - 0.0005, 0, 0, -1, 1, 0, -1];
  return { v: new Float32Array(V), i: new Uint32Array([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6]) };
}
function slabLabel(spec) {
  const c = newCanvas(1024, 400), x = c.getContext("2d");
  const card = S.cards[spec.cid];
  const g = x.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, "#f5f1e8"); g.addColorStop(1, "#e2dccd");
  x.fillStyle = g; x.fillRect(0, 0, 1024, 400);
  x.fillStyle = "#7a1424"; x.fillRect(0, 0, 1024, 70);
  x.fillStyle = "#ffffff"; x.font = `800 40px ${FONT_BODY}`; x.textBaseline = "middle"; x.fillText("VAULT GRADING CO.", 30, 36);
  x.textAlign = "right"; x.font = `700 30px ${FONT_BODY}`; x.fillText(`CERT #${(card.seed % 90000000 + 10000000)}`, 994, 36);
  x.textAlign = "left"; x.fillStyle = "#1c1814"; x.font = `800 46px ${FONT_BODY}`;
  fitFont(x, card.name.toUpperCase(), 800, FONT_BODY, 46, 700); x.fillText(card.name.toUpperCase(), 30, 130);
  x.font = `600 32px ${FONT_BODY}`; x.fillStyle = "#4a4238";
  x.fillText(`${FR[card.fid].name} · ${RARITIES[card.r].name}${spec.holo ? " · HOLO" : ""}`, 30, 186);
  x.fillText(serialText(spec.serial || 1, card.printed), 30, 236);
  x.textAlign = "right"; x.fillStyle = "#1c1814"; x.font = `900 150px ${FONT_BODY}`; x.fillText(String(spec.grade), 994, 200);
  x.font = `800 34px ${FONT_BODY}`; x.fillText(GRADES[spec.grade].label, 994, 300);
  for (let i = 0; i < 90; i++) { x.fillStyle = "#1c1814"; const bw = (i * 7919 + card.seed) % 3 + 1; x.fillRect(30 + i * 7, 290, bw, 80); }
  const b = newCanvas(1024, 400), y = b.getContext("2d");
  const hg = y.createLinearGradient(0, 0, 1024, 400);
  ["#ff8ac0", "#ffe08a", "#8affc0", "#8ad8ff", "#c08aff"].forEach((col, i) => hg.addColorStop(i / 4, col));
  y.fillStyle = "#e2dccd"; y.fillRect(0, 0, 1024, 400); y.fillStyle = hg; y.globalAlpha = 0.75; y.fillRect(380, 110, 260, 180); y.globalAlpha = 1;
  y.fillStyle = "#1c1814"; y.font = `800 38px ${FONT_BODY}`; y.textAlign = "center"; y.fillText("VAULT GRADING CO.", 512, 70);
  y.font = `600 26px ${FONT_BODY}`; y.fillText("Tamper evident. Verify this certificate online.", 512, 350);
  return { front: c, back: b };
}

/* ---------------------------------------------------------------- the inspector */
const Inspector = (() => {
  const PITCH_LIMIT = 1.35;
  let gl = null, canvas = null, ok = false, progs = {}, meshes = {}, tex = {}, fbo = {}, aniso = null;
  let spec = null, raf = 0, last = 0, onClose = null, root = null;
  const st = { yaw: 0, pitch: 0, roll: 0, vy: 0, vp: 0, zoom: 2.15, zoomT: 2.15, bend: 0, drag: false, px: 0, py: 0,
    lastT: 0, light: [-0.46, 0.55, 0.70], lightT: [-0.46, 0.55, 0.70], uv: 0, uvT: 0, flipAnim: null, t: 0, enter: 0, idle: 0,
    pointers: new Map(), pinch: 0 };

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }
  function meshFrom(geo) {
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, geo.v, gl.STATIC_DRAW);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.i, gl.STATIC_DRAW);
    const F = 36;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, F, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, F, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, F, 24);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, F, 32);
    gl.bindVertexArray(null);
    return { vao, n: geo.i.length };
  }
  function texture(src, srgb) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, srgb ? gl.SRGB8_ALPHA8 : gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return t;
  }
  function target(size) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { t, f, size };
  }
  function init(cv) {
    canvas = cv;
    try {
      gl = canvas.getContext("webgl2", { antialias: true, alpha: false, premultipliedAlpha: false, powerPreference: "high-performance" });
      if (!gl) return false;
      aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      progs.card = program(VS_CARD, FS_CARD);
      progs.shadow = program(VS_CARD, FS_SHADOW);
      progs.blur = program(VS_QUAD, FS_BLUR);
      progs.bg = program(VS_BG, FS_BG);
      progs.slab = program(VS_CARD, FS_SLAB);
      meshes.card = meshFrom(cardGeometry());
      meshes.slab = meshFrom(boxGeometry(0.375, 0.575, 0.026));
      meshes.label = meshFrom(quadGeometry(-0.335, 0.36, 0.335, 0.53, 0.0));
      const qv = gl.createVertexArray(); gl.bindVertexArray(qv);
      const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0); gl.bindVertexArray(null);
      meshes.quad = qv;
      fbo.a = target(512); fbo.b = target(512);
      canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); ok = false; }, false);
      ok = true;
    } catch (e) {
      console.warn("WebGL inspector unavailable:", e);
      ok = false;
    }
    return ok;
  }
  function loadSpec(sp) {
    for (const k of Object.keys(tex)) if (tex[k]) gl.deleteTexture(tex[k]);
    tex = {};
    const c = S.cards[sp.cid];
    const fr = paintFront(c, { px: 1024, holo: sp.holo, condition: sp.condition, misprint: sp.misprint, serial: sp.serial, tell: sp.tell, gl: true, mat: true });
    const bk = paintBack(c, { px: 1024, condition: sp.condition, misprint: sp.misprint, serial: sp.serial, tell: sp.tell, gl: true, mat: true });
    tex.fc = texture(fr.color, true); tex.fm = texture(fr.mat, false); tex.fu = texture(fr.uv, false);
    tex.bc = texture(bk.color, true); tex.bm = texture(bk.mat, false); tex.bu = texture(bk.uv, false);
    if (sp.grade) {
      const lb = slabLabel(sp);
      tex.lc = texture(lb.front, true); tex.lb = texture(lb.back, true);
      const blank = newCanvas(4, 4), bx = blank.getContext("2d"); bx.fillStyle = "#000"; bx.fillRect(0, 0, 4, 4);
      tex.black = texture(blank, false);
    }
    spec.texel = [1 / fr.color.width, 1 / fr.color.height];
  }
  function bindCardTextures(u, set) {
    const list = set === "label" ? [tex.lc, tex.black, tex.black, tex.lb, tex.black, tex.black] : [tex.fc, tex.fm, tex.fu, tex.bc, tex.bm, tex.bu];
    ["uFC", "uFM", "uFU", "uBC", "uBM", "uBU"].forEach((name, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, list[i]); gl.uniform1i(u[name], i); });
  }
  let frozen = false;
  function frame(now) {
    raf = frozen ? 0 : requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    step(dt);
    if (ok) draw(); else cssDraw();
  }
  function step(dt) {
    st.t += dt; st.enter = Math.min(1, st.enter + dt * 1.6);
    if (st.flipAnim) {
      const a = st.flipAnim; a.t = Math.min(1, a.t + dt / 0.75);
      const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
      st.yaw = a.y0 + (a.y1 - a.y0) * e; st.pitch = a.p0 + (a.p1 - a.p0) * e;
      st.vy = (a.y1 - a.y0) * (a.t < 1 ? 1.4 : 0);
      if (a.t >= 1) { st.flipAnim = null; st.vy = 0; }
    }
    // Inspection is deliberate: hold the angle the collector chose. The old
    // pitch spring fought release inertia near the top edge and oscillated.
    st.pitch = clamp(st.pitch, -PITCH_LIMIT, PITCH_LIMIT);
    st.idle = 0;
    st.zoom += (st.zoomT - st.zoom) * (1 - Math.exp(-dt * 10));
    const targetBend = spec && spec.grade ? 0 : clamp(-st.vy * 0.05, -0.32, 0.32);
    st.bend += (targetBend - st.bend) * (1 - Math.exp(-dt * 9));
    for (let k = 0; k < 3; k++) st.light[k] += (st.lightT[k] - st.light[k]) * (1 - Math.exp(-dt * 6));
    st.uv += (st.uvT - st.uv) * (1 - Math.exp(-dt * 5));
  }
  function model() {
    const yaw = st.yaw - (1 - easeOut(st.enter)) * 0.9;
    const pitch = st.pitch;
    const roll = 0;
    const lift = -(1 - easeOut(st.enter)) * 0.6;
    return M4.mul(M4.trans(0, lift, 0), M4.mul(M4.rotX(pitch), M4.mul(M4.rotY(yaw), M4.rotZ(roll))));
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function draw() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(canvas.clientWidth * dpr)), H = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    const asp = W / H, slab = !!(spec && spec.grade);
    const fit = asp < 0.8 ? (slab ? 1.45 : 1.15) / asp * 0.8 : 1;
    const camZ = st.zoom * fit * (slab ? 1.22 : 1);
    const cam = [0, 0, camZ];
    const view = M4.look(cam, [0, 0, 0], [0, 1, 0]), proj = M4.persp(0.52, asp, 0.05, 20);
    const key = norm3(st.light), keyCol = st.uv > 0.5 ? [0.25, 0.08, 0.6] : [2.6, 2.45, 2.25];
    const base = model();
    const cardM = slab ? M4.mul(base, M4.trans(0, -0.085, 0.0)) : base;
    const lightView = M4.look([key[0] * 3, key[1] * 3, key[2] * 3], [0, 0, 0], [0, 1, 0]);
    const lightVP = M4.mul(M4.ortho(-1.4, 1.4, -1.4, 1.4, 0.1, 8), lightView);
    // 1. shadow map: the card's silhouette as the key light sees it, then blurred
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.a.f); gl.viewport(0, 0, 512, 512);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND); gl.blendEquation(gl.MAX); gl.blendFunc(gl.ONE, gl.ONE);
    let P = progs.shadow; gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uView, false, lightView); gl.uniformMatrix4fv(P.u.uProj, false, M4.ortho(-1.4, 1.4, -1.4, 1.4, 0.1, 8));
    gl.uniform1f(P.u.uBend, st.bend);
    gl.uniformMatrix4fv(P.u.uModel, false, cardM); gl.uniform1f(P.u.uAlpha, 1);
    gl.bindVertexArray(meshes.card.vao); gl.drawElements(gl.TRIANGLES, meshes.card.n, gl.UNSIGNED_INT, 0);
    if (slab) { gl.uniform1f(P.u.uBend, 0); gl.uniformMatrix4fv(P.u.uModel, false, base); gl.uniform1f(P.u.uAlpha, 0.22); gl.bindVertexArray(meshes.slab.vao); gl.drawElements(gl.TRIANGLES, meshes.slab.n, gl.UNSIGNED_INT, 0); }
    gl.disable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD);
    P = progs.blur; gl.useProgram(P.p); gl.bindVertexArray(meshes.quad);
    for (const [src, dst, dir] of [[fbo.a, fbo.b, [1 / 512, 0]], [fbo.b, fbo.a, [0, 1 / 512]], [fbo.a, fbo.b, [1.6 / 512, 0]], [fbo.b, fbo.a, [0, 1.6 / 512]]]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, src.t);
      gl.uniform1i(P.u.uTex, 0); gl.uniform2fv(P.u.uDir, dir); gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    // 2. the velvet backdrop with the soft shadow
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.clearColor(0.01, 0.01, 0.012, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    const exposure = 1.0;
    P = progs.bg; gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uView, false, view); gl.uniformMatrix4fv(P.u.uProj, false, proj); gl.uniformMatrix4fv(P.u.uLightVP, false, lightVP);
    gl.uniform1f(P.u.uZ, -0.5); gl.uniform3fv(P.u.uCam, cam); gl.uniform3fv(P.u.uKeyDir, key); gl.uniform3fv(P.u.uKeyCol, keyCol);
    gl.uniform3fv(P.u.uTint, spec.tint || [0.11, 0.075, 0.12]); gl.uniform1f(P.u.uUV, st.uv); gl.uniform1f(P.u.uExposure, exposure);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fbo.a.t); gl.uniform1i(P.u.uShadow, 0);
    gl.bindVertexArray(meshes.quad); gl.drawArrays(gl.TRIANGLES, 0, 6);
    // 3. the card
    P = progs.card; gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.u.uView, false, view); gl.uniformMatrix4fv(P.u.uProj, false, proj);
    gl.uniform3fv(P.u.uCam, cam); gl.uniform3fv(P.u.uKeyDir, key); gl.uniform3fv(P.u.uKeyCol, keyCol);
    gl.uniform1f(P.u.uUV, st.uv); gl.uniform1f(P.u.uExposure, exposure);
    gl.uniform1f(P.u.uEdgeGild, spec.tell === "edge" ? 0 : 1);
    gl.uniform1f(P.u.uHoloKind, spec.holoKind || 0); gl.uniform2fv(P.u.uTexel, spec.texel);
    gl.uniform1f(P.u.uFlat, 0);
    gl.uniformMatrix4fv(P.u.uModel, false, cardM); gl.uniformMatrix3fv(P.u.uRot, false, M4.mat3(cardM));
    gl.uniform1f(P.u.uBend, st.bend);
    bindCardTextures(P.u, "card");
    gl.bindVertexArray(meshes.card.vao); gl.drawElements(gl.TRIANGLES, meshes.card.n, gl.UNSIGNED_INT, 0);
    if (slab) {
      gl.uniform1f(P.u.uBend, 0); gl.uniform1f(P.u.uFlat, 1); gl.uniform1f(P.u.uHoloKind, 0);
      gl.uniformMatrix4fv(P.u.uModel, false, base); gl.uniformMatrix3fv(P.u.uRot, false, M4.mat3(base));
      bindCardTextures(P.u, "label");
      gl.bindVertexArray(meshes.label.vao); gl.drawElements(gl.TRIANGLES, meshes.label.n, gl.UNSIGNED_INT, 0);
      // 4. the acrylic slab: back faces first, then front faces
      P = progs.slab; gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.uView, false, view); gl.uniformMatrix4fv(P.u.uProj, false, proj);
      gl.uniform3fv(P.u.uCam, cam); gl.uniform3fv(P.u.uKeyDir, key); gl.uniform3fv(P.u.uKeyCol, keyCol);
      gl.uniform1f(P.u.uUV, st.uv); gl.uniform1f(P.u.uExposure, exposure); gl.uniform3fv(P.u.uHalf, [0.375, 0.575, 0.026]);
      gl.uniformMatrix4fv(P.u.uModel, false, base); gl.uniform1f(P.u.uBend, 0);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.enable(gl.CULL_FACE);
      gl.bindVertexArray(meshes.slab.vao);
      gl.cullFace(gl.FRONT); gl.drawElements(gl.TRIANGLES, meshes.slab.n, gl.UNSIGNED_INT, 0);
      gl.cullFace(gl.BACK); gl.drawElements(gl.TRIANGLES, meshes.slab.n, gl.UNSIGNED_INT, 0);
      gl.disable(gl.CULL_FACE); gl.depthMask(true); gl.disable(gl.BLEND);
    }
    gl.bindVertexArray(null);
  }

  /* ---------------- CSS 3D fallback */
  let css = null;
  function cssSetup(host, sp) {
    const c = S.cards[sp.cid];
    const fr = paintFront(c, { px: 620, holo: sp.holo, condition: sp.condition, misprint: sp.misprint, serial: sp.serial, tell: sp.tell, gl: false });
    const bk = paintBack(c, { px: 620, condition: sp.condition, misprint: sp.misprint, serial: sp.serial, tell: sp.tell, gl: false });
    host.innerHTML = "";
    const wrap = document.createElement("div"); wrap.className = "css3d";
    const cardEl = document.createElement("div"); cardEl.className = "css3d-card" + (sp.tell === "edge" ? " plain-edge" : "");
    const f = document.createElement("img"); f.src = fr.color.toDataURL("image/jpeg", 0.9); f.className = "face front"; f.alt = c.name;
    const b = document.createElement("img"); b.src = bk.color.toDataURL("image/jpeg", 0.9); b.className = "face back"; b.alt = "Card back";
    const shine = document.createElement("div"); shine.className = "shine";
    cardEl.append(f, b, shine); wrap.append(cardEl); host.append(wrap);
    css = { cardEl, shine };
  }
  function cssDraw() {
    if (!css) return;
    const yaw = st.yaw - (1 - easeOut(st.enter)) * 0.9;
    const pitch = st.pitch;
    css.cardEl.style.transform = `translateY(${-(1 - easeOut(st.enter)) * 60}px) scale(${2.15 / st.zoom}) rotateX(${-pitch}rad) rotateY(${yaw}rad)`;
    const a = ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    css.shine.style.background = `linear-gradient(${110 + yaw * 60}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${0.18 + 0.12 * Math.abs(Math.sin(a))}) 48%, rgba(255,255,255,0) 66%)`;
  }

  /* ---------------- input */
  function onDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    st.pointers.set(e.pointerId, [e.clientX, e.clientY]);
    st.flipAnim = null; st.vy = st.vp = 0;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    if (st.pointers.size >= 2) { const [a, b] = [...st.pointers.values()]; st.pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); st.drag = false; return; }
    st.drag = true; st.flipAnim = null; st.px = e.clientX; st.py = e.clientY; st.lastT = performance.now(); st.vy = st.vp = 0;
  }
  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width * 2 - 1, ny = (e.clientY - r.top) / r.height * 2 - 1;
    st.lightT = norm3([-0.46 + nx * 0.55, 0.55 - ny * 0.45, 0.72]);
    if (!st.pointers.has(e.pointerId)) return;
    st.pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (st.pointers.size >= 2) {
      const [a, b] = [...st.pointers.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (st.pinch > 1 && d > 1) st.zoomT = clamp(st.zoomT * st.pinch / d, 0.95, 3.2);
      st.pinch = d; return;
    }
    if (!st.drag) return;
    const now = performance.now(), dt = Math.max(1, now - st.lastT) / 1000;
    const dx = e.clientX - st.px, dy = e.clientY - st.py;
    const k = 0.0105 * (st.zoom / 2.15);
    st.yaw += dx * k; st.pitch = clamp(st.pitch + dy * k, -PITCH_LIMIT, PITCH_LIMIT);
    st.vy = st.vy * 0.5 + (dx * k / dt) * 0.5; st.vp = st.vp * 0.5 + (dy * k / dt) * 0.5;
    st.px = e.clientX; st.py = e.clientY; st.lastT = now;
  }
  function onUp(e) {
    if (!st.pointers.has(e.pointerId)) return;
    st.pointers.delete(e.pointerId);
    if (st.pointers.size < 2) st.pinch = 0;
    st.vy = st.vp = 0;
    st.drag = st.pointers.size === 1;
    if (st.drag) {
      const [point] = st.pointers.values();
      [st.px, st.py] = point; st.lastT = performance.now();
    }
  }
  function onCancel() {
    st.pointers.clear(); st.pinch = 0; st.drag = false; st.vy = st.vp = 0;
  }
  function onWheel(e) { e.preventDefault(); st.zoomT = clamp(st.zoomT * Math.exp(e.deltaY * 0.0012), 0.95, 3.2); }
  function flip() {
    const turns = Math.round(st.yaw / Math.PI);
    st.flipAnim = { t: 0, y0: st.yaw, y1: (turns + 1) * Math.PI, p0: st.pitch, p1: 0 };
  }
  function showSide(side) {
    const turns = Math.round(st.yaw / Math.PI), facingBack = Math.abs(turns % 2) === 1;
    if ((side === "back") !== facingBack) flip();
  }
  function reset() {
    const turns = Math.round(st.yaw / (Math.PI * 2));
    st.flipAnim = { t: 0, y0: st.yaw, y1: turns * Math.PI * 2 + 0.18, p0: st.pitch, p1: -0.05 }; st.zoomT = 2.15;
  }
  function edgeView() { st.flipAnim = { t: 0, y0: st.yaw, y1: Math.round(st.yaw / Math.PI) * Math.PI + 1.38, p0: st.pitch, p1: -0.12 }; st.zoomT = 1.5; }
  function toggleUV() { st.uvT = st.uvT > 0.5 ? 0 : 1; return st.uvT > 0.5; }

  function open(host, sp, closeCb) {
    spec = sp; onClose = closeCb; root = host;
    const c = S.cards[sp.cid];
    spec.holoKind = c.r >= 4 ? 2 : c.r >= 2 ? 1 : 0;
    const f = FR[c.fid];
    const tint = hexRgb(mix(f.dark, "#2a1c2e", 0.6)).map(v => Math.pow(v / 255, 2.2) * 2.2);
    spec.tint = tint;
    Object.assign(st, { yaw: 0.22, pitch: -0.06, vy: 0, vp: 0, zoom: 2.15, zoomT: 2.15, bend: 0, uv: 0, uvT: 0, flipAnim: null, t: 0, enter: 0, idle: 0, drag: false });
    st.pointers.clear(); st.pinch = 0; frozen = false;
    const cv = host.querySelector("canvas.gl");
    const fallback = host.querySelector(".css-host");
    if (!gl && !init(cv)) ok = false;
    if (ok) {
      try { loadSpec(spec); } catch (e) { console.warn(e); ok = false; }
    }
    cv.hidden = !ok; fallback.hidden = ok;
    if (!ok) cssSetup(fallback, spec);
    const target = ok ? cv : fallback;
    target.onpointerdown = onDown; target.onpointermove = onMove; target.onpointerup = onUp; target.onpointercancel = onCancel;
    target.onlostpointercapture = e => { if (st.pointers.has(e.pointerId)) onCancel(); };
    target.ondblclick = flip;
    target.onwheel = onWheel;
    last = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    return ok;
  }
  function close() {
    cancelAnimationFrame(raf); raf = 0; spec = null; css = null;
    onCancel();
    if (onClose) { const cb = onClose; onClose = null; cb(); }
  }
  function nudge(dy, dp) {
    st.flipAnim = null; st.vy = st.vp = 0;
    st.yaw += dy * 0.08;
    st.pitch = clamp(st.pitch + dp * 0.08, -PITCH_LIMIT, PITCH_LIMIT);
  }
  function freeze(on) { frozen = on; if (!on && spec && !raf) raf = requestAnimationFrame(frame); }
  function renderOnce() { if (!spec) return; step(0); if (ok) draw(); else cssDraw(); if (ok) gl.finish(); }
  return { open, close, flip, reset, toggleUV, edgeView, showSide, nudge, freeze, renderOnce, isGL: () => ok, state: st };
})();
/* =====================================================================
   Part 5: the screen. Everything here reads S and calls the engine.
   ===================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const UI = { tab: "showroom", sel: null, filter: "all", search: "", sort: "franchise", range: 30, auc: null, queue: [], modalOpen: false,
  setup: { shop: "", owner: "", partners: [], diff: "classic", color: "gold" }, cloudChecked: false, pendingSave: null };
const TABS = [["showroom", "Showroom"], ["vault", "Vault"], ["collection", "Collection"], ["salon", "Salon"], ["auctions", "Auctions"],
  ["crates", "Crates"], ["jobs", "Jobs"], ["upgrades", "Upgrades"]];
const KIND_COLORS = { "Royal Heir": "#e6bd57", "Museum Curator": "#8ab4ff", "Mystery Bidder": "#b98aff", "Set Hunter": "#5eead4",
  "Estate Sale": "#d9c3a0", "Back-Alley Broker": "#f2677a", "Private Collector": "#5fd38d" };

/* ---------------------------------------------------------------- small helpers */
function pctHTML(v) {
  const cls = v > 0.05 ? "good" : v < -0.05 ? "bad" : "muted";
  const arrow = v > 0.05 ? "▲ " : v < -0.05 ? "▼ " : "";
  return `<span class="${cls} num">${arrow}${v >= 0 ? "+" : ""}${v.toFixed(1)}%</span>`;
}
const rarityChip = r => `<span class="chip r${r}" title="Rarity ${r + 1} of 5 · ${r === 4 ? "rarest tier" : "higher numbers are rarer"}">${RARITIES[r].name} · ${r + 1}/5</span>`;
const adviceChip = a => `<span class="chip ${a[3]}">${a[0]}</span>`;
function thumbHTML(cid, holo, grade, extra = "", condition = grade || 8, misprint = "") {
  const k = thumbKey(cid, holo, grade, condition, misprint), c = S.cards[cid];
  const src = THUMBS.get(k);
  const img = `<img class="thumb" ${src ? `src="${src}"` : ""} data-thumb="${cid}|${holo ? 1 : 0}|${grade || 0}|${condition}|${misprint}" alt="${esc(c ? c.name : "")}${holo ? ", holographic foil" : ""}, ${CONDITION_NAMES[condition]}${misprint ? ", " + misprint : ""}" ${extra}>`;
  if (grade) return `<div class="slabbed"><div class="slab-tag"><span>VGC</span><span>${GRADES[grade].label} ${grade}</span></div><div class="thumb-wrap ${holo ? "holo" : ""}">${img}</div></div>`;
  return `<div class="thumb-wrap ${holo ? "holo" : ""}">${img}</div>`;
}
const copyThumb = cp => thumbHTML(cp.cid, cp.holo, cp.grade, "", physicalCondition(cp), cp.misprint || "");
function traitsHTML(cp) {
  return `<div class="card-traits"><span class="chip ${cp.grade ? "sell" : ""}">${cp.grade ? `Certified ${cp.grade}/10 · ${GRADES[cp.grade].label}` : `Uncertified · ${CONDITION_NAMES[physicalCondition(cp)]}`}</span>
    ${cp.holo ? `<span class="chip holo">HOLO ×${HOLO_MULT}</span>` : ""}
    ${cp.misprint ? `<span class="chip error-print">${esc(cp.misprint)} ×${MISPRINTS[cp.misprint]}</span>` : ""}</div>`;
}
function rarityGuide() {
  return `<details class="rarity-guide"><summary>Rarity & value guide <span class="muted">· Ultra Mythic is the rarest</span></summary>
    <div class="rarity-scale">${RARITIES.map((r, i) => `<div>${rarityChip(i)}<small>Typical print run: ${r.printed}</small></div>`).join("")}</div>
    <p>Rarity increases from 1 to 5. Cosmic is rarer than Royal; Ultra is rarer than Cosmic. Crate odds are shown in Crates.</p>
    <p>Holo foil ×${HOLO_MULT} · Double strike misprint ×4 · Offset foil misprint ×3. These premiums stack. Higher mint condition is worth more even before grading. The lab certifies existing condition; it cannot repair wear.</p>
    <div class="condition-scale">${[5,6,7,8,9,10].map(g => `<span><b>${g}/10</b> ${CONDITION_NAMES[g]}<small>raw ×${RAW_CONDITION_MULT[g]} · certified ×${GRADES[g].mult}</small></span>`).join("")}</div>
    <p>Complete a four-card Collection to earn its set bonus. Panorama collections add another +0.5× and reveal one joined illustration. Safe-box cards stay out of trading and must be unlocked to grade or collect.</p></details>`;
}
const THUMB_Q = [];
let thumbBusy = false;
function hydrateThumbs(root = document) {
  root.querySelectorAll("img[data-thumb]").forEach(img => {
    if (img.getAttribute("src")) return;
    const [cid, h, g, condition, misprint] = img.dataset.thumb.split("|");
    const k = thumbKey(cid, h === "1", +g || 0, +condition || +g || 8, misprint || "");
    if (THUMBS.has(k)) img.src = THUMBS.get(k); else THUMB_Q.push(img);
  });
  if (thumbBusy || !THUMB_Q.length) return;
  thumbBusy = true;
  const step = () => {
    const t0 = performance.now();
    while (THUMB_Q.length && performance.now() - t0 < 30) {
      const img = THUMB_Q.shift();
      if (!img.isConnected || img.getAttribute("src")) continue;
      const [cid, h, g, condition, misprint] = img.dataset.thumb.split("|");
      if (!S || !S.cards[cid]) continue;
      const url = thumbURL(cid, h === "1", +g || 0, +condition || +g || 8, misprint || "");
      document.querySelectorAll("img[data-thumb]").forEach(x => { if (x.dataset.thumb === img.dataset.thumb && !x.getAttribute("src")) x.src = url; });
    }
    if (THUMB_Q.length) setTimeout(step, 16); else thumbBusy = false;
  };
  setTimeout(step, 0);
}
function toast(text, tone = "info", ms = 4200) {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = `toast ${tone}`; el.textContent = text;
  box.append(el);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(() => { el.style.transition = "opacity .4s"; el.style.opacity = "0"; setTimeout(() => el.remove(), 400); }, ms);
}
function flushFresh() {
  const lines = FRESH.splice(0);
  if (!lines.length) return;
  const show = lines.slice(-3);
  if (lines.length > 3) toast(`${lines.length - 3} more updates are in the Ledger (Menu).`, "info");
  for (const l of show) toast(l.t, l.k, 5200);
}
function run(fn) {
  try {
    const r = fn();
    if (S) settle();
    afterAction();
    return r;
  } catch (e) {
    if (e instanceof GameError) toast(e.message, "bad");
    else { console.error(e); toast("Something went wrong: " + e.message, "bad"); }
    if (S) render();
    return undefined;
  }
}
function afterAction() { flushFresh(); render(); persist(); checkEndings(); }

/* ---------------------------------------------------------------- charts */
function sizeCanvas(cv, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 300;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return [ctx, w, h];
}
function drawChart(cv, data, opts = {}) {
  if (!cv || data.length < 2) return;
  const [ctx, w, h] = sizeCanvas(cv, opts.h || 150);
  const pad = { l: 6, r: 6, t: 14, b: 18 };
  let lo = Math.min(...data), hi = Math.max(...data);
  if (opts.ref) { lo = Math.min(lo, opts.ref); hi = Math.max(hi, opts.ref); }
  if (hi - lo < hi * 0.02) { hi *= 1.01; lo *= 0.99; }
  const X = i => pad.l + (w - pad.l - pad.r) * i / (data.length - 1), Y = v => pad.t + (h - pad.t - pad.b) * (1 - (v - lo) / (hi - lo));
  const up = data[data.length - 1] >= data[0], col = up ? "#5fd38d" : "#f2677a";
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) { const y = pad.t + (h - pad.t - pad.b) * i / 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  const g = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
  g.addColorStop(0, up ? "rgba(95,211,141,0.28)" : "rgba(242,103,122,0.28)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
  ctx.lineTo(X(data.length - 1), h - pad.b); ctx.lineTo(X(0), h - pad.b); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); data.forEach((v, i) => i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)));
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(data.length - 1), Y(data[data.length - 1]), 3.5, 0, 7); ctx.fill();
  if (opts.ref) {
    ctx.setLineDash([5, 4]); ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#d9b45a";
    ctx.beginPath(); ctx.moveTo(0, Y(opts.ref)); ctx.lineTo(w, Y(opts.ref)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = ctx.strokeStyle; ctx.font = "700 11px Figtree, sans-serif"; ctx.fillText("you paid " + short(opts.ref), 8, Y(opts.ref) - 5);
  }
  ctx.fillStyle = "rgba(242,235,222,0.55)"; ctx.font = "600 11px Figtree, sans-serif";
  ctx.fillText(short(hi), w - ctx.measureText(short(hi)).width - 4, 11);
  ctx.fillText(`${data.length - 1} days ago`, 4, h - 4);
  ctx.fillText("today", w - ctx.measureText("today").width - 4, h - 4);
}
function drawRivalChart(cv) {
  if (!cv) return;
  const [ctx, w, h] = sizeCanvas(cv, 200);
  const series = [{ name: "You", color: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d9b45a", data: S.worth }]
    .concat(S.rivals.map(r => { const info = RIVALS.find(x => x.id === r.id); return { name: info.shop, color: info.color, data: r.hist }; }));
  const n = Math.max(...series.map(s => s.data.length));
  if (n < 2) { ctx.fillStyle = "#aaa0b0"; ctx.font = "13px Figtree, sans-serif"; ctx.fillText("The race chart fills in after a few days.", 10, 24); return; }
  const all = series.flatMap(s => s.data).filter(v => v > 0);
  const lo = Math.log(Math.min(...all) * 0.9), hi = Math.log(Math.max(...all, GOAL * 0.3) * 1.1);
  const X = i => 8 + (w - 16) * i / (n - 1), Y = v => 10 + (h - 30) * (1 - (Math.log(v) - lo) / (hi - lo));
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.fillStyle = "rgba(242,235,222,0.45)"; ctx.font = "600 11px Figtree, sans-serif";
  for (const v of [1e4, 1e5, 1e6, GOAL]) {
    if (Math.log(v) < lo || Math.log(v) > hi) continue;
    ctx.beginPath(); ctx.moveTo(0, Y(v)); ctx.lineTo(w, Y(v)); ctx.stroke(); ctx.fillText(v === GOAL ? "goal " + short(v) : short(v), 6, Y(v) - 3);
  }
  for (const s of series) {
    const off = n - s.data.length;
    ctx.beginPath(); s.data.forEach((v, i) => i ? ctx.lineTo(X(i + off), Y(v)) : ctx.moveTo(X(i + off), Y(v)));
    ctx.strokeStyle = s.color; ctx.lineWidth = s.name === "You" ? 3 : 1.6; ctx.stroke();
  }
}

/* ---------------------------------------------------------------- header */
function renderHeader() {
  document.documentElement.style.setProperty("--accent", SHOP_COLORS[S.color].accent);
  document.documentElement.style.setProperty("--accent-soft", SHOP_COLORS[S.color].soft);
  $("#shopName").textContent = S.shop.name;
  $("#signMark").textContent = (S.shop.name.replace(/^The /i, "").trim()[0] || "V").toUpperCase();
  const partners = S.shop.partners.map(p => `${p.name} (${ROLES[p.role].name})`);
  $("#owners").textContent = `Owned by ${S.shop.owner}` + (partners.length ? ` with ${partners.join(", ")}` : "") + ` · ${diff().name}`;
  const worth = netWorth(), ri = rankIndex(), next = RANKS[ri + 1];
  const prev = S.worth.length > 1 ? S.worth[S.worth.length - 2] : worth;
  const prog = next ? clamp((S.best - RANKS[ri][0]) / (next[0] - RANKS[ri][0]), 0, 1) : 1;
  $("#stats").innerHTML = `
    <div class="stat"><div class="label">Day</div><b>${S.day}${isConvention() ? ` <span class="chip sell" style="font-size:10px">CONVENTION</span>` : ""}</b></div>
    <div class="stat"><div class="label">Cash</div><b>${money0(S.cash)}</b></div>
    <div class="stat"><div class="label">Net worth</div><b>${short(worth)} <span class="pct">${pctHTML(prev ? (worth / prev - 1) * 100 : 0)}</span></b></div>
    <div class="stat rank"><div class="label">Rank · ${next ? "next " + short(next[0]) : "top rank"}</div><b>${RANKS[ri][1]}</b><div class="bar"><i style="width:${(prog * 100).toFixed(1)}%"></i></div></div>`;
  const openSalon = S.customers.filter(c => c.state === "open").length;
  const readyJobs = S.quests.filter(q => q.state === "open" && q.kind === "deliver" && deliverPick(q)).length;
  const canFill = S.launched.reduce((a, fid) => a + cidsOf(fid).filter(cid => !albumCopy(cid) && copiesOf(cid, "vault").length).length, 0);
  const badges = { salon: openSalon, jobs: readyJobs, collection: canFill, auctions: UI.auc && UI.auc.live ? "LIVE" : (S.lot && S.lot.state === "open" ? 1 : 0) };
  $("#tabs").innerHTML = TABS.map(([id, name]) => `<button class="tab" role="tab" data-act="tab" data-tab="${id}" aria-selected="${UI.tab === id}">${name}${badges[id] ? `<span class="dot">${badges[id]}</span>` : ""}</button>`).join("");
}

/* ---------------------------------------------------------------- showroom */
function tileMarket(c) {
  const a = advice(c, groups("vault").find(g => g.cid === c.cid && !g.holo && !g.grade) || null);
  const own = S.copies.filter(cp => cp.cid === c.cid).length;
  return `<button class="tile" data-act="select" data-cid="${c.cid}" aria-current="${UI.sel === c.cid}">
    ${own ? `<span class="qty-badge">×${own}</span>` : ""}
    ${thumbHTML(c.cid, false, 0)}
    <div class="name">${esc(c.name)}</div>
    <div class="row" style="gap:5px">${rarityChip(c.r)}${adviceChip(a)}</div>
    <div class="price"><b>${short(c.price)}</b>${pctHTML(change(c, 1))}</div>
    <div class="sub"><span>${c.stock ? c.stock + " in stock" : '<span class="bad">sold out</span>'}</span><span>${albumCopy(c.cid) ? "★ in Collection" : ""}</span></div>
  </button>`;
}
function renderShowroom() {
  const q = UI.search.trim().toLowerCase();
  const ownedF = new Set(S.copies.map(cp => S.cards[cp.cid].fid));
  let cards = allCards().filter(c => {
    const f = FR[c.fid];
    if (q && !(c.name.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))) return false;
    if (UI.filter === "buy") return advice(c, null)[0] === "BUY" && c.stock > 0;
    if (UI.filter === "mine") return ownedF.has(c.fid);
    if (TIERS[UI.filter]) return f.tier === UI.filter;
    return true;
  });
  const filters = [["all", "All"], ["buy", "Buy tips"], ["mine", "My franchises"], ["classic", "Classic"], ["standard", "Standard"], ["premium", "Premium"], ["grail", "Grail"]];
  const rising = allCards().filter(c => isHot(c) && !isEnding(c)).length, bargains = allCards().filter(c => fair(c) > 0 && c.price / fair(c) < 0.85).length;
  let body = "";
  if (!cards.length) body = `<div class="empty">No cards match. Try another filter.</div>`;
  else if (UI.sort !== "franchise") {
    cards.sort((a, b) => UI.sort === "price" ? b.price - a.price : change(b, 1) - change(a, 1));
    body = `<div class="grid">${cards.map(tileMarket).join("")}</div>`;
  } else {
    const tierRank = { classic: 0, standard: 1, premium: 2, grail: 3 };
    const fresh = fid => S.day > 1 && S.cards[cidsOf(fid)[0]].released > S.day - 4;
    const order = S.launched.slice().sort((a, b) => (fresh(b) - fresh(a)) || (tierRank[FR[a].tier] - tierRank[FR[b].tier]));
    body = order.map(fid => {
      const list = cards.filter(c => c.fid === fid);
      if (!list.length) return "";
      const f = FR[fid], st = setStatus(fid), owned = cidsOf(fid).filter(ownsCard).length;
      const isNew = S.cards[cidsOf(fid)[0]].released > S.day - 4 && S.day > 1;
      return `<section class="fr-block">
        <div class="fr-head"><h3>${esc(f.name)}</h3><span class="tier ${f.tier}">${TIERS[f.tier].name}</span>
          ${isNew ? '<span class="chip hold">NEW</span>' : ""}
          <span class="meta">Set bonus ×${st.mult} · you own ${owned}/4 · Collection ${st.have}/4 · full set ${short(st.setPrice)}</span></div>
        <div class="grid">${list.map(tileMarket).join("")}</div></section>`;
    }).join("");
  }
  return `<div class="section-head"><div><h2>Showroom</h2><p>Standard near-mint, uncertified cards. Find holo foil, rare misprints and other conditions in crates, the Salon and auctions. Tags offer market advice: BUY, SELL, HOLD or WAIT. ${rising} rising, ${bargains} bargains today.</p></div></div>
    <div class="toolbar">
      <input class="input" id="search" placeholder="Search cards or franchises" value="${esc(UI.search)}" aria-label="Search">
      <select class="input" id="sort" style="flex:0 0 auto;width:auto" aria-label="Sort">
        <option value="franchise" ${UI.sort === "franchise" ? "selected" : ""}>By franchise</option>
        <option value="price" ${UI.sort === "price" ? "selected" : ""}>Highest price</option>
        <option value="change" ${UI.sort === "change" ? "selected" : ""}>Biggest movers</option>
      </select>
    </div>
    <div class="toolbar">${filters.map(([id, n]) => `<button class="fchip" data-act="filter" data-f="${id}" aria-pressed="${UI.filter === id}">${n}</button>`).join("")}</div>
    ${body}`;
}

/* ---------------------------------------------------------------- vault */
function vaultTile(g, safe = false) {
  const cp = g.copies[0], c = S.cards[g.cid];
  return `<article class="tile owned-card" draggable="true" data-copy-id="${cp.id}">
    <div class="spread"><span class="drag-handle" title="Drag to grading, safe box or trading vault">⠿ Move card</span><span class="chip">${safe ? "LOCKED" : g.qty > 1 ? `×${g.qty}` : `#${cp.serial}`}</span></div>
    <button class="card-inspect" data-act="inspectCopy" data-id="${cp.id}" title="Inspect this copy">${copyThumb(cp)}</button>
    <div class="name">${esc(c.name)}</div>${rarityChip(c.r)}${traitsHTML(cp)}
    <div class="price"><b>${short(g.unit)}</b><small class="muted">per copy</small></div>
    <div class="row card-actions">${safe
      ? `<button class="btn sm" data-act="unsafe" data-id="${cp.id}">Unlock</button>`
      : `<button class="btn sm" data-act="safe" data-id="${cp.id}">Lock in safe</button>
         <button class="btn sm" data-act="grade" data-id="${cp.id}" ${cp.grade ? "disabled" : ""}>${cp.grade ? "Certified" : `Grade · ${short(gradeFee(cp))}`}</button>`}
      <button class="btn sm ghost" data-act="select" data-cid="${c.cid}">Details</button></div></article>`;
}
function renderVault() {
  const gs = groups("vault").sort((a, b) => b.unit * b.qty - a.unit * a.qty);
  const safe = groups("safe");
  const total = gs.reduce((a, g) => a + g.unit * g.qty, 0), count = gs.reduce((a, g) => a + g.qty, 0);
  const sells = gs.filter(g => advice(S.cards[g.cid], g)[0] === "SELL");
  const lab = S.copies.filter(cp => cp.place === "lab"), loans = S.copies.filter(cp => cp.place === "loan");
  return `<div class="section-head"><div><h2>Trading vault</h2><p>${plural(count, "card")} worth ${money(total)}. Drag a card to the lab or safe, or use its buttons. On touch screens, drag the ⠿ handle.</p></div>
    <button class="btn primary" data-act="sellAdvised" ${sells.length ? "" : "disabled"}>Sell marked SELL (${sells.reduce((a, g) => a + g.qty, 0)})</button></div>
    <div class="vault-stations">
      <section class="panel drop-zone grading-zone" data-drop="lab" aria-label="Grading vault drop zone">
        <div class="spread"><h3>Grading vault</h3><span class="chip">${lab.length}/${labSlots()} in use</span></div>
        <p>Drop an uncertified trading card here. Fee: 3% (minimum $75). Returns in ${labDays()} days. Visible wear stays the same; the lab verifies the condition.</p>
        <div class="lab-slots">${Array.from({length:labSlots()}, (_, i) => { const cp = lab[i]; return cp
          ? `<div class="lab-slot occupied">${copyThumb(cp)}<div><b>${esc(S.cards[cp.cid].name)}</b><small>Results on day ${cp.until}</small></div></div>`
          : `<div class="lab-slot">＋ Drop card to grade</div>`; }).join("")}</div>
      </section>
      <section class="panel drop-zone safe-zone" data-drop="safe" aria-label="Safe box drop zone">
        <div class="spread"><h3>Safe box</h3><span class="chip sell">${safe.reduce((n,g) => n+g.qty,0)} locked</span></div>
        <p>Protect favorites from sales, consignment and loans. Unlimited storage, no fee. Unlock a card to trade, grade or add it to a Collection.</p>
        <b>${short(safe.reduce((n,g) => n+g.unit*g.qty,0))} protected</b>
        ${safe.length ? `<button class="btn sm" data-act="toggleSafe" aria-expanded="${!!UI.safeOpen}">${UI.safeOpen ? "Hide contents" : "Open safe box"}</button>` : '<span class="muted">Drop a card here to lock it away</span>'}
      </section>
    </div>
    ${UI.safeOpen && safe.length ? `<section class="panel safe-contents"><h3>Inside your safe box</h3><div class="grid">${safe.map(g => vaultTile(g,true)).join("")}</div></section>` : ""}
    <section class="drop-zone trading-zone" data-drop="vault" aria-label="Trading vault drop zone"><div class="spread"><h3>Trading cards</h3><span class="muted">Drop safe cards here to unlock</span></div>
      ${gs.length ? `<div class="grid">${gs.map(g => vaultTile(g)).join("")}</div>` : '<div class="empty">Buy cards in the Showroom, open a crate, or unlock cards from your safe box.</div>'}
    </section>
    ${loans.length ? `<p class="muted">On loan: ${loans.map(cp => `${esc(S.cards[cp.cid].name)} (back day ${cp.until})`).join(", ")}</p>` : ""}`;
}

/* ---------------------------------------------------------------- collection */
function renderCollection() {
  const p = prestige(), lv = collectorLevel(p), sets = launchedSets(), done = sets.filter(s => s.complete);
  const prog = lv.next ? (p - lv.prev) / (lv.next - lv.prev) : 1;
  const albums = S.launched.slice().sort((a, b) => setStatus(b).have - setStatus(a).have || TIERS[FR[a].tier].mult - TIERS[FR[b].tier].mult).map(fid => {
    const f = FR[fid], st = setStatus(fid);
    const pockets = cidsOf(fid).map((cid, i) => {
      const c = S.cards[cid], cp = st.slots[i];
      if (cp) {
        const loan = cp.place === "loan";
        return `<div class="pocket">${`<button style="all:unset;cursor:pointer" data-act="inspectCopy" data-id="${cp.id}">${copyThumb(cp)}</button>`}
          <div class="pname">${esc(c.name)}</div>${traitsHTML(cp)}<div class="pnote">${loan ? `On loan until day ${cp.until}` : short(copyValue(cp))}</div>
          ${loan ? "" : `<button class="btn sm ghost" data-act="fromAlbum" data-cid="${cid}">Take out</button>`}</div>`;
      }
      const best = bestVaultCopy(cid);
      return `<div class="pocket"><div class="ghosted">${thumbHTML(cid, false, 0)}<div class="ghost-cap"><b>${c.idx + 1}</b>${rarityChip(c.r)}</div></div>
        <div class="pname">${esc(c.name)}</div>
        <div class="pnote">${best ? "In your vault" : c.stock ? `Showroom ${short(buyPrice(c))}` : "Sold out today"}</div>
        ${best ? `<button class="btn sm good" data-act="toAlbum" data-id="${best.id}">Add to Collection</button>`
               : `<button class="btn sm" data-act="select" data-cid="${cid}">View card</button>`}</div>`;
    }).join("");
    return `<section class="panel album ${st.complete ? "complete" : ""}">
      <div class="spread"><div class="fr-head"><h3>${esc(f.name)}</h3><span class="tier ${f.tier}">${TIERS[f.tier].name}</span></div>
        <div class="row">${st.complete ? `<span class="chip sell">COMPLETE ×${st.mult}</span>` : `<span class="chip">${st.have}/4</span>`}</div></div>
      <div class="muted" style="font-size:13px;font-style:italic">"${esc(f.motto)}"</div>
      ${f.panorama ? `<figure class="panorama ${st.complete ? "complete" : ""}"><canvas data-panorama="${fid}" role="img" aria-label="${esc(f.name)} joined illustration, ${st.have} of 4 pieces collected"></canvas><figcaption>${st.complete ? "PICTURE COMPLETE" : `${st.have}/4 FRAGMENTS COLLECTED`} · ${esc(f.name)} · set value ×${st.mult}</figcaption></figure>` : ""}
      <div class="pockets">${pockets}</div>
      <div class="spread"><span class="muted" style="font-size:13.5px">${st.complete
        ? `Worth ${money0(st.value)} as a set (${money0(st.raw)} as single cards).`
        : `Complete it and the set is worth ×${st.mult}: about ${money0(st.setPrice)} at today's prices.`}</span>
        ${st.complete ? `<button class="btn sm" data-act="consignSet" data-fid="${fid}">Sell the set at auction</button>` : ""}</div>
    </section>`;
  }).join("");
  const locked = S.queue.map(fid => { const f = FR[fid]; return `<div class="panel" style="padding:12px 14px;opacity:.65"><b>${esc(f.name)}</b> <span class="tier ${f.tier}">${TIERS[f.tier].name}</span><div class="muted" style="font-size:12.5px">Premieres soon. Four new cards.</div></div>`; }).join("");
  return `<div class="section-head"><div><h2>Your Collection</h2><p>Your personal gallery. Cards here are kept apart from trading stock. Complete all four cards of a franchise and the whole set is worth far more than its parts. Visitors also pay to see your gallery every day.</p></div></div>
    <div class="collector">
      <div class="panel"><div class="label">Collector level</div><b>Level ${lv.lv}</b><div class="bar" style="margin-top:6px"><i style="width:${(prog * 100).toFixed(0)}%"></i></div><div class="dim" style="font-size:12px;margin-top:4px">${lv.next ? `${p} / ${lv.next} prestige` : `${p} prestige, max level`}</div></div>
      <div class="panel"><div class="label">Collection value</div><b>${short(albumValue())}</b><div class="dim" style="font-size:12px">includes set bonuses</div></div>
      <div class="panel"><div class="label">Gallery tickets</div><b>${money0(galleryIncome())}<span class="dim" style="font-size:13px"> /day</span></b><div class="dim" style="font-size:12px">paid each morning</div></div>
      <div class="panel"><div class="label">Complete sets</div><b>${done.length} / ${S.launched.length}</b><div class="dim" style="font-size:12px">${FRANCHISES.length} franchises in all</div></div>
    </div>
    ${albums}
    ${locked ? `<div class="label">Coming soon</div><div class="two" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${locked}</div>` : ""}`;
}

function hydratePanoramas(root) {
  root.querySelectorAll("canvas[data-panorama]").forEach(canvas => {
    const fid = canvas.dataset.panorama, st = setStatus(fid);
    const w = 640, h = 720;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    st.slots.forEach((cp, i) => {
      const x = i % 2 * w / 2, y = Math.floor(i / 2) * h / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w / 2, h / 2); ctx.clip(); ctx.translate(x,y);
      paintArt(ctx, w / 2, h / 2, S.cards[`${fid}-${i}`], seeded(1));
      if (!cp) {
        ctx.fillStyle = "rgba(8,6,17,.92)"; ctx.fillRect(0,0,w/2,h/2);
        ctx.fillStyle = "#aaa0b0"; ctx.textAlign = "center"; ctx.font = `600 28px ${FONT_BODY}`;
        ctx.fillText(`Missing fragment ${i+1}`, w/4,h/4);
      }
      ctx.restore();
    });
  });
}

/* ---------------------------------------------------------------- salon */
function custHTML(cu) {
  const color = KIND_COLORS[cu.kind] || "#aaa", initials = cu.name.slice(0, 2).toUpperCase();
  const stars = "★".repeat(cu.stars) + "☆".repeat(5 - cu.stars);
  let body = "", actions = "";
  const open = cu.state === "open";
  const hag = open && cu.haggles < HAGGLE_CHANCES.length ? `<button class="btn sm" data-act="haggle" data-id="${cu.id}">Haggle (${Math.round(haggleChance(cu) * 100)}%)</button>` : "";
  const pass = open ? `<button class="btn sm ghost" data-act="pass" data-id="${cu.id}">Pass</button>` : "";
  if (cu.side === "set") {
    const plan = setPlan(cu.fid), ids = cidsOf(cu.fid), haveAll = plan.every(Boolean);
    const fromAlbum = plan.filter(cp => cp && cp.place === "album").length;
    const st = setStatus(cu.fid), q = setFlipQuote(cu);
    body = `<div class="setslots">${ids.map((cid, i) => `<div class="${plan[i] ? "" : "miss"}">${thumbHTML(cid, false, 0)}<span>${plan[i] ? "✓ have" : (S.cards[cid].stock ? short(buyPrice(S.cards[cid])) : "sold out")}</span></div>`).join("")}</div>
      <div class="offer"><div><div class="label">Pays for the full set</div><b>${money0(cu.price)}</b></div>
        <div class="muted" style="font-size:13px;text-align:right">The 4 cards trade for ${short(st.marketSum)} separately<br><span class="good">×${(cu.price / st.marketSum).toFixed(2)} the single-card price</span></div></div>
      ${fromAlbum && haveAll ? `<div class="hint warnish">This takes ${fromAlbum} card${fromAlbum > 1 ? "s" : ""} out of your Collection.</div>` : ""}`;
    if (open) actions = haveAll ? `<button class="btn sm primary" data-act="deal" data-id="${cu.id}">Sell the set</button>`
      : q && !q.blocked ? `<button class="btn sm good" data-act="flipSet" data-id="${cu.id}" ${q.cost > S.cash ? "disabled" : ""}>Buy ${q.miss.length} missing (${short(q.cost)}) & sell</button>`
      : `<span class="muted" style="font-size:13px">${q && q.blocked ? esc(q.blocked) + " is sold out today." : ""}</span>`;
  } else {
    const c = S.cards[cu.cid];
    const value = c.price * (cu.side === "sell" ? copyMult(cu) : 1);
    const diffPct = (cu.price / value - 1) * 100;
    body = `<div class="mini">${`<button style="all:unset;cursor:pointer;flex:none;width:58px" data-act="${cu.side === "sell" ? "inspectSeller" : "select"}" data-id="${cu.id}" data-cid="${cu.cid}">${thumbHTML(cu.cid, cu.holo, cu.grade, "", cu.condition || 8, cu.misprint || "")}</button>`}
      <div style="min-width:0"><b>${cu.qty > 1 ? cu.qty + " × " : ""}${esc(c.name)}</b><div class="row" style="gap:5px;margin-top:3px">${rarityChip(c.r)}${cu.holo ? '<span class="chip holo">HOLO</span>' : ""}${cu.grade ? `<span class="chip">${GRADES[cu.grade].label} ${cu.grade}</span>` : ""}</div>
      ${cu.side === "sell" ? traitsHTML(cu) : ""}<div class="muted" style="font-size:12.5px;margin-top:3px">${esc(FR[c.fid].name)} · market ${short(value)}</div></div></div>
      <div class="offer"><div><div class="label">${cu.side === "buy" ? (cu.qty > 1 ? "Offers each" : "Offers") : "Asking"}</div><b>${money0(cu.price)}</b></div>
        <div style="text-align:right;font-size:13px">${cu.side === "buy" ? `<span class="${diffPct >= 0 ? "good" : "bad"}">${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(0)}% vs market</span>` : `<span class="${diffPct <= 0 ? "good" : "bad"}">${diffPct <= 0 ? Math.abs(diffPct).toFixed(0) + "% under" : diffPct.toFixed(0) + "% over"} market</span>`}<br>
        <span class="muted">${cu.side === "buy" ? `you have ${plainCopies(cu.cid).length} regular` : `serial ${cu.serial} / ${c.printed}`}</span></div></div>`;
    if (cu.hint) body += cu.hint === "clean"
      ? `<div class="hint">${esc(roleName("appraiser"))} (Appraiser): "I looked it over. Seems genuine to me."</div>`
      : `<div class="hint warnish">${esc(roleName("appraiser"))} (Appraiser): "Something's off. ${esc(TELLS[cu.hint].hint)}"</div>`;
    if (cu.kind === "Mystery Bidder" && open) body += `<div class="hint warnish">Mystery Bidders sometimes vanish at the last second. You keep your card if they do.</div>`;
    if (open) {
      if (cu.side === "buy") {
        const have = plainCopies(cu.cid).length, fq = flipQuote(cu);
        actions = have ? `<button class="btn sm primary" data-act="deal" data-id="${cu.id}">Sell ${Math.min(have, cu.qty) > 1 ? Math.min(have, cu.qty) + " " : ""}(${short(cu.price * Math.min(have, cu.qty))})</button>` : "";
        if (fq && have < cu.qty) actions += `<button class="btn sm good" data-act="flip" data-id="${cu.id}" ${fq.cost > S.cash ? "disabled" : ""}>Buy ${fq.need} in Showroom (${short(fq.cost)}) & sell</button>`;
        if (!have && !fq) actions += `<span class="muted" style="font-size:13px">Showroom is sold out.</span>`;
      } else {
        actions = `<button class="btn sm" data-act="inspectSeller" data-id="${cu.id}">Inspect in 3D</button>
          <button class="btn sm primary" data-act="deal" data-id="${cu.id}" ${cu.price > S.cash ? "disabled" : ""}>Buy</button>
          <button class="btn sm bad" data-act="accuse" data-id="${cu.id}">Call it a fake</button>`;
      }
    }
  }
  return `<article class="panel cust">
    <div class="who"><div class="avatar" style="background:${color}">${esc(initials)}</div>
      <div style="min-width:0"><b>${esc(cu.name)}</b> <span class="chip" style="color:${color}">${cu.kind}</span><div class="dim" style="font-size:12px" title="Reliability">${stars}</div></div></div>
    <p class="quote">"${esc(cu.line)}"</p>
    ${body}
    ${open ? `<div class="row" style="gap:6px">${actions}${hag}${pass}</div>` : ""}
    ${!open ? `<div class="stamp"><span class="${cu.tone}">${cu.stamp}</span></div>` : ""}
  </article>`;
}
function renderSalon() {
  const open = S.customers.filter(c => c.state === "open").length;
  return `<div class="section-head"><div><h2>The Salon</h2><p>${open ? plural(open, "collector") + " waiting." : "Everyone has left for today."} Buyers pay over market, sellers ask under it. Some sellers are forgers: inspect their card in 3D before you buy, and call out a fake for a bounty.</p></div></div>
    ${isConvention() ? `<div class="banner gold"><b>Convention Day!</b> Extra collectors and a Set Hunter are in today.</div>` : ""}
    ${S.buffs.goodwill >= S.day ? `<div class="banner info">Goodwill from the charity gala: buyers pay 5% more until day ${S.buffs.goodwill}.</div>` : ""}
    <div class="customers">${S.customers.map(custHTML).join("") || '<div class="empty">No collectors today.</div>'}</div>`;
}

/* ---------------------------------------------------------------- auctions */
function renderAuctions() {
  const lot = S.lot, a = UI.auc;
  let lotHTML = `<div class="empty">No lot today.</div>`;
  if (lot) {
    const isSet = lot.kind === "set";
    const pic = isSet ? `<div class="setslots" style="grid-template-columns:repeat(2,1fr)">${cidsOf(lot.fid).map(cid => `<div>${thumbHTML(cid, false, 0)}</div>`).join("")}</div>`
      : `<button style="all:unset;cursor:pointer" data-act="inspectLot">${thumbHTML(lot.cid, lot.holo, lot.grade, "", lot.condition || 8, lot.misprint || "")}</button>`;
    let live = "";
    if (lot.state === "open" && (!a || !a.live)) live = `<div class="row"><button class="btn primary" data-act="aucStart">Enter the room and start bidding</button></div>`;
    else if (a && a.live) {
      const nxt = a.leader ? a.price + increment(a.price) : a.price;
      live = `<div class="spread"><div><div class="label">Current bid</div><div class="bigprice">${money0(a.price)}</div><div class="muted">${a.leader ? (a.leader === "You" ? '<b class="good">You lead!</b>' : esc(a.leader) + " leads") : "Opening bid, no bids yet"}</div></div>
        <button class="btn primary" data-act="aucBid" ${nxt > S.cash || a.leader === "You" ? "disabled" : ""}>Bid ${money0(nxt)}</button></div>
        <div class="clock"><i id="aucClock" style="width:${(a.clock / AUCTION_CLOCK * 100).toFixed(1)}%"></i></div>
        <div class="callout" id="aucCall">${esc(a.call)}</div>
        <div class="bidlog">${a.log.map(([who, p]) => `<div class="${who === "You" ? "you" : ""}"><span>${esc(who)}</span><b class="num">${money0(p)}</b></div>`).join("")}</div>`;
    } else if (lot.state === "done") live = `<div class="banner ${lot.winner === "You" ? "gold" : "info"}">${lot.winner === "You" ? `You won it for ${money0(lot.price)}!` : lot.winner ? `Sold to ${esc(lot.winner)} for ${money0(lot.price)}.` : "No bids reached the opening price. The lot was withdrawn."} A new lot arrives tomorrow.</div>`;
    lotHTML = `<section class="panel lot">
      <div class="lot-top">${pic}<div class="stack" style="gap:6px;align-content:start">
        <div class="label">Lot ${lot.no || S.day} · today only</div><h3 style="font-size:19px">${esc(lotLabel(lot))}</h3>
        ${isSet ? `<span class="chip sell" style="justify-self:start">COMPLETE SET ×${setStatus(lot.fid).mult}</span>` : `<div class="row" style="gap:5px">${rarityChip(S.cards[lot.cid].r)}${lot.holo ? '<span class="chip holo">HOLO</span>' : ""}${lot.grade ? `<span class="chip">${GRADES[lot.grade].label} ${lot.grade}</span>` : ""}</div>${traitsHTML(lot)}`}
        <dl class="kv"><dt>Estimate</dt><dd>${money0(lot.value)}</dd><dt>Opening bid</dt><dd>${money0(lot.start)}</dd><dt>In the room</dt><dd>${plural(lot.bidders.length, "bidder")}</dd></dl>
      </div></div>${live}</section>`;
  }
  const used = S.consignDay === S.day ? S.consigns : 0, left = consignLimit() - used;
  const gs = groups("vault").sort((x, y) => y.unit - x.unit).slice(0, 14);
  const sets = completeSets().filter(st => st.slots.every(cp => cp.place === "album"));
  const consignRows = sets.map(st => `<div class="copy-row"><div class="spread"><div><b>Complete ${esc(FR[st.fid].name)} set</b><div class="muted" style="font-size:12.5px">From your Collection · estimate ${money0(st.value)}</div></div>
      <button class="btn sm primary" data-act="consignSet" data-fid="${st.fid}" ${left > 0 ? "" : "disabled"}>Consign set</button></div></div>`).join("")
    + gs.map(g => `<div class="copy-row"><div class="spread"><div class="mini"><img class="thumb" style="width:38px" data-thumb="${g.cid}|${g.holo ? 1 : 0}|${g.grade || 0}|${g.condition}|${g.misprint || ""}" alt=""><div><b>${esc(copyLabel(g.copies[0]))}</b><div class="muted" style="font-size:12.5px">estimate ${money0(g.unit)} · reserve ${money0(g.unit * AUCTION_RESERVE)}</div></div></div>
      <button class="btn sm" data-act="consign" data-id="${g.copies[0].id}" ${left > 0 ? "" : "disabled"}>Consign</button></div></div>`).join("");
  return `<div class="section-head"><div><h2>Auction House</h2><p>One lot goes under the hammer each day. Bid live against the room: if nobody outbids you before the clock runs out, it's yours.</p></div></div>
    <div class="two">${lotHTML}
    <section class="panel lot"><div><h3 style="font-size:19px">Sell under the hammer</h3><p class="muted" style="margin:4px 0 0;font-size:14px">The house keeps ${(auctionFee() * 100).toFixed(0)}%. If bids stay under ${Math.round(AUCTION_RESERVE * 100)}% of the estimate, you keep the card. ${left > 0 ? `${plural(left, "slot")} left today.` : "No slots left today."}</p></div>
      ${consignRows || '<div class="empty">Nothing to consign yet.</div>'}</section></div>`;
}
function aucStart() {
  const lot = S.lot;
  if (!lot || lot.state !== "open") return;
  UI.auc = { live: true, price: lot.start, leader: "", log: [], clock: AUCTION_CLOCK, call: "The auctioneer opens the bidding...", aiAt: performance.now() + 1500, last: performance.now() };
  clearInterval(UI.aucTimer);
  UI.aucTimer = setInterval(aucTick, 100);
  render();
}
function aucNext(a) { return a.leader ? a.price + increment(a.price) : a.price; }
function aucBid() {
  const a = UI.auc;
  if (!a || !a.live || a.leader === "You") return;
  const nxt = aucNext(a);
  if (nxt > S.cash) { toast(`You can't cover ${money(nxt)}.`, "bad"); return; }
  a.price = nxt; a.leader = "You"; a.log.unshift(["You", nxt]); a.clock = AUCTION_CLOCK; a.call = "";
  a.aiAt = performance.now() + uni(700, 1700);
  render();
}
function aucTick() {
  const a = UI.auc, lot = S.lot;
  if (!a || !a.live || !lot || lot.state !== "open") { clearInterval(UI.aucTimer); return; }
  const now = performance.now(), dt = (now - a.last) / 1000; a.last = now;
  let changed = false;
  if (now >= a.aiAt) {
    const nxt = aucNext(a);
    const able = lot.bidders.filter(b => b.max >= nxt && b.name !== a.leader);
    if (able.length && rnd() < 0.9) {
      const b = pick(able);
      a.price = nxt; a.leader = b.name; a.log.unshift([b.name, nxt]); a.clock = AUCTION_CLOCK; a.call = "";
      a.aiAt = now + uni(600, 1500); changed = true;
    } else a.aiAt = now + 400;
  }
  a.clock -= dt;
  const call = a.clock < 0 ? "" : a.clock < 1.2 ? "Going twice..." : a.clock < 2.4 ? "Going once..." : a.call;
  if (call !== a.call) { a.call = call; changed = true; }
  if (a.clock <= 0) {
    clearInterval(UI.aucTimer);
    a.live = false;
    if (a.leader === "You") run(() => winLot(a.price));
    else run(() => loseLot(a.leader, a.price));
    UI.auc = null;
    return;
  }
  if (UI.tab === "auctions") {
    if (changed) render();
    else { const el = $("#aucClock"); if (el) el.style.width = (Math.max(0, a.clock) / AUCTION_CLOCK * 100).toFixed(1) + "%"; }
  }
}

/* ---------------------------------------------------------------- crates */
function renderCrates() {
  const crates = CRATES.map((k, i) => {
    const unlocked = crateUnlocked(i), price = cratePrice(i);
    const rank = RANKS.find(r => r[0] === k.unlock);
    return `<section class="panel crate">
      <div class="box" style="background:linear-gradient(145deg, ${k.color}, ${mix(k.color, "#000000", 0.55)})">${k.name.toUpperCase()}</div>
      <div class="spread"><b>${k.name}</b><span class="num">${money0(price)}</span></div>
      <div class="muted" style="font-size:13.5px">${plural(k.cards, "card")} · ${Math.round(k.holo * 100)}% holo chance. ${k.blurb}</div>
      <div class="odds">${k.odds.map((o, r) => o ? `<i style="width:${o}%;background:${RARITIES[r].color}" title="${RARITIES[r].name} ${o}%"></i>` : "").join("")}</div>
      <div class="row" style="gap:6px;font-size:12px">${k.odds.map((o, r) => o ? `<span style="color:${RARITIES[r].color}">${RARITIES[r].short} ${o}%</span>` : "").join("")}</div>
      ${unlocked ? `<button class="btn primary" data-act="openCrate" data-i="${i}" ${price > S.cash ? "disabled" : ""}>Open for ${money0(price)}</button>` : `<button class="btn" disabled>Unlocks at ${rank[1]} (${short(k.unlock)})</button>`}
    </section>`;
  }).join("");
  const boosters = S.launched.map(fid => {
    const f = FR[fid], ids = cidsOf(fid), w = boosterOdds(fid), tw = w.reduce((a, b) => a + b, 0), price = boosterPrice(fid);
    return `<div class="panel booster"><div class="spread"><b>${esc(f.name)}</b><span class="tier ${f.tier}">${TIERS[f.tier].name}</span></div>
      <div class="setslots">${ids.map((cid, i) => `<div>${thumbHTML(cid, false, 0)}<span>${Math.round(w[i] / tw * 100)}%</span></div>`).join("")}</div>
      <button class="btn sm primary" data-act="openBooster" data-fid="${fid}" ${price > S.cash ? "disabled" : ""}>3 cards for ${money0(price)}</button></div>`;
  }).join("");
  return `<div class="section-head"><div><h2>Crates & boosters</h2><p>Crates cost about what the cards inside are worth on average. Boosters only contain cards from one franchise: the easy way to finish a set.${isConvention() ? " Convention Day: 10% off everything!" : ""}</p></div></div>
    <div class="two" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${crates}</div>
    <div class="label">Franchise boosters</div><div class="boosters">${boosters}</div>`;
}

/* ---------------------------------------------------------------- jobs */
function renderJobs() {
  const quests = S.quests.map(q => {
    const left = q.due - S.day;
    let extra = "";
    if (q.kind === "deliver") {
      const c = deliverPick(q);
      extra = c ? `<button class="btn sm primary" data-act="deliver" data-id="${q.id}">Deliver ${esc(c.name)} for ${money0(c.price * DELIVERY_PREMIUM)}</button>` : `<span class="muted" style="font-size:13px">You need a regular copy that fits in your vault.</span>`;
    }
    const pct = q.need ? q.have / q.need : 0;
    return `<section class="panel quest">
      <div class="spread"><h3>${esc(q.title)}</h3><span class="chip ${left <= 1 ? "wait" : ""}">${left <= 0 ? "due today" : `due in ${plural(left, "day")}`}</span></div>
      <div class="muted" style="font-size:14px">${esc(q.text)}</div>
      ${q.kind !== "deliver" ? `<div class="bar"><i style="width:${(pct * 100).toFixed(0)}%"></i></div><div class="spread" style="font-size:13px"><span class="muted">${q.have} / ${q.need}</span><b class="gold">Reward ${money0(q.reward)}</b></div>` : ""}
      ${extra}</section>`;
  }).join("") || '<div class="empty">No commissions right now. New clients write in every morning.</div>';
  const me = netWorth();
  const rows = [{ me: true, shop: S.shop.name, owner: S.shop.owner, worth: me, hist: S.worth }].concat(S.rivals.map(r => {
    const info = RIVALS.find(x => x.id === r.id); return { shop: info.shop, owner: info.owner, worth: r.worth, hist: r.hist, color: info.color };
  })).sort((x, y) => y.worth - x.worth);
  const board = rows.map((r, i) => {
    const old = r.hist.length > 7 ? r.hist[r.hist.length - 8] : r.hist[0] || r.worth;
    return `<tr class="${r.me ? "me" : ""}"><td>${i + 1}</td><td><b>${esc(r.shop)}</b><div class="dim" style="font-size:12px">${esc(r.owner)}</div></td><td class="num">${short(r.worth)}</td><td>${pctHTML(old ? (r.worth / old - 1) * 100 : 0)}</td></tr>`;
  }).join("");
  const trophies = TROPHIES.map(([k, name, desc, reward], i) => `<div class="panel trophy ${S.trophies.includes(k) ? "won" : ""}"><div class="medal">${i + 1}</div><div><b>${name}</b><small>${desc} · ${short(reward)}</small></div></div>`).join("");
  const s = S.stats;
  return `<div class="section-head"><div><h2>Commissions</h2><p>Side jobs from wealthy clients. Finish them before the deadline for a reward.</p></div></div>
    <div class="two">${quests}</div>
    <div class="two">
      <section class="panel" style="padding:16px;display:grid;gap:10px"><h3 style="font-size:19px">The race to Vault Tycoon</h3>
        <div class="muted" style="font-size:13.5px">Three rival shops want the title too. First to ${short(GOAL)} wins the city.</div>
        <div class="table-wrap"><table class="board"><thead><tr><th>#</th><th>Shop</th><th>Net worth</th><th>7 days</th></tr></thead><tbody>${board}</tbody></table></div>
        <canvas class="chart" id="rivalChart" style="height:200px"></canvas></section>
      <section class="panel" style="padding:16px;display:grid;gap:8px"><h3 style="font-size:19px">Your record</h3>
        <dl class="kv"><dt>Days open</dt><dd>${S.day}</dd><dt>Best net worth</dt><dd>${money0(S.best)}</dd><dt>Cards bought / sold</dt><dd>${s.bought} / ${s.sold}</dd>
        <dt>Salon deals</dt><dd>${s.deals}</dd><dt>Forgers caught</dt><dd>${s.busted}</dd><dt>Fakes you bought</dt><dd>${s.lost}</dd><dt>Auctions won</dt><dd>${s.auctions}</dd>
        <dt>Cards graded (10s)</dt><dd>${s.graded} (${s.gems})</dd><dt>Sets completed</dt><dd>${s.sets}</dd><dt>Letters answered</dt><dd>${s.letters}</dd>
        <dt>Gallery tickets</dt><dd>${money0(s.tickets || 0)}</dd><dt>Profit from sales</dt><dd class="${s.profit >= 0 ? "good" : "bad"}">${signed(s.profit)}</dd></dl></section>
    </div>
    <div class="section-head"><div><h2>Trophies</h2><p>${S.trophies.length} of ${TROPHIES.length} won. Each one pays a cash prize.</p></div></div>
    <div class="trophies">${trophies}</div>`;
}

/* ---------------------------------------------------------------- upgrades */
function renderUpgrades() {
  const ups = UPGRADES.map(u => {
    const lv = upgradeLevel(u.id), cost = upgradeCost(u.id);
    return `<section class="panel upg"><div class="spread"><b>${u.name}</b><div class="pips">${u.costs.map((_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("")}</div></div>
      <div class="muted" style="font-size:13.5px">${u.desc}</div>
      ${cost == null ? `<span class="chip sell" style="justify-self:start">FULLY UPGRADED</span>` : `<button class="btn ${cost <= S.cash ? "primary" : ""}" data-act="upgrade" data-id="${u.id}" ${cost > S.cash ? "disabled" : ""}>${lv ? "Upgrade" : "Buy"} for ${money0(cost)}</button>`}</section>`;
  }).join("");
  const partners = S.shop.partners.length ? S.shop.partners.map(p => `<div class="copy-row"><b>${esc(p.name)}</b><span class="chip sell" style="justify-self:start">${ROLES[p.role].name}</span><span class="muted" style="font-size:13px">${ROLES[p.role].desc}</span></div>`).join("")
    : `<div class="muted">You run ${esc(S.shop.name)} on your own. (Co-owners are chosen when you open a new shop.)</div>`;
  return `<div class="section-head"><div><h2>Upgrades</h2><p>Invest in the shop. Upgrades pay off every single day.</p></div></div>
    <div class="upgrades">${ups}</div>
    <section class="panel" style="padding:16px;display:grid;gap:10px"><h3 style="font-size:19px">Owners</h3>
      <div class="copy-row"><b>${esc(S.shop.owner)}</b><span class="muted" style="font-size:13px">Founder of ${esc(S.shop.name)}</span></div>${partners}</section>`;
}

/* ---------------------------------------------------------------- detail panel */
function renderDetail() {
  const el = $("#detail");
  if (!UI.sel || !S.cards[UI.sel]) {
    el.innerHTML = `<div class="detail"><div class="spread"><b>Card details</b><button class="btn sm sheet-close" data-act="closeSheet">Close</button></div><div class="empty">Pick any card to see its price history, plain advice and what you can do with it.</div></div>`;
    return;
  }
  const c = S.cards[UI.sel], f = FR[c.fid];
  const plainG = groups("vault").find(g => g.cid === c.cid && !g.holo && !g.grade && !g.dmg) || null;
  const a = advice(c, plainG);
  const mine = S.copies.filter(cp => cp.cid === c.cid);
  const gs = groups("vault").filter(g => g.cid === c.cid);
  const maxAff = Math.floor(S.cash / buyPrice(c));
  const copyRows = gs.map(g => {
    const ga = advice(c, g), canGrade = !g.grade;
    return `<div class="copy-row">
      <div class="spread"><b>${g.qty} × ${esc(copyLabel(g.copies[0]))}</b>${adviceChip(ga)}</div>
      ${traitsHTML(g.copies[0])}
      <div class="muted" style="font-size:13px">Worth ${money(g.unit)} each · you paid ${money(g.avg)} · sells for ${money(copySell(g.copies[0]))}</div>
      <div class="row" style="gap:6px">
        <button class="btn sm primary" data-act="sellGroup" data-key="${g.key}" data-n="1">Sell 1</button>
        ${g.qty > 1 ? `<button class="btn sm" data-act="sellGroup" data-key="${g.key}" data-n="${g.qty}">Sell all ${g.qty}</button>` : ""}
        <button class="btn sm good" data-act="toAlbum" data-id="${g.copies[0].id}">${albumCopy(c.cid) ? "Swap into Collection" : "Add to Collection"}</button>
        ${canGrade ? `<button class="btn sm" data-act="grade" data-id="${g.copies[0].id}">Grade (${short(gradeFee(g.copies[0]))})</button>` : ""}
        <button class="btn sm ghost" data-act="inspectCopy" data-id="${g.copies[0].id}">Inspect</button>
        <button class="btn sm" data-act="safe" data-id="${g.copies[0].id}">Lock in safe</button>
      </div></div>`;
  }).join("");
  const elsewhere = mine.filter(cp => cp.place !== "vault").map(cp => `<div class="muted" style="font-size:13px">${cp.place === "safe" ? "Locked in safe box" : cp.place === "album" ? "★ In your Collection" : cp.place === "lab" ? `At the Grading Lab until day ${cp.until}` : `On loan until day ${cp.until}`}: ${esc(copyLabel(cp))}${cp.place === "safe" ? ` <button class="btn sm" data-act="unsafe" data-id="${cp.id}">Unlock</button>` : ""}</div>`).join("");
  const st = setStatus(c.fid);
  el.innerHTML = `<div class="detail">
    <div class="spread"><span class="label">${esc(f.name)} · card ${c.idx + 1} of 4</span><button class="btn sm sheet-close" data-act="closeSheet">Close</button></div>
    <div class="hero"><button style="all:unset" data-act="inspectMarket" title="Pick it up">${thumbHTML(c.cid, false, 0)}</button>
      <div class="stack" style="gap:6px"><h2>${esc(c.name)}</h2>
        <div class="row" style="gap:5px">${rarityChip(c.r)}<span class="tier ${f.tier}">${TIERS[f.tier].name}</span></div>
        <div class="bigprice">${money(c.price)}</div>
        <div class="row" style="gap:12px;font-size:13px"><span>today ${pctHTML(change(c, 1))}</span><span>week ${pctHTML(change(c, 7))}</span></div>
        <button class="btn sm" data-act="inspectMarket">Pick it up in 3D</button></div></div>
    <div class="spread"><div class="range">${[14, 30, 60].map(n => `<button class="fchip" data-act="range" data-n="${n}" aria-pressed="${UI.range === n}">${n}d</button>`).join("")}</div><span class="dim" style="font-size:12px">${plural(c.printed, "copy", "copies")} printed</span></div>
    <canvas class="chart" id="detailChart"></canvas>
    <div class="advice ${a[3]}"><b>${a[1]}</b><p>${a[2]}</p></div>
    <div class="copy-row"><div class="spread"><b>Showroom</b><span class="muted" style="font-size:13px">${c.stock ? `${c.stock} in stock · ${money(buyPrice(c))} each` : "Sold out until tomorrow"}</span></div>
      <div class="row" style="gap:6px">
        <button class="btn sm primary" data-act="buy" data-n="1" ${c.stock && maxAff >= 1 ? "" : "disabled"}>Buy 1</button>
        ${c.stock > 1 ? `<button class="btn sm" data-act="buy" data-n="${Math.min(c.stock, 5)}" ${maxAff >= 2 ? "" : "disabled"}>Buy ${Math.min(c.stock, 5)}</button>` : ""}
        ${c.stock > 1 && maxAff > 1 ? `<button class="btn sm ghost" data-act="buy" data-n="999">Buy max</button>` : ""}
      </div></div>
    ${copyRows ? `<div class="label">Your copies in the vault</div>${copyRows}` : ""}
    ${elsewhere}
    <div class="copy-row"><div class="spread"><b>${esc(f.name)} set</b><span class="chip ${st.complete ? "sell" : ""}">${st.have}/4 in Collection</span></div>
      <div class="muted" style="font-size:13px">${st.complete ? `Complete! Worth ${money0(st.value)} together.` : `All four together are worth ×${st.mult}.`}</div>
      <button class="btn sm" data-act="tab" data-tab="collection">Open Collection</button></div>
  </div>`;
  const avgRef = plainG ? plainG.avg : 0;
  requestAnimationFrame(() => drawChart($("#detailChart"), c.hist.slice(-UI.range - 1).concat([c.price]).slice(-(UI.range + 1)), { ref: avgRef || null }));
}

/* ---------------------------------------------------------------- render */
const VIEWS = { showroom: renderShowroom, vault: renderVault, collection: renderCollection, salon: renderSalon, auctions: renderAuctions,
  crates: renderCrates, jobs: renderJobs, upgrades: renderUpgrades };
function render() {
  if (!S || $("#game").hidden) return;
  renderHeader();
  const view = $("#view");
  const searchFocused = document.activeElement && document.activeElement.id === "search";
  const caret = searchFocused ? document.activeElement.selectionStart : 0;
  view.innerHTML = rarityGuide() + VIEWS[UI.tab]();
  hydratePanoramas(view);
  if (searchFocused) { const s = $("#search"); s.focus(); s.setSelectionRange(caret, caret); }
  renderDetail();
  hydrateThumbs(document);
  if (UI.tab === "jobs") requestAnimationFrame(() => drawRivalChart($("#rivalChart")));
}
function selectCard(cid) {
  UI.sel = cid;
  render();
  if (window.matchMedia("(max-width: 1080px)").matches) $("#detail").classList.add("open");
}
/* =====================================================================
   Part 6: modals, the inspector screen, the start screen, saving, and
   the click handlers that tie it all together.
   ===================================================================== */

/* ---------------------------------------------------------------- modals */
function openModal(html, opts = {}) {
  const back = document.createElement("div");
  back.className = "modal-back";
  back.innerHTML = `<div class="modal panel ${opts.wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
  $("#modals").append(back);
  UI.modalOpen = true;
  const close = () => {
    back.remove();
    UI.modalOpen = !!$("#modals").children.length;
    if (opts.onClose) opts.onClose();
    if (!UI.modalOpen) nextQueued();
  };
  back.addEventListener("click", e => { if (e.target === back && opts.dismiss !== false) close(); });
  back.closeModal = close;
  hydrateThumbs(back);
  return { el: back, close };
}
function closeTopModal() { const m = $("#modals").lastElementChild; if (m && m.closeModal) m.closeModal(); }
function queueModal(fn) { UI.queue.push(fn); if (!UI.modalOpen) nextQueued(); }
function nextQueued() { const fn = UI.queue.shift(); if (fn) fn(); }
function confirmModal(title, text, yes, onYes, danger) {
  const m = openModal(`<h2>${esc(title)}</h2><p class="muted" style="margin:0">${esc(text)}</p>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-m="no">Cancel</button><button class="btn ${danger ? "bad" : "primary"}" data-m="yes">${esc(yes)}</button></div>`);
  m.el.querySelector('[data-m="no"]').onclick = m.close;
  m.el.querySelector('[data-m="yes"]').onclick = () => { m.close(); onYes(); };
}
function newsHTML(lines) { return `<div class="news">${lines.map(l => `<div class="t-${l.k}">${esc(l.t)}</div>`).join("")}</div>`; }

function morningModal(r, news) {
  const delta = r.after - r.before;
  const m = openModal(`<div class="label">${esc(S.shop.name)} · morning report</div><h2>Day ${S.day}${isConvention() ? " · Convention Day" : ""}</h2>
    <div class="row" style="gap:16px"><div><div class="label">Net worth</div><b style="font-size:22px" class="num">${money0(r.after)}</b> <span class="${delta >= 0 ? "good" : "bad"} num">${delta >= 0 ? "+" : "-"}${money0(Math.abs(delta)).replace("-", "")}</span></div>
      ${r.tickets >= 1 ? `<div><div class="label">Gallery tickets</div><b style="font-size:22px" class="num good">+${money0(r.tickets)}</b></div>` : ""}
      <div><div class="label">Rival race</div><b style="font-size:22px">#${rivalPlace()} of ${S.rivals.length + 1}</b></div></div>
    ${S.tip ? `<div class="banner info">${esc(S.tip.text)}</div>` : ""}
    ${news.length ? newsHTML(news) : '<div class="muted">A quiet night. Prices moved a little.</div>'}
    <div class="row" style="justify-content:flex-end">${S.tip ? `<button class="btn" data-m="tip">Show me that card</button>` : ""}<button class="btn primary" data-m="ok">${S.mail ? "Read the mail" : "Open the shop"}</button></div>`);
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
  const tip = m.el.querySelector('[data-m="tip"]');
  if (tip) tip.onclick = () => { const cid = S.tip.cid; m.close(); UI.tab = "showroom"; selectCard(cid); };
}
function letterModal() {
  const L = S.mail;
  if (!L) return;
  const m = openModal(`<div class="letter"><div class="from">From: ${esc(L.from)}</div><h3>${esc(L.title)}</h3><p>${esc(L.body)}</p></div>
    <div class="row" style="justify-content:flex-end">${L.choices.map((ch, i) => `<button class="btn ${i === L.choices.length - 1 ? "ghost" : i === 0 ? "primary" : ""}" data-choice="${i}">${esc(ch)}</button>`).join("")}</div>`, { dismiss: false });
  m.el.querySelectorAll("[data-choice]").forEach(b => b.onclick = () => {
    let res;
    try { res = answerLetter(+b.dataset.choice); }
    catch (e) { if (e instanceof GameError) { toast(e.message, "bad"); return; } throw e; }
    m.close();
    FRESH.splice(0);
    render(); persist();
    if (res.copies && res.copies.length) queueModal(() => pullsModal("What was inside", res.copies, res.text));
    else toast(res.text, res.tone);
  });
}
function pullsModal(title, copies, subtitle, coverColor = "#d9b45a") {
  const best = Math.max(...copies.map(cp => S.cards[cp.cid].r));
  const m = openModal(`<h2>${esc(title)}</h2>${subtitle ? `<p class="muted" style="margin:0">${esc(subtitle)}</p>` : ""}
    <div class="reveal">${copies.map((cp, i) => {
      const c = S.cards[cp.cid];
      return `<div><div class="flipcard ${c.r >= 2 || cp.holo ? "rare" : ""}" data-i="${i}">
        <div class="side cover" style="background:linear-gradient(145deg, ${coverColor}, ${mix(coverColor, "#000000", 0.6)})">?</div>
        <div class="side face">${copyThumb(cp)}</div></div>
        <div class="pull-cap" data-cap="${i}" style="visibility:hidden"><b>${cp.holo ? "HOLO " : ""}${esc(c.name)}</b><br>${rarityChip(c.r)}${traitsHTML(cp)} <span class="num">${short(copyValue(cp))}</span></div></div>`;
    }).join("")}</div>
    <p class="muted" style="text-align:center;margin:0;font-size:13px" id="pullNote">Tap a card to flip it.</p>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-m="all">Flip all</button><button class="btn primary" data-m="ok">Done</button></div>`, { wide: true });
  const flip = i => {
    const el = m.el.querySelector(`.flipcard[data-i="${i}"]`);
    if (!el || el.classList.contains("open")) return;
    el.classList.add("open");
    m.el.querySelector(`[data-cap="${i}"]`).style.visibility = "visible";
    const cp = copies[i], c = S.cards[cp.cid];
    if (c.r >= 3 || (cp.holo && c.r >= 1)) m.el.querySelector("#pullNote").textContent = `WOW! A ${cp.holo ? "holo " : ""}${RARITIES[c.r].name}!`;
  };
  m.el.querySelectorAll(".flipcard").forEach(el => el.onclick = () => flip(+el.dataset.i));
  m.el.querySelector('[data-m="all"]').onclick = () => copies.forEach((_, i) => setTimeout(() => flip(i), i * 260));
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
  void best;
}
function gradeRevealModal(ids) {
  const cps = ids.map(copyById).filter(Boolean);
  if (!cps.length) return;
  const m = openModal(`<h2>Grading results</h2><p class="muted" style="margin:0">Vault Grading Co. sealed your cards in tamper-proof acrylic slabs.</p>
    <div class="reveal">${cps.map(cp => `<div style="width:170px;text-align:center">${copyThumb(cp)}
      <div style="margin-top:8px"><b style="font-size:30px;font-family:var(--display)" class="${cp.grade >= 9 ? "gold" : cp.grade >= 8 ? "good" : "muted"}">${cp.grade}</b><div class="label">${GRADES[cp.grade].label}</div>
      <div class="muted" style="font-size:13px">${esc(S.cards[cp.cid].name)}<br>now ${short(copyValue(cp))} (×${GRADES[cp.grade].mult})</div></div></div>`).join("")}</div>
    <div class="row" style="justify-content:flex-end"><button class="btn primary" data-m="ok">Lovely</button></div>`, { wide: true });
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
}
function consignModal(res) {
  const m = openModal(`<div class="label">Auction House · your consignment</div><h2>${esc(res.label)}</h2>
    <div class="spread"><div><div class="label">Current bid</div><div class="bigprice" id="cPrice">${money0(res.bids.length ? res.bids[0][1] : 0)}</div></div><div class="muted" style="text-align:right;font-size:13px">estimate ${money0(res.value)}<br>reserve ${money0(res.reserve)}</div></div>
    <div class="callout" id="cCall">The auctioneer opens the bidding...</div>
    <div class="bidlog" id="cLog"></div>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-m="skip">Skip to the end</button><button class="btn primary" data-m="ok" disabled>Done</button></div>`, { dismiss: false });
  let i = 0, timer = 0;
  const q = sel => m.el.querySelector(sel);
  const finish = () => {
    clearInterval(timer);
    q("#cLog").innerHTML = res.bids.slice().reverse().map(([w, p]) => `<div><span>${esc(w)}</span><b class="num">${money0(p)}</b></div>`).join("");
    q("#cPrice").textContent = money0(res.price);
    q("#cCall").innerHTML = res.sold ? `SOLD to ${esc(res.leader)}! <span class="good">You get ${money0(res.net)}</span>` : `<span class="muted">Bids stayed under the reserve. You keep it.</span>`;
    m.el.querySelector('[data-m="ok"]').disabled = false;
    m.el.querySelector('[data-m="skip"]').hidden = true;
  };
  timer = setInterval(() => {
    if (i >= res.bids.length) { q("#cCall").textContent = "Going once... going twice..."; setTimeout(finish, 900); clearInterval(timer); return; }
    const [w, p] = res.bids[i++];
    q("#cPrice").textContent = money0(p);
    q("#cCall").textContent = `${w} bids ${money0(p)}`;
    const row = document.createElement("div"); row.innerHTML = `<span>${esc(w)}</span><b class="num">${money0(p)}</b>`;
    q("#cLog").prepend(row);
  }, Math.max(140, Math.min(420, 4200 / Math.max(1, res.bids.length))));
  m.el.querySelector('[data-m="skip"]').onclick = finish;
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
}
function menuModal() {
  const m = openModal(`<h2>Menu</h2><div class="stack">
    <button class="btn block" data-m="ledger">Ledger (everything that happened)</button>
    <button class="btn block" data-m="help">How to play</button>
    <button class="btn block" data-m="save">Save code (back up or move your shop)</button>
    <button class="btn block bad" data-m="new">Open a new shop</button></div>
    <div class="muted" style="font-size:12.5px">Your shop saves automatically${DB ? " to your account" : " in this browser"}.</div>`);
  const on = (k, fn) => m.el.querySelector(`[data-m="${k}"]`).onclick = () => { m.close(); fn(); };
  on("ledger", ledgerModal); on("help", helpModal); on("save", saveCodeModal);
  on("new", () => confirmModal("Open a new shop?", `${S.shop.name} will be closed for good and its progress replaced by the new shop.`, "Start over", () => { S = null; showStart(null); }, true));
}
function ledgerModal() {
  const m = openModal(`<h2>Ledger</h2>${newsHTML(S.log.slice().reverse().map(l => ({ k: l.k, t: `Day ${l.d}: ${l.t}` })))}
    <div class="row" style="justify-content:flex-end"><button class="btn primary" data-m="ok">Close</button></div>`, { wide: true });
  m.el.querySelector(".news").style.maxHeight = "60vh";
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
}
const HELP = [
  ["The goal", `Grow your shop's net worth to ${short(GOAL)} and become the Vault Tycoon before the three rival shops do. Every rank you reach pays a cash bonus.`],
  ["Trading", "Every card trades like a stock. Its tag tells you what to do in plain words: BUY, SELL, HOLD or WAIT. Buy in the Showroom, sell from the Vault or to collectors in the Salon."],
  ["Your Collection", "Cards in the Collection tab are your personal gallery, kept apart from trading stock. Each franchise has four cards. Complete all four and the set is worth 1.35× to 1.8× its single cards, earns prestige, and visitors pay more to see your gallery."],
  ["Forgers", "Some sellers in the Salon are forgers. Pick up their card in 3D and check it: the serial on the back can't be higher than the print run, the seal on the back shimmers when tilted, the name on the back matches the front, the edges are gilded gold, and the foil frame flashes like metal. Call out a fake to earn a bounty."],
  ["The inspector", "Drag to turn the card in your hand, double-click to flip it, scroll or pinch to zoom, and move your pointer to move the studio light. With the UV Lamp upgrade, genuine cards glow with a hidden watermark."],
  ["Every morning", "Prices move, new franchises premiere, letters arrive with choices, commissions come in, and graded cards come back from the lab. Every seventh day is a Convention Day."],
];
function helpModal() {
  const m = openModal(`<h2>How to play</h2>${HELP.map(([h, t]) => `<div><b>${h}</b><p class="muted" style="margin:2px 0 0">${t}</p></div>`).join("")}
    <div class="row" style="justify-content:flex-end"><button class="btn primary" data-m="ok">Got it</button></div>`, { wide: true });
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
}
function encodeSave() { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function decodeSave(code) { return JSON.parse(decodeURIComponent(escape(atob(code.trim())))); }
function saveCodeModal() {
  const code = encodeSave();
  const m = openModal(`<h2>Save code</h2><p class="muted" style="margin:0">Copy this code somewhere safe. Paste it below on any device to load your shop.</p>
    <textarea class="input" rows="4" readonly id="saveOut" style="font-size:11px">${esc(code)}</textarea>
    <div class="row"><button class="btn" data-m="copy">Copy code</button><span class="muted" id="copied" style="font-size:13px"></span></div>
    <div class="label">Load a code</div><textarea class="input" rows="3" id="saveIn" placeholder="Paste a save code here" style="font-size:11px"></textarea>
    <div class="row" style="justify-content:flex-end"><button class="btn ghost" data-m="ok">Close</button><button class="btn primary" data-m="load">Load this shop</button></div>`, { wide: true });
  m.el.querySelector('[data-m="copy"]').onclick = async () => {
    const ta = $("#saveOut");
    try { await navigator.clipboard.writeText(code); $("#copied").textContent = "Copied!"; }
    catch (e) { ta.focus(); ta.select(); $("#copied").textContent = "Selected. Press Ctrl+C or Cmd+C to copy."; }
  };
  m.el.querySelector('[data-m="ok"]').onclick = m.close;
  m.el.querySelector('[data-m="load"]').onclick = () => {
    try { const data = decodeSave($("#saveIn").value); loadState(data); m.close(); enterGame(); toast(`Welcome back to ${S.shop.name}!`, "gold"); persist(); }
    catch (e) { toast("That code didn't work. Check that you copied all of it.", "bad"); }
  };
}
function checkEndings() {
  if (!S) return;
  if (S.won && !S.wonShown) {
    S.wonShown = true; persist();
    const first = S.rivals.every(r => r.worth < GOAL);
    queueModal(() => {
      const m = openModal(`<div class="label">${esc(S.shop.name)}</div><h2>Vault Tycoon!</h2>
        <p style="margin:0">${esc(S.shop.owner)}${S.shop.partners.length ? " and " + esc(S.shop.partners.map(p => p.name).join(", ")) : ""} built the finest luxury card vault in the city in ${S.day} days${first ? ", ahead of every rival" : ""}.</p>
        <p class="muted" style="margin:0">You can keep playing: finish every set, chase the last trophies, or open a new shop on a harder difficulty.</p>
        <div class="row" style="justify-content:flex-end"><button class="btn primary" data-m="ok">Keep playing</button></div>`);
      m.el.querySelector('[data-m="ok"]').onclick = m.close;
    });
  }
  if (S.over && !S.overShown) {
    S.overShown = true;
    queueModal(() => {
      const m = openModal(`<h2>The vault is empty</h2><p style="margin:0">${esc(S.shop.name)} has no cards left and not enough cash to buy one. Every tycoon has a first failure.</p>
        <div class="row" style="justify-content:flex-end"><button class="btn" data-m="ok">Look around</button><button class="btn primary" data-m="new">Open a new shop</button></div>`, { dismiss: false });
      m.el.querySelector('[data-m="ok"]').onclick = m.close;
      m.el.querySelector('[data-m="new"]').onclick = () => { m.close(); S = null; showStart(null); };
    });
  }
}

/* ---------------------------------------------------------------- the inspector screen */
function inspect(spec, opts = {}) {
  const c = S.cards[spec.cid];
  if (!c) return;
  noteInspect(spec.cid); settle();
  const box = $("#inspector");
  box.hidden = false;
  document.body.style.overflow = "hidden";
  $("#insName").textContent = c.name;
  const bits = [FR[c.fid].name, RARITIES[c.r].name];
  if (spec.holo) bits.push(`Holo ×${HOLO_MULT}`);
  if (spec.misprint) bits.push(`${spec.misprint} · value ×${MISPRINTS[spec.misprint]}`);
  if (spec.condition && !spec.grade) bits.push(`Uncertified · ${CONDITION_NAMES[spec.condition]} · lab verifies condition`);
  if (spec.grade) bits.push(`${GRADES[spec.grade].label} ${spec.grade}`);
  if (spec.serial) bits.push(serialText(spec.serial, c.printed));
  $("#insSub").textContent = bits.join(" · ");
  const uvBtn = $("#insUVBtn");
  uvBtn.disabled = !S.up.uv; uvBtn.title = S.up.uv ? "Switch the UV lamp on or off" : "Buy the UV Inspection Lamp in Upgrades";
  uvBtn.textContent = S.up.uv ? "UV lamp" : "UV lamp (upgrade)";
  uvBtn.setAttribute("aria-pressed", "false");
  const check = $("#insCheck"), acts = $("#insActions");
  check.hidden = !opts.seller; acts.innerHTML = "";
  box.classList.toggle("with-check", !!opts.seller);
  if (opts.seller) {
    const cu = opts.seller;
    check.innerHTML = `<b>Is it genuine?</b><div class="muted" style="font-size:12.5px">${esc(cu.name)} wants ${money0(cu.price)}. A real card passes every check:</div>
      <ul>${TELL_KEYS.map(k => `<li><b>${TELLS[k].name}</b>${esc(TELLS[k].hint)}</li>`).join("")}</ul>
      ${cu.hint && cu.hint !== "clean" ? `<div class="hint warnish">${esc(roleName("appraiser"))}: "${esc(TELLS[cu.hint].hint)}"</div>` : ""}
      ${S.up.uv ? '<div class="muted" style="font-size:12.5px">Your UV lamp: genuine cards show a glowing watermark.</div>' : ""}`;
    if (cu.state === "open") acts.innerHTML = `<button class="btn primary" data-act="insBuy" data-id="${cu.id}" ${cu.price > S.cash ? "disabled" : ""}>Buy for ${money0(cu.price)}</button>
      <button class="btn bad" data-act="insAccuse" data-id="${cu.id}">Call it a fake</button>`;
  }
  Inspector.open(box, spec, () => { box.hidden = true; document.body.style.overflow = ""; });
  render();
  flushFresh();
}
function closeInspector() { if (!$("#inspector").hidden) { Inspector.close(); render(); persist(); } }

/* ---------------------------------------------------------------- start screen */
function startFormHTML() {
  const s = UI.setup;
  const used = new Set(s.partners.map(p => p.role));
  const partnerRows = s.partners.map((p, i) => `<div class="partner">
      <input class="input" data-pname="${i}" maxlength="24" placeholder="Co-owner name" value="${esc(p.name)}" aria-label="Co-owner name">
      <select class="input" data-prole="${i}" aria-label="Role">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${p.role === k ? "selected" : ""} ${used.has(k) && p.role !== k ? "disabled" : ""}>${r.name}</option>`).join("")}</select>
      <button class="btn sm ghost" data-act="rmPartner" data-i="${i}" aria-label="Remove">Remove</button>
      <div class="partner-note">${ROLES[p.role].desc}</div></div>`).join("");
  return `<div class="field"><label for="fShop">Shop name</label><input class="input" id="fShop" maxlength="32" placeholder="The Gilded Vault" value="${esc(s.shop)}"></div>
    <div class="field"><label for="fOwner">Your name</label><input class="input" id="fOwner" maxlength="24" placeholder="Your name" value="${esc(s.owner)}"></div>
    <div class="field"><span class="label">Co-owners (optional, up to 3)</span>${partnerRows}
      ${s.partners.length < 3 ? `<button class="btn sm" data-act="addPartner" style="justify-self:start">+ Add a co-owner</button>` : ""}
      <div class="dim" style="font-size:12.5px">Each co-owner brings a skill to the shop.</div></div>
    <div class="field"><span class="label">Difficulty</span><div class="choices">${Object.entries(DIFFICULTIES).map(([k, d]) => `<button class="choice" data-act="setDiff" data-k="${k}" aria-pressed="${s.diff === k}"><b>${d.name}</b><small>${d.blurb} Start with ${money0(d.cash)}.</small></button>`).join("")}</div></div>
    <div class="field"><span class="label">Shop colors</span><div class="swatches">${Object.entries(SHOP_COLORS).map(([k, c]) => `<button class="swatch" data-act="setColor" data-k="${k}" aria-pressed="${s.color === k}" aria-label="${c.name}" title="${c.name}" style="background:radial-gradient(circle at 35% 30%, #fff8, ${c.accent} 45%, ${c.soft})"></button>`).join("")}</div></div>
    <button class="btn primary block" data-act="openShop" ${UI.cloudChecked ? "" : "disabled"} style="padding:12px">${UI.cloudChecked ? "Open the doors" : "Checking for a saved shop..."}</button>`;
}
function showStart(saved) {
  clearInterval(UI.aucTimer); UI.auc = null;
  $("#game").hidden = true; $("#inspector").hidden = true; $("#modals").innerHTML = ""; UI.modalOpen = false; UI.queue = [];
  const st = $("#start"); st.hidden = false;
  UI.saved = saved;
  // a preview market just to print the three cards on the cover
  const keep = S;
  if (!S) { newGame({ shop: "Preview", owner: "", partners: [], diff: "classic", color: "gold" }); FRESH = []; }
  THUMBS.clear();
  const fan = ["drago-0", "celestial-0", "solar-1"].map(cid => `<img src="${thumbURL(cid, cid === "celestial-0", 0)}" alt="">`).join("");
  THUMBS.clear();
  if (!keep) S = null;
  if (saved) S = null;
  const cont = saved ? `<section class="panel continue"><div class="label">Welcome back</div><h2 style="font-size:24px">${esc(saved.shop.name)}</h2>
      <div class="muted">${esc(saved.shop.owner)}${saved.shop.partners.length ? " & " + esc(saved.shop.partners.map(p => p.name).join(", ")) : ""} · day ${saved.day} · best net worth ${short(saved.best)}</div>
      <button class="btn primary" data-act="continue">Continue</button></section>` : "";
  st.innerHTML = `<div class="start-card">
      <div class="start-hero"><h1>Card Shop Tycoon 3<span>THE COLLECTOR'S VAULT</span></h1>
        <div class="fan">${fan}</div>
        <p>Open your own luxury card shop. Trade cards like stocks, collect complete franchise sets for your private gallery, catch forgers by turning their cards in your hands, and race three rival shops to become the Vault Tycoon.</p></div>
      <div class="stack">${cont}<section class="panel form" id="startForm">${startFormHTML()}</section></div></div>`;
  wireStartInputs();
}
function wireStartInputs() {
  const s = UI.setup;
  const shop = $("#fShop"), owner = $("#fOwner");
  if (shop) shop.oninput = () => { s.shop = shop.value; };
  if (owner) owner.oninput = () => { s.owner = owner.value; };
  document.querySelectorAll("[data-pname]").forEach(el => el.oninput = () => { s.partners[+el.dataset.pname].name = el.value; });
  document.querySelectorAll("[data-prole]").forEach(el => el.onchange = () => { s.partners[+el.dataset.prole].role = el.value; refreshForm(); });
}
function refreshForm() { const f = $("#startForm"); if (f) { f.innerHTML = startFormHTML(); wireStartInputs(); } }
function enterGame() {
  THUMBS.clear();
  $("#start").hidden = true; $("#game").hidden = false;
  UI.sel = null; UI.tab = "showroom"; UI.filter = "all"; UI.search = "";
  render();
  window.scrollTo(0, 0);
}

/* ---------------------------------------------------------------- saving */
const LS_KEY = "card-shop-tycoon-3";
let DB = null, UID = null, saveTimer = 0, saving = false, dirty = false;
function persist() { if (!S) return; dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 1200); }
async function flushSave() {
  if (!S || !dirty) return;
  dirty = false;
  S.savedAt = Date.now();
  let json = JSON.stringify(S);
  if (json.length > 230000) {
    S.log = S.log.slice(-40);
    for (const c of allCards()) c.hist = c.hist.slice(-30);
    json = JSON.stringify(S);
  }
  try { localStorage.setItem(LS_KEY, json); } catch (e) { /* storage may be blocked */ }
  if (!DB || !UID) return;
  if (saving) { dirty = true; return; }
  saving = true;
  try { await DB.doc(`data/users/${UID}/save`).set({ game: json, savedAt: S.savedAt, shop: S.shop.name, day: S.day }); }
  catch (e) { console.warn("Cloud save failed", e && e.code); }
  finally { saving = false; if (dirty) persist(); }
}
function readLocal() {
  try { const raw = localStorage.getItem(LS_KEY); if (!raw) return null; const d = JSON.parse(raw); return d && d.v === SAVE_VERSION ? d : null; }
  catch (e) { return null; }
}
async function initCloud() {
  try {
    if (!window.claude || typeof window.claude.use !== "function") return null;
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) return null;
    const id = await user.id();
    if (!id) return null;
    DB = db; UID = id;
    const snap = await db.doc(`data/users/${id}/save`).get();
    if (snap.exists) { const d = snap.data(); const g = JSON.parse(d.game); return g && g.v === SAVE_VERSION ? g : null; }
  } catch (e) { console.warn("Cloud saves unavailable", e && (e.code || e.message)); }
  return null;
}

/* ---------------------------------------------------------------- click handlers */
const custById = id => S.customers.find(c => c.id === +id);
const ACTIONS = {
  tab: d => { UI.tab = d.tab; $("#detail").classList.remove("open"); render(); window.scrollTo({ top: 0, behavior: "smooth" }); },
  select: d => selectCard(d.cid),
  closeSheet: () => $("#detail").classList.remove("open"),
  filter: d => { UI.filter = d.f; render(); },
  range: d => { UI.range = +d.n; renderDetail(); },
  nextDay: () => {
    if (UI.auc && UI.auc.live) { toast("The auction is still running. Let the hammer fall first.", "bad"); return; }
    if (S.mail) { letterModal(); return; }
    FRESH.splice(0);
    const r = nextDay();
    const news = FRESH.splice(0);
    UI.sel = UI.sel && S.cards[UI.sel] ? UI.sel : null;
    render(); persist();
    queueModal(() => morningModal(r, news));
    if (S.mail) queueModal(letterModal);
    if (S.reveals.length) { const ids = S.reveals.splice(0); queueModal(() => gradeRevealModal(ids)); }
    checkEndings();
  },
  menu: () => menuModal(),
  buy: d => run(() => { const r = buy(UI.sel, +d.n); toast(`Bought ${r.got} × ${S.cards[UI.sel].name} for ${money(r.spent)}.`, "good"); }),
  sellGroup: d => run(() => { const r = sellGroup(d.key, +d.n); toast(`Sold ${r.qty} for ${money(r.earned)} (${profitText(r.profit)}).`, r.profit >= 0 ? "good" : "bad"); }),
  sellAdvised: () => run(() => { const r = sellAdvised(); toast(`Sold ${r.qty} cards for ${money(r.earned)} (${profitText(r.profit)}).`, r.profit >= 0 ? "good" : "bad"); }),
  toAlbum: d => run(() => toAlbum(+d.id)),
  fromAlbum: d => run(() => fromAlbum(d.cid)),
  grade: d => run(() => sendToLab(+d.id)),
  safe: d => run(() => moveToSafe(+d.id)),
  unsafe: d => run(() => fromSafe(+d.id)),
  toggleSafe: () => { UI.safeOpen = !UI.safeOpen; render(); },
  deal: d => run(() => deal(custById(d.id))),
  flip: d => run(() => flip(custById(d.id))),
  flipSet: d => run(() => flipSet(custById(d.id))),
  haggle: d => run(() => { const cu = custById(d.id); const ok = haggle(cu); if (ok) toast(`${cu.name} agreed: ${money(cu.price)}.`, "good"); }),
  accuse: d => run(() => accuse(custById(d.id))),
  pass: d => run(() => passCustomer(custById(d.id))),
  inspectSeller: d => { const cu = custById(d.id); inspect({ cid: cu.cid, holo: cu.holo, grade: cu.grade, condition: cu.condition, misprint: cu.misprint, serial: cu.serial, tell: cu.tell }, { seller: cu }); },
  insBuy: d => { closeInspector(); ACTIONS.deal(d); },
  insAccuse: d => { closeInspector(); ACTIONS.accuse(d); },
  inspectMarket: () => { const c = S.cards[UI.sel]; inspect({ cid: c.cid, holo: false, grade: 0, condition: 8, misprint: "", serial: rint(1, c.printed), tell: "" }); },
  inspectCopy: d => { const cp = copyById(+d.id); if (cp) inspect({ cid: cp.cid, holo: cp.holo, grade: cp.grade, condition: physicalCondition(cp), misprint: cp.misprint, serial: cp.serial, tell: "" }); },
  inspectLot: () => { const l = S.lot; if (l && l.kind === "card") inspect({ cid: l.cid, holo: l.holo, grade: l.grade, condition: l.condition, misprint: l.misprint, serial: l.serial, tell: "" }); },
  insClose: () => closeInspector(),
  insFlip: () => Inspector.flip(),
  insEdge: () => Inspector.edgeView(),
  insReset: () => Inspector.reset(),
  insUV: (d, el) => { const on = Inspector.toggleUV(); el.setAttribute("aria-pressed", on); },
  aucStart: () => aucStart(),
  aucBid: () => aucBid(),
  consign: d => { const res = run(() => consign(+d.id)); if (res) queueModal(() => consignModal(res)); },
  consignSet: d => confirmModal("Sell the whole set?", `All four ${FR[d.fid].name} cards leave your Collection if the bids reach the reserve.`, "Put it under the hammer", () => {
    const res = run(() => consignSet(d.fid)); if (res) queueModal(() => consignModal(res));
  }),
  openCrate: d => { const r = run(() => openCrate(+d.i)); if (r) queueModal(() => pullsModal(`Opening a ${r.name}`, r.copies, `Paid ${money0(r.cost)}`, CRATES[+d.i].color)); },
  openBooster: d => { const r = run(() => openBooster(d.fid)); if (r) queueModal(() => pullsModal(`Opening a ${r.name}`, r.copies, `Paid ${money0(r.cost)}`, FR[d.fid].glow)); },
  deliver: d => run(() => { const q = S.quests.find(x => x.id === +d.id); deliver(q); }),
  upgrade: d => run(() => buyUpgrade(d.id)),
  addPartner: () => { const used = new Set(UI.setup.partners.map(p => p.role)); const role = Object.keys(ROLES).find(k => !used.has(k)); UI.setup.partners.push({ name: "", role }); refreshForm(); },
  rmPartner: d => { UI.setup.partners.splice(+d.i, 1); refreshForm(); },
  setDiff: d => { UI.setup.diff = d.k; refreshForm(); },
  setColor: d => { UI.setup.color = d.k; document.documentElement.style.setProperty("--accent", SHOP_COLORS[d.k].accent); document.documentElement.style.setProperty("--accent-soft", SHOP_COLORS[d.k].soft); refreshForm(); },
  openShop: () => {
    const s = UI.setup;
    const go = () => {
      const partners = s.partners.map((p, i) => ({ name: (p.name || "").trim() || ["Mia", "Theo", "Ren"][i], role: p.role }));
      newGame({ shop: (s.shop || "").trim() || "The Gilded Vault", owner: (s.owner || "").trim() || "The Owner", partners, diff: s.diff, color: s.color });
      enterGame(); persist();
      queueModal(() => {
        const m = openModal(`<div class="label">Grand opening</div><h2>Welcome to ${esc(S.shop.name)}</h2>
          <p style="margin:0">Your great aunt left you her luxury vault, two Legendary cards and ${money0(S.cash)}. Three rival shops already have a head start.</p>
          ${HELP.slice(1, 4).map(([h, t]) => `<div><b>${h}</b><p class="muted" style="margin:2px 0 0">${t}</p></div>`).join("")}
          <div class="row" style="justify-content:flex-end"><button class="btn primary" data-m="ok">Open the doors</button></div>`, { wide: true });
        m.el.querySelector('[data-m="ok"]').onclick = m.close;
      });
    };
    if (UI.saved) confirmModal("Replace your saved shop?", `Opening a new shop replaces ${UI.saved.shop.name} (day ${UI.saved.day}).`, "Open the new shop", go, true);
    else go();
  },
  continue: () => { try { loadState(UI.saved); enterGame(); flushFresh(); toast(`Welcome back to ${S.shop.name}, ${S.shop.owner}!`, "gold"); if (S.mail) queueModal(letterModal); } catch (e) { toast("That save couldn't be loaded.", "bad"); } },
};
let draggingCopy = null, touchCardDrag = null;
function clearCardDrop() {
  document.querySelectorAll(".drop-active, .card-dragging").forEach(el => el.classList.remove("drop-active", "card-dragging"));
  draggingCopy = null;
}
function dropCopy(id, destination) {
  clearCardDrop();
  run(() => {
    if (destination === "lab") sendToLab(id);
    else if (destination === "safe") { moveToSafe(id); UI.safeOpen = true; }
    else if (destination === "vault") fromSafe(id);
  });
}
document.addEventListener("dragstart", e => {
  const tile = e.target.closest("[data-copy-id]");
  if (!tile) return;
  draggingCopy = +tile.dataset.copyId;
  e.dataTransfer.setData("text/x-card-copy", String(draggingCopy));
  e.dataTransfer.effectAllowed = "move";
  tile.classList.add("card-dragging");
});
document.addEventListener("dragover", e => {
  const zone = e.target.closest("[data-drop]");
  if (!zone || draggingCopy == null) return;
  e.preventDefault(); e.dataTransfer.dropEffect = "move";
  document.querySelectorAll(".drop-active").forEach(el => el.classList.remove("drop-active"));
  zone.classList.add("drop-active");
});
document.addEventListener("dragleave", e => {
  const zone = e.target.closest("[data-drop]");
  if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("drop-active");
});
document.addEventListener("drop", e => {
  const zone = e.target.closest("[data-drop]");
  if (!zone || draggingCopy == null) return;
  e.preventDefault(); dropCopy(draggingCopy, zone.dataset.drop);
});
document.addEventListener("dragend", clearCardDrop);
document.addEventListener("pointerdown", e => {
  const handle = e.target.closest(".drag-handle");
  if (!handle || e.pointerType === "mouse") return;
  e.preventDefault();
  const tile = handle.closest("[data-copy-id]");
  touchCardDrag = { pointer: e.pointerId, id: +tile.dataset.copyId, x: e.clientX, y: e.clientY, moved: false };
  tile.classList.add("card-dragging"); handle.setPointerCapture(e.pointerId);
});
document.addEventListener("pointermove", e => {
  if (!touchCardDrag || e.pointerId !== touchCardDrag.pointer) return;
  touchCardDrag.moved ||= Math.hypot(e.clientX-touchCardDrag.x, e.clientY-touchCardDrag.y) > 10;
  document.querySelectorAll(".drop-active").forEach(el => el.classList.remove("drop-active"));
  if (!touchCardDrag.moved) return;
  const zone = document.elementFromPoint(e.clientX,e.clientY)?.closest("[data-drop]");
  if (zone) zone.classList.add("drop-active");
  // Keep the stations reachable while moving a card through a long vault.
  if (e.clientY < 80) window.scrollBy(0,-24);
  else if (e.clientY > innerHeight-80) window.scrollBy(0,24);
});
document.addEventListener("pointerup", e => {
  if (!touchCardDrag || e.pointerId !== touchCardDrag.pointer) return;
  const drag = touchCardDrag; touchCardDrag = null;
  const zone = document.elementFromPoint(e.clientX,e.clientY)?.closest("[data-drop]");
  if (zone && drag.moved) dropCopy(drag.id, zone.dataset.drop); else clearCardDrop();
});
document.addEventListener("pointercancel", () => { touchCardDrag = null; clearCardDrop(); });

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) fn(el.dataset, el, e);
});
document.addEventListener("input", e => {
  if (e.target.id === "search") { UI.search = e.target.value; render(); }
});
document.addEventListener("change", e => { if (e.target.id === "sort") { UI.sort = e.target.value; render(); } });
document.addEventListener("keydown", e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""));
  if (!$("#inspector").hidden) {
    if (e.key === "Escape") closeInspector();
    else if (e.key === "f" || e.key === "F") Inspector.flip();
    else if (e.key === "r" || e.key === "R") Inspector.reset();
    else if (e.key === "ArrowLeft") Inspector.nudge(-2.5, 0);
    else if (e.key === "ArrowRight") Inspector.nudge(2.5, 0);
    else if (e.key === "ArrowUp") Inspector.nudge(0, -2);
    else if (e.key === "ArrowDown") Inspector.nudge(0, 2);
    return;
  }
  if (e.key === "Escape") { if (UI.modalOpen) closeTopModal(); else $("#detail").classList.remove("open"); return; }
  if (typing || UI.modalOpen || !S || $("#game").hidden) return;
  if (e.key === "n" || e.key === "N") ACTIONS.nextDay();
});
document.addEventListener("visibilitychange", () => { if (document.hidden && dirty) flushSave(); });
let resizeT = 0;
window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (S && !$("#game").hidden) render(); }, 150); });

/* ---------------------------------------------------------------- boot */
async function boot() {
  const fontWait = Promise.all([
    document.fonts ? document.fonts.load('700 40px "Cinzel"') : null,
    document.fonts ? document.fonts.load('600 20px "Figtree"') : null,
    document.fonts ? document.fonts.load('800 20px "Figtree"') : null,
  ]).catch(() => null);
  await Promise.race([fontWait, new Promise(r => setTimeout(r, 2500))]);
  const local = readLocal();
  UI.cloudChecked = false;
  showStart(local);
  const cloudWait = initCloud();
  const cloud = await Promise.race([cloudWait, new Promise(r => setTimeout(() => r("timeout"), 6000))]);
  UI.cloudChecked = true;
  if (!$("#start").hidden) {
    if (cloud && cloud !== "timeout" && (!local || (cloud.savedAt || 0) > (local.savedAt || 0))) showStart(cloud);
    else refreshForm();
  }
}
window.CST = { get S() { return S; }, UI, ACTIONS, Inspector, render };
boot();
