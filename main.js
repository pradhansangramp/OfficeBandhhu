/* ================================================================
   OFFICE BANDHHU — main.js
   officebandhhu.com
   ================================================================ */

/* ── Auth State ─────────────────────────────────────────────── */
var _auth = (function(){
  try {
    var s = sessionStorage.getItem('ob_auth');
    if (s) { var d = JSON.parse(s); return { loggedIn: d.loggedIn||false, mobile: d.mobile||'', pendingOTP:'', callback:null }; }
  } catch(e) {}
  return { loggedIn:false, mobile:'', pendingOTP:'', callback:null };
})();

function saveAuth(){ try { sessionStorage.setItem('ob_auth', JSON.stringify({ loggedIn:_auth.loggedIn, mobile:_auth.mobile })); } catch(e){} }

/* ── Login Modal ─────────────────────────────────────────────── */
function openLoginModal(cb){
  _auth.callback = cb || null;
  var el = document.getElementById('loginModal');
  if(!el) return;
  document.getElementById('loginStep1').style.display = 'block';
  document.getElementById('loginStep2').style.display = 'none';
  document.getElementById('mobileInput').value = '';
  document.getElementById('mobileErr').textContent = '';
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function(){ document.getElementById('mobileInput').focus(); }, 100);
}

function closeLogin(){
  var el = document.getElementById('loginModal');
  if(el) el.classList.remove('open');
  document.body.style.overflow = '';
  _auth.callback = null;
}

function requireLogin(fn){
  if(_auth.loggedIn){ fn(); return; }
  openLoginModal(fn);
}

function sendOTP(){
  var mob = (document.getElementById('mobileInput').value||'').trim();
  if(!/^[6-9]\d{9}$/.test(mob)){
    document.getElementById('mobileErr').textContent = 'Please enter a valid 10-digit Indian mobile number.';
    return;
  }
  document.getElementById('mobileErr').textContent = '';
  _auth.mobile = mob;
  _auth.pendingOTP = String(Math.floor(100000 + Math.random()*900000));
  document.getElementById('mobileDisp').textContent = mob;
  document.getElementById('otpDemoMsg').innerHTML = '<strong>Demo OTP:</strong> ' + _auth.pendingOTP + '<br><small>(In production, this is sent via SMS)</small>';
  document.getElementById('otpInput').value = '';
  document.getElementById('otpErr').textContent = '';
  document.getElementById('loginStep1').style.display = 'none';
  document.getElementById('loginStep2').style.display = 'block';
  setTimeout(function(){ document.getElementById('otpInput').focus(); }, 100);
}

function verifyOTP(){
  var entered = (document.getElementById('otpInput').value||'').trim();
  if(entered.length !== 6){ document.getElementById('otpErr').textContent = 'Enter the 6-digit OTP.'; return; }
  if(entered !== _auth.pendingOTP){ document.getElementById('otpErr').textContent = 'Incorrect OTP. Please try again.'; return; }
  _auth.loggedIn = true;
  saveAuth();
  closeLogin();
  updateAuthUI();
  if(_auth.callback){ var cb = _auth.callback; _auth.callback = null; cb(); }
}

function resendOTP(){
  _auth.pendingOTP = String(Math.floor(100000 + Math.random()*900000));
  document.getElementById('otpDemoMsg').innerHTML = '<strong>New Demo OTP:</strong> ' + _auth.pendingOTP + '<br><small>(Resent successfully)</small>';
  document.getElementById('otpErr').textContent = '';
}

function changeNumber(){
  document.getElementById('loginStep1').style.display = 'block';
  document.getElementById('loginStep2').style.display = 'none';
}

function logout(){
  _auth.loggedIn = false;
  _auth.mobile = '';
  try { sessionStorage.removeItem('ob_auth'); } catch(e){}
  updateAuthUI();
}

function updateAuthUI(){
  var badge   = document.getElementById('userBadge');
  var logoutB = document.getElementById('logoutBtn');
  var loginB  = document.getElementById('loginBtn');
  var subBtn  = document.querySelector('.btn-sub-nav');
  if(_auth.loggedIn){
    var masked = '+91 ' + _auth.mobile.substring(0,5) + '*****';
    if(badge)  { badge.textContent = '👤 ' + masked; badge.style.display = 'inline-block'; }
    if(logoutB){ logoutB.style.display = 'inline-block'; }
    if(loginB) { loginB.style.display  = 'none'; }
    if(subBtn) { subBtn.style.display  = 'none'; }
  } else {
    if(badge)  { badge.style.display  = 'none'; }
    if(logoutB){ logoutB.style.display = 'none'; }
    if(loginB) { loginB.style.display  = 'inline-block'; }
    if(subBtn) { subBtn.style.display  = 'inline-block'; }
  }
}

/* ── Magazine Viewer ─────────────────────────────────────────── */
var curPg = 1; var totalPg = 5;
var issueData = { june2026: { name:'June 2026', vol:'Vol. 1, Issue 1' } };

function openViewer(id){
  requireLogin(function(){
    var modal = document.getElementById('magModal');
    if(!modal) return;
    curPg = 1;
    var d = issueData[id] || { name:id, vol:'' };
    document.getElementById('vwIssueName').textContent = d.name;
    renderPg();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

function closeViewer(){
  var modal = document.getElementById('magModal');
  if(modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function changePg(d){
  var n = curPg + d;
  if(n >= 1 && n <= totalPg){ curPg = n; renderPg(); }
}

function renderPg(){
  for(var i=1; i<=totalPg; i++){
    var el = document.getElementById('vp'+i);
    if(el) el.classList.toggle('active', i===curPg);
  }
  document.getElementById('pgInd').textContent = 'Page '+curPg+' of '+totalPg;
  document.getElementById('btnPrev').disabled = curPg===1;
  document.getElementById('btnNext').disabled = curPg===totalPg;
  var body = document.querySelector('.vw-body');
  if(body) body.scrollTop = 0;
}

function handleModalClick(e){
  if(e.target === document.getElementById('magModal')) closeViewer();
}

/* ── UI Helpers ──────────────────────────────────────────────── */
function toggleMenu(){ document.getElementById('mobileMenu').classList.toggle('open'); }

function switchTab(btn, paneId){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(paneId).classList.add('active');
}

function toggleFaq(el){
  var ans = el.nextElementSibling;
  var isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(q=>{ q.classList.remove('open'); q.nextElementSibling.classList.remove('open'); });
  if(!isOpen){ el.classList.add('open'); ans.classList.add('open'); }
}

function selPlan(el){
  document.querySelectorAll('.pw-plan').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
}

function handleNL(){
  var v = document.getElementById('nlEmail').value;
  if(!v||!v.includes('@')){ alert('Please enter a valid email address.'); return; }
  alert('Subscribed! We will be in touch.');
  document.getElementById('nlEmail').value = '';
}

function handleContact(e){
  e.preventDefault();
  alert('Message sent! We will reply within 2 business days.');
  e.target.reset();
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', updateAuthUI);
document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeViewer(); closeLogin(); } });
