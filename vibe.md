# PROBABILITY DECK
## Game Design Document

---

## 📋 EXECUTIVE SUMMARY

**Genre**: Roguelike Deckbuilder  
**Platform**: Web Browser (Desktop & Mobile)  
**Target Audience**: Fans of Slay the Spire, Balatro, Into the Breach  
**Core Hook**: Manipulate probability itself — every card shows exact odds, and you control the risk/reward balance  
**Development Time**: Weekend MVP (2-3 days), Polish Sprint (1 week)  
**Portfolio Value**: High — demonstrates state management, UI/UX innovation, game balance, and addictive gameplay

---

## 🎮 HIGH CONCEPT

> "What if a deckbuilder showed you the exact math behind every decision, and let you gamble with those odds?"

You're escaping a collapsing probability casino by battling through floors of increasingly difficult enemies. Build a deck of cards with varying success rates, manipulate odds through combos and modifiers, and decide when to play it safe vs. go all-in on high-risk plays.

**Key Differentiator**: Unlike traditional deckbuilders where effects are deterministic, every card in Probability Deck has a **success percentage** that changes based on deck composition, previous plays, and active modifiers. Players must balance building reliable combos vs. explosive high-variance strategies.

---

## 🎯 CORE PILLARS

### 1. **Transparent Risk**
- Every action shows exact probability of success/failure
- Players are educated, not frustrated, by RNG
- Build trust through clarity

### 2. **Meaningful Choices**
- Safe 80% plays vs. risky 30% power spikes
- Deck composition directly affects card odds
- Multiple viable strategies (safety, volatility, combo)

### 3. **Satisfying Progression**
- Immediate feedback (probability bars filling)
- Visual/audio juice on successes and failures
- Meta-progression that unlocks new risk profiles

### 4. **Portfolio Showcase**
- Advanced state management
- Real-time probability calculations
- Polished UI/UX for complex systems
- Mobile-responsive design

---

## 🕹️ GAMEPLAY OVERVIEW

### Core Loop (Per Floor)

```
┌─────────────────┐
│  DRAFT PHASE    │ ← Pick 1 of 3 cards to add to deck
└────────┬────────┘
         ↓
┌─────────────────┐
│  BATTLE PHASE   │ ← Fight enemy using deck
└────────┬────────┘
         ↓
┌─────────────────┐
│  REWARD PHASE   │ ← Modify deck, visit shop, upgrade cards
└────────┬────────┘
         ↓
┌─────────────────┐
│  NEXT FLOOR     │ ← Repeat with harder enemies
└─────────────────┘
```

### Battle System

**Setup**:
- Player starts with 3 HP
- Enemy has HP + attack pattern
- Draw 5 cards from shuffled deck
- 3 Energy per turn

**Turn Flow**:
1. Play cards (cost energy)
2. Cards resolve based on probability roll
3. See outcome (success/failure animation)
4. Enemy attacks
5. Draw back to 5 cards
6. Repeat until victory or defeat

**Win Condition**: Reduce enemy HP to 0  
**Loss Condition**: Player HP reaches 0 (permadeath, restart run)

---

## 🃏 CARD SYSTEM

### Card Anatomy

```
┌─────────────────────┐
│ RISKY STRIKE    [2] │ ← Name & Energy Cost
├─────────────────────┤
│                     │
│    🎲 45%          │ ← Success Probability
│                     │
├─────────────────────┤
│ Deal 8 damage       │ ← Effect on Success
│ On Fail: Take 1 dmg │ ← Effect on Failure
└─────────────────────┘
```

### Card Types

#### **1. ATTACK CARDS**
Cards that deal damage with varying risk levels.

| Card Name | Energy | Base Odds | Effect (Success) | Effect (Failure) |
|-----------|--------|-----------|------------------|------------------|
| Safe Strike | 1 | 85% | Deal 3 damage | Deal 1 damage |
| Balanced Strike | 2 | 65% | Deal 6 damage | Nothing |
| Risky Strike | 2 | 45% | Deal 10 damage | Take 1 damage |
| All-In Attack | 3 | 25% | Deal 20 damage | Lose turn |
| Guaranteed Jab | 1 | 100% | Deal 2 damage | N/A |

#### **2. DEFENSE CARDS**
Cards that prevent or mitigate damage.

| Card Name | Energy | Base Odds | Effect (Success) | Effect (Failure) |
|-----------|--------|-----------|------------------|------------------|
| Dodge | 1 | 70% | Block next attack | Nothing |
| Perfect Parry | 2 | 50% | Block + counter 5 dmg | Nothing |
| Insurance | 2 | 100% | Block 3 damage | N/A |

