/* ================= PAGE NAV (tab bar) ================= */
var TOTAL = 7;
var current = 0;
var tabIcons = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12h8M8 16h5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
];
var tabLabels = ["Brief","Why it matters","Prep","Investigate","Findings","Consequences","Result"];

function buildTabs(){
  var bar = document.getElementById('tabbar');
  bar.innerHTML = '';
  for(var i=0;i<TOTAL;i++){
    var t = document.createElement('div');
    t.className = 'tab';
    t.setAttribute('data-i', i);
    t.onclick = (function(idx){ return function(){ current = idx; render(); }; })(i);
    t.innerHTML = tabIcons[i] + '<span>' + tabLabels[i] + '</span>';
    bar.appendChild(t);
  }
}

function render(){
  document.querySelectorAll('.page').forEach(function(p){
    p.classList.toggle('active', parseInt(p.getAttribute('data-page')) === current);
  });
  document.querySelectorAll('.tab').forEach(function(t){
    var i = parseInt(t.getAttribute('data-i'));
    t.classList.toggle('active', i === current);
    t.classList.toggle('done', i < current);
  });
  document.getElementById('pageCount').textContent = (current+1) + ' / ' + TOTAL;
  document.getElementById('backBtn').disabled = (current === 0);
  document.getElementById('nextBtn').disabled = (current === TOTAL-1);
  window.scrollTo({top:0, behavior:'smooth'});
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
    html: 'On <span class="flag" data-real="true" data-cat="date" data-id="date" onclick="toggleFlag(this)">12 September</span>, the workshop received <span class="flag" data-real="true" data-cat="figure" data-id="figure" onclick="toggleFlag(this)">18 new drill machines</span>, delivered by Bansal Tools Pvt. Ltd. All machines are rated for continuous use and <span class="flag" data-real="true" data-cat="fact" data-id="fact" onclick="toggleFlag(this)">never require servicing</span>. The batch has been recorded by the store in-charge, <span class="flag" data-real="true" data-cat="name" data-id="name" onclick="toggleFlag(this)">Mr. Verma</span>, in the equipment ledger. This delivery <span class="flag" data-real="true" data-cat="source" data-id="source" onclick="toggleFlag(this)">completes the annual equipment target for the training centre</span>. Machines will be issued to batches starting next week, once <span class="flag" data-real="false" data-id="decoy1" onclick="toggleFlag(this)">the safety induction is complete</span> for each trainee.',
    consequences: [
      {id:'figure', cat:'Figure', color:'var(--teal)', phrase:'"18 new drill machines"', options:["A false sense of completion could stop further ordering that is still needed.","Store records will not match on inspection, and untracked machines could go missing.","The delivery invoice number changes automatically.","The drill machines will be recalled by the manufacturer."], correct:1, explain:"The ledger actually shows 15 machines. A 3-unit gap that goes unnoticed means the store's real count is wrong."},
      {id:'date', cat:'Date', color:'var(--purple)', phrase:'"12 September"', options:["The machines will stop working after that date.","The store in-charge will be replaced.","Anyone checking the ledger against this note will think an entry is missing or wrong.","The invoice becomes legally invalid."], correct:2, explain:"The actual ledger entry date is 14 September. A wrong date breaks the trail between this note and the real record."},
      {id:'fact', cat:'Fact', color:'var(--royal)', phrase:'"never require servicing"', options:["The claim has no effect since it is just a note.","The training centre gets extra funding.","The machines will be returned to the supplier.","A machine could be used unsafely because no one schedules a check."], correct:3, explain:"No maintenance claim is ever safe to accept unchecked — servicing schedules come from the manufacturer, not from an AI-drafted note."},
      {id:'name', cat:'Name', color:'var(--coral)', phrase:'"Mr. Verma"', options:["The equipment ledger becomes invalid.","Follow-up questions or complaints go to the wrong person.","Mr. Verma will be asked to resign.","The delivery is cancelled."], correct:1, explain:"The roster lists Mr. Solanki as store in-charge. Anyone following up will contact the wrong person."},
      {id:'source', cat:'Source', color:'var(--gold)', phrase:'"completes the annual equipment target"', options:["The ledger entry is deleted.","The claim automatically gets verified by the system.","A false sense of completion could stop further ordering that is still needed.","The store in-charge loses their job."], correct:2, explain:"No target document is referenced anywhere. Treating this as settled could wrongly stop further equipment requests."}
    ]
  },
  higher: {
    title: "Campus Event Report",
    html: 'On <span class="flag" data-real="true" data-cat="date" data-id="date" onclick="toggleFlag(this)">5 February</span>, the department hosted a guest lecture attended by <span class="flag" data-real="true" data-cat="figure" data-id="figure" onclick="toggleFlag(this)">220 students</span>, delivered by Dr. Kavita Iyer. The lecture was <span class="flag" data-real="true" data-cat="fact" data-id="fact" onclick="toggleFlag(this)">the first cross-department session held this year</span>. Attendance was confirmed by the placement cell coordinator, <span class="flag" data-real="true" data-cat="name" data-id="name" onclick="toggleFlag(this)">Mr. Rao</span>, <span class="flag" data-real="true" data-cat="source" data-id="source" onclick="toggleFlag(this)">according to the sign-in sheet</span>. A recording of the session will be <span class="flag" data-real="false" data-id="decoy1" onclick="toggleFlag(this)">shared with students who could not attend</span>.',
    consequences: [
      {id:'figure', cat:'Figure', color:'var(--teal)', phrase:'"220 students"', options:["Room capacity and catering numbers get planned around a wrong figure next time.","The lecture recording gets deleted.","Dr. Iyer is asked to repeat the lecture.","The placement cell loses funding."], correct:0, explain:"The sign-in sheet shows 190 attendees. Planning future events on the inflated figure means over-booking rooms or catering."},
      {id:'date', cat:'Date', color:'var(--purple)', phrase:'"5 February"', options:["The guest lecture is cancelled retroactively.","Certificates or follow-up emails may reference the wrong date.","Dr. Iyer's fee changes.","The sign-in sheet becomes invalid."], correct:1, explain:"The actual date was 7 February. Certificates or official mentions built on this note would carry the wrong date."},
      {id:'fact', cat:'Fact', color:'var(--royal)', phrase:'"first cross-department session held this year"', options:["The department loses recognition for the event.","Dr. Iyer will not be invited again.","An inaccurate claim gets repeated in future promotional material.","The event has to be cancelled."], correct:2, explain:"This is a superlative claim with no comparison record shown. If it is false, it spreads into brochures and reports unchecked."},
      {id:'name', cat:'Name', color:'var(--coral)', phrase:'"Mr. Rao"', options:["The sign-in sheet is thrown out.","Follow-up queries go to the wrong person.","The event has to be re-verified by the dean.","Mr. Rao is removed from his post."], correct:1, explain:"The actual placement cell coordinator is Ms. Nair. Anyone with a follow-up question contacts the wrong staff member."},
      {id:'source', cat:'Source', color:'var(--gold)', phrase:'"according to the sign-in sheet"', options:["The sign-in sheet is destroyed after the event.","A specific claim gets falsely backed by a document that does not actually support it.","The department stops using sign-in sheets.","Dr. Iyer disputes the attendance count."], correct:1, explain:"The sign-in sheet only confirms attendance count, not the 'first cross-department' claim — citing it for that claim overstates what it actually shows."}
    ]
  }
};

