const $=id=>document.getElementById(id);
const HALL=12,touch=matchMedia("(pointer:coarse)").matches,rnd=Math.random;
let zc=0;const R=ROOMS.map(([k,name,sub,d])=>{const r={k,name,sub,d,z0:zc,z1:zc-d};zc-=d;return r});
const LEN=-zc,DIV=R.slice(0,-1).map(r=>r.z1),BENCH=R.slice(1).map(r=>r.z0-r.d/2);
const roomAt=z=>{const i=R.findIndex(r=>z<=r.z0&&z>r.z1);return i<0?R.length-1:i};
const shade=(hex,p)=>{const n=parseInt(hex.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(v+p*(p<0?v:255-v))));return"#"+[16,8,0].map(s=>f((n>>s)&255).toString(16).padStart(2,"0")).join("")};
const ren=new THREE.WebGLRenderer({canvas:$("c"),antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.outputEncoding=THREE.sRGBEncoding;
const sc=new THREE.Scene();sc.background=new THREE.Color(0x3a2c1e);sc.fog=new THREE.Fog(0x3a2c1e,16,75);
const cam=new THREE.PerspectiveCamera(72,1,.1,100);cam.rotation.order="YXZ";cam.position.set(0,1.65,-2);
const mk=(w,h,f)=>{const c=document.createElement("canvas");c.width=w;c.height=h;f(c.getContext("2d"),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t.canvas=c;return t};
const mat=o=>new THREE.MeshStandardMaterial(o);
const box=(w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);sc.add(b);return b};
const tm=mat({color:0x8a6d3e,metalness:.5,roughness:.45}),glow=new THREE.MeshBasicMaterial({color:0xffe2a8}),wood=mat({color:0x2e1d12,roughness:.7});const TL=new THREE.TextureLoader();
function slugify(name){return name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function loadPortrait(m,slug,onReady){const exts=["jpg","jpeg","png"];let i=0;const next=()=>{if(i>=exts.length)return;const ext=exts[i++];const url="images/"+slug+"."+ext;TL.load(url,ph=>{ph.encoding=THREE.sRGBEncoding;m.map=ph;m.emissiveMap=ph;m.emissiveIntensity=.35;m.needsUpdate=true;onReady&&onReady(url)},undefined,next)};next()}
// warm wood floor
const ft=mk(512,512,(g,w,h)=>{const cs=["#45301f","#4d3521","#3b2618","#523a26"];for(let i=0;i<8;i++){g.fillStyle=cs[i%4];g.fillRect(0,i*64,w,64);for(let j=0;j<40;j++){g.strokeStyle=`rgba(40,22,10,${rnd()*.12})`;const y=i*64+rnd()*64;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd()*6-3,w*.6,y+rnd()*6-3,w,y);g.stroke()}g.fillStyle="rgba(30,15,5,.5)";g.fillRect(0,i*64,w,2);g.fillRect((i*137)%w,i*64,2,64)}});
ft.wrapS=ft.wrapT=THREE.RepeatWrapping;ft.repeat.set(HALL/4,LEN/4);
const fl=new THREE.Mesh(new THREE.PlaneGeometry(HALL,LEN),mat({map:ft,roughness:.55,emissive:0x2a1a10}));fl.rotation.x=-Math.PI/2;fl.position.set(0,0,-LEN/2);sc.add(fl);
const ce=new THREE.Mesh(new THREE.PlaneGeometry(HALL,LEN),mat({color:0x4a3a28,roughness:1,emissive:0x241a10}));ce.rotation.x=Math.PI/2;ce.position.set(0,4.2,-LEN/2);sc.add(ce);
// rooms
const wms=R.map(r=>mat({color:WINGS[r.k].wall,roughness:.9,emissive:WINGS[r.k].wall,emissiveIntensity:.18}));
R.forEach((r,i)=>{const w=WINGS[r.k],cz=r.z0-r.d/2,em=mat({color:w.hi,emissive:w.hi,emissiveIntensity:.35,metalness:.3,roughness:.5});
 for(const s of[-1,1]){box(.2,4.2,r.d,wms[i],s*HALL/2,2.1,cz);box(.3,1,r.d,wood,s*(HALL/2-.05),.5,cz);box(.36,.06,r.d,em,s*(HALL/2-.1),1.02,cz)}
 box(4.6,.02,r.d-1,mat({color:0xa88549,roughness:.8}),0,.008,cz);box(4.2,.02,r.d-1.4,mat({color:w.rug,roughness:.95}),0,.014,cz);
 const lc=new THREE.Color(w.hi).lerp(new THREE.Color(0xffe6c0),.55);for(const dz of r.d>12?[-r.d/4,r.d/4]:[0]){const l=new THREE.PointLight(lc,1.5,22,1.2);l.position.set(0,3.4,cz+dz);sc.add(l)}box(2.4,.06,.5,glow,0,4.15,cz);for(let z=r.z0-1;z>r.z1+.4;z-=3)box(HALL,.22,.24,wood,0,4.08,z);for(const s of[-1,1])box(.34,.3,r.d,wood,s*(HALL/2-.12),4.02,cz)});
box(HALL,4.2,.2,wms[0],0,2.1,0);box(HALL,4.2,.2,wms[R.length-1],0,2.1,-LEN);
// doorways between rooms, with the next room's name over each door
function wrap(g,t,x,y,mw,lh){let l="";for(const w of t.split(" ")){const s=l?l+" "+w:w;if(g.measureText(s).width>mw&&l){g.fillText(l,x,y);y+=lh;l=w}else l=s}g.fillText(l,x,y);return y+lh}
function banner(t,s,c){return mk(1024,160,(g,w,h)=>{g.textAlign="center";g.fillStyle=c;g.font="700 76px Georgia,serif";g.fillText(t,w/2,84);g.fillStyle="#e9dfd0";g.font="30px Georgia,serif";g.fillText(s,w/2,130)})}
function plaque(n,r,y){return mk(512,128,(g,w,h)=>{g.fillStyle="#1a1310";g.fillRect(0,0,w,h);g.strokeStyle="#9c7d3e";g.lineWidth=3;g.strokeRect(4,4,w-8,h-8);g.fillStyle="#f3ecdf";g.textAlign="center";
let s=40;g.font=`700 ${s}px Georgia,serif`;while(g.measureText(n).width>w-40)g.font=`700 ${--s}px Georgia,serif`;g.fillText(n,w/2,58);g.fillStyle="#d9b25f";g.font="24px Georgia,serif";g.fillText(r+(y?", "+y:""),w/2,98)})}
DIV.forEach((z,i)=>{const nx=R[i+1],nm=wms[i+1];
 for(const s of[-1,1])box(4.3,4.2,.3,nm,s*3.85,2.1,z);
 box(3.4,1,.3,wood,0,3.7,z);for(const s of[-1,1])box(.12,3.2,.36,tm,s*1.7,1.6,z);box(3.5,.08,.36,tm,0,3.2,z);
 const b=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.5),new THREE.MeshBasicMaterial({map:banner(nx.name,nx.sub,WINGS[nx.k].hi),transparent:true}));b.position.set(0,3.7,z+.17);sc.add(b)});
