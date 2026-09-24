const $=s=>document.querySelector(s);
const byId=Object.fromEntries(POSTS.map(p=>[p.id,p]));
// build index
const groups={};POSTS.forEach(p=>{(groups[p.y]=groups[p.y]||[]).push(p)});
$("#list").innerHTML=Object.keys(groups).sort((a,b)=>b-a).map(y=>
 `<li class="year">${y}</li>`+groups[y].map(p=>
  `<li><span class="date">${p.m}</span><span><a href="#/${p.id}">${p.title}</a>${(!p.full&&p.src!=="mindpatch.net")?` <span class="src">${p.src}</span>`:""}</span></li>`
 ).join("")).join("");
function isDark(){const t=document.documentElement.dataset.theme;return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);}
function runMermaid(){
 const nodes=[...document.querySelectorAll('#p-body pre.mermaid')];
 if(!nodes.length||!window.mermaid)return;
 mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:isDark()?'dark':'default',flowchart:{useMaxWidth:true}});
 try{mermaid.run({nodes});}catch(e){}
}
function enhanceCode(){
 document.querySelectorAll('#p-body pre').forEach(pre=>{
  if(pre.classList.contains('mermaid'))return;
  if(pre.parentElement&&pre.parentElement.classList.contains('codewrap'))return;
  const code=pre.querySelector('code');if(!code)return;
  const m=(code.className||'').match(/language-(\w+)/);
  let lang=m?m[1]:'';
  if(window.hljs){try{hljs.highlightElement(code);if(!lang){const r=hljs.highlightAuto(code.textContent);lang=r.language||'';}}catch(e){}}
  const wrap=document.createElement('div');wrap.className='codewrap';
  pre.parentNode.insertBefore(wrap,pre);wrap.appendChild(pre);
  const label=document.createElement('span');label.className='lang';label.textContent=(lang||'code').toUpperCase();wrap.appendChild(label);
  const btn=document.createElement('button');btn.className='copy';btn.type='button';btn.textContent='Copy';
  btn.addEventListener('click',()=>{
   const t=code.innerText;
   const done=()=>{btn.textContent='Copied';setTimeout(()=>btn.textContent='Copy',1500);};
   const sel=()=>{try{const r=document.createRange();r.selectNodeContents(code);const s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}btn.textContent='Press ⌘C';setTimeout(()=>btn.textContent='Copy',2000);};
   try{navigator.clipboard.writeText(t).then(done,sel);}catch(e){sel();}
  });
  wrap.appendChild(btn);
 });
}
function render(){
 const h=location.hash;const mt=h.match(/^#\/(.+)$/);
 if(mt&&byId[mt[1]]){
  const p=byId[mt[1]];const full=!!p.full;
  $("#p-title").textContent=p.title;
  $("#p-meta").innerHTML=`${p.m}, ${p.y}${p.cve?`<span class="tag">${p.cve}</span>`:""}<span class="tag">${p.tag}</span>`;
  $("#p-body").innerHTML=full?p.full:p.body;
  const l=$("#p-link");
  l.hidden=full;
  if(!full){l.href=p.url;l.textContent=`Read the full writeup on ${p.src} ↗`;}
  $("#p-note").textContent=full?"Reproduced from the author's original post. References are listed at the end.":"Summary written for this page. Full technical detail, code and screenshots are in the original post.";
  $("#home").hidden=true;$("#post").hidden=false;window.scrollTo(0,0);
  document.title="MindPatch · "+p.title;
  if(full){enhanceCode();runMermaid();}
 }else{
  $("#post").hidden=true;$("#home").hidden=false;document.title="MindPatch";
 }
}
addEventListener("hashchange",render);
if(document.readyState!=='loading')render();else addEventListener('DOMContentLoaded',render);
