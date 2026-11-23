'use strict';
/* ---------- doodles for the rest stage ---------- */
function sk(pts, o){ inkPath(pts, Object.assign({c:'#2f2f33', w:2.2, smooth:true}, o)); const p2=pts.map(p=>[p[0]+1.3,p[1]+0.9]); inkPath(p2, Object.assign({c:'#2f2f33', w:1.1, smooth:true, a:0.5}, o, {seed:(o.seed||1)+77})); }
function skE(cx,cy,rx,ry,seed){ inkEllipse(cx,cy,rx,ry,{c:'#2f2f33',w:2.2,seed}); inkEllipse(cx+1.5,cy+1,rx*0.98,ry*1.02,{c:'#2f2f33',w:1,seed:seed+5,a:0.5}); }
const DOODLES = [
  { label:'sleepy cat', draw(s){ skE(10,40,120,58,s); skE(-100,10,50,42,s+1);
      sk([[-134,-10],[-140,-58],[-108,-30]],{seed:s+2,smooth:false}); sk([[-86,-32],[-66,-64],[-60,-22]],{seed:s+3,smooth:false});
      sk([[-122,8],[-114,14],[-106,8]],{seed:s+4}); sk([[-92,8],[-84,14],[-76,8]],{seed:s+5});
      sk([[-104,22],[-98,26],[-92,22]],{seed:s+6}); sk([[-130,24],[-160,20]],{seed:s+7,smooth:false}); sk([[-130,30],[-158,34]],{seed:s+8,smooth:false});
      sk([[125,55],[150,20],[140,-20],[110,-30],[95,-10]],{seed:s+9});
      htext('z', 40, -60, {size:34, c:'#2f2f33', seed:s+10}); htext('z', 66, -86, {size:42, c:'#2f2f33', seed:s+11}); htext('Z', 98, -116, {size:52, c:'#2f2f33', seed:s+12}); } },
  { label:'good boy', draw(s){ skE(0,0,92,84,s);
      sk([[-80,-40],[-120,-20],[-118,60],[-90,40],[-78,0]],{seed:s+1}); sk([[80,-40],[120,-20],[118,60],[90,40],[78,0]],{seed:s+2});
      inkEllipse(-32,-12,6,7,{fill:'#2f2f33',seed:s+3,w:1}); inkEllipse(32,-12,6,7,{fill:'#2f2f33',seed:s+4,w:1});
      inkEllipse(0,18,16,11,{fill:'#2f2f33',seed:s+5,w:1}); sk([[-26,36],[-12,48],[0,36],[12,48],[26,36]],{seed:s+6});
      sk([[0,48],[2,72],[12,76],[16,56]],{seed:s+7,c:'#c23b33'}); } },
  { label:'judging you', draw(s){ skE(0,50,72,92,s); skE(0,-70,56,48,s+1);
      sk([[-46,-94],[-50,-140],[-16,-112]],{seed:s+2,smooth:false}); sk([[46,-94],[50,-140],[16,-112]],{seed:s+3,smooth:false});
      sk([[-30,-74],[-14,-74]],{seed:s+4,smooth:false}); sk([[14,-74],[30,-74]],{seed:s+5,smooth:false});
      sk([[-6,-56],[0,-52],[6,-56]],{seed:s+6}); sk([[-20,-50],[-70,-58]],{seed:s+7,smooth:false}); sk([[20,-50],[70,-58]],{seed:s+8,smooth:false});
      sk([[60,110],[120,110],[140,60],[118,30]],{seed:s+9}); } },
  { label:'fetch?', draw(s){ skE(-40,30,110,48,s); skE(80,-30,46,40,s+1);
      sk([[60,-60],[40,-10],[30,-40]],{seed:s+2}); inkEllipse(94,-36,5,6,{fill:'#2f2f33',seed:s+3,w:1}); inkEllipse(126,-24,8,6,{fill:'#2f2f33',seed:s+4,w:1});
      sk([[-110,66],[-112,118]],{seed:s+5,smooth:false}); sk([[-70,74],[-70,120]],{seed:s+6,smooth:false}); sk([[0,74],[2,120]],{seed:s+7,smooth:false}); sk([[40,66],[44,118]],{seed:s+8,smooth:false});
      sk([[-148,20],[-180,-10],[-190,-40]],{seed:s+9}); inkEllipse(190,90,24,24,{c:'#c23b33',w:2.2,seed:s+10,fill:'rgba(194,59,51,0.25)'}); sk([[170,80],[190,92],[210,80]],{seed:s+11,c:'#c23b33'}); } }
];
