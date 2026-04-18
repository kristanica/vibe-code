import { create } from 'zustand';
import { STARTER_CARDS, ENEMIES, ELITE_ENEMIES } from '../data/starter';
import { EVENTS } from '../data/events';
import { 
  shuffle, 
  getNextEnemyMove, 
  tickStatusEffects, 
  generateMapNodes, 
  createEnemyInstance 
} from '../utils/gameEngine';

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  phase: 'INITIALIZING',
  player: { hp: 20, maxHp: 20, energy: 3, maxEnergy: 3, block: 0, deck: [], hand: [], discard: [], tempDiscard: [], chips: 50, oddsModifiers: [], statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 },
  enemy: null, floor: 1, log: ['Welcome to Probability Deck!'], lastResult: null, bannerText: null, draftOptions: [], shopOptions: [], currentEvent: null, selectedCards: [], focusedCard: null, starterPicksRemaining: 0, mapNodes: [], isGodMode: false,

  addLog: (message: string) => set((state) => ({ log: [message, ...state.log].slice(0, 50) })),
  selectCard: (card: GameCard | null) => set({ selectedCards: card ? [card] : [] }),
  
  toggleSelectCard: (card: GameCard) => set((state) => {
    const isSelected = state.selectedCards.some(c => c.instanceId === card.instanceId);
    if (isSelected) {
      return { selectedCards: state.selectedCards.filter(c => c.instanceId !== card.instanceId) };
    } else {
      return { selectedCards: [...state.selectedCards, card] };
    }
  }),

  clearSelection: () => set({ selectedCards: [] }),
  setFocusedCard: (card: GameCard | null) => set({ focusedCard: card }),
  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),
  
  instaWin: () => {
    set((state) => {
      if (!state.enemy) return state;
      const draftOptions = shuffle(STARTER_CARDS).slice(0, 3).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
      const reclaimedDeck = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      return {
        phase: 'DRAFT',
        enemy: null,
        selectedCards: [],
        player: { ...state.player, deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [], energy: 0, block: 0, oddsModifiers: [], statusEffects: [], chips: state.player.chips + 25 },
        log: [`GOD MODE: Victory! +25 Chips earned.`, ...state.log],
        draftOptions
      };
    });
  },

  setBanner: (text: string) => {
    set({ bannerText: text });
    setTimeout(() => set({ bannerText: null }), 1500);
  },
  clearBanner: () => set({ bannerText: null }),

  startGame: () => {
    const pool = shuffle(STARTER_CARDS.filter(c => c.rarity === 'COMMON')).slice(0, 5).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
    set({
      phase: 'STARTER_SELECT',
      starterPicksRemaining: 3,
      draftOptions: pool,
      floor: 1,
      player: {
        hp: 20, maxHp: 20, energy: 3, maxEnergy: 3, block: 0, deck: [], hand: [], discard: [], tempDiscard: [], chips: 50, oddsModifiers: [], statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3
      },
    });
  },

  pickStarterCard: (card: GameCard) => {
    set((state) => {
      const newPicked = [...state.player.deck, { ...card, instanceId: crypto.randomUUID() }];
      const remainingPicks = state.starterPicksRemaining - 1;

      if (remainingPicks > 0) {
        return {
          player: { ...state.player, deck: newPicked },
          starterPicksRemaining: remainingPicks,
          draftOptions: state.draftOptions.filter(c => c.instanceId !== card.instanceId)
        };
      } else {
        const fullDeck: GameCard[] = [...newPicked];
        const pool = STARTER_CARDS.filter(c => c.rarity === 'COMMON' || c.rarity === 'UNCOMMON');
        while (fullDeck.length < 20) {
          const randomType = pool[Math.floor(Math.random() * pool.length)];
          fullDeck.push({ ...randomType, instanceId: crypto.randomUUID() });
        }
        const shuffledDeck = shuffle(fullDeck);
        const enemy = createEnemyInstance(1, 'NORMAL');
        return {
          phase: 'PLAYER_TURN',
          starterPicksRemaining: 0,
          draftOptions: [],
          player: { ...state.player, deck: shuffledDeck.slice(5), hand: shuffledDeck.slice(0, 5), discard: [], tempDiscard: [] },
          enemy,
          log: [`Deck assembled (20 cards)! Battle 1: ${enemy.name}`, ...state.log],
          bannerText: 'BATTLE START'
        };
      }
    });
    if (get().phase === 'PLAYER_TURN') setTimeout(() => set({ bannerText: null }), 1500);
  },

  discardSelected: () => {
    set((state) => {
      const { player, selectedCards, log } = state;
      if (selectedCards.length === 0 || player.discardsRemaining <= 0) return state;

      const selectedIds = new Set(selectedCards.map(c => c.instanceId));
      const newHand = player.hand.filter(c => !selectedIds.has(c.instanceId));
      let nextDeck = [...player.deck];
      let nextDiscard = [...player.discard];

      const drawn: GameCard[] = [];
      for (let i = 0; i < selectedCards.length; i++) {
        if (nextDeck.length === 0) {
          if (nextDiscard.length === 0) break;
          nextDeck = shuffle(nextDiscard);
          nextDiscard = [];
        }
        const card = nextDeck.shift();
        if (card) drawn.push(card);
      }

      return {
        selectedCards: [],
        player: {
          ...player,
          hand: [...newHand, ...drawn],
          deck: nextDeck,
          discard: [...nextDiscard, ...selectedCards],
          discardsRemaining: player.discardsRemaining - 1
        },
        log: [`Discarded ${selectedCards.length} cards.`, ...log]
      };
    });
  },

  shuffleHand: () => {
    set((state) => {
      const { player, log } = state;
      if (player.shufflesRemaining <= 0) return state;
      const fullPool = shuffle([...player.deck, ...player.discard, ...player.hand]);
      return {
        selectedCards: [],
        player: {
          ...player,
          hand: fullPool.slice(0, 5),
          deck: fullPool.slice(5),
          discard: [],
          shufflesRemaining: player.shufflesRemaining - 1
        },
        log: [`Shuffled full deck into hand.`, ...log]
      };
    });
  },

  selectMapNode: (node: MapNode) => {
    set((state) => {
      const allCards = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      const fullDeckShuffled = shuffle(allCards);

      if (node.type === 'ELITE' || node.type === 'BOSS' || node.type === 'BATTLE') {
        const enemyType = node.type === 'BOSS' ? 'BOSS' : node.type === 'ELITE' ? 'ELITE' : 'NORMAL';
        const enemy = createEnemyInstance(state.floor, enemyType);
        return {
          phase: 'PLAYER_TURN',
          enemy,
          bannerText: node.type === 'BOSS' ? 'BOSS BATTLE' : node.type === 'ELITE' ? 'ELITE BATTLE' : 'BATTLE START',
          player: { ...state.player, deck: fullDeckShuffled.slice(5), hand: fullDeckShuffled.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 }
        };
      } else if (node.type === 'REST') {
        const heal = Math.floor(state.player.maxHp * 0.3);
        const nextFloor = state.floor + 1;
        return {
          player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + heal), deck: allCards, hand: [], discard: [], tempDiscard: [] },
          log: [`Rested and recovered ${heal} HP.`, ...state.log],
          floor: nextFloor,
          phase: 'MAP',
          mapNodes: generateMapNodes(nextFloor),
          bannerText: 'RESTED'
        };
      } else if (node.type === 'SHOP') {
        const shopPool = shuffle(STARTER_CARDS).slice(0, 5).map(c => {
          let price = 25; if (c.rarity === 'UNCOMMON') price = 50; if (c.rarity === 'RARE') price = 100; if (c.rarity === 'VOLATILE') price = 150;
          return { ...c, instanceId: crypto.randomUUID(), price };
        });
        return { phase: 'SHOP', shopOptions: shopPool, bannerText: 'THE SHOP', player: { ...state.player, deck: allCards, hand: [], discard: [], tempDiscard: [] } };
      } else if (node.type === 'EVENT') {
        const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        return { phase: 'EVENT', currentEvent: randomEvent, bannerText: 'EVENT', player: { ...state.player, deck: allCards, hand: [], discard: [], tempDiscard: [] } };
      }
      return state;
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  buyCard: (card: GameCard) => {
    set((state) => {
      const price = card.price || 0;
      if (state.player.chips < price) return state;
      return {
        player: { ...state.player, chips: state.player.chips - price, deck: [...state.player.deck, card] },
        shopOptions: state.shopOptions.filter(o => o.instanceId !== card.instanceId),
        log: [`Purchased ${card.name} for ${price} chips.`, ...state.log]
      };
    });
  },

  leaveShop: () => {
    set((state) => {
      const nextFloor = state.floor + 1;
      return { phase: 'MAP', floor: nextFloor, mapNodes: generateMapNodes(nextFloor), shopOptions: [], bannerText: `FLOOR ${nextFloor}` };
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  resolveEventOption: (option: EventOption) => {
    const state = get();
    if (option.cost && state.player.chips < option.cost) return;
    const currentChips = option.cost ? state.player.chips - option.cost : state.player.chips;
    
    // Execute action
    option.action({ ...state, player: { ...state.player, chips: currentChips } });
    
    set((s) => ({
      phase: 'MAP',
      floor: s.floor + 1,
      mapNodes: generateMapNodes(s.floor + 1),
      currentEvent: null,
      bannerText: `FLOOR ${s.floor + 1}`,
      player: { ...s.player, chips: currentChips }
    }));
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  drawCards: (count: number) => {
    set((state) => {
      const { deck, hand, discard } = state.player;
      const newHand = [...hand]; let nextDeck = [...deck]; let nextDiscard = [...discard];
      for (let i = 0; i < count; i++) {
        if (nextDeck.length === 0) { if (nextDiscard.length === 0) break; nextDeck = shuffle(nextDiscard); nextDiscard = []; }
        const card = nextDeck.shift(); if (card) newHand.push(card);
      }
      return { player: { ...state.player, deck: nextDeck, hand: newHand, discard: nextDiscard } };
    });
  },

  playCard: (card: GameCard) => {
    const s = get();
    if (!s.isGodMode && s.player.energy < card.cost) { s.addLog("Not enough energy!"); return; }
    
    let statusOddsMod = 0;
    s.player.statusEffects.forEach(e => { if (e.type === 'SHARP_EYE') statusOddsMod += e.value; if (e.type === 'DEBUFF_ODDS') statusOddsMod += e.value; });
    
    let finalOdds = s.isGodMode ? 100 : (card.baseOdds + statusOddsMod);
    s.player.oddsModifiers.forEach(m => finalOdds += m.value);
    if (s.enemy?.debuffOdds) finalOdds += s.enemy.debuffOdds;
    finalOdds = Math.max(5, Math.min(100, finalOdds));

    const roll = Math.random() * 100;
    const isSuccess = roll <= finalOdds;

    s.addLog(`Played ${card.name} (${finalOdds}%)... ${isSuccess ? 'SUCCESS!' : 'FAILED!'}`);
    set({ lastResult: isSuccess ? 'SUCCESS' : 'FAILURE', selectedCards: [] });
    setTimeout(() => set({ lastResult: null }), 800);

    set((state) => {
      const nextHand = state.player.hand.filter(c => c.instanceId !== card.instanceId);
      const nextDiscard = [...state.player.discard, card];
      let nextPlayerHp = state.player.hp; let nextPlayerBlock = state.player.block; let nextEnemyHp = state.enemy?.hp ?? 0; let nextEnemyBlock = state.enemy?.block ?? 0;
      let nextEnergy = state.isGodMode ? state.player.energy : (state.player.energy - card.cost);
      let nextPlayerStatus = [...state.player.statusEffects];
      let nextEnemyStatus = state.enemy ? [...state.enemy.statusEffects] : [];
      
      const effect = isSuccess ? card.successEffect : card.failEffect;
      if (effect) {
        if (effect.damage) {
          let damage = effect.damage + (state.player.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0);
          if (state.enemy?.statusEffects.find(e => e.type === 'VULNERABLE')) damage = Math.floor(damage * 1.5);
          if (state.player.statusEffects.find(e => e.type === 'WEAK')) damage = Math.floor(damage * 0.75);
          if (nextEnemyBlock >= damage) { nextEnemyBlock -= damage; } else { damage -= nextEnemyBlock; nextEnemyBlock = 0; nextEnemyHp -= damage; }
        }
        if (effect.block) nextPlayerBlock += effect.block;
        if (effect.energy) nextEnergy += effect.energy;
        if (effect.drawCards) setTimeout(() => get().drawCards(effect.drawCards || 0), 50);
        if (effect.winBattle) nextEnemyHp = 0;
        if (effect.takeDamage && !state.isGodMode) {
          let damage = effect.takeDamage; if (nextPlayerBlock >= damage) { nextPlayerBlock -= damage; } else { damage -= nextPlayerBlock; nextPlayerBlock = 0; nextPlayerHp -= damage; }
        }
        if (effect.discardHand) { nextHand.length = 0; }
        if (effect.addStatus) { nextPlayerStatus.push({ ...effect.addStatus }); }
        if (effect.applyEnemyStatus) { nextEnemyStatus.push({ ...effect.applyEnemyStatus }); }
      }

      const nextEnemy = state.enemy ? { ...state.enemy, hp: nextEnemyHp, block: nextEnemyBlock, statusEffects: nextEnemyStatus } : null;
      if (nextEnemy && nextEnemy.hp <= 0) {
        const isPitBoss = nextEnemy.id === 'pit_boss';
        const draftOptions = shuffle(STARTER_CARDS).slice(0, 3).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
        const reclaimedDeck = [...state.player.deck, ...nextHand, ...nextDiscard, ...state.player.tempDiscard];
        return { phase: isPitBoss ? 'BATTLE_END' : 'DRAFT', enemy: null, player: { ...state.player, deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [], energy: 0, hp: nextPlayerHp, block: 0, oddsModifiers: [], statusEffects: [], chips: state.player.chips + 25 }, log: [`Victory! +25 Chips earned.`, ...state.log], draftOptions };
      }
      return { player: { ...state.player, hp: nextPlayerHp, block: nextPlayerBlock, hand: nextHand, discard: nextDiscard, energy: nextEnergy, statusEffects: nextPlayerStatus }, enemy: nextEnemy };
    });
  },

  endTurn: () => {
    set({ phase: 'ENEMY_TURN', bannerText: 'ENEMY TURN', selectedCards: [] });
    setTimeout(() => { set({ bannerText: null }); get().resolveEnemyTurn(); }, 1600);
  },

  resolveEnemyTurn: () => {
    const { enemy, addLog, isGodMode } = get();
    if (!enemy) return;
    const currentMove = enemy.moves[enemy.nextMoveIndex];
    setTimeout(() => {
      addLog(`${enemy.name} prepares ${currentMove.description || currentMove.intent}...`);
      setTimeout(() => {
        set((state) => {
          if (!state.enemy) return state;
          let nextPlayerHp = state.player.hp; let nextPlayerBlock = state.player.block; let nextEnemyBlock = 0;
          const dodgeValue = state.player.statusEffects.find(e => e.type === 'DODGE')?.value || 0;
          nextPlayerBlock += dodgeValue;
          if (currentMove.intent === 'ATTACK') {
            let damage = isGodMode ? 0 : currentMove.value + (state.enemy.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0);
            if (state.player.statusEffects.find(e => e.type === 'VULNERABLE')) damage = Math.floor(damage * 1.5);
            if (state.enemy.statusEffects.find(e => e.type === 'WEAK')) damage = Math.floor(damage * 0.75);
            if (nextPlayerBlock >= damage) { nextPlayerBlock -= damage; } else { damage -= nextPlayerBlock; nextPlayerBlock = 0; nextPlayerHp -= damage; }
          } else if (currentMove.intent === 'BLOCK') { nextEnemyBlock = currentMove.value; }
          if (nextPlayerHp <= 0) return { phase: 'BATTLE_END', player: { ...state.player, hp: 0, block: 0 }, log: ['GAME OVER', ...state.log] };
          const tickedPlayerStatus = tickStatusEffects(state.player.statusEffects);
          let tickedEnemyStatus = tickStatusEffects(state.enemy.statusEffects);
          if (state.enemy.id === 'pit_boss') {
            const currentStrength = state.enemy.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0;
            tickedEnemyStatus = tickedEnemyStatus.filter(e => e.type !== 'STRENGTH');
            tickedEnemyStatus.push({ type: 'STRENGTH', value: currentStrength + 2, duration: 99, name: 'House Edge' });
          }
          const nextMoveData = getNextEnemyMove(state.enemy);
          setTimeout(() => {
            const drawCount = Math.max(0, 5 - get().player.hand.length);
            set({ phase: 'PLAYER_TURN', bannerText: 'YOUR TURN', player: { ...state.player, hp: nextPlayerHp, block: 0, energy: state.player.maxEnergy, statusEffects: tickedPlayerStatus }, enemy: { ...state.enemy, ...nextMoveData, block: nextEnemyBlock, statusEffects: tickedEnemyStatus } });
            if (drawCount > 0) get().drawCards(drawCount);
            setTimeout(() => set({ bannerText: null }), 1500);
          }, 800);
          return { player: { ...state.player, hp: nextPlayerHp, block: nextPlayerBlock }, enemy: { ...state.enemy, block: nextEnemyBlock } };
        });
      }, 800); 
    }, 400);
  },

  draftCard: (card: GameCard) => {
    set((state) => {
      const nextFloor = state.floor + 1;
      const fullDeckPool = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      const newFullDeck = [...fullDeckPool, { ...card, instanceId: crypto.randomUUID() }];
      if (nextFloor % 5 === 0) { return { phase: 'MAP', floor: nextFloor, player: { ...state.player, deck: newFullDeck, hand: [], discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [] }, mapNodes: generateMapNodes(nextFloor), log: [`Floor ${nextFloor} Milestone! Choose your specialty path.`, ...state.log] }; }
      const enemy = createEnemyInstance(nextFloor, 'NORMAL');
      const finalPool = shuffle(newFullDeck);
      return { phase: 'PLAYER_TURN', floor: nextFloor, player: { ...state.player, deck: finalPool.slice(5), hand: finalPool.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [] }, enemy, bannerText: `FLOOR ${nextFloor}`, log: [`Heading to Floor ${nextFloor}... Battle: ${enemy.name}!`, ...state.log] };
    });
    if (get().phase === 'PLAYER_TURN') setTimeout(() => set({ bannerText: null }), 1500);
  }
}));
