(()=>{"use strict";
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,SA={t:0,b:0,l:0,r:0};
const probe=document.createElement('div');probe.style.cssText='position:fixed;top:env(safe-area-inset-top);bottom:env(safe-area-inset-bottom);left:env(safe-area-inset-left);right:env(safe-area-inset-right);pointer-events:none;visibility:hidden';document.body.appendChild(probe);
function resize(){DPR=Math.min(devicePixelRatio||1,2.5);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;const r=probe.getBoundingClientRect();SA={t:r.top,l:r.left,b:H-r.bottom,r:W-r.right};if(state==='play')layout();}
addEventListener('resize',resize);
// ---------- save ----------
const KEY='mollyBottleSmash.v1';
let save={level:1,score:0,prizes:{}};
try{Object.assign(save,JSON.parse(localStorage.getItem(KEY))||{});}catch(e){}
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(save));}catch(e){}};
// ---------- audio ----------
let AC=null,master=null;
function audio(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.32;const comp=AC.createDynamicsCompressor();master.connect(comp);comp.connect(AC.destination);}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function env(g,t,a,peak,d){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);}
let noiseBuf=null;
function sSmash(pitch=1){if(!AC)return;const t=AC.currentTime;
 if(!noiseBuf){noiseBuf=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
 const n=AC.createBufferSource();n.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=2500;const g=AC.createGain();env(g,t,.008,.5,.35);n.connect(f);f.connect(g);g.connect(master);n.start(t);n.stop(t+.5);
 const th=AC.createOscillator(),tg=AC.createGain();th.type='sine';th.frequency.setValueAtTime(220,t);th.frequency.exponentialRampToValueAtTime(90,t+.15);env(tg,t,.006,.35,.18);th.connect(tg);tg.connect(master);th.start(t);th.stop(t+.3);
 for(let i=0;i<6;i++){const o=AC.createOscillator(),og=AC.createGain(),st=t+.02+Math.random()*.25;o.type='sine';o.frequency.value=(1800+Math.random()*2600)*pitch;env(og,st,.004,.12,.25);o.connect(og);og.connect(master);o.start(st);o.stop(st+.35);}}
function sThrow(){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(500,t);o.frequency.exponentialRampToValueAtTime(200,t+.25);env(g,t,.03,.08,.22);o.connect(g);g.connect(master);o.start(t);o.stop(t+.3);}
function sNote(fr,dl=0,len=.4,v=.15,type='triangle'){if(!AC)return;const t=AC.currentTime+dl,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=fr;env(g,t,.02,v,len);o.connect(g);g.connect(master);o.start(t);o.stop(t+len+.05);}
const sWin=()=>[523,659,784,1047].forEach((f,i)=>sNote(f,i*.14,.5));
const sPop=()=>{sNote(660,0,.15);sNote(990,.07,.25);};
const sBonk=()=>sNote(180,0,.15,.12,'sine');
// ---------- art helpers ----------
const COLS=[['#ff5f7e','red'],['#ffa53b','orange'],['#ffe14d','yellow'],['#5fd97a','green'],['#4fb8ff','blue'],['#a77bff','purple'],['#ff8fe0','pink']];
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,p=Math.abs(a);r=Math.round((f-r)*p+r);g=Math.round((f-g)*p+g);b=Math.round((f-b)*p+b);return `rgb(${r},${g},${b})`;}
function drawBottle(x,y,h,col,wob=0){const w=h*.38;ctx.save();ctx.translate(x,y);ctx.rotate(wob);
 ctx.beginPath();ctx.moveTo(-w/2,0);ctx.lineTo(-w/2,-h*.55);ctx.quadraticCurveTo(-w/2,-h*.72,-w*.18,-h*.78);ctx.lineTo(-w*.18,-h*.95);ctx.lineTo(w*.18,-h*.95);ctx.lineTo(w*.18,-h*.78);ctx.quadraticCurveTo(w/2,-h*.72,w/2,-h*.55);ctx.lineTo(w/2,0);ctx.closePath();
 const gr=ctx.createLinearGradient(-w/2,0,w/2,0);gr.addColorStop(0,shade(col,-.25));gr.addColorStop(.35,shade(col,.25));gr.addColorStop(1,shade(col,-.35));ctx.fillStyle=gr;ctx.globalAlpha=.92;ctx.fill();ctx.globalAlpha=1;ctx.lineWidth=Math.max(1.5,h*.025);ctx.strokeStyle=shade(col,-.45);ctx.stroke();
 ctx.fillStyle='rgba(255,255,255,.55)';rr(-w*.32,-h*.6,w*.12,h*.5,w*.06);ctx.fill();
 ctx.fillStyle=shade(col,-.4);rr(-w*.22,-h,w*.44,h*.08,3);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();star(0,-h*.3,w*.17,w*.08);ctx.fill();ctx.restore();}
