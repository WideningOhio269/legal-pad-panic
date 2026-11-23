'use strict';
/* ---------- desk + paper (pre-rendered) ---------- */
function buildDesk(){
  deskCv = document.createElement('canvas');
  deskCv.width = Math.max(1, innerWidth*DPR); deskCv.height = Math.max(1, innerHeight*DPR);
  const g = deskCv.getContext('2d');
  g.fillStyle = '#4a3423'; g.fillRect(0,0,deskCv.width,deskCv.height);
  const r = mulberry32(99);
  for(let i=0;i<140;i++){
    const y = r()*deskCv.height; g.strokeStyle = r()<0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,220,170,0.04)';
    g.lineWidth = 1 + r()*3*DPR; g.beginPath(); g.moveTo(0,y);
    for(let x=0;x<=deskCv.width;x+=40*DPR) g.lineTo(x, y + Math.sin(x*0.004 + i)*6*DPR + Math.sin(x*0.013+i*2)*2*DPR);
    g.stroke();
  }
  const gr = g.createRadialGradient(deskCv.width/2, deskCv.height/2, 100, deskCv.width/2, deskCv.height/2, Math.max(deskCv.width,deskCv.height)*0.7);
  gr.addColorStop(0,'rgba(255,230,180,0.06)'); gr.addColorStop(1,'rgba(0,0,0,0.35)');
  g.fillStyle = gr; g.fillRect(0,0,deskCv.width,deskCv.height);
}

