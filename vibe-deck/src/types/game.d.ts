type CardType = 'ATTACK' | 'DEFENSE' | 'GAMBLE' | 'MODIFIER' | 'SYNERGY';

type ProbabilityModifier = {
  source: string;
  value: number;
};

type GameCard = {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  baseOdds: number; // 0-100
  successEffect: {
    damage?: number;
    block?: number;
    drawCards?: number;
    energy?: number;
    oddsModifier?: number;
    winBattle?: boolean;
    takeDamage?: number;
  };
  failEffect?: {
    damage?: number;
    takeDamage?: number;
    discardHand?: boolean;
    loseTurn?: boolean;
    nothing?: boolean;
  };
  description: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'VOLATILE';
  isVolatile?: boolean;
};

type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  intent: 'ATTACK' | 'DEBUFF' | 'RANDOM' | 'SPECIAL';
  intentValue?: number;
  passiveDescription?: string;
  debuffOdds?: number; // e.g., -10% odds for player
};

type PlayerState = {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  deck: GameCard[];
  hand: GameCard[];
  discard: GameCard[];
  chips: number;
  oddsModifiers: ProbabilityModifier[];
};

interface GameActions {
  startGame: () => void;
  drawCards: (count: number) => void;
  playCard: (card: GameCard) => void;
  selectCard: (card: GameCard | null) => void;
  endTurn: () => void;
  resolveEnemyTurn: () => void;
  addLog: (message: string) => void;
  draftCard: (card: GameCard) => void;
  setBanner: (text: string) => void;
  clearBanner: () => void;
}

type GamePhase = 'BATTLE_START' | 'PLAYER_TURN' | 'RESOLUTION' | 'ENEMY_TURN' | 'BATTLE_END' | 'DRAFT' | 'SHOP' | 'MAP';

type GameState = {
  phase: GamePhase;
  player: PlayerState;
  enemy: Enemy | null;
  floor: number;
  log: string[];
  lastResult: 'SUCCESS' | 'FAILURE' | null;
  bannerText: string | null;
  draftOptions: GameCard[];
  selectedCard: GameCard | null;
};