function star(x,y,R,r,n=5){for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,d=i%2?r:R;i?ctx.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d):ctx.moveTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}ctx.closePath();}
const KH={bottle:1,plate:.62,cup:.5},KW={bottle:.19,plate:.31,cup:.27};
function tbox(b){const hh=b.h*KH[b.kind||'bottle'];return [b.x,b.y-hh/2,b.h*KW[b.kind||'bottle'],hh/2];}
function drawPlate(x,y,h,col,wob){const r=h*.31;ctx.save();ctx.translate(x,y-r);ctx.rotate(wob);ell(0,0,r,r,shade(col,-.3));ell(0,0,r*.92,r*.92,shade(col,.55));ell(0,0,r*.6,r*.6,shade(col,.75));ctx.strokeStyle=col;ctx.lineWidth=r*.12;ctx.beginPath();ctx.arc(0,0,r*.76,0,7);ctx.stroke();ctx.fillStyle=col;for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.arc(Math.cos(a)*r*.76,Math.sin(a)*r*.76,r*.1,0,7);ctx.fill();}ctx.fillStyle=shade(col,-.1);ctx.beginPath();star(0,0,r*.28,r*.13);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.ellipse(-r*.45,-r*.45,r*.15,r*.07,-.8,0,7);ctx.fill();ctx.restore();ctx.fillStyle='#6b3a1a';rr(x-r*.5,y-r*.12,r,r*.12,2);ctx.fill();}
function drawCup(x,y,h,col,wob){const ch=h*.5,w=h*.46;ctx.save();ctx.translate(x,y);ctx.rotate(wob);ctx.strokeStyle=shade(col,-.3);ctx.lineWidth=w*.14;ctx.beginPath();ctx.arc(w*.45,-ch*.55,ch*.25,-1.3,1.3);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-w/2,-ch);ctx.lineTo(w/2,-ch);ctx.lineTo(w*.38,0);ctx.lineTo(-w*.38,0);ctx.closePath();const g=ctx.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,shade(col,-.15));g.addColorStop(.35,shade(col,.4));g.addColorStop(1,shade(col,-.25));ctx.fillStyle=g;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=shade(col,-.4);ctx.stroke();
 ell(0,-ch,w/2,ch*.1,shade(col,-.35));ctx.fillStyle='#fff';[[-.2,.45],[.15,.6],[0,.25]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a*w,-ch*b,w*.07,0,7);ctx.fill();});ctx.restore();}