#### **3. GAMBLE CARDS**
High-variance cards with extreme outcomes.

| Card Name | Energy | Base Odds | Effect (Success) | Effect (Failure) |
|-----------|--------|-----------|------------------|------------------|
| Double Down | 3 | 50% | Draw 3 cards + 2 energy | Discard hand |
| Russian Roulette | 1 | 83% (5/6) | Deal 15 damage | Take 2 damage |
| Jackpot | 3 | 10% | Win battle instantly | Take 1 damage |

#### **4. MODIFIER CARDS**
Cards that change probabilities of other cards.

| Card Name | Energy | Base Odds | Effect |
|-----------|--------|-----------|--------|
| Lucky Charm | 1 | 100% | Next card +25% success |
| Loaded Dice | 2 | 100% | All cards this turn guaranteed |
| Chaos Shuffle | 0 | 100% | Randomize all card odds (30-90%) |
| Focus | 1 | 100% | -20% to all cards, but triple damage |

#### **5. SYNERGY CARDS**
Cards whose odds change based on deck composition.

| Card Name | Energy | Base Odds | Effect | Synergy |
|-----------|--------|-----------|--------|---------|
| Red Streak | 2 | 60% | Deal 7 damage | +10% per red card in hand |
| Combo Finisher | 3 | 40% | Deal 15 damage | +15% per card played this turn |
| Risk Pool | 2 | 50% | Deal 8 damage | +5% per volatile card in deck |

---

## 🎲 PROBABILITY MECHANICS

### Base Probability Calculation

Each card starts with a **base success rate** (e.g., 65%). This is modified by:

1. **Active Modifiers** (Lucky Charm, Loaded Dice)
2. **Synergy Bonuses** (cards played this turn, deck composition)
3. **Enemy Effects** (some enemies lower your odds)
4. **Upgrade Level** (upgraded cards get +10-15% odds)

**Formula**:
```
Final Odds = Base Odds + Modifier Bonuses + Synergy Bonuses - Enemy Penalties
Final Odds = Clamp(Final Odds, 5%, 100%)  // Never below 5%, never above 100%
```

### Roll Resolution

When a card is played:
1. Generate random number 0-100
2. If number ≤ Final Odds → SUCCESS
3. If number > Final Odds → FAILURE
4. Trigger appropriate effect
5. Show visual feedback (green checkmark vs. red X)

### Volatility System

Players can upgrade cards to "Volatile" versions:
- **Standard Card**: 70% deal 5 damage
- **Volatile Card**: 50% deal 0 damage, 50% deal 12 damage

Benefits:
- Higher ceiling
- Unlocks achievement synergies
- More exciting gameplay

Drawbacks:
- Less reliable
- Can brick turns
- Requires skill to build around

---

## 👥 ENEMY DESIGN

### Floor 1-3: Training Grounds

**Thug** (5 HP)
- Attack: 1 damage every turn
- No special abilities
- Tutorial enemy

**Card Shark** (8 HP)
- Attack: 1 damage
- Passive: Your cards have -10% odds
- Teaches players about debuffs

**Slot Machine** (10 HP)
- Attack: Random (1-3 damage)
- Passive: Heals 2 HP if you fail a card
- Punishes risky play

### Floor 4-6: Mid Game

**Probability Hacker** (15 HP)
- Attack: 2 damage
- Special: Every 3 turns, forces you to reroll a successful card
- Tests player adaptation

**House Edge** (20 HP)
- Attack: 1 damage
- Passive: All your cards capped at 75% max odds
- Forces creative solutions

**Bad Beat** (18 HP)
- Attack: 3 damage if you succeeded on a card last turn
- Punishes consistency, rewards variance

### Floor 7-10: End Game

**The Dealer** (30 HP) — BOSS
- Attack: Scales with turn number (1/2/3/4...)
- Phase 1: Normal
- Phase 2 (15 HP): All your cards become 50/50
- Phase 3 (5 HP): You must play volatile cards only
- Epic finale with multiple phases

---

## 🏪 SHOP & PROGRESSION

### Between-Floor Shop

**Currency**: Chips (earned by defeating enemies)

**Shop Options**:

1. **Add Card** (50 chips)
   - Choose 1 of 3 random cards

2. **Remove Card** (75 chips)
   - Remove a card from deck permanently
   - Key for deck optimization