function buildPaper(){
  const S = 2;
  paperCv = document.createElement('canvas'); paperCv.width = W*S; paperCv.height = H*S;
  const g = paperCv.getContext('2d'); g.scale(S,S);
  const saved = ctx; ctx = g; STATIC = true;
  const r = mulberry32(newSeed());

  const pad = [[32,24],[968,21],[971,684],[29,688]];
  const padPath = () => { g.beginPath(); g.moveTo(...pad[0]);
    for(let i=0;i<4;i++){ const a=pad[i], b=pad[(i+1)%4]; const mx=(a[0]+b[0])/2+(r()-0.5)*4, my=(a[1]+b[1])/2+(r()-0.5)*4; g.quadraticCurveTo(mx,my,b[0],b[1]); }
    g.closePath(); };
  // shadow
  g.save(); g.shadowColor='rgba(0,0,0,0.45)'; g.shadowBlur=26; g.shadowOffsetX=9; g.shadowOffsetY=12;
  g.fillStyle='#f6e991'; padPath(); g.fill(); g.restore();
  // lighter top, darker edges
  g.save(); padPath(); g.clip();
  let gr = g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'#fbf1a6'); gr.addColorStop(1,'#f2e388');
  g.fillStyle=gr; g.fillRect(0,0,W,H);
  gr = g.createRadialGradient(W/2,H/2,200,W/2,H/2,620); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(90,60,0,0.10)');
  g.fillStyle=gr; g.fillRect(0,0,W,H);
  // grain
  const gc = document.createElement('canvas'); gc.width=160; gc.height=160;
  const gg = gc.getContext('2d'); const id = gg.createImageData(160,160);
  for(let i=0;i<id.data.length;i+=4){ const v = r()<0.5 ? 0 : 255; id.data[i]=v; id.data[i+1]=v; id.data[i+2]=v*0.9; id.data[i+3]=r()*22; }
  gg.putImageData(id,0,0);
  g.fillStyle = g.createPattern(gc,'repeat'); g.fillRect(0,0,W,H);
  // fibers
  for(let i=0;i<500;i++){ g.strokeStyle = r()<0.5?'rgba(120,90,20,0.06)':'rgba(255,255,255,0.12)'; g.lineWidth=0.6; const x=r()*W, y=r()*H, a=r()*6.28, l=2+r()*6; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+Math.cos(a+1)*l*0.5, y+Math.sin(a+1)*l*0.5, x+Math.cos(a)*l, y+Math.sin(a)*l); g.stroke(); }
  // rule lines, fading in and out, not perfectly parallel
  for(let y=134, k=0; y<680; y+=28, k++){
    const slope=(r()-0.5)*3; let x=30;
    while(x<970){
      const seg = 60+r()*140; const x2=Math.min(970,x+seg);
      g.strokeStyle = `rgba(105,148,206,${0.32+r()*0.28})`; g.lineWidth = 0.9+r()*0.4;
      g.beginPath(); g.moveTo(x, y + slope*(x-30)/940 + (r()-0.5)*0.6); g.lineTo(x2, y + slope*(x2-30)/940 + (r()-0.5)*0.6); g.stroke();
      x = x2;
    }
  }
  // margin
  inkPath([[121,60],[120,300],[122,520],[121,688]], {c:'#d0504a', w:1.5, seed:41, j:0.5, taper:false, a:0.8, smooth:true});
  inkPath([[126,60],[125,300],[126,520],[126,688]], {c:'#d0504a', w:0.8, seed:42, j:0.5, taper:false, a:0.7, smooth:true});
  // ghost writing from an earlier page
  g.strokeStyle='rgba(60,50,20,0.06)'; g.lineWidth=1.2;
  for(let i=0;i<5;i++){
    const y0 = 134 + 28*ri(4,18) - 6; let x0 = 150 + r()*500; const len = 120+r()*260;
    g.beginPath(); g.moveTo(x0,y0);
    for(let x=0;x<len;x+=2){ const yy = y0 + Math.sin(x*0.35)*4*Math.sin(x*0.05+i) - Math.abs(Math.sin(x*0.11))*4; g.lineTo(x0+x+Math.sin(x*0.35)*2, yy); }
    g.stroke();
  }
  // smudges
  for(let i=0;i<4;i++){
    const x=150+r()*700, y=150+r()*480, rx=30+r()*60;
    const sg=g.createRadialGradient(x,y,2,x,y,rx); sg.addColorStop(0,'rgba(70,70,70,0.08)'); sg.addColorStop(1,'rgba(70,70,70,0)');
    g.save(); g.translate(x,y); g.scale(1, 0.35+r()*0.4); g.rotate(r()*3); g.translate(-x,-y); g.fillStyle=sg; g.beginPath(); g.arc(x,y,rx,0,7); g.fill(); g.restore();
  }
  // coffee ring
  { const spots=[[880,300],[190,600],[840,520],[230,180]]; const [x,y]=pick(spots); const rad=42+r()*10;
    g.save(); g.strokeStyle='rgba(130,80,30,0.13)'; g.lineWidth=7; g.beginPath();
    const a0=r()*6.28; for(let i=0;i<=60;i++){ const a=a0+i/60*(Math.PI*2-0.5); const m=1+Math.sin(a*3)*0.02; g.lineTo(x+Math.cos(a)*rad*m, y+Math.sin(a)*rad*0.92*m); } g.stroke();
    g.strokeStyle='rgba(100,55,15,0.18)'; g.lineWidth=1.3; g.beginPath();
    for(let i=0;i<=60;i++){ const a=a0+0.2+i/60*(Math.PI*2-0.9); g.lineTo(x+Math.cos(a)*(rad+3), y+Math.sin(a)*(rad+3)*0.92); } g.stroke();
    g.fillStyle='rgba(130,80,30,0.12)'; g.beginPath(); g.ellipse(x+rad*1.3, y-rad*0.6, 5, 4, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x+rad*1.45, y-rad*0.5, 2.5, 2, 0, 0, 7); g.fill(); g.restore(); }
  g.restore();

  // binding
  g.save();
  g.beginPath(); g.moveTo(28,16); g.lineTo(972,13); g.lineTo(972,58); g.lineTo(28,61); g.closePath();
  g.shadowColor='rgba(0,0,0,0.35)'; g.shadowBlur=8; g.shadowOffsetY=3; g.fillStyle='#6b2a1c'; g.fill(); g.restore();
  g.save(); g.beginPath(); g.moveTo(28,16); g.lineTo(972,13); g.lineTo(972,58); g.lineTo(28,61); g.closePath(); g.clip();
  for(let i=0;i<900;i++){ g.fillStyle = r()<0.5?'rgba(0,0,0,0.12)':'rgba(255,200,170,0.06)'; g.fillRect(28+r()*944, 13+r()*48, 1+r()*2, 1); }
  gr = g.createLinearGradient(0,13,0,61); gr.addColorStop(0,'rgba(255,220,200,0.12)'); gr.addColorStop(0.75,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,0.35)');
  g.fillStyle=gr; g.fillRect(28,13,944,48); g.restore();

  // torn page stubs (back to front)
  const layers = [{c:'#efe08a',d:15},{c:'#f6ea9a',d:11},{c:'#fbf2b2',d:7}];
  for(const L of layers){
    const pts=[[30,58]]; let x=30;
    while(x<970){ x+=4+r()*11; pts.push([Math.min(970,x), 58 + 2 + r()*L.d]); }
    pts.push([970,57]);
    g.save(); g.shadowColor='rgba(60,40,0,0.25)'; g.shadowBlur=3; g.shadowOffsetY=1.5;
    g.fillStyle=L.c; g.beginPath(); g.moveTo(30,55); for(const p of pts) g.lineTo(p[0],p[1]); g.lineTo(970,55); g.closePath(); g.fill(); g.restore();
    g.strokeStyle='rgba(255,255,255,0.5)'; g.lineWidth=0.6;
    for(let i=1;i<pts.length-1;i+=2){ if(r()<0.6){ const p=pts[i]; g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(p[0]+(r()-0.5)*4, p[1]+1+r()*3); g.stroke(); } }
  }
  // dog-eared pad corner
  { const C=[971,684], A=[971,640+r()*10], B=[922+r()*10,686];
    const mx=(A[0]+B[0])/2, my=(A[1]+B[1])/2; const tip=[mx+(mx-C[0])*0.85, my+(my-C[1])*0.85];
    g.save(); g.globalCompositeOperation='destination-out'; g.beginPath(); g.moveTo(...A); g.lineTo(...C); g.lineTo(...B); g.closePath(); g.fill(); g.restore();
    g.save(); g.shadowColor='rgba(0,0,0,0.3)'; g.shadowBlur=8; g.shadowOffsetX=-3; g.shadowOffsetY=-3;
    const fg=g.createLinearGradient(mx,my,tip[0],tip[1]); fg.addColorStop(0,'#d9cb76'); fg.addColorStop(1,'#fbf3c0');
    g.fillStyle=fg; g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(tip[0]+6, tip[1]-14, tip[0], tip[1]); g.quadraticCurveTo(tip[0]-12, tip[1]+6, B[0], B[1]); g.closePath(); g.fill(); g.restore(); }

  STATIC = false; ctx = saved;
}

