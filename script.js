// ===== config =====
// Configuração geral e definição das fases
const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d');
const W=640,H=360,CELL=80,GY=30,RX=10,FX=100,LINE=FX+CELL+8,MAXW=25;
const COL=['#6ee7a0','#57c7ff','#9a8cff','#ff7ad9','#ffc83d','#ff7a45','#ff4f6d','#fff3b0'];
const rowY=r=>GY+r*CELL+CELL/2,slotXY=i=>[i<4?FX:RX,GY+(i%4)*CELL];
const MAXUP=7; // nível máximo de evolução (torres nascem até nível 8)
let S,TI,SP,ST,DEC,SI=0,mode='main',AC; // estado do jogo, sprites, fase atual, etc.

// ---- FASES (para criar uma nova, copie um bloco e ajuste cores e monstros) ----
const STAGES=[
{name:'Floresta',ico:'tree',hm:1,vm:1,sky:['#0d1f17','#16352a'],lane:['#316a43','#2c5e3c'],base:'#1d2b24',path:'rgba(70,45,20,.24)',deco:0,dc:'#4f9a62',fence:['#8a5a2b','#b8803f'],fly:'#e8ffd8',
T:[{k:'mush',sc:1.7,fx:'',r:18},{k:'mush',sc:1.3,fx:'hue-rotate(190deg)',r:14},{k:'fly',sc:1.25,fx:'',r:22},{k:'mush',sc:3,fx:'hue-rotate(300deg)',r:36}]},
{name:'Cemitério',ico:'grave',hm:1.6,vm:1.05,sky:['#10121f','#262a44'],lane:['#3b4157','#343a4e'],base:'#1b1d29',path:'rgba(8,8,28,.28)',deco:1,dc:'#7d86a8',fence:['#2a2d3a','#6b7290'],fly:'#bfe8ff',
T:[{k:'zomb',sc:2,fx:'',r:20},{k:'rat',sc:2.2,fx:'',r:15},{k:'skel',sc:2,fx:'',r:20},{k:'zomb',sc:3.4,fx:'hue-rotate(280deg)',r:38}]},
{name:'Ruínas',ico:'ruins',hm:2.4,vm:.95,sky:['#2a1830','#5a3a3a'],lane:['#75604a','#6b5742'],base:'#33261f',path:'rgba(60,35,20,.24)',deco:2,dc:'#a88f6c',fence:['#8d7a60','#c4ae8a'],fly:'#ffd9a0',
T:[{k:'g1b',sc:1.8,fx:'',r:22},{k:'g1o',sc:1.5,fx:'',r:18},{k:'g1g',sc:2,fx:'',r:25},{k:'g1p',sc:3.2,fx:'',r:38}]}];

// ===== icons =====
// Ícones em SVG desenhados à mão (substituem emojis)
const ICON={
"coin": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#f5b61a\" stroke=\"#a96a00\" stroke-width=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"6.4\" fill=\"none\" stroke=\"#ffe08a\" stroke-width=\"1.8\"/><path d=\"M7.4 9a6 6 0 0 1 4-3.2\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".7\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>",
"heart": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z\" fill=\"#ff4f6d\" stroke=\"#8d1530\" stroke-width=\"1.8\" stroke-linejoin=\"round\"/><path d=\"M7.5 8.6a2.6 2.6 0 0 1 2.4-1.6\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".65\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>",
"on": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 9h4l5-4v14l-5-4H4z\" fill=\"currentColor\"/><path d=\"M16 9a4 4 0 0 1 0 6M18.6 6.4a8 8 0 0 1 0 11.2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>",
"off": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 9h4l5-4v14l-5-4H4z\" fill=\"currentColor\"/><path d=\"M16.5 9.5l5 5M21.5 9.5l-5 5\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>",
"up": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 3l8 9h-5v9H9v-9H4z\" fill=\"#fff\" stroke=\"#4b2a9a\" stroke-width=\"1.6\" stroke-linejoin=\"round\"/></svg>",
"arrow": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 12h13M13 6l6 6-6 6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
"lock": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2.5\" fill=\"#cfd6e4\" stroke=\"#4a5368\" stroke-width=\"1.7\"/><path d=\"M8 10.5V8a4 4 0 0 1 8 0v2.5\" fill=\"none\" stroke=\"#4a5368\" stroke-width=\"2\"/><circle cx=\"12\" cy=\"15.5\" r=\"1.7\" fill=\"#4a5368\"/></svg>",
"check": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 12.5l5 5L20 6.5\" fill=\"none\" stroke=\"#6ee7a0\" stroke-width=\"3.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
"rotate": "<svg class=\"ic\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20 12a8 8 0 1 1-2.5-5.8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><path d=\"M20.5 3.5v5h-5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>",
"tree": "<svg class=\"ic big\" viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"21\" y=\"38\" width=\"6\" height=\"8\" rx=\"1\" fill=\"#7a4a21\" stroke=\"#3a210c\" stroke-width=\"2\"/><path d=\"M24 20L44 42H4z\" fill=\"#246f3a\" stroke=\"#0f331c\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/><path d=\"M24 11L40 31H8z\" fill=\"#2f8a49\" stroke=\"#0f331c\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/><path d=\"M24 3L36 20H12z\" fill=\"#3fa65a\" stroke=\"#0f331c\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/><path d=\"M24 7l-6 9\" stroke=\"#8fe3a0\" stroke-opacity=\".7\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg>",
"grave": "<svg class=\"ic big\" viewBox=\"0 0 48 48\" aria-hidden=\"true\"><path d=\"M11 43V20a13 13 0 0 1 26 0v23z\" fill=\"#aeb7cf\" stroke=\"#262c4a\" stroke-width=\"2.6\" stroke-linejoin=\"round\"/><path d=\"M24 15v15M17.5 21h13\" stroke=\"#262c4a\" stroke-width=\"3.2\" stroke-linecap=\"round\"/><path d=\"M15 17a9 9 0 0 1 5-6\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".7\" stroke-width=\"2\" stroke-linecap=\"round\"/><path d=\"M5 44h38\" stroke=\"#262c4a\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>",
"ruins": "<svg class=\"ic big\" viewBox=\"0 0 48 48\" aria-hidden=\"true\"><rect x=\"5\" y=\"40\" width=\"38\" height=\"5\" rx=\"1.5\" fill=\"#c4ae8a\" stroke=\"#4a3a28\" stroke-width=\"2.2\"/><rect x=\"9\" y=\"11\" width=\"11\" height=\"29\" fill=\"#d8c4a0\" stroke=\"#4a3a28\" stroke-width=\"2.2\"/><rect x=\"7\" y=\"7\" width=\"15\" height=\"5\" rx=\"1.5\" fill=\"#e6d4b0\" stroke=\"#4a3a28\" stroke-width=\"2.2\"/><path d=\"M13 14v24M17 14v24\" stroke=\"#4a3a28\" stroke-opacity=\".35\" stroke-width=\"1.6\"/><path d=\"M27 40V28l4-5 3 3 3-6 3 7v13z\" fill=\"#c4ae8a\" stroke=\"#4a3a28\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/></svg>"
};
const HAND_SVG="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"80\" viewBox=\"0 0 32 40\"><rect x=\"12\" y=\"2\" width=\"7\" height=\"22\" rx=\"3.5\" fill=\"#fff\" stroke=\"#1a1a2a\" stroke-width=\"2\"/><rect x=\"2\" y=\"21\" width=\"10\" height=\"7\" rx=\"3.5\" fill=\"#fff\" stroke=\"#1a1a2a\" stroke-width=\"2\"/><rect x=\"6\" y=\"18\" width=\"21\" height=\"19\" rx=\"6\" fill=\"#fff\" stroke=\"#1a1a2a\" stroke-width=\"2\"/><path d=\"M17 25v6M22 25v6\" stroke=\"#1a1a2a\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>";