3. **Upgrade Card** (100 chips)
   - +10% base odds OR +2 damage/effect
   - Can only upgrade each card once

4. **Make Volatile** (50 chips)
   - Convert card to 50/50 with doubled effect
   - High risk, high reward

5. **Reroll Odds** (25 chips)
   - Gamble: Randomize a card's base odds (30-90%)
   - Could improve or worsen

6. **HP Heal** (60 chips)
   - Restore 1 HP
   - Expensive but necessary

### Draft System

After each battle:
- Choose 1 of 3 random cards (free)
- Cards scale with floor number
- Higher floors = more powerful cards

---

## 🎨 UI/UX DESIGN

### Combat Screen Layout

```
┌─────────────────────────────────────────┐
│ HP: ♥♥♥          FLOOR 3/10        CHIPS│
├─────────────────────────────────────────┤
│                                         │
│         [ENEMY SPRITE]                  │
│         Enemy HP: ████████ 12/15        │
│         "Next Attack: 2 damage"         │
│                                         │
├─────────────────────────────────────────┤
│  DECK: 15  DISCARD: 8  ENERGY: ⚡⚡⚡  │
├─────────────────────────────────────────┤
│                                         │
│  [CARD] [CARD] [CARD] [CARD] [CARD]    │
│   65%    45%    100%   80%    30%       │
│                                         │
├─────────────────────────────────────────┤
│ BATTLE LOG:                             │
│ • Risky Strike SUCCEEDED — 10 damage!   │
│ • Enemy attacked — 2 damage taken       │
└─────────────────────────────────────────┘
```

### Card Hover State

When hovering a card:
- Card enlarges (1.2x scale)
- Probability breakdown tooltip appears:
  ```
  BASE ODDS: 60%
  + Lucky Charm: +25%
  + Red Synergy: +10%
  - Enemy Debuff: -15%
  ─────────────────
  FINAL ODDS: 80%
  ```
- Preview of damage on enemy HP bar
- Highlight synergy cards in hand

### Probability Visualizations

**Option 1: Progress Bar**
```
[████████░░] 80%
```

**Option 2: Pie Chart** (cleaner for mobile)
```
    ●●●●●
  ●●     ●●
 ●   80%   ●
  ●●     ●●
    ●●●●●
```

**Option 3: Roulette Wheel** (thematic)
```
    ╱──╲
   │ ✓ │  ← Success zone
    ╲──╱
```

### Color Coding

- **Green (70-100%)**: Safe plays
- **Yellow (40-69%)**: Balanced risk
- **Red (0-39%)**: High risk
- **Purple**: Volatile cards
- **Gold**: Guaranteed effects

---

## 🎵 AUDIO DESIGN

### Sound Effects

| Event | Sound |
|-------|-------|
| Card Draw | Soft "swish" |
| Card Play | "Thunk" + chip clink |
| Success | Slot machine "ding" + coins |
| Failure | Buzzer + sad chip scatter |
| Critical Success (<30% odds) | Jackpot alarm + fanfare |
| Enemy Hit | Impact + grunt |
| HP Loss | Glass crack |
| Level Up | Casino jackpot |
| Shop Purchase | Chip stack click |

### Music

- **Menu**: Jazzy casino lounge
- **Combat**: Upbeat electronic with escalating intensity
- **Boss**: Dramatic orchestral with synth elements
- **Shop**: Relaxed ambience with slot machine background

---

## 💻 TECHNICAL REQUIREMENTS

### Technology Stack

**Frontend**:
- React 18+ (component architecture)
- TypeScript (type safety for complex game state)
- Tailwind CSS (rapid styling)
- Framer Motion (animations)
- Zustand or Redux (state management)

**Build Tools**:
- Vite (fast dev server)
- ESLint + Prettier (code quality)

**Deployment**:
- Vercel / Netlify (free hosting)
- GitHub Pages (portfolio integration)

### Browser Requirements

- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+
- **Recommended**: Latest versions for best performance
- **Mobile**: iOS 14+, Android 10+

### Performance Targets

- **Load Time**: <2 seconds on 4G
- **FPS**: 60fps animations
- **Bundle Size**: <500KB gzipped
- **Responsive**: 320px to 2560px width

---

## 📊 GAME BALANCE

### Starting Deck (10 cards)

- 5x Safe Strike (85% deal 3 damage)
- 3x Balanced Strike (65% deal 6 damage)
- 1x Dodge (70% block next attack)
- 1x Lucky Charm (+25% to next card)