// foyer timeline panels
function tlPanel(title,rows){return mk(640,880,(g,w,h)=>{g.fillStyle="#efe0c2";g.fillRect(0,0,w,h);for(let k=0;k<1500;k++){g.fillStyle=`rgba(120,80,40,${rnd()*.06})`;g.fillRect(rnd()*w,rnd()*h,3,3)}g.strokeStyle="#8a6420";g.lineWidth=4;g.strokeRect(14,14,w-28,h-28);g.textAlign="left";g.fillStyle="#3a2416";g.font="700 44px Georgia,serif";g.fillText(title,44,88);let y=160;for(const[yr,t]of rows){g.fillStyle="#8a4a1a";g.font="700 40px Georgia,serif";g.fillText(yr,44,y);g.fillStyle="#3a2416";g.font="30px Georgia,serif";y=wrap(g,t,44,y+42,w-88,38)+34}})}
[["Growing up",TIMELINE.slice(0,4),-1],["Abroad and home",TIMELINE.slice(4),1]].forEach(([t,rows,s])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(2.7,3.7),new THREE.MeshBasicMaterial({map:tlPanel(t,rows)}));m.position.set(s*(HALL/2-.12),2.15,-4.5);m.rotation.y=-s*Math.PI/2;sc.add(m)});
// benches
BENCH.forEach(z=>{const cu=mat({color:0x8a3a2a,roughness:1});box(2.2,.14,.7,cu,0,.55,z);box(2.3,.08,.78,wood,0,.46,z);box(.12,.46,.6,wood,-1,.23,z);box(.12,.46,.6,wood,1,.23,z)});
sc.add(new THREE.AmbientLight(0xc2a988,1.05));sc.add(new THREE.HemisphereLight(0xffe6c0,0x5a4230,.8));
// painterly portraits, driven by each person's look
function paint(i,col){const L=LOOKS[i],skin={e:["#d9b48f","#8c6446"],f:["#e6cbb0","#a9805f"],a:["#dcbc98","#9a7452"]}[L.s];
return mk(256,320,g=>{const bg=g.createRadialGradient(80,100,10,128,170,260);bg.addColorStop(0,shade(col,.05));bg.addColorStop(1,shade(col,-.8));g.fillStyle=bg;g.fillRect(0,0,256,320);
for(let k=0;k<70;k++){g.strokeStyle=rnd()<.6?`rgba(15,8,4,${rnd()*.14})`:`rgba(230,200,150,${rnd()*.04})`;g.lineWidth=6+rnd()*16;g.beginPath();const x=rnd()*256,y=rnd()*320;g.moveTo(x,y);g.quadraticCurveTo(x+rnd()*60-30,y+rnd()*40-20,x+rnd()*80-40,y+rnd()*60-30);g.stroke()}
const fy=128,rx=38,ry=50,dk=shade(L.d,-.3);g.fillStyle=L.h;
if(L.st==="long"){g.beginPath();g.moveTo(70,110);g.quadraticCurveTo(40,250,60,320);g.lineTo(196,320);g.quadraticCurveTo(216,250,186,110);g.fill()}else{g.beginPath();g.ellipse(128,fy-10,rx+14,ry+16,0,0,7);g.fill()}
if(L.st==="bun"||L.st==="updo"){g.beginPath();g.arc(128,fy-70,24,0,7);g.fill()}
const dg=g.createLinearGradient(0,214,0,320);dg.addColorStop(0,dk);dg.addColorStop(1,shade(dk,-.6));g.fillStyle=dg;g.beginPath();g.moveTo(14,320);g.quadraticCurveTo(24,224,128,214);g.quadraticCurveTo(232,224,242,320);g.fill();
g.fillStyle="rgba(0,0,0,.35)";g.beginPath();g.moveTo(150,214);g.quadraticCurveTo(232,224,242,320);g.lineTo(190,320);g.fill();
g.fillStyle=L.bl?"#d8cdb6":"#cfc2a8";g.beginPath();g.moveTo(98,216);g.lineTo(128,258);g.lineTo(158,216);g.quadraticCurveTo(128,204,98,216);g.fill();
g.fillStyle=skin[1];g.fillRect(114,fy+30,28,52);
const sk=g.createRadialGradient(108,fy-18,6,128,fy,64);sk.addColorStop(0,skin[0]);sk.addColorStop(1,skin[1]);g.fillStyle=sk;g.beginPath();g.ellipse(128,fy,rx,ry,0,0,7);g.fill();
g.save();g.beginPath();g.ellipse(128,fy,rx,ry,0,0,7);g.clip();const sh=g.createLinearGradient(112,0,170,0);sh.addColorStop(0,"rgba(25,12,6,0)");sh.addColorStop(1,"rgba(25,12,6,.55)");g.fillStyle=sh;g.fillRect(80,fy-60,100,130);g.restore();
g.fillStyle=L.h;g.beginPath();g.ellipse(128,fy-40,rx+4,26,0,3.3,6.1);g.fill();
if(L.st==="hat"){g.fillStyle=shade(L.d,-.4);g.beginPath();g.ellipse(128,fy-52,72,15,0,0,7);g.fill();g.fillStyle=dk;g.beginPath();g.ellipse(128,fy-62,44,30,0,3.14,6.28);g.fill()}
g.strokeStyle=L.h;g.lineWidth=3;g.beginPath();g.moveTo(104,fy-13);g.quadraticCurveTo(113,fy-19,122,fy-14);g.moveTo(134,fy-14);g.quadraticCurveTo(143,fy-19,152,fy-13);g.stroke();
g.fillStyle="rgba(30,15,10,.85)";g.beginPath();g.ellipse(114,fy-4,5,2.3,0,0,7);g.ellipse(142,fy-4,5,2.3,0,0,7);g.fill();g.fillStyle="rgba(255,240,220,.55)";g.fillRect(112,fy-5.5,1.6,1.4);g.fillRect(140,fy-5.5,1.6,1.4);
g.strokeStyle="rgba(90,50,35,.35)";g.lineWidth=2;g.beginPath();g.moveTo(129,fy-2);g.quadraticCurveTo(125,fy+10,122,fy+15);g.stroke();
g.strokeStyle="rgba(110,55,45,.75)";g.lineWidth=2.2;g.beginPath();g.moveTo(118,fy+28);g.quadraticCurveTo(128,fy+31,138,fy+28);g.stroke();
if(L.fr){g.fillStyle="rgba(130,80,45,.4)";for(let k=0;k<14;k++){g.beginPath();g.arc(108+rnd()*40,fy+6+rnd()*14,1.1,0,7);g.fill()}}
for(let k=0;k<3000;k++){g.fillStyle=rnd()<.5?`rgba(255,235,200,${rnd()*.05})`:`rgba(30,15,8,${rnd()*.08})`;g.fillRect(rnd()*256,rnd()*320,2,2)}
g.strokeStyle="rgba(20,10,0,.2)";g.lineWidth=.6;for(let k=0;k<26;k++){let x=rnd()*256,y=rnd()*320;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){x+=rnd()*22-11;y+=rnd()*22-11;g.lineTo(x,y)}g.stroke()}
const vg=g.createRadialGradient(128,160,80,128,160,220);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.7)");g.fillStyle=vg;g.fillRect(0,0,256,320);g.fillStyle="rgba(120,80,30,.14)";g.fillRect(0,0,256,320)})}
function paintRizal(col){return mk(256,320,g=>{
const bg=g.createRadialGradient(90,90,10,128,170,260);bg.addColorStop(0,shade(col,.1));bg.addColorStop(1,shade(col,-.8));g.fillStyle=bg;g.fillRect(0,0,256,320);
for(let k=0;k<70;k++){g.strokeStyle=rnd()<.6?`rgba(15,8,4,${rnd()*.14})`:`rgba(230,200,150,${rnd()*.04})`;g.lineWidth=6+rnd()*16;g.beginPath();const x=rnd()*256,y=rnd()*320;g.moveTo(x,y);g.quadraticCurveTo(x+rnd()*60-30,y+rnd()*40-20,x+rnd()*80-40,y+rnd()*60-30);g.stroke()}
const fy=124,rx=36,ry=46;
const sg=g.createLinearGradient(0,190,0,320);sg.addColorStop(0,"#1c1a17");sg.addColorStop(1,"#050505");g.fillStyle=sg;g.beginPath();g.moveTo(46,320);g.quadraticCurveTo(60,196,128,182);g.quadraticCurveTo(196,196,210,320);g.fill();
g.fillStyle="#0a0908";g.beginPath();g.moveTo(108,196);g.lineTo(128,260);g.lineTo(100,320);g.lineTo(78,320);g.lineTo(96,200);g.fill();g.beginPath();g.moveTo(148,196);g.lineTo(128,260);g.lineTo(156,320);g.lineTo(178,320);g.lineTo(160,200);g.fill();
g.fillStyle="#f1ece0";g.beginPath();g.moveTo(112,196);g.lineTo(128,232);g.lineTo(144,196);g.quadraticCurveTo(128,188,112,196);g.fill();
g.fillStyle="#141313";g.beginPath();g.moveTo(118,208);g.lineTo(128,216);g.lineTo(138,208);g.lineTo(134,222);g.lineTo(122,222);g.fill();
const skin=["#e8c8a4","#a9805f"];g.fillStyle=skin[1];g.fillRect(114,fy+26,28,40);
const sk=g.createRadialGradient(112,fy-16,6,128,fy,64);sk.addColorStop(0,skin[0]);sk.addColorStop(1,skin[1]);g.fillStyle=sk;g.beginPath();g.ellipse(128,fy,rx,ry,0,0,7);g.fill();
g.save();g.beginPath();g.ellipse(128,fy,rx,ry,0,0,7);g.clip();const sh=g.createLinearGradient(112,0,168,0);sh.addColorStop(0,"rgba(20,10,5,0)");sh.addColorStop(1,"rgba(20,10,5,.5)");g.fillStyle=sh;g.fillRect(80,fy-56,100,120);g.restore();
g.fillStyle="#12100d";g.beginPath();g.ellipse(128,fy-34,rx+6,24,0,3.3,6.1);g.fill();g.beginPath();g.moveTo(96,fy-44);g.quadraticCurveTo(128,fy-58,160,fy-44);g.quadraticCurveTo(150,fy-30,128,fy-32);g.quadraticCurveTo(108,fy-30,96,fy-44);g.fill();
g.strokeStyle="#12100d";g.lineWidth=3;g.beginPath();g.moveTo(104,fy-14);g.quadraticCurveTo(113,fy-19,122,fy-14);g.moveTo(134,fy-14);g.quadraticCurveTo(143,fy-19,152,fy-14);g.stroke();
g.fillStyle="rgba(30,15,10,.85)";g.beginPath();g.ellipse(114,fy-4,5,2.4,0,0,7);g.ellipse(142,fy-4,5,2.4,0,0,7);g.fill();g.fillStyle="rgba(255,240,220,.6)";g.fillRect(112,fy-5.5,1.6,1.4);g.fillRect(140,fy-5.5,1.6,1.4);
g.strokeStyle="rgba(90,50,35,.35)";g.lineWidth=2;g.beginPath();g.moveTo(129,fy-2);g.quadraticCurveTo(125,fy+10,122,fy+15);g.stroke();
g.fillStyle="#15120e";g.beginPath();g.moveTo(112,fy+22);g.quadraticCurveTo(120,fy+18,128,fy+21);g.quadraticCurveTo(136,fy+18,144,fy+22);g.quadraticCurveTo(136,fy+27,128,fy+25);g.quadraticCurveTo(120,fy+27,112,fy+22);g.fill();
g.strokeStyle="rgba(110,55,45,.7)";g.lineWidth=2;g.beginPath();g.moveTo(120,fy+29);g.quadraticCurveTo(128,fy+32,136,fy+29);g.stroke();
for(let k=0;k<3000;k++){g.fillStyle=rnd()<.5?`rgba(255,235,200,${rnd()*.05})`:`rgba(30,15,8,${rnd()*.08})`;g.fillRect(rnd()*256,rnd()*320,2,2)}
g.strokeStyle="rgba(20,10,0,.2)";g.lineWidth=.6;for(let k=0;k<26;k++){let x=rnd()*256,y=rnd()*320;g.beginPath();g.moveTo(x,y);for(let j=0;j<5;j++){x+=rnd()*22-11;y+=rnd()*22-11;g.lineTo(x,y)}g.stroke()}
const vg=g.createRadialGradient(128,160,80,128,160,220);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.7)");g.fillStyle=vg;g.fillRect(0,0,256,320);g.fillStyle="rgba(120,80,30,.14)";g.fillRect(0,0,256,320)})}
const items=[],BL=[];
const brass=mat({color:0xb08d45,metalness:.8,roughness:.3}),velvet=mat({color:0x7a1f2b,roughness:.9});
function barrier(x0,z0,x1,z1){for(const[x,z]of[[x0,z0],[x1,z1]]){const P=(geo,y)=>{const o=new THREE.Mesh(geo,brass);o.position.set(x,y,z);sc.add(o)};P(new THREE.CylinderGeometry(.2,.22,.05,20),.025);P(new THREE.CylinderGeometry(.03,.03,.95,10),.5);P(new THREE.SphereGeometry(.07,12,8),1.0)}
const pts=[0,.25,.5,.75,1].map(t=>new THREE.Vector3(x0+(x1-x0)*t,.94-Math.sin(Math.PI*t)*.13,z0+(z1-z0)*t));sc.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.025,8,false),velvet))}
R.forEach((r,ri)=>{if(!ri)return;const ps=P.map((p,i)=>[p,i]).filter(([p])=>p[0]===r.k),n=ps.length,last=ri===R.length-1,nl=last?0:Math.ceil(n/2),nr=last?0:n-nl,sl=[];
 for(let k=0;k<nl;k++)sl.push([-HALL/2+.15,r.z0-r.d*(k+1)/(nl+1),Math.PI/2,1.15]);
 for(let k=0;k<nr;k++)sl.push([HALL/2-.15,r.z0-r.d*(k+1)/(nr+1),-Math.PI/2,1.15]);
 if(last)sl.push([0,r.z1+.15,0,1.3]);
 ps.forEach(([p,i],k)=>{const[x,z,ry,sz]=sl[k],g=new THREE.Group(),tx=paint(i,WINGS[r.k].tint);
 g.add(new THREE.Mesh(new THREE.BoxGeometry(2.1,2.55,.1),wood));
 const fr=new THREE.Mesh(new THREE.BoxGeometry(1.9,2.35,.14),tm);fr.position.z=.02;g.add(fr);
 const imMat=mat({map:tx,emissiveMap:tx,emissive:0xffffff,emissiveIntensity:.6,roughness:.8});
 const im=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.02),imMat);im.position.z=.1;g.add(im);
 const slug=slugify(p[1]);
 const obj={p,g,tx,seen:false,room:ri,photo:null};
 loadPortrait(imMat,slug,url=>obj.photo=url);
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({map:plaque(p[1],p[2],p[3])}));pl.position.set(0,-1.5,.09);g.add(pl);
 const lamp=new THREE.Mesh(new THREE.BoxGeometry(.9,.06,.14),glow);lamp.position.set(0,1.3,.14);g.add(lamp);
  g.scale.setScalar(sz);g.position.set(x,2.3,z);g.rotation.y=ry;sc.add(g);items.push(obj);if(Math.abs(x)>1){const s=Math.sign(x),bx=s*4.4,h=1.45;barrier(bx,z-h,bx,z+h);BL.push({x0:s>0?4.05:-6.5,x1:s>0?6.5:-4.05,z0:z-h-.1,z1:z+h+.1})}else{const zb=z+1.75;barrier(-1.7,zb,1.7,zb);BL.push({x0:-1.8,x1:1.8,z0:-LEN-1,z1:zb+.1})}})});
