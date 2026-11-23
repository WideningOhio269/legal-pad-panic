'use strict';
/* ---------- render ---------- */
function drawHUD(){
  for(let i=0;i<CFG.hearts;i++){
    const cx=158+i*38, cy=100, p=heartPts(cx,cy,30);
    if(i<G.hearts){ hatchFill(p, '#c23b33', 3.2, -0.8, 300+i*10, 2.2); }
    inkPath(p, {closed:true, w:2, seed:200+i, c:INK});
    if(i>=G.hearts){ inkLine(cx-8,cy-6,cx+8,cy+8,{w:1.4,seed:220+i,c:GRAPHITE,a:0.6}); }
  }
  // ink pen
  const x0=318, y0=88, len=170, hh=22, frac=clamp(G.ink/CFG.inkMax,0,1);
  const body=[[x0,y0],[x0+len,y0],[x0+len+22,y0+hh/2],[x0+len,y0+hh],[x0,y0+hh]];
  ctx.save(); ctx.beginPath(); ctx.moveTo(...body[0]); for(const p of body) ctx.lineTo(...p); ctx.closePath(); ctx.fillStyle='rgba(255,253,240,0.85)'; ctx.fill(); ctx.clip();
  const low = G.ink<=30 && Math.floor(T*3)%2===0;
  ctx.fillStyle = low ? '#b33' : '#2b3a8c'; const ix=x0+3, iw=(len-6)*frac;
  ctx.beginPath(); ctx.moveTo(ix,y0+3); ctx.lineTo(ix+iw, y0+3+Math.sin(T*3)*1.2); ctx.lineTo(ix+iw, y0+hh-3); ctx.lineTo(ix,y0+hh-3); ctx.fill();
  ctx.restore();
  inkPath(body, {closed:true, w:2.2, seed:240});
  inkLine(x0+len,y0,x0+len,y0+hh,{w:1.6,seed:241,os:1});
  inkLine(x0+30,y0-5,x0+30,y0+hh+2,{w:2.6,seed:242,os:1});
  htext('ink', x0, y0+hh+22, {size:20, c:'#2b3a8c', seed:243});
  if(G.ink<=40) htext('your pen is drying out... win a long game for a fresh cartridge', x0+36, y0+hh+22, {size:17, c:RED, seed:244, a:0.85});
  // score
  const {lapM,strM}=mults();
  htext(G.score.toLocaleString(), 952, 110, {size:46, wt:700, c:INK, align:'right', seed:250});
  htext(`x${(lapM*strM).toFixed(2)} · streak ${G.streak} · lap ${G.lap}`, 952, 138, {size:20, c:RED, align:'right', seed:251});
  htext(`pick ${Math.max(1,G.pick)} of ${CFG.lapPicks}`, 620, 110, {size:22, c:GRAPHITE, align:'center', seed:252});
}
function drawThumbs(){
  const list=G.drawings.slice(-7);
  list.forEach((st,k)=>{
    const x=40, y=168+k*64, w=70, h=52, rot=((k*37)%7-3)*0.02;
    ctx.save(); ctx.translate(x+w/2,y+h/2); ctx.rotate(rot);
    ctx.shadowColor='rgba(0,0,0,0.25)'; ctx.shadowBlur=4; ctx.shadowOffsetX=1.5; ctx.shadowOffsetY=2;
    ctx.fillStyle='#fffdf3'; ctx.fillRect(-w/2,-h/2,w,h); ctx.shadowColor='transparent';
    ctx.scale(w/580, h/468); ctx.translate(-290,-234);
    ctx.strokeStyle='#333'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.lineJoin='round';
    for(const s of st){ if(s.length<2) continue; ctx.beginPath(); ctx.moveTo(s[0][0],s[0][1]); for(const p of s) ctx.lineTo(p[0],p[1]); ctx.stroke(); }
    ctx.restore();
  });
}
function drawStack(){
  for(const s of G.stack) drawNoteImg(s.n, 868+s.dx, 596+s.dy, s.rot, 0.42);
  for(const s of G.stackOut) drawNoteImg(s.n, s.x??(868+s.dx), s.y??(596+s.dy), s.rot, 0.42);
  if(G.stack.length) htext('played this lap', 868, 668, {size:17, c:GRAPHITE, align:'center', seed:260, a:0.8});
}
function drawBook(bx){
  const top=118, bot=612;
  ctx.save(); ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=18; ctx.shadowOffsetX=8; ctx.shadowOffsetY=10;
  ctx.fillStyle='#54447f'; ctx.beginPath(); ctx.moveTo(bx,top+4); ctx.lineTo(bx+622,top); ctx.lineTo(bx+624,bot); ctx.lineTo(bx+2,bot+3); ctx.closePath(); ctx.fill(); ctx.restore();
  for(let k=0;k<5;k++){ ctx.strokeStyle=`rgba(250,246,230,${0.75-k*0.1})`; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(bx+604+k*3, top+8+k); ctx.lineTo(bx+605+k*3, bot-6-k); ctx.stroke(); }
  if(bx < -400) return;
  const px=bx+30, py=128;
  ctx.fillStyle='#fffdf5'; ctx.fillRect(px,py,580,470);
  ctx.fillStyle='rgba(0,0,0,0.03)'; for(let i=0;i<120;i++){ ctx.fillRect(px+((i*97)%580), py+((i*53)%470), 1.5, 1.5); }
  for(let y=py+22;y<py+460;y+=34){ ctx.strokeStyle='#9aa0a6'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(px+2, y, 9, Math.PI*0.6, Math.PI*1.95); ctx.stroke(); }
  const r=G.rest; if(!r) return;
  const tabs=[['draw',px+370],['doodles',px+470]];
  for(const [name,tx] of tabs){ const act=r.tab===name;
    ctx.fillStyle= act ? '#fcd25e' : '#e8d9a0'; ctx.fillRect(tx, py-26, 90, 30);
    htext(name, tx+45, py-6, {size:21, wt:700, c:'#5a3d06', align:'center', seed:strSeed(name)}); }
  const left=Math.ceil(Math.max(0, CFG.restSeconds-(MT-0.4)));
  htext(`breather · ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`, px+20, py+34, {size:26, wt:700, c:'#54447f', seed:270});
  const hov = mouse.x>px+456 && mouse.x<px+566 && mouse.y>py+412 && mouse.y<py+458;
  ctx.save(); ctx.translate(px+511, py+435-(hov?3:0)); ctx.rotate(-0.04);
  ctx.shadowColor='rgba(0,0,0,0.25)'; ctx.shadowBlur=6; ctx.shadowOffsetX=2; ctx.shadowOffsetY=3;
  ctx.fillStyle='#C3E28A'; ctx.fillRect(-55,-23,110,46); ctx.shadowColor='transparent';
  htext('done', 0, 9, {size:28, wt:700, c:'#2c4510', align:'center', seed:272}); ctx.restore();
  htext(r.tab==='draw' ? 'doodle anything, it goes in the margin' : 'click to flip the page', px+20, py+60, {size:19, c:GRAPHITE, seed:271});
  ctx.save(); ctx.translate(px,py);
  if(r.tab==='draw'){
    ctx.strokeStyle='#333'; ctx.lineWidth=2.6; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.globalAlpha=0.9;
    for(const s of r.strokes.concat(r.cur?[r.cur]:[])){ if(s.length<2) continue; ctx.beginPath(); ctx.moveTo(s[0][0],s[0][1]); for(const p of s) ctx.lineTo(p[0],p[1]); ctx.stroke(); }
  } else {
    const fl=clamp(r.flip,0,1); const sx = fl>0 ? Math.abs(Math.cos(fl*Math.PI)) : 1;
    ctx.translate(290,260); ctx.scale(Math.max(0.05,sx),1);
    const d=DOODLES[r.doodle]; d.draw(r.seed+r.doodle*100);
    htext(d.label, 0, 190, {size:28, c:'#54447f', align:'center', seed:r.seed+5});
  }
  ctx.restore();
}
function drawStamp(text, col, sub, t){
  const s = lerp(1.8, 1, easeBack(t*3)), al = clamp(t*6,0,1);
  ctx.save(); ctx.translate(500, 360); ctx.rotate(-0.13); ctx.scale(s,s); ctx.globalAlpha=al*0.92;
  ctx.font='64px "Gochi Hand", cursive'; const w=ctx.measureText(text).width;
  inkRect(-w/2-22, -58, w+44, 80, {c:col, w:4, seed:strSeed(text), os:4, j:1.4});
  htext(text, 0, 4, {size:64, font:'Gochi Hand', wt:400, c:col, align:'center', seed:strSeed(text)+1});
  ctx.restore();
  if(sub) htext(sub, 500, 440, {size:24, c:col, align:'center', seed:strSeed(sub), a:al});
}
function drawTimer(){
  const t=G.timer, frac=clamp(t.el/t.dur,0,1), x0=170, x1=820, y=650, px=lerp(x0,x1,frac);
  inkPath([[x0,y],[x1,y]], {w:3, seed:280, p:frac, j:0.8, still:true});
  ctx.save(); ctx.setLineDash([3,7]); ctx.strokeStyle='rgba(30,40,70,0.35)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(px+20,y); ctx.lineTo(x1,y); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(px,y); ctx.rotate(-0.08);
  ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.moveTo(4,6); ctx.lineTo(-66,10); ctx.lineTo(-66,22); ctx.lineTo(10,14); ctx.fill();
  ctx.fillStyle='#f2c66b'; ctx.beginPath(); ctx.moveTo(-14,-7); ctx.lineTo(-60,-7); ctx.lineTo(-60,7); ctx.lineTo(-14,7); ctx.fill();
  ctx.fillStyle='#d9a77a'; ctx.beginPath(); ctx.moveTo(-14,-7); ctx.lineTo(0,0); ctx.lineTo(-14,7); ctx.fill();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.moveTo(-4,-2); ctx.lineTo(0,0); ctx.lineTo(-4,2); ctx.fill();
  ctx.fillStyle='#b9b9b9'; ctx.fillRect(-68,-7,8,14); ctx.fillStyle='#e8a3a3'; ctx.fillRect(-80,-7,12,14);
  ctx.restore();
  inkPath([[px-14,y-7],[px-60,y-7]].map(p=>[p[0],p[1]]), {w:1.2, seed:281, j:0.3, a:0.5});
  const left=Math.max(0,t.dur-t.el);
  htext(`${left.toFixed(1)}s`, x0-12, y+6, {size:22, c: left<2.5?RED:INK, align:'right', seed:282});
}
function drawPopups(){ for(const p of G.popups){ const a=1-clamp((p.t-0.9)/0.7,0,1); htext(p.text, p.x, p.y-p.t*34, {size:p.size, wt:700, c:p.c, align:'center', seed:p.seed, a}); } }