**Philosophy**: Reliable but weak. Players must draft to improve.

### Difficulty Curve

| Floor | Enemy HP | Enemy Damage | Special Mechanics |
|-------|----------|--------------|-------------------|
| 1-2 | 5-8 | 1 | None |
| 3-4 | 10-15 | 1-2 | Debuffs introduced |
| 5-6 | 15-20 | 2-3 | Reactive abilities |
| 7-8 | 20-25 | 3-4 | Probability manipulation |
| 9-10 | 25-35 | 4-5 | Boss mechanics |

### Economy Balance

**Chip Rewards**:
- Floor 1-3: 30-40 chips per win
- Floor 4-6: 50-60 chips
- Floor 7-10: 70-100 chips

**Shop Prices** (designed for 1-2 purchases per floor):
- Add Card: 50 (1-1.5 battles)
- Remove Card: 75 (2 battles)
- Upgrade: 100 (2.5 battles)
- Volatile: 50 (gamble option)

---

## 🏆 META-PROGRESSION

### Unlockable Characters

**1. The Gambler** (STARTER)
- Start with 3 HP
- Balanced deck
- No special abilities
- Teaches core mechanics

**2. The Statistician** (Unlock: Win 1 run)
- Start with 2 HP
- All cards show exact odds breakdown
- Passive: +10% to all cards with >60% base odds
- Playstyle: Reliable, safe builds

**3. The Risk Taker** (Unlock: Win with 5+ volatile cards)
- Start with 4 HP
- Passive: Critical successes (<30% odds) deal double damage
- Starts with 2 Risky Strikes in deck
- Playstyle: High variance, explosive

**4. The Combo Master** (Unlock: Play 10+ cards in one turn)
- Start with 3 HP
- Passive: Cards gain +5% per card played this turn
- Starts with 2 Combo Finishers
- Playstyle: Engine building

### Achievement System

| Achievement | Unlock Condition | Reward |
|-------------|------------------|--------|
| First Win | Beat floor 10 | Statistician character |
| Risk Taker | Win with 5+ volatile cards | Risk Taker character |
| Perfect Run | Win without taking damage | Golden card back |
| Combo King | Play 10 cards in one turn | Combo Master character |
| Against the Odds | Win with only <50% cards | "Underdog" title |
| Guaranteed | Win using only 100% cards | "Safe Player" title |

### Daily Challenge

- **Seeded RNG**: Same run for all players
- **Leaderboard**: Compare scores
- **Modifiers**: "All cards volatile" / "No healing" / "Double enemies"
- **Rewards**: Cosmetic card backs

---

## 📱 RESPONSIVE DESIGN

### Desktop (1024px+)

```
┌────────────────────────────────┐
│  HEADER (HP, Floor, Chips)     │
├────────────────────────────────┤
│                                │
│       ENEMY (centered)         │
│                                │
├────────────────────────────────┤
│  5 CARDS (horizontal row)      │
│  with full tooltips            │
└────────────────────────────────┘
```

### Tablet (768-1023px)

- Same layout, slightly compressed
- Tooltips appear on tap instead of hover

### Mobile (320-767px)

```
┌──────────────┐
│ HP | Floor   │
├──────────────┤
│    ENEMY     │
├──────────────┤
│ [CARD]       │
│  65%         │
│ [CARD]       │
│  45%         │
│ [CARD]       │
│  100%        │
│              │
│ (Swipe left/ │
│  right for   │
│  more cards) │
└──────────────┘
```

- Cards stack vertically
- Swipe gesture to see all 5
- Tap card to see details
- Auto-scroll to active card

---

## 🚀 DEVELOPMENT ROADMAP

### Weekend MVP (16-24 hours)

**Day 1 (8-10 hours)**:
- [ ] Core game loop (battle system)
- [ ] 10 starter cards implemented
- [ ] 3 enemy types
- [ ] Basic UI (no animations)
- [ ] Win/loss states

**Day 2 (8-10 hours)**:
- [ ] Draft system
- [ ] Shop with upgrades
- [ ] 5 more cards (15 total)
- [ ] Probability calculations working
- [ ] Basic styling (Tailwind)

**Day 3 (Buffer/Polish)**:
- [ ] Mobile responsive
- [ ] Sound effects
- [ ] Tutorial overlay
- [ ] Deploy to Vercel

### Week 2: Polish Sprint (20-30 hours)

