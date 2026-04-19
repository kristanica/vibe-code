import type { Relic } from "../types/game";

export const RELICS: Relic[] = [
  {
    id: 'lucky-penny',
    name: 'Lucky Penny',
    description: 'Permanent +5% Success Rate to all cards.',
    icon: '🪙',
    effect: { type: 'GLOBAL_SUCCESS_CHANCE', value: 5 },
    rarity: 'COMMON',
    price: 60
  },
  {
    id: 'iron-plate',
    name: 'Iron Plate',
    description: 'Start every battle with 12 Block.',
    icon: '🛡️',
    effect: { type: 'START_BATTLE_BLOCK', value: 12 },
    rarity: 'COMMON',
    price: 75
  },
  {
    id: 'coffee-cup',
    name: 'Steaming Mug',
    description: 'Recover 2 Energy at the start of every turn.',
    icon: '☕',
    effect: { type: 'START_TURN_ENERGY', value: 2 },
    rarity: 'RARE',
    price: 150
  },
  {
    id: 'chip-collector',
    name: 'Chip Collector',
    description: 'Gain 5 Chips every time you succeed a card play.',
    icon: '💎',
    effect: { type: 'SUCCESS_CHIPS', value: 5 },
    rarity: 'RARE',
    price: 120
  },
  {
    id: 'safety-net',
    name: 'Safety Net',
    description: 'Gain 5 Block whenever a card play fails.',
    icon: '🕸️',
    effect: { type: 'FAILURE_BLOCK', value: 5 },
    rarity: 'COMMON',
    price: 80
  },
  {
    id: 'sharpening-stone',
    name: 'Sharpening Stone',
    description: 'Permanent +2 Damage to all attack cards.',
    icon: '🪨',
    effect: { type: 'ATTACK_BONUS', value: 2 },
    rarity: 'COMMON',
    price: 90
  },
  {
    id: 'vampire-fang',
    name: 'Vampire Fang',
    description: 'Heal 5 HP after winning a battle.',
    icon: '🧛',
    effect: { type: 'HEAL_ON_VICTORY', value: 5 },
    rarity: 'RARE',
    price: 130
  },
  {
    id: 'weighted-dice',
    name: 'Weighted Dice',
    description: 'Pity bonus is doubled (+10% per failure).',
    icon: '🎲',
    effect: { type: 'DOUBLE_PITY', value: 2 },
    rarity: 'RARE',
    price: 160
  },
  {
    id: 'liquid-cooling',
    name: 'Liquid Cooling',
    description: 'Entropy penalty is halved (-0.25% per success).',
    icon: '🧪',
    effect: { type: 'HALVE_ENTROPY_GAIN', value: 2 },
    rarity: 'RARE',
    price: 140
  },
  {
    id: 'combo-meter',
    name: 'Combo Meter',
    description: 'Combo Success Bonus cap increased to +20%.',
    icon: '📈',
    effect: { type: 'COMBO_CAP_BOOST', value: 20 },
    rarity: 'RARE',
    price: 150
  }
];
