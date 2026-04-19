import { ENEMIES, ELITE_ENEMIES } from "../data/starter";

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const getNextEnemyMove = (enemy: Enemy, player?: PlayerState) => {
  let nextIndex: number;
  
  if (enemy.aiType === 'ADAPTIVE' && player) {
    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
    
    // Filter available moves based on HP threshold and cooldowns
    const validMoves = enemy.moves.map((move, index) => ({ move, index }))
      .filter(({ move, index }) => {
        if (move.requiredHpPercentage && hpPercent > move.requiredHpPercentage) return false;
        if (enemy.currentMoveCooldowns?.[index] && enemy.currentMoveCooldowns[index] > 0) return false;
        return true;
      });

    if (validMoves.length === 0) {
      // Fallback
      nextIndex = 0;
    } else {
      // Weighted random selection
      const totalWeight = validMoves.reduce((sum, m) => sum + (m.move.weight || 1), 0);
      let randomVal = Math.random() * totalWeight;
      nextIndex = validMoves[0].index;
      for (const m of validMoves) {
        randomVal -= (m.move.weight || 1);
        if (randomVal <= 0) {
          nextIndex = m.index;
          break;
        }
      }
    }
  } else if (enemy.aiType === 'RANDOM') {
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
  
  if (floor % 10 === 9) {
    const preBossTypes: NodeType[] = ['SHOP', 'REST', 'EVENT', 'TREASURE'];
    const pool = shuffle(preBossTypes);
    return pool.map((type, i) => ({ id: `pre-boss-${i}-${floor}`, type, label: type }));
  }

  const types: NodeType[] = ['ELITE', 'SHOP', 'REST', 'EVENT', 'TREASURE'];
  const pool = shuffle(types);
  
  return [
    { id: `node-1-${floor}`, type: pool[0], label: pool[0] },
    { id: `node-2-${floor}`, type: pool[1], label: pool[1] },
  ];
};

export const createEnemyInstance = (floor: number, type: 'NORMAL' | 'ELITE' | 'BOSS', player?: PlayerState, act: number = 1): Enemy => {
  // New Scaling Curve:
  // Floor 1: 0.5x (Very weak)
  // Floor 3: 0.8x (Approaching standard)
  // Floor 5: 1.2x (Challenging)
  // Floor 10: 2.5x (Endgame Boss)
  let multiplier = floor <= 3 
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
  let scaledMaxHp = Math.max(1, Math.floor(template.maxHp * multiplier));

  // Dynamic Boss Scaling: Ensure boss is beatable but challenging
  if (type === 'BOSS' && player) {
    // Estimate player's "Power Level"
    // Base player (20hp, 0 bonus) has power 1.0
    // Each 1 attack bonus is ~15% more damage
    // Each 5 max hp is ~25% more survivability
    const attackFactor = 1 + (player.stats.attackBonus * 0.15);
    const healthFactor = 1 + ((player.maxHp - 20) / 20);
    const relicFactor = 1 + (player.relics.length * 0.05);
    
    const playerPower = attackFactor * healthFactor * relicFactor;
    
    // We want the boss HP to be roughly proportional to player power, 
    // but with a floor so it's not too easy if the player is weak.
    // Base Boss HP at floor 10 was 450. Let's make it more dynamic.
    // A "weak" player (power 1.0) will see a boss with ~250 HP.
    // A "strong" player (power 2.0) will see a boss with ~500 HP.
    scaledMaxHp = Math.floor(250 * playerPower);
  }

  if (type === 'ELITE' && player) {
    const attackFactor = 1 + (player.stats.attackBonus * 0.12);
    const healthFactor = 1 + ((player.maxHp - 20) / 30);
    const relicFactor = 1 + (player.relics.length * 0.04);
    const playerPower = attackFactor * healthFactor * relicFactor;
    
    scaledMaxHp = Math.floor(template.maxHp * multiplier * playerPower);
  }
  
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
    currentMoveCooldowns: {},
    animationState: 'idle'
  };
};

