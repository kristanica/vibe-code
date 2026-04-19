# Probability Deck: The Math Behind the Magic

In *Probability Deck*, your success is never truly random—it is a layered, transparent equation that you can actively manipulate. Every time you play a card, a 1-100 roll is made against your **Final Odds**. If the roll is less than or equal to your Final Odds, the card succeeds.

Here is the exact breakdown of how your Final Odds are calculated.

---

## The Probability Pipeline

The game calculates your chances in a specific, layered order. Your odds start with the card's **Base Odds** and are then modified by six distinct systems.

**The Golden Rule:** Final Odds are always capped. They can never drop below **5%** and can never exceed **100%**.

### 1. Base Odds (The Foundation)
Every card has a printed Base Success Rate. 
* *Example: Safe Strike (85%), Jackpot Strike (15%)*

### 2. Status Effects (Buffs & Debuffs)
Temporary combat effects applied to your character.
* **Sharp Eye:** Increases odds (e.g., +50% for 3 turns).
* **Debuff Odds:** Decreases odds (applied by certain enemies).

### 3. Base Stats (Permanent Progression)
As you level up or complete events, you can permanently increase your `Success Rate Bonus`. Every point in this stat translates to a permanent +1% to all card rolls.

### 4. Relics (Global Modifiers)
Certain relics provide a flat `GLOBAL_SUCCESS_CHANCE` bonus. As long as you hold the relic, this bonus applies to every card you play.

### 5. Temporary Modifiers (Card Synergies)
Some cards (like *Combo Ready* or *Probability Storm*) dynamically inject immediate probability bonuses into your next plays during a single turn.

### 6. Enemy Debuffs (The Opposition)
Certain elite enemies or bosses have an innate aura (e.g., `debuffOdds: -10`) that suppresses your probability just by being in the room with them.

---

## The Dynamic Systems

These three systems constantly shift your odds up and down based on your immediate actions and momentum.

### System A: The Combo Streak (Momentum)
* **How it works:** Every consecutive successful card you play increases your Combo multiplier.
* **The Math:** +2% Success Chance per active combo.
* **The Cap:** Maximum of +10% (Combo x5).
* **The Catch:** The moment a card fails, your combo breaks and resets to 0.

### System B: The Pity System (Bad Luck Protection)
* **How it works:** To prevent extreme strings of bad luck, the game silently takes pity on you when you fail. Every consecutive failed card increases your Failure Streak.
* **The Math:** +5% Success Chance per consecutive failure.
* **The Cap:** Maximum of +25% (5 failures in a row).
* **The Catch:** The moment you land a successful roll, your pity bonus resets completely to 0. Use your built-up pity wisely on a high-risk, high-reward card!

### System C: Entropy (Exhaustion & Chaos)
* **How it works:** Every time you successfully land a card, you "consume" a bit of the universe's favorable probability. The more success you have, the more chaotic the universe becomes.
* **The Math:** +1 Entropy point per **Successful** card play.
* **The Penalty:** -0.5% Success Chance per point of Entropy (2 points = -1%).
* **The Catch:** Entropy NEVER resets during a battle. It only clears when you defeat the enemy. This acts as a soft-enrage timer for long fights.

---

## Example Calculation

You are fighting an Elite enemy and decide to play **The Guillotine**. You have failed your last 3 cards, but you have a Sharp Eye buff active.

* **Base Odds:** 25% (The Guillotine)
* **Status Effects:** +15% (Sharp Eye active)
* **Base Stats:** +4% (Leveled up Success Rate 2 times)
* **Enemy Debuff:** -5% (Elite Aura)
* **Pity System:** +15% (3 failures x 5%)
* **Entropy:** -6% (You have played 6 cards this battle)
* **Combo:** +0% (You have no active combo due to failures)

**Calculation:** `25 + 15 + 4 - 5 + 15 - 6 + 0`

**Final Odds: 48%** *(Displayed directly on the Card UI)*