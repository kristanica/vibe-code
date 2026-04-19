export type CardType = "ATTACK" | "DEFENSE" | "GAMBLE" | "MODIFIER" | "SYNERGY";

export type ProbabilityModifier = {
  source: string;
  value: number;
};

export type StatusEffectType =
  | "DODGE"
  | "STRENGTH"
  | "REGEN"
  | "DEBUFF_ODDS"
  | "SHARP_EYE"
  | "VULNERABLE"
  | "WEAK"
  | "DOUBLE_DOWN"
  | "ARMOR";

export type StatusEffect = {
  type: StatusEffectType;
  value: number;
  duration: number; // turns or actions remaining
  durationType?: "TURN" | "ACTION";
  name: string;
};

export type GameEffect = {
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
  applyEnemyStatus?: StatusEffect;
  resetEntropy?: boolean;
  pityPayoff?: boolean;
  conditionalDamage?: {
    type: "LOW_PROB" | "COMBO";
    threshold?: number;
    multiplier?: number;
    bonusPerCombo?: number;
  };
};

export type GameCard = {
  id: string;
  instanceId?: string;
  name: string;
  type: CardType;
  cost: number;
  baseOdds: number;
  price?: number;
  successEffect: GameEffect;
  failEffect?: GameEffect;
  description: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "VOLATILE" | "EXCLUSIVE";
  isVolatile?: boolean;
};

export type EnemyIntent = "ATTACK" | "BLOCK" | "DEBUFF" | "SPECIAL" | "BUFF" | "HEAL";

export type EnemyMove = {
  id?: string;
  intent: EnemyIntent;
  value: number;
  description?: string;
  hits?: number;
  secondaryIntent?: EnemyIntent;
  secondaryValue?: number;
  weight?: number;
  cooldown?: number;
  animationType?: "light" | "heavy" | "combo" | "cast" | "defend";
  requiredHpPercentage?: number;
};

export type Enemy = {
  id: string;
  name: string;
  type: "NORMAL" | "ELITE" | "BOSS";
  hp: number;
  maxHp: number;
  block: number;
  moves: EnemyMove[];
  nextMoveIndex: number;
  intent: EnemyIntent;
  aiType: "SEQUENTIAL" | "RANDOM" | "ADAPTIVE";
  attack?: number;
  passiveDescription?: string;
  debuffOdds?: number;
  jamsPity?: boolean;
  freezesCombo?: boolean;
  punishesFailure?: boolean;
  statusEffects: StatusEffect[];
  currentMoveCooldowns?: Record<number, number>;
  animationState?:
    | "idle"
    | "light"
    | "heavy"
    | "combo"
    | "cast"
    | "defend"
    | "hurt"
    | "dead";
};

export type RelicEffect = {
  type:
    | "START_BATTLE_BLOCK"
    | "START_TURN_ENERGY"
    | "SUCCESS_CHIPS"
    | "FAILURE_BLOCK"
    | "GLOBAL_SUCCESS_CHANCE"
    | "ATTACK_BONUS"
    | "HEAL_ON_VICTORY"
    | "DOUBLE_PITY"
    | "HALVE_ENTROPY_GAIN"
    | "COMBO_CAP_BOOST";
  value: number;
};

export type Relic = {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: RelicEffect;
  rarity: "COMMON" | "RARE" | "LEGENDARY";
  price?: number;
};

export type PlayerStats = {
  attackBonus: number;
  maxHpBonus: number;
  successRateBonus: number;
  focus: number;
  maxEnergyBonus: number;
  fortune: number;
  volatility: number;
};

export type PlayerState = {
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
  relics: Relic[];
  playsRemaining: number;
  maxPlays: number;
  discardsRemaining: number;
  shufflesRemaining: number;
  level: number;
  exp: number;
  nextLevelExp: number;
  stats: PlayerStats;
  failureStreak: number;
  entropy: number;
};

export type ProbabilityLayer = {
  name: string;
  value: number;
};

export type ProbabilityBreakdown = {
  baseOdds: number;
  layers: ProbabilityLayer[];
  finalOdds: number;
};

export type NodeType =
  | "BATTLE"
  | "ELITE"
  | "SHOP"
  | "REST"
  | "EVENT"
  | "BOSS"
  | "TREASURE";

export type MapNode = {
  id: string;
  type: NodeType;
  label: string;
  enemyId?: string;
};

export type EventOption = {
  label: string;
  description: string;
  action: (state: GameState & GameActions) => void;
  cost?: number;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  options: EventOption[];
};

export type GamePhase =
  | "INITIALIZING"
  | "BATTLE_START"
  | "PLAYER_TURN"
  | "RESOLUTION"
  | "ENEMY_TURN"
  | "BATTLE_END"
  | "DRAFT"
  | "SHOP"
  | "MAP"
  | "STARTER_SELECT"
  | "EVENT"
  | "LEVEL_UP"
  | "TREASURE"
  | "ACT_CLEAR";

export type GameState = {
  phase: GamePhase;
  player: PlayerState;
  enemy: Enemy | null;
  floor: number;
  act: number;
  log: string[];
  lastResult: "SUCCESS" | "FAILURE" | null;
  bannerText: string | null;
  draftOptions: GameCard[];
  shopOptions: GameCard[];
  shopRelicOptions: Relic[];
  treasureOptions: Relic[];
  currentEvent: GameEvent | null;
  selectedCards: GameCard[];
  focusedCard: GameCard | null;
  starterPicksRemaining: number;
  mapNodes: MapNode[];
  isGodMode: boolean;
  removalPrice: number;
  upgradePrice: number;
  shopSelectionMode: "NONE" | "REMOVE" | "UPGRADE";
  score: number;
  combo: number;
  highestCombo: number;
  tutorialStep: number;
  isTutorialOpen: boolean;
  resolvingCard: GameCard | null;
  rollValue: number | null;
};

export interface GameActions {
  addScore: (amount: number) => void;
  resetScore: () => void;
  setCombo: (amount: number) => void;
  nextTutorialStep: () => void;
  finishTutorial: () => void;
  openTutorial: () => void;
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
  buyRelic: (relic: Relic) => void;
  pickTreasure: (relic: Relic) => void;
  leaveShop: () => void;
  discardSelected: () => void;
  shuffleHand: () => void;
  instaWin: () => void;
  upgradeStat: (stat: keyof PlayerStats) => void;
  setBanner: (text: string) => void;
  clearBanner: () => void;
  startGame: () => void;
  drawCards: (count: number) => void;
  removeCard: (instanceId: string) => void;
  upgradeCard: (instanceId: string) => void;
  setShopSelectionMode: (mode: "NONE" | "REMOVE" | "UPGRADE") => void;
  buyDiscard: () => void;
  buyShuffle: () => void;
  finishCardResolution: () => void;
}