// Pure Logic Functions for Battle

export const calculateProbabilityBreakdown = (
  card: GameCard,
  player: PlayerState,
  enemy: Enemy | null,
  combo: number,
  isGodMode: boolean
): ProbabilityBreakdown => {
  const layers: ProbabilityLayer[] = [];

  let finalOdds = card.baseOdds;

  if (isGodMode) {
    layers.push({ name: "God Mode", value: 100 - finalOdds });
    return { baseOdds: card.baseOdds, layers, finalOdds: 100 };
  }

  // 1. Status Effects (Buffs/Debuffs)
  let statusOddsMod = 0;
  player.statusEffects.forEach((e) => {
    if (e.type === "SHARP_EYE") statusOddsMod += e.value;
    if (e.type === "DEBUFF_ODDS") statusOddsMod += e.value;
  });
  if (statusOddsMod !== 0) {
    layers.push({ name: "Status Effects", value: statusOddsMod });
    finalOdds += statusOddsMod;
  }

  // 2. Player Stats
  if (player.stats.successRateBonus !== 0) {
    layers.push({ name: "Base Stats", value: player.stats.successRateBonus });
    finalOdds += player.stats.successRateBonus;
  }

  // 3. Relics
  let relicOddsBonus = 0;
  player.relics.forEach((r) => {
    if (r.effect.type === "GLOBAL_SUCCESS_CHANCE")
      relicOddsBonus += r.effect.value;
  });
  if (relicOddsBonus !== 0) {
    layers.push({ name: "Relics", value: relicOddsBonus });
    finalOdds += relicOddsBonus;
  }

  // 4. Temporary Modifiers
  let tempMods = 0;
  player.oddsModifiers.forEach((m) => (tempMods += m.value));
  if (tempMods !== 0) {
    layers.push({ name: "Temporary Modifiers", value: tempMods });
    finalOdds += tempMods;
  }

  // 5. Enemy Debuffs
  if (enemy?.debuffOdds) {
    layers.push({ name: "Enemy Debuff", value: enemy.debuffOdds });
    finalOdds += enemy.debuffOdds;
  }

  // --- NEW SYSTEMS ---

  // 6. Streak System (Combo)
  if (combo > 0) {
    const hasComboBoost = player.relics.some(r => r.effect.type === 'COMBO_CAP_BOOST');
    const comboCap = hasComboBoost ? 20 : 10;
    // Base 2% + Volatility stat per active combo
    const bonusPerCombo = 2 + player.stats.volatility;
    const streakBonus = Math.min(comboCap, combo * bonusPerCombo);
    layers.push({ name: "Combo Streak", value: streakBonus });
    finalOdds += streakBonus;
  }

  // 7. Pity System (Failure Streak)
  if (player.failureStreak > 0) {
    const hasDoublePity = player.relics.some(r => r.effect.type === 'DOUBLE_PITY');
    const pityPerFail = (5 + player.stats.fortune) * (hasDoublePity ? 2 : 1);
    const pityCap = hasDoublePity ? 50 : 25;
    
    // Base 5% + Fortune stat per consecutive failure
    const pityBonus = Math.min(pityCap, player.failureStreak * pityPerFail);
    layers.push({ name: "Pity Bonus", value: pityBonus });
    finalOdds += pityBonus;
  }

  // 8. Entropy System (Overuse)
  if (player.entropy > 0) {
    const hasLiquidCooling = player.relics.some(r => r.effect.type === 'HALVE_ENTROPY_GAIN');
    const entropyDivisor = hasLiquidCooling ? 4 : 2;
    
    // -0.5% (or -0.25% with relic) per entropy point
    const entropyPenalty = Math.floor(-player.entropy / entropyDivisor);
    if (entropyPenalty !== 0) {
      layers.push({ name: "Entropy", value: entropyPenalty });
      finalOdds += entropyPenalty;
    }
  }

  // Boundary Checks
  finalOdds = Math.max(5, Math.min(100, finalOdds));

  return {
    baseOdds: card.baseOdds,
    layers,
    finalOdds,
  };
};