/* ---------- sticky notes ---------- */
function makeNoteCanvas(color, w, h, seed){
  const pad = 36, S = 2;
  const c = document.createElement('canvas'); c.width=(w+pad*2)*S; c.height=(h+pad*2)*S;
  const g = c.getContext('2d'); g.scale(S,S); g.translate(pad,pad);
  const r = mulberry32(seed);
  const P = [[r()*3-1.5, r()*3-1.5],[w+r()*3-1.5, r()*3-1.5],[w+r()*3-1.5, h+r()*3-1.5],[r()*3-1.5, h+r()*3-1.5]];
  const roll = r(); let curl='flat', ci=-1, cs=0;
  const sz = Math.min(w,h);
  if(roll < 0.3) curl='flat';
  else if(roll < 0.6){ curl='corner'; ci = r()<0.8 ? (r()<0.5?2:3) : 1; cs = sz*(0.09+r()*0.09); }
  else if(roll < 0.8) curl='lift';
  else if(roll < 0.92){ curl='dogear'; ci = r()<0.5?1:0; cs = sz*(0.05+r()*0.035); }
  else curl='crease';

  const pts=[];
  for(let i=0;i<4;i++){
    const a=P[i], b=P[(i+1)%4];
    let s=a, e=b;
    if(ci===i) s = lerpPt(a,b, cs/dist(a,b));
    if(ci===(i+1)%4) e = lerpPt(b,a, cs/dist(a,b));
    const bw=(r()-0.5)*3.4, n=7;
    const dx=e[0]-s[0], dy=e[1]-s[1], L=Math.hypot(dx,dy), nx=-dy/L, ny=dx/L;
    for(let k=0;k<n;k++){ const t=k/n; const off=Math.sin(t*Math.PI)*bw + (k ? (r()-0.5)*0.7 : 0); pts.push([lerp(s[0],e[0],t)+nx*off, lerp(s[1],e[1],t)+ny*off]); }
    if(ci===(i+1)%4) pts.push(e);
  }
  const path = () => { g.beginPath(); g.moveTo(pts[0][0],pts[0][1]); for(const p of pts) g.lineTo(p[0],p[1]); g.closePath(); };

  if(curl==='lift'){
    g.save(); g.shadowColor='rgba(30,20,0,0.4)'; g.shadowBlur=16; g.shadowOffsetX=6; g.shadowOffsetY=12;
    g.fillStyle='rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(w/2+3, h-10, w*0.47, 10, 0, 0, Math.PI*2); g.fill(); g.restore();
  }
  g.save(); g.shadowColor='rgba(40,25,0,0.30)'; g.shadowBlur=9; g.shadowOffsetX=4; g.shadowOffsetY=6;
  g.fillStyle=color; path(); g.fill(); g.restore();

  g.save(); path(); g.clip();
  let gr = g.createLinearGradient(0,0,w*0.35,h);
  gr.addColorStop(0,'rgba(255,255,255,0.20)'); gr.addColorStop(0.55,'rgba(255,255,255,0)'); gr.addColorStop(1,'rgba(0,0,0,0.08)');
  g.fillStyle=gr; g.fillRect(-6,-6,w+12,h+12);
  const bh = h*(0.12+r()*0.06), tilt=(r()-0.5)*5;
  g.fillStyle=`rgba(0,0,0,${0.035+r()*0.035})`; g.beginPath(); g.moveTo(-6,-6); g.lineTo(w+6,-6); g.lineTo(w+6,bh+tilt); g.lineTo(-6,bh-tilt); g.fill();
  g.strokeStyle='rgba(0,0,0,0.05)'; g.lineWidth=1; g.beginPath(); g.moveTo(-6,bh-tilt); g.lineTo(w+6,bh+tilt); g.stroke();
  if(curl==='lift'){ gr=g.createLinearGradient(0,h-28,0,h); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(0.7,'rgba(255,255,255,0.25)'); gr.addColorStop(1,'rgba(0,0,0,0.14)'); g.fillStyle=gr; g.fillRect(-6,h-28,w+12,34); }
  for(let i=0;i<w*h/140;i++){ g.fillStyle = r()<0.5?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.12)'; g.fillRect(r()*w, r()*h, 0.8+r()*1.4, 0.8+r()*1.4); }
  if(curl==='crease'){
    const y0=h*(0.3+r()*0.45), y1=y0+(r()-0.5)*h*0.5;
    g.strokeStyle='rgba(255,255,255,0.45)'; g.lineWidth=1.3; g.beginPath(); g.moveTo(-6,y0); g.lineTo(w+6,y1); g.stroke();
    g.strokeStyle='rgba(0,0,0,0.09)'; g.lineWidth=1; g.beginPath(); g.moveTo(-6,y0+1.6); g.lineTo(w+6,y1+1.6); g.stroke();
  }
  g.restore();

  if(ci>=0){
    const C=P[ci], prev=P[(ci+3)%4], next=P[(ci+1)%4];
    const A=lerpPt(C,prev,cs/dist(C,prev)), B=lerpPt(C,next,cs/dist(C,next));
    const mx=(A[0]+B[0])/2, my=(A[1]+B[1])/2;
    const k = curl==='corner' ? 0.7+r()*0.25 : 0.95;
    const tip=[mx+(mx-C[0])*k, my+(my-C[1])*k];
    const bulge = curl==='corner' ? 0.28 : 0.08;
    const c1=[lerp(A[0],tip[0],0.5)+(C[0]-mx)*bulge, lerp(A[1],tip[1],0.5)+(C[1]-my)*bulge];
    const c2=[lerp(B[0],tip[0],0.5)+(C[0]-mx)*bulge, lerp(B[1],tip[1],0.5)+(C[1]-my)*bulge];
    g.save(); g.shadowColor='rgba(30,20,0,0.32)'; g.shadowBlur=7; g.shadowOffsetX=(mx-C[0])*0.12; g.shadowOffsetY=(my-C[1])*0.12+2;
    const fg=g.createLinearGradient(mx,my,tip[0],tip[1]); fg.addColorStop(0,shade(color,-0.12)); fg.addColorStop(0.5,shade(color,0.12)); fg.addColorStop(1,shade(color,0.35));
    g.fillStyle=fg; g.beginPath(); g.moveTo(A[0],A[1]); g.quadraticCurveTo(c1[0],c1[1],tip[0],tip[1]); g.quadraticCurveTo(c2[0],c2[1],B[0],B[1]); g.closePath(); g.fill(); g.restore();
    g.strokeStyle='rgba(0,0,0,0.12)'; g.lineWidth=0.8; g.beginPath(); g.moveTo(A[0],A[1]); g.lineTo(B[0],B[1]); g.stroke();
  }
  return { cv:c, pad };
}