function drawTarget(b){const k=b.kind||'bottle';if(k==='plate')drawPlate(b.x,b.y,b.h,b.col,b.wob);else if(k==='cup')drawCup(b.x,b.y,b.h,b.col,b.wob);else drawBottle(b.x,b.y,b.h,b.col,b.wob);}
function drawBall(x,y,r){const g=ctx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.3,'#7ee0ff');g.addColorStop(1,'#1a6fd0');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=r*.12;ctx.beginPath();ctx.arc(x,y,r*.7,.3,2.2);ctx.stroke();}
function ell(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();}
function eyes(x,y,s,gap){ell(x-gap,y,s,s*1.15,'#2b2140');ell(x+gap,y,s,s*1.15,'#2b2140');ell(x-gap+s*.35,y-s*.4,s*.35,s*.35,'#fff');ell(x+gap+s*.35,y-s*.4,s*.35,s*.35,'#fff');}
function smile(x,y,s){ctx.strokeStyle='#2b2140';ctx.lineWidth=s*.35;ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y,s,.2*Math.PI,.8*Math.PI);ctx.stroke();}
function blush(x,y,s,gap){ell(x-gap,y,s,s*.6,'rgba(255,120,150,.5)');ell(x+gap,y,s,s*.6,'rgba(255,120,150,.5)');}
// Prizes (original characters)
const PRIZES=[
{id:'capy',col:'#c08a5b',draw(s){ell(0,s*.2,s*.62,s*.42,'#c08a5b');ell(0,-s*.18,s*.42,s*.36,'#cf9a6b');ell(-s*.3,-s*.48,s*.1,s*.09,'#8e5f3b');ell(s*.3,-s*.48,s*.1,s*.09,'#8e5f3b');ell(0,-s*.05,s*.24,s*.17,'#a87648');eyes(0,-s*.25,s*.06,s*.17);ell(-s*.07,-s*.07,s*.03,s*.04,'#3a2a1a');ell(s*.07,-s*.07,s*.03,s*.04,'#3a2a1a');ell(0,-s*.6,s*.12,s*.08,'#ff9ec7');ell(0,-s*.68,s*.05,s*.05,'#ffd34d');}},
{id:'dino',col:'#6fd37a',draw(s){ctx.fillStyle='#4fb05c';for(let i=0;i<4;i++){ctx.beginPath();const a=-2.3+i*.5,x=Math.cos(a)*s*.5,y=Math.sin(a)*s*.5+s*.1;ctx.moveTo(x-s*.09,y+s*.05);ctx.lineTo(x,y-s*.14);ctx.lineTo(x+s*.09,y+s*.05);ctx.fill();}ell(0,s*.15,s*.55,s*.45,'#6fd37a');ell(0,s*.25,s*.32,s*.28,'#c9f5b3');ell(s*.42,-s*.25,s*.32,s*.27,'#6fd37a');eyes(s*.42,-s*.3,s*.055,s*.13);smile(s*.45,-s*.18,s*.08);blush(s*.42,-s*.15,s*.05,s*.2);ell(-s*.3,s*.55,s*.12,s*.07,'#4fb05c');ell(s*.2,s*.55,s*.12,s*.07,'#4fb05c');}},
{id:'uni',col:'#ffffff',draw(s){ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.moveTo(-s*.07,-s*.5);ctx.lineTo(0,-s*.92);ctx.lineTo(s*.07,-s*.5);ctx.fill();ell(0,s*.22,s*.5,s*.4,'#fff');ell(0,-s*.2,s*.38,s*.34,'#fff');['#ff8fe0','#a77bff','#4fb8ff'].forEach((c,i)=>ell(-s*.32+i*.05*s,-s*.38+i*s*.17,s*.12,s*.14,c));ell(-s*.22,-s*.5,s*.07,s*.11,'#fff');ell(s*.22,-s*.5,s*.07,s*.11,'#fff');eyes(s*.03,-s*.22,s*.055,s*.14);smile(s*.03,-s*.08,s*.07);blush(s*.03,-s*.08,s*.05,s*.24);ctx.strokeStyle='#eee';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,s*.22,s*.5,s*.4,0,0,7);ctx.stroke();}},
{id:'puff',col:'#bfe6ff',draw(s){/* Puffling: cloud lamb with rainbow wings */['#ff5f7e','#ffe14d','#4fb8ff'].forEach((c,i)=>{ell(-s*.55+i*.03*s,-s*.05,s*.25-i*.05*s,s*.35-i*.06*s,c);ell(s*.55-i*.03*s,-s*.05,s*.25-i*.05*s,s*.35-i*.06*s,c);});for(let i=0;i<7;i++){const a=i/7*6.28;ell(Math.cos(a)*s*.32,s*.1+Math.sin(a)*s*.28,s*.22,s*.22,'#f4fbff');}ell(0,s*.1,s*.36,s*.32,'#f4fbff');ell(0,-s*.05,s*.24,s*.22,'#bfe6ff');eyes(0,-s*.08,s*.05,s*.1);smile(0,0,s*.06);blush(0,0,s*.04,s*.17);}},
{id:'owl',col:'#8a7bff',draw(s){/* Moonbeam owl */ell(0,s*.1,s*.48,s*.55,'#8a7bff');ell(0,s*.22,s*.3,s*.35,'#d7d0ff');ctx.fillStyle='#8a7bff';ctx.beginPath();ctx.moveTo(-s*.4,-s*.25);ctx.lineTo(-s*.32,-s*.6);ctx.lineTo(-s*.12,-s*.38);ctx.moveTo(s*.4,-s*.25);ctx.lineTo(s*.32,-s*.6);ctx.lineTo(s*.12,-s*.38);ctx.fill();ell(-s*.17,-s*.15,s*.15,s*.15,'#fff');ell(s*.17,-s*.15,s*.15,s*.15,'#fff');eyes(0,-s*.15,s*.07,s*.17);ctx.fillStyle='#ffb13b';ctx.beginPath();ctx.moveTo(-s*.06,-s*.02);ctx.lineTo(s*.06,-s*.02);ctx.lineTo(0,s*.08);ctx.fill();ctx.fillStyle='#ffe14d';ctx.beginPath();ctx.arc(0,s*.3,s*.12,0,7);ctx.fill();ctx.fillStyle='#d7d0ff';ctx.beginPath();ctx.arc(s*.05,s*.27,s*.1,0,7);ctx.fill();}},
{id:'drag',col:'#ff9ec7',draw(s){/* Bloomlet: flower baby dragon */ctx.fillStyle='#ffcae2';ctx.beginPath();ctx.moveTo(-s*.2,-s*.05);ctx.quadraticCurveTo(-s*.75,-s*.55,-s*.65,s*.1);ctx.fill();ctx.beginPath();ctx.moveTo(s*.2,-s*.05);ctx.quadraticCurveTo(s*.75,-s*.55,s*.65,s*.1);ctx.fill();ell(0,s*.22,s*.42,s*.4,'#ff9ec7');ell(0,s*.3,s*.25,s*.25,'#ffe4f0');ell(0,-s*.25,s*.36,s*.3,'#ff9ec7');for(let i=0;i<5;i++){const a=i/5*6.28;ell(Math.cos(a)*s*.08,-s*.6+Math.sin(a)*s*.08,s*.07,s*.07,'#ffe14d');}ell(0,-s*.6,s*.05,s*.05,'#ff7a3b');eyes(0,-s*.27,s*.055,s*.14);smile(0,-s*.14,s*.07);blush(0,-s*.14,s*.05,s*.22);}},
{id:'fox',col:'#ff9a4d',draw(s){/* Starfox kit with glowing tail */ell(s*.45,s*.25,s*.25,s*.38,'#ff9a4d');ell(s*.5,s*.0,s*.13,s*.15,'#fff6c9');ctx.fillStyle='#ffe14d';ctx.beginPath();star(s*.5,0,s*.1,s*.05);ctx.fill();ell(0,s*.25,s*.38,s*.35,'#ff9a4d');ell(0,s*.3,s*.2,s*.24,'#fff');ctx.fillStyle='#ff9a4d';ctx.beginPath();ctx.moveTo(-s*.35,-s*.2);ctx.lineTo(-s*.3,-s*.65);ctx.lineTo(-s*.05,-s*.4);ctx.moveTo(s*.35,-s*.2);ctx.lineTo(s*.3,-s*.65);ctx.lineTo(s*.05,-s*.4);ctx.fill();ell(0,-s*.18,s*.38,s*.3,'#ff9a4d');ell(0,-s*.08,s*.2,s*.15,'#fff');eyes(0,-s*.22,s*.055,s*.15);ell(0,-s*.08,s*.05,s*.04,'#2b2140');blush(0,-s*.08,s*.05,s*.24);}},
];
function drawPrize(p,x,y,s,bob=0){ctx.save();ctx.translate(x,y+Math.sin(bob)*s*.04);ell(0,s*.62,s*.5,s*.1,'rgba(0,0,0,.18)');p.draw(s);ctx.restore();}
// ---------- scene ----------
let aim=null,state='home',t0=performance.now(),T=0;
let bottles=[],balls=[],parts=[],confetti=[],shelves=[],score=0,level=save.level,levelDone=0,choices=[],buttons=[],flash=0,gotPrize=null,gotT=0;
function bg(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3b2a6b');g.addColorStop(1,'#7b4fa8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 // tent stripes
 const n=Math.ceil(W/70)+1;for(let i=0;i<n;i++){ctx.fillStyle=i%2?'rgba(255,95,126,.85)':'rgba(255,240,220,.9)';ctx.beginPath();ctx.moveTo(i*70-35,0);ctx.lineTo(i*70+35,0);ctx.quadraticCurveTo(i*70,SA.t+60,i*70-35,0);ctx.fill();}
 ctx.fillStyle='rgba(255,240,220,.9)';for(let i=0;i<n;i++){ctx.beginPath();ctx.arc(i*70,SA.t+34,10,0,7);ctx.fill();}
 for(let i=0;i<n;i++){ctx.fillStyle=['#ffe14d','#4fb8ff','#5fd97a','#ff8fe0'][i%4];ctx.globalAlpha=.6+.4*Math.sin(T*3+i);ctx.beginPath();ctx.arc(i*70+35,SA.t+44,5,0,7);ctx.fill();}ctx.globalAlpha=1;}