export const calculateSuccessOdds = (
  card: GameCard,
  player: PlayerState,
  enemy: Enemy | null,
  combo: number,
  isGodMode: boolean
): number => {
  return calculateProbabilityBreakdown(card, player, enemy, combo, isGodMode).finalOdds;
};

export const applyCardEffects = (
  isSuccess: boolean, 
  card: GameCard, 
  player: PlayerState, 
  enemy: Enemy | null,
  combo: number,
  isGodMode: boolean
): { player: PlayerState, enemy: Enemy | null, logs: string[] } => {
  // 1. Consume Action-based status effects that were active BEFORE this play.
  const statusAfterConsumption = player.statusEffects
    .map(e => (e.durationType === 'ACTION' ? { ...e, duration: e.duration - 1 } : e))
    .filter(e => e.duration > 0);

  const nextPlayer = { ...player, statusEffects: statusAfterConsumption };
  const nextEnemy = enemy ? { ...enemy, statusEffects: [...enemy.statusEffects] } : null;
  const logs: string[] = [];

  // Relic triggers: Success/Failure
  nextPlayer.relics.forEach(r => {
    if (isSuccess && r.effect.type === 'SUCCESS_CHIPS') {
      nextPlayer.chips += r.effect.value;
      logs.unshift(`Relic: +${r.effect.value} Chips earned!`);
    }
    if (!isSuccess && r.effect.type === 'FAILURE_BLOCK') {
      nextPlayer.block += r.effect.value;
      logs.unshift(`Relic: +${r.effect.value} Block on failure.`);
    }
  });

  const hadDoubleDown = player.statusEffects.some(e => e.type === 'DOUBLE_DOWN');
  const effectCount = (isSuccess && hadDoubleDown) ? 2 : 1;
  
  if (hadDoubleDown) {
    if (isSuccess) {
      logs.unshift(`Double Down triggered! Effects doubled.`);
    } else {
      logs.unshift(`Double Down lost on failure.`);
    }
  }

  // 2. Apply the actual card effects
  for (let i = 0; i < effectCount; i++) {
    const effect = isSuccess ? card.successEffect : card.failEffect;
    if (effect) {
      if ((effect.damage || effect.conditionalDamage) && nextEnemy) {
        let baseDamage = effect.damage || 0;
        
        // Handle Conditional Damage
        if (effect.conditionalDamage) {
          if (effect.conditionalDamage.type === 'LOW_PROB') {
            const currentProb = calculateSuccessOdds(card, player, enemy, combo, isGodMode);
            if (currentProb <= (effect.conditionalDamage.threshold || 30)) {
              baseDamage *= (effect.conditionalDamage.multiplier || 3);
              logs.push(`UNDERDOG! Damage tripled due to low odds.`);
            }
          } else if (effect.conditionalDamage.type === 'COMBO') {
            const bonus = (effect.conditionalDamage.bonusPerCombo || 2) * combo;
            baseDamage += bonus;
            if (bonus > 0) logs.push(`Streak Bonus: +${bonus} DMG.`);
          }
        }

        let relicAtkBonus = 0;
        nextPlayer.relics.forEach(r => {
          if (r.effect.type === 'ATTACK_BONUS') relicAtkBonus += r.effect.value;
        });

        let damage = baseDamage + (nextPlayer.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0) + relicAtkBonus;
        if (nextEnemy.statusEffects.find(e => e.type === 'VULNERABLE')) damage = Math.floor(damage * 1.5);
        if (nextPlayer.statusEffects.find(e => e.type === 'WEAK')) damage = Math.floor(damage * 0.75);
        
        const damageToBlock = Math.min(damage, nextEnemy.block);
        const damageToHp = damage - damageToBlock;
        
        if (damageToBlock > 0) logs.unshift(`Dealt ${damageToBlock} damage to Enemy Block.`);
        if (damageToHp > 0) logs.unshift(`Dealt ${damageToHp} damage to Enemy HP.`);

        if (nextEnemy.block >= damage) { 
          nextEnemy.block -= damage; 
        } else { 
          damage -= nextEnemy.block; 
          nextEnemy.block = 0; 
          nextEnemy.hp = Math.max(0, nextEnemy.hp - damage); 
        }
      }
      if (effect.block) {
        nextPlayer.block += effect.block;
        logs.unshift(`Gained ${effect.block} Block.`);
      }
      if (effect.energy) {
        nextPlayer.energy = Math.min(nextPlayer.maxEnergy, nextPlayer.energy + effect.energy);
        logs.unshift(`Recovered ${effect.energy} Energy.`);
      }
      if (effect.winBattle && nextEnemy) {
        nextEnemy.hp = 0;
      }
      if (effect.takeDamage && !isGodMode) {
        let damage = effect.takeDamage;
        const dmgToBlock = Math.min(damage, nextPlayer.block);
        const dmgToHp = damage - dmgToBlock;
        if (dmgToBlock > 0) logs.unshift(`Took ${dmgToBlock} recoil damage to Block.`);
        if (dmgToHp > 0) logs.unshift(`Took ${dmgToHp} recoil damage to HP.`);
        if (nextPlayer.block >= damage) { 
          nextPlayer.block -= damage; 
        } else { 
          damage -= nextPlayer.block; 
          nextPlayer.block = 0; 
          nextPlayer.hp = Math.max(0, nextPlayer.hp - damage); 
        }
      }
      if (effect.discardHand) {
        nextPlayer.hand.length = 0;
        logs.unshift(`Hand discarded!`);
      }
      if (effect.addStatus) {
        nextPlayer.statusEffects = mergeStatusEffects(nextPlayer.statusEffects, effect.addStatus);
        logs.unshift(`Gained Status: ${effect.addStatus.name}`);
      }
      if (effect.applyEnemyStatus && nextEnemy) {
        nextEnemy.statusEffects = mergeStatusEffects(nextEnemy.statusEffects, effect.applyEnemyStatus);
        logs.unshift(`Enemy Status: ${effect.applyEnemyStatus.name}`);
      }
      if (effect.resetEntropy) {
        nextPlayer.entropy = 0;
        logs.unshift(`Entropy Stabilized! Chaos reset to 0.`);
      }
      if (effect.pityPayoff) {
        // Gain Strength based on Failure Streak
        const bonusStrength = nextPlayer.failureStreak * 4;
        if (bonusStrength > 0) {
          nextPlayer.statusEffects = mergeStatusEffects(nextPlayer.statusEffects, {
            type: 'STRENGTH',
            value: bonusStrength,
            duration: 99,
            name: 'Pity Power'
          });
          logs.unshift(`Pity Payoff! Gained ${bonusStrength} Strength from Bad Luck.`);
        }
        nextPlayer.failureStreak = 0; // Consume the streak
      }
    }
  }

  return { player: nextPlayer, enemy: nextEnemy, logs };
};

