type CardType = "ATTACK" | "DEFENSE" | "GAMBLE" | "MODIFIER" | "SYNERGY";

type ProbabilityModifier = {
  source: string;
  value: number;
};

type StatusEffectType =
  | "DODGE"
  | "STRENGTH"
  | "REGEN"
  | "DEBUFF_ODDS"
  | "SHARP_EYE"
  | "VULNERABLE"
  | "WEAK"
  | "DOUBLE_DOWN"
  | "ARMOR";

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
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "VOLATILE" | "EXCLUSIVE";
  isVolatile?: boolean;
};

type EnemyIntent = "ATTACK" | "BLOCK" | "DEBUFF" | "SPECIAL" | "BUFF" | "HEAL";

type EnemyMove = {
  id?: string;
  intent: EnemyIntent;
  value: number;
  description?: string;
  hits?: number; // Multi-hit combo
  secondaryIntent?: EnemyIntent;
  secondaryValue?: number;
  weight?: number; // For ADAPTIVE AI
  cooldown?: number; // Turns before it can be used again
  animationType?: "light" | "heavy" | "combo" | "cast" | "defend";
  requiredHpPercentage?: number; // Only use if HP < this %
};

type Enemy = {
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
  statusEffects: StatusEffect[];
  currentMoveCooldowns?: Record<number, number>; // index -> remaining cooldown
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

type RelicEffect = {
  type:
    | "START_BATTLE_BLOCK"
    | "START_TURN_ENERGY"
    | "SUCCESS_CHIPS"
    | "FAILURE_BLOCK"
    | "GLOBAL_SUCCESS_CHANCE"
    | "ATTACK_BONUS"
    | "HEAL_ON_VICTORY";
  value: number;
};

type Relic = {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: RelicEffect;
  rarity: "COMMON" | "RARE" | "LEGENDARY";
  price?: number;
};

type PlayerStats = {
  attackBonus: number;
  maxHpBonus: number;
  successRateBonus: number;
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
  relics: Relic[];
  playsRemaining: number;
  maxPlays: number;
  discardsRemaining: number;
  shufflesRemaining: number;
  level: number;
  exp: number;
  nextLevelExp: number;
  stats: PlayerStats;
};

type NodeType =
  | "BATTLE"
  | "ELITE"
  | "SHOP"
  | "REST"
  | "EVENT"
  | "BOSS"
  | "TREASURE";

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

type GamePhase =
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

type GameState = {
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
};

interface GameActions {
  addScore: (amount: number) => void;
  resetScore: () => void;
  setCombo: (amount: number) => void;
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
  buyRelic: (relic: Relic) => void;
  pickTreasure: (relic: Relic) => void;
  leaveShop: () => void;
  discardSelected: () => void;
  shuffleHand: () => void;
  instaWin: () => void;
  upgradeStat: (stat: keyof PlayerStats) => void;
  setBanner: (text: string) => void;
  clearBanner: () => void;
  removeCard: (instanceId: string) => void;
  upgradeCard: (instanceId: string) => void;
  setShopSelectionMode: (mode: "NONE" | "REMOVE" | "UPGRADE") => void;
  buyDiscard: () => void;
  buyShuffle: () => void;
}