function counter(){const y=H*.82;const g=ctx.createLinearGradient(0,y,0,H);g.addColorStop(0,'#c9773b');g.addColorStop(1,'#8a4a22');ctx.fillStyle=g;ctx.fillRect(0,y,W,H-y);ctx.fillStyle='#e8a060';ctx.fillRect(0,y,W,8);}
function layout(){const top=SA.t+90,bot=H*.62,land=W>H;const rows=shelves.length;shelves.forEach((s,i)=>{s.y=top+(bot-top)*(rows===1?.7:(i+1)/rows);});
 const bh=Math.min((bot-top)/rows*.8,land?H*.2:W*.24,150);bottles.forEach(b=>{const s=shelves[b.row];b.h=bh;b.baseX=SA.l+20+(W-SA.l-SA.r-40)*b.fx;b.y=s.y;});}
function startLevel(){level=save.level;const L=level;const rows=Math.min(1+Math.floor((L-1)/2),3);shelves=[];bottles=[];balls=[];parts=[];levelDone=0;
 for(let r=0;r<rows;r++){const cnt=Math.min(3+Math.floor(L/2)+r,7);const move=L>=4&&(r+L)%2===0;shelves.push({y:0,move,sp:(.4+Math.min(L,12)*.05)*(r%2?-1:1)});for(let i=0;i<cnt;i++){bottles.push({row:r,fx:(i+.5)/cnt,col:COLS[(i+r*2+L)%COLS.length][0],kind:L===1?['bottle','plate','cup'][i%3]:['bottle','plate','cup','bottle'][(i*7+r*3+L)%4],alive:1,wob:0,wv:0,h:60,x:0,y:0,baseX:0});}}
 state='play';layout();}
// ---------- input ----------
function addBtn(x,y,r,fn,kind){buttons.push({x,y,r,fn,kind});}
cv.addEventListener('pointerdown',e=>{e.preventDefault();audio();const x=e.clientX,y=e.clientY;
 for(const b of buttons){if(Math.hypot(x-b.x,y-b.y)<b.r){b.fn();return;}}
 if(state==='play'&&!levelDone&&balls.length<6){aim={id:e.pointerId,sx:x,sy:y,cx:x,cy:y};try{cv.setPointerCapture(e.pointerId);}catch(_){}}},{passive:false});
