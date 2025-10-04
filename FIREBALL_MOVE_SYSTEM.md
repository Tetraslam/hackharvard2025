# 🔥 FIREBALL - Complete Move System Documentation

## Full Move List with Technical Specifications

### 1. 🔥 FIREBALL
**Damage:** 15  
**Speed Tier:** Medium (1.5s hold time)  
**Category:** Offensive - Projectile  

**Gesture Recognition:**
- **Pose:** Kamehameha stance
- **Detection Points:**
  - Both shoulders aligned forward
  - Both elbows extended (arms at ~80-90% extension)
  - Both wrists together at centerline of body
  - Palms facing forward/together
  - Hold stability required for 1.5 seconds

**Properties:**
- Standard projectile attack
- Mid-range damage, mid-range speed
- Foundational offensive move

**Special Interactions:**
- vs Fireball: Both fireballs collide mid-air. Both players take 5 splash damage. Visual effect: explosion between players.
- vs Mirror: Reflected back at caster for 11 damage (75% of 15)
- vs Shield: Blocked completely (0 damage)
- vs Dodge Roll: 50% chance to miss
- vs Parry: If parry timed correctly, blocked + opponent takes 15 damage

**Balance Notes:**
- Bread-and-butter move
- Safe, reliable chip damage
- Collision mechanic creates mind games (both players throw = both lose HP)

---

### 2. ⚡ LIGHTNING BOLT
**Damage:** 20  
**Speed Tier:** Fast (1.0s hold time)  
**Category:** Offensive - Direct Strike  

**Gesture Recognition:**
- **Pose:** Zeus casting
- **Detection Points:**
  - One arm raised straight up (90° from body, pointing to ceiling)
  - Other arm extended forward (90° from body, pointing at opponent)
  - Arms should form an "L" shape when viewed from side
  - Fingers can be pointed or open
  - Hold stability for 1.0 seconds

**Properties:**
- Fast cast time
- High damage output
- Shield Piercing: Goes through shields for half damage

