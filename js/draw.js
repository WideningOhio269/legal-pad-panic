'use strict';

/* ---------- hand drawn primitives ---------- */
function inkPath(pts, o={}){
  const w = o.w ?? 2.2, c = o.c ?? INK, seed = o.seed ?? 1, j = (o.j ?? 1)*CFG.jitter;
  const prog = o.p ?? 1, alpha = o.a ?? 0.94;
  let P = o.smooth ? spline(pts, 6, o.closed) : (o.closed ? pts.concat([pts[0]]) : pts);
  if(P.length < 2) return;
  const rb = mulberry32(seed*13 + (STATIC||o.still ? 0 : BOIL)*977 + 1);
  const rs = mulberry32(seed*7 + 3);
  const ph1=rs()*6.28, ph2=rs()*6.28, f1=0.018+rs()*0.02, f2=0.06+rs()*0.05, ph3=rs()*6.28;
  const dense=[]; let dd=0;
  for(let i=0;i<P.length-1;i++){
    const x1=P[i][0], y1=P[i][1], x2=P[i+1][0], y2=P[i+1][1];
    const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||0.001, nx=-dy/L, ny=dx/L;
    const steps = Math.max(1, Math.ceil(L/8));
    for(let s=(i===0?0:1); s<=steps; s++){
      const t=s/steps, d=dd+L*t;
      const off = (Math.sin(d*f1+ph1)*0.9 + Math.sin(d*f2+ph2)*0.35)*j + (rb()-0.5)*j*0.6;
      dense.push([x1+dx*t+nx*off, y1+dy*t+ny*off, d]);
    }
    dd += L;
  }
  const total = dd, lim = total*prog;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = c; ctx.lineCap='round'; ctx.lineJoin='round';
  if(o.fill){
    ctx.fillStyle = o.fill;
    ctx.beginPath(); ctx.moveTo(dense[0][0],dense[0][1]);
    for(const p of dense) ctx.lineTo(p[0],p[1]);
    ctx.closePath(); ctx.fill();
  }
  for(let i=0;i<dense.length-1;i++){
    const a=dense[i], b=dense[i+1];
    if(a[2] > lim) break;
    const d=a[2];
    let tap = 1;
    if(o.taper !== false && !o.closed) tap = Math.min(1, 0.4 + Math.min(d, total-d)/16);
    ctx.lineWidth = Math.max(0.4, w*tap*(0.82 + 0.32*Math.sin(d*0.045+ph3)));
    ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
  }
  ctx.restore();
}

function inkLine(x1,y1,x2,y2,o={}){
  const rs = mulberry32((o.seed??1)*3+11);
  const os = o.os ?? 3;
  const L = Math.hypot(x2-x1,y2-y1)||1, ux=(x2-x1)/L, uy=(y2-y1)/L;
  const e1 = os ? rs()*os : 0, e2 = os ? rs()*os : 0;
  inkPath([[x1-ux*e1, y1-uy*e1],[x2+ux*e2, y2+uy*e2]], o);
}

function inkRect(x,y,w,h,o={}){
  const s = o.seed ?? 1, rs = mulberry32(s*5+2);
  const c = [[x+rs()*3-1.5, y+rs()*3-1.5],[x+w+rs()*3-1.5, y+rs()*3-1.5],[x+w+rs()*3-1.5, y+h+rs()*3-1.5],[x+rs()*3-1.5, y+h+rs()*3-1.5]];
  if(o.fill){ ctx.save(); ctx.fillStyle=o.fill; ctx.beginPath(); ctx.moveTo(...c[0]); for(const p of c) ctx.lineTo(...p); ctx.closePath(); ctx.fill(); ctx.restore(); }
  for(let i=0;i<4;i++){ const a=c[i], b=c[(i+1)%4]; inkLine(a[0],a[1],b[0],b[1], Object.assign({}, o, {seed:s*4+i, fill:null})); }
}

function ellipsePts(cx,cy,rx,ry,seed,over=true){
  const rs = mulberry32(seed*9+4);
  const a0 = rs()*6.28, ov = over ? 0.25+rs()*0.35 : 0, ph = rs()*6.28;
  const n = Math.max(14, Math.round((rx+ry)/3));
  const pts=[];
  for(let i=0;i<=n;i++){
    const a = a0 + (Math.PI*2+ov)*i/n;
    const m = 1 + Math.sin(a*2+ph)*0.035 + (over ? (i/n)*0.04 : 0);
    pts.push([cx+Math.cos(a)*rx*m, cy+Math.sin(a)*ry*m]);
  }
  return pts;
}
function inkEllipse(cx,cy,rx,ry,o={}){
  const seed=o.seed??1;
  if(o.fill){ const fp=ellipsePts(cx,cy,rx,ry,seed,false); ctx.save(); ctx.fillStyle=o.fill; ctx.beginPath(); ctx.moveTo(...fp[0]); for(const p of fp) ctx.lineTo(...p); ctx.closePath(); ctx.fill(); ctx.restore(); }
  inkPath(ellipsePts(cx,cy,rx,ry,seed,true), Object.assign({}, o, {fill:null}));
}

