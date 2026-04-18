export const RELICS: Relic[] = [
  {
    id: 'lucky-penny',
    name: 'Lucky Penny',
    description: 'Permanent +3% Success Rate to all cards.',
    icon: '🪙',
    effect: { type: 'GLOBAL_SUCCESS_CHANCE', value: 3 },
    rarity: 'COMMON',
    price: 60
  },
  {
    id: 'iron-plate',
    name: 'Iron Plate',
    description: 'Start every battle with 8 Block.',
    icon: '🛡️',
    effect: { type: 'START_BATTLE_BLOCK', value: 8 },
    rarity: 'COMMON',
    price: 75
  },
  {
    id: 'coffee-cup',
    name: 'Steaming Mug',
    description: 'Start every turn with +1 Energy.',
    icon: '☕',
    effect: { type: 'START_TURN_ENERGY', value: 1 },
    rarity: 'RARE',
    price: 150
  },
  {
    id: 'chip-collector',
    name: 'Chip Collector',
    description: 'Gain 2 Chips every time you succeed a card play.',
    icon: '💎',
    effect: { type: 'SUCCESS_CHIPS', value: 2 },
    rarity: 'RARE',
    price: 120
  },
  {
    id: 'safety-net',
    name: 'Safety Net',
    description: 'Gain 4 Block whenever a card play fails.',
    icon: '🕸️',
    effect: { type: 'FAILURE_BLOCK', value: 4 },
    rarity: 'COMMON',
    price: 80
  },
  {
    id: 'sharpening-stone',
    name: 'Sharpening Stone',
    description: 'Permanent +1 Damage to all attack cards.',
    icon: '🪨',
    effect: { type: 'ATTACK_BONUS', value: 1 },
    rarity: 'COMMON',
    price: 90
  },
  {
    id: 'vampire-fang',
    name: 'Vampire Fang',
    description: 'Heal 3 HP after winning a battle.',
    icon: '🧛',
    effect: { type: 'HEAL_ON_VICTORY', value: 3 },
    rarity: 'RARE',
    price: 130
  }
];