- [ ] Smooth animations (Framer Motion)
- [ ] 30+ total cards
- [ ] 8+ enemy types
- [ ] Boss battle with phases
- [ ] Meta-progression (unlockable characters)
- [ ] Achievements system
- [ ] Improved visual design
- [ ] Particle effects

### Week 3+: Portfolio Features

- [ ] Daily challenge with leaderboard
- [ ] Deck import/export (share builds)
- [ ] Run history & statistics
- [ ] Advanced analytics (win rates by card)
- [ ] Replay system
- [ ] Accessibility (keyboard controls, screen reader)
- [ ] Internationalization (i18n)

---

## 📈 SUCCESS METRICS

### Portfolio Impact

**Primary Goal**: Get recruiters to play 2+ runs

**KPIs**:
- Average session length >10 minutes
- 60%+ of visitors start a run
- 30%+ complete at least 3 floors
- <5% bounce rate on landing page

### Technical Showcase

- Clean, readable code (ESLint score 100)
- <2s initial load
- Zero console errors
- Passes WCAG AA accessibility
- 90+ Lighthouse scores

### Game Feel

- "One more run" factor (qualitative)
- Positive feedback in portfolio reviews
- Used as conversation starter in interviews

---

## 🎓 PORTFOLIO PRESENTATION

### GitHub README

Include:
- Animated GIF of gameplay
- Tech stack badges
- "Play Now" link prominently
- Key features list
- Architecture diagram
- Code quality metrics

### Live Demo

Host at: `probability-deck.yourname.dev`

Landing page includes:
- "Play Now" button
- Quick gameplay video (15s)
- Feature highlights
- Tech stack used
- Link to code

### Case Study

Write-up covering:
1. **Problem**: "How do you make RNG feel fair in a deckbuilder?"
2. **Solution**: Transparent probability + player agency
3. **Process**: Design decisions, iterations
4. **Results**: Metrics, feedback, learnings
5. **Code Samples**: Probability engine, state management

---

## 🔧 EXTENSIBILITY

### Easy to Add

- New cards (JSON config)
- New enemies (class inheritance)
- New characters (plugin system)
- New visual themes (CSS variables)

### Potential Expansions

1. **Multiplayer**:
   - Race mode (who wins faster)
   - Shared deck building
   - PvP battles

2. **Endless Mode**:
   - Infinite floors
   - Leaderboard for deepest run
   - Difficulty scaling

3. **Custom Runs**:
   - Build your own deck before starting
   - Challenge codes (share runs)
   - Modifiers (all cards cost 1 energy, etc.)

4. **Cosmetics**:
   - Card backs
   - Board themes
   - Particle effects
   - Sound packs

---

## 📝 OPEN QUESTIONS

### Design Decisions to Test

1. **Should failed cards go to discard or stay in hand?**
   - Discard = more forgiving
   - Stay = more punishing

2. **Energy system: 3 per turn or scaling (3/4/5)?**
   - Fixed = simpler to balance
   - Scaling = more late-game power

3. **How many floors is ideal?**
   - 10 floors = ~15 min runs
   - 20 floors = ~30 min runs

4. **Should there be healing cards?**
   - Yes = longer runs, more forgiving
   - No = tighter economy, higher stakes

### Playtesting Focus

- Is the probability visualization clear?
- Do players understand risk/reward?
- Is the starting deck too weak/strong?
- Are runs too short/long?
- Do players feel cheated by RNG?

---

## 🎯 TL;DR FOR RECRUITERS

**What is it?**  
A roguelike deckbuilder where you gamble with probability. Every card shows exact odds, and you manipulate risk through combos and upgrades.

**Why is it impressive?**
- Real-time probability calculations
- Complex state management (deck, battles, meta-progression)
- Polished UI/UX for intricate systems
- Mobile-responsive
- Demonstrates game design + engineering

**Tech Stack**:  
React, TypeScript, Tailwind, Framer Motion, Zustand

**Play it**: [Live demo link]  
**Code**: [GitHub repo link]

**Development Time**: 2-3 days for MVP, 1 week for polish

---

## 📞 NEXT STEPS

Ready to build? Here's the flow:

1. **Approve Design**: Any changes to core mechanics?
2. **Set Up Project**: Initialize React + TypeScript
3. **Build Core Loop**: Get battle system working
4. **Add Content**: Cards, enemies, progression
5. **Polish**: Animations, sounds, responsive
6. **Deploy**: Vercel + portfolio integration

**Estimated Timeline**: 
- MVP: This weekend
- Polish: Next week
- Portfolio-ready: 10 days

Let's build this! 🎰🃏
