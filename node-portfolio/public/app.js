(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const world = document.getElementById('world');
  const traveler = document.querySelector('.traveler');
  const path = document.getElementById('path-line');
  const reveals = [...document.querySelectorAll('.reveal')];
  const projectButtons = [...document.querySelectorAll('[data-project]')];
  const skillButtons = [...document.querySelectorAll('[data-skill]')];
  const rootScene = document.getElementById('root-scene');
  const lavaSides = [...document.querySelectorAll('.lava-side span')];
  const soundToggle = document.querySelector('.sound-toggle');
  const tactile = [...document.querySelectorAll('.tactile')];
  let soundOn = true;
  let audioCtx;

  function clickSound(kind='ui'){
    if(!soundOn) return;
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const now = audioCtx.currentTime;
    const map = {ui:[520,720,.045],gem:[780,1160,.11],star:[610,920,.07],root:[210,160,.08]};
    const cfg = map[kind] || map.ui;
    o.type = kind==='root' ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(cfg[0],now);
    o.frequency.exponentialRampToValueAtTime(cfg[1],now+cfg[2]);
    g.gain.setValueAtTime(.028,now);
    g.gain.exponentialRampToValueAtTime(.001,now+cfg[2]+.025);
    o.connect(g); g.connect(audioCtx.destination); o.start(now); o.stop(now+cfg[2]+.03);
  }
  tactile.forEach(el=>el.addEventListener('click',()=>clickSound(el.classList.contains('gem')?'gem':el.classList.contains('star')?'star':el.classList.contains('root-node')?'root':'ui')));
  soundToggle.addEventListener('click',()=>{soundOn=!soundOn;soundToggle.textContent=soundOn?'♪':'×'; if(soundOn) clickSound('ui');});

  const projects={
    rosa:{k:'CLOUD PLATFORM',t:'ROSA Platform',c:'Cloud-native platform work connecting GitLab, AWS infrastructure, container delivery and OpenShift.',f:['GitLab','ECR','ROSA']},
    auto:{k:'AUTOMATION',t:'Automation Platform',c:'Enterprise automation architecture connecting source control, orchestration, infrastructure provisioning and target configuration.',f:['GitLab','AAP','TFE','Nutanix']},
    ai:{k:'AI / MLOPS',t:'AI Experiments',c:'Experiments around agents, data workflows, model evaluation and the infrastructure needed to operate them.',f:['Data','Agent / Model','API','Platform']}
  };
  projectButtons.forEach(btn=>btn.addEventListener('click',()=>{
    projectButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const p=projects[btn.dataset.project];
    document.getElementById('project-kicker').textContent=p.k;
    document.getElementById('project-title').textContent=p.t;
    document.getElementById('project-copy').textContent=p.c;
    document.getElementById('project-flow').innerHTML=p.f.map((x,i)=>`<span>${x}</span>${i<p.f.length-1?'<i>→</i>':''}`).join('');
  }));

  const skills={
    cloud:['CLOUD','AWS','VPC · IAM · S3 · ROSA'],devops:['DEVOPS','Delivery','GitLab CI/CD · Automation'],platform:['PLATFORM','OpenShift','Kubernetes · Containers · AAP'],linux:['SYSTEMS','Linux','RHEL · Networking · Operations'],code:['SOFTWARE','Python','APIs · Automation · Problem solving'],ai:['AI / MLOPS','Agents','LLMs · Data · Evaluation · MLOps']
  };
  skillButtons.forEach(btn=>{
    const activate=()=>{const s=skills[btn.dataset.skill];document.getElementById('skill-kicker').textContent=s[0];document.getElementById('skill-title').textContent=s[1];document.getElementById('skill-copy').textContent=s[2];};
    btn.addEventListener('mouseenter',activate);btn.addEventListener('focus',activate);btn.addEventListener('click',activate);
  });

  document.querySelectorAll('[data-root]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById('root-info').textContent=btn.dataset.root+' · add verified organisation, role and contribution here.'));
  const found=new Set();document.querySelectorAll('[data-gem]').forEach(btn=>btn.addEventListener('click',()=>{found.add(btn.dataset.gem);document.getElementById('mine-status').textContent=found.size+' discoveries · '+btn.dataset.gem;}));

  const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in',e.isIntersecting)),{threshold:.22});reveals.forEach(r=>io.observe(r));

  let lastY=window.scrollY,lastT=performance.now(),raf=false;
  function update(){
    raf=false; if(reduced) return;
    const y=window.scrollY, max=Math.max(1,document.documentElement.scrollHeight-innerHeight), p=Math.max(0,Math.min(1,y/max));
    const now=performance.now(), dy=y-lastY, dt=Math.max(16,now-lastT), v=Math.max(-2.5,Math.min(2.5,dy/dt));lastY=y;lastT=now;
    if(path && traveler){const len=path.getTotalLength(),pt=path.getPointAtLength(len*p),svg=path.ownerSVGElement.getBoundingClientRect(),vb=path.ownerSVGElement.viewBox.baseVal;traveler.style.left=(svg.left+pt.x/vb.width*svg.width)+'px';traveler.style.top=(pt.y/vb.height*svg.height - y + svg.top)+'px';}
    const roots=document.querySelectorAll('.root');roots.forEach((r,i)=>{r.style.transform += ''; r.style.filter=`brightness(${.82 + p*.22 + (i%2)*.03})`;});
    if(rootScene){const rr=rootScene.getBoundingClientRect();const local=Math.max(-1,Math.min(1,(innerHeight/2-(rr.top+rr.height/2))/innerHeight));rootScene.style.transform=`rotateX(${local*4}deg) rotateY(${local*-7}deg) translateZ(${Math.abs(local)*12}px)`;}
    const contact=document.getElementById('contact'); if(contact){const cr=contact.getBoundingClientRect(), cp=Math.max(0,Math.min(1,(innerHeight-cr.top)/(innerHeight+cr.height)));lavaSides.forEach((s,i)=>{const side=i%2===0?-1:1;s.style.setProperty('--lava-x',(side*(150-cp*180-Math.abs(v)*28))+'px');s.style.setProperty('--lava-y',(250-cp*260-Math.abs(v)*34)+'px');});}
    document.querySelectorAll('.panel').forEach((panel,i)=>{const r=panel.getBoundingClientRect(),center=r.top+r.height/2,dist=(innerHeight/2-center)/innerHeight;panel.style.setProperty('--panel-shift',(dist*18)+'px');});
  }
  window.addEventListener('scroll',()=>{if(!raf){raf=true;requestAnimationFrame(update)}},{passive:true});update();
})();