// hero portrait — Dr. Jose Rizal, mounted behind the spawn point, roped off like the rest
{const heroTx=paintRizal(WINGS.f.tint),heroP=["f",RIZAL[0],RIZAL[1],RIZAL[2],RIZAL[3],RIZAL[4],RIZAL[5],RIZAL[6],RIZAL[7]];
 const g=new THREE.Group();
 g.add(new THREE.Mesh(new THREE.BoxGeometry(2.3,2.75,.1),wood));
 const fr=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.55,.14),tm);fr.position.z=.02;g.add(fr);
 const heroMat=mat({map:heroTx,emissiveMap:heroTx,emissive:0xffffff,emissiveIntensity:.6,roughness:.8});
 const im=new THREE.Mesh(new THREE.PlaneGeometry(1.78,2.2),heroMat);im.position.z=.1;g.add(im);
 const heroObj={p:heroP,g,tx:heroTx,seen:false,room:0,hero:true,photo:null};
 loadPortrait(heroMat,"jose-rizal",url=>heroObj.photo=url);
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.78,.46),new THREE.MeshBasicMaterial({map:plaque(RIZAL[0],RIZAL[1],RIZAL[2])}));pl.position.set(0,-1.62,.09);g.add(pl);
 const lamp=new THREE.Mesh(new THREE.BoxGeometry(1,.06,.14),glow);lamp.position.set(0,1.42,.14);g.add(lamp);
 g.scale.setScalar(1.15);g.position.set(0,2.3,-.15);g.rotation.y=Math.PI;sc.add(g);
 items.push(heroObj);
 barrier(-1.9,-1.3,1.9,-1.3);BL.push({x0:-2,x1:2,z0:-1.3,z1:.5});}