function renderTitle(){
  htext('Legal Pad', 500, 210, {size:96, font:'Gochi Hand', wt:400, c:INK, align:'center', seed:11, rot:-0.03});
  htext('Panic', 560, 300, {size:110, font:'Gochi Hand', wt:400, c:RED, align:'center', seed:12, rot:-0.05});
  inkPath([[380,318],[480,326],[600,320],[720,328]], {c:RED, w:3, seed:13, smooth:true});
  const lines=['pick one of two sticky notes every round',
    'short games are one quick shot, fail one and you lose a heart',
    'every short game you play dries your pen a little',
    'long games go one move at a time, win one for big points and fresh ink',
    'skip a long game too often and they move without you',
    'run out of ink and you lose a heart, lose all 4 and it is pencils down'];
  lines.forEach((l,k)=>htext(l, 170, 372+k*27, {size:22, c:GRAPHITE, seed:20+k}));
  if(HI>0) htext(`high score ${HI.toLocaleString()}`, 500, 540, {size:24, wt:700, c:'#2b3a8c', align:'center', seed:30});
  if(!titleBtn){ const n=makeNoteCanvas('#8FC9F5', 230, 96, newSeed()); titleBtn={x:500,y:610,w:230,h:96,rot:(R()-0.5)*0.08,cv:n.cv,pad:n.pad}; }
  const hov = btnHit(titleBtn, mouse.x, mouse.y);
  drawBtn(titleBtn, 'start', hov);
}
function btnHit(b,x,y){ return Math.abs(x-b.x)<b.w/2 && Math.abs(y-b.y)<b.h/2; }
function drawBtn(b, label, hov){
  ctx.save(); ctx.translate(b.x, b.y-(hov?5:0)); ctx.rotate(b.rot); const s=hov?1.04:1; ctx.scale(s,s);
  ctx.drawImage(b.cv, -b.w/2-b.pad, -b.h/2-b.pad, b.w+b.pad*2, b.h+b.pad*2);
  htext(label, 0, 14, {size:44, wt:700, c:'#0c3a63', align:'center', seed:strSeed(label)});
  ctx.restore();
}
function renderGameOver(){
  htext('pencils down', 500, 200, {size:84, font:'Gochi Hand', wt:400, c:RED, align:'center', seed:40, rot:-0.04});
  const rows=[`final score ${G.score.toLocaleString()}`, `best streak ${G.bestStreak}`, `laps reached ${G.lap}`,
    `long games won ${G.stats.won} · lost ${G.stats.lost} · drawn ${G.stats.drawn}`, `short games cleared ${G.stats.shortWon}`, `high score ${HI.toLocaleString()}`];
  rows.forEach((r,k)=>htext(r, 170, 280+k*36, {size: k===0?34:25, wt: k===0?700:600, c: k===0?INK:GRAPHITE, seed:50+k}));
  if(G.newBest){ ctx.save(); ctx.translate(250,520); ctx.rotate(-0.15); inkRect(-80,-36,160,52,{c:RED,w:3.5,seed:61,os:4}); htext('NEW BEST', 0, 2, {size:36, font:'Gochi Hand', wt:400, c:RED, align:'center', seed:62}); ctx.restore(); }
  // sketchbook of this run
  const bx=590, by=270, bw=330, bh=250;
  ctx.save(); ctx.shadowColor='rgba(0,0,0,0.35)'; ctx.shadowBlur=12; ctx.shadowOffsetX=5; ctx.shadowOffsetY=7; ctx.fillStyle='#54447f'; ctx.fillRect(bx-10,by-10,bw+20,bh+20); ctx.restore();
  ctx.fillStyle='#fffdf5'; ctx.fillRect(bx,by,bw,bh);
  if(G.drawings.length){
    const idx=Math.floor(G.goFlip/1.8)%G.drawings.length, st=G.drawings[idx];
    ctx.save(); ctx.translate(bx,by); ctx.scale(bw/580,bh/468); ctx.strokeStyle='#333'; ctx.lineWidth=3.2; ctx.lineCap='round'; ctx.lineJoin='round';
    for(const s of st){ if(s.length<2) continue; ctx.beginPath(); ctx.moveTo(s[0][0],s[0][1]); for(const p of s) ctx.lineTo(p[0],p[1]); ctx.stroke(); }
    ctx.restore();
    htext(`your doodles ${idx+1} of ${G.drawings.length}`, bx+bw/2, by+bh+40, {size:21, c:'#54447f', align:'center', seed:70});
  } else htext('no doodles this run', bx+bw/2, by+bh/2+8, {size:26, c:GRAPHITE, align:'center', seed:71});
  if(againBtn) drawBtn(againBtn, 'play again', btnHit(againBtn, mouse.x, mouse.y));
}

