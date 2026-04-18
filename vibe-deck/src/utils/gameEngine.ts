import { ENEMIES, ELITE_ENEMIES } from "../data/starter";

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getNextEnemyMove = (enemy: Enemy) => {
  const nextIndex = (enemy.nextMoveIndex + 1) % enemy.moves.length;
  const nextMove = enemy.moves[nextIndex];
  return {
    nextMoveIndex: nextIndex,
    intent: nextMove.intent,
    attack: nextMove.intent === 'ATTACK' ? nextMove.value : 0
  };
};

export const tickStatusEffects = (effects: StatusEffect[]) => {
  return effects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0);
};

export const generateMapNodes = (floor: number): MapNode[] => {
  if (floor % 10 === 0) {
    return [{ id: 'boss', type: 'BOSS', label: 'THE PIT BOSS' }];
  }
  
  const types: NodeType[] = ['ELITE', 'SHOP', 'REST', 'EVENT'];
  const pool = shuffle(types);
  
  return [
    { id: `node-1-${floor}`, type: pool[0], label: pool[0] },
    { id: `node-2-${floor}`, type: pool[1], label: pool[1] },
  ];
};

export const createEnemyInstance = (floor: number, type: 'NORMAL' | 'ELITE' | 'BOSS' = 'NORMAL'): Enemy => {
  // Scaling Factor: Starts at 0.6x at Floor 1, reaches 1.0x at Floor 4, and 2.0x at Floor 10
  const multiplier = 0.6 + (floor - 1) * 0.15;
  
  let template;
  if (type === 'BOSS') {
    template = ENEMIES.pit_boss;
  } else if (type === 'ELITE') {
    const elites = Object.values(ELITE_ENEMIES);
    template = elites[Math.floor(Math.random() * elites.length)];
  } else {
    const normals = Object.values(ENEMIES).filter(e => e.id !== 'pit_boss');
    template = normals[Math.floor(Math.random() * normals.length)];
  }
  
  // Scale HP
  const scaledMaxHp = Math.max(1, Math.floor(template.maxHp * multiplier));
  
  // Scale all Move Values (Damage, Block, etc.)
  const scaledMoves = template.moves.map(move => ({
    ...move,
    value: Math.max(1, Math.floor(move.value * multiplier)) || move.value // Ensure value doesn't drop to 0 if it was > 0
  }));

  const initialMove = scaledMoves[0];
  
  return {
    ...template,
    maxHp: scaledMaxHp,
    hp: scaledMaxHp,
    block: Math.floor((template.block || 0) * multiplier),
    moves: scaledMoves,
    nextMoveIndex: 0,
    intent: initialMove.intent,
    attack: initialMove.intent === 'ATTACK' ? initialMove.value : 0,
    statusEffects: [],
  };
};
