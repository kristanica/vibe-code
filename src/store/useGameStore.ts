import { create } from "zustand";
import { STARTER_CARDS } from "../data/starter";
import { EVENTS } from "../data/events";
import {
  shuffle,
  getNextEnemyMove,
  tickStatusEffects,
  generateMapNodes,
  createEnemyInstance,
  calculateSuccessOdds,
  applyCardEffects,
  calculateEnemyAction,
  calculateVictoryState,
  getAvailableCards,
} from "../utils/gameEngine";
import { sounds } from "../utils/audio";

import { RELICS } from "../data/relics";

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  phase: "INITIALIZING",
  score: 0,
  combo: 0,
  highestCombo: 0,
  setCombo: (amount: number) => set((state) => {
    const newHighest = Math.max(state.highestCombo, amount);
    return { combo: amount, highestCombo: newHighest };
  }),
  addScore: (amount: number) =>
    set((state) => ({ score: state.score + amount })),
  resetScore: () => set({ score: 0, combo: 0, highestCombo: 0 }),
  player: {
    hp: 20,
    maxHp: 20,
    energy: 10,
    maxEnergy: 10,
    block: 0,
    deck: [],
    hand: [],
    discard: [],
    tempDiscard: [],
    chips: 50,
    oddsModifiers: [],
    statusEffects: [],
    relics: [],
    playsRemaining: 3,
    maxPlays: 3,
    discardsRemaining: 3,
    shufflesRemaining: 3,
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    stats: { attackBonus: 0, maxHpBonus: 0, successRateBonus: 0 },
  },
  enemy: null,
  floor: 1,
  act: 1,
  log: ["Welcome to Probability Deck!"],
  lastResult: null,
  bannerText: null,
  draftOptions: [],
  shopOptions: [],
  shopRelicOptions: [],
  treasureOptions: [],
  currentEvent: null,
  selectedCards: [],
  focusedCard: null,
  starterPicksRemaining: 0,
  mapNodes: [],
  isGodMode: false,
  removalPrice: 50,
  upgradePrice: 100,
  shopSelectionMode: "NONE",

  addLog: (message: string) =>
    set((state) => ({ log: [message, ...state.log].slice(0, 50) })),
  selectCard: (card: GameCard | null) =>
    set({ selectedCards: card ? [card] : [] }),

  toggleSelectCard: (card: GameCard) =>
    set((state) => {
      const isSelected = state.selectedCards.some(
        (c) => c.instanceId === card.instanceId,
      );
      sounds.playCardClick();
      if (isSelected) {
        return {
          selectedCards: state.selectedCards.filter(
            (c) => c.instanceId !== card.instanceId,
          ),
        };
      } else {
        if (state.phase === "SHOP") {
          if (state.shopSelectionMode === "REMOVE") {
            get().removeCard(card.instanceId!);
            return { selectedCards: [] };
          }
          if (state.shopSelectionMode === "UPGRADE") {
            get().upgradeCard(card.instanceId!);
            return { selectedCards: [] };
          }
        }
        return { selectedCards: [...state.selectedCards, card] };
      }
    }),

  removeCard: (instanceId: string) => {
    set((state) => {
      if (state.player.chips < state.removalPrice) return state;
      const nextDeck = state.player.deck.filter(
        (c) => c.instanceId !== instanceId,
      );
      const nextHand = state.player.hand.filter(
        (c) => c.instanceId !== instanceId,
      );
      const nextDiscard = state.player.discard.filter(
        (c) => c.instanceId !== instanceId,
      );

      return {
        player: {
          ...state.player,
          chips: state.player.chips - state.removalPrice,
          deck: nextDeck,
          hand: nextHand,
          discard: nextDiscard,
        },
        shopSelectionMode: "NONE",
        log: [`Removed card from deck.`, ...state.log],
      };
    });
  },

  upgradeCard: (instanceId: string) => {
    set((state) => {
      if (state.player.chips < state.upgradePrice) return state;

      const upgradeOne = (c: GameCard): GameCard => {
        if (c.instanceId !== instanceId) return c;
        const nextCost = Math.max(0, c.cost - 1);
        return {
          ...c,
          name: `${c.name}+`,
          cost: nextCost,
          baseOdds: Math.min(100, c.baseOdds + 10),
        };
      };

      return {
        player: {
          ...state.player,
          chips: state.player.chips - state.upgradePrice,
          deck: state.player.deck.map(upgradeOne),
          hand: state.player.hand.map(upgradeOne),
          discard: state.player.discard.map(upgradeOne),
        },
        upgradePrice: state.upgradePrice + 50,
        shopSelectionMode: "NONE",
        log: [`Upgraded card!`, ...state.log],
      };
    });
  },

  setShopSelectionMode: (mode: "NONE" | "REMOVE" | "UPGRADE") =>
    set({ shopSelectionMode: mode }),

  buyDiscard: () =>
    set((state) => {
      if (state.player.chips < 50 || state.player.discardsRemaining >= 3)
        return state;
      return {
        player: {
          ...state.player,
          chips: state.player.chips - 50,
          discardsRemaining: state.player.discardsRemaining + 1,
        },
        log: ["Purchased +1 Discard (Pitch).", ...state.log],
      };
    }),

  buyShuffle: () =>
    set((state) => {
      if (state.player.chips < 50 || state.player.shufflesRemaining >= 3)
        return state;
      return {
        player: {
          ...state.player,
          chips: state.player.chips - 50,
          shufflesRemaining: state.player.shufflesRemaining + 1,
        },
        log: ["Purchased +1 Shuffle (Mulligan).", ...state.log],
      };
    }),

  clearSelection: () => set({ selectedCards: [] }),
  setFocusedCard: (card: GameCard | null) => set({ focusedCard: card }),
  toggleGodMode: () => set((state) => ({ isGodMode: !state.isGodMode })),

  instaWin: () => {
    set((state) => {
      if (!state.enemy) return state;
      const isPitBoss = state.enemy.id === "pit_boss";

      const availableCards = getAvailableCards(STARTER_CARDS, state.player);
      // Card pool with rarity weights
      const getDraftPool = () => {
        const exclusiveRoll = Math.random();
        if (exclusiveRoll < 0.05) {
          const exclusives = availableCards.filter(
            (c) => c.rarity === "EXCLUSIVE",
          );
          if (exclusives.length > 0) {
            return shuffle(exclusives)
              .slice(0, 5)
              .map((c) => ({ ...c, instanceId: crypto.randomUUID() }));
          }
        }
        return shuffle(availableCards.filter((c) => c.rarity !== "EXCLUSIVE"))
          .slice(0, 5)
          .map((c) => ({ ...c, instanceId: crypto.randomUUID() }));
      };

      const draftOptions = getDraftPool();
      const reclaimedDeck = [
        ...state.player.deck,
        ...state.player.hand,
        ...state.player.discard,
        ...state.player.tempDiscard,
      ];

      // Dynamic EXP calculation
      let expGained = 20 + state.floor * 5;
      if (state.enemy.type === "ELITE") expGained = 50 + state.floor * 10;
      if (state.enemy.type === "BOSS") expGained = 150 + state.floor * 20;

      let { exp } = state.player;
      const { nextLevelExp } = state.player;
      exp += expGained;
      const logMsg = `GOD MODE: Victory! +25 Chips & +${expGained} EXP earned.`;
      const isLevelUp = exp >= nextLevelExp;

      return {
        phase: isLevelUp ? "LEVEL_UP" : isPitBoss ? "ACT_CLEAR" : "DRAFT",
        enemy: null,
        selectedCards: [],
        player: {
          ...state.player,
          exp,
          deck: reclaimedDeck,
          hand: [],
          discard: [],
          tempDiscard: [],
          block: 0,
          oddsModifiers: [],
          statusEffects: [],
          chips: state.player.chips + 25,
        },
        log: [logMsg, ...state.log],
        draftOptions,
      };
    });
  },

  setBanner: (text: string) => {
    set({ bannerText: text });
    setTimeout(() => set({ bannerText: null }), 1500);
  },
  clearBanner: () => set({ bannerText: null }),

  startGame: () => {
    const pool = shuffle(STARTER_CARDS.filter((c) => c.rarity === "COMMON"))
      .slice(0, 5)
      .map((c) => ({ ...c, instanceId: crypto.randomUUID() }));
    set({
      phase: "STARTER_SELECT",
      starterPicksRemaining: 3,
      draftOptions: pool,
      floor: 1,
      act: 1,
      shopRelicOptions: [],
      treasureOptions: [],
      player: {
        hp: 20,
        maxHp: 20,
        energy: 10,
        maxEnergy: 10,
        block: 0,
        deck: [],
        hand: [],
        discard: [],
        tempDiscard: [],
        chips: 50,
        oddsModifiers: [],
        statusEffects: [],
        relics: [],
        playsRemaining: 3,
        maxPlays: 3,
        discardsRemaining: 3,
        shufflesRemaining: 3,
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        stats: { attackBonus: 0, maxHpBonus: 0, successRateBonus: 0 },
      },
    });
  },

  pickStarterCard: (card: GameCard) => {
    set((state) => {
      const newPicked = [
        ...state.player.deck,
        { ...card, instanceId: crypto.randomUUID(), isNew: true },
      ];
      const remainingPicks = state.starterPicksRemaining - 1;

      if (remainingPicks > 0) {
        return {
          player: { ...state.player, deck: newPicked },
          starterPicksRemaining: remainingPicks,
          draftOptions: state.draftOptions.filter(
            (c) => c.instanceId !== card.instanceId,
          ),
        };
      } else {
        const pickedCards = [...newPicked];
        const generatedCards: GameCard[] = [];
        const pool = STARTER_CARDS.filter(
          (c) => c.rarity === "COMMON" || c.rarity === "UNCOMMON",
        );
        const attacks = pool.filter((c) => c.type === "ATTACK");
        const defenses = pool.filter((c) => c.type === "DEFENSE");
        const others = pool.filter(
          (c) => c.type !== "ATTACK" && c.type !== "DEFENSE",
        );

        const getCardFrom = (p: GameCard[]) => ({
          ...(p.length ? p : pool)[
            Math.floor(Math.random() * (p.length || pool.length))
          ],
          instanceId: crypto.randomUUID(),
        });

        // Ensure a balanced base of 5 Attacks and 4 Defenses
        for (let i = 0; i < 5; i++) generatedCards.push(getCardFrom(attacks));
        for (let i = 0; i < 4; i++) generatedCards.push(getCardFrom(defenses));

        // Fill the rest with utility/gamble/synergy cards
        while (pickedCards.length + generatedCards.length < 15) {
          generatedCards.push(getCardFrom(others.length ? others : pool));
        }

        const shuffledGenerated = shuffle(generatedCards);
        // Initial hand: 3 picked cards + 2 random cards
        const initialHand = [...pickedCards, ...shuffledGenerated.slice(0, 2)];
        const initialDeck = shuffledGenerated.slice(2);

        const enemy = createEnemyInstance(1, "NORMAL", state.player);
        return {
          phase: "PLAYER_TURN",
          starterPicksRemaining: 0,
          draftOptions: [],
          player: {
            ...state.player,
            deck: initialDeck,
            hand: initialHand,
            discard: [],
            tempDiscard: [],
          },
          enemy,
          log: [
            `Deck assembled (15 cards)! Battle 1: ${enemy.name}`,
            ...state.log,
          ],
          bannerText: "BATTLE START",
        };
      }
    });
    if (get().phase === "PLAYER_TURN")
      setTimeout(() => set({ bannerText: null }), 1500);
  },

  discardSelected: () => {
    set((state) => {
      const { player, selectedCards, log } = state;
      if (selectedCards.length === 0 || player.discardsRemaining <= 0)
        return state;

      const selectedIds = new Set(selectedCards.map((c) => c.instanceId));
      const newHand = player.hand.filter((c) => !selectedIds.has(c.instanceId));
      const energyGained = selectedCards.length;
      return {
        selectedCards: [],
        player: {
          ...player,
          energy: Math.min(player.maxEnergy, player.energy + energyGained),
          hand: newHand,
          discard: [...player.discard, ...selectedCards],
          discardsRemaining: player.discardsRemaining - 1,
        },
        log: [
          `Discarded ${selectedCards.length} cards and recovered ${energyGained} Energy.`,
          ...log,
        ],
      };
    });
  },

  shuffleHand: () => {
    set((state) => {
      const { player, log } = state;
      if (player.shufflesRemaining <= 0) return state;
      const fullPool = shuffle([
        ...player.deck,
        ...player.discard,
        ...player.hand,
      ]);
      return {
        selectedCards: [],
        player: {
          ...player,
          hand: fullPool.slice(0, 5),
          deck: fullPool.slice(5),
          discard: [],
          shufflesRemaining: player.shufflesRemaining - 1,
        },
        log: [`Shuffled full deck into hand.`, ...log],
      };
    });
  },

  selectMapNode: (node: MapNode) => {
    set((state) => {
      const allCards = [
        ...state.player.deck,
        ...state.player.hand,
        ...state.player.discard,
        ...state.player.tempDiscard,
      ];
      const fullDeckShuffled = shuffle(allCards);

      if (
        node.type === "ELITE" ||
        node.type === "BOSS" ||
        node.type === "BATTLE"
      ) {
        const enemyType =
          node.type === "BOSS"
            ? "BOSS"
            : node.type === "ELITE"
              ? "ELITE"
              : "NORMAL";
        const enemy = createEnemyInstance(state.floor, enemyType, state.player);

        // Handle Relics: Start Battle effects
        let initialBlock = 0;
        state.player.relics.forEach((r) => {
          if (r.effect.type === "START_BATTLE_BLOCK")
            initialBlock += r.effect.value;
        });

        return {
          phase: "PLAYER_TURN",
          enemy,
          bannerText:
            node.type === "BOSS"
              ? "BOSS BATTLE"
              : node.type === "ELITE"
                ? "ELITE BATTLE"
                : "BATTLE START",
          player: {
            ...state.player,
            deck: fullDeckShuffled.slice(5),
            hand: fullDeckShuffled.slice(0, 5),
            discard: [],
            tempDiscard: [],
            block: initialBlock,
            statusEffects: [],
            playsRemaining: 3,
          },
        };
      } else if (node.type === "TREASURE") {
        const treasurePool = shuffle(RELICS).slice(0, 3);
        return {
          phase: "TREASURE",
          treasureOptions: treasurePool,
          bannerText: "TREASURE ROOM",
          player: {
            ...state.player,
            deck: allCards,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
        };
      } else if (node.type === "REST") {
        const heal = Math.floor(state.player.maxHp * 0.3);
        const nextFloor = state.floor + 1;
        const reclaimedDeck = [
          ...state.player.deck,
          ...state.player.hand,
          ...state.player.discard,
          ...state.player.tempDiscard,
        ];

        if (nextFloor % 5 === 0) {
          return {
            player: {
              ...state.player,
              hp: Math.min(state.player.maxHp, state.player.hp + heal),
              deck: reclaimedDeck,
              hand: [],
              discard: [],
              tempDiscard: [],
              discardsRemaining: Math.min(3, state.player.discardsRemaining + 1),
              shufflesRemaining: Math.min(3, state.player.shufflesRemaining + 1),
            },
            log: [
              `Rested and recovered ${heal} HP, +1 Discard/Shuffle. Milestone ahead!`,
              ...state.log,
            ],
            floor: nextFloor,
            phase: "MAP",
            mapNodes: generateMapNodes(nextFloor),
            bannerText: `FLOOR ${nextFloor}`,
          };
        } else {
          const enemy = createEnemyInstance(nextFloor, "NORMAL", state.player);
          const finalPool = shuffle(reclaimedDeck);
          return {
            player: {
              ...state.player,
              hp: Math.min(state.player.maxHp, state.player.hp + heal),
              deck: finalPool.slice(5),
              hand: finalPool.slice(0, 5),
              discard: [],
              tempDiscard: [],
              block: 0,
              statusEffects: [],
              playsRemaining: 3,
              energy: Math.min(state.player.maxEnergy, state.player.energy + 5),
              discardsRemaining: Math.min(3, state.player.discardsRemaining + 1),
              shufflesRemaining: Math.min(3, state.player.shufflesRemaining + 1),
            },
            log: [
              `Rested: +${heal} HP, +5 Energy, +1 Pitch/Mulligan. Heading to Battle!`,
              ...state.log,
            ],
            floor: nextFloor,
            phase: "PLAYER_TURN",
            enemy,
            bannerText: `FLOOR ${nextFloor}`,
          };
        }
      } else if (node.type === "SHOP") {
        const getShopPool = () => {
          const availableCards = getAvailableCards(STARTER_CARDS, state.player);
          const exclusiveRoll = Math.random();
          if (exclusiveRoll < 0.05) {
            const exclusives = availableCards.filter(
              (c) => c.rarity === "EXCLUSIVE",
            );
            if (exclusives.length > 0) {
              return shuffle(exclusives)
                .slice(0, 5)
                .map((c) => {
                  const price = 250; // Exclusive price
                  return { ...c, instanceId: crypto.randomUUID(), price };
                });
            }
          }
          return shuffle(availableCards.filter((c) => c.rarity !== "EXCLUSIVE"))
            .slice(0, 5)
            .map((c) => {
              let price = 25;
              if (c.rarity === "UNCOMMON") price = 50;
              if (c.rarity === "RARE") price = 100;
              if (c.rarity === "VOLATILE") price = 150;
              return { ...c, instanceId: crypto.randomUUID(), price };
            });
        };
        const shopPool = getShopPool();
        const relicPool = shuffle(RELICS).slice(0, 2);
        return {
          phase: "SHOP",
          shopOptions: shopPool,
          shopRelicOptions: relicPool,
          bannerText: "THE SHOP",
          player: {
            ...state.player,
            deck: allCards,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
        };
      } else if (node.type === "EVENT") {
        const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        return {
          phase: "EVENT",
          currentEvent: randomEvent,
          bannerText: "EVENT",
          player: {
            ...state.player,
            deck: allCards,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
        };
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
        player: {
          ...state.player,
          chips: state.player.chips - price,
          deck: [...state.player.deck, card],
        },
        shopOptions: state.shopOptions.filter(
          (o) => o.instanceId !== card.instanceId,
        ),
        log: [`Purchased ${card.name} for ${price} chips.`, ...state.log],
      };
    });
  },

  leaveShop: () => {
    set((state) => {
      const nextFloor = state.floor + 1;
      const reclaimedDeck = [
        ...state.player.deck,
        ...state.player.hand,
        ...state.player.discard,
        ...state.player.tempDiscard,
      ];

      if (nextFloor % 5 === 0) {
        return {
          phase: "MAP",
          floor: nextFloor,
          mapNodes: generateMapNodes(nextFloor),
          shopOptions: [],
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...state.player,
            deck: reclaimedDeck,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
        };
      } else {
        const enemy = createEnemyInstance(nextFloor, "NORMAL", state.player);
        const finalPool = shuffle(reclaimedDeck);
        return {
          phase: "PLAYER_TURN",
          floor: nextFloor,
          enemy,
          shopOptions: [],
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...state.player,
            deck: finalPool.slice(5),
            hand: finalPool.slice(0, 5),
            discard: [],
            tempDiscard: [],
            block: 0,
            statusEffects: [],
            playsRemaining: 3,
          },
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
      addLog: (msg: string) => {
        capturedLog = [msg, ...capturedLog];
      },
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

      if (
        state.currentEvent?.id === "gamblers-contract" &&
        option.label === "Sign the Contract"
      ) {
        nextStats.successRateBonus += 5;
        for (let i = 0; i < 2; i++)
          if (nextDeck.length > 0)
            nextDeck.splice(Math.floor(Math.random() * nextDeck.length), 1);
      }
      if (state.currentEvent?.id === "blood-bank") {
        if (option.label === "Donate Heavily") {
          nextHp -= 10;
          nextChips += 150;
        }
        if (option.label === "Minor Donation") {
          nextHp -= 4;
          nextChips += 50;
        }
      }
      if (
        state.currentEvent?.id === "broken-slot-machine" &&
        option.label === "Kick the Machine"
      ) {
        // Since Math.random was already run in the action, we just need to sync the results
        // For simplicity, we'll re-run the logic here to ensure state sync
        if (Math.random() < 0.4) {
          const rareRelics = RELICS.filter((r) => r.rarity === "RARE");
          nextRelics.push(
            rareRelics[Math.floor(Math.random() * rareRelics.length)],
          );
        } else {
          nextHp -= 6;
        }
      }
      if (
        state.currentEvent?.id === "mysterious-fog" &&
        option.label === "Embrace Potential"
      ) {
        nextStats.attackBonus += 2;
        nextMaxHp -= 5;
        nextHp = Math.min(nextHp, nextMaxHp);
      }
      if (
        state.currentEvent?.id === "relic-trader" &&
        option.label === "Trade a Card"
      ) {
        if (nextDeck.length > 0) {
          nextDeck.splice(Math.floor(Math.random() * nextDeck.length), 1);
          const commons = RELICS.filter((r) => r.rarity === "COMMON");
          nextRelics.push(commons[Math.floor(Math.random() * commons.length)]);
        }
      }
      if (
        state.currentEvent?.id === "shady-dealer" &&
        option.label === "Pay 50 Chips"
      ) {
        if (nextDeck.length > 0)
          nextDeck.splice(Math.floor(Math.random() * nextDeck.length), 1);
      }

      const reclaimedDeck = [
        ...nextDeck,
        ...player.hand,
        ...player.discard,
        ...player.tempDiscard,
      ];
      const playerObjFinal = {
        ...player,
        chips: nextChips,
        deck: nextDeck,
        relics: nextRelics,
        stats: nextStats,
        maxHp: nextMaxHp,
        hp: Math.max(0, nextHp),
      };

      if (state.currentEvent?.id === "elite-reward") {
        if (option.label === "Combat Focus") {
          nextStats.attackBonus += 3;
          capturedLog.unshift("GAINED: +3 Attack.");
        }
        if (option.label === "Vitality Surge") {
          nextMaxHp += 15;
          nextHp += 15;
          nextStats.maxHpBonus += 15;
          capturedLog.unshift("GAINED: +15 Max HP.");
        }
        if (option.label === "Tactical Precision") {
          nextStats.successRateBonus += 10;
          capturedLog.unshift("GAINED: +10% Success Rate.");
        }
        if (option.label === "Exclusive Tech") {
          const availableCards = getAvailableCards(
            STARTER_CARDS,
            playerObjFinal,
          );
          const exclusives = availableCards.filter(
            (c) => c.rarity === "EXCLUSIVE",
          );
          const draftOptions = shuffle(exclusives)
            .slice(0, 3)
            .map((c) => ({ ...c, instanceId: crypto.randomUUID() }));
          return {
            phase: "DRAFT",
            draftOptions,
            currentEvent: null,
            player: {
              ...playerObjFinal,
              stats: nextStats,
              maxHp: nextMaxHp,
              hp: nextHp,
            },
            log: ["Accessing Restricted Data...", ...capturedLog],
          };
        }

        // Return updated stats if they didn't pick Exclusive Tech
        const playerWithStats = {
          ...playerObjFinal,
          stats: nextStats,
          maxHp: nextMaxHp,
          hp: nextHp,
        };
        const isLevelUp = playerWithStats.exp >= playerWithStats.nextLevelExp;
        if (isLevelUp) {
          capturedLog.unshift("LEVEL UP! Choose an upgrade.");
          sounds.playLevelUp();
          return {
            phase: "LEVEL_UP",
            floor: nextFloor,
            currentEvent: null,
            bannerText: `FLOOR ${nextFloor}`,
            player: {
              ...playerWithStats,
              deck: reclaimedDeck,
              hand: [],
              discard: [],
              tempDiscard: [],
            },
            log: capturedLog,
          };
        }

        if (nextFloor % 5 === 0) {
          return {
            phase: "MAP",
            floor: nextFloor,
            mapNodes: generateMapNodes(nextFloor),
            currentEvent: null,
            bannerText: `FLOOR ${nextFloor}`,
            player: {
              ...playerWithStats,
              deck: reclaimedDeck,
              hand: [],
              discard: [],
              tempDiscard: [],
            },
            log: capturedLog,
          };
        } else {
          const enemy = createEnemyInstance(nextFloor, "NORMAL", state.player);
          const finalPool = shuffle(reclaimedDeck);
          return {
            phase: "PLAYER_TURN",
            floor: nextFloor,
            enemy,
            currentEvent: null,
            bannerText: `FLOOR ${nextFloor}`,
            player: {
              ...playerWithStats,
              deck: finalPool.slice(5),
              hand: finalPool.slice(0, 5),
              discard: [],
              tempDiscard: [],
              energy: player.maxEnergy,
              block: 0,
              statusEffects: [],
              playsRemaining: 3,
              discardsRemaining: 3,
              shufflesRemaining: 3,
            },
            log: capturedLog,
          };
        }
      }

      const isLevelUp = playerObjFinal.exp >= playerObjFinal.nextLevelExp;

      if (playerObjFinal.hp <= 0) {
        return {
          phase: "BATTLE_END",
          player: playerObjFinal,
          log: ["Died during an event.", ...capturedLog],
        };
      }

      if (isLevelUp) {
        capturedLog.unshift("LEVEL UP! Choose an upgrade.");
        sounds.playLevelUp();
        return {
          phase: "LEVEL_UP",
          floor: nextFloor,
          currentEvent: null,
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...playerObjFinal,
            deck: reclaimedDeck,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
          log: capturedLog,
        };
      }

      if (nextFloor % 5 === 0) {
        return {
          phase: "MAP",
          floor: nextFloor,
          mapNodes: generateMapNodes(nextFloor),
          currentEvent: null,
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...playerObjFinal,
            deck: reclaimedDeck,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
          log: capturedLog,
        };
      } else {
        const enemy = createEnemyInstance(nextFloor, "NORMAL", state.player);
        const finalPool = shuffle(reclaimedDeck);
        return {
          phase: "PLAYER_TURN",
          floor: nextFloor,
          enemy,
          currentEvent: null,
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...playerObjFinal,
            deck: finalPool.slice(5),
            hand: finalPool.slice(0, 5),
            discard: [],
            tempDiscard: [],
            energy: player.maxEnergy,
            block: 0,
            statusEffects: [],
            playsRemaining: 3,
          },
          log: capturedLog,
        };
      }
    });
    setTimeout(() => set({ bannerText: null }), 1500);
  },

  drawCards: (count: number) => {
    set((state) => {
      const { deck, hand } = state.player;
      const newHand = [...hand];
      const nextDeck = [...deck];
      for (let i = 0; i < count; i++) {
        if (nextDeck.length === 0) {
          return {
            phase: "BATTLE_END",
            player: { ...state.player, hp: 0, block: 0 },
            log: ["DECK EXHAUSTED - GAME OVER", ...state.log],
          };
        }
        const card = nextDeck.shift();
        if (card) newHand.push(card);
      }
      return { player: { ...state.player, deck: nextDeck, hand: newHand } };
    });
  },

  playCard: (card: GameCard) => {
    const s = get();
    if (!s.isGodMode && s.player.energy < card.cost) {
      s.addLog("Not enough energy!");
      return;
    }
    if (!s.isGodMode && s.player.playsRemaining <= 0) {
      s.addLog("No plays remaining! End your turn.");
      return;
    }

    const finalOdds = calculateSuccessOdds(
      card,
      s.player,
      s.enemy,
      s.isGodMode,
    );
    const roll = Math.random() * 100;
    const isSuccess = roll <= finalOdds;

    sounds.playCardPlay();
    setTimeout(() => {
      if (isSuccess) sounds.playSuccess();
      else sounds.playFailure();
    }, 300);

    s.addLog(
      `Played ${card.name} (${finalOdds}%)... ${isSuccess ? "SUCCESS!" : "FAILED!"}`,
    );
    set({ lastResult: isSuccess ? "SUCCESS" : "FAILURE", selectedCards: [] });
    setTimeout(() => set({ lastResult: null }), 800);

    // Award points for playing a card and handle combos
    if (isSuccess) {
      const newCombo = s.combo + 1;
      get().setCombo(newCombo);
      const comboBonus = newCombo > 1 ? newCombo * 5 : 0;
      get().addScore(10 + comboBonus);
      if (comboBonus > 0) {
        s.addLog(`COMBO x${newCombo}! (+${comboBonus} Bonus Score)`);
      }
    } else {
      if (s.combo > 2) s.addLog(`Combo Broken!`);
      get().setCombo(0);
      get().addScore(2);
    }

    set((state) => {
      const { player, enemy, isGodMode, floor } = state;
      const {
        player: nextPlayer,
        enemy: nextEnemyRaw,
        logs,
      } = applyCardEffects(isSuccess, card, player, enemy, isGodMode);

      const nextHand = nextPlayer.hand.filter(
        (c) => c.instanceId !== card.instanceId,
      );
      const nextDiscard = [...nextPlayer.discard, card];
      const nextEnergy = isGodMode
        ? nextPlayer.energy
        : nextPlayer.energy - card.cost;
      const nextPlays = isGodMode
        ? nextPlayer.playsRemaining
        : nextPlayer.playsRemaining - 1;

      const nextEnemy = nextEnemyRaw ? { ...nextEnemyRaw } : null;
      const nextLog = [...logs, ...state.log];

      if (nextEnemy && nextEnemy.hp <= 0) {
        // Award points for defeating an enemy (normal = 100, elite = 250, boss = 500)
        let scoreAward = 100;
        if (nextEnemy.type === "ELITE") scoreAward = 250;
        if (nextEnemy.type === "BOSS") scoreAward = 500;
        get().addScore(scoreAward);
        const v = calculateVictoryState(
          nextPlayer,
          nextEnemy,
          floor,
          STARTER_CARDS,
        );
        const reclaimedDeck = [
          ...nextPlayer.deck,
          ...nextHand,
          ...nextDiscard,
          ...nextPlayer.tempDiscard,
        ];

        if (v.isLevelUp) sounds.playLevelUp();

        if (v.isElite) {
          const eliteEvent: GameEvent = {
            id: "elite-reward",
            title: "Elite Vanquished",
            description:
              "The enforcer lies defeated. Choose your specialized spoils:",
            options: [
              {
                label: "Combat Focus",
                description: "Gain +3 permanent Attack.",
                action: () => {},
              },
              {
                label: "Vitality Surge",
                description: "Gain +15 permanent Max HP.",
                action: () => {},
              },
              {
                label: "Tactical Precision",
                description: "Gain +10% permanent Success Rate.",
                action: () => {},
              },
              {
                label: "Exclusive Tech",
                description: "Draft a powerful EXCLUSIVE card.",
                action: () => {},
              },
            ],
          };

          return {
            phase: "EVENT",
            currentEvent: eliteEvent,
            enemy: null,
            player: {
              ...nextPlayer,
              exp: v.nextExp,
              hp: v.nextPlayerHp,
              maxHp: v.nextMaxHp,
              stats: v.nextStats,
              deck: reclaimedDeck,
              hand: [],
              discard: [],
              tempDiscard: [],
              block: 0,
              oddsModifiers: [],
              statusEffects: [],
              chips: nextPlayer.chips + 25,
            },
            log: [
              `Elite Victory! +${v.expGained} EXP earned.`,
              ...v.logs,
              ...nextLog,
            ],
          };
        }

        return {
          phase: v.isLevelUp ? "LEVEL_UP" : v.isPitBoss ? "ACT_CLEAR" : "DRAFT",
          enemy: null,
          player: {
            ...nextPlayer,
            exp: v.nextExp,
            hp: v.nextPlayerHp,
            maxHp: v.nextMaxHp,
            stats: v.nextStats,
            deck: reclaimedDeck,
            hand: [],
            discard: [],
            tempDiscard: [],
            block: 0,
            oddsModifiers: [],
            statusEffects: [],
            chips: nextPlayer.chips + 25,
          },
          log: [
            `Victory! +25 Chips & +${v.expGained} EXP earned.`,
            ...v.logs,
            ...nextLog,
          ],
          draftOptions: v.draftOptions,
        };
      }

      return {
        player: {
          ...nextPlayer,
          hand: nextHand,
          discard: nextDiscard,
          energy: nextEnergy,
          playsRemaining: nextPlays,
        },
        enemy: nextEnemy,
        log: nextLog.slice(0, 50),
      };
    });
  },

  buyRelic: (relic: Relic) => {
    set((state) => {
      const price = relic.price || 0;
      if (state.player.chips < price) return state;
      return {
        player: {
          ...state.player,
          chips: state.player.chips - price,
          relics: [...state.player.relics, relic],
        },
        shopRelicOptions: state.shopRelicOptions.filter(
          (r) => r.id !== relic.id,
        ),
        log: [`Purchased relic: ${relic.name}.`, ...state.log],
      };
    });
  },

  pickTreasure: (relic: Relic) => {
    set((state) => {
      const nextFloor = state.floor + 1;
      const reclaimedDeck = [
        ...state.player.deck,
        ...state.player.hand,
        ...state.player.discard,
        ...state.player.tempDiscard,
      ];
      const newRelics = [...state.player.relics, relic];

      if (nextFloor % 5 === 0) {
        return {
          phase: "MAP",
          floor: nextFloor,
          mapNodes: generateMapNodes(nextFloor),
          treasureOptions: [],
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...state.player,
            relics: newRelics,
            deck: reclaimedDeck,
            hand: [],
            discard: [],
            tempDiscard: [],
          },
          log: [
            `Found treasure: ${relic.name}! Milestone reached.`,
            ...state.log,
          ],
        };
      } else {
        const enemy = createEnemyInstance(nextFloor, "NORMAL", state.player);
        const finalPool = shuffle(reclaimedDeck);
        return {
          phase: "PLAYER_TURN",
          floor: nextFloor,
          enemy,
          treasureOptions: [],
          bannerText: `FLOOR ${nextFloor}`,
          player: {
            ...state.player,
            relics: newRelics,
            deck: finalPool.slice(5),
            hand: finalPool.slice(0, 5),
            discard: [],
            tempDiscard: [],
            block: 0,
            statusEffects: [],
            playsRemaining: 3,
          },
          log: [
            `Found treasure: ${relic.name}! Heading to Battle.`,
            ...state.log,
          ],
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
      if (stat === "attackBonus") newStats.attackBonus += 1;
      if (stat === "maxHpBonus") {
        newStats.maxHpBonus += 5;
        maxHp += 5;
        hp += 5;
      }
      if (stat === "successRateBonus") newStats.successRateBonus += 2;

      return {
        phase: "DRAFT",
        player: {
          ...state.player,
          level,
          exp,
          nextLevelExp,
          stats: newStats,
          maxHp,
          hp,
          discardsRemaining: Math.min(3, state.player.discardsRemaining + 1),
          shufflesRemaining: Math.min(3, state.player.shufflesRemaining + 1),
        },
        log: [`Leveled up to ${level}! Upgraded ${stat}. (+1 Discard/Shuffle)`, ...state.log],
      };
    });
  },

  endTurn: () => {
    set({ phase: "ENEMY_TURN", bannerText: "ENEMY TURN", selectedCards: [] });
    setTimeout(() => {
      set({ bannerText: null });
      get().resolveEnemyTurn();
    }, 1600);
  },

  resolveEnemyTurn: async () => {
    const { enemy, addLog, isGodMode } = get();
    if (!enemy) return;
    const currentMove = enemy.moves[enemy.nextMoveIndex];

    await new Promise((r) => setTimeout(r, 400));
    addLog(
      `${enemy.name} prepares ${currentMove.description || currentMove.intent}...`,
    );
    await new Promise((r) => setTimeout(r, 800));

    const state = get();
    if (!state.enemy) return;

    const sequence = calculateEnemyAction(state.enemy, state.player, isGodMode);

    let nextPlayer = state.player;
    let nextEnemyAction = state.enemy;

    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      step.logs.forEach((msg) => get().addLog(msg));

      set({ player: step.player, enemy: step.enemy });

      nextPlayer = step.player;
      nextEnemyAction = step.enemy;

      if (nextPlayer.hp <= 0) {
        setTimeout(() => {
          set({
            phase: "BATTLE_END",
            player: { ...nextPlayer, block: 0 },
            log: ["GAME OVER", ...get().log],
          });
        }, 800);
        return;
      }

      // Delay between hits/steps
      if (i < sequence.length - 1) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    await new Promise((r) => setTimeout(r, 800));

    const tickedPlayerStatus = tickStatusEffects(nextPlayer.statusEffects);
    let tickedEnemyStatus = tickStatusEffects(nextEnemyAction.statusEffects);

    // Passives (Still slightly manual but cleaner)
    if (nextEnemyAction.id === "pit_boss") {
      const currentStrength =
        nextEnemyAction.statusEffects.find((e) => e.type === "STRENGTH")
          ?.value || 0;
      tickedEnemyStatus = tickedEnemyStatus.filter(
        (e) => e.type !== "STRENGTH",
      );
      tickedEnemyStatus.push({
        type: "STRENGTH",
        value: currentStrength + 2,
        duration: 99,
        name: "House Edge",
      });
    }
    if (nextEnemyAction.id === "enforcer") {
      const currentStrength =
        nextEnemyAction.statusEffects.find((e) => e.type === "STRENGTH")
          ?.value || 0;
      tickedEnemyStatus = tickedEnemyStatus.filter(
        (e) => e.type !== "STRENGTH",
      );
      tickedEnemyStatus.push({
        type: "STRENGTH",
        value: currentStrength + 2,
        duration: 99,
        name: "Intimidate",
      });
    }

    const nextMoveData = getNextEnemyMove(nextEnemyAction);

    // Handle Relics: START_TURN_ENERGY
    let energyBonus = 0;
    nextPlayer.relics.forEach((r) => {
      if (r.effect.type === "START_TURN_ENERGY") energyBonus += r.effect.value;
    });

    // Handle Status Effects: REGEN and ARMOR
    let turnHeal = 0;
    let turnArmor = 0;
    tickedPlayerStatus.forEach((e) => {
      if (e.type === "REGEN") turnHeal += e.value;
      if (e.type === "ARMOR") turnArmor += e.value;
    });

    const finalEnemy: Enemy = {
      ...nextEnemyAction,
      ...nextMoveData,
      statusEffects: tickedEnemyStatus,
      attack: nextMoveData.attack ?? 0,
      animationState: "idle",
    };

    const drawCount = Math.max(0, 5 - get().player.hand.length);
    set({
      phase: "PLAYER_TURN",
      bannerText: "YOUR TURN",
      player: {
        ...nextPlayer,
        hp: Math.min(nextPlayer.maxHp, nextPlayer.hp + turnHeal),
        block: nextPlayer.block + turnArmor,
        energy: Math.min(nextPlayer.maxEnergy, nextPlayer.energy + energyBonus),
        playsRemaining: nextPlayer.playsRemaining + nextPlayer.maxPlays,
        statusEffects: tickedPlayerStatus,
      },
      enemy: finalEnemy,
    });

    if (drawCount > 0) get().drawCards(drawCount);
    if (turnHeal > 0)
      get().addLog(`Regeneration healed you for ${turnHeal} HP.`);
    if (turnArmor > 0) get().addLog(`Armor provided ${turnArmor} Block.`);

    setTimeout(() => set({ bannerText: null }), 1500);
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

      const fullDeckPool = [
        ...state.player.deck,
        ...state.player.hand,
        ...state.player.discard,
        ...state.player.tempDiscard,
      ];
      const newFullDeck = [
        ...fullDeckPool,
        { ...card, instanceId: crypto.randomUUID() },
      ];

      if ((nextFloor % 5 === 0 || nextFloor % 10 === 9) && nextFloor !== 0) {
        return {
          phase: "MAP",
          floor: nextFloor,
          act: nextAct,
          player: {
            ...state.player,
            deck: newFullDeck,
            hand: [],
            discard: [],
            tempDiscard: [],
            block: 0,
            statusEffects: [],
            energy: state.player.maxEnergy,
          },
          mapNodes: generateMapNodes(nextFloor),
          log: [
            `Act ${nextAct} Floor ${nextFloor} Milestone! Choose your specialty path.`,
            ...state.log,
          ],
        };
      }

      const enemy = createEnemyInstance(nextFloor, "NORMAL", state.player);
      const finalPool = shuffle(newFullDeck);

      const availableCards = getAvailableCards(STARTER_CARDS, state.player);
      const getDraftPool = () => {
        const exclusiveRoll = Math.random();
        if (exclusiveRoll < 0.05) {
          const exclusives = availableCards.filter(
            (c) => c.rarity === "EXCLUSIVE",
          );
          if (exclusives.length > 0) {
            return shuffle(exclusives)
              .slice(0, 5)
              .map((c) => ({ ...c, instanceId: crypto.randomUUID() }));
          }
        }
        return shuffle(availableCards.filter((c) => c.rarity !== "EXCLUSIVE"))
          .slice(0, 5)
          .map((c) => ({ ...c, instanceId: crypto.randomUUID() }));
      };

      return {
        phase: "PLAYER_TURN",
        floor: nextFloor,
        act: nextAct,
        player: {
          ...state.player,
          deck: finalPool.slice(5),
          hand: finalPool.slice(0, 5),
          discard: [],
          tempDiscard: [],
          block: 0,
          statusEffects: [],
        },
        enemy,
        bannerText: `ACT ${nextAct} FLOOR ${nextFloor}`,
        log: [
          `Heading to Act ${nextAct} Floor ${nextFloor}... Battle: ${enemy.name}!`,
          ...state.log,
        ],
        draftOptions: getDraftPool(),
      };
    });
    if (get().phase === "PLAYER_TURN")
      setTimeout(() => set({ bannerText: null }), 1500);
  },
}));
