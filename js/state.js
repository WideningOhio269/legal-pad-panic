'use strict';
/* ---------- game state ---------- */
let G = null, MODE = 'title', MT = 0;
let HI = 0; try { HI = parseInt(localStorage.getItem('lpp_hi')||'0',10) || 0; } catch(e){}
const mouse = { x:0, y:0, down:false };
let titleBtn = null, againBtn = null;

/* Playtest mode: open index.html?game=maze (or plinko, ttt, mancala), optional &lap=3.
   Skips the title, serves only that game every round, and never ends the run. */
const TEST = (()=>{ try{ const p=new URLSearchParams(location.search), id=p.get('game'); if(!id || !GAMES[id]) return null; return {id, lap:Math.max(1, parseInt(p.get('lap')||'1',10)||1)}; }catch(e){ return null; } })();
function testNext(){
  G.pick=0; G.hearts=CFG.hearts; G.ink=CFG.inkMax;
  makeOffers(); const n=G.offers.find(o=>o.id===TEST.id); n.hover=0; choose(n);
}

function newRun(){
  G = { score:0, hearts:CFG.hearts, ink:CFG.inkMax, streak:0, bestStreak:0, lap:1, pick:0,
        shortDeck:[], offers:[], discard:null, stack:[], stackOut:[], fly:null, cur:null, timer:null,
        persist:{ ttt:new TTT(), mancala:new Mancala() },
        stats:{ won:0, lost:0, drawn:0, shortWon:0, shortFailed:0 }, drawings:[], popups:[], shake:0, result:null, rest:null, book:-592, newBest:false, goFlip:0 };
  if(TEST){ G.lap=TEST.lap; buildShortDeck(); testNext(); return; }
  buildShortDeck(); makeOffers(); setMode('pick');
}
function setMode(m){ MODE=m; MT=0; }
function buildShortDeck(){ const d=[]; for(const id of SHORTS) for(let k=0;k<CFG.shortCopies;k++) d.push(id); for(let k=0;k<CFG.shortExtras;k++) d.push(pick(SHORTS)); G.shortDeck=shuffle(d); }
function drawShort(){ return G.shortDeck.length ? G.shortDeck.pop() : pick(SHORTS); }
function makeOffers(){
  let a=drawShort(), b = R()<CFG.doubleShortChance ? drawShort() : pick(PERSISTS);
  if(TEST){ if(SHORTS.includes(TEST.id)){ a=b=TEST.id; } else { a=TEST.id; b=drawShort(); } }
  G.offers = shuffle([a,b]).map((id,k)=>{ const n=makeNote(id); n.gold = R()<CFG.goldChance; n.x = k===0?330:670; n.y=372; n.rot=(R()-0.5)*0.17; n.enter=-k*0.08; return n; });
  G.pick++;
}
function mults(){ return { lapM: 1+(G.lap-1)*CFG.lapStep, strM: 1+Math.min(G.streak,CFG.streakCap)*CFG.streakStep }; }
function popup(text,x,y,c=INK,size=30){ G.popups.push({text,x,y,c,size,t:0,seed:newSeed()}); }
function drainInk(a){ G.ink-=a; if(G.ink<=0){ G.hearts--; G.ink=CFG.inkMax; G.shake=0.4; popup('out of ink! -1 heart', 380, 150, RED, 28); } }

