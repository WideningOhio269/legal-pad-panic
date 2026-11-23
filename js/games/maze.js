'use strict';
/* ---------- SHORT GAME: maze ---------- */
class Maze {
  constructor(level){
    const ML = CFG.mazeLaps[Math.min(level-1, CFG.mazeLaps.length-1)];
    const c=ML.c, r=ML.r; this.c=c; this.r=r; this.k=ML.k;
    this.cs = Math.floor(Math.min(620/c, 360/r, CFG.mazeMaxCell));
    this.hits=0; this.grace=0; this.hitMarks=[];
    this.ox = 500 - c*this.cs/2; this.oy = 395 - r*this.cs/2;
    this.cells = []; for(let i=0;i<c*r;i++) this.cells.push({n:1,e:1,s:1,w:1});
    const vis = new Array(c*r).fill(false), st=[[ri(0,c-1), ri(0,r-1)]]; vis[st[0][1]*c+st[0][0]] = true;
    while(st.length){
      const [x,y] = st[st.length-1];
      const nb = [[0,-1,'n','s'],[1,0,'e','w'],[0,1,'s','n'],[-1,0,'w','e']].filter(([dx,dy])=>{ const nx=x+dx, ny=y+dy; return nx>=0&&ny>=0&&nx<c&&ny<r&&!vis[ny*c+nx]; });
      if(!nb.length){ st.pop(); continue; }
      const [dx,dy,a,b] = pick(nb); const nx=x+dx, ny=y+dy;
      this.cell(x,y)[a]=0; this.cell(nx,ny)[b]=0; vis[ny*c+nx]=true; st.push([nx,ny]);
    }
    this.start=[0, ri(0,r-1)]; this.exit=[c-1, ri(0,r-1)];
    this.px=this.start[0]+0.5; this.py=this.start[1]+0.5;
    this.drag=false; this.mx=0; this.my=0; this.moved=false;
    this.done=false; this.outcome=null; this.seed=newSeed();
    this.trail=[[this.px,this.py]];
    // merged wall strokes
    this.walls=[]; const cs=this.cs, ox=this.ox, oy=this.oy; let k=0;
    for(let y=0;y<=r;y++){ let run=-1;
      for(let x=0;x<=c;x++){ const has = x<c && (y<r ? this.cell(x,y).n : this.cell(x,r-1).s);
        if(has && run<0) run=x; if(!has && run>=0){ this.walls.push([ox+run*cs, oy+y*cs, ox+x*cs, oy+y*cs, this.seed+k++]); run=-1; } } }
    for(let x=0;x<=c;x++){ let run=-1;
      for(let y=0;y<=r;y++){ const has = y<r && (x<c ? this.cell(x,y).w : this.cell(c-1,y).e);
        if(has && run<0) run=y; if(!has && run>=0){ this.walls.push([ox+x*cs, oy+run*cs, ox+x*cs, oy+y*cs, this.seed+k++]); run=-1; } } }
  }
  cell(x,y){ return this.cells[y*this.c+x]; }
  valid(px,py){
    if(px<0||py<0||px>=this.c||py>=this.r) return false;
    const cx=Math.floor(px), cy=Math.floor(py), lx=px-cx, ly=py-cy, k=this.k, C=this.cell(cx,cy);
    const L=lx<k, Rt=lx>1-k, Tp=ly<k, B=ly>1-k;
    if((L||Rt)&&(Tp||B)) return false;
    if(L&&C.w) return false; if(Rt&&C.e) return false; if(Tp&&C.n) return false; if(B&&C.s) return false;
    return true;
  }
  freeze(){ return this.done; }
  hit(hx,hy){
    this.hits++; this.hitMarks.push([hx,hy,newSeed()]); this.grace=CFG.mazeGrace;
    const idx=Math.max(0, this.trail.length-4); this.px=this.trail[idx][0]; this.py=this.trail[idx][1]; this.trail.length=idx+1;
    if(G) G.shake=0.15;
    if(this.hits>=CFG.mazeHits){ this.done=true; this.outcome='fail'; }
  }
  update(dt){
    if(this.grace>0) this.grace-=dt;
    if(this.done || !this.drag) return;
    if(this.grace>CFG.mazeGrace-0.35) return;   // brief freeze right after a bump
    const tx=(this.mx-this.ox)/this.cs, ty=(this.my-this.oy)/this.cs;
    let dx=tx-this.px, dy=ty-this.py; const d=Math.hypot(dx,dy); if(d<0.02) return;
    let move=Math.min(d, CFG.mazeSpeed*dt); const steps=Math.ceil(move/0.03); const st=move/steps;
    for(let i=0;i<steps;i++){
      dx=tx-this.px; dy=ty-this.py; const dd=Math.hypot(dx,dy)||1;
      const nx=this.px+dx/dd*st, ny=this.py+dy/dd*st;
      if(this.valid(nx,ny)){ this.px=nx; this.py=ny; }
      else { if(this.grace<=0) this.hit(nx,ny); break; }
    }
    if(this.done) return;
    this.moved=true;
    const lt=this.trail[this.trail.length-1]; if(Math.hypot(lt[0]-this.px, lt[1]-this.py)>0.12) this.trail.push([this.px,this.py]);
    if(Math.floor(this.px)===this.exit[0] && Math.floor(this.py)===this.exit[1]){ this.done=true; this.outcome='win'; }
  }
  onDown(x,y){ this.drag=true; this.mx=x; this.my=y; }
  onMove(x,y){ this.mx=x; this.my=y; }
  onUp(){ this.drag=false; }
  cursor(){ return this.drag ? 'grabbing' : 'grab'; }
  draw(){
    const cs=this.cs, ox=this.ox, oy=this.oy;
    if(this.trail.length>1) inkPath(this.trail.map(p=>[ox+p[0]*cs, oy+p[1]*cs]), {c:GRAPHITE, w:1.4, seed:this.seed+900, j:0.4, a:0.45, still:true});
    for(const wl of this.walls) inkLine(wl[0],wl[1],wl[2],wl[3], {w:2.8, seed:wl[4], os:3});
    htext('start', ox-8, oy+(this.start[1]+0.5)*cs+6, {size:20, c:GRAPHITE, align:'right', seed:this.seed+3});
    drawStar(ox+(this.exit[0]+0.5)*cs, oy+(this.exit[1]+0.5)*cs, cs*0.26, this.seed+4);
    for(const h of this.hitMarks){ const x=ox+h[0]*cs, y=oy+h[1]*cs; inkLine(x-9,y-9,x+9,y+9,{c:RED,w:3,seed:h[2],os:2}); inkLine(x+9,y-9,x-9,y+9,{c:RED,w:3,seed:h[2]+1,os:2}); }
    const dx=ox+this.px*cs, dy=oy+this.py*cs, rad=cs*this.k*0.92;
    const blink = this.grace>0 && Math.floor(T*12)%2===0;
    if(!blink) inkEllipse(dx,dy,rad,rad,{fill:'#2b3a8c', c:INK, w:2, seed:this.seed+5});
    if(!this.moved){ htext('hold and drag, do not touch the walls', dx+rad+8, dy-rad-6, {size:20, c:RED, seed:this.seed+6, rot:-0.04}); }
    const left=CFG.mazeHits-this.hits;
    htext(left===1 ? 'one more bump and you are out' : `wall bumps left: ${left}`, 500, oy-14, {size:21, c:left===1?RED:GRAPHITE, align:'center', seed:this.seed+7+this.hits});
  }
}