// ===== storage =====
// Salvamento no navegador (localStorage)
const SAVE_KEY='mergestrike_save_v1';
const SAVE_DEF={bests:[0,0,0],prog:0,tut:false,snd:true,run:null};
let SAVE=(()=>{try{return Object.assign({},SAVE_DEF,JSON.parse(localStorage.getItem(SAVE_KEY))||{})}catch(e){return Object.assign({},SAVE_DEF)}})();
const SET=SAVE.set=Object.assign({vol:.8,shake:true,dmg:true,fx:true},SAVE.set||{}); // configurações
let snd=SAVE.snd!==false;
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}}
// guarda a partida em andamento (usado pelo botão Continuar)
function saveRun(){if(!S||S.state!=='play'||S.tut!=null)return;SAVE.run={st:SI,wave:S.wave,coins:S.coins,hp:S.hp,slots:S.slots.slice(),price:S.price,up:S.up};save()}
addEventListener('visibilitychange',()=>{if(document.hidden)saveRun()});
addEventListener('pagehide',saveRun);

// ===== audio =====
// Efeitos sonoros simples (WebAudio)
function beep(f,d,ty='square',v=.03){if(!snd||SET.vol<=0)return;try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v*SET.vol*1.25,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(t+d)}catch(e){}}

// ===== assets =====
// Lista de imagens (chave -> arquivo) e carregamento dos sprites
const IMG={
"t1": "assets/turrets/turret_1.png",
"t2": "assets/turrets/turret_2.png",
"t3": "assets/turrets/turret_3.png",
"t4": "assets/turrets/turret_4.png",
"t5": "assets/turrets/turret_5.png",
"t6": "assets/turrets/turret_6.png",
"t7": "assets/turrets/turret_7.png",
"t8": "assets/turrets/turret_8.png",
"mRun": "assets/forest/mushroom_run.png",
"mHit": "assets/forest/mushroom_hit.png",
"mDie": "assets/forest/mushroom_die.png",
"fFly": "assets/forest/flying_fly.png",
"fHit": "assets/forest/flying_hit.png",
"fDie": "assets/forest/flying_die.png",
"zWalk": "assets/graveyard/zombie_walk.png",
"zHurt": "assets/graveyard/zombie_hurt.png",
"zDead": "assets/graveyard/zombie_dead.png",
"rRun": "assets/graveyard/rat_run.png",
"rHurt": "assets/graveyard/rat_hurt.png",
"rDead": "assets/graveyard/rat_dead.png",
"sWalk": "assets/graveyard/skeleton_walk.png",
"sHurt": "assets/graveyard/skeleton_hurt.png",
"g1bW": "assets/ruins/golem_blue_walk.png",
"g1oW": "assets/ruins/golem_orange_walk.png",
"g1gW": "assets/ruins/golem_green_walk.png",
"g1pW": "assets/ruins/golem_purple_walk.png",
"g1bH": "assets/ruins/golem_blue_hurt.png",
"g1oH": "assets/ruins/golem_orange_hurt.png",
"g1gH": "assets/ruins/golem_green_hurt.png",
"g1pH": "assets/ruins/golem_purple_hurt.png",
"g1bD": "assets/ruins/golem_blue_die.png",
"g1oD": "assets/ruins/golem_orange_die.png",
"g1gD": "assets/ruins/golem_green_die.png",
"g1pD": "assets/ruins/golem_purple_die.png"
};
const load=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(i);i.src=src});
async function loadAssets(){const k=Object.keys(IMG),v=await Promise.all(k.map(n=>load(IMG[n]))),A={};k.forEach((n,i)=>A[n]=v[i]);
TI=[1,2,3,4,5,6,7,8].map(n=>A['t'+n]);
const sh=(k,fw)=>{const im=A[k],n=im.width/fw|0;return{im,fw,fh:64,cols:n,n}};
const g1=c=>({run:sh(c+'W',90),hit:sh(c+'H',90),die:sh(c+'D',90),cx:45,cy:44,vis:38,sh:19,flip:1,fps:8});
SP={mush:{run:sh('mRun',80),hit:sh('mHit',80),die:sh('mDie',80),cx:40,cy:44,vis:36,sh:16},
fly:{run:sh('fFly',64),hit:sh('fHit',64),die:sh('fDie',64),cx:32,cy:35,vis:50,sh:30},
zomb:{run:sh('zWalk',64),hit:sh('zHurt',64),die:sh('zDead',64),cx:32,cy:33,vis:31,sh:15},
rat:{run:sh('rRun',64),hit:sh('rHurt',64),die:sh('rDead',64),cx:32,cy:40,vis:16,sh:7,fps:14},
skel:{run:sh('sWalk',64),hit:sh('sHurt',64),cx:32,cy:32,vis:28,sh:14},
g1b:g1('g1b'),g1o:g1('g1o'),g1g:g1('g1g'),g1p:g1('g1p')}}

