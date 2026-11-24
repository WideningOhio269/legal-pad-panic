'use strict';
/* ---------- SHORT GAME: maze ---------- */
class Maze {
  constructor(level){
    const ML = CFG.mazeLaps[Math.min(level-1, CFG.mazeLaps.length-1)];
    const c=ML.c, r=ML.r; this.c=c; this.r=r; this.k=ML.k;
    this.cs = Math.floor(Math.min(620/c, 360/r, CFG.mazeMaxCell));
    this.hits=0; this.grace=0; this.pause=0; this.hitMarks=[]; this.flashWall=null; this.bumpAt=null;
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
  freeze(){ return this.done || this.pause>0; }
  nearestWall(hx,hy){
    const cs=this.cs, px=this.ox+hx*cs, py=this.oy+hy*cs; let best=null, bd=1e9;
    for(const w of this.walls){
      const vx=w[2]-w[0], vy=w[3]-w[1], L=vx*vx+vy*vy||1;
      const t=Math.max(0, Math.min(1, ((px-w[0])*vx+(py-w[1])*vy)/L));
      const d=Math.hypot(px-(w[0]+vx*t), py-(w[1]+vy*t));
      if(d<bd){ bd=d; best=w; }
    }
    return best;
  }
  hit(hx,hy){
    this.hits++; this.hitMarks.push([hx,hy,newSeed()]);
    this.pause=CFG.mazePause; this.grace=CFG.mazeGrace; this.drag=false;
    this.flashWall=this.nearestWall(hx,hy); this.bumpAt=[hx,hy];
    const idx=Math.max(0, this.trail.length-4); this.px=this.trail[idx][0]; this.py=this.trail[idx][1]; this.trail.length=idx+1;
    if(G) G.shake=0.15;
    if(this.hits>=CFG.mazeHits){ this.done=true; this.outcome='fail'; }
  }
  update(dt){
    if(this.done) return;
    if(this.pause>0){ this.pause-=dt; return; }   // game and timer are stopped (see freeze)
    if(this.grace>0) this.grace-=dt;
    if(!this.drag) return;
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
  // pen grip: you must press near the ball to pick it up, and dragging too far drops it
  dist(x,y){ return Math.hypot((x-this.ox)/this.cs-this.px, (y-this.oy)/this.cs-this.py); }
  onDown(x,y){ this.mx=x; this.my=y; if(!this.done && this.dist(x,y)<=CFG.mazeGrab) this.drag=true; }
  onMove(x,y){ this.mx=x; this.my=y; if(this.drag && this.dist(x,y)>CFG.mazeLeash) this.drag=false; }
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
    const paused = this.pause>0;
    if(paused && this.flashWall){ const w=this.flashWall; inkLine(w[0],w[1],w[2],w[3], {c:RED, w:4.5, seed:w[4]+50, os:3}); }
    if(paused && this.bumpAt){ htext('bump!', ox+this.bumpAt[0]*cs+14, oy+this.bumpAt[1]*cs-14, {size:26, c:RED, seed:this.seed+8, rot:-0.08}); }
    const blink = !paused && this.grace>0 && Math.floor(T*12)%2===0;
    // lift shadow while held
    if(this.drag && !blink) inkEllipse(dx+3,dy+5,rad,rad,{fill:'rgba(0,0,0,0.18)', c:'rgba(0,0,0,0)', w:0, seed:this.seed+9, still:true});
    if(!blink) inkEllipse(dx,dy-(this.drag?2:0),rad,rad,{fill:'#2b3a8c', c:INK, w:2, seed:this.seed+5});
    // pause ring shrinks toward the ball as control comes back
    if(paused){ const rr=rad+6+10*(this.pause/CFG.mazePause); inkEllipse(dx,dy,rr,rr,{c:RED, w:1.8, seed:this.seed+10, still:true}); }
    else if(!this.drag && !this.done){ const rr=rad+7+Math.sin(T*6)*2; inkEllipse(dx,dy,rr,rr,{c:GRAPHITE, w:1.5, seed:this.seed+11, still:true}); }
    if(!this.moved){ htext('press the ball and drag, do not touch the walls', dx+rad+10, dy-rad-10, {size:20, c:RED, seed:this.seed+6, rot:-0.04}); }
    else if(!this.drag && !paused && !this.done){ htext('press the ball to keep going', dx, dy-rad-16, {size:19, c:GRAPHITE, align:'center', seed:this.seed+12}); }
    const left=CFG.mazeHits-this.hits;
    htext(left===1 ? 'one more bump and you are out' : `wall bumps left: ${left}`, 500, oy-14, {size:21, c:left===1?RED:GRAPHITE, align:'center', seed:this.seed+7+this.hits});
  }
}