function applyPersist(id, outcome, gold, moves, timeouts){
  const {lapM,strM}=mults(); let pts=Math.round(CFG.persistMove*moves*lapM*gold), stamp='', col=RED, sub='';
  for(let i=0;i<timeouts;i++) drainInk(CFG.ink.timeout);
  if(outcome==='win'){ pts += Math.round(CFG.win[id]*strM*lapM*gold); G.streak++; G.ink=Math.min(CFG.inkMax, G.ink+CFG.ink.winRefill); G.stats.won++; stamp='WON!'; sub='fresh ink cartridge +'+CFG.ink.winRefill; }
  else if(outcome==='lose'){ pts -= CFG.lossPoints; G.streak=0; drainInk(CFG.ink.loss); G.stats.lost++; stamp='LOST'; sub='streak reset · ink spilled'; }
  else if(outcome==='draw'){ pts += Math.round(CFG.draw[id]*lapM*gold); G.stats.drawn++; stamp='DRAW'; }
  else { if(timeouts){ stamp='TOO SLOW'; sub='random move · -ink'; } else { stamp='MOVED'; col='#2b4a8c'; } }
  return {pts, stamp, col, sub};
}
function choose(n){
  const other = G.offers.find(o=>o!==n); G.discard = other ? {n:other, t:0} : null;
  if(n.kind==='persist') G.persist[n.id].skips=0;
  if(other && other.kind==='persist'){
    const g=G.persist[other.id]; g.skips=(g.skips||0)+1;
    if(g.skips>CFG.skipGrace){
      const out=g.aiSkipTurn();
      if(out){
        const r=applyPersist(other.id, out, 1, 0, 0);
        G.score=Math.max(0,G.score+r.pts); G.bestStreak=Math.max(G.bestStreak,G.streak);
        const msg = out==='lose' ? 'they won while you were away' : out==='win' ? 'you won while away?!' : 'it ended in a draw';
        popup(`${other.gm.name}: ${msg} ${r.pts>0?'+':''}${r.pts}`, 500, 200, out==='win'?'#2b6b2b':RED, 26);
        g.reset(); g.skips=0;
      } else popup(`${other.gm.name}: they moved without you`, 500, 200, RED, 24);
    }
  }
  G.offers=[]; G.fly={ n, x0:n.x, y0:n.y-n.hover*7, r0:n.rot, s0:1+n.hover*0.03, x1:868+rr(-12,12), y1:596+rr(-8,8), r1:(R()-0.5)*0.45, t:0 };
  setMode('fly');
}
function startGame(n){
  if(n.kind==='short'){ const g = n.id==='maze' ? new Maze(G.lap) : new Plinko(G.lap); G.cur={n,kind:'short',g}; G.timer={dur:Math.max(CFG.shortTimeMin, CFG.shortTimeBase-(G.lap-1)*CFG.shortTimeStepPerLap), el:0}; }
  else { const g=G.persist[n.id]; g.begin(); G.cur={n,kind:'persist',g}; G.timer={dur:Math.max(CFG.persistTimeMin, CFG.persistTime-(G.lap-1)*0.3), el:0}; }
  setMode('prompt');
}
function finishGame(){
  const {n,kind,g}=G.cur, gold=n.gold?2:1, {lapM,strM}=mults();
  let pts=0, stamp='', col=RED, sub='';
  if(kind==='short'){
    if(g.outcome==='win'){
      if(n.id==='plinko') pts=Math.round(CFG.plinkoPoints[Math.min(G.lap-1,CFG.plinkoPoints.length-1)]*strM*lapM*gold);
      else { const frac=1-G.timer.el/G.timer.dur; pts=Math.round((CFG.shortBase+CFG.shortTimeBonus*frac)*strM*lapM*gold); }
      G.streak++; stamp=pick(['NICE','GOOD','YES!']); G.stats.shortWon++;
    }
    else { G.hearts--; G.streak=0; stamp='NOPE'; sub = (n.id==='maze' && g.hits>=CFG.mazeHits) ? 'two wall bumps · -1 heart' : '-1 heart'; G.shake=0.4; G.stats.shortFailed++; }
    drainInk(CFG.ink.dry); popup(`-${CFG.ink.dry} ink`, 400, 150, '#2b3a8c', 20);
  } else {
    const r=applyPersist(n.id, g.outcome, gold, g.playerMoves, g.timeouts);
    pts=r.pts; stamp=r.stamp; col=r.col; sub=r.sub;
    if(g.outcome!=='move') g.needsReset=true;
  }
  G.score=Math.max(0, G.score+pts); G.bestStreak=Math.max(G.bestStreak,G.streak);
  G.result={stamp,pts,col,sub};
  if(pts) popup((pts>0?'+':'')+pts.toLocaleString(), 870, 168, pts>0?'#2b6b2b':RED, 32);
  setMode('result');
}
function afterResult(){
  const c=G.cur; if(c && c.kind==='persist' && c.g.needsReset){ c.g.needsReset=false; c.g.reset(); }
  G.cur=null;
  if(TEST) return testNext();
  if(G.hearts<=0) return gameOver();
  if(G.pick===CFG.restAfter){ G.rest={strokes:[], cur:null, tab:'draw', doodle:ri(0,DOODLES.length-1), flip:0, seed:newSeed()}; setMode('rest'); return; }
  if(G.pick>=CFG.lapPicks){ G.stackOut=G.stack.map(s=>Object.assign({},s,{vx:rr(300,700),vy:rr(-200,100),vr:rr(-3,3)})); G.stack=[]; setMode('lapend'); return; }
  makeOffers(); setMode('pick');
}
function gameOver(){
  G.newBest = G.score>HI; if(G.newBest){ HI=G.score; try{ localStorage.setItem('lpp_hi', String(HI)); }catch(e){} }
  const n=makeNoteCanvas('#8FC9F5', 230, 96, newSeed()); againBtn={x:500,y:604,w:230,h:96,rot:(R()-0.5)*0.08,cv:n.cv,pad:n.pad};
  setMode('gameover');
}

