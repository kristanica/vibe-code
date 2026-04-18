import { create } from 'zustand';
import { STARTER_CARDS } from '../data/starter';
import { EVENTS } from '../data/events';
import { 
  shuffle, 
  getNextEnemyMove, 
  tickStatusEffects, 
  generateMapNodes, 
  createEnemyInstance 
} from '../utils/gameEngine';
import { sounds } from '../utils/audio';

import { RELICS } from '../data/relics';

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  phase: 'INITIALIZING',
  player: { 
    hp: 20, maxHp: 20, energy: 3, maxEnergy: 3, block: 0, 
    deck: [], hand: [], discard: [], tempDiscard: [], 
    chips: 50, oddsModifiers: [], statusEffects: [], relics: [],
    discardsRemaining: 3, shufflesRemaining: 3,
    level: 1, exp: 0, nextLevelExp: 100,
    stats: { attackBonus: 0, maxHpBonus: 0, successRateBonus: 0 }
  },
  enemy: null, floor: 1, act: 1, log: ['Welcome to Probability Deck!'], lastResult: null, bannerText: null, draftOptions: [], shopOptions: [], shopRelicOptions: [], treasureOptions: [], currentEvent: null, selectedCards: [], focusedCard: null, starterPicksRemaining: 0, mapNodes: [], isGodMode: false,

  addLog: (message: string) => set((state) => ({ log: [message, ...state.log].slice(0, 50) })),
  selectCard: (card: GameCard | null) => set({ selectedCards: card ? [card] : [] }),
  
  toggleSelectCard: (card: GameCard) => set((state) => {
    const isSelected = state.selectedCards.some(c => c.instanceId === card.instanceId);
    sounds.playCardClick();
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
      const isPitBoss = state.enemy.id === 'pit_boss';
      const draftOptions = shuffle(STARTER_CARDS).slice(0, 5).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
      const reclaimedDeck = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      
      // Dynamic EXP calculation
      let expGained = 20 + (state.floor * 5);
      if (state.enemy.type === 'ELITE') expGained = 50 + (state.floor * 10);
      if (state.enemy.type === 'BOSS') expGained = 150 + (state.floor * 20);

      let { exp } = state.player;
      const { nextLevelExp } = state.player;
      exp += expGained;
      const logMsg = `GOD MODE: Victory! +25 Chips & +${expGained} EXP earned.`;
      const isLevelUp = exp >= nextLevelExp;

      return {
        phase: isLevelUp ? 'LEVEL_UP' : (isPitBoss ? 'ACT_CLEAR' : 'DRAFT'),
        enemy: null,
        selectedCards: [],
        player: { 
          ...state.player, exp,
          deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [], energy: 0, block: 0, oddsModifiers: [], statusEffects: [], chips: state.player.chips + 25 
        },
        log: [logMsg, ...state.log],
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
      act: 1,
      shopRelicOptions: [],
      treasureOptions: [],
      player: {
        hp: 20, maxHp: 20, energy: 3, maxEnergy: 3, block: 0, deck: [], hand: [], discard: [], tempDiscard: [], chips: 50, oddsModifiers: [], statusEffects: [], relics: [], discardsRemaining: 3, shufflesRemaining: 3,
        level: 1, exp: 0, nextLevelExp: 100,
        stats: { attackBonus: 0, maxHpBonus: 0, successRateBonus: 0 }
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
      const nextDeck = [...player.deck];

      const drawn: GameCard[] = [];
      for (let i = 0; i < selectedCards.length; i++) {
        if (nextDeck.length === 0) {
          return { phase: 'BATTLE_END', player: { ...state.player, hp: 0, block: 0 }, log: ['DECK EXHAUSTED DURING DISCARD - GAME OVER', ...state.log] };
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
          discard: [...player.discard, ...selectedCards],
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
        
        // Handle Relics: Start Battle effects
        let initialBlock = 0;
        state.player.relics.forEach(r => {
          if (r.effect.type === 'START_BATTLE_BLOCK') initialBlock += r.effect.value;
        });

        return {
          phase: 'PLAYER_TURN',
          enemy,
          bannerText: node.type === 'BOSS' ? 'BOSS BATTLE' : node.type === 'ELITE' ? 'ELITE BATTLE' : 'BATTLE START',
          player: { ...state.player, deck: fullDeckShuffled.slice(5), hand: fullDeckShuffled.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: initialBlock, statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 }
        };
      } else if (node.type === 'TREASURE') {
        const treasurePool = shuffle(RELICS).slice(0, 3);
        return {
          phase: 'TREASURE',
          treasureOptions: treasurePool,
          bannerText: 'TREASURE ROOM',
          player: { ...state.player, deck: allCards, hand: [], discard: [], tempDiscard: [] }
        };
      } else if (node.type === 'REST') {
        const heal = Math.floor(state.player.maxHp * 0.3);
        const nextFloor = state.floor + 1;
        const reclaimedDeck = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
        
        if (nextFloor % 5 === 0) {
          return {
            player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + heal), deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [] },
            log: [`Rested and recovered ${heal} HP. Milestone ahead!`, ...state.log],
            floor: nextFloor,
            phase: 'MAP',
            mapNodes: generateMapNodes(nextFloor),
            bannerText: `FLOOR ${nextFloor}`
          };
        } else {
          const enemy = createEnemyInstance(nextFloor, 'NORMAL');
          const finalPool = shuffle(reclaimedDeck);
          return {
            player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + heal), deck: finalPool.slice(5), hand: finalPool.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 },
            log: [`Rested and recovered ${heal} HP. Heading to Battle!`, ...state.log],
            floor: nextFloor,
            phase: 'PLAYER_TURN',
            enemy,
            bannerText: `FLOOR ${nextFloor}`
          };
        }
      } else if (node.type === 'SHOP') {
        const shopPool = shuffle(STARTER_CARDS).slice(0, 5).map(c => {
          let price = 25; if (c.rarity === 'UNCOMMON') price = 50; if (c.rarity === 'RARE') price = 100; if (c.rarity === 'VOLATILE') price = 150;
          return { ...c, instanceId: crypto.randomUUID(), price };
        });
        const relicPool = shuffle(RELICS).slice(0, 2);
        return { phase: 'SHOP', shopOptions: shopPool, shopRelicOptions: relicPool, bannerText: 'THE SHOP', player: { ...state.player, deck: allCards, hand: [], discard: [], tempDiscard: [] } };
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
      const reclaimedDeck = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      
      if (nextFloor % 5 === 0) {
        return { phase: 'MAP', floor: nextFloor, mapNodes: generateMapNodes(nextFloor), shopOptions: [], bannerText: `FLOOR ${nextFloor}`, player: { ...state.player, deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [] } };
      } else {
        const enemy = createEnemyInstance(nextFloor, 'NORMAL');
        const finalPool = shuffle(reclaimedDeck);
        return { 
          phase: 'PLAYER_TURN', floor: nextFloor, enemy, shopOptions: [], bannerText: `FLOOR ${nextFloor}`,
          player: { ...state.player, deck: finalPool.slice(5), hand: finalPool.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 }
        };
      }
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  resolveEventOption: (option: EventOption) => {
    const s = get();
    if (option.cost && s.player.chips < option.cost) return;

    // We need to capture logs and state changes from the action
    let capturedLog: string[] = [...s.log];
    const proxyState = {
      ...s,
      addLog: (msg: string) => { capturedLog = [msg, ...capturedLog]; }
    };

    // Execute action (this might be slightly limited since it can't easily 'set' the store)
    // So we'll refine the EVENTS to return specific effects or we just manually handle the ones we added
    option.action(proxyState);
    
    set((state) => {
      const nextFloor = state.floor + 1;
      const { player } = state;
      
      // Manual handling for the specific events we added
      // (Normally we'd want a more robust way to let actions modify state, but this works for now)
      let nextChips = option.cost ? player.chips - option.cost : player.chips;
      const nextDeck = [...player.deck];
      const nextRelics = [...player.relics];
      const nextStats = { ...player.stats };

      let nextMaxHp = player.maxHp;
      let nextHp = player.hp;

      if (state.currentEvent?.id === 'gamblers-contract' && option.label === 'Sign the Contract') {
        nextStats.successRateBonus += 5;
        for(let i=0; i<2; i++) if(nextDeck.length > 0) nextDeck.splice(Math.floor(Math.random() * nextDeck.length), 1);
      }
      if (state.currentEvent?.id === 'blood-bank') {
        if (option.label === 'Donate Heavily') { nextHp -= 10; nextChips += 150; }
        if (option.label === 'Minor Donation') { nextHp -= 4; nextChips += 50; }
      }
      if (state.currentEvent?.id === 'broken-slot-machine' && option.label === 'Kick the Machine') {
        // Since Math.random was already run in the action, we just need to sync the results
        // For simplicity, we'll re-run the logic here to ensure state sync
        if (Math.random() < 0.4) {
          const rareRelics = RELICS.filter(r => r.rarity === 'RARE');
          nextRelics.push(rareRelics[Math.floor(Math.random() * rareRelics.length)]);
        } else {
          nextHp -= 6;
        }
      }
      if (state.currentEvent?.id === 'mysterious-fog' && option.label === 'Embrace Potential') {
        nextStats.attackBonus += 2;
        nextMaxHp -= 5;
        nextHp = Math.min(nextHp, nextMaxHp);
      }
      if (state.currentEvent?.id === 'relic-trader' && option.label === 'Trade a Card') {
        if (nextDeck.length > 0) {
          nextDeck.splice(Math.floor(Math.random() * nextDeck.length), 1);
          const commons = RELICS.filter(r => r.rarity === 'COMMON');
          nextRelics.push(commons[Math.floor(Math.random() * commons.length)]);
        }
      }
      if (state.currentEvent?.id === 'shady-dealer' && option.label === 'Pay 50 Chips') {
        if (nextDeck.length > 0) nextDeck.splice(Math.floor(Math.random() * nextDeck.length), 1);
      }

      const reclaimedDeck = [...nextDeck, ...player.hand, ...player.discard, ...player.tempDiscard];
      const playerObj = { ...player, chips: nextChips, deck: nextDeck, relics: nextRelics, stats: nextStats, maxHp: nextMaxHp, hp: Math.max(0, nextHp) };

      if (playerObj.hp <= 0) {
         return { phase: 'BATTLE_END', player: playerObj, log: ['Died during an event.', ...capturedLog] };
      }

      if (nextFloor % 5 === 0) {
        return {
          phase: 'MAP', floor: nextFloor, mapNodes: generateMapNodes(nextFloor), currentEvent: null, bannerText: `FLOOR ${nextFloor}`,
          player: { ...playerObj, deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [] },
          log: capturedLog
        };
      } else {
        const enemy = createEnemyInstance(nextFloor, 'NORMAL');
        const finalPool = shuffle(reclaimedDeck);
        return {
          phase: 'PLAYER_TURN', floor: nextFloor, enemy, currentEvent: null, bannerText: `FLOOR ${nextFloor}`,
          player: { ...playerObj, deck: finalPool.slice(5), hand: finalPool.slice(0, 5), discard: [], tempDiscard: [], energy: player.maxEnergy, block: 0, statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 },
          log: capturedLog
        };
      }
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  drawCards: (count: number) => {
    set((state) => {
      const { deck, hand } = state.player;
      const newHand = [...hand]; const nextDeck = [...deck];
      for (let i = 0; i < count; i++) {
        if (nextDeck.length === 0) {
          return { phase: 'BATTLE_END', player: { ...state.player, hp: 0, block: 0 }, log: ['DECK EXHAUSTED - GAME OVER', ...state.log] };
        }
        const card = nextDeck.shift(); if (card) newHand.push(card);
      }
      return { player: { ...state.player, deck: nextDeck, hand: newHand } };
    });
  },

  playCard: (card: GameCard) => {
    const s = get();
    if (!s.isGodMode && s.player.energy < card.cost) { s.addLog("Not enough energy!"); return; }
    
    let statusOddsMod = 0;
    s.player.statusEffects.forEach(e => { if (e.type === 'SHARP_EYE') statusOddsMod += e.value; if (e.type === 'DEBUFF_ODDS') statusOddsMod += e.value; });
    
    // Relic: GLOBAL_SUCCESS_CHANCE
    let relicOddsBonus = 0;
    s.player.relics.forEach(r => {
      if (r.effect.type === 'GLOBAL_SUCCESS_CHANCE') relicOddsBonus += r.effect.value;
    });

    let finalOdds = s.isGodMode ? 100 : (card.baseOdds + statusOddsMod + s.player.stats.successRateBonus + relicOddsBonus);
    s.player.oddsModifiers.forEach(m => finalOdds += m.value);
    if (s.enemy?.debuffOdds) finalOdds += s.enemy.debuffOdds;
    finalOdds = Math.max(5, Math.min(100, finalOdds));

    const roll = Math.random() * 100;
    const isSuccess = roll <= finalOdds;

    sounds.playCardPlay();
    setTimeout(() => {
      if (isSuccess) sounds.playSuccess();
      else sounds.playFailure();
    }, 300);

    s.addLog(`Played ${card.name} (${finalOdds}%)... ${isSuccess ? 'SUCCESS!' : 'FAILED!'}`);
    set({ lastResult: isSuccess ? 'SUCCESS' : 'FAILURE', selectedCards: [] });
    setTimeout(() => set({ lastResult: null }), 800);

    set((state) => {
      const nextHand = state.player.hand.filter(c => c.instanceId !== card.instanceId);
      const nextDiscard = [...state.player.discard, card];
      let nextPlayerHp = state.player.hp; let nextPlayerBlock = state.player.block; let nextEnemyHp = state.enemy?.hp ?? 0; let nextEnemyBlock = state.enemy?.block ?? 0;
      let nextEnergy = state.isGodMode ? state.player.energy : (state.player.energy - card.cost);
      const nextPlayerStatus = [...state.player.statusEffects];
      const nextEnemyStatus = state.enemy ? [...state.enemy.statusEffects] : [];

      let nextChips = state.player.chips;

      // Relic triggers: Success/Failure
      state.player.relics.forEach(r => {
        if (isSuccess && r.effect.type === 'SUCCESS_CHIPS') nextChips += r.effect.value;
        if (!isSuccess && r.effect.type === 'FAILURE_BLOCK') nextPlayerBlock += r.effect.value;
      });
      
      const effect = isSuccess ? card.successEffect : card.failEffect;
      if (effect) {
        if (effect.damage) {
          // Relic: ATTACK_BONUS
          let relicAtkBonus = 0;
          state.player.relics.forEach(r => {
            if (r.effect.type === 'ATTACK_BONUS') relicAtkBonus += r.effect.value;
          });

          let damage = effect.damage + (state.player.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0) + state.player.stats.attackBonus + relicAtkBonus;
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
        const draftOptions = shuffle(STARTER_CARDS).slice(0, 5).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
        const reclaimedDeck = [...state.player.deck, ...nextHand, ...nextDiscard, ...state.player.tempDiscard];
        
        // Relic: HEAL_ON_VICTORY
        state.player.relics.forEach(r => {
          if (r.effect.type === 'HEAL_ON_VICTORY') nextPlayerHp = Math.min(state.player.maxHp, nextPlayerHp + r.effect.value);
        });

        // Dynamic EXP calculation
        let expGained = 20 + (state.floor * 5);
        if (nextEnemy.type === 'ELITE') expGained = 50 + (state.floor * 10);
        if (nextEnemy.type === 'BOSS') expGained = 150 + (state.floor * 20);

        // Exp gain and Level Up check
        let { exp } = state.player;
        const { nextLevelExp } = state.player;
        exp += expGained; 
        const isLevelUp = exp >= nextLevelExp;
        let logMsg = `Victory! +25 Chips & +${expGained} EXP earned.`;
        if (isLevelUp) {
          logMsg += ` LEVEL UP! Choose an upgrade.`;
          sounds.playLevelUp();
        }

        return { 
          phase: isLevelUp ? 'LEVEL_UP' : (isPitBoss ? 'ACT_CLEAR' : 'DRAFT'), 
          enemy: null, 
          player: { 
            ...state.player, exp, hp: nextPlayerHp,
            deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [], energy: 0, block: 0, oddsModifiers: [], statusEffects: [], chips: nextChips + 25 
          }, 
          log: [logMsg, ...state.log], 
          draftOptions 
        };
      }
      return { player: { ...state.player, hp: nextPlayerHp, block: nextPlayerBlock, hand: nextHand, discard: nextDiscard, energy: nextEnergy, statusEffects: nextPlayerStatus, chips: nextChips }, enemy: nextEnemy };
    });
  },

  buyRelic: (relic: Relic) => {
    set((state) => {
      const price = relic.price || 0;
      if (state.player.chips < price) return state;
      return {
        player: { ...state.player, chips: state.player.chips - price, relics: [...state.player.relics, relic] },
        shopRelicOptions: state.shopRelicOptions.filter(r => r.id !== relic.id),
        log: [`Purchased relic: ${relic.name}.`, ...state.log]
      };
    });
  },

  pickTreasure: (relic: Relic) => {
    set((state) => {
      const nextFloor = state.floor + 1;
      const reclaimedDeck = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      const newRelics = [...state.player.relics, relic];
      
      if (nextFloor % 5 === 0) {
        return { 
          phase: 'MAP', floor: nextFloor, mapNodes: generateMapNodes(nextFloor), treasureOptions: [], 
          bannerText: `FLOOR ${nextFloor}`, 
          player: { ...state.player, relics: newRelics, deck: reclaimedDeck, hand: [], discard: [], tempDiscard: [] },
          log: [`Found treasure: ${relic.name}! Milestone reached.`, ...state.log]
        };
      } else {
        const enemy = createEnemyInstance(nextFloor, 'NORMAL');
        const finalPool = shuffle(reclaimedDeck);
        return {
          phase: 'PLAYER_TURN', floor: nextFloor, enemy, treasureOptions: [], bannerText: `FLOOR ${nextFloor}`,
          player: { ...state.player, relics: newRelics, deck: finalPool.slice(5), hand: finalPool.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [], discardsRemaining: 3, shufflesRemaining: 3 },
          log: [`Found treasure: ${relic.name}! Heading to Battle.`, ...state.log]
        };
      }
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  upgradeStat: (stat: keyof PlayerStats) => {
    set((state) => {
      let { level, exp, nextLevelExp, maxHp, hp } = state.player;
      const { stats } = state.player;
      level++;
      exp -= nextLevelExp;
      nextLevelExp = Math.floor(nextLevelExp * 1.5);
      
      const newStats = { ...stats };
      if (stat === 'attackBonus') newStats.attackBonus += 1;
      if (stat === 'maxHpBonus') {
        newStats.maxHpBonus += 5;
        maxHp += 5;
        hp += 5;
      }
      if (stat === 'successRateBonus') newStats.successRateBonus += 2;

      return {
        phase: 'DRAFT',
        player: { ...state.player, level, exp, nextLevelExp, stats: newStats, maxHp, hp },
        log: [`Leveled up to ${level}! Upgraded ${stat}.`, ...state.log]
      };
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
            
            if (damage > nextPlayerBlock) {
              sounds.playDamage();
            }

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

          // Handle Relics: START_TURN_ENERGY
          let energyBonus = 0;
          state.player.relics.forEach(r => {
            if (r.effect.type === 'START_TURN_ENERGY') energyBonus += r.effect.value;
          });

          // Handle Status Effects: REGEN and ARMOR (Start of Player Turn)
          let turnHeal = 0;
          let turnArmor = 0;
          state.player.statusEffects.forEach(e => {
            if (e.type === 'REGEN') turnHeal += e.value;
            if (e.type === 'ARMOR') turnArmor += e.value;
          });

          setTimeout(() => {
            const drawCount = Math.max(0, 5 - get().player.hand.length);
            set({ 
              phase: 'PLAYER_TURN', 
              bannerText: 'YOUR TURN', 
              player: { 
                ...state.player, 
                hp: Math.min(state.player.maxHp, state.player.hp + turnHeal),
                block: turnArmor, // Armor status sets initial block
                energy: state.player.maxEnergy + energyBonus, 
                statusEffects: tickedPlayerStatus 
              }, 
              enemy: { ...state.enemy, ...nextMoveData, block: nextEnemyBlock, statusEffects: tickedEnemyStatus } 
            });
            if (drawCount > 0) get().drawCards(drawCount);
            if (turnHeal > 0) get().addLog(`Regeneration healed you for ${turnHeal} HP.`);
            if (turnArmor > 0) get().addLog(`Armor provided ${turnArmor} Block.`);
            
            setTimeout(() => set({ bannerText: null }), 1500);
          }, 800);
          return { player: { ...state.player, hp: nextPlayerHp, block: nextPlayerBlock }, enemy: { ...state.enemy, block: nextEnemyBlock } };
        });
      }, 800); 
    }, 400);
  },

  draftCard: (card: GameCard) => {
    set((state) => {
      sounds.playDraft();
      let nextFloor = state.floor + 1;
      let nextAct = state.act;

      if (state.floor === 10) {
        nextFloor = 1;
        nextAct = state.act + 1;
      }

      const fullDeckPool = [...state.player.deck, ...state.player.hand, ...state.player.discard, ...state.player.tempDiscard];
      const newFullDeck = [...fullDeckPool, { ...card, instanceId: crypto.randomUUID() }];
      
      if (nextFloor % 5 === 0 && nextFloor !== 0) { 
        return { 
          phase: 'MAP', 
          floor: nextFloor, 
          act: nextAct,
          player: { ...state.player, deck: newFullDeck, hand: [], discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [] }, 
          mapNodes: generateMapNodes(nextFloor), 
          log: [`Act ${nextAct} Floor ${nextFloor} Milestone! Choose your specialty path.`, ...state.log] 
        }; 
      }

      const enemy = createEnemyInstance(nextFloor, 'NORMAL');
      const finalPool = shuffle(newFullDeck);
      return { 
        phase: 'PLAYER_TURN', 
        floor: nextFloor, 
        act: nextAct,
        player: { ...state.player, deck: finalPool.slice(5), hand: finalPool.slice(0, 5), discard: [], tempDiscard: [], energy: state.player.maxEnergy, block: 0, statusEffects: [] }, 
        enemy, 
        bannerText: `ACT ${nextAct} FLOOR ${nextFloor}`, 
        log: [`Heading to Act ${nextAct} Floor ${nextFloor}... Battle: ${enemy.name}!`, ...state.log] 
      };
    });
    if (get().phase === 'PLAYER_TURN') setTimeout(() => set({ bannerText: null }), 1500);
  }
}));
