'use strict';
/* ---------- input ---------- */
function toLogical(e){ const r=cv.getBoundingClientRect(); return [(e.clientX-r.left-OX)/SC, (e.clientY-r.top-OY)/SC]; }
cv.addEventListener('pointerdown', e=>{
  const [x,y]=toLogical(e); mouse.x=x; mouse.y=y; mouse.down=true; try{ cv.setPointerCapture(e.pointerId); }catch(_){}
  if(!G || MODE==='title'){ if(titleBtn && btnHit(titleBtn,x,y)) newRun(); return; }
  if(MODE==='gameover'){ if(againBtn && btnHit(againBtn,x,y)) newRun(); return; }
  if(MODE==='pick'){ for(const n of G.offers){ if(n.enter>=1 && noteHit(n,x,y)){ choose(n); return; } } return; }
  if(MODE==='play'){ G.cur.g.onDown(x,y); return; }
  if(MODE==='rest'){
    const r=G.rest, px=G.book+30, py=128;
    if(y>py-28 && y<py+4){ if(x>px+370&&x<px+460){ r.tab='draw'; return; } if(x>px+470&&x<px+560){ r.tab='doodles'; return; } }
    if(x>px+456 && x<px+566 && y>py+412 && y<py+458){ r.end=true; return; }
    if(x>px && x<px+580 && y>py && y<py+470){
      if(r.tab==='draw') r.cur=[[x-px,y-py]];
      else if(r.flip<=0){ r.flip=0.001; const step=()=>{ r.flip+=0.06; if(r.flip>=0.5 && !r.swapped){ r.swapped=true; r.doodle=(r.doodle+1)%DOODLES.length; } if(r.flip<1) requestAnimationFrame(step); else { r.flip=0; r.swapped=false; } }; requestAnimationFrame(step); }
    }
  }
});
cv.addEventListener('pointermove', e=>{
  const [x,y]=toLogical(e); mouse.x=x; mouse.y=y;
  let cur='default';
  if(!G || MODE==='title'){ if(titleBtn && btnHit(titleBtn,x,y)) cur='pointer'; }
  else if(MODE==='gameover'){ if(againBtn && btnHit(againBtn,x,y)) cur='pointer'; }
  else if(MODE==='pick'){ if(G.offers.some(n=>noteHit(n,x,y))) cur='pointer'; }
  else if(MODE==='play'){ const g=G.cur.g; g.onMove(x,y); cur=g.cursor(); }
  else if(MODE==='rest'){ const r=G.rest, px=G.book+30, py=128;
    if(r.cur && r.tab==='draw'){ r.cur.push([clamp(x-px,0,580), clamp(y-py,0,470)]); }
    cur = r.tab==='draw' ? 'crosshair' : 'pointer'; }
  cv.style.cursor=cur;
});
function up(){ mouse.down=false; if(G && MODE==='play') G.cur.g.onUp(); if(G && G.rest && G.rest.cur){ G.rest.strokes.push(G.rest.cur); G.rest.cur=null; } }
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

/* ---------- loop ---------- */
function resize(){
  DPR=Math.min(2, window.devicePixelRatio||1);
  cv.width=Math.max(1,Math.floor(innerWidth*DPR)); cv.height=Math.max(1,Math.floor(innerHeight*DPR));
  cv.style.width=innerWidth+'px'; cv.style.height=innerHeight+'px';
  SC=Math.min(innerWidth/W, innerHeight/H); OX=(innerWidth-W*SC)/2; OY=(innerHeight-H*SC)/2;
  buildDesk();
}
window.addEventListener('resize', resize);
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now; T+=dt; BOIL=Math.floor(T*CFG.boilFps)%3;
  try {
    update(dt);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(deskCv,0,0,cv.width,cv.height);
    ctx.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);
    if(G && G.shake>0){ const k=G.shake*14; ctx.translate(rr(-k,k), rr(-k,k)); }
    ctx.drawImage(paperCv,0,0,W,H);
    render();
  } catch(err){ console.error(err); }
  requestAnimationFrame(frame);
}
function boot(){ resize(); buildPaper(); requestAnimationFrame(frame); }
const fontsReady = document.fonts ? Promise.race([Promise.all([document.fonts.load('600 24px "Caveat"'), document.fonts.load('700 24px "Caveat"'), document.fonts.load('24px "Gochi Hand"')]), new Promise(r=>setTimeout(r,2500))]) : Promise.resolve();
fontsReady.then(boot, boot);
