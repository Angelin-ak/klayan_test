(function () {
  'use strict';

  /* ─── Config ─────────────────────────────────────────── */
  const API_URL  = 'https://kalayan-backend.onrender.com/chat';
  const END_URL  = 'https://kalayan-backend.onrender.com/end-chat';
  const TENANT   = 'kalyan';
  const BOT_NAME = 'Kalyan AI';
  const BOT_LOGO = 'https://kalyanjewellerymachines.com/assets/kALYAN%20LOGO%20(2).webp';

  const WELCOME_MESSAGES = [
    "👋 Welcome to Kalyan Engineering!",
    "I'm your AI assistant. I can help you with jewellery machines, pricing, and more.",
    "What can I help you with today? 😊"
  ];

  /* ─── Session ID ─────────────────────────────────────── */
  function genId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  let sessionId = genId();

  /* ─── Web Audio (no files needed) ────────────────────── */
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', vol = 0.18, delay = 0) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch(e) {}
  }

  function soundWelcome() {
    playTone(523, 0.18, 'sine', 0.16, 0);
    playTone(659, 0.18, 'sine', 0.14, 0.18);
    playTone(784, 0.28, 'sine', 0.18, 0.36);
  }

  function soundSend() {
    playTone(880, 0.1, 'sine', 0.1, 0);
    playTone(1100, 0.08, 'sine', 0.08, 0.1);
  }

  function soundReceive() {
    playTone(660, 0.12, 'sine', 0.12, 0);
    playTone(784, 0.18, 'sine', 0.10, 0.13);
  }

  function soundOpen() {
    playTone(440, 0.08, 'sine', 0.10, 0);
    playTone(554, 0.12, 'sine', 0.12, 0.08);
  }

  /* ─── CSS ─────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* === Keyframes === */
    @keyframes kb-bounce-in {
      0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
      55%  { transform: scale(1.18) rotate(5deg); }
      75%  { transform: scale(0.93) rotate(-2deg); }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }
    @keyframes kb-slide-up {
      from { transform: translateY(28px) scale(0.94); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
    @keyframes kb-fade-msg {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes kb-pulse-ring {
      0%   { transform: scale(1); opacity: .7; }
      70%  { transform: scale(1.65); opacity: 0; }
      100% { transform: scale(1.65); opacity: 0; }
    }
    @keyframes kb-dot-blink {
      0%, 80%, 100% { transform: scale(.6); opacity: .35; }
      40%           { transform: scale(1);  opacity: 1; }
    }
    @keyframes kb-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-7px); }
    }
    @keyframes kb-glow {
      0%, 100% { box-shadow: 0 0 18px 4px rgba(234,85,1,.5); }
      50%       { box-shadow: 0 0 38px 12px rgba(234,85,1,.22); }
    }
    @keyframes kb-greet-pop {
      0%   { transform: translateY(12px) scale(.88); opacity: 0; }
      60%  { transform: translateY(-4px) scale(1.03); opacity: 1; }
      100% { transform: translateY(0)    scale(1);    opacity: 1; }
    }
    @keyframes kb-greet-out {
      from { transform: translateY(0) scale(1);    opacity: 1; }
      to   { transform: translateY(8px) scale(.9); opacity: 0; }
    }
    @keyframes kb-particle {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--px),var(--py)) scale(0); opacity: 0; }
    }
    @keyframes kb-wave {
      0%   { transform: rotate(0deg); }
      20%  { transform: rotate(-15deg); }
      40%  { transform: rotate(15deg); }
      60%  { transform: rotate(-8deg); }
      80%  { transform: rotate(8deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes kb-shimmer-bar {
      0%   { background-position: -300px 0; }
      100% { background-position:  300px 0; }
    }
    @keyframes kb-badge-pop {
      0%   { transform: scale(0); }
      70%  { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    @keyframes kb-cursor-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0; }
    }

    /* === Wrapper === */
    #kb-wrap {
      position: fixed;
      bottom: 26px;
      right: 26px;
      z-index: 999999;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    }

    /* === Greeting Bubble (appears above button) === */
    #kb-greet {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 240px;
      background: linear-gradient(135deg, #1a1130 0%, #0f0c1a 100%);
      border: 1px solid rgba(234,85,1,0.35);
      border-radius: 18px 18px 4px 18px;
      padding: 14px 16px 12px;
      box-shadow: 0 12px 36px rgba(0,0,0,.55), 0 0 24px rgba(234,85,1,.12);
      display: none;
      flex-direction: column;
      gap: 8px;
    }
    #kb-greet.visible {
      display: flex;
      animation: kb-greet-pop .4s cubic-bezier(.25,.8,.25,1) both;
    }
    #kb-greet.hiding {
      animation: kb-greet-out .3s ease both;
    }
    .kb-greet-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }
    .kb-greet-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(234,85,1,.15);
      border: 1.5px solid rgba(234,85,1,.4);
      overflow: hidden;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .kb-greet-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .kb-greet-name {
      font-size: 12px; font-weight: 700;
      color: #ff8a50;
      line-height: 1.2;
    }
    .kb-greet-sub {
      font-size: 10px;
      color: rgba(255,255,255,.4);
    }
    #kb-greet-text {
      font-size: 13px;
      color: rgba(255,255,255,.88);
      line-height: 1.55;
      min-height: 18px;
    }
    .kb-greet-cursor {
      display: inline-block;
      width: 2px; height: 13px;
      background: #EA5501;
      margin-left: 1px;
      vertical-align: middle;
      animation: kb-cursor-blink .7s infinite;
    }
    .kb-greet-actions {
      display: flex;
      gap: 7px;
      margin-top: 2px;
      flex-wrap: wrap;
    }
    .kb-greet-btn {
      flex: 1;
      background: linear-gradient(135deg, #EA5501, #c43a00);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 11.5px;
      font-weight: 600;
      padding: 7px 10px;
      cursor: pointer;
      transition: all .2s;
      font-family: inherit;
      white-space: nowrap;
    }
    .kb-greet-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(234,85,1,.4); }
    .kb-greet-dismiss {
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      color: rgba(255,255,255,.5);
      font-size: 11.5px;
      padding: 7px 10px;
      cursor: pointer;
      transition: all .2s;
      font-family: inherit;
    }
    .kb-greet-dismiss:hover { background: rgba(255,255,255,.12); color: rgba(255,255,255,.8); }
    /* Arrow pointing to button */
    #kb-greet::after {
      content: '';
      position: absolute;
      bottom: -8px;
      right: 20px;
      width: 16px; height: 16px;
      background: #1a1130;
      border-right: 1px solid rgba(234,85,1,.35);
      border-bottom: 1px solid rgba(234,85,1,.35);
      transform: rotate(45deg);
    }

    /* Particles on welcome */
    .kb-particle {
      position: absolute;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #EA5501;
      pointer-events: none;
      animation: kb-particle .8s ease-out forwards;
    }

    /* === Toggle Button === */
    #kb-toggle {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #EA5501 0%, #c43a00 100%);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(234,85,1,.55);
      animation: kb-bounce-in .75s cubic-bezier(.36,.07,.19,.97) both, kb-glow 3.5s ease-in-out infinite 1.2s;
      transition: transform .2s ease, box-shadow .2s ease;
      position: relative;
    }
    #kb-toggle:hover { transform: scale(1.09); }
    .kb-ring {
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      border: 2px solid rgba(234,85,1,.6);
      animation: kb-pulse-ring 2.2s ease-out infinite;
    }
    .kb-ring2 { animation-delay: .7s; }

    #kb-toggle .kb-icon-chat  { position: absolute; transition: all .3s ease; }
    #kb-toggle .kb-icon-close { position: absolute; opacity: 0; transform: rotate(-90deg) scale(.7); transition: all .3s ease; }
    #kb-wrap.open #kb-toggle .kb-icon-chat  { opacity: 0; transform: rotate(90deg) scale(.7); }
    #kb-wrap.open #kb-toggle .kb-icon-close { opacity: 1; transform: rotate(0) scale(1); }

    /* Badge */
    #kb-badge {
      position: absolute;
      top: -5px; right: -5px;
      min-width: 22px; height: 22px;
      border-radius: 11px;
      background: #fff;
      color: #EA5501;
      font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #EA5501;
      padding: 0 4px;
      animation: kb-badge-pop .5s cubic-bezier(.36,.07,.19,.97) both 3.5s;
      opacity: 0;
    }
    #kb-badge.show { opacity: 1; }
    #kb-wrap.open #kb-badge { opacity: 0 !important; pointer-events: none; }

    /* === Chat Window === */
    #kb-win {
      position: absolute;
      bottom: 82px;
      right: 0;
      width: 375px;
      max-height: 600px;
      border-radius: 22px;
      background: linear-gradient(160deg, #0f0c1a 0%, #17112b 100%);
      border: 1px solid rgba(255,255,255,.08);
      box-shadow: 0 28px 70px rgba(0,0,0,.65), 0 0 50px rgba(234,85,1,.07);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    #kb-wrap.open #kb-win {
      display: flex;
      animation: kb-slide-up .38s cubic-bezier(.25,.8,.25,1) both;
    }

    /* === Header === */
    #kb-hdr {
      background: linear-gradient(90deg, #c43a00 0%, #EA5501 60%, #ff6a20 100%);
      padding: 15px 16px;
      display: flex; align-items: center; gap: 11px;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    #kb-hdr::before {
      content: '';
      position: absolute;
      top: -50%; left: -20%;
      width: 60%; height: 200%;
      background: rgba(255,255,255,.06);
      transform: rotate(-20deg);
      pointer-events: none;
    }
    .kb-hdr-av {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,.15);
      border: 2px solid rgba(255,255,255,.35);
      overflow: hidden;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .kb-hdr-av img { width: 100%; height: 100%; object-fit: cover; }
    .kb-hdr-info { flex: 1; }
    .kb-hdr-info h4 { margin: 0; color: #fff; font-size: 15px; font-weight: 700; }
    .kb-hdr-status { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
    .kb-online-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #4eff91;
      box-shadow: 0 0 7px #4eff91;
    }
    .kb-hdr-status span { font-size: 11px; color: rgba(255,255,255,.85); }
    .kb-hdr-close {
      background: rgba(0,0,0,.2);
      border: none;
      border-radius: 50%;
      width: 30px; height: 30px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background .2s;
    }
    .kb-hdr-close:hover { background: rgba(0,0,0,.38); }

    /* === Welcome section (inside window) === */
    #kb-win-welcome {
      padding: 24px 20px 18px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .kb-ww-icon {
      width: 70px; height: 70px;
      margin: 0 auto 13px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(234,85,1,.22) 0%, rgba(196,58,0,.08) 100%);
      border: 2px solid rgba(234,85,1,.3);
      display: flex; align-items: center; justify-content: center;
      animation: kb-float 3.2s ease-in-out infinite;
      overflow: hidden;
    }
    .kb-ww-icon img { width: 82%; height: 82%; object-fit: contain; }
    #kb-win-welcome h3 {
      margin: 0 0 5px;
      color: #fff;
      font-size: 16.5px;
      font-weight: 700;
    }
    .kb-wave-emoji { display: inline-block; animation: kb-wave .9s ease-in-out 1 .4s; }
    #kb-win-welcome p {
      margin: 0 0 14px;
      color: rgba(255,255,255,.5);
      font-size: 12.5px;
      line-height: 1.6;
    }
    .kb-chips {
      display: flex; flex-wrap: wrap; gap: 7px; justify-content: center;
    }
    .kb-chip {
      background: rgba(234,85,1,.11);
      border: 1px solid rgba(234,85,1,.28);
      color: #ff8a50;
      border-radius: 20px;
      padding: 5px 13px;
      font-size: 12px;
      cursor: pointer;
      transition: all .2s;
      font-family: inherit;
    }
    .kb-chip:hover {
      background: rgba(234,85,1,.24);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(234,85,1,.25);
    }

    /* === Messages === */
    #kb-msgs {
      flex: 1;
      overflow-y: auto;
      padding: 14px 13px;
      display: flex;
      flex-direction: column;
      gap: 11px;
      scrollbar-width: thin;
      scrollbar-color: rgba(234,85,1,.3) transparent;
    }
    #kb-msgs::-webkit-scrollbar { width: 4px; }
    #kb-msgs::-webkit-scrollbar-thumb { background: rgba(234,85,1,.3); border-radius: 4px; }

    .kb-m { display: flex; gap: 8px; animation: kb-fade-msg .3s ease both; }
    .kb-m.user { flex-direction: row-reverse; }

    .kb-m-av {
      width: 30px; height: 30px;
      border-radius: 50%;
      flex-shrink: 0;
      overflow: hidden;
      margin-top: auto;
      display: flex; align-items: center; justify-content: center;
    }
    .kb-m-av img { width: 100%; height: 100%; object-fit: cover; }
    .kb-m.bot .kb-m-av {
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.1);
    }
    .kb-m.user .kb-m-av {
      background: linear-gradient(135deg, #EA5501, #c43a00);
    }

    .kb-bub {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.6;
      word-break: break-word;
    }
    .kb-m.bot .kb-bub {
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.09);
      color: rgba(255,255,255,.9);
      border-bottom-left-radius: 4px;
    }
    .kb-m.user .kb-bub {
      background: linear-gradient(135deg, #EA5501, #c43a00);
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 16px rgba(234,85,1,.35);
    }

    .kb-sources { margin-top: 7px; display: flex; flex-wrap: wrap; gap: 4px; }
    .kb-src {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(234,85,1,.12);
      border: 1px solid rgba(234,85,1,.25);
      color: #ff8a50;
    }

    /* Typing */
    .kb-typing-bub {
      display: flex; gap: 5px;
      align-items: center;
      padding: 12px 16px;
    }
    .kb-typing-bub span {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: rgba(234,85,1,.75);
      animation: kb-dot-blink 1.4s infinite ease-in-out;
    }
    .kb-typing-bub span:nth-child(2) { animation-delay: .2s; }
    .kb-typing-bub span:nth-child(3) { animation-delay: .4s; }

    /* === Input === */
    #kb-inp-area {
      padding: 11px 13px 13px;
      border-top: 1px solid rgba(255,255,255,.06);
      display: flex; gap: 8px; align-items: flex-end;
      flex-shrink: 0;
      background: rgba(255,255,255,.02);
    }
    #kb-inp {
      flex: 1;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 14px;
      padding: 10px 14px;
      color: #fff;
      font-size: 13.5px;
      font-family: inherit;
      resize: none;
      outline: none;
      max-height: 100px;
      min-height: 42px;
      line-height: 1.5;
      transition: border-color .2s;
    }
    #kb-inp::placeholder { color: rgba(255,255,255,.28); }
    #kb-inp:focus { border-color: rgba(234,85,1,.5); }

    #kb-send-btn {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #EA5501, #c43a00);
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all .2s;
      box-shadow: 0 4px 14px rgba(234,85,1,.4);
    }
    #kb-send-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(234,85,1,.55); }
    #kb-send-btn:disabled { opacity: .38; cursor: not-allowed; transform: none; }

    #kb-footer-bar {
      text-align: center;
      padding: 5px 0 9px;
      font-size: 10px;
      color: rgba(255,255,255,.18);
      flex-shrink: 0;
    }

    /* Sound toggle */
    #kb-sound-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: rgba(255,255,255,.5);
      transition: color .2s;
      display: flex; align-items: center;
    }
    #kb-sound-btn:hover { color: #ff8a50; }

    @media (max-width: 480px) {
      #kb-win { width: calc(100vw - 22px); right: -13px; bottom: 76px; }
      #kb-wrap { bottom: 14px; right: 14px; }
      #kb-greet { width: 200px; }
    }
  `;
  document.head.appendChild(style);

  /* ─── HTML ───────────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.id = 'kb-wrap';
  wrap.innerHTML = `
    <!-- Greeting bubble -->
    <div id="kb-greet">
      <div class="kb-greet-header">
        <div class="kb-greet-avatar">
          <img src="${BOT_LOGO}" alt="Kalyan AI" onerror="this.style.display='none'">
        </div>
        <div>
          <div class="kb-greet-name">${BOT_NAME}</div>
          <div class="kb-greet-sub">Kalyan Engineering</div>
        </div>
      </div>
      <div id="kb-greet-text"></div>
      <div class="kb-greet-actions">
        <button class="kb-greet-btn" id="kb-greet-open">Chat with me 💬</button>
        <button class="kb-greet-dismiss" id="kb-greet-close">Maybe later</button>
      </div>
    </div>

    <!-- Main chat window -->
    <div id="kb-win">
      <div id="kb-hdr">
        <div class="kb-hdr-av">
          <img src="${BOT_LOGO}" alt="Kalyan" onerror="this.parentNode.innerHTML='<svg width=22 height=22 viewBox=&quot;0 0 24 24&quot; fill=&quot;white&quot;><path d=&quot;M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z&quot;/></svg>'">
        </div>
        <div class="kb-hdr-info">
          <h4>${BOT_NAME}</h4>
          <div class="kb-hdr-status">
            <div class="kb-online-dot"></div>
            <span>Online · Powered by RAG AI</span>
          </div>
        </div>
        <button id="kb-sound-btn" aria-label="Toggle sound" title="Toggle sound">
          <svg id="kb-snd-on" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg id="kb-snd-off" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="kb-hdr-close" aria-label="Close">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div id="kb-win-welcome">
        <div class="kb-ww-icon">
          <img src="${BOT_LOGO}" alt="Kalyan AI" onerror="this.style.display='none'">
        </div>
        <h3><span class="kb-wave-emoji">👋</span> Hi, I'm ${BOT_NAME}!</h3>
        <p>Ask me about Kalyan's jewellery machines,<br>services, pricing, or anything else.</p>
        <div class="kb-chips">
          <button class="kb-chip" data-q="What machines do you manufacture?">Our machines</button>
          <button class="kb-chip" data-q="Tell me about your rolling mills">Rolling mills</button>
          <button class="kb-chip" data-q="What is the price range of your machines?">Pricing</button>
          <button class="kb-chip" data-q="How can I contact Kalyan Engineering?">Contact us</button>
        </div>
      </div>

      <div id="kb-msgs"></div>

      <div id="kb-inp-area">
        <textarea id="kb-inp" placeholder="Ask about our machines…" rows="1" maxlength="500"></textarea>
        <button id="kb-send-btn" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div id="kb-footer-bar">Kalyan Engineering Corporation · AI powered</div>
    </div>

    <!-- Float button -->
    <button id="kb-toggle" aria-label="Open Kalyan AI chat">
      <div class="kb-ring"></div>
      <div class="kb-ring kb-ring2"></div>
      <span id="kb-badge"></span>
      <svg class="kb-icon-chat" width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg class="kb-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>
  `;
  document.body.appendChild(wrap);

  /* ─── Refs ───────────────────────────────────────────── */
  const toggle    = document.getElementById('kb-toggle');
  const win       = document.getElementById('kb-win');
  const msgs      = document.getElementById('kb-msgs');
  const inp       = document.getElementById('kb-inp');
  const sendBtn   = document.getElementById('kb-send-btn');
  const welcome   = document.getElementById('kb-win-welcome');
  const badge     = document.getElementById('kb-badge');
  const greet     = document.getElementById('kb-greet');
  const greetText = document.getElementById('kb-greet-text');
  const greetOpen = document.getElementById('kb-greet-open');
  const greetDis  = document.getElementById('kb-greet-close');
  const hdrClose  = document.querySelector('.kb-hdr-close');
  const soundBtn  = document.getElementById('kb-sound-btn');
  const sndOn     = document.getElementById('kb-snd-on');
  const sndOff    = document.getElementById('kb-snd-off');
  const chips     = document.querySelectorAll('.kb-chip');

  let isOpen    = false;
  let isLoading = false;
  let soundOn   = true;
  let greetShown = false;

  /* ─── Sound toggle ───────────────────────────────────── */
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    sndOn.style.display  = soundOn ? '' : 'none';
    sndOff.style.display = soundOn ? 'none' : '';
  });
  function trySound(fn) { if (soundOn) fn(); }

  /* ─── Particles ──────────────────────────────────────── */
  function spawnParticles(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const colors = ['#EA5501','#ff8a50','#ffab80','#fff','#c43a00'];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div');
      p.className = 'kb-particle';
      const angle = (Math.PI * 2 / 10) * i;
      const dist  = 30 + Math.random() * 30;
      p.style.setProperty('--px', (Math.cos(angle) * dist) + 'px');
      p.style.setProperty('--py', (Math.sin(angle) * dist) + 'px');
      p.style.background = colors[i % colors.length];
      p.style.left = (cx - 3) + 'px';
      p.style.top  = (cy - 3) + 'px';
      p.style.position = 'fixed';
      p.style.zIndex = '9999999';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }

  /* ─── Typewriter ─────────────────────────────────────── */
  function typeWriter(el, text, speed = 38) {
    return new Promise(resolve => {
      el.innerHTML = '';
      const cursor = document.createElement('span');
      cursor.className = 'kb-greet-cursor';
      el.appendChild(cursor);
      let i = 0;
      const iv = setInterval(() => {
        if (i < text.length) {
          cursor.insertAdjacentText('beforebegin', text[i]);
          i++;
        } else {
          clearInterval(iv);
          setTimeout(() => { cursor.remove(); resolve(); }, 500);
        }
      }, speed);
    });
  }

  /* ─── Show greeting bubble ───────────────────────────── */
  async function showGreeting() {
    if (greetShown || isOpen) return;
    greetShown = true;

    greet.classList.add('visible');
    trySound(soundWelcome);
    spawnParticles(toggle);

    badge.textContent = '1';
    badge.classList.add('show');

    // Type the welcome message
    const fullMsg = WELCOME_MESSAGES.join(' ');
    await typeWriter(greetText, fullMsg, 36);
  }

  /* ─── Dismiss greeting ───────────────────────────────── */
  function dismissGreet(open = false) {
    greet.classList.add('hiding');
    badge.classList.remove('show');
    setTimeout(() => {
      greet.classList.remove('visible', 'hiding');
      if (open) openChat();
    }, 320);
  }

  greetOpen.addEventListener('click', () => dismissGreet(true));
  greetDis.addEventListener('click',  () => dismissGreet(false));

  /* ─── Open / Close ───────────────────────────────────── */
  function openChat() {
    isOpen = true;
    wrap.classList.add('open');
    badge.classList.remove('show');
    trySound(soundOpen);
    setTimeout(() => inp.focus(), 300);
  }
  function closeChat() {
    isOpen = false;
    wrap.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    if (greet.classList.contains('visible')) { dismissGreet(true); return; }
    isOpen ? closeChat() : openChat();
  });
  hdrClose.addEventListener('click', closeChat);

  /* ─── Auto-resize textarea ───────────────────────────── */
  inp.addEventListener('input', () => {
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
  });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', sendMessage);

  /* ─── Quick chips ────────────────────────────────────── */
  chips.forEach(c => c.addEventListener('click', () => {
    inp.value = c.dataset.q || '';
    sendMessage();
  }));

  /* ─── Append message ─────────────────────────────────── */
  function appendMsg(role, text, sources) {
    if (welcome.style.display !== 'none') welcome.style.display = 'none';
    const m = document.createElement('div');
    m.className = `kb-m ${role}`;
    const avHTML = role === 'bot'
      ? `<div class="kb-m-av"><img src="${BOT_LOGO}" alt="bot" onerror="this.style.display='none'"></div>`
      : `<div class="kb-m-av"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="white" stroke-width="2"/></svg></div>`;
    let srcHTML = '';
    if (sources && sources.length)
      srcHTML = `<div class="kb-sources">${sources.slice(0,3).map(s=>`<span class="kb-src">📄 ${esc(s)}</span>`).join('')}</div>`;
    m.innerHTML = `${avHTML}<div class="kb-bub">${esc(text)}${srcHTML}</div>`;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'kb-m bot'; t.id = 'kb-typing';
    t.innerHTML = `<div class="kb-m-av"><img src="${BOT_LOGO}" alt="bot" onerror="this.style.display='none'"></div><div class="kb-bub kb-typing-bub"><span></span><span></span><span></span></div>`;
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() { const t = document.getElementById('kb-typing'); if (t) t.remove(); }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  /* ─── Send ───────────────────────────────────────────── */
  async function sendMessage() {
    const text = inp.value.trim();
    if (!text || isLoading) return;
    inp.value = ''; inp.style.height = 'auto';
    isLoading = true; sendBtn.disabled = true;
    trySound(soundSend);
    appendMsg('user', text);
    showTyping();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, tenant: TENANT, session_id: sessionId })
      });
      hideTyping();
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      trySound(soundReceive);
      appendMsg('bot', data.answer || 'Sorry, I could not generate a response.', data.sources);
    } catch (e) {
      hideTyping();
      appendMsg('bot', '⚠️ The AI server is warming up. Please try again in a moment.');
    } finally {
      isLoading = false; sendBtn.disabled = false; inp.focus();
    }
  }

  /* ─── Auto-welcome trigger ───────────────────────────── */
  // Show greeting bubble after 3.5 seconds on first visit
  const SHOWN_KEY = 'kb_greeted';
  const alreadyGreeted = sessionStorage.getItem(SHOWN_KEY);
  if (!alreadyGreeted) {
    setTimeout(() => {
      showGreeting();
      sessionStorage.setItem(SHOWN_KEY, '1');
    }, 3500);
  }

  /* ─── Session cleanup ────────────────────────────────── */
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon(`${END_URL}/${sessionId}`);
  });

})();