/* ---------- update ---------- */
function update(dt){
  MT += dt;
  if(!G) return;
  G.shake=Math.max(0,G.shake-dt);
  for(const p of G.popups) p.t+=dt; G.popups=G.popups.filter(p=>p.t<1.6);
  if(G.discard){ G.discard.t+=dt; if(G.discard.t>0.5) G.discard=null; }
  for(const s of G.stackOut){ s.x=(s.x??868)+s.vx*dt; s.y=(s.y??596)+s.vy*dt; s.vy+=900*dt; s.rot+=s.vr*dt; }
  const restOpen = MODE==='rest';
  const bt = restOpen ? 212 : -592; G.book += (bt-G.book)*Math.min(1, dt*9);

  if(MODE==='pick'){ for(const n of G.offers){ n.enter=Math.min(1,n.enter+dt*3.2); const h=n.enter>=1 && noteHit(n,mouse.x,mouse.y); n.hover += ((h?1:0)-n.hover)*Math.min(1,dt*14); } }
  else if(MODE==='fly'){ G.fly.t+=dt/0.42; if(G.fly.t>=1){ const f=G.fly; G.stack.push({n:f.n, rot:f.r1, dx:f.x1-868, dy:f.y1-596}); G.fly=null; startGame(f.n); } }
  else if(MODE==='prompt'){ if(MT>0.8) setMode('play'); }
  else if(MODE==='play'){
    const g=G.cur.g; g.update(dt);
    if(g.extraTurn){ g.extraTurn=false; G.timer={dur:CFG.extraTurnTime, el:0}; }
    if(!g.done && !g.freeze()){ G.timer.el+=dt; if(G.timer.el>=G.timer.dur){ G.timer.el=G.timer.dur; const handled = g.onTimeout ? g.onTimeout() : false; if(!handled){ g.done=true; g.outcome='fail'; } } }
    if(g.done) finishGame();
  }
  else if(MODE==='result'){ if(MT>1.25) afterResult(); }
  else if(MODE==='rest'){ if(MT>CFG.restSeconds+0.4 || G.rest.end){ const r=G.rest; if(r.cur){ r.strokes.push(r.cur); r.cur=null; }
      if(r.strokes.reduce((s,st)=>s+st.length,0)>4) G.drawings.push(r.strokes);
      setMode('restout'); } }
  else if(MODE==='restout'){ if(MT>0.55){ makeOffers(); setMode('pick'); } }
  else if(MODE==='lapend'){ if(MT>2.0){ G.lap++; G.pick=0; G.stackOut=[]; buildShortDeck(); makeOffers(); setMode('pick'); } }
  else if(MODE==='gameover'){ G.goFlip+=dt; }
}
