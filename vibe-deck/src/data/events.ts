import { STARTER_CARDS } from "./starter";

export const EVENTS: GameEvent[] = [
  {
    id: 'shady-dealer',
    title: 'The Shady Dealer',
    description: 'A hooded figure leans out from an alleyway. "Psst... for 50 chips, I can make one of those useless cards... disappear."',
    options: [
      { 
        label: 'Pay 50 Chips', 
        description: 'Remove the first card in your deck.', 
        cost: 50, 
        action: (state) => {
          const newDeck = [...state.player.deck]; 
          const removed = newDeck.shift();
          state.addLog(`Shady Dealer took your ${removed?.name}.`);
        }
      },
      { label: 'Leave', description: 'Just walk away.', action: () => {} }
    ]
  },
  {
    id: 'vegas-luck',
    title: 'Vegas Luck',
    description: 'You find a discarded betting slip on the floor. It might still be valid!',
    options: [
      { 
        label: 'Check the Slip', 
        description: '50% chance to gain 75 chips, 50% chance to lose 5 HP.', 
        action: (state) => {
          if (Math.random() > 0.5) {
            state.addLog("JACKPOT! winner.");
            // Note: Chips/HP updates will be handled by store state setters passed via state param
          } else {
            state.addLog("Bad beat. It was a trap.");
          }
        }
      },
      { label: 'Ignore', description: 'Not worth the risk.', action: () => {} }
    ]
  },
  {
    id: 'lucky-horseshoe',
    title: 'The Lucky Horseshoe',
    description: 'You spot a glowing horseshoe hanging over a door. Do you reach for it?',
    options: [
      { 
        label: 'Touch for Luck', 
        description: 'Gain +10% Success Rate for 5 turns, but lose 3 HP.', 
        action: (state) => {
          state.addLog("You feel luckier, but your hand stings.");
        }
      },
      { label: 'Leave it', description: 'Leave the spirits alone.', action: () => {} }
    ]
  },
  {
    id: 'high-stakes-table',
    title: 'High Stakes Table',
    description: 'A high-stakes game is in progress. They invite you to join for a single round.',
    options: [
      { 
        label: 'Bet Big (100 Chips)', 
        description: 'Gain a RARE card, or lose 100 chips.', 
        cost: 100, 
        action: (state) => {
          const rareCards = STARTER_CARDS.filter(c => c.rarity === 'RARE');
          const card = rareCards[Math.floor(Math.random() * rareCards.length)];
          state.addLog(`You won the round and walked away with ${card.name}!`);
        }
      },
      { 
        label: 'Watch', 
        description: 'Just observe. (Gain 10 chips)', 
        action: (state) => {
          state.addLog("You learned a few tricks and found 10 chips on the floor.");
        }
      }
    ]
  }
];