const AIMK=3.2;
function aimTarget(){const ox=W/2,oy=H-SA.b-40;let tx=ox+(aim.cx-aim.sx)*AIMK,ty=oy+(aim.cy-aim.sy)*AIMK;tx=Math.max(SA.l+10,Math.min(W-SA.r-10,tx));ty=Math.max(SA.t+60,Math.min(H*.8,ty));return [tx,ty];}
cv.addEventListener('pointermove',e=>{if(aim&&e.pointerId===aim.id){e.preventDefault();aim.cx=e.clientX;aim.cy=e.clientY;}},{passive:false});
function endAim(e,cancel){if(!aim||e.pointerId!==aim.id)return;aim.cx=e.clientX;aim.cy=e.clientY;const d=Math.hypot(aim.cx-aim.sx,aim.cy-aim.sy);if(!cancel&&d>12&&state==='play'&&!levelDone){const [tx,ty]=aimTarget();throwAt(tx,ty);}aim=null;}
cv.addEventListener('pointerup',e=>endAim(e,false));cv.addEventListener('pointercancel',e=>endAim(e,true));
document.addEventListener('gesturestart',e=>e.preventDefault());
function throwAt(x,y){if(balls.length>=6)return;const sx=W/2,sy=H-SA.b-40;balls.push({sx,sy,tx:x,ty:Math.min(y,H*.8),t:0,dur:.42+Math.hypot(x-sx,y-sy)/W*.08,r:Math.min(W,H)*.045,done:0});sThrow();}
function smash(b){b.alive=0;score++;save.score=(save.score||0)+1;flash=.25;const n=22;for(let i=0;i<n;i++){const a=Math.random()*6.28,v=150+Math.random()*350;parts.push({x:b.x,y:tbox(b)[1],vx:Math.cos(a)*v*.7,vy:Math.sin(a)*v-250,r:Math.random()*6.28,vr:(Math.random()-.5)*12,s:4+Math.random()*b.h*.12,c:Math.random()<.3?shade(b.col,.4):b.col,life:5+Math.random()*1.5,fl:4+Math.random()*(H*.18-10)*.35,shape:Math.random()<.4?'round':'shard'});}
 // a few bigger rounded remnants shaped like the target
 for(let i=0;i<3;i++)parts.push({x:b.x+(i-1)*b.h*.1,y:tbox(b)[1],vx:(i-1)*120+(Math.random()-.5)*80,vy:-200-Math.random()*150,r:0,vr:(Math.random()-.5)*8,s:b.h*.2,c:b.col,life:6,fl:6+Math.random()*(H*.18-10)*.35,shape:'chunk',kind:b.kind||'bottle',ci:i});
 for(let i=0;i<8;i++)parts.push({x:b.x,y:tbox(b)[1],vx:(Math.random()-.5)*300,vy:-200-Math.random()*300,r:0,vr:0,s:6,c:'#fff',life:.8,spark:1});
 sSmash(b.kind==='plate'?1.25:b.kind==='cup'?1.05:.8+Math.random()*.3);if(bottles.every(b=>!b.alive)){levelDone=T;setTimeout(()=>{if(state==="play")toPrize();},2200);sWin();burst();}}
function burst(){for(let i=0;i<120;i++)confetti.push({x:W/2,y:H*.4,vx:(Math.random()-.5)*900,vy:-Math.random()*700-200,r:Math.random()*6,vr:(Math.random()-.5)*10,c:COLS[i%7][0],life:3});}
function toPrize(){state='prize';const ids=PRIZES.map((_,i)=>i).sort(()=>Math.random()-.5);choices=ids.slice(0,3);}
function pickPrize(i){const p=PRIZES[i];save.prizes[p.id]=(save.prizes[p.id]||0)+1;save.level=level+1;store();gotPrize=p;gotT=T;sPop();burst();state='got';}
// ---------- update ----------
function update(dt){T+=dt;flash=Math.max(0,flash-dt);
 if(state==='play'){for(const s of shelves)if(s.move)s.off=(s.off||0)+s.sp*dt;
  for(const b of bottles){const s=shelves[b.row];const span=W-SA.l-SA.r-40;let fx=b.fx;if(s.move){fx=((b.fx+(s.off*.15))%1+1)%1;}b.x=SA.l+20+span*fx;b.y=s.y;b.wv+=(-b.wob*80-b.wv*6)*dt;b.wob+=b.wv*dt;}
  for(const ball of balls){ball.t+=dt/ball.dur;if(ball.t>=1&&!ball.done){ball.done=1;let hit=null,bd=1e9;for(const b of bottles){if(!b.alive)continue;const [cx,cy,hw,hh]=tbox(b);const dx=Math.abs(ball.tx-cx),dy=Math.abs(ball.ty-cy);if(dx<hw+ball.r*.9+8&&dy<hh+ball.r*.6+6){const d=dx+dy;if(d<bd){bd=d;hit=b;}}}
    if(hit)smash(hit);else{sBonk();for(const b of bottles)if(b.alive&&Math.abs(b.x-ball.tx)<b.h)b.wv+=(b.x<ball.tx?-1:1)*2;}
    ball.fall={vx:(Math.random()-.5)*200,vy:hit?-150:50,x:ball.tx,y:ball.ty};}}
  for(const ball of balls)if(ball.fall){ball.fall.vy+=1500*dt;ball.fall.x+=ball.fall.vx*dt;ball.fall.y+=ball.fall.vy*dt;}
  balls=balls.filter(b=>!b.fall||b.fall.y<H+50);}
 for(const p of parts){p.vy+=1200*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.life-=dt;
  if(!p.spark){if(p.x<SA.l+6){p.x=SA.l+6;p.vx=Math.abs(p.vx)*.5;}if(p.x>W-SA.r-6){p.x=W-SA.r-6;p.vx=-Math.abs(p.vx)*.5;}
   const fy=H*.82+p.fl;if(p.y>=fy){p.y=fy;if(Math.abs(p.vy)>90){p.vy*=-.32;p.vx*=.6;p.vr*=.5;if(!p.tk&&AC&&Math.random()<.25){p.tk=1;sNote(2200+Math.random()*1500,0,.08,.03,'sine');}}else{p.vy=0;p.vx*=Math.pow(.02,dt);p.vr*=Math.pow(.02,dt);}}}}
 parts=parts.filter(p=>p.life>0&&p.y<H+40);if(parts.length>500)parts.splice(0,parts.length-500);
 for(const p of confetti){p.vy+=600*dt;p.vx*=.99;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;p.life-=dt;}confetti=confetti.filter(p=>p.life>0);}
