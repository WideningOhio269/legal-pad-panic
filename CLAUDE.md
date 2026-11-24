# Legal Pad Panic: notes for Claude Code

## What this is
A WarioWare style browser microgame. Everything lives in `index.html`: one canvas, plain JavaScript, no frameworks, no build step. The only outside resource is Google Fonts (Caveat, Gochi Hand). Keep it runnable by just opening the file. If the file gets too large, splitting into plain JS files loaded with script tags is fine; avoid bundlers.

## Code layout
`index.html` is only the page shell (head, fonts, styles, canvas, script tags). All code is plain classic scripts sharing one global scope, loaded in this order (order matters, no modules):
- `js/config.js`: `CFG` settings block. All tuning numbers live here. Add new tunables here instead of hardcoding.
- `js/util.js`: canvas and logical size globals (`W`, `H`, `cv`, `ctx`), colors, rng and math helpers, `shade`, `spline`.
- `js/draw.js`: hand drawn primitives `inkPath`, `inkLine`, `inkRect`, `inkEllipse`, `hatchFill`, `htext`, plus heart/star helpers. Seeded wobble plus a "boil" that re-rolls at `CFG.boilFps`. Pass a stable `seed` per element so lines boil instead of flicker randomly.
- `js/paper.js`: pre-rendered art (`buildDesk`, `buildPaper`, `makeNoteCanvas` with random curls), the `GAMES`, `SHORTS`, `PERSISTS` tables, and note drawing and hit testing.
- `js/games/maze.js`, `plinko.js`: short games (`Maze`, `Plinko`).
- `js/games/tictactoe.js`, `mancala.js`: persistent games (`TTT`, `Mancala`).
- `js/doodles.js`: rest stage doodles.
- `js/state.js`: `G` state, `MODE` machine, offers, scoring, ink, skip rule, `choose`, `finishGame`, `afterResult`, `gameOver`, `update(dt)`.
- `js/render.js`: HUD, stack, sketchbook, stamps, timer, title and game over screens, `render()`.
- `js/main.js`: input handlers, resize, main loop, boot.

Modes: title, pick, fly, prompt, play, result, rest, restout, lapend, gameover. `update(dt)` then `render()` each frame. Logical game area is 1000x700, scaled to fit the window.

## How to add a new game
1. Create a class in `js/games/<name>.js` following the interfaces below (start the file with `'use strict';`).
2. Add an entry to `GAMES` in `js/paper.js` and the id to `SHORTS` or `PERSISTS`. Persistent games also need an instance in `newRun()` (`G.persist`) in `js/state.js`, and short games a branch in `startGame()`.
3. Add its `<script src="js/games/<name>.js"></script>` tag to `index.html`, before `js/doodles.js`.
4. Add any tunables (points, times, sizes) to `CFG` in `js/config.js`, including `CFG.win` / `CFG.draw` for persistent games.
5. Add note art for it in `drawNoteContent` (`js/paper.js`), then playtest.

## Game interfaces
Short game: `update(dt)`, `draw()`, `onDown/onMove/onUp(x,y)`, `freeze()` (pauses the timer), `cursor()`, optional `onTimeout()` returning true if handled. Set `done=true` and `outcome='win'|'fail'`.
Persistent game: same, plus `begin()` each appearance, `reset()` for a new game, `aiSkipTurn()` for the skip rule, `noteInfo()`, `drawMini()`, and fields `playerMoves`, `timeouts`, `extraTurn`, `skips`. Outcome is 'move'|'win'|'lose'|'draw'.

## Design rules (agreed with the owner, do not change without asking)
- Art: organic sketchbook / legal pad. Nothing should look like clean geometry. Wobbly ink lines, handwritten text, soft shadows, sticky notes with varied curls and shapes. No emojis.
- Mouse only. No gameplay can depend on sound.
- Each round: pick 1 of 2 sticky notes. One is always a short game; the other is a long game, or another short game 20% of the time. Gold star notes pay double.
- Lap = 10 picks, rest stage after pick 5. Rest is up to 2 minutes with a done button; drawings are kept in the margin and shown on game over.
- 4 hearts. A short game fail costs a heart. Maze: 2 wall bumps or a timeout fails. Plinko: 3/2/1 star slots by lap, pays 150/250/400.
- Ink: drains 5 per short game played, 40 on a long game loss, 15 on a long game timeout. A long game win refills 30. Empty ink costs a heart and refills.
- Skip rule: a long game can be skipped twice for free; from the 3rd skip on, the AI moves without you. Playing it resets the count. Never punish a game the player was not offered.
- AI: medium difficulty, scores moves but deviates sometimes (mood plus mistake rate). It must not get smarter mid game or be perfectly predictable.
- Scoring: short game 100 plus up to 50 time bonus (plinko has no time bonus); long game moves 25 each; wins 400 (tic tac toe) and 1000 (mancala); loss -300 and streak reset. Multiplier = streak (+0.1 per win, max 3x) times lap (+0.25 per lap). Score never goes below 0.

## Planned next
Games still to add: sudoku (short), minesweeper (short), poker (long, each hand won or lost, fold/call/raise, AI bluffs sometimes), backgammon (long, shortened). Add them one at a time and playtest between.

## Testing
Playtest a single game: open `index.html?game=maze` (also `plinko`, `ttt`, `mancala`), optional `&lap=3` for later-lap difficulty. It skips the title, serves only that game every round, and never ends the run (hearts and ink refill). The code is `TEST` and `testNext()` in `js/state.js`. Add new games to `GAMES` and they work automatically.

Open index.html in a browser. Headless check: load the page with Playwright, call `newRun()`, force offers with `G.offers=[...]` and `choose()`, and watch for console errors.
