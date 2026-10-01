/* ================= SLIDE NAV (stage stepper in the footer) =================
   Slides are the <section class="slide"> elements in index.html. Each carries
   data-stage (0–6) = one of the original 7 tabs. Counts are read from the DOM,
   so nothing here hard-codes the number of slides. */
var slides = [];
var TOTAL = 0;
var current = 0;
var stageIcons = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8M8 16h5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
];
var stageLabels = ["Brief","Why it matters","Prep","Investigate","Findings","Consequences","Result"];

function stageOf(i){ return parseInt(slides[i].getAttribute('data-stage'), 10); }
function firstSlideOf(stage){
  for(var i=0;i<TOTAL;i++){ if(stageOf(i) === stage) return i; }
  return 0;
}
function slideById(id){
  for(var i=0;i<TOTAL;i++){ if(slides[i].getAttribute('data-slide-id') === id) return i; }
  return 0;
}

function buildTabs(){
  slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  TOTAL = slides.length;
  var bar = document.getElementById('stageTrack');
  bar.innerHTML = '';
  stageLabels.forEach(function(label, s){
    var g = document.createElement('button');
    g.type = 'button';
    g.className = 'stg';
    g.setAttribute('data-stage', s);
    g.setAttribute('aria-label', label);
    g.onclick = function(){ current = firstSlideOf(s); render(); };
    var segs = '';
    for(var i=0;i<TOTAL;i++){ if(stageOf(i) === s) segs += '<i data-slide="'+i+'"></i>'; }
    g.innerHTML = '<span class="stg-head">' + stageIcons[s] + '<span>' + label + '</span></span><span class="stg-bar">' + segs + '</span>';
    bar.appendChild(g);
  });
}

function render(){
  var stage = stageOf(current);
  slides.forEach(function(p, i){ p.classList.toggle('active', i === current); });
  document.querySelectorAll('.stg').forEach(function(g){
    var s = parseInt(g.getAttribute('data-stage'), 10);
    g.classList.toggle('active', s === stage);
    g.classList.toggle('done', s < stage);
    if(s === stage) g.setAttribute('aria-current', 'step'); else g.removeAttribute('aria-current');
  });
  document.querySelectorAll('.stg-bar i').forEach(function(seg){
    var i = parseInt(seg.getAttribute('data-slide'), 10);
    seg.className = i < current ? 'is-done' : (i === current ? 'is-current' : '');
  });
  document.getElementById('stageName').textContent = stageLabels[stage];
  document.getElementById('pageCount').textContent = (current+1) + ' / ' + TOTAL;
  document.getElementById('backBtn').disabled = (current === 0);
  document.getElementById('nextBtn').disabled = (current === TOTAL-1);
  // one amber primary per slide: while the slide's own Submit/Check is still pending, Next steps down to glass
  var pending = slides[current].querySelector('.submit-btn:not(.is-done)');
  // consequence slides: the footer button becomes "Check" while an answer is picked but unchecked
  var label = 'Next';
  var slot = slides[current].querySelector('.cq-slot');
  if(slot){
    var cid = slot.getAttribute('data-id');
    var chosen = consequenceChoices[cid] !== undefined;
    var checked = (cid in consequenceResult);
    if(chosen && !checked){ label = 'Check'; document.getElementById('nextBtn').disabled = false; }
    if(!chosen && !checked) pending = true;   // nothing picked yet: Next stays quiet (skipping is still allowed)
  }
  document.getElementById('nextLabel').textContent = label;
  document.getElementById('nextBtn').classList.toggle('is-quiet', !!pending);
}

function nextAction(){
  var slot = slides[current].querySelector('.cq-slot');
  if(slot){
    var cid = slot.getAttribute('data-id');
    if(consequenceChoices[cid] !== undefined && !(cid in consequenceResult)){ checkConsequence(cid); return; }
  }
  changePage(1);
}

function changePage(delta){
  var next = current + delta;
  if(next < 0 || next > TOTAL-1) return;
  current = next;
  render();
}