export const calculateEnemyAction = (
  enemy: Enemy, 
  player: PlayerState,
  isGodMode: boolean
): { player: PlayerState, enemy: Enemy, logs: string[] }[] => {
  let nextPlayer = { ...player, statusEffects: [...player.statusEffects] };
  let nextEnemy = { ...enemy, statusEffects: [...enemy.statusEffects] };
  const sequence: { player: PlayerState, enemy: Enemy, logs: string[] }[] = [];
  
  const currentMove = nextEnemy.moves[nextEnemy.nextMoveIndex];
  
  // Handle Cooldowns
  const nextCooldowns = { ...nextEnemy.currentMoveCooldowns };
  for (const key in nextCooldowns) {
    if (nextCooldowns[key] > 0) nextCooldowns[key]--;
  }
  if (currentMove.cooldown) {
    nextCooldowns[nextEnemy.nextMoveIndex] = currentMove.cooldown;
  }
  nextEnemy.currentMoveCooldowns = nextCooldowns;
  
  // Set animation state
  nextEnemy.animationState = currentMove.animationType || 'light';
  
  const dodgeValue = nextPlayer.statusEffects.find(e => e.type === 'DODGE')?.value || 0;
  nextPlayer.block += dodgeValue;

  if (currentMove.intent === 'ATTACK') {
    const hits = currentMove.hits || 1;
    let baseDamage = currentMove.value + (nextEnemy.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0);

    for (let i = 0; i < hits; i++) {
      const stepLogs: string[] = [];
      let damage = isGodMode ? 0 : baseDamage;
      if (nextPlayer.statusEffects.find(e => e.type === 'VULNERABLE')) damage = Math.floor(damage * 1.5);
      if (nextEnemy.statusEffects.find(e => e.type === 'WEAK')) damage = Math.floor(damage * 0.75);
      
      const damageToBlock = Math.min(damage, nextPlayer.block);
      const damageToHp = damage - damageToBlock;

      if (damageToBlock > 0) stepLogs.push(`${nextEnemy.name} dealt ${damageToBlock} damage to your Block${hits > 1 ? ` (Hit ${i+1}/${hits})` : ''}.`);
      if (damageToHp > 0) stepLogs.push(`${nextEnemy.name} dealt ${damageToHp} damage to your HP${hits > 1 ? ` (Hit ${i+1}/${hits})` : ''}.`);

      if (nextPlayer.block >= damage) { 
        nextPlayer.block -= damage; 
      } else { 
        damage -= nextPlayer.block; 
        nextPlayer.block = 0; 
        nextPlayer.hp = Math.max(0, nextPlayer.hp - damage); 
      }
      
      nextPlayer = { ...nextPlayer };
      nextEnemy = { ...nextEnemy };
      sequence.push({ player: nextPlayer, enemy: nextEnemy, logs: stepLogs });
    }
  } else {
    const stepLogs: string[] = [];
    if (currentMove.intent === 'BLOCK') { 
      nextEnemy.block += currentMove.value; 
      stepLogs.push(`${nextEnemy.name} gained ${currentMove.value} Block.`);
    } else if (currentMove.intent === 'DEBUFF') {
      nextPlayer.statusEffects.push({ type: 'VULNERABLE', value: currentMove.value, duration: 3, name: 'Vulnerable' });
      stepLogs.push(`${nextEnemy.name} made you Vulnerable!`);
    } else if (currentMove.intent === 'SPECIAL') {
      let damage = isGodMode ? 0 : currentMove.value + (nextEnemy.statusEffects.find(e => e.type === 'STRENGTH')?.value || 0);
      nextPlayer.hp = Math.max(0, nextPlayer.hp - damage);
      stepLogs.push(`${nextEnemy.name} used a Special Attack for ${damage} direct HP damage!`);
    }
    nextPlayer = { ...nextPlayer };
    nextEnemy = { ...nextEnemy };
    sequence.push({ player: nextPlayer, enemy: nextEnemy, logs: stepLogs });
  }

  // Handle Secondary Intents on the final step
  const finalStep = sequence[sequence.length - 1];
  if (currentMove.secondaryIntent === 'BLOCK') {
    finalStep.enemy.block += currentMove.secondaryValue || 0;
    finalStep.logs.push(`${finalStep.enemy.name} also gained ${currentMove.secondaryValue} Block.`);
  } else if (currentMove.secondaryIntent === 'DEBUFF') {
    finalStep.player.statusEffects.push({ type: 'WEAK', value: currentMove.secondaryValue || 0, duration: 2, name: 'Weak' });
    finalStep.logs.push(`${finalStep.enemy.name} made you Weak!`);
  } else if (currentMove.secondaryIntent === 'BUFF') {
    finalStep.enemy.statusEffects.push({ type: 'STRENGTH', value: currentMove.secondaryValue || 0, duration: 99, name: 'Strength' });
    finalStep.logs.push(`${finalStep.enemy.name} buffed their Strength by ${currentMove.secondaryValue}.`);
  }

  return sequence;
};