// ===== game =====
// Lógica do jogo: compra, evolução, monstros, ondas e entrada do jogador
function init(){$('tut').style.display='none';document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));S={coins:40,hp:10,wave:1,slots:Array(8).fill(0),rec:Array(8).fill(0),cd:Array(8).fill(0),en:[],bu:[],pa:[],tx:[],spawnLeft:6,spawnT:1,price:10,up:0,tut:null,lf:[0,0,0,0],rg:[],flash:0,paused:false,drag:null,state:'play',shake:0,banner:{t:2.2,s:'Fase '+(SI+1)+': '+ST.name},t:0};ui()}
function ui(){$('hCoins').innerHTML=ICON.coin+S.coins;$('hWave').textContent='Onda '+S.wave+'/'+MAXW;$('hHp').innerHTML=ICON.heart+Math.max(0,S.hp);$('buy').innerHTML='Comprar torre '+ICON.coin+S.price;$('buy').disabled=S.state!=='play'||S.coins<S.price||!S.slots.includes(0);const mx=S.up>=7;$('up').innerHTML=mx?'Evolução máxima':ICON.up+'Evoluir torre '+ICON.coin+upCost()+ICON.arrow+'Nv '+(S.up+2);$('up').disabled=S.state!=='play'||mx||S.coins<upCost()}
function upCost(){return 50*(S.up*S.up+S.up+2)}
$('snd').onclick=()=>{snd=!snd;SAVE.snd=snd;save();$('snd').innerHTML=snd?ICON.on:ICON.off};
$('buy').onclick=()=>{const i=S.slots.indexOf(0);if(i<0||S.coins<S.price||S.state!=='play'||S.paused)return;S.coins-=S.price;S.price+=3;S.slots[i]=1+S.up;const[x,y]=slotXY(i);burst(x+40,y+40,COL[S.up],8);beep(440,.1,'triangle');ui()};
$('up').onclick=()=>{if(S.state!=='play'||S.paused||S.up>=7||S.coins<upCost())return;S.coins-=upCost();S.up++;beep(700,.2,'triangle',.05);tx(W/2,H/2+40,'Novas torres: nível '+(S.up+1),'#b99bff');ui()};
function burst(x,y,c,n){if(!SET.fx)n=n/3|0;for(let k=0;k<n;k++){const a=Math.random()*6.28,s=40+Math.random()*130;S.pa.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5+Math.random()*.3,c,r:2+Math.random()*3})}}
function tx(x,y,s,c,z){S.tx.push({x,y,s,c,l:.8,z:z||18})}
function spawn(){const w=S.wave,l=Math.random()*4|0,r=Math.random();let ty=0;
if(S.spawnLeft===1&&w%5===0)ty=3;else if(w>3&&r<.25)ty=2;else if(w>2&&r<.5)ty=1;
const T=ST.T[ty],h0=[4+w*3.5,3+w*2,8+w*7,40+w*30][ty]*ST.hm|0,v0=[24+w*2,52+w*2,16+w,12][ty]*ST.vm;
S.en.push({lane:l,x:W+40,y:rowY(l),hp:h0,max:h0,v:v0,r:T.r,sp:T.k,sc:T.sc,fx:T.fx,ty,fl:0,dt:0,ph:Math.random()*8});S.spawnLeft--;S.spawnT=Math.max(.45,1.3-w*.06)}
function step(dt){
if(S.banner.t>0)S.banner.t-=dt;S.shake=Math.max(0,S.shake-dt*30);
if(S.spawnLeft>0){if((S.spawnT-=dt)<=0)spawn()}
else if(!S.en.length){if(S.wave>=MAXW){win();return}S.wave++;S.spawnLeft=5+S.wave*2;S.spawnT=1.5;S.coins+=S.price*2;S.banner={t:2,s:S.wave===MAXW?'Onda final!':S.wave%5?'Onda '+S.wave:'Chefe! Onda '+S.wave};beep(660,.2,'triangle');if(S.wave%5===0)S.flash=.8;ui();saveRun()}
for(let i=0;i<8;i++){const lv=S.slots[i],ln=i%4;S.rec[i]=Math.max(0,S.rec[i]-dt*6);if(!lv)continue;S.cd[i]-=dt;
if(S.cd[i]<=0&&S.en.some(e=>e.lane===ln&&!e.dying&&e.x<W-10)){S.bu.push({x:slotXY(i)[0]+CELL-4,y:rowY(ln),lane:ln,dmg:lv*lv*1.5+1,c:COL[lv-1],lv});S.cd[i]=Math.max(.16,.7-lv*.06);S.rec[i]=1;S.lf[ln]=1;beep(280+lv*50,.05,'square',.015)}}
for(const b of S.bu){b.x+=560*dt;for(const e of S.en){if(e.lane===b.lane&&!e.dying&&e.x<W&&Math.abs(e.x-b.x)<e.r+4){e.hp-=b.dmg;e.fl=.12;b.dead=1;burst(b.x,b.y,b.c,3);if(SET.dmg&&S.tx.length<40)tx(e.x+Math.random()*10-5,e.y-e.r-14,Math.ceil(b.dmg),'#fff',12);break}}if(b.x>W+10)b.dead=1}
for(const e of S.en){
if(e.dying){e.dt+=dt;if(e.dt>(SP[e.sp].die?SP[e.sp].die.n/20:.45))e.dead=1;continue}
e.x-=e.v*dt;e.fl-=dt;
if(e.hp<=0){e.dying=true;const g=e.ty===3?25:2+(S.wave/2|0)+(e.ty===2?2:0);S.coins+=g;burst(e.x,e.y,'#ffd27a',e.ty===3?30:10);tx(e.x,e.y-e.r-20,'+'+g,'#ffd27a');if(e.ty===3)S.shake=10;beep(190,.1,'sawtooth',.025);ui()}
else if(e.x<LINE){e.dead=1;S.hp-=e.ty===3?3:1;S.shake=8;burst(LINE,e.y,'#ff4f6d',10);beep(90,.25,'sawtooth',.05);ui();if(S.hp<=0)over()}}
S.en=S.en.filter(e=>!e.dead);S.bu=S.bu.filter(b=>!b.dead)}
function slotAt(x,y){const r=Math.floor((y-GY)/CELL);if(r<0||r>3)return -1;if(x>=FX&&x<FX+CELL)return r;if(x>=RX&&x<RX+CELL)return 4+r;return -1}
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
cv.addEventListener('pointerdown',e=>{if(!S||S.state!=='play')return;const[x,y]=pos(e),i=slotAt(x,y);if(i>=0&&S.slots[i])S.drag={i,x,y}});
cv.addEventListener('pointermove',e=>{if(S&&S.drag)[S.drag.x,S.drag.y]=pos(e)});
addEventListener('pointerup',e=>{if(!S||!S.drag)return;const[x,y]=pos(e),j=slotAt(x,y),i=S.drag.i,a=S.slots;
if(j>=0&&j!==i){if(a[j]===a[i]&&a[i]<8){a[j]++;a[i]=0;const[sx,sy]=slotXY(j);burst(sx+40,sy+40,COL[a[j]-1],18);S.rg.push({x:sx+40,y:sy+40,t:.4,c:COL[a[j]-1]});S.shake=3;beep(300+a[j]*90,.18,'triangle',.05)}
else if(!a[j]){a[j]=a[i];a[i]=0}else{[a[i],a[j]]=[a[j],a[i]]}}S.drag=null;ui()});
let last=performance.now();
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;S.t+=dt;
if(S.state==='play'&&S.tut==null&&!S.paused)step(dt);tutCheck();
for(const p of S.pa){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=220*dt;p.l-=dt}S.pa=S.pa.filter(p=>p.l>0);
for(const q of S.tx){q.y-=34*dt;q.l-=dt}S.tx=S.tx.filter(q=>q.l>0);
S.flash=Math.max(0,S.flash-dt);for(let i=0;i<4;i++)S.lf[i]=Math.max(0,S.lf[i]-dt*5);for(const r of S.rg)r.t-=dt;S.rg=S.rg.filter(r=>r.t>0);
draw();requestAnimationFrame(loop)}

