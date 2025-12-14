
export interface KingdomStats {
  year: number;
  month: number;
  gold: number;
  food: number;
  population: number;
  army: number;
  happiness: number;
  // New Resources
  wood: number;
  stone: number;
  manpower: number; // Nhân lực sẵn có
  supplies: number; // Vật tư quân sự
  // New Attributes
  economicPower: number; // Sức mạnh kinh tế (EP)
  taxRate: 'Tax Haven' | 'Low' | 'Standard' | 'Extortion'; // Mức thuế hiện tại
}

export interface GameSettings {
  worldTheme: string;
  kingdomName: string;
  background: string;
  leaderName: string;
  leaderDescription: string;
}

export interface EntityAction {
  entityId: string;
  entityName: string;
  actionType: 'War' | 'Diplomacy' | 'Expansion' | 'Internal' | 'Trade' | 'Unknown';
  description: string;
}

export interface GameLog {
  id: string;
  type: 'user' | 'ai' | 'system' | 'world_event';
  content: string;
  timestamp: string;
  eventTitle?: string;
  entityActions?: EntityAction[];
}

export enum ActionType {
  BUILD = 'Xây dựng',
  FARM = 'Canh tác',
  RECRUIT = 'Tuyển quân',
  TAX = 'Thu thuế',
  EXPLORE = 'Thám hiểm',
  DIPLOMACY = 'Ngoại giao',
  FESTIVAL = 'Tổ chức lễ hội',
  CUSTOM = 'Hành động khác',
  INVEST = 'Đầu tư ngân sách' // New action type
}

export interface SuggestedAction {
  label: string;
  action: string;
  style?: 'Aggressive' | 'Diplomatic' | 'Economic' | 'Neutral';
}

// --- World Info Types ---

export interface WorldEntity {
  id: string;
  name: string;
  type: 'Kingdom' | 'Empire' | 'Tribe' | 'City-State' | 'Organization';
  relation: 'Hostile' | 'Neutral' | 'Friendly' | 'Ally' | 'Unknown';
  description: string;
  liegeId?: string;
  color: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  age: number;
  personality: string;
  description: string;
  status: 'Alive' | 'Dead' | 'Missing';
  familyRelation?: 'Self' | 'Spouse' | 'Child' | 'Sibling' | 'Parent' | 'Relative' | 'None'; 
}

export interface Rumor {
  id: string;
  title: string;
  content: string;
  type: 'Threat' | 'Opportunity' | 'Mystery' | 'Gossip' | 'Talent';
  possibleImpact?: string;
  isResolved: boolean;
}

export interface WorldInfo {
  entities: WorldEntity[];
  people: Person[]; 
  rumors: Rumor[];
}

export interface WorldMap {
  rows: number;
  cols: number;
  grid: string[][];
}

// --- Internal Politics Types ---

export interface PoliticalDivision {
  id: string;
  name: string;
  type: 'Capital' | 'Duchy' | 'County' | 'Barony' | 'Province';
  rulerName: string;
  description: string;
}

export interface KingdomHeritage {
  royalFamily: Person[];
  divisions: PoliticalDivision[];
}

// --- Status/Buff Types ---
export interface KingdomBuff {
  id: string;
  name: string;
  type: 'Positive' | 'Negative' | 'Neutral';
  description: string;
  effect: string;
}

// Updated TurnResult
export interface TurnResult {
  narrative: string;
  eventTitle?: string;
  monthsPassed?: number;
  statsChange: {
    gold: number;
    food: number;
    population: number;
    army: number;
    happiness: number;
    wood: number;
    stone: number;
    manpower: number;
    supplies: number;
    economicPower: number;
  };
  suggestedActions: SuggestedAction[];
  worldUpdate?: {
    newEntities?: WorldEntity[];
    newPeople?: Person[];
    newRumors?: Rumor[];
    resolvedRumorIds?: string[];
  };
  otherKingdomsActions?: EntityAction[];
  politicalUpdate?: {
    newFamilyMembers?: Person[];
    updatedFamilyMembers?: Person[];
    newDivisions?: PoliticalDivision[];
    updatedDivisions?: PoliticalDivision[];
  };
  buffsUpdate?: {
    newBuffs?: KingdomBuff[];
    removedBuffIds?: string[];
  };
  initialStats?: KingdomStats; 
  isGameOver: boolean;
  gameOverReason?: string;
}
