'use strict';
/* ---------- PERSISTENT: tic tac toe ---------- */
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function tttWin(b){ for(const l of LINES){ if(b[l[0]] && b[l[0]]===b[l[1]] && b[l[0]]===b[l[2]]) return {p:b[l[0]], line:l}; } return b.every(v=>v) ? {p:3} : null; }
function tttMM(b, turn, depth){
  const w=tttWin(b); if(w){ if(w.p===2) return 10-depth; if(w.p===1) return depth-10; return 0; }
  let best = turn===2 ? -99 : 99;
  for(let i=0;i<9;i++) if(!b[i]){ b[i]=turn; const v=tttMM(b,3-turn,depth+1); b[i]=0; best = turn===2 ? Math.max(best,v) : Math.min(best,v); }
  return best;
}
class TTT {
  constructor(){ this.gameNo=0; this.reset(); }
  reset(){
    this.b=Array(9).fill(0); this.marks=[]; this.mood=pick(['cautious','normal','aggressive']);
    this.gameNo++; this.pStarts=this.gameNo%2===1; this.over=null; this.lastAI=null; this.pMoves=0; this.seed=newSeed();
    this.note='new game, you are X';
    if(!this.pStarts){ const m=this.aiChoose(); this.place(m,2,true); this.lastAI=m; this.note='they opened '+this.desc(m); }
  }
  desc(i){ return i===4 ? 'in the middle' : [0,2,6,8].includes(i) ? 'in a corner' : 'on an edge'; }
  place(i,p,instant){ this.b[i]=p; this.marks.push({i,p,t:instant?1:0,seed:newSeed()}); }
  aiChoose(){
    const moves=[]; for(let i=0;i<9;i++) if(!this.b[i]) moves.push(i);
    const sc=moves.map(m=>{ const b=this.b.slice(); b[m]=2; return {m, v:tttMM(b,1,1)}; });
    const best=Math.max(...sc.map(s=>s.v));
    const top=sc.filter(s=>s.v===best), rest=sc.filter(s=>s.v<best);
    if(rest.length && R()<CFG.aiMistake[this.mood]) return pick(rest).m;
    return pick(top).m;
  }
  noteInfo(){ return `game ${this.gameNo} · move ${this.pMoves+1}`; }
  aiSkipTurn(){
    if(tttWin(this.b)) return null;
    const m=this.aiChoose(); this.place(m,2,true); this.lastAI=m; this.note='you skipped, they went '+this.desc(m);
    const w=tttWin(this.b); if(!w) return null;
    return w.p===2 ? 'lose' : w.p===1 ? 'win' : 'draw';
  }
  begin(){ this.phase='player'; this.done=false; this.outcome=null; this.timeouts=0; this.playerMoves=0; this.wait=0; this.hover=-1; }
  freeze(){ return this.phase!=='player'; }
  cellAt(x,y){ const s=92, x0=500-1.5*s, y0=388-1.5*s; const cx=Math.floor((x-x0)/s), cy=Math.floor((y-y0)/s); if(cx<0||cy<0||cx>2||cy>2) return -1; return cy*3+cx; }
  onDown(x,y){ if(this.phase!=='player') return; const i=this.cellAt(x,y); if(i>=0 && !this.b[i]) this.playerMove(i); }
  onMove(x,y){ this.hover=this.cellAt(x,y); }
  onUp(){}
  cursor(){ return (this.phase==='player' && this.hover>=0 && !this.b[this.hover]) ? 'pointer' : 'default'; }
  onTimeout(){ if(this.phase!=='player') return true; this.timeouts++; const e=[]; for(let i=0;i<9;i++) if(!this.b[i]) e.push(i); this.playerMove(pick(e)); return true; }
  check(){ const w=tttWin(this.b); if(!w) return false; this.over=w; this.outcome = w.p===1?'win':w.p===2?'lose':'draw'; this.phase='end'; this.wait=1.0; return true; }
  playerMove(i){ this.place(i,1); this.pMoves++; this.playerMoves++; if(!this.check()){ this.phase='aiwait'; this.wait=0.55; } }
  update(dt){
    for(const m of this.marks) m.t=Math.min(1, m.t+dt*3.2);
    if(this.phase==='aiwait'){ this.wait-=dt; if(this.wait<=0){ const m=this.aiChoose(); this.place(m,2); this.lastAI=m; this.note='last time: they went '+this.desc(m);
      if(!this.check()){ this.phase='end'; this.wait=0.75; this.outcome='move'; } } }
    else if(this.phase==='end'){ this.wait-=dt; if(this.wait<=0) this.done=true; }
  }
  draw(){
    const s=92, x0=500-1.5*s, y0=388-1.5*s, sd=this.seed;
    htext(this.note, 500, 222, {size:24, c:RED, align:'center', seed:sd+1});
    for(let k=1;k<3;k++){ inkLine(x0+k*s, y0-6, x0+k*s, y0+3*s+6, {w:3.2, seed:sd+10+k, os:6}); inkLine(x0-6, y0+k*s, x0+3*s+6, y0+k*s, {w:3.2, seed:sd+20+k, os:6}); }
    if(this.phase==='player' && this.hover>=0 && !this.b[this.hover]){ const cx=x0+(this.hover%3)*s, cy=y0+Math.floor(this.hover/3)*s; hatchFill([[cx+14,cy+14],[cx+s-14,cy+14],[cx+s-14,cy+s-14],[cx+14,cy+s-14]], 'rgba(40,60,120,0.25)', 7, -0.8, 5, 1.2); }
    for(const m of this.marks){
      const cx=x0+(m.i%3)*s+s/2, cy=y0+Math.floor(m.i/3)*s+s/2;
      if(m.p===1){ const e=28; inkLine(cx-e,cy-e,cx+e,cy+e,{w:4,seed:m.seed,p:clamp(m.t*2,0,1),os:3}); inkLine(cx+e,cy-e,cx-e,cy+e,{w:4,seed:m.seed+1,p:clamp(m.t*2-1,0,1),os:3}); }
      else inkPath(ellipsePts(cx,cy,28,27,m.seed,true), {c:'#4f4f58', w:3.4, seed:m.seed, p:m.t});
    }
    if(this.lastAI!==null && this.phase!=='end'){ const cx=x0+(this.lastAI%3)*s+s/2, cy=y0+Math.floor(this.lastAI/3)*s+s/2; inkEllipse(cx,cy,42,40,{c:RED,w:2,seed:sd+50,a:0.8}); }
    if(this.over && this.over.line){ const a=this.over.line[0], b=this.over.line[2];
      const p=i=>[x0+(i%3)*s+s/2, y0+Math.floor(i/3)*s+s/2]; const A=p(a), B=p(b); const dx=B[0]-A[0], dy=B[1]-A[1], L=Math.hypot(dx,dy);
      inkLine(A[0]-dx/L*34, A[1]-dy/L*34, B[0]+dx/L*34, B[1]+dy/L*34, {c:RED, w:5, seed:sd+60, os:6}); }
    htext('you: X', 300, 560, {size:22, c:INK, seed:sd+70}); htext('them: O', 640, 560, {size:22, c:'#4f4f58', seed:sd+71});
  }
  drawMini(cx,cy,size,col){
    const s=size/3, x0=cx-size/2, y0=cy-size/2, sd=this.seed+400;
    for(let k=1;k<3;k++){ inkLine(x0+k*s,y0,x0+k*s,y0+size,{c:col,w:1.8,seed:sd+k,os:2}); inkLine(x0,y0+k*s,x0+size,y0+k*s,{c:col,w:1.8,seed:sd+10+k,os:2}); }
    for(let i=0;i<9;i++){ if(!this.b[i]) continue; const x=x0+(i%3)*s+s/2, y=y0+Math.floor(i/3)*s+s/2, e=s*0.28;
      if(this.b[i]===1){ inkLine(x-e,y-e,x+e,y+e,{c:col,w:2,seed:sd+30+i,os:1}); inkLine(x+e,y-e,x-e,y+e,{c:col,w:2,seed:sd+40+i,os:1}); }
      else inkEllipse(x,y,e,e,{c:col,w:1.8,seed:sd+50+i}); }
  }
}