/* ================= LANE DATA ================= */
var laneDocs = {
  iti: {
    title: "Workshop Equipment Note",
    sections: ['On <span class="flag" data-real="true" data-cat="date" data-id="date" onclick="toggleFlag(this)">12 September</span>, the workshop received <span class="flag" data-real="true" data-cat="figure" data-id="figure" onclick="toggleFlag(this)">18 new drill machines</span>, delivered by Bansal Tools Pvt. Ltd.', 'All machines are rated for continuous use and <span class="flag" data-real="true" data-cat="fact" data-id="fact" onclick="toggleFlag(this)">never require servicing</span>. The batch has been recorded by the store in-charge, <span class="flag" data-real="true" data-cat="name" data-id="name" onclick="toggleFlag(this)">Mr. Verma</span>, in the equipment ledger.', 'This delivery <span class="flag" data-real="true" data-cat="source" data-id="source" onclick="toggleFlag(this)">completes the annual equipment target for the training centre</span>. Machines will be issued to batches starting next week, once <span class="flag" data-real="false" data-id="decoy1" onclick="toggleFlag(this)">the safety induction is complete</span> for each trainee.'],
    consequences: [
      {id:'figure', cat:'Figure', color:'var(--blue)', phrase:'"18 new drill machines"', options:["A false sense of completion could stop further ordering that is still needed.","Store records will not match on inspection, and untracked machines could go missing.","The delivery invoice number changes automatically.","The drill machines will be recalled by the manufacturer."], correct:1, explain:"The ledger actually shows 15 machines. A 3-unit gap that goes unnoticed means the store's real count is wrong."},
      {id:'date', cat:'Date', color:'var(--blue)', phrase:'"12 September"', options:["The machines will stop working after that date.","The store in-charge will be replaced.","Anyone checking the ledger against this note will think an entry is missing or wrong.","The invoice becomes legally invalid."], correct:2, explain:"The actual ledger entry date is 14 September. A wrong date breaks the trail between this note and the real record."},
      {id:'fact', cat:'Fact', color:'var(--blue)', phrase:'"never require servicing"', options:["The claim has no effect since it is just a note.","The training centre gets extra funding.","The machines will be returned to the supplier.","A machine could be used unsafely because no one schedules a check."], correct:3, explain:"No maintenance claim is ever safe to accept unchecked — servicing schedules come from the manufacturer, not from an AI-drafted note."},
      {id:'name', cat:'Name', color:'var(--blue)', phrase:'"Mr. Verma"', options:["The equipment ledger becomes invalid.","Follow-up questions or complaints go to the wrong person.","Mr. Verma will be asked to resign.","The delivery is cancelled."], correct:1, explain:"The roster lists Mr. Solanki as store in-charge. Anyone following up will contact the wrong person."},
      {id:'source', cat:'Source', color:'var(--blue)', phrase:'"completes the annual equipment target"', options:["The ledger entry is deleted.","The claim automatically gets verified by the system.","A false sense of completion could stop further ordering that is still needed.","The store in-charge loses their job."], correct:2, explain:"No target document is referenced anywhere. Treating this as settled could wrongly stop further equipment requests."}
    ]
  },
  higher: {
    title: "Campus Event Report",
    sections: ['On <span class="flag" data-real="true" data-cat="date" data-id="date" onclick="toggleFlag(this)">5 February</span>, the department hosted a guest lecture attended by <span class="flag" data-real="true" data-cat="figure" data-id="figure" onclick="toggleFlag(this)">220 students</span>, delivered by Dr. Kavita Iyer.', 'The lecture was <span class="flag" data-real="true" data-cat="fact" data-id="fact" onclick="toggleFlag(this)">the first cross-department session held this year</span>. Attendance was confirmed by the placement cell coordinator, <span class="flag" data-real="true" data-cat="name" data-id="name" onclick="toggleFlag(this)">Mr. Rao</span>, <span class="flag" data-real="true" data-cat="source" data-id="source" onclick="toggleFlag(this)">according to the sign-in sheet</span>.', 'A recording of the session will be <span class="flag" data-real="false" data-id="decoy1" onclick="toggleFlag(this)">shared with students who could not attend</span>.'],
    consequences: [
      {id:'figure', cat:'Figure', color:'var(--blue)', phrase:'"220 students"', options:["Room capacity and catering numbers get planned around a wrong figure next time.","The lecture recording gets deleted.","Dr. Iyer is asked to repeat the lecture.","The placement cell loses funding."], correct:0, explain:"The sign-in sheet shows 190 attendees. Planning future events on the inflated figure means over-booking rooms or catering."},
      {id:'date', cat:'Date', color:'var(--blue)', phrase:'"5 February"', options:["The guest lecture is cancelled retroactively.","Certificates or follow-up emails may reference the wrong date.","Dr. Iyer's fee changes.","The sign-in sheet becomes invalid."], correct:1, explain:"The actual date was 7 February. Certificates or official mentions built on this note would carry the wrong date."},
      {id:'fact', cat:'Fact', color:'var(--blue)', phrase:'"first cross-department session held this year"', options:["The department loses recognition for the event.","Dr. Iyer will not be invited again.","An inaccurate claim gets repeated in future promotional material.","The event has to be cancelled."], correct:2, explain:"This is a superlative claim with no comparison record shown. If it is false, it spreads into brochures and reports unchecked."},
      {id:'name', cat:'Name', color:'var(--blue)', phrase:'"Mr. Rao"', options:["The sign-in sheet is thrown out.","Follow-up queries go to the wrong person.","The event has to be re-verified by the dean.","Mr. Rao is removed from his post."], correct:1, explain:"The actual placement cell coordinator is Ms. Nair. Anyone with a follow-up question contacts the wrong staff member."},
      {id:'source', cat:'Source', color:'var(--blue)', phrase:'"according to the sign-in sheet"', options:["The sign-in sheet is destroyed after the event.","A specific claim gets falsely backed by a document that does not actually support it.","The department stops using sign-in sheets.","Dr. Iyer disputes the attendance count."], correct:1, explain:"The sign-in sheet only confirms attendance count, not the 'first cross-department' claim — citing it for that claim overstates what it actually shows."}
    ]
  }
};

