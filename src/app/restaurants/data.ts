export type MenuItem = { name: string; desc: string; price: string };
export type MenuSection = { category: string; icon: string; items: MenuItem[] };
export type Restaurant = {
  slug: string;
  name: string;
  tagline: string;
  sub: string;
  location: string;
  phone: string;
  email: string;
  instagram: string;
  heroQuote: string;
  heroQuoteSource: string;
  about: string[];
  highlights: { icon: string; title: string; desc: string }[];
  menu: MenuSection[];
  atmosphere: { icon: string; label: string }[];
  colors: { bg: string; mid: string; accent: string; text: string };
  anchor: string;
};

const RESTAURANTS: Restaurant[] = [
  {
    slug: "hafeni",
    name: "Hafeni Traditional Restaurant",
    tagline: "Restaurant & Cultural Experience",
    sub: "MONDESA TOWNSHIP, SWAKOPMUND",
    location: "Mondesa Township, Swakopmund, Namibia",
    phone: "+264 81 XXX XXXX",
    email: "hafeni@gmail.com",
    instagram: "@hafenitradition",
    heroQuote: "The most authentic taste of Namibia you'll find anywhere in the country.",
    heroQuoteSource: "TRAVEL BLOG REVIEW",
    about: [
      "Tucked into the heart of Mondesa Township, Hafeni is where Swakopmund locals eat. Not the tourists — the people who grew up here, whose grandmothers cooked these dishes.",
      "The menu is a love letter to Namibian food culture: oshifima, kapana, mopane worms, and slow-braised game. Every dish tells a story. Every table shares one.",
    ],
    highlights: [
      { icon: "🌍", title: "Authentic Namibian", desc: "Traditional dishes from across Namibia's many cultures — Owambo, Herero, Nama, and more." },
      { icon: "🏘️", title: "Township Heart", desc: "Situated in Mondesa, the beating cultural heart of Swakopmund. Real food, real people." },
      { icon: "🍖", title: "Kapana & Braai", desc: "Open-fire grilling the Namibian way. Come hungry." },
      { icon: "🎶", title: "Live Culture", desc: "Traditional music and cultural experiences available for groups on request." },
    ],
    menu: [
      {
        category: "Starters", icon: "🥣",
        items: [
          { name: "Mopane Worm Starter", desc: "Dried mopane worms, peri-peri oil, fresh bread", price: "N$55" },
          { name: "Oshithima Soup", desc: "Creamy pap broth with wild herbs", price: "N$45" },
          { name: "Kapana Bites", desc: "Spiced street-style beef, tomato relish", price: "N$65" },
        ],
      },
      {
        category: "Traditional Mains", icon: "🍲",
        items: [
          { name: "Oshifima & Ombidi", desc: "Stiff pap with wild spinach and dried fish", price: "N$120" },
          { name: "Oxtail Potjie", desc: "Slow-cooked 6 hours, pap, pickled onions", price: "N$165" },
          { name: "Oryx Stew", desc: "Game meat braised with Namibian spices, rice", price: "N$180" },
        ],
      },
      {
        category: "Braai & Grill", icon: "🔥",
        items: [
          { name: "Kapana Platter", desc: "Mixed cuts grilled open-fire, chakalaka, bread", price: "N$145" },
          { name: "Lamb Chops", desc: "Karoo-style, chimichurri, sweet potato", price: "N$175" },
          { name: "Boerewors", desc: "Traditional sausage, pap, tomato gravy", price: "N$130" },
        ],
      },
      {
        category: "Drinks", icon: "🍺",
        items: [
          { name: "Namibian Craft Beer", desc: "Local brewery selections on rotation", price: "N$40" },
          { name: "Maheu", desc: "Traditional fermented maize drink, chilled", price: "N$25" },
          { name: "Rooibos Iced Tea", desc: "House-brewed, honey & lemon", price: "N$30" },
        ],
      },
    ],
    atmosphere: [["🔥", "Open Fire Braai"], ["🎶", "Live Music"], ["🏘️", "Township Tour"], ["👨‍👩‍👧", "Family Tables"]].map(([i, l]) => ({ icon: i as string, label: l as string })),
    colors: { bg: "#2d1810", mid: "#4a2218", accent: "#c2610f", text: "#f5e6d3" },
    anchor: "🍲",
  },
  {
    slug: "tiger-reef",
    name: "Tiger Reef",
    tagline: "Beach Bar & Grill",
    sub: "ATLANTIC BEACHFRONT, SWAKOPMUND",
    location: "Atlantic Beachfront, Swakopmund, Namibia",
    phone: "+264 64 XXX XXXX",
    email: "info@tigerreef.com",
    instagram: "@tigerreefswakopmund",
    heroQuote: "The best sundowner spot in Namibia. Full stop.",
    heroQuoteSource: "VISITOR REVIEW",
    about: [
      "Tiger Reef sits right where Swakopmund's beach ends and the Atlantic begins. It's loud, casual, salty, and exactly what you want after a morning of quad biking in the dunes.",
      "Fresh fish, cold beer, and a view that justifies the drive. We don't take ourselves too seriously — the ocean does enough of that.",
    ],
    highlights: [
      { icon: "🌊", title: "Beachfront Location", desc: "Literally on the beach. Sand between your toes optional but encouraged." },
      { icon: "🐟", title: "Fresh Catch Daily", desc: "Whatever came off the boat this morning is on the board tonight." },
      { icon: "🍺", title: "Cold Draught", desc: "Windhoek Lager on tap, ice-cold, all day every day." },
      { icon: "🌅", title: "Best Sundowners", desc: "Namibia's sunsets are famous. We've got the best seat in the house." },
    ],
    menu: [
      {
        category: "Beach Bites", icon: "🌮",
        items: [
          { name: "Calamari Rings", desc: "Lightly fried, sweet chilli, lemon wedge", price: "N$95" },
          { name: "Fish Tacos", desc: "Atlantic catch, slaw, avocado, sriracha mayo", price: "N$110" },
          { name: "Prawn Skewers", desc: "Garlic butter, fresh herbs, side salad", price: "N$135" },
        ],
      },
      {
        category: "Mains", icon: "🐠",
        items: [
          { name: "Catch of the Day", desc: "Grilled or battered, chips, house salad", price: "N$185" },
          { name: "Tiger Reef Burger", desc: "200g beef, bacon, cheddar, pickles, fries", price: "N$155" },
          { name: "Seafood Basket", desc: "Fish, calamari, prawns, chips, tartare sauce", price: "N$220" },
        ],
      },
      {
        category: "From the Grill", icon: "🥩",
        items: [
          { name: "Beef Rib", desc: "Slow-smoked, BBQ glaze, coleslaw, chips", price: "N$245" },
          { name: "Grilled Chicken", desc: "Peri-peri marinade, corn, sweet potato fries", price: "N$160" },
          { name: "Mixed Grill", desc: "Beef, chicken, boerewors, lamb chop, sides", price: "N$295" },
        ],
      },
      {
        category: "Drinks", icon: "🍺",
        items: [
          { name: "Windhoek Lager (draft)", desc: "Ice cold, 500ml", price: "N$45" },
          { name: "Sundowner Cocktail", desc: "House special, ask your bartender", price: "N$85" },
          { name: "Soft Drinks & Juice", desc: "Full range available", price: "from N$25" },
        ],
      },
    ],
    atmosphere: [["🏄", "Surf Crowd"], ["🌊", "Beachfront"], ["🌅", "Sundowners"], ["🎵", "Live Music Weekends"]].map(([i, l]) => ({ icon: i as string, label: l as string })),
    colors: { bg: "#0a2540", mid: "#0e3d6e", accent: "#00b4d8", text: "#e0f4ff" },
    anchor: "🐠",
  },
  {
    slug: "kuckis-pub",
    name: "Kücki's Pub",
    tagline: "German Pub & Kitchen",
    sub: "SWAKOPMUND TOWN CENTRE",
    location: "Town Centre, Swakopmund, Namibia",
    phone: "+264 64 XXX XXXX",
    email: "kuckis@iway.na",
    instagram: "@kuckispub",
    heroQuote: "A Swakopmund institution. Cold beer, hot schnitzel, no complaints.",
    heroQuoteSource: "TRIPADVISOR",
    about: [
      "Kücki's Pub has been a Swakopmund institution for decades. It's the kind of place where everyone knows your order by your third visit — and you'll definitely be back for a third visit.",
      "Classic German pub fare meets Namibian hospitality. Schnitzel the size of your forearm, beer kept at exactly the right temperature, and a bar that's seen more stories than it could ever tell.",
    ],
    highlights: [
      { icon: "🍺", title: "German Beer Culture", desc: "Imported German draught and bottled selections alongside Namibia's finest lagers." },
      { icon: "🥩", title: "Schnitzel & More", desc: "Crispy, generous, and served the way your German grandmother would approve of." },
      { icon: "🏠", title: "Local Institution", desc: "Decades in Swakopmund. Ask any local where to eat — they'll say Kücki's." },
      { icon: "🌿", title: "Beer Garden", desc: "Outdoor seating for Namibia's perfect weather. Sun, beer, good company." },
    ],
    menu: [
      {
        category: "Starters", icon: "🥗",
        items: [
          { name: "Pretzel & Dip", desc: "Warm Bavarian pretzel, beer mustard, butter", price: "N$65" },
          { name: "Soup of the Day", desc: "Ask your server — changes daily", price: "N$55" },
          { name: "Smoked Salmon", desc: "Capers, red onion, cream cheese, rye bread", price: "N$110" },
        ],
      },
      {
        category: "German Classics", icon: "🥩",
        items: [
          { name: "Wiener Schnitzel", desc: "Veal, breadcrumbed, lemon, cranberry, spätzle", price: "N$195" },
          { name: "Jäger Schnitzel", desc: "Pork, mushroom cream sauce, chips or rice", price: "N$185" },
          { name: "Bratwurst Platter", desc: "Two sausages, sauerkraut, mustard, rye bread", price: "N$165" },
        ],
      },
      {
        category: "Pub Favourites", icon: "🍔",
        items: [
          { name: "Kücki's Burger", desc: "250g beef, bacon, egg, cheddar, chips", price: "N$170" },
          { name: "Fish & Chips", desc: "Atlantic fish, beer batter, chips, tartare", price: "N$160" },
          { name: "Chicken Schnitzel", desc: "Free-range, garlic butter, seasonal veg", price: "N$175" },
        ],
      },
      {
        category: "On Tap", icon: "🍺",
        items: [
          { name: "Windhoek Lager", desc: "500ml, ice cold", price: "N$45" },
          { name: "Paulaner Weissbier", desc: "German wheat beer, 500ml", price: "N$85" },
          { name: "House Wine", desc: "Red or white, glass or bottle", price: "from N$55" },
        ],
      },
    ],
    atmosphere: [["🍺", "German Draught"], ["☀️", "Beer Garden"], ["🎸", "Live Music"], ["🏠", "Local Favourite"]].map(([i, l]) => ({ icon: i as string, label: l as string })),
    colors: { bg: "#1a0f00", mid: "#2d1a00", accent: "#c47b0a", text: "#fef3e2" },
    anchor: "🍺",
  },
  {
    slug: "farmhouse-deli",
    name: "Farmhouse Deli",
    tagline: "Café & Artisan Deli",
    sub: "THE MOLE, SWAKOPMUND",
    location: "The Mole, Swakopmund, Namibia",
    phone: "+264 64 XXX XXXX",
    email: "hello@farmhousedeli.na",
    instagram: "@farmhousedeliswakop",
    heroQuote: "Best coffee in Namibia, best view in Swakopmund. Pick a table by the window.",
    heroQuoteSource: "EVENDO REVIEW",
    about: [
      "The Farmhouse Deli sits right on the Mole with the Atlantic stretching out in front of you. It's the kind of place you come for breakfast and somehow end up staying for lunch.",
      "Everything here is made properly: fresh-baked bread, house-cured meats, locally sourced produce. The coffee is serious. The pastries are worth getting up early for.",
    ],
    highlights: [
      { icon: "☕", title: "Serious Coffee", desc: "Single-origin espresso, AeroPress, cold brew — proper coffee for people who care." },
      { icon: "🌊", title: "Ocean Views", desc: "Floor-to-ceiling windows overlooking the Atlantic from the Mole. There isn't a bad seat." },
      { icon: "🥖", title: "Artisan Bakery", desc: "Sourdough, rye, focaccia — all baked on site every morning before you wake up." },
      { icon: "🧀", title: "Deli Counter", desc: "House-cured meats, imported cheeses, local preserves. Take some home." },
    ],
    menu: [
      {
        category: "Breakfast & Brunch", icon: "🍳",
        items: [
          { name: "Farmhouse Full Breakfast", desc: "Eggs your way, bacon, boerewors, toast, tomato", price: "N$145" },
          { name: "Avocado Toast", desc: "Sourdough, smashed avo, poached egg, feta, chilli", price: "N$120" },
          { name: "Granola Bowl", desc: "House granola, seasonal fruit, Namibian honey, yoghurt", price: "N$95" },
        ],
      },
      {
        category: "Deli Boards & Light", icon: "🧀",
        items: [
          { name: "Charcuterie Board", desc: "House-cured meats, pickles, olives, sourdough", price: "N$195" },
          { name: "Cheese Board", desc: "3 cheeses, quince paste, crackers, grapes", price: "N$175" },
          { name: "Smoked Salmon Bagel", desc: "Cream cheese, capers, cucumber, red onion", price: "N$135" },
        ],
      },
      {
        category: "Café Mains", icon: "🥗",
        items: [
          { name: "Farmhouse Club Sandwich", desc: "Chicken, bacon, egg, lettuce, tomato, chips", price: "N$155" },
          { name: "Soup & Sourdough", desc: "Daily soup, thick-cut sourdough, butter", price: "N$95" },
          { name: "Quiche of the Day", desc: "Ask your server, garden salad", price: "N$110" },
        ],
      },
      {
        category: "Coffee & Drinks", icon: "☕",
        items: [
          { name: "Flat White / Cappuccino", desc: "Single origin, whole or oat milk", price: "N$45" },
          { name: "Cold Brew", desc: "12-hour steeped, served over ice", price: "N$55" },
          { name: "Fresh Juice", desc: "Orange, watermelon, or green — pressed to order", price: "N$50" },
        ],
      },
    ],
    atmosphere: [["☕", "Specialty Coffee"], ["🌊", "Ocean Views"], ["🥖", "Fresh Baked"], ["🛍️", "Deli Takeaway"]].map(([i, l]) => ({ icon: i as string, label: l as string })),
    colors: { bg: "#1a2e1a", mid: "#2a4a2a", accent: "#7db87d", text: "#f0f7f0" },
    anchor: "☕",
  },
  {
    slug: "brauhaus",
    name: "Swakopmund Brauhaus",
    tagline: "Microbrewery & Restaurant",
    sub: "DANIEL TJONGARERO AVE, SWAKOPMUND",
    location: "Daniel Tjongarero Ave, Swakopmund, Namibia",
    phone: "+264 64 402 214",
    email: "brauhaus@swakopmund.com",
    instagram: "@swakopmundbrauhaus",
    heroQuote: "Cold beer brewed on the premises, hearty food, lively crowd. What more do you need?",
    heroQuoteSource: "WANDERLOG",
    about: [
      "Swakopmund Brauhaus brews its own beer right here on the premises, and you can watch them do it. The copper tanks behind the bar aren't decorative — they're working.",
      "German tradition runs deep in Swakopmund, and the Brauhaus leans into it fully: house lager, wheat beer, dark ale, all poured cold with proper German pub food to match.",
    ],
    highlights: [
      { icon: "🍺", title: "House-Brewed Beer", desc: "Lager, weissbier, and seasonal dark ale brewed right here. No transport, no compromise." },
      { icon: "🏭", title: "Microbrewery", desc: "Watch the brewing process through the glass wall. Batch brewing on rotation." },
      { icon: "🥨", title: "German Pub Food", desc: "Schnitzel, sauerbraten, pretzels — the classics, done right." },
      { icon: "🎉", title: "Events & Groups", desc: "Private events, corporate dinners, and brewery tours available." },
    ],
    menu: [
      {
        category: "To Share", icon: "🥨",
        items: [
          { name: "Brauhaus Pretzel", desc: "Giant soft pretzel, beer cheese dip, mustard", price: "N$85" },
          { name: "Sausage Tasting Board", desc: "Bratwurst, bockwurst, weisswurst, mustards", price: "N$175" },
          { name: "Nachos", desc: "House-brewed beer cheese, jalapeños, sour cream", price: "N$120" },
        ],
      },
      {
        category: "German Classics", icon: "🥩",
        items: [
          { name: "Sauerbraten", desc: "Slow-marinated pot roast, red cabbage, potato dumpling", price: "N$210" },
          { name: "Wiener Schnitzel", desc: "Veal, breadcrumbed, lemon, cranberry sauce, spätzle", price: "N$205" },
          { name: "Eisbein", desc: "Slow-cooked pork knuckle, sauerkraut, mashed potato", price: "N$235" },
        ],
      },
      {
        category: "Brauhaus Favourites", icon: "🍔",
        items: [
          { name: "Brauhaus Burger", desc: "250g beef, beer-battered onion rings, cheddar, chips", price: "N$175" },
          { name: "Chicken Strips", desc: "House crumb, peri-peri or honey mustard, fries", price: "N$155" },
          { name: "Ploughman's Lunch", desc: "Cheese, cold meats, pickles, fresh bread", price: "N$165" },
        ],
      },
      {
        category: "House Beers", icon: "🍺",
        items: [
          { name: "Swakop Lager", desc: "Crisp, light, refreshing — our flagship", price: "N$55 / 500ml" },
          { name: "Dune Weissbier", desc: "Unfiltered wheat beer, banana & clove notes", price: "N$60 / 500ml" },
          { name: "Dark Tide Dunkel", desc: "Seasonal dark ale, roasted malt, caramel finish", price: "N$65 / 500ml" },
        ],
      },
    ],
    atmosphere: [["🍺", "House Brews"], ["🏭", "Brewery Tours"], ["🥨", "Beer Garden"], ["🎉", "Private Events"]].map(([i, l]) => ({ icon: i as string, label: l as string })),
    colors: { bg: "#0d1b2a", mid: "#1a3347", accent: "#d4a017", text: "#fef9ec" },
    anchor: "🍺",
  },
];

export default RESTAURANTS;
export const getRestaurant = (slug: string) => RESTAURANTS.find((r) => r.slug === slug);