const GAMES = {
  maze:    { name:'maze',        kind:'short',   color:'#F4A3C0', ink:'#5a1a33', prompt:'ESCAPE!',  hint:'hold the mouse down and steer to the star, 2 wall bumps and you are out' },
  plinko:  { name:'plinko',      kind:'short',   color:'#F7AD72', ink:'#5a2a0c', prompt:'DROP IT!', hint:'click to drop the chip into a star slot' },
  ttt:     { name:'tic tac toe', kind:'persist', color:'#C3E28A', ink:'#2c4510', prompt:'X MARKS!', hint:'your move, you are X' },
  mancala: { name:'mancala',     kind:'persist', color:'#B9A8F0', ink:'#2e2466', prompt:'SOW!',     hint:'click one of your pits on the bottom row' }
};
const SHORTS = ['maze','plinko'], PERSISTS = ['ttt','mancala'];

function makeNote(id){
  const gm = GAMES[id], seed = newSeed();
  const nc = makeNoteCanvas(gm.color, 200, 200, seed);
  return { id, gm, kind:gm.kind, seed, cv:nc.cv, pad:nc.pad, w:200, h:200, x:0, y:0, rot:0, hover:0, gold:false, enter:0 };
}
function drawNoteImg(n, x, y, rot, sc=1, alpha=1){
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.scale(sc,sc); ctx.globalAlpha*=alpha;
  ctx.drawImage(n.cv, -n.w/2-n.pad, -n.h/2-n.pad, n.w+n.pad*2, n.h+n.pad*2);
  ctx.restore();
}
function noteHit(n, px, py){
  const dx=px-n.x, dy=py-n.y, c=Math.cos(-n.rot), s=Math.sin(-n.rot);
  const lx=dx*c-dy*s, ly=dx*s+dy*c; return Math.abs(lx)<n.w/2 && Math.abs(ly)<n.h/2;
}
function drawNoteContent(n){
  const gm=n.gm, s=n.seed;
  htext(gm.name, 0, -56, {size: gm.name.length>8?32:38, wt:700, c:gm.ink, align:'center', seed:s});
  if(n.id==='maze'){
    const L=[[-40,-20,40,-20],[-40,-20,-40,40],[-40,40,40,40],[40,-20,40,20],[-20,-20,-20,20],[0,0,0,40],[20,-20,20,20],[-20,20,0,20]];
    L.forEach((l,i)=>inkLine(l[0],l[1],l[2],l[3],{c:gm.ink,w:2,seed:s+i,os:2}));
    inkEllipse(-30,30,4,4,{c:gm.ink,fill:gm.ink,seed:s+20,w:1.5});
    drawStar(50,30,8,s+21);
  } else if(n.id==='plinko'){
    for(let r=0;r<4;r++) for(let k=0;k<=r+1;k++){ ctx.fillStyle=gm.ink; ctx.beginPath(); ctx.arc(-(r+1)*12+k*24, -14+r*14, 2.6, 0, 7); ctx.fill(); }
    inkEllipse(0,-30,7,7,{c:gm.ink,fill:'#f2c14e',seed:s+3,w:1.6});
    for(let k=0;k<6;k++) inkLine(-60+k*24,40,-60+k*24,52,{c:gm.ink,w:1.5,seed:s+30+k,os:1});
    drawStar(12,47,6,s+40);
  } else if(n.id==='ttt'){ G.persist.ttt.drawMini(0,0,70,gm.ink);
  } else if(n.id==='mancala'){ G.persist.mancala.drawMini(0,10,150,gm.ink); }
  let foot = n.id==='plinko' ? `+${CFG.plinkoPoints[Math.min(G.lap-1, CFG.plinkoPoints.length-1)]}` : '+100';
  if(n.kind==='persist') foot = G.persist[n.id].noteInfo();
  htext(foot, 0, 82, {size:22, c:gm.ink, align:'center', seed:s+5});
  if(n.kind==='persist'){
    const sk=G.persist[n.id].skips||0;
    if(sk>=CFG.skipGrace) htext('skip me and they move!', 0, 64, {size:18, wt:700, c:RED, align:'center', seed:s+6});
    else if(sk>0) htext(`skipped ${sk} of ${CFG.skipGrace} · win +${CFG.win[n.id]}`, 0, 64, {size:17, c:shade(gm.ink,0.2), align:'center', seed:s+6});
    else htext(`win +${CFG.win[n.id]}`, 0, 64, {size:18, c:shade(gm.ink,0.2), align:'center', seed:s+6, a:0.85});
  }
  if(n.gold){ drawStar(70,-68,15,s+9); htext('x2', 70, -40, {size:20, wt:700, c:'#7a5206', align:'center', seed:s+10}); }
}
