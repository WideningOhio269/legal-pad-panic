'use strict';
/* =========================================================
   SETTINGS: tweak these after playtesting
   ========================================================= */
const CFG = {
  hearts: 4,
  inkMax: 100,
  lapPicks: 10,            // picks per lap
  restAfter: 5,            // rest stage after this pick
  restSeconds: 120,        // max rest length, there is a done button
  skipGrace: 2,            // skips a long game allows before the AI moves without you
  shortCopies: 4,          // copies of each short game per lap deck
  shortExtras: 2,          // random extra short games per lap deck
  shortTimeBase: 8, shortTimeMin: 5, shortTimeStepPerLap: 0.5,
  persistTime: 8, persistTimeMin: 6, extraTurnTime: 6,
  doubleShortChance: 0.2,
  goldChance: 0.12,
  shortBase: 100, shortTimeBonus: 50,
  persistMove: 25,
  win:  { ttt: 400, mancala: 1000 },
  draw: { ttt: 150, mancala: 300 },
  lossPoints: 300,
  ink: { loss: 40, fold: 10, timeout: 15, winRefill: 30, dry: 5 },  // dry = lost every pick you play a short game
  streakStep: 0.1, streakCap: 20,   // streak multiplier 1 + 0.1 per clear, max 3x
  lapStep: 0.25,                    // lap multiplier 1 + 0.25 per lap
  // per lap: grid size and k = how close to a wall the dot can get (bigger k = fatter dot, tighter corridors)
  mazeLaps: [ {c:9,r:5,k:0.2}, {c:8,r:5,k:0.25}, {c:7,r:4,k:0.29}, {c:6,r:4,k:0.33}, {c:5,r:3,k:0.36} ],
  mazeMaxCell: 64,
  mazeHits: 2,                      // wall hits allowed before you fail
  mazePause: 0.8,                   // seconds the game and timer stop after a bump
  mazeGrace: 0.8,                   // seconds of no-hit after the pause ends
  mazeGrab: 0.6,                    // how close (in cells) you must press to the ball to pick it up
  mazeLeash: 1.5,                   // drag farther than this (in cells) from the ball and you drop it
  mazeSpeed: 6.5,                   // cells per second
  plinkoRows: [7,8,9,10],
  plinkoStarSlots: [3,2,1,1],
  plinkoPoints: [150,250,400],      // points per lap (lap 3+ uses the last one)
  plinkoSwing: [1.0,1.25,1.5,1.8],
  aiMistake: { cautious: 0.14, normal: 0.22, aggressive: 0.3 },
  mancalaStones: 3, mancalaDepth: 5,
  boilFps: 7,                       // how often the ink lines "boil"
  jitter: 1                         // overall hand-drawn wobble
};