function render(){
  if(!G || MODE==='title'){ renderTitle(); return; }
  if(MODE==='gameover'){ drawThumbs(); drawBook(-592); renderGameOver(); return; }
  drawThumbs();
  drawStack();
  if(MODE==='pick'){
    htext('pick one!', 500, 222, {size:34, font:'Gochi Hand', wt:400, c:INK, align:'center', seed:290, rot:-0.03});
    for(const n of G.offers){ if(n.enter<=0) continue; const e=ease(n.enter), y=n.y-30*(1-e)-n.hover*7, s=(0.92+0.08*e)*(1+n.hover*0.03);
      ctx.save(); ctx.globalAlpha=e; drawNoteImg(n, n.x, y, n.rot, s); ctx.translate(n.x,y); ctx.rotate(n.rot); ctx.scale(s,s); drawNoteContent(n); ctx.restore(); }
  }
  if(G.discard){ const d=G.discard, t=d.t/0.5; ctx.save(); ctx.globalAlpha=1-t; drawNoteImg(d.n, d.n.x, d.n.y+t*60, d.n.rot+t*0.3, 1-t*0.1); ctx.restore(); }
  if(MODE==='fly'){ const f=G.fly, e=ease(f.t); const x=lerp(f.x0,f.x1,e), y=lerp(f.y0,f.y1,e)-Math.sin(e*Math.PI)*60, r=lerp(f.r0,f.r1,e), s=lerp(f.s0,0.42,e);
    drawNoteImg(f.n, x, y, r, s); ctx.save(); ctx.translate(x,y); ctx.rotate(r); ctx.scale(s,s); ctx.globalAlpha=1-e; drawNoteContent(f.n); ctx.restore(); }
  if(MODE==='prompt' || MODE==='play' || MODE==='result'){
    const g=G.cur.g, gm=G.cur.n.gm;
    ctx.save(); if(MODE==='prompt') ctx.globalAlpha=0.3; g.draw(); ctx.restore();
    if(MODE==='play'){ drawTimer(); htext(gm.hint, 500, 182, {size:21, c:GRAPHITE, align:'center', seed:strSeed(gm.hint), a:0.85}); if(G.cur.n.gold) { drawStar(160,182,12,77); htext('x2 points', 180, 189, {size:20, wt:700, c:'#7a5206', seed:78}); } }
    if(MODE==='prompt'){ const t=MT/0.8, s=lerp(1.4,1,easeBack(t*2.2));
      ctx.save(); ctx.translate(500,380); ctx.rotate(-0.06); ctx.scale(s,s);
      htext(gm.prompt, 0, 30, {size:110, font:'Gochi Hand', wt:400, c:shade(gm.color,-0.45), align:'center', seed:strSeed(gm.prompt)});
      ctx.restore(); }
    if(MODE==='result') drawStamp(G.result.stamp, G.result.col, G.result.sub, MT);
  }
  if(MODE==='lapend'){ const t=MT; ctx.save(); ctx.translate(500,360); ctx.rotate(-0.05); const s=lerp(1.5,1,easeBack(t*2));
    ctx.scale(s,s); htext(`lap ${G.lap} done`, 0, -10, {size:80, font:'Gochi Hand', wt:400, c:INK, align:'center', seed:300});
    htext('faster now...', 0, 60, {size:40, c:RED, align:'center', seed:301}); ctx.restore(); }
  drawBook(G.book);
  drawHUD();
  drawPopups();
}