// ---------- draw ----------
function bigNum(n,x,y,sz,col='#fff'){ctx.font=`900 ${sz}px system-ui,-apple-system,"Arial Rounded MT Bold",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=sz*.16;ctx.strokeStyle='#2b2140';ctx.lineJoin='round';ctx.strokeText(n,x,y);ctx.fillStyle=col;ctx.fillText(n,x,y);}
function iconBtn(x,y,r,kind,fn,col='#ffe14d'){addBtn(x,y,r,fn,kind);const p=1+Math.sin(T*4)*.03*(kind==='play'||kind==='next'?1:0);ctx.save();ctx.translate(x,y);ctx.scale(p,p);ell(0,r*.1,r,r,'rgba(0,0,0,.25)');ell(0,0,r,r,col);ctx.lineWidth=r*.1;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.92,0,7);ctx.stroke();ctx.fillStyle='#2b2140';ctx.strokeStyle='#2b2140';
 if(kind==='play'||kind==='next'){ctx.beginPath();ctx.moveTo(-r*.3,-r*.42);ctx.lineTo(r*.48,0);ctx.lineTo(-r*.3,r*.42);ctx.closePath();ctx.fill();}
 else if(kind==='home'){ctx.beginPath();ctx.moveTo(-r*.5,0);ctx.lineTo(0,-r*.48);ctx.lineTo(r*.5,0);ctx.closePath();ctx.fill();ctx.fillRect(-r*.34,-r*.02,r*.68,r*.42);ctx.fillStyle=col;ctx.fillRect(-r*.1,r*.12,r*.2,r*.28);}
 else if(kind==='shelf'){ctx.fillRect(-r*.55,r*.3,r*.0+r*1.1,r*.1);ell(-r*.25,r*.08,r*.2,r*.2,'#c08a5b');ell(r*.25,r*.08,r*.2,r*.2,'#6fd37a');ell(0,-r*.3,r*.18,r*.18,'#ff9ec7');}
 ctx.restore();}
function drawHome(){bg();counter();const land=W>H,cx=W/2;
 // title: bottles + ball, no words needed
 const bh=Math.min(H*.2,W*.18,170);[-1.2,0,1.2].forEach((k,i)=>drawBottle(cx+k*bh*.55,H*.42+Math.abs(k)*4,bh*(i===1?1.15:1),COLS[[0,4,2][i]][0],Math.sin(T*2+i)*.05));
 ctx.fillStyle='#8a4a22';rr(cx-bh*1.3,H*.42,bh*2.6,14,6);ctx.fill();
 drawBall(cx+Math.sin(T*1.5)*bh,H*.25+Math.cos(T*3)*10,bh*.16);
 ctx.font=`900 ${Math.min(W*.09,64)}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='#2b2140';ctx.lineWidth=8;ctx.lineJoin='round';const ty=SA.t+Math.max(90,H*.13);ctx.strokeText('Bottle Smash',cx,ty);ctx.fillStyle='#ffe14d';ctx.fillText('Bottle Smash',cx,ty);
 const r=Math.min(W,H)*.12;iconBtn(cx-(land?r*1.4:0),land?H*.7:H*.64,r,'play',()=>{audio();sPop();startLevel();});
 const cnt=Object.values(save.prizes).reduce((a,b)=>a+b,0);
 iconBtn(land?cx+r*1.4:cx,land?H*.7:H*.64+r*2.4,r*.75,'shelf',()=>{sPop();state='coll';},'#7ee0ff');
 if(cnt)bigNum(cnt,(land?cx+r*1.4:cx)+r*.7,(land?H*.7:H*.64+r*2.4)-r*.6,r*.5);
 bigNum(save.level,SA.l+50,H-SA.b-50,46,'#ffe14d');}
