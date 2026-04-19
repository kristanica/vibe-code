const fs = require('fs');
let content = fs.readFileSync('src/data/starter.ts', 'utf-8');

const changes = [
  { name: "Safe Strike", old: 95, new: 85 },
  { name: "Heavy Slam", old: 75, new: 65 },
  { name: "Iron Shield", old: 90, new: 80 },
  { name: "Shield Bash", old: 85, new: 75 },
  { name: "Energy Drink", old: 100, new: 95 },
  { name: "Combo Starter", old: 85, new: 75 },
  { name: "Reckless Swing", old: 50, new: 40 },
  { name: "Double Down", old: 65, new: 55 },
  { name: "Fluid Motion", old: 70, new: 60 },
  { name: "Pure Adrenaline", old: 50, new: 40 },
  { name: "Titan Form", old: 60, new: 50 },
  { name: "The Guillotine", old: 30, new: 25 },
  { name: "Glass Cannon", old: 40, new: 35 },
  { name: "Chaos Bolt", old: 50, new: 45 },
  { name: "Backdoor Protocol", old: 30, new: 25 },
  { name: "Jackpot Strike", old: 20, new: 15 },
  { name: "Infinity Shield", old: 50, new: 45 },
  { name: "Time Dilation", old: 60, new: 50 },
  { name: "Probability Storm", old: 100, new: 95 },
  { name: "Reaper's Call", old: 40, new: 35 },
  { name: "Quantum Gamble", old: 50, new: 45 },
  { name: "System Overdrive", old: 70, new: 60 },
  { name: "Divine Intervention", old: 40, new: 35 },
  { name: "Chaos Theory", old: 50, new: 45 }
];

changes.forEach(c => {
  const safeName = c.name.replace(/'/g, "\\'");
  const regex = new RegExp('name: "' + safeName + '",[\\s\\S]*?baseOdds: ' + c.old);
  content = content.replace(regex, match => match.replace('baseOdds: ' + c.old, 'baseOdds: ' + c.new));
});

fs.writeFileSync('src/data/starter.ts', content);
console.log('done');
