(function(){
  "use strict";

  /* ---------------- STATE ---------------- */
  const state = {
    stageIndex: 0,
    fireLevel: 1,        // 0 extinguished .. 4 raging
    alarmOn: false,
    log: [],
    startTime: null,
    passOrder: [],
    timerId: null,
    timeLeft: 0,
    lockInput: false
  };

  const STAGE_DEFS = [
    { id:'alarm',   label:'ALARM' },
    { id:'evac',    label:'EVACUATE' },
    { id:'fight',   label:'EXTINGUISHER' },
    { id:'muster',  label:'MUSTER' },
    { id:'report',  label:'SUPERVISOR' }
  ];

  const NS = "http://www.w3.org/2000/svg";

  /* ---------------- BACKDROP (industrial mine bay) ---------------- */
  function buildBackdrop(){
    const svg = document.getElementById('backdrop');
    svg.innerHTML = `
      <defs>
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#161d21"/>
          <stop offset="100%" stop-color="#0c1113"/>
        </linearGradient>
        <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1c2429"/>
          <stop offset="100%" stop-color="#0a0d0f"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="420" fill="url(#wallGrad)"/>
      <rect x="0" y="400" width="1000" height="160" fill="url(#floorGrad)"/>
      <!-- ceiling pipes -->
      <g stroke="#3a474e" stroke-width="6" opacity="0.7">
        <line x1="0" y1="40" x2="1000" y2="40"/>
        <line x1="0" y1="60" x2="1000" y2="60"/>
      </g>
      <g fill="#2b363c">
        <rect x="60" y="30" width="14" height="30"/>
        <rect x="260" y="30" width="14" height="30"/>
        <rect x="460" y="30" width="14" height="30"/>
        <rect x="660" y="30" width="14" height="30"/>
        <rect x="860" y="30" width="14" height="30"/>
      </g>
      <!-- support beams -->
      <g fill="#20282d" stroke="#3a474e" stroke-width="2">
        <rect x="40" y="60" width="26" height="360"/>
        <rect x="930" y="60" width="26" height="360"/>
      </g>
      <!-- conveyor structure -->
      <g id="conveyor">
        <rect x="330" y="330" width="420" height="18" rx="3" fill="#242c31" stroke="#3a474e"/>
        <rect x="330" y="330" width="420" height="18" rx="3" fill="none" stroke="#000" stroke-opacity="0.3"/>
        <g id="beltTicks" fill="#4a5a63">
        </g>
        <rect x="350" y="348" width="10" height="90" fill="#242c31"/>
        <rect x="700" y="348" width="10" height="90" fill="#242c31"/>
        <rect x="520" y="348" width="10" height="90" fill="#242c31"/>
      </g>
      <!-- control panel -->
      <g transform="translate(120,300)">
        <rect x="0" y="0" width="70" height="110" rx="4" fill="#1c2428" stroke="#3a474e"/>
        <circle cx="35" cy="20" r="6" fill="#3fc9a4"/>
        <rect x="12" y="40" width="46" height="6" fill="#4a5a63"/>
        <rect x="12" y="52" width="46" height="6" fill="#4a5a63"/>
        <rect x="12" y="64" width="30" height="6" fill="#4a5a63"/>
      </g>
      <!-- crates / stockpile -->
      <g fill="#242c31" stroke="#3a474e">
        <rect x="800" y="360" width="46" height="46"/>
        <rect x="850" y="372" width="34" height="34"/>
      </g>
      <!-- overhead hazard light (strobe source) -->
      <g id="hazardLight" transform="translate(150,70)">
        <circle cx="0" cy="0" r="9" fill="#7a2a25"/>
      </g>
      <!-- floor perspective lines -->
      <g stroke="#20282d" stroke-width="2" opacity="0.6">
        <line x1="0" y1="470" x2="1000" y2="470"/>
        <line x1="0" y1="520" x2="1000" y2="520"/>
      </g>
    `;
    // animate belt ticks
    const ticks = svg.querySelector('#beltTicks');
    for(let i=0;i<14;i++){
      const r = document.createElementNS(NS,'rect');
      r.setAttribute('x', 335 + i*30);
      r.setAttribute('y', 336);
      r.setAttribute('width', 4);
      r.setAttribute('height', 6);
      ticks.appendChild(r);
    }
  }

  /* ---------------- FIRE / SMOKE ---------------- */
  function flameSVG(scale){
    return `<svg width="${80*scale}" height="${120*scale}" viewBox="0 0 80 120">
      <defs>
        <linearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#ff4b1f"/>
          <stop offset="45%" stop-color="#ff9a3c"/>
          <stop offset="100%" stop-color="#ffe98a"/>
        </linearGradient>
      </defs>
      <path class="flame f1" fill="url(#fg)" d="M40 118C18 100 8 78 16 54C22 36 34 30 32 14C32 8 36 2 40 0C42 10 48 14 52 24C58 36 50 42 54 54C58 44 66 44 68 56C74 78 62 100 40 118Z"/>
      <path class="flame f2" fill="#ffdf7a" opacity="0.85" d="M40 112C28 100 24 84 30 66C34 54 40 50 39 38C39 34 42 30 44 28C45 36 49 38 51 46C55 54 50 58 52 66C55 60 60 60 61 68C65 82 56 100 40 112Z"/>
      <path class="flame f3" fill="#fff4c2" opacity="0.9" d="M40 104C34 96 32 86 36 74C38 66 41 64 40 56C40 53 42 51 43 50C44 55 46 57 47 62C49 68 46 70 47 74C49 71 52 71 53 76C55 84 49 96 40 104Z"/>
    </svg>`;
  }

  function renderFire(container, x, y, level){
    // level 0..4
    container.innerHTML = '';
    if(level <= 0) return;
    const count = level >= 3 ? 3 : (level===2?2:1);
    const scale = 0.55 + level*0.28;
    for(let i=0;i<count;i++){
      const wrap = document.createElement('div');
      wrap.className = 'flame-wrap';
      const dx = (i-Math.floor(count/2))*26;
      wrap.style.left = (x + dx) + 'px';
      wrap.style.top = (y - 118*scale) + 'px';
      wrap.style.transform = `scale(${scale})`;
      wrap.innerHTML = flameSVG(1);
      container.appendChild(wrap);
    }
  }

  function renderSmoke(container, x, y, level){
    container.innerHTML = '';
    if(level<=0) return;
    const n = level>=3?9:(level===2?5:2);
    for(let i=0;i<n;i++){
      const s = document.createElement('div');
      s.className = 'smoke';
      const size = 40 + Math.random()*50;
      s.style.width = size+'px';
      s.style.height = size+'px';
      s.style.left = (x - size/2 + (Math.random()*60-30)) + 'px';
      s.style.top = (y - 60 - Math.random()*40) + 'px';
      s.style.setProperty('--drift', (Math.random()*80-20)+'px');
      s.style.animationDelay = (Math.random()*5)+'s';
      s.style.animationDuration = (4.5+Math.random()*3)+'s';
      container.appendChild(s);
    }
  }

  const FIRE_X = 500, FIRE_Y = 330;
  function updateFireVisual(){
    const scene = document.getElementById('scene');
    const rect = scene.getBoundingClientRect();
    const scaleX = rect.width/1000, scaleY = rect.height/560;
    renderFire(document.getElementById('fireLayer'), FIRE_X*scaleX, FIRE_Y*scaleY, state.fireLevel);
    renderSmoke(document.getElementById('smokeLayer'), FIRE_X*scaleX, FIRE_Y*scaleY, state.fireLevel);
    document.getElementById('strobe').classList.toggle('on', state.alarmOn);
  }
  window.addEventListener('resize', updateFireVisual);

  /* ---------------- HOTSPOT HELPERS ---------------- */
  function addHotspot({x,y,icon,label,sub,cls,onClick}){
    const layer = document.getElementById('hotspotLayer');
    const scene = document.getElementById('scene');
    const rect = scene.getBoundingClientRect();
    const scaleX = rect.width/1000, scaleY = rect.height/560;
    const btn = document.createElement('button');
    btn.className = 'hotspot' + (cls?(' '+cls):'');
    btn.style.left = (x*scaleX)+'px';
    btn.style.top = (y*scaleY)+'px';
    btn.innerHTML = `<span class="badge">${icon?icon+' ':''}${label}${sub?`<span class="sub">${sub}</span>`:''}</span>`;
    btn.addEventListener('click', onClick);
    layer.appendChild(btn);
    return btn;
  }
  function clearHotspots(){ document.getElementById('hotspotLayer').innerHTML=''; }

  /* ---------------- TIMER ---------------- */
  function startTimer(seconds, onExpire){
    clearInterval(state.timerId);
    state.timeLeft = seconds;
    renderTimer();
    state.timerId = setInterval(()=>{
      state.timeLeft--;
      renderTimer();
      if(state.timeLeft<=0){
        clearInterval(state.timerId);
        onExpire();
      }
    },1000);
  }
  function renderTimer(){
    const el = document.getElementById('timer');
    const m = Math.floor(Math.max(state.timeLeft,0)/60).toString().padStart(2,'0');
    const s = Math.max(state.timeLeft,0)%60;
    el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    el.classList.toggle('low', state.timeLeft<=8);
  }
  function stopTimer(){ clearInterval(state.timerId); }

  /* ---------------- TOAST ---------------- */
  function showToast({correct, title, body, onContinue}){
    stopTimer();
    state.lockInput = true;
    const t = document.getElementById('toast');
    t.className = 'toast show ' + (correct?'correct':'wrong');
    t.innerHTML = `<div class="t-head">${correct?'✓':'✕'} ${title}</div><p>${body}</p><button class="t-continue">Continue</button>`;
    t.querySelector('.t-continue').addEventListener('click', ()=>{
      t.className = 'toast';
      state.lockInput = false;
      onContinue && onContinue();
    });
  }

  function logEntry(stageLabel, text, ok){
    state.log.push({stageLabel, text, ok});
  }

  /* ---------------- STEP TRACKER ---------------- */
  function renderStepTracker(){
    const wrap = document.getElementById('stepTracker');
    wrap.innerHTML = STAGE_DEFS.map((s,i)=>{
      const cls = i<state.stageIndex ? 'done' : (i===state.stageIndex?'active':'');
      const dotContent = i<state.stageIndex ? '✓' : (i+1);
      const sep = i < STAGE_DEFS.length-1 ? '<span class="step-sep"></span>' : '';
      return `<div class="step ${cls}"><span class="dot">${dotContent}</span><span>${s.label}</span></div>${sep}`;
    }).join('');
  }

  function renderTaskPanel({eyebrow, title, body}){
    document.getElementById('taskPanel').innerHTML = `
      <div class="eyebrow">${eyebrow}</div>
      <h2>${title}</h2>
      <p>${body}</p>
    `;
  }

  /* ================================================================
     STAGE 1 — ALARM
  ================================================================= */
  function stageAlarm(){
    state.stageIndex = 0;
    renderStepTracker();
    clearHotspots();
    document.getElementById('passPanel').style.display='none';
    state.fireLevel = 1;
    state.alarmOn = false;
    updateFireVisual();

    renderTaskPanel({
      eyebrow: 'STEP 1 OF 5 · DECISION',
      title: 'Smoke is rising off the conveyor drive motor.',
      body: 'It just started. No one else nearby has noticed yet. What do you do first?'
    });

    addHotspot({
      x:150, y:300, icon:'🔔', label:'Pull the fire alarm', sub:'Nearest call point, 4m away',
      onClick:()=>handleAlarmChoice('alarm')
    });
    addHotspot({
      x:820, y:300, icon:'🧯', label:'Grab the extinguisher and fight it now',
      onClick:()=>handleAlarmChoice('extinguisher')
    });
    addHotspot({
      x:500, y:470, icon:'🏃', label:'Run to the exit without alerting anyone',
      onClick:()=>handleAlarmChoice('run')
    });
    addHotspot({
      x:120, y:380, icon:'📞', label:'Call your supervisor first',
      onClick:()=>handleAlarmChoice('call')
    });

    startTimer(24, ()=>handleAlarmChoice('timeout'));
  }

  function handleAlarmChoice(choice){
    if(state.lockInput) return;
    stopTimer();
    if(choice === 'alarm'){
      state.alarmOn = true;
      updateFireVisual();
      logEntry('ALARM','Raised the alarm immediately', true);
      showToast({
        correct:true,
        title:'Alarm raised',
        body:'Correct call. Raising the alarm first means everyone downwind gets a head start — before you spend a second deciding anything else. Strobe and horn are now active across the bay.',
        onContinue: stageEvacuate
      });
    } else if(choice === 'extinguisher'){
      state.fireLevel = 2;
      updateFireVisual();
      logEntry('ALARM','Went for the extinguisher before alerting anyone', false);
      showToast({
        correct:false,
        title:'Fire grew while you hesitated',
        body:'Fighting a fire before anyone else knows it exists means if it beats you, nobody is coming. The motor housing has caught properly now. Raise the alarm — always — before you commit to anything else.',
        onContinue: stageAlarm
      });
    } else if(choice === 'run'){
      state.fireLevel = 2;
      updateFireVisual();
      logEntry('ALARM','Left without raising the alarm', false);
      showToast({
        correct:false,
        title:'Colleagues weren\'t warned',
        body:'You\'re safe, but the two workers past the crates never heard a thing. An unraised alarm is the single most common cause of trapped-worker incidents in a small-fire-turned-large scenario.',
        onContinue: stageAlarm
      });
    } else if(choice === 'call'){
      state.fireLevel = 2;
      updateFireVisual();
      logEntry('ALARM','Called supervisor instead of raising the site alarm', false);
      showToast({
        correct:false,
        title:'Wrong channel, wrong order',
        body:'A phone call reaches one person, slowly. The alarm reaches the whole bay, instantly. Inform your supervisor after the alarm is raised and you\'re moving to safety — not before.',
        onContinue: stageAlarm
      });
    } else if(choice === 'timeout'){
      state.fireLevel = 2;
      updateFireVisual();
      logEntry('ALARM','Hesitated — ran out of time', false);
      showToast({
        correct:false,
        title:'Too slow',
        body:'Fire doesn\'t wait for you to weigh options. Every second of hesitation is fuel. Try again, and act on instinct: alarm first.',
        onContinue: stageAlarm
      });
    }
  }

  /* ================================================================
     STAGE 2 — EVACUATE
  ================================================================= */
  function stageEvacuate(){
    state.stageIndex = 1;
    renderStepTracker();
    clearHotspots();

    renderTaskPanel({
      eyebrow:'STEP 2 OF 5 · DECISION',
      title:'Alarm is live. Smoke is spreading along the ceiling.',
      body:'Three routes are visible from where you stand. Pick the one you\'d actually take.'
    });

    addHotspot({
      x:130, y:250, icon:'⬆', label:'Route A — through the smoke, straight past the fire', sub:'Shortest path',
      cls:'danger',
      onClick:()=>handleEvacChoice('through')
    });
    addHotspot({
      x:900, y:260, icon:'🚪', label:'Route B — marked exit, along the far wall', sub:'Clear of smoke',
      cls:'safe',
      onClick:()=>handleEvacChoice('marked')
    });
    addHotspot({
      x:60, y:180, icon:'🛗', label:'Route C — service lift shaft',
      onClick:()=>handleEvacChoice('lift')
    });

    startTimer(20, ()=>handleEvacChoice('timeout'));
  }

  function handleEvacChoice(choice){
    if(state.lockInput) return;
    stopTimer();
    if(choice === 'marked'){
      logEntry('EVACUATE','Took the marked, smoke-clear exit route', true);
      showToast({
        correct:true,
        title:'Clean route, no smoke',
        body:'That\'s the designated evacuation route for a reason — it stays clear the longest and it\'s the route the fire team will expect you to be on if a headcount comes up short.',
        onContinue: stageFightDecision
      });
    } else if(choice === 'through'){
      state.fireLevel = 3;
      updateFireVisual();
      logEntry('EVACUATE','Walked through active smoke to save a few seconds', false);
      showToast({
        correct:false,
        title:'Smoke inhalation risk',
        body:'Shortest path isn\'t safest path. Smoke — not flame — kills most people in a fire, and visibility near the source can drop to zero in seconds. Take the long way that stays clear.',
        onContinue: stageEvacuate
      });
    } else if(choice === 'lift'){
      logEntry('EVACUATE','Attempted to use the lift during a fire', false);
      showToast({
        correct:false,
        title:'Never the lift',
        body:'Power to lifts can cut without warning during a fire, and shafts pull smoke like a chimney. Stairs and marked walking routes only — always.',
        onContinue: stageEvacuate
      });
    } else if(choice === 'timeout'){
      state.fireLevel = 3;
      updateFireVisual();
      logEntry('EVACUATE','Hesitated choosing a route', false);
      showToast({
        correct:false,
        title:'Too slow',
        body:'The smoke layer just dropped another half-metre. Decide faster next time — the marked route was in front of you the whole time.',
        onContinue: stageEvacuate
      });
    }
  }

  /* ================================================================
     STAGE 3 — FIGHT / EXTINGUISHER
  ================================================================= */
  function stageFightDecision(){
    state.stageIndex = 2;
    renderStepTracker();
    clearHotspots();
    document.getElementById('passPanel').style.display='none';

    renderTaskPanel({
      eyebrow:'STEP 3 OF 5 · DECISION',
      title:'You\'re at the exit with a clear path behind you.',
      body:'The fire is still small — waist height, one source, extinguisher within reach. Do you attempt it, or keep moving?'
    });

    addHotspot({
      x:560, y:250, icon:'🧯', label:'Attempt to extinguish it', sub:'Fire is small, exit is clear behind you',
      onClick:()=>startPassSequence()
    });
    addHotspot({
      x:900, y:260, icon:'🚪', label:'Don\'t risk it — continue evacuating', sub:'Let the fire team handle it',
      onClick:()=>handleFightChoice('leave')
    });

    startTimer(18, ()=>handleFightChoice('timeout'));
  }

  function handleFightChoice(choice){
    if(choice === 'leave'){
      stopTimer();
      logEntry('EXTINGUISHER','Chose to evacuate rather than fight the fire', true);
      showToast({
        correct:true,
        title:'A defensible call',
        body:'You are never required to fight a fire. With the alarm already raised and your exit clear, walking away and letting the trained response team handle it is always an acceptable — often the safer — decision.',
        onContinue: stageMuster
      });
    } else if(choice === 'timeout'){
      stopTimer();
      state.fireLevel = 4;
      updateFireVisual();
      logEntry('EXTINGUISHER','Froze on the decision', false);
      showToast({
        correct:false,
        title:'The fire didn\'t wait',
        body:'It\'s now too large to safely fight. Your only move left is to evacuate.',
        onContinue: stageMuster
      });
    }
  }

  function startPassSequence(){
    stopTimer();
    clearHotspots();
    renderTaskPanel({
      eyebrow:'STEP 3 OF 5 · IN PROGRESS',
      title:'Using the extinguisher — PASS technique',
      body:'Complete the four actions in the correct order. Standing 2m back, aim low.'
    });

    state.passOrder = [];
    const steps = [
      {id:'pull', letter:'P', label:'Pull the pin', desc:'Breaks the tamper seal'},
      {id:'aim', letter:'A', label:'Aim low', desc:'At the base of the fire, not the flames'},
      {id:'squeeze', letter:'S', label:'Squeeze the handle', desc:'Releases the agent'},
      {id:'sweep', letter:'S', label:'Sweep side to side', desc:'Across the base until it\'s out'}
    ];
    const correctOrder = ['pull','aim','squeeze','sweep'];
    const panel = document.getElementById('passPanel');
    panel.style.display='block';
    panel.innerHTML = `<h3>PASS SEQUENCE</h3>` + steps.map(s=>`
      <div class="pass-step" data-id="${s.id}">
        <div class="letter">${s.letter}</div>
        <div><span class="label">${s.label}</span><span class="desc">${s.desc}</span></div>
      </div>
    `).join('');

    panel.querySelectorAll('.pass-step').forEach(el=>{
      el.addEventListener('click', ()=>{
        if(el.classList.contains('done')) return;
        const id = el.dataset.id;
        const expectedNext = correctOrder[state.passOrder.length];
        if(id === expectedNext){
          state.passOrder.push(id);
          el.classList.add('done');
          // shrink fire progressively
          state.fireLevel = Math.max(0, 3 - state.passOrder.length);
          updateFireVisual();
          if(state.passOrder.length === correctOrder.length){
            state.alarmOn = false;
            logEntry('EXTINGUISHER','Completed the PASS technique correctly, fire out', true);
            setTimeout(()=>{
              showToast({
                correct:true,
                title:'Fire extinguished',
                body:'Clean execution — pin, aim, squeeze, sweep, in order. Keep watching the area for re-ignition and back away toward the exit.',
                onContinue: stageMuster
              });
            }, 500);
          }
        } else {
          el.classList.add('shake');
          setTimeout(()=>el.classList.remove('shake'), 350);
        }
      });
    });
  }

  /* ================================================================
     STAGE 4 — MUSTER
  ================================================================= */
  function stageMuster(){
    state.stageIndex = 3;
    renderStepTracker();
    clearHotspots();
    document.getElementById('passPanel').style.display='none';
    state.alarmOn = true;
    updateFireVisual();

    renderTaskPanel({
      eyebrow:'STEP 4 OF 5 · DECISION',
      title:'You\'re outside. Where do you go now?',
      body:'Three groups of people are visible in the yard. Get to where you\'ll actually be counted.'
    });

    addHotspot({
      x:760, y:440, icon:'👥', label:'Designated muster point', sub:'Assembly Point B — flagged, away from the building',
      cls:'safe',
      onClick:()=>handleMusterChoice('muster')
    });
    addHotspot({
      x:200, y:440, icon:'🚗', label:'Vehicle gate — wait by the cars',
      onClick:()=>handleMusterChoice('gate')
    });
    addHotspot({
      x:500, y:420, icon:'🔁', label:'Go back in for your bag',
      cls:'danger',
      onClick:()=>handleMusterChoice('back')
    });

    startTimer(20, ()=>handleMusterChoice('timeout'));
  }

  function handleMusterChoice(choice){
    if(state.lockInput) return;
    stopTimer();
    if(choice === 'muster'){
      logEntry('MUSTER','Went straight to the designated muster point', true);
      showToast({
        correct:true,
        title:'Counted and accounted for',
        body:'This is exactly where the headcount happens. Anyone not here in the next few minutes gets treated as possibly still inside — showing up promptly matters as much as evacuating did.',
        onContinue: stageReport
      });
    } else if(choice === 'back'){
      state.fireLevel = Math.max(state.fireLevel, 3);
      updateFireVisual();
      logEntry('MUSTER','Went back inside for personal belongings', false);
      showToast({
        correct:false,
        title:'Never go back in',
        body:'Nothing inside is worth re-entering a building during an active fire alarm — not a bag, not a phone. That rule has no exceptions.',
        onContinue: stageMuster
      });
    } else if(choice === 'gate'){
      logEntry('MUSTER','Waited at the vehicle gate instead of the muster point', false);
      showToast({
        correct:false,
        title:'You won\'t be counted here',
        body:'The headcount only happens at the flagged assembly point. Standing anywhere else means someone may be sent back in to look for you.',
        onContinue: stageMuster
      });
    } else if(choice === 'timeout'){
      logEntry('MUSTER','Too slow reaching muster point', false);
      showToast({
        correct:false,
        title:'Too slow',
        body:'The supervisor is already starting the headcount without you. Move with more urgency once you\'re clear of the building.',
        onContinue: stageMuster
      });
    }
  }

  /* ================================================================
     STAGE 5 — REPORT
  ================================================================= */
  function stageReport(){
    state.stageIndex = 4;
    renderStepTracker();
    clearHotspots();
    stopTimer();
    document.getElementById('timer').textContent = '--:--';

    renderTaskPanel({
      eyebrow:'STEP 5 OF 5',
      title:'Report to your supervisor',
      body:'Give an accurate account — this determines whether anyone else needs to go back in.'
    });

    const panel = document.createElement('div');
    panel.className = 'report-panel';
    panel.id = 'reportPanel';
    panel.innerHTML = `
      <div class="eyebrow">INCIDENT REPORT — VERBAL TO SUPERVISOR</div>
      <h2>What do you tell them?</h2>
      <div class="field">
        <label>Location of the fire</label>
        <select id="locSel">
          <option value="">Select…</option>
          <option value="correct">Conveyor drive motor, bay 3</option>
          <option value="wrong">Somewhere near the entrance</option>
        </select>
      </div>
      <div class="field">
        <label>Status when you left</label>
        <select id="statusSel">
          <option value="">Select…</option>
          <option value="correct">Fire out / area handed to response team</option>
          <option value="wrong">Not sure, didn't check</option>
        </select>
      </div>
      <div class="field">
        <label>Confirm before submitting</label>
        <div class="checklist">
          <label><input type="checkbox" id="c1"> I raised the alarm before doing anything else</label>
          <label><input type="checkbox" id="c2"> I used the marked evacuation route</label>
          <label><input type="checkbox" id="c3"> I'm reporting an accurate account, not a guess</label>
        </div>
      </div>
      <button class="submit-btn" id="submitReport" disabled>Submit report</button>
    `;
    document.getElementById('scene').appendChild(panel);

    function checkReady(){
      const ready = document.getElementById('locSel').value &&
                    document.getElementById('statusSel').value &&
                    document.getElementById('c1').checked &&
                    document.getElementById('c2').checked &&
                    document.getElementById('c3').checked;
      document.getElementById('submitReport').disabled = !ready;
    }
    ['locSel','statusSel','c1','c2','c3'].forEach(id=>{
      document.getElementById(id).addEventListener('change', checkReady);
    });

    document.getElementById('submitReport').addEventListener('click', ()=>{
      const locOk = document.getElementById('locSel').value === 'correct';
      const statusOk = document.getElementById('statusSel').value === 'correct';
      logEntry('SUPERVISOR', locOk && statusOk ? 'Gave an accurate, complete report' : 'Report was incomplete or vague', locOk && statusOk);
      panel.remove();
      showEndScreen();
    });
  }

  /* ================================================================
     END SCREEN
  ================================================================= */
  function showEndScreen(){
    stopTimer();
    const totalMs = Date.now() - state.startTime;
    const totalSec = Math.round(totalMs/1000);
    const correctFirstTry = state.log.filter(l=>l.ok).length;
    const total = state.log.length;
    const pct = Math.round((correctFirstTry/total)*100);

    const overlay = document.createElement('div');
    overlay.className = 'end-screen';
    overlay.innerHTML = `
      <div class="end-card">
        <div class="icon">${pct>=80?'✅':pct>=50?'⚠️':'🔥'}</div>
        <h1>${pct>=80?'Drill complete — solid response':pct>=50?'Drill complete — room to sharpen':'Drill complete — review the basics'}</h1>
        <p class="lead">${pct}% of your decisions were correct without needing a retry.</p>
        <div class="score-grid">
          <div class="score-card"><div class="num">${totalSec}s</div><div class="lbl">Total response time</div></div>
          <div class="score-card"><div class="num">${correctFirstTry}/${total}</div><div class="lbl">Correct first try</div></div>
        </div>
        <div class="log">
          ${state.log.map(l=>`<div class="log-row"><span>${l.stageLabel} — ${l.text}</span><span class="${l.ok?'ok':'bad'}">${l.ok?'✓':'✕'}</span></div>`).join('')}
        </div>
        <button class="restart-btn" id="restartBtn" style="margin-top:20px;">Run the drill again</button>
      </div>
    `;
    document.getElementById('app').appendChild(overlay);
    document.getElementById('restartBtn').addEventListener('click', ()=>{
      overlay.remove();
      state.log = [];
      state.startTime = Date.now();
      stageAlarm();
    });
  }

  /* ---------------- INIT ---------------- */
  buildBackdrop();
  document.getElementById('beginBtn').addEventListener('click', ()=>{
    document.getElementById('intro').remove();
    state.startTime = Date.now();
    updateFireVisual();
    stageAlarm();
  });

})();