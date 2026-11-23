'use strict';
/* ---------- PERSISTENT: mancala ---------- */
function mSow(b, pit, who){
  const a=b.slice(); let n=a[pit]; a[pit]=0; let i=pit; const steps=[]; const skip = who===1?13:6;
  while(n>0){ i=(i+1)%14; if(i===skip) continue; a[i]++; n--; steps.push(i); }
  const store = who===1?6:13; let extra = i===store, cap=null;
  const mine = who===1 ? (i>=0&&i<=5) : (i>=7&&i<=12);
  if(mine && a[i]===1){ const opp=12-i; if(a[opp]>0){ cap={pit:i, opp, amt:a[opp]+1}; a[store]+=a[opp]+1; a[opp]=0; a[i]=0; } }
  let s1=0,s2=0; for(let k=0;k<6;k++){ s1+=a[k]; s2+=a[k+7]; }
  let over=false;
  if(s1===0||s2===0){ over=true; a[6]+=s1; a[13]+=s2; for(let k=0;k<6;k++){ a[k]=0; a[k+7]=0; } extra=false; }
  return {a, steps, last:i, extra, cap, over};
}
function mFinal(a){ const d=a[13]-a[6]; return d + (d>0?50:d<0?-50:0); }
function mMM(a, who, depth, al, be){
  if(depth<=0){ let s1=0,s2=0; for(let k=0;k<6;k++){ s1+=a[k]; s2+=a[k+7]; } return a[13]-a[6] + 0.25*(s2-s1); }
  const lo = who===2?7:0; let best = who===2 ? -1e9 : 1e9, any=false;
  for(let i=lo;i<lo+6;i++){
    if(!a[i]) continue; any=true;
    const r=mSow(a,i,who);
    const v = r.over ? mFinal(r.a) : mMM(r.a, r.extra?who:3-who, depth-1, al, be);
    if(who===2){ if(v>best) best=v; if(best>al) al=best; } else { if(v<best) best=v; if(best<be) be=best; }
    if(al>=be) break;
  }
  return any ? best : mFinal(a);
}
class Mancala {
  constructor(){ this.gameNo=0; this.reset(); }
  reset(){
    const n=CFG.mancalaStones; this.a=[n,n,n,n,n,n,0,n,n,n,n,n,n,0];
    this.mood=pick(['cautious','normal','aggressive']); this.gameNo++; this.pStarts=this.gameNo%2===1;
    this.lastAI=[]; this.seed=newSeed(); this.over=false; this.anim=null; this.note='new game, your pits are on the bottom';
    if(!this.pStarts){ const log=[]; let r; do { const m=this.aiChoose(); r=mSow(this.a,m,2); this.a=r.a; log.push({m,cap:r.cap,extra:r.extra}); } while(r.extra && !r.over);
      this.lastAI=log.map(l=>l.m); this.note=this.logNote(log,'they opened'); }
  }
  logNote(log, lead='last time: they'){
    const caps=log.reduce((s,l)=>s+(l.cap?l.cap.amt:0),0);
    let s = lead; s += log.length>1 ? ` went ${log.length} times` : (lead==='they opened'?'':' made a move');
    if(caps) s += `, captured ${caps}`; return s;
  }
  aiChoose(){
    const a=this.a, moves=[]; for(let i=7;i<=12;i++) if(a[i]>0) moves.push(i);
    const sc=moves.map(m=>{ const r=mSow(a,m,2); let v = r.over ? mFinal(r.a) : mMM(r.a, r.extra?2:1, CFG.mancalaDepth-1, -1e9, 1e9);
      if(this.mood==='aggressive') v += (r.cap?1.2:0) + (r.extra?0.8:0);
      v += (R()-0.5)*0.4; return {m,v}; }).sort((x,y)=>y.v-x.v);
    if(sc.length>1 && R()<CFG.aiMistake[this.mood]) return R()<0.7 ? sc[1].m : pick(sc.slice(1)).m;
    return sc[0].m;
  }
  noteInfo(){ return `you ${this.a[6]} · them ${this.a[13]}`; }
  aiSkipTurn(){
    const log=[]; let r;
    do { const m=this.aiChoose(); r=mSow(this.a,m,2); this.a=r.a; log.push({m,cap:r.cap,extra:r.extra}); } while(r.extra && !r.over);
    this.lastAI=log.map(l=>l.m); this.note=this.logNote(log,'you skipped, they');
    if(r.over) return this.a[6]>this.a[13] ? 'win' : this.a[6]<this.a[13] ? 'lose' : 'draw';
    return null;
  }
  begin(){ this.phase='player'; this.done=false; this.outcome=null; this.timeouts=0; this.playerMoves=0; this.wait=0; this.hover=-1; this.aiLog=[]; this.extraTurn=false; this.flash=null; }
  freeze(){ return this.phase!=='player'; }
  pos(i){ if(i<=5) return [300+i*80, 440]; if(i===6) return [805,380]; if(i<=12) return [300+(12-i)*80, 318]; return [195,380]; }
  pitAt(x,y){ for(let i=0;i<6;i++){ const [px,py]=this.pos(i); if(((x-px)/34)**2+((y-py)/34)**2<1) return i; } return -1; }
  onDown(x,y){ if(this.phase!=='player') return; const i=this.pitAt(x,y); if(i>=0 && this.a[i]>0) this.startMove(i,1); }
  onMove(x,y){ this.hover=this.pitAt(x,y); }
  onUp(){}
  cursor(){ return (this.phase==='player' && this.hover>=0 && this.a[this.hover]>0) ? 'pointer':'default'; }
  onTimeout(){ if(this.phase!=='player') return true; this.timeouts++; const m=[]; for(let i=0;i<6;i++) if(this.a[i]) m.push(i); this.startMove(pick(m),1); return true; }
  startMove(p, who){
    const r=mSow(this.a,p,who); const disp=this.a.slice(); disp[p]=0;
    this.anim={steps:r.steps, i:0, t:0, res:r, who, from:p, disp};
    this.phase='anim';
    if(who===1){ this.playerMoves++; } else { this.aiLog.push({m:p, cap:r.cap, extra:r.extra}); }
  }
  endGame(){ this.over=true; this.outcome = this.a[6]>this.a[13]?'win':this.a[6]<this.a[13]?'lose':'draw'; this.phase='end'; this.wait=1.1; }
  update(dt){
    if(this.flash){ this.flash.t-=dt; if(this.flash.t<=0) this.flash=null; }
    if(this.phase==='anim'){
      const A=this.anim; A.t+=dt;
      while(A.t>0.09 && A.i<A.steps.length){ A.disp[A.steps[A.i]]++; A.i++; A.t-=0.09; }
      if(A.i>=A.steps.length && A.t>0.28){
        const r=A.res; this.a=r.a; this.anim=null;
        if(r.cap) this.flash={text:(A.who===1?'captured ':'they captured ')+r.cap.amt+'!', t:1.2, who:A.who};
        if(r.over){ if(A.who===2){ this.lastAI=this.aiLog.map(l=>l.m); this.note=this.logNote(this.aiLog); } this.endGame(); return; }
        if(A.who===1){
          if(r.extra){ this.phase='player'; this.extraTurn=true; this.note='free turn! go again'; }
          else { this.phase='aiwait'; this.wait=0.45; }
        } else {
          if(r.extra){ this.phase='aiwait'; this.wait=0.35; }
          else { this.lastAI=this.aiLog.map(l=>l.m); this.note=this.logNote(this.aiLog); this.phase='end'; this.wait=0.7; this.outcome='move'; }
        }
      }
    } else if(this.phase==='aiwait'){ this.wait-=dt; if(this.wait<=0){ if(this.aiLog.length===0) this.lastAI=[]; this.startMove(this.aiChoose(),2); } }
    else if(this.phase==='end'){ this.wait-=dt; if(this.wait<=0) this.done=true; }
  }
  stones(cx,cy,count,rx,ry,sb){
    const pal=['#7d8a99','#a68f6b','#6f8f7b','#9b7d8c','#8a8f6a'];
    for(let k=0;k<count;k++){
      const ang=k*2.39996+sb, rad=5.2*Math.sqrt(k);
      let x=Math.cos(ang)*rad*(rx/Math.min(rx,ry)), y=Math.sin(ang)*rad*(ry/Math.min(rx,ry));
      const e=(x/(rx-8))**2+(y/(ry-8))**2; if(e>1){ const f=1/Math.sqrt(e); x*=f; y*=f; }
      ctx.fillStyle=pal[(k*7+Math.floor(sb))%pal.length]; ctx.beginPath(); ctx.ellipse(cx+x, cy+y, 5.4, 4.8, ang, 0, 7); ctx.fill();
      ctx.strokeStyle='rgba(30,30,40,0.6)'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(cx+x-1.6, cy+y-1.6, 1.4, 0, 7); ctx.fill();
    }
  }
  draw(){
    const a = this.anim ? this.anim.disp : this.a, sd=this.seed;
    htext(this.note, 500, 222, {size:24, c:RED, align:'center', seed:sd+1});
    const bp=roundRectPts(150,256,700,248,46);
    inkPath(bp, {closed:true, w:3, seed:sd+2, fill:'rgba(140,95,45,0.07)', smooth:false});
    for(let i=0;i<14;i++){
      const [x,y]=this.pos(i), store=(i===6||i===13), rx=store?34:31, ry=store?96:30;
      inkEllipse(x,y,rx,ry,{w:2.2, seed:sd+10+i, fill:'rgba(120,80,40,0.08)'});
      this.stones(x,y,a[i],rx,ry,i*1.7+sd%7);
      if(!store) htext(String(a[i]), x, i<=5 ? y+52 : y-38, {size:20, c:GRAPHITE, align:'center', seed:sd+40+i});
    }
    if(this.phase==='player' && this.hover>=0 && this.a[this.hover]>0){ const [x,y]=this.pos(this.hover); inkEllipse(x,y,40,38,{c:'#2b3a8c',w:2,seed:sd+80,a:0.7}); }
    if(this.phase!=='anim' || (this.anim && this.anim.who===1)) for(const m of this.lastAI){ const [x,y]=this.pos(m); inkEllipse(x,y,41,39,{c:RED,w:2,seed:sd+90+m,a:0.8}); }
    if(this.anim && this.anim.i>0){ const [x,y]=this.pos(this.anim.steps[this.anim.i-1]); inkEllipse(x,y,36,34,{c:this.anim.who===1?'#2b3a8c':'#4f4f58',w:2.4,seed:sd+120,a:0.6}); }
    htext(`their store ${a[13]}`, 195, 536, {size:22, c:'#4f4f58', align:'center', seed:sd+130});
    htext(`your store ${a[6]}`, 805, 536, {size:22, c:INK, align:'center', seed:sd+131});
    htext('their pits', 500, 274, {size:17, c:GRAPHITE, align:'center', seed:sd+132, a:0.7});
    htext('your pits', 500, 528, {size:17, c:GRAPHITE, align:'center', seed:sd+133, a:0.7});
    if(this.flash) htext(this.flash.text, 500, 196, {size:28, wt:700, c:this.flash.who===1?'#2b6b2b':RED, align:'center', seed:sd+140});
  }
  drawMini(cx,cy,w,col){
    const sd=this.seed+500, pw=w/8;
    inkRect(cx-w/2, cy-30, w, 60, {c:col, w:1.6, seed:sd, os:2});
    for(let i=0;i<6;i++){
      const x=cx-w/2+pw*(i+1.5);
      inkEllipse(x, cy+12, pw*0.36, 9, {c:col, w:1.2, seed:sd+i}); htext(String(this.a[i]), x, cy+17, {size:14, c:col, align:'center', seed:sd+20+i});
      inkEllipse(x, cy-12, pw*0.36, 9, {c:col, w:1.2, seed:sd+10+i}); htext(String(this.a[12-i]), x, cy-7, {size:14, c:col, align:'center', seed:sd+30+i});
    }
  }
}
