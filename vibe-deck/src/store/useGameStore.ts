import { create } from 'zustand';
import { STARTER_CARDS, ENEMIES } from '../data/starter';

interface GameActions {
  startGame: () => void;
  drawCards: (count: number) => void;
  playCard: (card: GameCard) => void;
  endTurn: () => void;
  resolveEnemyTurn: () => void;
  addLog: (message: string) => void;
  draftCard: (card: GameCard) => void;
  setBanner: (text: string) => void;
  clearBanner: () => void;
}

const INITIAL_DECK = [
  ...Array(5).fill(STARTER_CARDS[0]), // 5x Safe Strike
  ...Array(3).fill(STARTER_CARDS[1]), // 3x Balanced Strike
  STARTER_CARDS[3], // 1x Dodge
  STARTER_CARDS[4], // 1x Lucky Charm
];

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  phase: 'MAP',
  player: {
    hp: 3,
    maxHp: 3,
    energy: 3,
    maxEnergy: 3,
    deck: INITIAL_DECK,
    hand: [],
    discard: [],
    chips: 0,
    oddsModifiers: [],
  },
  enemy: null,
  floor: 1,
  log: ['Welcome to Probability Deck!'],
  lastResult: null,
  bannerText: null,
  draftOptions: [],
  selectedCard: null,

  addLog: (message: string) => set((state) => ({ log: [message, ...state.log].slice(0, 50) })),
  
  selectCard: (card: GameCard | null) => set({ selectedCard: card }),

  setBanner: (text: string) => {
    set({ bannerText: text });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  clearBanner: () => set({ bannerText: null }),

  startGame: () => {
    const deck = shuffle(INITIAL_DECK);
    const firstEnemy = ENEMIES.thug;
    
    set({
      phase: 'PLAYER_TURN',
      selectedCard: null,
      player: {
        ...get().player,
        deck: deck.slice(5),
        hand: deck.slice(0, 5),
        discard: [],
        energy: 3,
        oddsModifiers: [],
        hp: 3, // Reset HP for new game
      },
      enemy: { ...firstEnemy },
      floor: 1,
      log: ['Run started! Floor 1: Thug'],
      bannerText: 'YOUR TURN',
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  drawCards: (count: number) => {
    set((state) => {
      const { deck, hand, discard } = state.player;
      const newHand = [...hand];
      const newDeck = [...deck];
      const newDiscard = [...discard];

      for (let i = 0; i < count; i++) {
        if (newDeck.length === 0) {
          if (newDiscard.length === 0) break;
          newDeck.push(...shuffle(newDiscard));
          newDiscard.length = 0;
        }
        const card = newDeck.shift();
        if (card) newHand.push(card);
      }

      return {
        player: { ...state.player, deck: newDeck, hand: newHand, discard: newDiscard },
      };
    });
  },

  playCard: (card: GameCard) => {
    const { player, enemy, addLog } = get();
    if (player.energy < card.cost) {
      addLog("Not enough energy!");
      return;
    }

    // Calculate Odds
    let finalOdds = card.baseOdds;
    player.oddsModifiers.forEach(m => finalOdds += m.value);
    if (enemy?.debuffOdds) finalOdds += enemy.debuffOdds;
    finalOdds = Math.max(5, Math.min(100, finalOdds));

    const roll = Math.random() * 100;
    const isSuccess = roll <= finalOdds;

    addLog(`Played ${card.name} (${finalOdds}%)... ${isSuccess ? 'SUCCESS!' : 'FAILED!'}`);
    
    set({ lastResult: isSuccess ? 'SUCCESS' : 'FAILURE', selectedCard: null });
    setTimeout(() => set({ lastResult: null }), 800);

    set((state) => {
      const nextHand = state.player.hand.filter(c => c !== card);
      const nextDiscard = [...state.player.discard, card];
      let nextPlayerHp = state.player.hp;
      let nextEnemyHp = state.enemy?.hp ?? 0;
      const nextEnergy = state.player.energy - card.cost;
      let nextModifiers = [...state.player.oddsModifiers];

      // Reset one-time modifiers if any (simplified for MVP: all modifiers are one-time)
      nextModifiers = [];

      if (isSuccess) {
        if (card.successEffect.damage) nextEnemyHp -= card.successEffect.damage;
        if (card.successEffect.oddsModifier) {
           nextModifiers.push({ source: card.name, value: card.successEffect.oddsModifier });
        }
        // ... handle other effects
      } else {
        if (card.failEffect?.takeDamage) nextPlayerHp -= card.failEffect.takeDamage;
        if (state.enemy?.id === 'slot_machine' && isSuccess === false) {
           nextEnemyHp = Math.min(state.enemy.maxHp, nextEnemyHp + 2);
           addLog("Slot Machine heals 2 HP!");
        }
      }

      const nextEnemy = state.enemy ? { ...state.enemy, hp: nextEnemyHp } : null;

      if (nextEnemy && nextEnemy.hp <= 0) {
        // Prepare Draft Options
        const draftOptions = shuffle(STARTER_CARDS).slice(0, 3);
        
        return {
          phase: 'DRAFT',
          enemy: null,
          player: { ...state.player, hand: [], discard: [], energy: 0, hp: nextPlayerHp, oddsModifiers: [] },
          log: [`Victory! ${state.enemy?.name} defeated.`, ...state.log],
          draftOptions
        };
      }

      return {
        player: {
          ...state.player,
          hp: nextPlayerHp,
          hand: nextHand,
          discard: nextDiscard,
          energy: nextEnergy,
          oddsModifiers: nextModifiers
        },
        enemy: nextEnemy
      };
    });
  },

  endTurn: () => {
    set((state) => ({
      phase: 'ENEMY_TURN',
      bannerText: 'ENEMY TURN',
      selectedCard: null,
      player: {
        ...state.player,
        discard: [...state.player.discard, ...state.player.hand],
        hand: [],
      }
    }));
    setTimeout(() => set({ bannerText: null }), 1500);
    get().resolveEnemyTurn();
  },

  resolveEnemyTurn: () => {
    const { enemy, addLog } = get();
    if (!enemy) return;

    addLog(`${enemy.name} attacks for ${enemy.attack} damage!`);
    
    setTimeout(() => {
      set((state) => {
        const nextHp = state.player.hp - (enemy.attack || 0);
        if (nextHp <= 0) {
          return { phase: 'BATTLE_END', player: { ...state.player, hp: 0 }, log: ['GAME OVER', ...state.log] };
        }

        // Start new player turn
        const deck = [...state.player.deck];
        const discard = [...state.player.discard];
        const hand: GameCard[] = [];

        // Simple draw logic for end turn
        let currentDeck = deck;
        let currentDiscard = discard;
        for(let i=0; i<5; i++) {
          if (currentDeck.length === 0) {
             currentDeck = shuffle(currentDiscard);
             currentDiscard = [];
          }
          const c = currentDeck.shift();
          if (c) hand.push(c);
        }

        return {
          phase: 'PLAYER_TURN',
          bannerText: 'YOUR TURN',
          player: {
            ...state.player,
            hp: nextHp,
            energy: state.player.maxEnergy,
            hand,
            deck: currentDeck,
            discard: currentDiscard
          }
        };
      });
      setTimeout(() => set({ bannerText: null }), 1500);
    }, 1000);
  },

  draftCard: (card: GameCard) => {
    set((state) => ({
      phase: 'PLAYER_TURN',
      player: {
        ...state.player,
        deck: [...state.player.deck, card],
        energy: state.player.maxEnergy,
      },
      floor: state.floor + 1,
      enemy: { ...ENEMIES.card_shark }, // For MVP, just cycle enemies or pick next
      log: [`Added ${card.name} to deck. Floor ${state.floor + 1} begins!`, ...state.log]
    }));
    get().drawCards(5);
  }
}));
