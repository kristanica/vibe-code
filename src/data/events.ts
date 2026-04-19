import { RELICS } from "./relics";
import type { GameEvent, GameState, GameActions } from "../types/game";

export const EVENTS: GameEvent[] = [
  {
    id: 'shady-dealer',
    title: 'The Shady Dealer',
    description: 'A hooded figure leans out from an alleyway. "Psst... for 50 chips, I can make one of those useless cards... disappear."',
    options: [
      { 
        label: 'Pay 50 Chips', 
        description: 'Remove 1 random card from your deck.', 
        cost: 50, 
        action: (state: GameState & GameActions) => {
          const deck = [...state.player.deck];
          if (deck.length > 0) {
            const index = Math.floor(Math.random() * deck.length);
            const removed = deck.splice(index, 1)[0];
            state.addLog(`Shady Dealer took your ${removed.name}.`);
          }
        }
      },
      { label: 'Leave', description: 'Just walk away.', action: () => {} }
    ]
  },
  {
    id: 'gamblers-contract',
    title: "The Gambler's Contract",
    description: 'A slick man in a pinstripe suit offers you a golden pen. "Sign here, and your luck will change... but it will cost you your safety net."',
    options: [
      { 
        label: 'Sign the Contract', 
        description: 'Gain +5% Permanent Success Rate, but remove 2 random cards from your deck.', 
        action: (state: GameState & GameActions) => {
          const deck = [...state.player.deck];
          const removed: string[] = [];
          for (let i = 0; i < 2; i++) {
            if (deck.length > 0) {
              const index = Math.floor(Math.random() * deck.length);
              removed.push(deck.splice(index, 1)[0].name);
            }
          }
          state.addLog(`Contract Signed: +5% Luck. Lost ${removed.join(' and ')}.`);
        }
      },
      { label: 'Decline', description: 'Some prices are too high.', action: () => {} }
    ]
  },
  {
    id: 'blood-bank',
    title: 'The Underground Blood Bank',
    description: 'The smell of antiseptic is overwhelming. A nurse looks at you expectantly. "We pay well for... fresh donations."',
    options: [
      { 
        label: 'Donate Heavily', 
        description: 'Lose 10 HP, Gain 150 Chips.', 
        action: (state: GameState & GameActions) => {
          state.addLog("You feel lightheaded, but your pockets are heavy (+150 Chips).");
        }
      },
      { 
        label: 'Minor Donation', 
        description: 'Lose 4 HP, Gain 50 Chips.', 
        action: (state: GameState & GameActions) => {
          state.addLog("A quick prick and you're on your way (+50 Chips).");
        }
      },
      { label: 'Leave', description: 'You dislike needles.', action: () => {} }
    ]
  },
  {
    id: 'broken-slot-machine',
    title: 'The Glitched Slot',
    description: 'A slot machine is sparking in the corner. The screen is flickering between different jackpot symbols.',
    options: [
      { 
        label: 'Kick the Machine', 
        description: '40% Jackpot (Rare Relic), 60% Alarm (Lose 6 HP).', 
        action: (state: GameState & GameActions) => {
          if (Math.random() < 0.4) {
             const rareRelics = RELICS.filter(r => r.rarity === 'RARE');
             const relic = rareRelics[Math.floor(Math.random() * rareRelics.length)];
             state.addLog(`JACKPOT! You smashed the glass and grabbed ${relic.name}!`);
          } else {
             state.addLog("ALARM! The machine shocked you for 6 damage.");
          }
        }
      },
      { label: 'Walk Away', description: 'Not worth the trouble.', action: () => {} }
    ]
  },
  {
    id: 'mysterious-fog',
    title: 'The Foggy Mirror',
    description: 'You see a reflection of your potential in a cracked mirror. It looks... stronger, but colder.',
    options: [
      { 
        label: 'Embrace Potential', 
        description: 'Gain +2 Attack Bonus, but lose 5 Max HP.', 
        action: (state: GameState & GameActions) => {
          state.addLog("Strength flows through you, but your body feels fragile.");
        }
      },
      { label: 'Shatter Mirror', description: 'Ignore the temptation.', action: () => {} }
    ]
  },
  {
    id: 'relic-trader',
    title: 'The Relic Collector',
    description: 'An old woman is sorting through a pile of junk. "I trade in curiosities... do you have anything to offer?"',
    options: [
      { 
        label: 'Trade a Card', 
        description: 'Remove 1 random card, Gain a random COMMON relic.', 
        action: (state: GameState & GameActions) => {
          const deck = [...state.player.deck];
          if (deck.length > 0) {
            const index = Math.floor(Math.random() * deck.length);
            const removed = deck.splice(index, 1)[0];
            const commons = RELICS.filter(r => r.rarity === 'COMMON');
            const relic = commons[Math.floor(Math.random() * commons.length)];
            state.addLog(`Traded ${removed.name} for ${relic.name}.`);
          }
        }
      },
      { label: 'Refuse', description: 'Keep your deck as it is.', action: () => {} }
    ]
  }
];