// ===== render =====
// Desenho: cenários (em cache + animados), menu, torres e monstros
function rr(x,y,w,h,r,f){ctx.fillStyle=f;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
// ====== Fundo em cache (pintado uma vez por fase) + camadas animadas ======
const BGC={};
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function bgCache(){if(BGC[SI])return BGC[SI];const c=document.createElement('canvas');c.width=W;c.height=H;BGC[SI]=c;paint(c.getContext('2d'),rng(SI*977+13));return c}
function sky(X,k){X.save();
if(k===0){X.fillStyle='#fff6c8';X.shadowColor='#fff6c8';X.shadowBlur=14;X.beginPath();X.arc(W-50,13,8,0,7);X.fill();X.shadowBlur=0;
X.fillStyle='rgba(4,16,10,.92)';for(let x=-10;x<W+20;x+=24){const h=20+(x*7%11);X.beginPath();X.moveTo(x,GY+2);X.lineTo(x+12,GY-h);X.lineTo(x+24,GY+2);X.fill()}
for(let x=6;x<W;x+=30){X.beginPath();X.arc(x,H+2,12,Math.PI,0);X.fill()}}
else if(k===1){X.fillStyle='#e8ecff';X.shadowColor='#b8c6ff';X.shadowBlur=18;X.beginPath();X.arc(W-70,12,15,0,7);X.fill();X.shadowBlur=0;
X.strokeStyle='#080912';X.lineWidth=3;for(const x of[150,310,480]){X.beginPath();X.moveTo(x,GY+2);X.lineTo(x+4,GY-20);X.moveTo(x+4,GY-12);X.lineTo(x-8,GY-24);X.moveTo(x+3,GY-17);X.lineTo(x+14,GY-26);X.stroke()}
X.fillStyle='#080912';for(let x=0;x<W;x+=22){X.fillRect(x,H-5,2,5);X.fillRect(x+8,H-8,2,8)}}
else{const sg=X.createRadialGradient(W-90,GY-6,2,W-90,GY-6,70);sg.addColorStop(0,'rgba(255,170,90,.6)');sg.addColorStop(1,'rgba(255,170,90,0)');X.fillStyle=sg;X.fillRect(0,0,W,GY+10);
X.fillStyle='#2e2026';for(const x of[150,240,360,470,590]){const h=14+(x*3%12);X.fillRect(x,GY-h,14,h+2);X.fillRect(x-3,GY-h-4,20,5)}
for(let x=0;x<W;x+=18)X.fillRect(x,H-5-(x*5%4),12,6)}
X.restore()}
function paint(X,R){
const q=(x,y,w,h,r,f)=>{X.fillStyle=f;X.beginPath();X.roundRect(x,y,w,h,r);X.fill()},el=(x,y,a,b,f)=>{X.fillStyle=f;X.beginPath();X.ellipse(x,y,a,b,0,0,7);X.fill()},k=ST.deco;
let g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,ST.sky[0]);g.addColorStop(1,ST.sky[1]);X.fillStyle=g;X.fillRect(0,0,W,H);
sky(X,k);
for(let r=0;r<4;r++){const y0=GY+r*CELL;X.fillStyle=ST.lane[r%2];X.fillRect(LINE,y0,W-LINE,CELL);
for(let i=0;i<300;i++){X.fillStyle=R()<.5?'rgba(255,255,255,.04)':'rgba(0,0,0,.08)';X.fillRect(LINE+R()*(W-LINE),y0+R()*CELL,1+R()*3,1+R()*2)}
g=X.createLinearGradient(0,y0+CELL/2-22,0,y0+CELL/2+22);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,ST.path);g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(LINE,y0+CELL/2-22,W-LINE,44);
X.fillStyle='rgba(255,255,255,.07)';X.fillRect(LINE,y0,W-LINE,2);X.fillStyle='rgba(0,0,0,.2)';X.fillRect(LINE,y0+CELL-3,W-LINE,3)}
const bx=()=>LINE+14+R()*(W-LINE-30),by=()=>GY+10+R()*300;
if(k===0){
for(let i=0;i<90;i++){const x=bx(),y=by(),h=4+R()*6;X.strokeStyle=R()<.5?ST.dc:'#2a5a38';X.lineWidth=1.5;X.beginPath();X.moveTo(x,y);X.lineTo(x-2,y-h);X.moveTo(x+2,y);X.lineTo(x+3,y-h+1);X.moveTo(x+4,y);X.lineTo(x+6,y-h);X.stroke()}
for(let i=0;i<22;i++){const x=bx(),y=by();X.fillStyle=['#ff8fb1','#ffe27a','#9ad7ff','#fff'][i%4];X.beginPath();X.arc(x,y-6,2,0,7);X.fill();X.strokeStyle='#2a5a38';X.beginPath();X.moveTo(x,y-4);X.lineTo(x,y);X.stroke()}
for(let i=0;i<10;i++){const x=bx(),y=by();el(x+1,y+3,9,3,'rgba(0,0,0,.25)');el(x,y,8,5,'#7c8b84');el(x-2,y-2,4,2,'rgba(255,255,255,.25)')}
for(let i=0;i<9;i++){const x=bx(),y=by();q(x-1.5,y-5,3,6,1,'#efe6cf');X.fillStyle='#e0455a';X.beginPath();X.ellipse(x,y-6,6,4,0,Math.PI,0);X.fill();X.fillStyle='#fff';X.fillRect(x-3,y-8,2,2);X.fillRect(x+1,y-9,2,2)}
}else if(k===1){
for(let i=0;i<7;i++){const x=bx(),y=by();el(x,y,16+R()*14,5,'rgba(120,150,220,.28)');el(x-4,y-1,8,2,'rgba(255,255,255,.2)')}
for(let i=0;i<16;i++){const x=bx(),y=by();el(x,y+1,10,3,'rgba(0,0,0,.3)');X.globalAlpha=.85;if(i%2){q(x-2,y-22,4,22,1,ST.dc);q(x-8,y-16,16,4,1,ST.dc)}else{q(x-9,y-19,18,20,[9,9,2,2],ST.dc);X.fillStyle='#1d2038';X.fillRect(x-1,y-14,2,9);X.fillRect(x-5,y-11,10,2)}X.globalAlpha=1}
for(let i=0;i<14;i++){const x=bx(),y=by();X.strokeStyle='rgba(0,0,0,.3)';X.lineWidth=1;X.beginPath();X.moveTo(x,y);X.lineTo(x+8,y+3);X.lineTo(x+12,y-1);X.stroke()}
for(let i=0;i<6;i++){const x=bx(),y=by();q(x,y,10,3,1,'#d9d4c0');q(x+7,y-2,3,3,1,'#d9d4c0');q(x-2,y+1,3,3,1,'#d9d4c0')}
}else{
for(let r=0;r<4;r++)for(let x=LINE+30;x<W;x+=42){const y0=GY+r*CELL;X.fillStyle=R()<.5?'rgba(0,0,0,'+R()*.1+')':'rgba(255,255,255,'+R()*.05+')';X.fillRect(x-41,y0+1,40,CELL-2)}
X.strokeStyle='rgba(0,0,0,.14)';X.lineWidth=1;X.beginPath();for(let x=LINE+30;x<W;x+=42){X.moveTo(x,GY);X.lineTo(x,GY+320)}X.stroke();
for(let i=0;i<18;i++){const x=bx(),y=by();X.strokeStyle='rgba(0,0,0,.35)';X.beginPath();X.moveTo(x,y);X.lineTo(x+6,y+5);X.lineTo(x+4,y+11);X.lineTo(x+11,y+14);X.stroke()}
for(let i=0;i<12;i++){const x=bx(),y=by();el(x+4,y+4,13,3,'rgba(0,0,0,.28)');q(x-8,y-8,10+R()*10,11,3,ST.dc);q(x-8,y-8,10,3,2,'rgba(255,255,255,.18)')}
for(let i=0;i<6;i++){const x=bx(),y=by();el(x,y,40,6,'rgba(255,225,170,.09)')}}
g=X.createLinearGradient(LINE,0,W,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.4)');X.fillStyle=g;X.fillRect(LINE,GY,W-LINE,320);
X.fillStyle=ST.base;X.fillRect(0,GY,LINE,320);g=X.createLinearGradient(0,0,LINE,0);g.addColorStop(0,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(255,255,255,.07)');X.fillStyle=g;X.fillRect(0,GY,LINE,320);
X.strokeStyle='rgba(255,255,255,.05)';X.lineWidth=1;X.beginPath();for(let y=GY;y<=GY+320;y+=40){X.moveTo(0,y);X.lineTo(LINE,y)}for(let x=0;x<=LINE;x+=40){X.moveTo(x,GY);X.lineTo(x,GY+320)}X.stroke();
X.fillStyle='rgba(255,210,90,.28)';X.fillRect(LINE-16,GY,4,320);X.fillStyle='rgba(0,0,0,.35)';X.fillRect(LINE-12,GY,6,320);
for(let i=0;i<8;i++){const[x,y]=slotXY(i);q(x+3,y+5,CELL-6,CELL-6,15,'rgba(0,0,0,.4)');g=X.createLinearGradient(0,y,0,y+CELL);g.addColorStop(0,'#555b72');g.addColorStop(1,'#2b3044');q(x+4,y+4,CELL-8,CELL-8,14,g);q(x+9,y+9,CELL-18,CELL-18,10,'rgba(0,0,0,.3)');
X.strokeStyle='rgba(255,255,255,.2)';X.lineWidth=1.5;X.beginPath();X.roundRect(x+4.5,y+4.5,CELL-9,CELL-9,13);X.stroke();
X.fillStyle='rgba(255,255,255,.28)';for(const[a,b]of[[10,10],[CELL-10,10],[10,CELL-10],[CELL-10,CELL-10]]){X.beginPath();X.arc(x+a,y+b,2,0,7);X.fill()}
X.fillStyle='rgba(255,210,90,.35)';X.beginPath();X.moveTo(x+CELL-15,y+34);X.lineTo(x+CELL-15,y+46);X.lineTo(x+CELL-8,y+40);X.fill()}
for(let y=GY;y<GY+320;y+=20){if(k===1){q(LINE-2,y,4,20,1,ST.fence[1]);q(LINE-6,y+9,12,3,1,ST.fence[0]);X.fillStyle=ST.fence[1];X.beginPath();X.moveTo(LINE-4,y);X.lineTo(LINE,y-5);X.lineTo(LINE+4,y);X.fill()}
else if(k===2){q(LINE-9,y+1,18,18,3,ST.fence[0]);q(LINE-7,y+3,14,4,2,ST.fence[1])}else{q(LINE-6,y+1,12,18,3,ST.fence[0]);q(LINE-3,y+3,3,14,1,ST.fence[1])}}
X.fillStyle='rgba(0,0,0,.3)';X.fillRect(LINE+8,GY,6,320);
g=X.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,W*.62);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.4)');X.fillStyle=g;X.fillRect(0,0,W,H)}
const AMB=Array.from({length:36},()=>({x:Math.random()*W,y:GY+Math.random()*320,s:Math.random()*6,v:.5+Math.random()}));
function dynBG(){const k=ST.deco,t=S.t;ctx.save();
for(let r=0;r<4;r++)if(S.lf[r]>0){ctx.fillStyle='rgba(255,255,255,'+S.lf[r]*.06+')';ctx.fillRect(LINE,GY+r*CELL,W-LINE,CELL)}
if(k===0){for(let i=0;i<3;i++){ctx.globalAlpha=.05+.03*Math.sin(t*.8+i*2);ctx.fillStyle='#fff6c8';const x=LINE+70+i*150;ctx.beginPath();ctx.moveTo(x,GY);ctx.lineTo(x+40,GY);ctx.lineTo(x-30,GY+320);ctx.lineTo(x-90,GY+320);ctx.fill()}ctx.globalAlpha=1;
AMB.forEach((a,i)=>{if(i%2){const x=((a.x-t*14*a.v)%W+W)%W,y=a.y+Math.sin(t*1.5+a.s)*12;ctx.save();ctx.translate(x,y);ctx.rotate(t*a.v+a.s);ctx.fillStyle=i%4?'#e8a33d':'#7fcf6a';ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(0,0,3.5,1.6,0,0,7);ctx.fill();ctx.restore()}
else{const x=a.x+Math.sin(t*.7+a.s)*18,y=a.y+Math.cos(t*.9+a.s)*10;ctx.globalAlpha=.4+.5*Math.sin(t*3+a.s);ctx.fillStyle='#eaffc0';ctx.shadowColor='#d6ff8a';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,1.8,0,7);ctx.fill();ctx.shadowBlur=0}})}
else if(k===1){ctx.fillStyle='#cfe0ff';for(let i=0;i<4;i++){ctx.globalAlpha=.07;ctx.beginPath();ctx.ellipse((t*14+i*190)%(W+300)-150,GY+55+i*85,160,22,0,0,7);ctx.fill()}
AMB.forEach((a,i)=>{if(i%4)return;const x=a.x+Math.sin(t*.6+a.s)*30,y=a.y+Math.cos(t*.8+a.s)*14;ctx.globalAlpha=.35+.35*Math.sin(t*2+a.s);ctx.fillStyle='#bfe8ff';ctx.shadowColor='#8fd0ff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y,2.4,0,7);ctx.fill();ctx.shadowBlur=0});
ctx.globalAlpha=1;ctx.fillStyle='#05060c';for(let i=0;i<2;i++){const x=((t*55+i*330)%(W+80))-40,y=10+Math.sin(t*2+i)*5,f=Math.sin(t*16+i);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-7,y-7*f,x-13,y+1);ctx.quadraticCurveTo(x-6,y+2,x,y+3);ctx.quadraticCurveTo(x+6,y+2,x+13,y+1);ctx.quadraticCurveTo(x+7,y-7*f,x,y);ctx.fill()}}
else{AMB.forEach(a=>{const x=((a.x-t*(18+a.v*22))%W+W)%W,y=a.y+Math.sin(t*.8+a.s)*8;ctx.globalAlpha=.25+.25*Math.sin(t*2+a.s);ctx.fillStyle='#ffd9a0';ctx.fillRect(x,y,1.5+a.v,1.5+a.v*.6)});
ctx.globalAlpha=1;for(let r=0;r<=4;r++){const y=GY+r*CELL,f=3+Math.sin(t*9+r*2)*1.5,g=ctx.createRadialGradient(LINE+12,y,1,LINE+12,y,26);g.addColorStop(0,'rgba(255,190,90,.5)');g.addColorStop(1,'rgba(255,190,90,0)');ctx.fillStyle=g;ctx.fillRect(LINE-14,y-26,52,52);ctx.fillStyle='#ffc766';ctx.beginPath();ctx.ellipse(LINE+12,y,3,f+2,0,0,7);ctx.fill()}}
ctx.restore()}
function bg(){ctx.drawImage(bgCache(),0,0);dynBG()}
// ====== Fundo do menu: sem o jogo, só tiros de fundo ======
const MT=[],MP=[];let mtT=0;
function menuBG(){const dt=Math.min(.05,Math.max(0,S.t-(menuBG.p||S.t)));menuBG.p=S.t;
let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0716');g.addColorStop(.6,ST.sky[0]);g.addColorStop(1,ST.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;ctx.beginPath();for(let y=0;y<H;y+=36){ctx.moveTo(0,y);ctx.lineTo(W,y)}for(let x=(S.t*20)%48;x<W;x+=48){ctx.moveTo(x,0);ctx.lineTo(x,H)}ctx.stroke();
g=ctx.createRadialGradient(W/2,H/2,10,W/2,H/2,330);g.addColorStop(0,'rgba(255,200,120,.18)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(0,0,0,.5)';for(let x=-20;x<W+20;x+=46){const h=40+((x*13)%30);ctx.beginPath();if(ST.deco===0){continue}else if(ST.deco===1){ctx.roundRect(x+8,H-h,28,h,[14,14,0,0])}else{ctx.rect(x+10,H-h,22,h);ctx.rect(x+6,H-h-5,30,6)}ctx.fill()}
mtT-=dt;if(mtT<=0){mtT=.05+Math.random()*.15;MT.push({x:-60,y:Math.random()*H,v:520+Math.random()*700,len:50+Math.random()*90,c:COL[Math.random()*8|0],w:2+Math.random()*3,vy:(Math.random()-.5)*40})}
for(let i=MT.length-1;i>=0;i--){const b=MT[i];b.x+=b.v*dt;b.y+=b.vy*dt;const g2=ctx.createLinearGradient(b.x-b.len,0,b.x,0);g2.addColorStop(0,'rgba(255,255,255,0)');g2.addColorStop(1,b.c);ctx.fillStyle=g2;ctx.fillRect(b.x-b.len,b.y-b.w/2,b.len,b.w);
ctx.fillStyle='#fff';ctx.shadowColor=b.c;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(b.x,b.y,b.w*.9,0,7);ctx.fill();ctx.shadowBlur=0;
if(b.x>W-6&&!b.h){b.h=1;for(let k=0;k<5;k++){const a=Math.random()*3-1.5;MP.push({x:W-4,y:b.y,vx:-Math.cos(a)*120,vy:Math.sin(a)*140,l:.4,c:b.c})}}
if(b.x-b.len>W)MT.splice(i,1)}
for(let i=MP.length-1;i>=0;i--){const p=MP[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;ctx.globalAlpha=Math.max(0,p.l*2.5);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,3,3);if(p.l<=0)MP.splice(i,1)}ctx.globalAlpha=1;
g=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.65);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
function dragHint(){if(!S.drag)return;const j=slotAt(S.drag.x,S.drag.y);if(j<0||j===S.drag.i)return;const[x,y]=slotXY(j),ok=S.slots[j]===S.slots[S.drag.i]&&S.slots[j]<8;ctx.save();ctx.strokeStyle=ok?'#6ee7a0':'#fff';ctx.lineWidth=3;ctx.globalAlpha=.55+.4*Math.sin(S.t*10);ctx.beginPath();ctx.roundRect(x+3,y+3,CELL-6,CELL-6,14);ctx.stroke();ctx.restore()}
function tower(x,y,lv,a,rec){const im=TI[lv-1],s=Math.min(66/im.width,56/im.height,1.8),w=im.width*s,h=im.height*s,c=COL[lv-1];ctx.save();
if(lv>=4){const p=.5+.5*Math.sin(S.t*3+x),g=ctx.createRadialGradient(x,y,4,x,y,46);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a*(.18+.14*p)*(lv/8+.4);ctx.fillStyle=g;ctx.fillRect(x-48,y-48,96,96)}
ctx.globalAlpha=a*.4;ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y+h/2-2,w*.5,7,0,0,7);ctx.fill();ctx.globalAlpha=a;
ctx.imageSmoothingEnabled=false;ctx.drawImage(im,x-w/2-rec*5,y-h/2-2,w,h);
if(rec>.45){const g=ctx.createRadialGradient(x+w/2-4,y-2,1,x+w/2-4,y-2,16);g.addColorStop(0,'#fff');g.addColorStop(.4,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=a*rec;ctx.fillStyle=g;ctx.fillRect(x+w/2-22,y-18,36,32);ctx.globalAlpha=a}
ctx.fillStyle='#10201a';ctx.beginPath();ctx.arc(x-26,y+26,10,0,7);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(x-26,y+26,8,0,7);ctx.fill();
ctx.fillStyle='#1a1a1a';ctx.font='13px "Lilita One",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lv,x-26,y+27);ctx.restore()}
function mon(e){const A=SP[e.sp];let s,f,al=1;
if(e.dying){if(A.die){s=A.die;f=Math.min(s.n-1,e.dt*20|0)}else{s=A.hit;f=s.n-1;al=Math.max(0,1-e.dt/.45)}}
else if(e.fl>0){s=A.hit;f=Math.max(0,Math.min(s.n-1,(.12-e.fl)*40|0))}else{s=A.run;f=((S.t*(A.fps||10)+e.ph)|0)%s.n}
const sc=e.sc,y=e.y+(e.sp==='fly'?Math.sin(S.t*3+e.ph)*4:0);
ctx.save();ctx.globalAlpha=al;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(e.x,e.y+A.sh*sc,e.r*.9,4+sc,0,0,7);ctx.fill();
if(e.ty===3){const g=ctx.createRadialGradient(e.x,e.y,4,e.x,e.y,e.r*2);g.addColorStop(0,'rgba(255,60,80,.35)');g.addColorStop(1,'rgba(255,60,80,0)');ctx.fillStyle=g;ctx.fillRect(e.x-e.r*2,e.y-e.r*2,e.r*4,e.r*4)}
if(e.fx)ctx.filter=e.fx;ctx.imageSmoothingEnabled=false;
if(A.flip){ctx.translate(e.x,0);ctx.scale(-1,1);ctx.translate(-e.x,0)}
ctx.drawImage(s.im,(f%s.cols)*s.fw,(f/s.cols|0)*s.fh,s.fw,s.fh,e.x-A.cx*sc,y-A.cy*sc,s.fw*sc,s.fh*sc);ctx.restore();
if(!e.dying){const b=Math.max(30,e.r*1.8),by=y-A.vis/2*sc-9,p=Math.max(0,e.hp/e.max);rr(e.x-b/2-1,by-1,b+2,8,4,'rgba(0,0,0,.7)');rr(e.x-b/2,by,Math.max(2,b*p),6,3,p>.5?'#6ee7a0':p>.25?'#ffd23f':'#ff5d5d')}}
function draw(){if(S.state==='menu'){menuBG();return}ctx.save();if(S.shake>0&&SET.shake)ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);bg();
for(let i=0;i<8;i++){const[x,y]=slotXY(i),f=i<4;
if(S.slots[i]&&!(S.drag&&S.drag.i===i))tower(x+40,y+40,S.slots[i],1,S.rec[i])}
S.en.forEach(mon);
for(const b of S.bu){const w=3+(b.lv||1)*.5,g=ctx.createLinearGradient(b.x-34,0,b.x+6,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,b.c);ctx.fillStyle=g;ctx.fillRect(b.x-34,b.y-w/2,40,w);ctx.fillStyle='#fff';ctx.shadowColor=b.c;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(b.x+4,b.y,w*.9,0,7);ctx.fill();ctx.shadowBlur=0}
for(const q of S.rg){const k=1-q.t/.4;ctx.globalAlpha=1-k;ctx.strokeStyle=q.c;ctx.lineWidth=4*(1-k)+1;ctx.beginPath();ctx.arc(q.x,q.y,10+k*46,0,7);ctx.stroke()}ctx.globalAlpha=1;
for(const p of S.pa){ctx.globalAlpha=Math.max(0,p.l*2);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.r,p.r)}ctx.globalAlpha=1;
ctx.font='18px "Lilita One",sans-serif';ctx.textAlign='center';for(const t of S.tx){ctx.globalAlpha=Math.min(1,t.l*2);ctx.font=t.z+'px "Lilita One",sans-serif';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.65)';ctx.strokeText(t.s,t.x,t.y);ctx.fillStyle=t.c;ctx.fillText(t.s,t.x,t.y)}ctx.globalAlpha=1;
dragHint();tutDraw();if(S.drag)tower(S.drag.x,S.drag.y,S.slots[S.drag.i],.9,0);
if(S.state==='play'&&S.tut==null&&S.banner.t>0){ctx.globalAlpha=Math.min(1,S.banner.t);ctx.font='38px "Lilita One",sans-serif';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#10241c';ctx.strokeText(S.banner.s,(LINE+W)/2,H/2);ctx.fillStyle='#ffd27a';ctx.fillText(S.banner.s,(LINE+W)/2,H/2);ctx.globalAlpha=1}
if(S.flash>0){ctx.fillStyle='rgba(255,40,60,'+Math.min(.3,S.flash*.4)+')';ctx.fillRect(0,0,W,H)}
ctx.restore()}

// ===== tutorial =====
// Tutorial interativo da primeira partida
const TUT=[
{t:'Bem-vindo ao <b>Merge Strike</b>! Toque em <b>Comprar torre</b> para colocar sua primeira torre.',hl:'buy',ok:()=>S.slots.some(v=>v)},
{t:'Isso! Agora compre uma <b>segunda torre</b>.',hl:'buy',ok:()=>S.slots.filter(v=>v).length>=2},
{t:'Arraste uma torre <b>sobre a outra</b> para juntar as duas em uma torre mais forte.',ok:()=>S.slots.some(v=>v>=2)},
{t:'Perfeito! Cada torre atira só na <b>própria linha</b>. Os monstros vêm da direita: não deixe passarem da cerca.',btn:'Entendi'},
{t:'Use <b>Evoluir torre</b> quando juntar moedas: as próximas torres já nascem com nível maior.',hl:'up',btn:'Entendi'},
{t:'Objetivo: <b>sobreviva até a onda 25</b>. Você ganha moedas a cada onda. Boa sorte!',btn:'Jogar!'}];
const HAND=new Image();HAND.src='data:image/svg+xml;utf8,'+encodeURIComponent(HAND_SVG);
function clearHl(){document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'))}
function tutShow(){const s=TUT[S.tut];$('tutT').innerHTML=s.t;$('tutB').style.display=s.btn?'':'none';$('tutB').textContent=s.btn||'';$('tut').style.display='block';clearHl();if(s.hl)$(s.hl).classList.add('hl')}
function tutStart(){S.tut=0;tutShow()}
function tutNext(){S.tut++;if(S.tut>=TUT.length)tutEnd();else tutShow()}
function tutEnd(){if(!S)return;S.tut=null;SAVE.tut=true;save();$('tut').style.display='none';clearHl();ui()}
function tutCheck(){if(S&&S.tut!=null&&TUT[S.tut].ok&&TUT[S.tut].ok())tutNext()}
function tutDraw(){if(S.tut!==2)return;const id=[];S.slots.forEach((v,i)=>{if(v)id.push(i)});if(id.length<2)return;
const a=slotXY(id[0]),b=slotXY(id[1]),k=(S.t*.8)%1,e=k<.15?0:k>.85?1:(k-.15)/.7,p=.5+.5*Math.sin(S.t*6);
ctx.save();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.globalAlpha=.4+.5*p;for(const s of[a,b]){ctx.beginPath();ctx.roundRect(s[0]+2,s[1]+2,CELL-4,CELL-4,14);ctx.stroke()}
ctx.globalAlpha=1;ctx.drawImage(HAND,a[0]+40+(b[0]-a[0])*e-12,a[1]+44+(b[1]-a[1])*e,26,32);ctx.restore()}
$('tutB').onclick=tutNext;$('tutSkip').onclick=tutEnd;

// ===== ui =====
// Menus, seleção de fase, fim de jogo e continuar
const MS0='Junte torres, evolua sua defesa e segure a horda!',MAIN=['mT','mS','mBtns','mB'];
const PANELS=['hp','stp','setp','pausep'];
function panel(p){for(const id of MAIN)$(id).style.display=p?'none':'';for(const id of PANELS)$(id).style.display=p===id?'flex':'none'}
function setDim(d){$('menu').classList.toggle('dim',!!d)}
function showMenu(t,s,b,end,nx){$('mT').innerHTML=t;$('mS').textContent=s;$('play').textContent=b;$('mB').textContent=end&&SAVE.bests[SI]?'Melhor onda: '+SAVE.bests[SI]:'';
$('how').style.display=$('set').style.display=end?'none':'';$('home').style.display=end?'':'none';$('next').style.display=nx?'':'none';$('cont').style.display=!end&&SAVE.run?'':'none';mode=end?'end':'main';setDim(end);panel(0);$('menu').style.display='flex'}
function home(){SI=Math.min(SAVE.prog,STAGES.length-1);ST=STAGES[SI];init();S.state='menu';document.body.classList.add('inmenu');ui();showMenu('Merge Strike',MS0,'Jogar',0,0)}
function startStage(i){SI=i;ST=STAGES[i];SAVE.run=null;save();init();document.body.classList.remove('inmenu');$('menu').style.display='none';beep(520,.12,'triangle');if(!SAVE.tut)tutStart()}
function continueRun(){const r=SAVE.run;if(!r||!TI)return;SI=r.st;ST=STAGES[SI];init();
Object.assign(S,{wave:r.wave,coins:r.coins,hp:r.hp,slots:r.slots.slice(),price:r.price,up:r.up,spawnLeft:r.wave===1?6:5+r.wave*2,banner:{t:2,s:r.wave===MAXW?'Onda final!':'Onda '+r.wave}});
ui();document.body.classList.remove('inmenu');$('menu').style.display='none';beep(520,.12,'triangle')}
function showStages(){const c=$('cards');c.innerHTML='';
STAGES.forEach((s,i)=>{const b=document.createElement('button'),ok=i<=SAVE.prog,bw=SAVE.bests[i];b.className='card';b.disabled=!ok;
b.style.background='linear-gradient(160deg,'+s.sky[1]+','+s.lane[0]+')';
b.innerHTML='<span class="ico">'+ICON[ok?s.ico:'lock']+'</span><b>Fase '+(i+1)+'</b><span class="nm">'+s.name+'</span><small>'+(!ok?'Conclua a fase '+i:bw>=MAXW?ICON.check+' Completa':bw?'Melhor: onda '+bw:'Nova!')+'</small>';
b.onclick=()=>startStage(i);c.appendChild(b)});
panel('stp')}
function over(){S.state='over';ui();if(S.wave>SAVE.bests[SI])SAVE.bests[SI]=S.wave;SAVE.run=null;save();showMenu('Fim de<br>jogo','Você chegou à onda '+S.wave+'.','Jogar de novo',1,0)}
function win(){S.state='win';ui();SAVE.bests[SI]=MAXW;SAVE.prog=Math.max(SAVE.prog,SI+1);SAVE.run=null;save();const nx=SI+1<STAGES.length;
showMenu('Fase '+(SI+1)+'<br>completa!','Você venceu as '+MAXW+' ondas!'+(nx?'':' Mais fases em breve.'),'Jogar de novo',1,nx)}
$('play').onclick=()=>{if(!TI)return;if(mode==='main')showStages();else startStage(SI)};
$('cont').onclick=continueRun;$('home').onclick=home;$('hpBack').onclick=home;$('stBack').onclick=home;
$('next').onclick=()=>startStage(SI+1);$('how').onclick=()=>panel('hp');
$('tutBtn').onclick=()=>{SAVE.tut=false;startStage(0)};

// ---- Pausa (botão de 3 traços ou tecla P / Esc) ----
function pause(){if(!S||S.state!=='play'||S.paused)return;S.paused=true;setDim(1);panel('pausep');$('menu').style.display='flex'}
function resume(){if(!S||!S.paused)return;S.paused=false;$('menu').style.display='none'}
$('pz').onclick=()=>S&&S.paused?resume():pause();
$('pzRes').onclick=resume;$('pzRst').onclick=()=>{S.paused=false;startStage(SI)};$('pzQuit').onclick=()=>{saveRun();home()};
addEventListener('keydown',e=>{const k=(e.key||'').toLowerCase();if(k==='p'||k==='escape'){e.preventDefault();if(S&&S.paused)resume();else pause()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
// ---- Configurações ----
let setFrom=0,rs=0;
function openSet(from){setFrom=from;$('sVol').value=Math.round(SET.vol*100);$('sVolV').textContent=Math.round(SET.vol*100)+'%';$('sShake').checked=SET.shake;$('sDmg').checked=SET.dmg;$('sFx').checked=SET.fx;$('sReset').textContent='Apagar progresso';panel('setp')}
$('set').onclick=()=>openSet(0);$('pzSet').onclick=()=>openSet('pausep');
$('setBack').onclick=()=>setFrom==='pausep'?panel('pausep'):panel(0);
$('sVol').oninput=e=>{SET.vol=e.target.value/100;$('sVolV').textContent=e.target.value+'%';save()};
$('sVol').onchange=()=>beep(600,.1,'triangle',.05);
$('sShake').onchange=e=>{SET.shake=e.target.checked;save()};
$('sDmg').onchange=e=>{SET.dmg=e.target.checked;save()};
$('sFx').onchange=e=>{SET.fx=e.target.checked;save()};
$('sFull').onclick=()=>{const d=document.documentElement;if(document.fullscreenElement)document.exitFullscreen();else if(d.requestFullscreen)d.requestFullscreen().catch(()=>{})};
$('sReset').onclick=()=>{if(!rs){rs=1;$('sReset').textContent='Tem certeza? Toque de novo';setTimeout(()=>{if(rs){rs=0;$('sReset').textContent='Apagar progresso'}},3000);return}
Object.assign(SAVE,{bests:[0,0,0],prog:0,tut:false,run:null});save();rs=0;$('sReset').textContent='Progresso apagado'};

// ===== main =====
// Inicialização
function fit(){const r=$('stage').getBoundingClientRect(),k=Math.min(r.width/W,r.height/H),s=$('wrap').style;s.width=W*k+'px';s.height=H*k+'px'}
addEventListener('resize',fit);
(async()=>{await loadAssets();$('snd').innerHTML=snd?ICON.on:ICON.off;$('hint').innerHTML=ICON.rotate+' Gire o celular para jogar deitado';home();fit();requestAnimationFrame(loop)})();
fit();