var currentLane = 'iti';
var flagState = {};
var consequenceChoices = {};   // id -> chosen option index
var consequenceResult = {};    // id -> true/false once checked (cleared when the choice changes)
var findingsSubmitted = false;
var consequencesChecked = false;
var findScore = 0, falsePos = 0, consScore = 0;

var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
var ICON_MISS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
var ICON_FP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';
var ICON_FLAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18M5 4h11l-2 4 2 4H5"/></svg>';
var CQ_PROMPT = 'Choose the consequence, then press Check.';
var EMPTY_FINDINGS = '<p class="empty-note">Submit your findings first to see each result here.</p>';

/* The case file is paginated: each lane has 3 sections, rendered into the
   .doc-text[data-part] blocks on the three Investigate part slides. Flags live in one
   shared flagState, so they survive moving between the parts. */
function renderDoc(){
  var lane = laneDocs[currentLane];
  document.querySelectorAll('.docTitle').forEach(function(t){ t.textContent = lane.title; });
  document.querySelectorAll('.doc-text[data-part]').forEach(function(box){
    box.innerHTML = lane.sections[parseInt(box.getAttribute('data-part'), 10)] || '';
  });
  flagState = {};
  updateFlagUI();
  findingsSubmitted = false;
  consequencesChecked = false;
  resetFindingsUI();
}

function switchLane(){
  currentLane = document.getElementById('laneSelect').value;
  renderDoc();
  renderConsequenceList();
  updateGateResult();
  render();
}

function toggleFlag(el){
  el.classList.toggle('flagged');
  var id = el.getAttribute('data-id');
  flagState[id] = el.classList.contains('flagged');
  updateFlagUI();
}

function updateFlagUI(){
  var count = 0;
  Object.keys(flagState).forEach(function(k){ if(flagState[k]) count++; });
  document.querySelectorAll('.flagCount').forEach(function(b){ b.textContent = count; });
  // review list on the submit slide
  var chips = '';
  document.querySelectorAll('.doc-text .flag.flagged').forEach(function(el){
    chips += '<span class="review-chip">' + ICON_FLAG + el.textContent + '</span>';
  });
  document.getElementById('flagReview').innerHTML = chips || '<p class="empty-note">Nothing flagged yet.</p>';
}

/* ================= TIMER ================= */
var timerSeconds = 300;
var timerInterval = null;
var timerRunning = false;

function setTimerBtns(label, disabled){
  document.querySelectorAll('.timerBtn').forEach(function(b){ b.textContent = label; if(disabled) b.disabled = true; });
}