function hatchFill(pts, color, gap=4, angle=-0.9, seed=1, w=1.6){
  ctx.save();
  ctx.beginPath(); ctx.moveTo(...pts[0]); for(const p of pts) ctx.lineTo(...p); ctx.closePath(); ctx.clip();
  let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
  for(const p of pts){ minx=Math.min(minx,p[0]); miny=Math.min(miny,p[1]); maxx=Math.max(maxx,p[0]); maxy=Math.max(maxy,p[1]); }
  const cx=(minx+maxx)/2, cy=(miny+maxy)/2, rad=Math.hypot(maxx-minx,maxy-miny)/2+4;
  const ux=Math.cos(angle), uy=Math.sin(angle), nx=-uy, ny=ux;
  let k=0;
  for(let d=-rad; d<=rad; d+=gap){
    const px=cx+nx*d, py=cy+ny*d;
    inkPath([[px-ux*rad,py-uy*rad],[px+ux*rad,py+uy*rad]], {c:color, w, seed:seed+k++, j:0.6, taper:false, a:0.8});
  }
  ctx.restore();
}

function htext(str, x, y, o={}){
  const size=o.size||22, font=o.font||'Caveat', wt=o.wt||600, c=o.c||INK, al=o.align||'left';
  const seed=o.seed ?? strSeed(str), rot=o.rot||0, j=o.j??1;
  ctx.save(); ctx.translate(x,y); if(rot) ctx.rotate(rot);
  if(o.a!=null) ctx.globalAlpha*=o.a;
  ctx.font = `${wt} ${size}px "${font}", "Comic Sans MS", cursive`;
  ctx.fillStyle = c; ctx.textBaseline = o.base || 'alphabetic';
  const chars=[...String(str)], ws=[]; let tot=0;
  for(const ch of chars){ const w=ctx.measureText(ch).width; ws.push(w); tot+=w; }
  let cx = al==='center' ? -tot/2 : al==='right' ? -tot : 0;
  const rb = mulberry32(seed*31 + (STATIC||o.still ? 0 : BOIL)*131), rs = mulberry32(seed*17+5);
  for(let k=0;k<chars.length;k++){
    const w=ws[k], r1=rs(), r2=rb(), r3=rs();
    ctx.save();
    ctx.translate(cx+w/2, (r3-0.5)*size*0.07*j + (r2-0.5)*0.7*j);
    ctx.rotate(((r1-0.5)*0.09 + (r2-0.5)*0.02)*j);
    ctx.fillText(chars[k], -w/2, 0);
    ctx.restore();
    cx += w;
  }
  ctx.restore();
  return tot;
}

function heartPts(cx,cy,s){
  const pts=[];
  for(let i=0;i<=28;i++){ const t=Math.PI*2*i/28; const x=16*Math.pow(Math.sin(t),3); const y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)); pts.push([cx+x*s/32, cy+y*s/32]); }
  return pts;
}
function starPts(cx,cy,r1,r2,rot=-Math.PI/2){
  const pts=[]; for(let i=0;i<10;i++){ const r=i%2?r2:r1, a=rot+i*Math.PI/5; pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); } return pts;
}
function drawStar(cx,cy,r,seed=3,fill=GOLD){
  const p=starPts(cx,cy,r,r*0.45);
  ctx.save(); ctx.fillStyle=fill; ctx.globalAlpha*=0.9; ctx.beginPath(); ctx.moveTo(...p[0]); for(const q of p) ctx.lineTo(...q); ctx.closePath(); ctx.fill(); ctx.restore();
  inkPath(p, {closed:true, w:1.8, seed, c:'#5a3d06'});
}
function roundRectPts(x,y,w,h,r){
  const pts=[], seg=5;
  const corner=(cx,cy,a0)=>{ for(let i=0;i<=seg;i++){ const a=a0+(Math.PI/2)*i/seg; pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]); } };
  corner(x+w-r, y+r, -Math.PI/2); corner(x+w-r, y+h-r, 0); corner(x+r, y+h-r, Math.PI/2); corner(x+r, y+r, Math.PI);
  return pts;
}
