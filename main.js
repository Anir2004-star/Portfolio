import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import ScrollTrigger from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.18/+esm';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; gsap.set(cursorDot, { x: mx, y: my }); });
gsap.ticker.add(() => { rx += (mx-rx)*.13; ry += (my-ry)*.13; gsap.set(cursorRing,{x:rx,y:ry}); });
document.querySelectorAll('a').forEach(a => {
  a.addEventListener('mouseenter',()=>cursorRing.classList.add('active'));
  a.addEventListener('mouseleave',()=>cursorRing.classList.remove('active'));
});

document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(); gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.18,duration:.3}); });
  el.addEventListener('pointerleave',()=>gsap.to(el,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}));
});

gsap.from('.hero-title .line > span',{yPercent:110,rotation:3,duration:1.25,stagger:.12,ease:'power4.out',delay:.15});
gsap.to('.reveal',{opacity:1,y:0,duration:1,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:'.hero',start:'top 75%'}});
document.querySelectorAll('.experience .reveal,.manifesto .reveal').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 86%'}}));

const split = document.querySelector('.split-copy');
split.innerHTML = split.textContent.trim().split(/\s+/).map(w=>`<span class="word">${w}</span>`).join(' ');
gsap.to('.split-copy .word',{opacity:1,stagger:.06,scrollTrigger:{trigger:split,start:'top 80%',end:'bottom 45%',scrub:true}});

const cards = gsap.utils.toArray('.project-card');
const intro = document.querySelector('.project-intro');
const rings = document.querySelector('.tunnel-rings');
const projectSection = document.querySelector('.projects');
function renderTunnel(progress){
  const enter = Math.min(1, progress / .12);
  intro.style.opacity = String(1 - Math.min(1, Math.max(0,(progress-.07)/.1)));
  rings.style.opacity = String(Math.min(.75, Math.max(0,(progress-.08)*3)));
  cards.forEach((card,i)=>{
    const local = progress * (cards.length + 1.02) - .6 - i;
    const z = local * 900;
    const angle = (i * 2.1) + progress * 7.2;
    const radius = 420;
    const x = Math.sin(angle) * radius;
    const y = Math.cos(angle) * radius * .42;
    const scale = Math.max(.18, Math.min(1.15, 1 + z/2200));
    const opacity = Math.max(0, Math.min(1, 1 - Math.abs(z-80)/1050)) * enter;
    card.style.opacity = opacity;
    card.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${-Math.sin(angle)*26}deg) rotateZ(${Math.sin(angle)*-4}deg) scale(${scale})`;
    card.style.zIndex = String(Math.round(z+2000));
  });
}
ScrollTrigger.create({trigger:projectSection,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>renderTunnel(self.progress)});
renderTunnel(0);

const canvas = document.querySelector('#world');
const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,100);
camera.position.z=6;

const group = new THREE.Group(); scene.add(group);
const geo = new THREE.IcosahedronGeometry(1.72,3);
const mat = new THREE.MeshBasicMaterial({color:0x8b5cf6,wireframe:true,transparent:true,opacity:.18});
const orb = new THREE.Mesh(geo,mat); group.add(orb);
const glowGeo = new THREE.IcosahedronGeometry(1.3,2);
const glowMat = new THREE.MeshBasicMaterial({color:0xbaff3d,wireframe:true,transparent:true,opacity:.08});
group.add(new THREE.Mesh(glowGeo,glowMat));
const starGeo = new THREE.BufferGeometry();
const count=900, pos=new Float32Array(count*3);
for(let i=0;i<count*3;i+=3){const r=4+Math.random()*10,theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);pos[i]=r*Math.sin(phi)*Math.cos(theta);pos[i+1]=r*Math.sin(phi)*Math.sin(theta);pos[i+2]=r*Math.cos(phi)}
starGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xf4f0e8,size:.018,transparent:true,opacity:.6})));
let scrollY=0; addEventListener('scroll',()=>scrollY=scrollY||scrollY===0?window.scrollY:0,{passive:true});
let t=0;
function tick(){
  t+=.004; group.rotation.y=t+mx/innerWidth*.24; group.rotation.x=Math.sin(t*.8)*.18+my/innerHeight*.12; group.position.x=1.75+(mx/innerWidth-.5)*.25; group.position.y=.1+(my/innerHeight-.5)*-.25; const fade=Math.max(0,1-window.scrollY/innerHeight*.8); mat.opacity=.18*fade; glowMat.opacity=.08*fade; renderer.render(scene,camera); requestAnimationFrame(tick);
}
if(!reduced)tick(); else renderer.render(scene,camera);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);ScrollTrigger.refresh()});

gsap.to('.contact-orb',{rotation:80,scrollTrigger:{trigger:'.contact',start:'top bottom',end:'bottom top',scrub:true}});