export const getAvailableCards = (allCards: GameCard[], player: PlayerState): GameCard[] => {
  const ownedIds = new Set([
    ...player.deck,
    ...player.hand,
    ...player.discard,
    ...player.tempDiscard
  ].map(c => c.id));
  
  return allCards.filter(c => {
    if ((c.rarity === 'VOLATILE' || c.rarity === 'EXCLUSIVE') && ownedIds.has(c.id)) {
      return false;
    }
    return true;
  });
};

export const generateDraftPool = (allCards: GameCard[]): GameCard[] => {
  const exclusiveRoll = Math.random();
  if (exclusiveRoll < 0.05) {
    const exclusives = allCards.filter(c => c.rarity === 'EXCLUSIVE');
    return shuffle(exclusives).slice(0, 5).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
  }
  return shuffle(allCards.filter(c => c.rarity !== 'EXCLUSIVE')).slice(0, 5).map(c => ({ ...c, instanceId: crypto.randomUUID() }));
};

export const generateEliteDraftPool = (allCards: GameCard[]): GameCard[] => {
  const highTier = allCards.filter(c => c.rarity === 'RARE' || c.rarity === 'EXCLUSIVE' || c.rarity === 'VOLATILE');
  const uncommons = allCards.filter(c => c.rarity === 'UNCOMMON');
  return [...shuffle(highTier).slice(0, 3), ...shuffle(uncommons).slice(0, 2)].map(c => ({ ...c, instanceId: crypto.randomUUID() }));
};

