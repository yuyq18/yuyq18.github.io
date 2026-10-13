import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {marked} from './marked.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const raw = readFileSync(root+'source/reports.md','utf8');
const math=[];
let source=raw.replace(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, value => {
  const key=`MATHPLACEHOLDER${math.length}END`; math.push(value); return key;
});
source=source.replace(/^\*\*大模型技术报告时间线与阅读重点\*\*\n/, '').replace('**先按学习目标找报告**','## 先按学习目标找报告');
let headings=[];
const renderer=new marked.Renderer();
renderer.heading=function(token){
  const text=this.parser.parseInline(token.tokens);
  const plain=token.text.replace(/[*`]/g,'');
  const id='section-'+headings.length;
  headings.push({id,level:token.depth,title:plain});
  return `<h${token.depth} id="${id}">${text}<a class="anchor" href="#${id}" aria-label="链接到此标题">#</a></h${token.depth}>\n`;
};
let body=marked.parse(source,{renderer});
body=body.replace(/MATHPLACEHOLDER(\d+)END/g,(_,n)=>math[n].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
body=body.replace(/<table>/g,'<div class="table-scroll" tabindex="0"><table>').replace(/<\/table>/g,'</table></div>');
const sidebar=headings.filter(h=>h.level<=2).map(h=>h.level===1?`<div class="nav-year">${h.title}</div>`:`<a href="#${h.id}" data-target="${h.id}">${h.title.replace(/（.*?）/g,'')}</a>`).join('');
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="按时间线梳理大模型技术报告，精读数据构建、推理后训练、造题闭环与长程 Agent 工程。"><title>大模型技术报告 · Yuanqing Yu</title><link rel="canonical" href="https://yuyq18.github.io/llm-reports/"><script>try{if(localStorage.getItem('llm-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}</script><link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/katex.min.css"><script defer src="assets/katex.min.js"></script><script defer src="assets/auto-render.min.js"></script><script defer src="assets/app.js"></script></head>
<body><a class="skip" href="#content">跳至正文</a><header><a class="brand" href="/">Yuanqing Yu <span>/ 学习笔记</span></a><div class="header-actions"><a class="home" href="/">个人主页 ↗</a><button id="theme" aria-label="切换深色模式" title="切换深色模式">◐</button><button id="menu" aria-expanded="false" aria-controls="sidebar">目录</button></div></header>
<aside id="sidebar" aria-label="时间线导航"><div class="sidebar-label">TECHNICAL REPORTS</div><label class="search-box"><span>⌕</span><input id="search" type="search" placeholder="查找模型或技术…" aria-label="查找模型或技术"><kbd>/</kbd></label><div id="search-results" hidden></div><nav id="timeline">${sidebar}</nav><div class="sidebar-foot">2024 — 2026 · 16 篇报告</div></aside><div id="overlay" hidden></div>
<div class="layout"><main id="content"><div class="eyebrow">LLM ENGINEERING / READING NOTES</div><h1 class="page-title">大模型技术报告</h1><p class="subtitle">时间线与阅读重点</p><p class="intro">从数据构建到后训练，从造题闭环到长程 Agent。<br>按版本读核心技术，按学习目标找工程方法。</p><div class="meta"><span>16 篇报告</span><span>2024.07 — 2026.09</span><a href="source/reports.md" download>Markdown ↓</a></div><article>${body}</article><footer>Yuanqing Yu · 学习笔记 <a href="#content">回到顶部 ↑</a></footer></main><aside class="outline" aria-label="本页目录"><div class="outline-title">本节目录</div><nav id="outline"></nav><a class="top" href="#content">回到顶部 ↑</a></aside></div><script type="application/json" id="headings">${JSON.stringify(headings).replace(/</g,'\\u003c')}</script></body></html>`;
writeFileSync(root+'index.html', html);
console.log('Generated '+headings.length+' headings, '+math.length+' math expressions.');