// room name and progress in the HUD
let hudRoom=-1;
function setRoomHud(i){if(i===hudRoom)return;hudRoom=i;const r=R[i];$("room").textContent=r.name+": "+r.sub;$("room").style.color=WINGS[r.k].hi;upd()}
function drawMapRooms(){R.forEach((r,i)=>{const y=4+(-r.z0/LEN)*172,h=r.d/LEN*172;mg.fillStyle=WINGS[r.k].hi+(i===hudRoom?"66":"26");mg.fillRect(7,y+.5,50,h-1)})}
// controls
let yaw=0,pitch=0,locked=false,started=false,panel=false,near=null,vx=0,vz=0,bob=0;const K={};
const kmap={KeyW:"f",ArrowUp:"f",KeyS:"b",ArrowDown:"b",KeyA:"l",KeyD:"r",ArrowLeft:"tl",ArrowRight:"tr",ShiftLeft:"sp"};
addEventListener("keydown",e=>{if(panel){if(e.code==="KeyE"||e.code==="Escape"){e.preventDefault();closeP()}return}if(kmap[e.code]){K[kmap[e.code]]=1;e.preventDefault()}else if(e.code==="KeyE"&&near)show(near)});
addEventListener("keyup",e=>{if(kmap[e.code])K[kmap[e.code]]=0});
const lock=()=>{if(!touch)try{$("c").requestPointerLock()}catch(x){}};
$("go").onclick=()=>{started=true;$("start").style.display="none";ui(true);lock()};
document.addEventListener("pointerlockchange",()=>{locked=document.pointerLockElement===$("c");if(!locked&&started&&!panel&&!touch){$("go").textContent="Resume";$("start").style.display="grid"}});
addEventListener("mousemove",e=>{if(locked||(started&&!panel&&!touch&&(e.buttons&1))){yaw-=e.movementX*.0022;pitch=Math.max(-1.2,Math.min(1.2,pitch-e.movementY*.0022))}});
$("c").addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"){if(!locked&&started)lock();else if(near&&!panel)show(near)}});
const T={};let J={x:0,y:0};
addEventListener("pointerdown",e=>{if(e.pointerType!=="touch"||!started||panel||e.target.tagName==="BUTTON")return;T[e.pointerId]={x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,m:e.clientX<innerWidth/2}});
addEventListener("pointermove",e=>{const t=T[e.pointerId];if(!t)return;if(t.m){J.x=Math.max(-1,Math.min(1,(e.clientX-t.x0)/50));J.y=Math.max(-1,Math.min(1,(e.clientY-t.y0)/50))}else{yaw-=(e.clientX-t.x)*.005;pitch=Math.max(-1.1,Math.min(1.1,pitch-(e.clientY-t.y)*.005));t.x=e.clientX;t.y=e.clientY}});
const end=e=>{const t=T[e.pointerId];if(t&&t.m)J={x:0,y:0};delete T[e.pointerId]};addEventListener("pointerup",end);addEventListener("pointercancel",end);
$("act").onclick=()=>near&&show(near);
function ui(on){for(const id of ["hud","map","cross"])$(id).style.display=on?"block":"none"}
function show(it){panel=true;it.seen=true;upd();document.exitPointerLock&&document.exitPointerLock();for(const k in K)K[k]=0;J={x:0,y:0};const p=it.p;
$("card").innerHTML=`<img alt="" src="${it.photo||it.tx.canvas.toDataURL()}"><h2>${p[1]}</h2><p class="m">${p[4]}${p[3]?" ("+p[3]+")":""}</p><h4>Museum plaque</h4><p>${p[5]}</p><h4>Personal background</h4><p>${p[6]}</p><h4>${p[8]||"Connection to Rizal"}</h4><p>${p[7]}</p><button id="cl">Keep walking</button>`;
$("panel").style.display="grid";$("act").style.display="none";$("cl").onclick=closeP;$("cl").focus()}
function closeP(){panel=false;$("panel").style.display="none";lock()}
function upd(){const n=items.filter(i=>i.seen&&!i.hero).length,rs=items.filter(i=>i.room===hudRoom&&!i.hero),rn=rs.filter(i=>i.seen).length;$("seen").textContent=n===P.length?"You have visited all "+P.length+" portraits.":`Seen ${n} of ${P.length} portraits`+(rs.length?` (${rn} of ${rs.length} in this room)`:"")}
function size(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener("resize",size);size();
const blocked=(x,z)=>Math.abs(x)>HALL/2-.6||z>-.6||z<-LEN+.8||DIV.some(d=>Math.abs(z-d)<.55&&Math.abs(x)>1.6)||BENCH.some(b=>Math.abs(x)<1.5&&Math.abs(z-b)<.75)||BL.some(b=>x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1);
const mg=$("map").getContext("2d");let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
if(started&&!panel){yaw+=((K.tl?1:0)-(K.tr?1:0))*1.8*dt;
const f=(K.f?1:0)-(K.b?1:0)-J.y,s=(K.r?1:0)-(K.l?1:0)+J.x;const sp=(K.sp?6.5:4.2);
const tvx=(f*-Math.sin(yaw)+s*Math.cos(yaw))*sp,tvz=(f*-Math.cos(yaw)-s*Math.sin(yaw))*sp;vx+=(tvx-vx)*Math.min(1,dt*10);vz+=(tvz-vz)*Math.min(1,dt*10);
const p=cam.position;if(!blocked(p.x+vx*dt,p.z))p.x+=vx*dt;if(!blocked(p.x,p.z+vz*dt))p.z+=vz*dt;
const sd=Math.hypot(vx,vz);bob+=sd*dt*2.2;p.y=1.65+Math.sin(bob)*.03*Math.min(1,sd/3)}
cam.rotation.set(pitch,yaw,0);
const fw=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));near=null;let best=4.2;const cr=roomAt(cam.position.z);setRoomHud(cr);
for(const it of items){if(it.room!==cr)continue;const d=new THREE.Vector3().subVectors(it.g.position,cam.position);d.y=0;const dist=d.length();if(dist<best&&d.normalize().dot(fw)>.72){best=dist;near=it}}
const a=$("act");if(near&&!panel&&started){a.style.display="block";a.textContent="Read: "+near.p[1]+(touch?"":" (E)")}else a.style.display="none";
ren.render(sc,cam);
if(started){mg.clearRect(0,0,64,180);mg.strokeStyle="#c9a04c";mg.strokeRect(6,4,52,172);drawMapRooms();const m=(x,z)=>[32+x*3,4+(-z/LEN)*172];
for(const it of items){const q=m(it.g.position.x,it.g.position.z);mg.fillStyle=it.seen?"#5fb3a0":"#d9b25f";mg.beginPath();mg.arc(q[0],q[1],2.6,0,7);mg.fill()}
const q=m(cam.position.x,cam.position.z);mg.save();mg.translate(q[0],q[1]);mg.rotate(-yaw);mg.fillStyle="#fff";mg.beginPath();mg.moveTo(0,-6);mg.lineTo(4,4);mg.lineTo(-4,4);mg.fill();mg.restore()}
requestAnimationFrame(loop)}
requestAnimationFrame(loop);