var currentLane = 'iti';
var flagState = {};
var consequenceChoices = {};
var findingsSubmitted = false;
var consequencesChecked = false;
var findScore = 0, falsePos = 0, consScore = 0;

function renderDoc(){
  var lane = laneDocs[currentLane];
  document.getElementById('docTitle').textContent = lane.title;
  document.getElementById('docText').innerHTML = lane.html;
  flagState = {};
  document.getElementById('flagCount').textContent = '0';
  findingsSubmitted = false;
  consequencesChecked = false;
}

function switchLane(){
  currentLane = document.getElementById('laneSelect').value;
  renderDoc();
  renderConsequenceList();
}

function toggleFlag(el){
  el.classList.toggle('flagged');
  var id = el.getAttribute('data-id');
  flagState[id] = el.classList.contains('flagged');
  var count = 0;
  Object.keys(flagState).forEach(function(k){ if(flagState[k]) count++; });
  document.getElementById('flagCount').textContent = count;
}

/* ================= TIMER ================= */
var timerSeconds = 300;
var timerInterval = null;
var timerRunning = false;

function toggleTimer(){
  var btn = document.getElementById('timerBtn');
  if(timerRunning){
    clearInterval(timerInterval);
    timerRunning = false;
    btn.textContent = 'Resume timer';
  } else {
    timerRunning = true;
    btn.textContent = 'Pause timer';
    timerInterval = setInterval(function(){
      timerSeconds--;
      if(timerSeconds <= 0){
        timerSeconds = 0;
        clearInterval(timerInterval);
        timerRunning = false;
        btn.textContent = "Time's up";
        btn.disabled = true;
      }
      updateTimerDisplay();
    }, 1000);
  }
}

