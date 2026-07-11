export type MilitaryBranch = "Army" | "Navy" | "Air Force" | "Marines" | "Joint" | "Coast Guard";

export interface MilitaryBase {
  id:        string;
  name:      string;
  shortName: string;
  branch:    MilitaryBranch;
  lat:       number;
  lng:       number;
  city:      string;
  state:     string;
}

export const BRANCH_COLOR: Record<MilitaryBranch, string> = {
  Army:          "#4A7A4A",
  Navy:          "#4A90A4",
  "Air Force":   "#5B8FB9",
  Marines:       "#C0786C",
  Joint:         "#C9C3B6",
  "Coast Guard": "#B06AB3",
};

// Top 10 PCS hotspots — ordered by annual PCS move volume
export const MILITARY_BASES: MilitaryBase[] = [
  { id:"jba",  name:"Joint Base Andrews",        shortName:"Andrews AFB",   branch:"Joint",      lat:38.8108, lng:-76.8666, city:"Camp Springs",  state:"MD" },
  { id:"nsn",  name:"Naval Station Norfolk",      shortName:"NS Norfolk",    branch:"Navy",       lat:36.9453, lng:-76.2988, city:"Norfolk",       state:"VA" },
  { id:"fl",   name:"Fort Liberty",               shortName:"Fort Liberty",  branch:"Army",       lat:35.1415, lng:-79.0060, city:"Fayetteville",  state:"NC" },
  { id:"fc",   name:"Fort Cavazos",               shortName:"Fort Cavazos",  branch:"Army",       lat:31.1343, lng:-97.7735, city:"Killeen",       state:"TX" },
  { id:"jblm", name:"Joint Base Lewis-McChord",   shortName:"JBLM",          branch:"Joint",      lat:47.1131, lng:-122.5775,city:"Tacoma",        state:"WA" },
  { id:"nbsd", name:"Naval Base San Diego",       shortName:"NB San Diego",  branch:"Navy",       lat:32.6781, lng:-117.1575,city:"San Diego",     state:"CA" },
  { id:"macd", name:"MacDill Air Force Base",     shortName:"MacDill AFB",   branch:"Air Force",  lat:27.8494, lng:-82.5212, city:"Tampa",         state:"FL" },
  { id:"fb",   name:"Fort Bliss",                 shortName:"Fort Bliss",    branch:"Army",       lat:31.8131, lng:-106.4223,city:"El Paso",       state:"TX" },
  { id:"cl",   name:"Camp Lejeune",               shortName:"Camp Lejeune",  branch:"Marines",    lat:34.6282, lng:-77.3534, city:"Jacksonville",  state:"NC" },
  { id:"fm",   name:"Fort Moore",                 shortName:"Fort Moore",    branch:"Army",       lat:32.3582, lng:-84.9499, city:"Columbus",      state:"GA" },
];