function toggleTimer(){
  if(timerRunning){
    clearInterval(timerInterval);
    timerRunning = false;
    setTimerBtns('Resume timer');
  } else {
    timerRunning = true;
    setTimerBtns('Pause timer');
    timerInterval = setInterval(function(){
      timerSeconds--;
      if(timerSeconds <= 0){
        timerSeconds = 0;
        clearInterval(timerInterval);
        timerRunning = false;
        setTimerBtns("Time's up", true);
      }
      updateTimerDisplay();
    }, 1000);
  }
}

function updateTimerDisplay(){
  var m = Math.floor(timerSeconds/60);
  var s = timerSeconds%60;
  var txt = (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
  document.querySelectorAll('.timerDisplay').forEach(function(d){ d.textContent = txt; });
}

/* ================= FINDINGS ================= */
function resetFindingsUI(){
  document.querySelectorAll('.findings-list').forEach(function(l){ l.innerHTML = EMPTY_FINDINGS; });
  document.getElementById('scoreRingText').textContent = '0/5';
  document.getElementById('scoreRing').style.background = '';
  document.getElementById('scoreHeadline').textContent = 'Submit your findings on the previous page first.';
  document.getElementById('submitFindingsBtn').classList.remove('is-done');
}

function submitFindings(){
  findingsSubmitted = true;
  var spans = document.querySelectorAll('.doc-text .flag');
  var found = 0, missed = 0, fp = 0;
  var rows = [];

  spans.forEach(function(el){
    var id = el.getAttribute('data-id');
    var isReal = el.getAttribute('data-real') === 'true';
    var isFlagged = !!flagState[id];
    if(isReal && isFlagged){
      found++;
      rows.push('<div class="finding-row found">'+ICON_OK+'<span><b>Found —</b> "' + el.textContent + '" was correctly flagged as planted.</span></div>');
    } else if(isReal && !isFlagged){
      missed++;
      rows.push('<div class="finding-row missed">'+ICON_MISS+'<span><b>Missed —</b> "' + el.textContent + '" was a planted error you did not flag.</span></div>');
    } else if(!isReal && isFlagged){
      fp++;
      rows.push('<div class="finding-row falsepos">'+ICON_FP+'<span><b>False flag —</b> "' + el.textContent + '" was actually correct as written.</span></div>');
    }
  });

  findScore = found;
  falsePos = fp;

  // paginate the result rows: 3 per slide (5 planted + at most 1 decoy = 2 slides)
  var lists = document.querySelectorAll('.findings-list');
  var per = Math.ceil(rows.length / lists.length) || 1;
  lists.forEach(function(l, i){
    var chunk = rows.slice(i*per, (i+1)*per);
    l.innerHTML = chunk.length ? chunk.join('') : '<p class="empty-note">No more findings — see the previous slide.</p>';
  });
  document.getElementById('scoreRingText').textContent = found + '/5';
  var pct = (found/5)*360;
  document.getElementById('scoreRing').style.background =
    'conic-gradient(var(--blue) ' + pct + 'deg, rgba(255,255,255,0.10) ' + pct + 'deg)';
  document.getElementById('scoreHeadline').textContent =
    found + ' of 5 planted errors found' + (fp>0 ? (', ' + fp + ' false flag' + (fp>1?'s':'')) : '') + '.';
  document.getElementById('submitFindingsBtn').classList.add('is-done');

  updateGateResult();
  current = slideById('findings');
  render();
}

/* ================= CONSEQUENCES (one question per slide) ================= */
function renderConsequenceList(){
  var lane = laneDocs[currentLane];
  consequenceChoices = {};
  consequenceResult = {};
  document.querySelectorAll('.cq-slot').forEach(function(slot){
    var idx = parseInt(slot.getAttribute('data-q'), 10);
    var item = lane.consequences[idx];
    var html = '<p class="kicker">Consequence ' + (idx+1) + ' of ' + lane.consequences.length + '</p>';
    html += '<h2>What does it break?</h2>';
    html += '<div class="cq-item" id="cq-'+item.id+'" data-correct="'+item.correct+'">';
    html += '<div class="cq-phrase"><span class="catlabel">'+item.cat+'</span>'+item.phrase+'</div>';
    html += '<div class="cq-options" role="radiogroup" aria-label="Choose the consequence">';
    item.options.forEach(function(opt, oi){
      html += '<button type="button" class="cq-opt" role="radio" aria-checked="false" data-i="'+oi+'" onclick="setConsequence(\''+item.id+'\', '+oi+')">'
            + '<span class="cq-letter">'+String.fromCharCode(65+oi)+'</span><span>'+opt+'</span></button>';
    });
    html += '</div>';
    html += '<div class="cq-feedback" id="cqf-'+item.id+'" aria-live="polite">'+CQ_PROMPT+'</div>';
    html += '</div>';
    slot.setAttribute('data-id', item.id);
    slot.innerHTML = html;
  });
}

function setConsequence(id, value){
  consequenceChoices[id] = value;
  delete consequenceResult[id];
  var item = document.getElementById('cq-'+id);
  item.classList.remove('right','wrong');
  item.querySelectorAll('.cq-opt').forEach(function(b){
    var on = parseInt(b.getAttribute('data-i'), 10) === value;
    b.classList.toggle('is-selected', on);
    b.classList.remove('is-right','is-wrong');
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  var fb = document.getElementById('cqf-'+id);
  fb.classList.remove('show');
  fb.textContent = CQ_PROMPT;
  updateGateResult();
  render();
}

function checkConsequence(id){
  var lane = laneDocs[currentLane];
  var item = lane.consequences.filter(function(c){ return c.id === id; })[0];
  var chosen = consequenceChoices[id];
  var el = document.getElementById('cq-'+id);
  var fb = document.getElementById('cqf-'+id);
  el.classList.remove('right','wrong');
  if(chosen === undefined || chosen === ''){
    fb.textContent = 'Pick one of the options first.';
    return;
  }
  var isRight = (parseInt(chosen, 10) === item.correct);
  consequenceResult[id] = isRight;
  el.classList.add(isRight ? 'right' : 'wrong');
  el.querySelectorAll('.cq-opt.is-selected').forEach(function(b){ b.classList.add(isRight ? 'is-right' : 'is-wrong'); });
  fb.classList.add('show');
  fb.textContent = (isRight ? 'Correct. ' : 'Not quite. ') + item.explain;
  checkConsequences();
  render();
}

/* recompute the consequence score across all five slides */
function checkConsequences(){
  var lane = laneDocs[currentLane];
  var rightCount = 0, checkedCount = 0;
  lane.consequences.forEach(function(item){
    if(item.id in consequenceResult){ checkedCount++; if(consequenceResult[item.id]) rightCount++; }
  });
  consScore = rightCount;
  consequencesChecked = (checkedCount === lane.consequences.length);
  updateGateResult();
}

/* ================= GATE RESULT ================= */
function updateGateResult(){
  var box = document.getElementById('gateResult');
  if(!findingsSubmitted || !consequencesChecked){
    var lane = laneDocs[currentLane];
    var done = Object.keys(consequenceResult).length;
    box.className = 'gate-result';
    document.getElementById('gateHeadline').textContent = 'Complete the investigation and consequence pages first';
    document.getElementById('gateSub').textContent = 'Your combined result will appear here.' +
      ' (Findings ' + (findingsSubmitted ? 'submitted' : 'not submitted yet') + ' · consequences checked: ' + done + '/' + lane.consequences.length + ')';
    return;
  }
  var passed = (findScore >= 4 && consScore >= 4);
  box.className = 'gate-result ' + (passed ? 'pass' : 'fail');
  document.getElementById('gateHeadline').textContent = passed
    ? 'Gate cleared'
    : 'Not yet — try this case again';
  document.getElementById('gateSub').textContent =
    'Errors found: ' + findScore + '/5 · False flags: ' + falsePos + ' · Consequences correct: ' + consScore + '/5. ' +
    (passed
      ? 'You found at least 4 of 5 planted errors and correctly stated at least 4 of 5 consequences — that clears this gate.'
      : 'This gate needs at least 4 of 5 errors found and 4 of 5 consequences correct. Go back, re-read the document, and try again.');
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', function(){
  buildTabs();
  renderDoc();
  renderConsequenceList();
  updateTimerDisplay();
  updateGateResult();
  render();
});
