'use strict';
const headings=JSON.parse(document.getElementById('headings').textContent);
const models=headings.filter(h=>h.level===2);
const timeline=document.getElementById('timeline');
const outline=document.getElementById('outline');
let current='';
function updateOutline(){
 const model=[...models].reverse().find(h=>document.getElementById(h.id).getBoundingClientRect().top<150)||models[0];
 if(current===model.id)return;
 current=model.id;
 timeline.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.target===current));
 const start=headings.findIndex(h=>h.id===current);
 const section=[];
 for(let i=start+1;i<headings.length&&headings[i].level>2;i++)section.push(headings[i]);
 if(!section.length)section.push(...headings.filter(h=>h.level===1));
 outline.replaceChildren(...section.map(h=>{const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.title;if(h.level===4)a.className='sub';return a}));
}
let ticking=false;window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateOutline();ticking=false});ticking=true}},{passive:true});updateOutline();
const menu=document.getElementById('menu'),overlay=document.getElementById('overlay');
function toggleMenu(open){document.body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));overlay.hidden=!open;}
menu.addEventListener('click',()=>toggleMenu(!document.body.classList.contains('menu-open')));overlay.addEventListener('click',()=>toggleMenu(false));
document.getElementById('sidebar').addEventListener('click',e=>{if(e.target.closest('a'))toggleMenu(false)});
const theme=document.getElementById('theme');
function themeLabel(){theme.setAttribute('aria-label',document.documentElement.dataset.theme==='dark'?'切换浅色模式':'切换深色模式')};themeLabel();
theme.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('llm-theme',dark?'dark':'light')}catch(e){}themeLabel()});
const search=document.getElementById('search'),results=document.getElementById('search-results');
const searchable=headings.filter(h=>h.level>=2).map(h=>{const el=document.getElementById(h.id);let text=h.title;let next=el.nextElementSibling;while(next&&!/^H[1-4]$/.test(next.tagName)){text+=' '+next.textContent;next=next.nextElementSibling}return {...h,text}});
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();timeline.hidden=!!q;results.hidden=!q;results.replaceChildren();if(!q)return;const matches=searchable.filter(h=>h.text.toLowerCase().includes(q));for(const h of matches){const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.title;results.append(a)}if(!matches.length){const p=document.createElement('p');p.textContent='没有找到匹配内容';results.append(p)}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){toggleMenu(false);search.blur()}if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();if(innerWidth<=800)toggleMenu(true);search.focus()}});
if(window.renderMathInElement){renderMathInElement(document.querySelector('article'),{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false,strict:'ignore'});}else{console.error('Formula renderer failed to load');}
