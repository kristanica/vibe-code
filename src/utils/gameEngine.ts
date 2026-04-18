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
  let nextIndex: number;
  
  if (enemy.intent === 'RANDOM') {
    // True random selection for unpredictable enemies
    nextIndex = Math.floor(Math.random() * enemy.moves.length);
  } else {
    // Default: Cycle through moves in order
    nextIndex = (enemy.nextMoveIndex + 1) % enemy.moves.length;
  }
  
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

export const mergeStatusEffects = (current: StatusEffect[], next: StatusEffect): StatusEffect[] => {
  const existingIndex = current.findIndex(e => e.type === next.type);
  if (existingIndex > -1) {
    const updated = [...current];
    const e = updated[existingIndex];
    // Stack both value and duration
    updated[existingIndex] = {
      ...e,
      value: e.value + next.value,
      duration: e.duration + next.duration
    };
    return updated;
  }
  return [...current, next];
};

export const generateMapNodes = (floor: number): MapNode[] => {
  if (floor % 10 === 0) {
    return [{ id: 'boss', type: 'BOSS', label: 'THE PIT BOSS' }];
  }
  
  const types: NodeType[] = ['ELITE', 'SHOP', 'REST', 'EVENT', 'TREASURE'];
  const pool = shuffle(types);
  
  return [
    { id: `node-1-${floor}`, type: pool[0], label: pool[0] },
    { id: `node-2-${floor}`, type: pool[1], label: pool[1] },
  ];
};

export const createEnemyInstance = (floor: number, type: 'NORMAL' | 'ELITE' | 'BOSS' = 'NORMAL'): Enemy => {
  // New Scaling Curve:
  // Floor 1: 0.5x (Very weak)
  // Floor 3: 0.8x (Approaching standard)
  // Floor 5: 1.2x (Challenging)
  // Floor 10: 2.5x (Endgame Boss)
  const multiplier = floor <= 3 
    ? 0.5 + (floor - 1) * 0.15 // 0.5, 0.65, 0.8
    : 0.8 + (floor - 3) * 0.25; // 1.05, 1.3, 1.55... 2.55 at floor 10
  
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
    type,
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