function updateTimerDisplay(){
  var m = Math.floor(timerSeconds/60);
  var s = timerSeconds%60;
  document.getElementById('timerDisplay').textContent =
    (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
}

/* ================= FINDINGS ================= */
function submitFindings(){
  findingsSubmitted = true;
  var lane = laneDocs[currentLane];
  var spans = document.querySelectorAll('#docText .flag');
  var found = 0, missed = 0, fp = 0;
  var listHtml = '';

  spans.forEach(function(el){
    var id = el.getAttribute('data-id');
    var isReal = el.getAttribute('data-real') === 'true';
    var isFlagged = !!flagState[id];
    if(isReal && isFlagged){
      found++;
      listHtml += '<div class="finding-row found"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span><b>Found —</b> "' + el.textContent + '" was correctly flagged as planted.</span></div>';
    } else if(isReal && !isFlagged){
      missed++;
      listHtml += '<div class="finding-row missed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg><span><b>Missed —</b> "' + el.textContent + '" was a planted error you did not flag.</span></div>';
    } else if(!isReal && isFlagged){
      fp++;
      listHtml += '<div class="finding-row falsepos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg><span><b>False flag —</b> "' + el.textContent + '" was actually correct as written.</span></div>';
    }
  });

  findScore = found;
  falsePos = fp;

  document.getElementById('findingsList').innerHTML = listHtml;
  document.getElementById('scoreRingText').textContent = found + '/5';
  var pct = (found/5)*360;
  document.getElementById('scoreRing').style.background =
    'conic-gradient(var(--royal) ' + pct + 'deg, #D6DEFF ' + pct + 'deg)';
  document.getElementById('scoreHeadline').textContent =
    found + ' of 5 planted errors found' + (fp>0 ? (', ' + fp + ' false flag' + (fp>1?'s':'')) : '') + '.';

  current = 4;
  render();
}

/* ================= CONSEQUENCES ================= */
function renderConsequenceList(){
  var lane = laneDocs[currentLane];
  var html = '';
  lane.consequences.forEach(function(item, idx){
    html += '<div class="cq-item" id="cq-'+item.id+'" data-correct="'+item.correct+'">';
    html += '<div class="cq-phrase"><span class="catlabel" style="background:'+item.color+';">'+item.cat+'</span>'+item.phrase+'</div>';
    html += '<select class="q-select" onchange="setConsequence(\''+item.id+'\', this.value)"><option value="">Choose the consequence…</option>';
    item.options.forEach(function(opt, oi){
      html += '<option value="'+oi+'">'+opt+'</option>';
    });
    html += '</select>';
    html += '<div class="cq-feedback" id="cqf-'+item.id+'"></div>';
    html += '</div>';
  });
  document.getElementById('cqList').innerHTML = html;
  consequenceChoices = {};
}

function setConsequence(id, value){
  consequenceChoices[id] = value;
  var item = document.getElementById('cq-'+id);
  item.classList.remove('right','wrong');
  document.getElementById('cqf-'+id).classList.remove('show');
}

function checkConsequences(){
  var lane = laneDocs[currentLane];
  var rightCount = 0;
  lane.consequences.forEach(function(item){
    var chosen = consequenceChoices[item.id];
    var el = document.getElementById('cq-'+item.id);
    var fb = document.getElementById('cqf-'+item.id);
    el.classList.remove('right','wrong');
    if(chosen === undefined || chosen === ''){ return; }
    var isRight = (parseInt(chosen) === item.correct);
    el.classList.add(isRight ? 'right' : 'wrong');
    fb.classList.add('show');
    fb.textContent = (isRight ? 'Correct. ' : 'Not quite. ') + item.explain;
    if(isRight) rightCount++;
  });
  consScore = rightCount;
  consequencesChecked = true;
  updateGateResult();
}

/* ================= GATE RESULT ================= */
function updateGateResult(){
  if(!findingsSubmitted || !consequencesChecked) return;
  var box = document.getElementById('gateResult');
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
  render();
});