'use strict';
const W = 1000, H = 700;
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');
const MAIN = ctx;
let DPR = 1, SC = 1, OX = 0, OY = 0;
let deskCv = null, paperCv = null;

const INK = '#1d2742', RED = '#c23b33', GRAPHITE = '#4a4a4e', GOLD = '#e7b43b';
const R = Math.random;
const rr = (a,b) => a + R()*(b-a);
const ri = (a,b) => Math.floor(rr(a,b+1));
const pick = a => a[Math.floor(R()*a.length)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const lerp = (a,b,t) => a + (b-a)*t;
const ease = t => 1 - Math.pow(1-clamp(t,0,1), 3);
const easeBack = t => { t = clamp(t,0,1); const c = 1.6; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2); };
const dist = (a,b) => Math.hypot(b[0]-a[0], b[1]-a[1]);
const lerpPt = (a,b,t) => [lerp(a[0],b[0],t), lerp(a[1],b[1],t)];
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function strSeed(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
let seedCounter = Math.floor(R()*1e6);
const newSeed = () => (seedCounter = (seedCounter*16807 + 7919) % 2147483647);
function shade(hex,f){ const n=parseInt(hex.slice(1),16); const c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(f<0? v*(1+f) : v+(255-v)*f)); return `rgb(${c[0]},${c[1]},${c[2]})`; }

let T = 0, BOIL = 0, STATIC = false;


function spline(pts, seg=8, closed=false){
  const out=[], n=pts.length;
  const P = i => closed ? pts[(i+n)%n] : pts[clamp(i,0,n-1)];
  const last = closed ? n : n-1;
  for(let i=0;i<last;i++){
    const p0=P(i-1), p1=P(i), p2=P(i+1), p3=P(i+2);
    for(let s=0;s<seg;s++){
      const t=s/seg, t2=t*t, t3=t2*t;
      const f = k => 0.5*((2*p1[k]) + (-p0[k]+p2[k])*t + (2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2 + (-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);
      out.push([f(0), f(1)]);
    }
  }
  out.push(closed ? pts[0] : pts[n-1]);
  return out;
}