function drawPlay(){bg();
 for(const s of shelves){ctx.fillStyle='#8a4a22';rr(SA.l+8,s.y,W-SA.l-SA.r-16,14,6);ctx.fill();ctx.fillStyle='#b8693a';ctx.fillRect(SA.l+8,s.y,W-SA.l-SA.r-16,4);}
 for(const b of bottles)if(b.alive)drawTarget(b);
 counter();
 for(const p of parts){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.globalAlpha=Math.min(1,p.life);if(p.spark){ctx.fillStyle='#fff';ctx.beginPath();star(0,0,p.s,p.s*.4,4);ctx.fill();}else if(p.shape==='chunk'){const z=p.s;ctx.fillStyle=p.c;ctx.strokeStyle=shade(p.c,-.35);ctx.lineWidth=2;ctx.beginPath();
  if(p.kind==='plate'){ctx.moveTo(0,0);ctx.arc(0,0,z*.8,p.ci*2.1,p.ci*2.1+1.9);ctx.closePath();}
  else if(p.kind==='cup'&&p.ci===2){ctx.lineWidth=z*.22;ctx.strokeStyle=shade(p.c,-.2);ctx.arc(0,0,z*.4,-1.3,1.3);ctx.stroke();ctx.beginPath();}
  else if(p.kind==='bottle'&&p.ci===1){rr(-z*.18,-z*.5,z*.36,z,z*.15);}
  else{rr(-z*.4,-z*.3,z*.8,z*.6,z*.25);}
  ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.arc(-z*.12,-z*.12,z*.1,0,7);ctx.fill();}
 else if(p.shape==='round'){ctx.fillStyle=p.c;rr(-p.s/2,-p.s/3,p.s,p.s*.66,p.s*.3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(-p.s*.15,-p.s*.1,p.s*.12,0,7);ctx.fill();}
 else{ctx.fillStyle=p.c;ctx.beginPath();ctx.moveTo(-p.s/2,-p.s/3);ctx.lineTo(p.s/2,-p.s/2);ctx.lineTo(0,p.s/2);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(-p.s*.2,-p.s*.3,p.s*.15,p.s*.4);}ctx.restore();}ctx.globalAlpha=1;
 for(const b of balls){let x,y,r;if(b.fall){x=b.fall.x;y=b.fall.y;r=b.r*.55;}else{const t=b.t;x=b.sx+(b.tx-b.sx)*t;y=b.sy+(b.ty-b.sy)*t-Math.sin(t*Math.PI)*H*.12;r=b.r*(1-.45*t);}drawBall(x,y,r);}
 // ready ball at hand
 if(!levelDone&&balls.length<6)drawBall(W/2,H-SA.b-40+Math.sin(T*4)*3,Math.min(W,H)*.045);
 if(aim&&state==='play'){const d=Math.hypot(aim.cx-aim.sx,aim.cy-aim.sy);if(d>6){const [tx,ty]=aimTarget(),ox=W/2,oy=H-SA.b-40;let on=bottles.some(b=>b.alive&&(()=>{const [cx,cy,hw,hh]=tbox(b);return Math.abs(tx-cx)<hw+12&&Math.abs(ty-cy)<hh+8})());
  // dotted arc preview
  ctx.fillStyle='rgba(255,255,255,.75)';for(let i=1;i<14;i++){const t=i/14,x=ox+(tx-ox)*t,y=oy+(ty-oy)*t-Math.sin(t*Math.PI)*H*.12;ctx.beginPath();ctx.arc(x,y,3+3*(1-t),0,7);ctx.fill();}
  // crosshair
  const R=Math.min(W,H)*.06*(1+Math.sin(T*8)*.05),c=on?'#5fd97a':'#ffffff';ctx.lineWidth=5;ctx.strokeStyle='rgba(43,33,64,.6)';ctx.beginPath();ctx.arc(tx,ty,R,0,7);ctx.stroke();ctx.lineWidth=3.5;ctx.strokeStyle=c;ctx.beginPath();ctx.arc(tx,ty,R,0,7);ctx.stroke();ctx.beginPath();ctx.arc(tx,ty,R*.45,0,7);ctx.stroke();
  ctx.beginPath();[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{ctx.moveTo(tx+a*R*.65,ty+b*R*.65);ctx.lineTo(tx+a*R*1.35,ty+b*R*1.35);});ctx.stroke();ell(tx,ty,4,4,c);
  // finger drag line
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(aim.sx,aim.sy);ctx.lineTo(aim.cx,aim.cy);ctx.stroke();ell(aim.sx,aim.sy,10,10,'rgba(255,255,255,.35)');}}
 else if(state==='play'&&!levelDone&&score===0&&balls.length===0){/* swipe-up hint */const k=(T%1.6)/1.6,hx=W/2,hy=H*.78-k*H*.12;ctx.globalAlpha=1-k;ell(hx,hy,18,18,'rgba(255,255,255,.8)');ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.moveTo(hx,H*.6);ctx.lineTo(hx-16,H*.63);ctx.lineTo(hx+16,H*.63);ctx.fill();}
 const left=bottles.filter(b=>b.alive).length;
 bigNum(score,W/2,SA.t+100,Math.min(W*.14,80),'#ffe14d');
 // remaining bottles as dots
 for(let i=0;i<left;i++){const dx=W-SA.r-30-i*22;ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(dx,H*.87,8,0,7);ctx.fill();}
 bigNum(level,SA.l+105,H-SA.b-40,40,'#7ee0ff');
 iconBtn(SA.l+44,H-SA.b-44,30,'home',()=>{state='home';});
 if(flash){ctx.fillStyle=`rgba(255,255,255,${flash*.5})`;ctx.fillRect(0,0,W,H);}}
function drawPrizePick(){bg();ctx.fillStyle='rgba(43,33,64,.35)';ctx.fillRect(0,0,W,H);const land=W>H;
 ctx.fillStyle='#ffe14d';ctx.beginPath();star(W/2,SA.t+110,50,22);ctx.fill();bigNum(level,W/2,SA.t+113,34,'#fff');
 choices.forEach((pi,i)=>{const p=PRIZES[pi];let x,y,s;if(land){s=Math.min(W/3.6,H*.45)*.5;x=W/2+(i-1)*s*2.5;y=H*.58;}else{s=Math.min(W*.3,H*.2)*.5;x=W/2;y=SA.t+200+(i+.5)*(H-SA.t-SA.b-240)/3;}
  addBtn(x,y,s*1.2,()=>pickPrize(pi));ell(x,y,s*1.15,s*1.15,'rgba(255,255,255,.9)');ctx.strokeStyle=p.col==='#ffffff'?'#ff8fe0':p.col;ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,y,s*1.15,0,7);ctx.stroke();drawPrize(p,x,y-s*.05,s*.95,T*3+i);});
 drawConf();}