export const calculateVictoryState = (
  player: PlayerState,
  enemy: Enemy,
  floor: number,
  allCards: GameCard[]
) => {
  const isPitBoss = enemy.id === 'pit_boss';
  const isElite = enemy.type === 'ELITE';
  
  let nextPlayerHp = player.hp;
  let nextMaxHp = player.maxHp;
  let nextStats = { ...player.stats };
  const logs: string[] = [];

  // Relic: HEAL_ON_VICTORY
  player.relics.forEach(r => {
    if (r.effect.type === 'HEAL_ON_VICTORY') nextPlayerHp = Math.min(nextMaxHp, nextPlayerHp + r.effect.value);
  });

  // Full heal after boss fight
  if (isPitBoss) {
    nextPlayerHp = nextMaxHp;
  }

  // Elite Reward: Automatic baseline
  if (isElite) {
    nextMaxHp += 5;
    nextPlayerHp += 5;
    nextStats.maxHpBonus += 5;
    logs.push("ELITE SLAYER: Automatic +5 Max HP baseline!");
  }

  // Dynamic EXP calculation
  let expGained = 20 + (floor * 5);
  if (isElite) expGained = 50 + (floor * 10);
  if (enemy.type === 'BOSS') expGained = 150 + (floor * 20);

  const nextExp = player.exp + expGained;
  const isLevelUp = nextExp >= player.nextLevelExp;

  const availableCards = getAvailableCards(allCards, player);
  const draftOptions = isElite ? generateEliteDraftPool(availableCards) : generateDraftPool(availableCards);

  return {
    isPitBoss,
    isElite,
    isLevelUp,
    expGained,
    nextExp,
    nextPlayerHp,
    nextMaxHp,
    nextStats,
    draftOptions,
    logs
  };
};


