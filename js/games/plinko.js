'use strict';
/* ---------- SHORT GAME: plinko ---------- */
class Plinko {
  constructor(level){
    const li=Math.min(level-1,3);
    this.left=290; this.right=710; this.slots=7; this.sx=(this.right-this.left)/this.slots;
    this.top=232; this.slotTop=525; this.bottom=585;
    const rows=CFG.plinkoRows[li], gap=(this.slotTop-36-this.top)/(rows-1);
    this.pegs=[];
    for(let i=0;i<rows;i++){
      const y=this.top+i*gap;
      if(i%2===0){ for(let k=1;k<this.slots;k++) this.pegs.push([this.left+this.sx*k+rr(-2,2), y+rr(-2,2), rr(3.3,4.4)]); }
      else { for(let k=0;k<this.slots;k++) this.pegs.push([this.left+this.sx*(k+0.5)+rr(-2,2), y+rr(-2,2), rr(3.3,4.4)]); }
    }
    const n=CFG.plinkoStarSlots[li], s0=ri(0,this.slots-n); this.star=new Set(); for(let i=0;i<n;i++) this.star.add(s0+i);
    this.chip={x:500,y:186,vx:0,vy:0,r:11}; this.state='aim'; this.t=0; this.swing=CFG.plinkoSwing[li]; this.ph=rr(0,6);
    this.slot=null; this.wait=0; this.done=false; this.outcome=null; this.seed=newSeed();
  }
  freeze(){ return this.state!=='aim'; }
  drop(){ if(this.state!=='aim') return; this.state='fall'; this.chip.vx=rr(-20,20); this.chip.vy=0; }
  onDown(){ this.drop(); }
  onMove(){} onUp(){}
  onTimeout(){ this.drop(); return true; }
  cursor(){ return this.state==='aim'?'pointer':'default'; }
  update(dt){
    const ch=this.chip;
    if(this.state==='aim'){ this.t+=dt; ch.x = 500 + Math.sin(this.t*this.swing*2+this.ph)*190; return; }
    if(this.state==='landed'){ this.wait-=dt; if(this.wait<=0 && !this.done){ this.done=true; this.outcome=this.star.has(this.slot)?'win':'fail'; } return; }
    const sub=6, h=dt/sub;
    for(let s=0;s<sub;s++){
      ch.vy = Math.min(720, ch.vy + 1150*h); ch.x += ch.vx*h; ch.y += ch.vy*h;
      if(ch.x < this.left+ch.r){ ch.x=this.left+ch.r; ch.vx=Math.abs(ch.vx)*0.6; }
      if(ch.x > this.right-ch.r){ ch.x=this.right-ch.r; ch.vx=-Math.abs(ch.vx)*0.6; }
      for(const p of this.pegs){
        const dx=ch.x-p[0], dy=ch.y-p[1], d=Math.hypot(dx,dy), m=ch.r+p[2];
        if(d<m && d>0){ const nx=dx/d, ny=dy/d; ch.x=p[0]+nx*m; ch.y=p[1]+ny*m;
          const vn=ch.vx*nx+ch.vy*ny; if(vn<0){ ch.vx-=1.45*vn*nx; ch.vy-=1.45*vn*ny; ch.vx+=rr(-45,45); } }
      }
      if(ch.y>this.slotTop){
        if(this.slot===null) this.slot=clamp(Math.floor((ch.x-this.left)/this.sx),0,this.slots-1);
        const lo=this.left+this.slot*this.sx+ch.r, hi=this.left+(this.slot+1)*this.sx-ch.r;
        if(ch.x<lo){ ch.x=lo; ch.vx=Math.abs(ch.vx)*0.4; } if(ch.x>hi){ ch.x=hi; ch.vx=-Math.abs(ch.vx)*0.4; }
      }
      if(ch.y>=this.bottom-ch.r){ ch.y=this.bottom-ch.r; this.state='landed'; this.wait=0.45; break; }
    }
  }
  draw(){
    const s=this.seed;
    inkRect(this.left-6, 160, this.right-this.left+12, this.bottom-160, {w:2.6, seed:s});
    for(let k=0;k<this.slots;k++){
      const x0=this.left+k*this.sx;
      if(this.star.has(k)){
        hatchFill([[x0+3,this.slotTop+2],[x0+this.sx-3,this.slotTop+2],[x0+this.sx-3,this.bottom-2],[x0+3,this.bottom-2]], '#d9a62c', 5, -0.9, s+k*20, 1.4);
        drawStar(x0+this.sx/2, this.slotTop+30, 11, s+300+k);
      }
      if(k>0) inkLine(x0,this.slotTop,x0,this.bottom,{w:2.2, seed:s+50+k, os:2});
    }
    ctx.fillStyle=INK;
    for(const p of this.pegs){ ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, 7); ctx.fill(); }
    const ch=this.chip;
    if(this.state==='aim'){
      ctx.save(); ctx.setLineDash([4,8]); ctx.strokeStyle='rgba(60,60,70,0.35)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(ch.x, ch.y+ch.r+4); ctx.lineTo(ch.x, this.slotTop); ctx.stroke(); ctx.restore();
    }
    inkEllipse(ch.x,ch.y,ch.r,ch.r,{fill:'#f2c14e', c:'#5a3d06', w:2, seed:s+7});
    inkEllipse(ch.x,ch.y,ch.r*0.55,ch.r*0.55,{c:'#7a5206', w:1.2, seed:s+8, a:0.7});
  }
}