function drawGot(){bg();const s=Math.min(W,H)*.25;ctx.fillStyle='rgba(255,225,77,.35)';ctx.save();ctx.translate(W/2,H*.42);ctx.rotate(T*.4);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-s*.3,-s*2.5);ctx.lineTo(s*.3,-s*2.5);ctx.fill();}ctx.restore();
 const k=Math.min(1,(T-gotT)*3);drawPrize(gotPrize,W/2,H*.42,s*(0.5+.5*k)*(1+Math.sin(T*5)*.03),T*3);
 bigNum(save.prizes[gotPrize.id],W/2+s*.8,H*.42-s*.8,s*.4,'#ffe14d');
 const r=Math.min(W,H)*.1;iconBtn(W/2-r*1.4,H*.78,r,'next',()=>{sPop();startLevel();});iconBtn(W/2+r*1.4,H*.78,r*.8,'shelf',()=>{sPop();state='coll';},'#7ee0ff');drawConf();}
function drawColl(){bg();const land=W>H,cols=land?4:2,rows=Math.ceil(PRIZES.length/cols);const top=SA.t+100,bot=H-SA.b-110,cw=(W-SA.l-SA.r-20)/cols,ch=(bot-top)/rows,s=Math.min(cw,ch)*.32;
 PRIZES.forEach((p,i)=>{const c=i%cols,r=Math.floor(i/cols),x=SA.l+10+cw*(c+.5),y=top+ch*(r+.5);const n=save.prizes[p.id]||0;
  if(r!==Math.floor((i-1)/cols)||c===0){ctx.fillStyle='#8a4a22';rr(SA.l+10,y+s*.7,W-SA.l-SA.r-20,12,6);ctx.fill();}
  if(n){drawPrize(p,x,y,s,T*2+i);if(n>1)bigNum(n,x+s*.8,y-s*.6,s*.5,'#ffe14d');}else{ctx.save();ctx.globalAlpha=.25;ctx.filter='grayscale(1) brightness(0.3)';drawPrize(p,x,y,s);ctx.restore();ctx.filter='none';}});
 iconBtn(SA.l+50,H-SA.b-55,36,'home',()=>{state='home';});iconBtn(W-SA.r-55,H-SA.b-55,40,'play',()=>{sPop();startLevel();});}
function drawConf(){for(const p of confetti){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-5,-3,10,6);ctx.restore();}}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;try{update(dt);ctx.setTransform(DPR,0,0,DPR,0,0);buttons=[];
 ({home:drawHome,play:drawPlay,prize:drawPrizePick,got:drawGot,coll:drawColl})[state]();}catch(e){console.error(e);}requestAnimationFrame(frame);}
resize();requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(AC){document.hidden?AC.suspend():AC.resume();}});
window.__game={get state(){return state},get bottles(){return bottles},get save(){return save},buttons:()=>buttons,AIMK,get W(){return W},get H(){return H},get SA(){return SA},throwAt,startLevel,toPrize,pickPrize,setState:s=>state=s};
})();