**Special Interactions:**
- vs Shield: Deals 10 damage (pierces shield for 50% damage)
- vs Mirror: Reflected back for 15 damage (75% of 20)
- vs Dodge Roll: 50% chance to miss
- vs Parry: If parry timed correctly, blocked + opponent takes 15 damage
- vs Power Stance buffed target: Still only does 20 base (doesn't get buffed), but if Lightning is buffed it does 30

**Balance Notes:**
- Counter to defensive play
- Forces shield users to respect offense
- Fast enough to interrupt slow moves
- High damage + fast speed balanced by shield piercing (not full damage through shield)

---

### 3. 🌊 TIDAL WAVE
**Damage:** 18  
**Speed Tier:** Medium (1.5s hold time)  
**Category:** Offensive - Area Control  

**Gesture Recognition:**
- **Pose:** Two-part motion
- **Detection Points Part 1 (0-0.7s):**
  - Both arms crossed at chest (wrists crossed in X shape)
  - Hands near opposite shoulders
- **Detection Points Part 2 (0.7-1.5s):**
  - Arms sweep outward horizontally
  - Arms end at ~180° apart (T-pose width)
  - Motion must be smooth and continuous
- **Total hold/motion time:** 1.5 seconds

**Properties:**
- Knockback: Pushes opponent back (visual effect)
- Interrupt: Cancels any charge moves in progress
- Mid-high damage

**Special Interactions:**
- vs Meteor Strike: If Meteor is charging, Tidal Wave interrupts it (Meteor canceled, deals 0 damage)
- vs Power Stance: Interrupts the charge, stance buff is lost
- vs Shield: Blocked completely
- vs Mirror: Reflected back for 13 damage (75% of 18) - BUT loses interrupt property
- vs Dodge Roll: 50% chance to miss
- vs Parry: If parry timed correctly, blocked + opponent takes 15 damage

**Balance Notes:**
- Control tool to stop big plays
- Forces opponents to respect your timing
- Counters greedy charge moves
- Motion-based gesture = slightly harder to execute = justified interrupt power

---

### 4. ☄️ METEOR STRIKE
**Damage:** 30  
**Speed Tier:** Slow (2.5s hold time)  
**Category:** Offensive - High Risk/Reward  

**Gesture Recognition:**
- **Pose:** Two-part motion
- **Detection Points Part 1 (0-1.5s):**
  - Both arms raised above head
  - Elbows slightly bent
  - Hands above shoulders
  - Charging phase (visual: rocks gathering above)
- **Detection Points Part 2 (1.5-2.5s):**
  - Both arms slam downward
  - Arms end at sides or slightly forward
  - Motion must be forceful/quick
- **Total time:** 2.5 seconds

**Properties:**
- Highest base damage in the game
- Interruptible: Can be canceled by fast moves during charge
- Telegraphed: Long wind-up warns opponent
- Unstoppable if completed: Once slam animation starts (2.4s mark), cannot be interrupted

**Special Interactions:**
- vs Tidal Wave: Interrupted during charge, Meteor canceled (0 damage)
- vs Shadow Blade: Interrupted during charge if Shadow Blade hits before 2.4s
- vs Lightning Bolt: Interrupted during charge if Lightning hits before 2.4s
- vs Shield: Blocked completely (even at 30 damage)
- vs Mirror: NOT reflected (too physical/massive)
- vs Dodge Roll: 50% chance to miss
- vs Parry: If parry timed correctly during slam, blocked + opponent takes 15 damage
- vs Power Stance buff: Deals 45 damage (30 × 1.5) - MASSIVE

**Balance Notes:**
- High risk = high reward
- Requires good timing and prediction
- Opponent has 2.5s to react (enough time to throw Shadow Blade, Tidal Wave, or Lightning)
- Should only land if opponent is greedy, respecting you too much, or you've conditioned them
- Makes Power Stance → Meteor combo terrifying (45 damage!)

---

### 5. 🗡️ SHADOW BLADE
**Damage:** 12  
**Speed Tier:** Very Fast (0.8s hold time)  
**Category:** Offensive - Quick Strike  

**Gesture Recognition:**
- **Pose:** Two-part motion (quick)
- **Detection Points Part 1 (0-0.4s):**
  - One arm across body (like hand on sword hilt)
  - Hand near opposite shoulder/chest
  - Other arm relaxed or ready
- **Detection Points Part 2 (0.4-0.8s):**
  - Arm slashes outward (horizontal slice motion)
  - Arm extends to side
  - Quick, sharp motion
- **Total time:** 0.8 seconds

**Properties:**
- Fastest move in the game
- Low damage
- Interrupt power: Fast enough to stop Meteor Strike
- Safe poke: Low commitment

**Special Interactions:**
- vs Meteor Strike: Interrupts if cast before Meteor completes (before 2.4s)
- vs Power Stance: Interrupts the charge
- vs Shield: Blocked completely
- vs Mirror: NOT reflected (too fast/physical)
- vs Dodge Roll: 50% chance to miss
- vs Parry: If parry timed correctly, blocked + opponent takes 15 damage
- vs Shadow Blade: Both hit (no collision mechanic)

**Balance Notes:**
- Poke tool
- Counter to greedy charge moves
- Low damage balanced by speed
- Safe, reliable, spammable
- Forces opponents to commit carefully
- High skill players can reaction-Shadow Blade to interrupt Meteors

---

### 6. 📜 JOB APPLICATION
**Damage:** 10  
**Speed Tier:** Medium (1.5s hold time)  
**Category:** Offensive - Guaranteed Hit (with exception)  

**Gesture Recognition:**
- **Pose:** Prayer hands
- **Detection Points:**
  - Both palms pressed together
  - Hands at center of chest (heart level)
  - Fingers pointing upward
  - Elbows slightly out
  - Hold stability for 1.5 seconds

**Properties:**
- Cannot be blocked by Shield
- Cannot be dodged by Dodge Roll
- Can be reflected by Mirror (special case)
- Can ONLY be countered by Fill Out Form
- Lowest damage offensive move
- Guaranteed damage in most scenarios
- Desperation/safe damage option

**Special Interactions:**
- vs Shield: Goes through shield, deals 10 damage
- vs Mirror: Reflected back for 7 damage (75% of 10) - paperwork bureaucracy works both ways!
- vs Dodge Roll: Cannot be dodged, deals 10 damage
- vs Fill Out Form: HARD COUNTERED - deals 0 damage, caster is stunned for 1 second
- vs Parry: Cannot be parried (not a physical attack)
- vs Power Stance buffed: Deals 15 damage (10 × 1.5)

**Thematic Design:**
- Represents the inevitable: you will apply for jobs
- Cannot dodge your responsibilities
- Shields don't protect you from capitalism
- But bureaucracy counters bureaucracy (Fill Out Form)

**Balance Notes:**
- Guaranteed 10 damage makes it tempting when desperate
- Fill Out Form counter creates mind game
- Low damage prevents spam
- Useful for chip damage or finishing low HP opponents
- Good utility when buffed by Power Stance (15 guaranteed damage)

---

### 7. 🛡️ SHIELD
**Damage:** 0  
**Speed Tier:** Fast (1.0s hold time)  
**Category:** Defensive - Block  

**Gesture Recognition:**
- **Pose:** Boxing guard stance
- **Detection Points:**
  - Both fists raised to face level
  - Arms bent at elbows (~90°)
  - Hands protecting face/head area
  - Shoulders slightly raised
  - Stable defensive posture
  - Hold for 1.0 seconds

**Properties:**
- Blocks next incoming attack completely
- Single-use (one attack only)
- Fast activation
- Weakness: Lightning Bolt pierces for half damage

**Special Interactions:**
- vs Any attack: Blocks completely (0 damage taken)
- vs Lightning Bolt: EXCEPTION - takes 10 damage (50% pierce)
- vs Job Application: Blocked completely (stops guaranteed damage)
- vs Meteor Strike: Blocked completely (even 30 damage)
- vs Multiple hits: Only blocks first hit, subsequent attacks land
- Buff state: Does not interact with Power Stance (can't buff defensive move)

**Technical Notes:**
- Duration: Shield is "active" for 3 seconds after casting
- If no attack lands within 3s, shield expires (wasted)
- Shield does not stack (cannot cast multiple shields)
- Shield breaks after blocking one attack
- Visual: Shimmering barrier appears in front of player

**Balance Notes:**
- Strong defensive tool
- Countered by Lightning Bolt (forces shield users to respect offense)
- Requires prediction (must be active when attack lands)
- Can be baited (opponent waits for shield to expire)
- Fast cast time allows reactive play

---

### 8. 🔄 MIRROR
**Damage:** 0 (reflects damage)  
**Speed Tier:** Medium (1.5s hold time)  
**Category:** Defensive - Reflect  

**Gesture Recognition:**
- **Pose:** Frame hands in front of face
- **Detection Points:**
  - Both hands form rectangle/frame shape
  - Thumbs touching (or close)
  - Index fingers touching (or close)
  - Frame positioned in front of face
  - Arms bent, elbows out
  - Hold stable frame for 1.5 seconds

**Properties:**
- Reflects projectile spells only
- Returns 75% of original damage to caster
- Only works on: Fireball, Lightning Bolt, Job Application
- Fails against: Physical attacks (Shadow Blade, Tidal Wave, Meteor, Parry)

**Special Interactions:**
- vs Fireball: Reflects 11 damage back (75% of 15)
- vs Lightning Bolt: Reflects 15 damage back (75% of 20)
- vs Job Application: Reflects 7 damage back (75% of 10)
- vs Shadow Blade: Mirror shatters, takes full 12 damage
- vs Tidal Wave: Mirror shatters, takes full 18 damage (no interrupt on caster)
- vs Meteor Strike: Mirror shatters, takes full 30 damage
- vs Chaos Vortex: Cannot reflect (magical but not projectile), takes 8 damage + debuff

**Technical Notes:**
- Duration: Mirror is active for 3 seconds after casting
- Projectile detection: Must have clear trajectory to be reflected
- Reflection is immediate (no travel time)
- Mirror breaks after reflecting one spell OR taking physical damage
- Visual: Glass/water reflection effect in front of player

**Balance Notes:**
- Hard counter to projectile spam
- Creates mind game: "Will they throw projectile or go physical?"
- 75% reflection prevents it from being OP (not full damage return)
- Medium cast time = requires prediction
- Punished hard by physical attacks
- Advanced players can bait mirrors with fake Fireball startup → switch to Shadow Blade

---

### 9. 💨 DODGE ROLL
**Damage:** 0  
**Speed Tier:** Fast (1.0s hold time)  
**Category:** Defensive - Evasion  

**Gesture Recognition:**
- **Pose:** Lean body heavily to one side
- **Detection Points:**
  - Upper body tilted 30-45° to left OR right
  - Head leaning in tilt direction
  - Arms can be in rolling motion (optional)
  - Shoulders angled
  - Hold lean for 1.0 seconds
- **Note:** Can detect either left or right lean (both valid)

**Properties:**
- 50% chance to completely evade any attack
- RNG-based defensive option
- Fast activation
- If successful: Opponent's attack misses, opponent is vulnerable for 1 second (cannot cast another move)
- If failed: Take full damage from attack

**Special Interactions:**
- vs Any attack: 50% chance to evade completely
- vs Job Application: CANNOT dodge (Job App ignores Dodge Roll)
- On successful dodge: Opponent enters 1s vulnerable state (brief stun)
- On failed dodge: No special penalty, just take damage normally
- Buff state: Does not interact with Power Stance

**Technical Notes:**
- RNG roll happens: When opponent's attack animation would connect
- Vulnerable state: 1 second where opponent cannot start new gesture
- Visual on success: Player character sidestep animation, opponent's attack whiffs
- Visual on failure: Normal damage animation
- Duration: Dodge window is active for 2 seconds after cast

**Balance Notes:**
- High risk, high reward
- 50/50 RNG creates tension and hype moments
- Successful dodge gives tempo advantage (opponent stunned 1s)
- Cannot dodge Job Application (that's Fill Out Form's job)
- Fast cast time allows reactive play
- Creates clutch moments: "Please dodge!" → chat spam
- Not as reliable as Shield, but has punish potential

---

### 10. ✍️ FILL OUT FORM
**Damage:** 0  
**Speed Tier:** Fast (1.0s hold time)  
**Category:** Defensive - Hard Counter  

**Gesture Recognition:**
- **Pose:** Writing motion
- **Detection Points Part 1 (flat paper):**
  - One hand held flat/open (palm up or forward)
  - Hand positioned as if holding paper
  - Arm slightly extended
- **Detection Points Part 2 (writing):**
  - Other hand making scribbling motion above/across flat hand
  - Small circular or zigzag motions
  - Movement should be continuous
- **Total time:** 1.0 seconds of writing motion

**Properties:**
- ONLY counters Job Application
- Hard counter: 100% negates Job App damage
- Punish on success: Opponent stunned for 1 second
- HIGH RISK: If opponent doesn't use Job App, you're completely vulnerable

**Special Interactions:**
- vs Job Application:
  - Completely nullifies Job App (0 damage taken)
  - Opponent enters 1s stun ("processing time")
  - Visual: Papers catch fire and burn
  - Text popup: "APPLICATION DENIED"
- vs Any other attack:
  - You take FULL damage
  - No defensive benefit whatsoever
  - Visual: Papers scatter, you're hit while writing
  - Punished for bad read

**Technical Notes:**
- Must be active: When Job App would connect
- Window: Active for 2 seconds after casting
- If no Job App lands in 2s, you were just standing there writing
- Does NOT work on any other move (not even partially)
- Cannot be buffed by Power Stance (defensive move)

**Thematic Design:**
- Fighting bureaucracy with bureaucracy
- "You can't hit me with paperwork if I'm already doing paperwork!"
- High comedy potential
- Ultimate prediction play

**Balance Notes:**
- Creates intense mind game around Job Application
- High risk: Stand there writing → get Fireballed = embarrassing
- High reward: Read Job App → deny 10-15 damage + get tempo
- Fast cast allows reaction to prayer hands gesture
- Meta implications:
  - If everyone uses Fill Out Form → nobody uses Job App
  - If nobody uses Fill Out Form → Job App becomes free
  - Cyclical meta evolution
- Skill expression: Reading opponent's tendencies

**Streamer/Comedy Moments:**
- "HE'S FILLING OUT THE FORM!"
- Getting Meteored while filling out applications
- Successfully denying buffed Job App (15 damage prevented)
- Both players filling out forms while neither uses Job App

---

### 11. 🧙 POWER STANCE
**Damage:** 0  
**Speed Tier:** Medium (1.5s hold time)  
**Category:** Utility - Buff  

**Gesture Recognition:**
- **Pose:** Superhero power pose
- **Detection Points:**
  - Wide squat stance (feet wider than shoulders)
  - Fists on hips OR arms flexed
  - Chest puffed out
  - Confident posture
  - Back straight
  - Hold for 1.5 seconds

**Properties:**
- Buff: Next offensive spell deals +50% damage
- Duration: Buff lasts until you cast an offensive move
- Does not stack: Casting Power Stance again while buffed just refreshes it
- Charge move: Can be interrupted by Tidal Wave

**Special Interactions:**
- Buffed damage calculations:
  - Fireball: 15 → 22 damage
  - Lightning Bolt: 20 → 30 damage
  - Tidal Wave: 18 → 27 damage
  - Meteor Strike: 30 → 45 damage (!!)
  - Shadow Blade: 12 → 18 damage
  - Job Application: 10 → 15 damage
  - Parry: 15 → 22 damage
  - Chaos Vortex: 8 → 12 damage
- vs Tidal Wave: Interrupted, buff lost (no effect)
- vs Shadow Blade: Interrupted, buff lost
- vs Lightning Bolt: Interrupted, buff lost
- Buff is NOT consumed if you cast defensive moves (Shield, Mirror, Dodge Roll, Fill Out Form)
- Buff IS consumed when offensive move connects (hit or blocked doesn't matter)

**Technical Notes:**
- Visual indicator: Player glows/pulses while buffed
- UI indicator: "+50% POWER" text above player
- Buff persists between turns
- Buff only removed when offensive damage is calculated
- Can Power Stance → Shield → Power Stance again (stalling for setup)

**Strategic Uses:**
- Power Stance → Meteor: 45 damage combo (can kill from half HP!)
- Power Stance → Job App: 15 guaranteed damage (safe buffed option)
- Power Stance → Lightning: 30 damage fast strike
- Bait tool: Opponents panic when they see buff
- Bluff tool: Power Stance → don't attack → make them respect you
- Mind game: They expect big move, you throw fast Shadow Blade

**Balance Notes:**
- 1.5s cast time = interruptible
- Creates tense moments: "He's charging! Stop him!"
- Rewards setup and patience
- Punished by aggressive rushdown
- Makes slow moves viable (Meteor becomes 45!)
- Balanced by:
  - Can be interrupted
  - Telegraphs your intent (opponent knows you're loaded)
  - Only affects one attack
  - Medium cast time

---

### 12. ⚔️ PARRY
**Damage:** 15 (on successful counter)  
**Speed Tier:** Fast (1.0s hold time)  
**Category:** Utility - Counter Attack  

**Gesture Recognition:**
- **Pose:** Two-part motion (defensive → offensive)
- **Detection Points Part 1 (0-0.5s):**
  - One arm extended forward (blocking position)
  - Palm facing outward
  - Arm at chest/shoulder height
- **Detection Points Part 2 (0.5-1.0s):**
  - Same arm transitions to palm strike
  - Quick forward thrust
  - Sharp, decisive motion
- **Total time:** 1.0 seconds

**Properties:**
- Timing-based counter
- Perfect timing (opponent attack connects during your parry window):
  - Block incoming damage completely (0 taken)
  - Deal 15 damage to opponent
  - Opponent briefly stunned (0.5s)
- Mistimed (no attack during parry window):
  - No effect, wasted move
  - You're vulnerable for next 0.5s
- Mistimed (attacked before/after parry window):
  - Take FULL damage from attack
  - Your parry does nothing

**Special Interactions:**
- vs Any physical attack: Can parry (Fireball, Lightning, Shadow Blade, Meteor, Tidal Wave)
- vs Job Application: CANNOT parry (not physical)
- vs Chaos Vortex: Can parry damage (8), still get debuffed (gesture disruption)
- Timing window:
  - Parry active for 0.3 seconds (tight timing!)
  - Must overlap with opponent's attack animation
- On success:
  - Visual: Deflection spark effect
  - Sound: Metallic clang
  - Opponent recoils
  - Deal 15 damage
- Power Stance interaction:
  - Buffed Parry deals 22 damage (15 × 1.5)

**Technical Notes:**
- Frame data:
  - Parry window: frames 15-25 of animation (0.3s window)
  - Must match opponent's attack connect frame
- Netcode consideration:
  - Parry has 100ms leniency for online play
  - Server reconciles timing
- Cannot parry: Job Application, other defensive moves
- Can parry: All offensive attacks

**Skill Ceiling:**
- Low skill: Random parry attempts (low success rate)
- Mid skill: Parry based on opponent patterns
- High skill: Reaction parry to gesture startups
- Top skill: Bait attacks into parry timing

**Balance Notes:**
- High risk, high reward
- Punishes predictable offense
- Requires reads or reactions
- 15 damage + block = 15-45 damage swing (saved + dealt)
- Fast cast time (1s) makes it viable
- Tight timing window (0.3s) prevents spam
- Cannot parry Job App (that's Fill Out Form's job)
- Skill expression: Top players can parry on reaction

**Advanced Techniques:**
- Parry bait: Whiff a slow move to bait parry, then punish
- Pattern parry: Learn opponent's rhythm, parry their next move
- Option select: Parry covers multiple opponent options
- Feint parry: Start parry motion → cancel into different move (if game allows cancels)

---

### 13. 🌀 CHAOS VORTEX
**Damage:** 8  
**Speed Tier:** Medium (1.5s hold time)  
**Category:** Utility - Debuff  

**Gesture Recognition:**
- **Pose:** Circular stirring motion
- **Detection Points:**
  - Both arms moving in large circular patterns
  - Arms rotating like stirring a giant cauldron
  - Clockwise or counterclockwise (both valid)
  - Continuous circular motion
  - Motion should be smooth and flowing
  - Complete 2-3 full circles over 1.5 seconds

**Properties:**
- Low damage: 8 base damage
- Debuff: Opponent's next gesture has 40% fail rate
- Duration: Debuff lasts for opponent's next gesture attempt only (single use)
- Fail state: Opponent's gesture doesn't register, they waste time trying to cast

**Special Interactions:**
- Debuff effect:
  - Opponent attempts gesture
  - 40% chance gesture detection fails completely
  - They must try again (wasted 1-2 seconds)
  - Visual: Static/glitch effect on opponent's gesture trail
  - Text: "DISRUPTED!" appears
- vs Mirror: Cannot be reflected (not a projectile)
- vs Shield: Blocked completely (damage blocked, debuff still applied!)
- vs Dodge Roll: 50% chance to miss (damage only, debuff still lands if you're hit)
- vs Parry: Can be parried (damage blocked, debuff still applied!)
- Debuff stacking: Does NOT stack (multiple Chaos Vortex = refreshes debuff only)
- Buff interaction:
  - Buffed Chaos Vortex: 12 damage (8 × 1.5)
  - Debuff still 40% (doesn't increase)

**Technical Notes:**
- Gesture disruption mechanics:
  - Opponent's gesture recognition sensitivity reduced by 40%
  - MediaPipe confidence threshold increased
  - Requires cleaner, more precise gesture execution
  - OR 40% flat fail chance (simpler implementation)
- Duration: Until opponent's next successful gesture
- Visual indicators:
  - Caster: Purple/chaotic energy swirl
  - Debuffed player: Shimmer/distortion effect overlay
  - UI: "DISRUPTED" status icon on debuffed player

**Strategic Uses:**
- Before big push: Disrupt opponent's response
- After taking damage: Buy recovery time
- Mind game: Forces opponent to play safer/slower
- Combo setup: Chaos Vortex → your next big attack (they might fail their counter)
- Defensive tool: Low damage but creates space
- Interrupt opponent's rhythm: Makes them second-guess gestures

**Counterplay:**
- Cleaner gestures: Hold poses more precisely
- Simpler moves: Use easy gestures (Job App, Shield)
- Wait it out: Use fast defensive move to burn debuff
- Predict: If debuff fails your gesture, predict their follow-up

**Balance Notes:**
- Low damage (8) balanced by strong utility
- 40% fail rate creates chaos (thematic!)
- Single-use debuff prevents perma-disruption
- Medium cast time (1.5s) = fair warning
- Debuff applies even when damage is blocked (Shield/Parry)
- Creates "messy" moments (fits chaos theme)
- Skill check: Can you execute under pressure?

**Advanced Interactions:**
- Chaos → Meteor: They might fail their interrupt gesture
- Chaos → Job App: Safe damage while they're disrupted
- Shield absorbs damage but not debuff: Smart design
- Chaos into mirror matchup: Both players disrupted = wild

**Streamer Moments:**
- "THE METEOR FAILED! HE'S DISRUPTED!"
- Winning because opponent fails crucial parry
- Both players spamming Chaos = nobody can cast anything
- Clutch Job App landing because opponent's Shadow Blade failed

---

## 📊 COMPLETE INTERACTION MATRIX

| Attacker → Defender | Shield | Mirror | Dodge (50%) | Parry | Fill Form | Power Stance |
|---------------------|--------|--------|-------------|-------|-----------|--------------|
| **Fireball (15)** | 0 dmg | 11 dmg back | 0 or 15 | 0 dmg, 15 back | 15 dmg | N/A |
| **Lightning (20)** | 10 dmg | 15 dmg back | 0 or 20 | 0 dmg, 15 back | 20 dmg | N/A |
| **Tidal Wave (18)** | 0 dmg | 18 dmg | 0 or 18 | 0 dmg, 15 back | 18 dmg | Interrupts |
| **Meteor (30)** | 0 dmg | 30 dmg | 0 or 30 | 0 dmg, 15 back | 30 dmg | N/A |
| **Shadow Blade (12)** | 0 dmg | 12 dmg | 0 or 12 | 0 dmg, 15 back | 12 dmg | Interrupts |
| **Job App (10)** | 10 dmg | 7 dmg back | 10 dmg | 10 dmg | 0 dmg, stun | N/A |
| **Parry (15)** | 0 dmg | N/A | 0 or 15 | N/A | 15 dmg | N/A |
| **Chaos (8)** | 0 dmg+debuff | 8 dmg+debuff | 0+debuff or 8+debuff | 0 dmg+debuff, 15 back | 8+debuff | N/A |

---

## ⚡ SPEED TIER REFERENCE

- **Very Fast (0.8s):** Shadow Blade
- **Fast (1.0s):** Lightning Bolt, Shield, Dodge Roll, Parry, Fill Out Form
- **Medium (1.5s):** Fireball, Tidal Wave, Job Application, Mirror, Power Stance, Chaos Vortex
- **Slow (2.5s):** Meteor Strike

---

## 🎯 GESTURE DIFFICULTY TIERS

### Easy (beginner-friendly):
- Job Application (prayer hands)
- Shield (boxing stance)
- Power Stance (superhero pose)

### Medium (requires motion):
- Fireball (kamehameha hold)
- Lightning Bolt (L-shape hold)
- Dodge Roll (lean hold)
- Fill Out Form (writing motion)

### Hard (precise positioning):
- Mirror (frame hands)
- Parry (timing + motion)

### Very Hard (complex motion):
- Tidal Wave (cross → sweep)
- Shadow Blade (sheathe → slash)
- Meteor Strike (raise → slam)
- Chaos Vortex (continuous circles)

---

## 🎮 BALANCE PHILOSOPHY

This move system creates a **rock-paper-scissors-lizard-spock** style meta where:

1. **Every move has counters** - No single strategy dominates
2. **Risk vs Reward** - High damage moves are slow/telegraphed
3. **Skill Expression** - Complex gestures reward practice
4. **Mind Games** - Prediction and reads are crucial
5. **Thematic Consistency** - Each move feels like a real spell
6. **Streamer Moments** - High drama and comedy potential

The system encourages **aggressive play** while providing **defensive options**, creating a dynamic meta that evolves as players learn the interactions.
