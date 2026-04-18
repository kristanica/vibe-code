type CardType = 'ATTACK' | 'DEFENSE' | 'GAMBLE' | 'MODIFIER' | 'SYNERGY';

type ProbabilityModifier = {
  source: string;
  value: number;
};

type StatusEffectType = 
  | 'DODGE' 
  | 'STRENGTH' 
  | 'REGEN' 
  | 'DEBUFF_ODDS' 
  | 'SHARP_EYE' 
  | 'VULNERABLE' 
  | 'WEAK' 
  | 'DOUBLE_DOWN'
  | 'ARMOR';

type StatusEffect = {
  type: StatusEffectType;
  value: number;
  duration: number; // turns remaining
  name: string;
};

type GameEffect = {
  damage?: number;
  block?: number;
  drawCards?: number;
  energy?: number;
  oddsModifier?: number;
  winBattle?: boolean;
  takeDamage?: number;
  discardHand?: boolean;
  loseTurn?: boolean;
  nothing?: boolean;
  addStatus?: StatusEffect;
  applyEnemyStatus?: StatusEffect; // New: Apply to enemy
};

type GameCard = {
  id: string;
  instanceId?: string;
  name: string;
  type: CardType;
  cost: number;
  baseOdds: number;
  price?: number; // Cost in chips
  successEffect: GameEffect;
  failEffect?: GameEffect;
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'VOLATILE';
  isVolatile?: boolean;
};

type EnemyMove = {
  intent: 'ATTACK' | 'BLOCK' | 'DEBUFF' | 'SPECIAL';
  value: number;
  description?: string;
};

type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  moves: EnemyMove[];
  nextMoveIndex: number;
  intent: 'ATTACK' | 'BLOCK' | 'DEBUFF' | 'SPECIAL' | 'RANDOM';
  attack?: number; 
  passiveDescription?: string;
  debuffOdds?: number;
  statusEffects: StatusEffect[];
};

type PlayerState = {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  deck: GameCard[];
  hand: GameCard[];
  discard: GameCard[]; 
  tempDiscard: GameCard[];
  chips: number;
  oddsModifiers: ProbabilityModifier[];
  statusEffects: StatusEffect[];
  discardsRemaining: number;
  shufflesRemaining: number;
};

type NodeType = 'BATTLE' | 'ELITE' | 'SHOP' | 'REST' | 'EVENT' | 'BOSS';

type MapNode = {
  id: string;
  type: NodeType;
  label: string;
  enemyId?: string;
};

type EventOption = {
  label: string;
  description: string;
  action: (state: GameState & GameActions) => void;
  cost?: number;
};

type GameEvent = {
  id: string;
  title: string;
  description: string;
  options: EventOption[];
};

type GamePhase = 'INITIALIZING' | 'BATTLE_START' | 'PLAYER_TURN' | 'RESOLUTION' | 'ENEMY_TURN' | 'BATTLE_END' | 'DRAFT' | 'SHOP' | 'MAP' | 'STARTER_SELECT' | 'EVENT';

type GameState = {
  phase: GamePhase;
  player: PlayerState;
  enemy: Enemy | null;
  floor: number;
  log: string[];
  lastResult: 'SUCCESS' | 'FAILURE' | null;
  bannerText: string | null;
  draftOptions: GameCard[];
  shopOptions: GameCard[];
  currentEvent: GameEvent | null;
  selectedCards: GameCard[];
  focusedCard: GameCard | null;
  starterPicksRemaining: number;
  mapNodes: MapNode[];
  isGodMode: boolean;
};

interface GameActions {
  startGame: () => void;
  drawCards: (count: number) => void;
  playCard: (card: GameCard) => void;
  toggleSelectCard: (card: GameCard) => void;
  clearSelection: () => void;
  setFocusedCard: (card: GameCard | null) => void;
  toggleGodMode: () => void;
  endTurn: () => void;
  resolveEnemyTurn: () => void;
  addLog: (message: string) => void;
  draftCard: (card: GameCard) => void;
  pickStarterCard: (card: GameCard) => void;
  selectMapNode: (node: MapNode) => void;
  resolveEventOption: (option: EventOption) => void;
  buyCard: (card: GameCard) => void;
  leaveShop: () => void;
  discardSelected: () => void;
  shuffleHand: () => void;
  instaWin: () => void;
  setBanner: (text: string) => void;
  clearBanner: () => void;
}
