/* ══════════════════════════════════════════
   CYPER NET — script.js
   Educational Cryptography Simulation
   ══════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.vx   = (Math.random() - 0.5) * 0.4;
    this.vy   = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 1.5 + 0.5;
    this.alpha= Math.random() * 0.4 + 0.1;
    const cols = ['#00f5ff','#a855f7','#00ff88','#3b82f6'];
    this.color = cols[Math.floor(Math.random() * cols.length)];
  }

  function makeParticles(n) {
    particles = [];
    for (let i = 0; i < n; i++) particles.push(new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // draw faint connection lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#00f5ff';
          ctx.globalAlpha = (1 - d / 100) * 0.07;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); makeParticles(60); });
  resize();
  makeParticles(60);
  draw();
})();

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */
function login() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const err  = document.getElementById('loginError');
  if (user === 'admin' && pass === '1234') {
    err.textContent = '';
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
  } else {
    err.textContent = '⚠ ACCESS DENIED — Invalid credentials';
    document.getElementById('loginPass').value = '';
  }
}

// allow Enter key on login
['loginUser','loginPass'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') login();
  })
);

function logout() {
  document.getElementById('mainApp').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

/* ─────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────── */
function showSection(name, navEl) {
  // deactivate all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // activate target
  const section = document.getElementById(name + 'Section');
  if (section) section.classList.add('active');
  if (navEl)   navEl.classList.add('active');

  // update top bar title
  const titles = {
    home: 'COMMAND HUB',
    symmetric: 'SYMMETRIC CRYPTOGRAPHY',
    asymmetric: 'ASYMMETRIC CRYPTOGRAPHY',
    hash: 'SHA-1 HASHING',
    dh: 'DIFFIE-HELLMAN EXCHANGE'
  };
  document.getElementById('topbarTitle').textContent = titles[name] || 'CYPER NET';

  // close mobile nav
  document.getElementById('sidenav').classList.remove('open');
}

function toggleNav() {
  const nav = document.getElementById('sidenav');
  nav.classList.toggle('open');
}

/* ─────────────────────────────────────────
   CRYPTO SIMULATION HELPERS
───────────────────────────────────────── */

/**
 * Simple XOR-based cipher (educational simulation).
 * Key is repeated / cycled across the text characters.
 */
function xorCipher(text, key) {
  if (!key) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/** Convert a binary string to hex */
function toHex(str) {
  return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join('');
}
/** Convert hex back to binary string */
function fromHex(hex) {
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return result;
}

/* ── SHA-1 simulation (simplified educational) ── */
function sha1Sim(message) {
  // Real SHA-1 is complex; we simulate with a deterministic digest
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const rotate = (n, x) => (x << n) | (x >>> (32 - n));
  for (let i = 0; i < message.length; i++) {
    const ch = message.charCodeAt(i);
    h0 = (rotate(5, h0) + (h1 & h2 | ~h1 & h3) + h4 + ch + 0x5A827999) >>> 0;
    h4 = h3; h3 = h2; h2 = rotate(30, h1); h1 = h0;
  }
  // second pass
  for (let i = message.length - 1; i >= 0; i--) {
    const ch = message.charCodeAt(i);
    h0 = (rotate(5, h0) + (h1 ^ h2 ^ h3) + h4 + ch + 0x6ED9EBA1) >>> 0;
    h4 = h3; h3 = h2; h2 = rotate(30, h1); h1 = h0;
  }
  const toHex32 = n => ('00000000' + n.toString(16)).slice(-8);
  return [h0,h1,h2,h3,h4].map(toHex32).join('');
}

/* ── Algorithm simulation dispatch ── */
function simEncrypt(algo, text, key) {
  switch (algo) {
    case 'AES':      return 'AES[' + toHex(xorCipher(text, key || 'AES-KEY')) + ']';
    case 'DES':      return 'DES[' + toHex(xorCipher(text, key || 'DESKEY!!')) + ']';
    case 'Blowfish': return 'BF[' + toHex(xorCipher(text, key || 'Blowfish')) + ']';
    case 'JCA':      return 'JCA[' + toHex(xorCipher(text, key || 'JCA-SIM')) + ']';
    case 'SHA1':     return sha1Sim(text);
    default:         return toHex(xorCipher(text, key || 'KEY'));
  }
}

function simDecrypt(algo, ciphertext, key) {
  try {
    const prefix = { AES:'AES[', DES:'DES[', Blowfish:'BF[', JCA:'JCA[' };
    const p = prefix[algo] || '';
    if (!ciphertext.startsWith(p)) return '[ERROR] Invalid ciphertext format for ' + algo;
    const hexPart = ciphertext.slice(p.length, -1);
    return xorCipher(fromHex(hexPart), key || algo + '-KEY');
  } catch(e) {
    return '[ERROR] Decryption failed. Check ciphertext format.';
  }
}

/* ── Security metadata ── */
const secMeta = {
  AES:      { pct: 92, level: 'STRONG',   color: '#00ff88', keyLen: '256-bit', vuln: 'None known', rec: 'Recommended for production use' },
  DES:      { pct: 28, level: 'WEAK',     color: '#ff6b00', keyLen: '56-bit',  vuln: 'Brute-force, DES-X', rec: 'Use AES instead' },
  Blowfish: { pct: 74, level: 'MODERATE', color: '#00f5ff', keyLen: '32–448-bit', vuln: 'Birthday attack', rec: 'Consider AES for new systems' },
  SHA1:     { pct: 44, level: 'MODERATE', color: '#ff6b00', keyLen: '160-bit hash', vuln: 'SHAttered collision', rec: 'Use SHA-256 or SHA-3' },
  JCA:      { pct: 60, level: 'MODERATE', color: '#00f5ff', keyLen: 'Variable', vuln: 'Simulation only', rec: 'Framework, not algorithm' },
  RSA:      { pct: 82, level: 'STRONG',   color: '#00ff88', keyLen: '2048-bit', vuln: 'Quantum threat', rec: 'Use 4096-bit for long-term' },
  DH:       { pct: 70, level: 'MODERATE', color: '#00f5ff', keyLen: 'Depends on p', vuln: 'MITM without auth', rec: 'Use with authentication' },
};

/* ─────────────────────────────────────────
   CIRCULAR SECURITY METER
───────────────────────────────────────── */
function drawMeter(canvasId, pct, color, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, r = 42;

  ctx.clearRect(0, 0, W, H);

  // track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 7;
  ctx.stroke();

  // arc
  const startAngle = -Math.PI / 2;
  const endAngle   = startAngle + (pct / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // percentage text
  ctx.font = 'bold 15px Orbitron, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pct + '%', cx, cy);
}

function updateSecurityPanel(meterCanvasId, labelId, detailsId, algoKey) {
  const m = secMeta[algoKey];
  if (!m) return;
  drawMeter(meterCanvasId, m.pct, m.color, m.level);
  const labelEl = document.getElementById(labelId);
  if (labelEl) {
    labelEl.textContent = m.level;
    labelEl.style.color = m.color;
    labelEl.style.textShadow = '0 0 8px ' + m.color;
  }
  const detEl = document.getElementById(detailsId);
  if (detEl) {
    detEl.innerHTML =
      `<div>🔑 Key: ${m.keyLen}</div>` +
      `<div>⚠ Vuln: ${m.vuln}</div>` +
      `<div>✔ Rec: ${m.rec}</div>`;
  }
}

/* ─────────────────────────────────────────
   SYMMETRIC OPERATIONS
───────────────────────────────────────── */
function updateSymOp() {
  const op       = document.getElementById('symOp').value;
  const algo     = document.getElementById('symAlgo').value;
  const keyField = document.getElementById('symKeyField');
  // SHA-1 hashing doesn't use a key
  keyField.style.display = (algo === 'SHA1' || op === 'hash') ? 'none' : 'block';
}

function updateSymInfo() {
  updateSymOp();
}

function runSymmetric() {
  const algo  = document.getElementById('symAlgo').value;
  const op    = document.getElementById('symOp').value;
  const input = document.getElementById('symInput').value.trim();
  const key   = document.getElementById('symKey').value.trim();

  if (!input) { showToast('⚠ Please enter input text', 'warn'); return; }

  let result = '';
  if (algo === 'SHA1' || op === 'hash') {
    result = sha1Sim(input);
    updateSecurityPanel('symMeter','symSecLabel','symSecDetails','SHA1');
  } else if (op === 'encrypt') {
    result = simEncrypt(algo, input, key);
    updateSecurityPanel('symMeter','symSecLabel','symSecDetails', algo);
  } else {
    result = simDecrypt(algo, input, key);
    updateSecurityPanel('symMeter','symSecLabel','symSecDetails', algo);
  }

  const resultEl = document.getElementById('symResult');
  typewriterEffect(resultEl, result);
}

/* ─────────────────────────────────────────
   ASYMMETRIC OPERATIONS
───────────────────────────────────────── */
function updateAsymInfo() {}

function runAsymmetric() {
  const algo  = document.getElementById('asymAlgo').value;
  const op    = document.getElementById('asymOp').value;
  const input = document.getElementById('asymInput').value.trim();
  const key   = document.getElementById('asymKey').value.trim();

  if (!input) { showToast('⚠ Please enter input text', 'warn'); return; }

  let result = '';
  if (algo === 'RSA') {
    if (op === 'encrypt') {
      result = 'RSA_PUB[' + toHex(xorCipher(input, key || 'RSA-PUBLIC-KEY')) + ']';
    } else {
      try {
        if (!input.startsWith('RSA_PUB[')) { result = '[ERROR] Invalid RSA ciphertext'; }
        else result = xorCipher(fromHex(input.slice(8,-1)), key || 'RSA-PUBLIC-KEY');
      } catch { result = '[ERROR] Decryption failed'; }
    }
    updateSecurityPanel('asymMeter','asymSecLabel','asymSecDetails','RSA');
  } else {
    // DH handled separately
    result = '[INFO] Use the Diffie-Hellman tab for DH key exchange';
    updateSecurityPanel('asymMeter','asymSecLabel','asymSecDetails','DH');
  }

  const resultEl = document.getElementById('asymResult');
  typewriterEffect(resultEl, result);
}

/* ─────────────────────────────────────────
   SHA-1 HASH SECTION
───────────────────────────────────────── */
function runHash() {
  const input = document.getElementById('hashInput').value.trim();
  if (!input) { showToast('⚠ Please enter text to hash', 'warn'); return; }
  const hash = sha1Sim(input);
  const resultEl = document.getElementById('hashResult');
  typewriterEffect(resultEl, hash);
  updateSecurityPanel('hashMeter','hashSecLabel','hashSecDetails','SHA1');
}

/* ─────────────────────────────────────────
   DIFFIE-HELLMAN
───────────────────────────────────────── */
function modPow(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp  = BigInt(exp);
  mod  = BigInt(mod);
  while (exp > 0n) {
    if (exp % 2n === 1n) result = result * base % mod;
    exp  = exp >> 1n;
    base = base * base % mod;
  }
  return Number(result);
}

function runDH() {
  const g = parseInt(document.getElementById('dhG').value);
  const p = parseInt(document.getElementById('dhP').value);
  const a = parseInt(document.getElementById('dhA').value);
  const b = parseInt(document.getElementById('dhB').value);

  if ([g,p,a,b].some(isNaN) || p < 2) {
    showToast('⚠ Invalid parameters. p must be prime ≥ 2', 'warn');
    return;
  }

  const A = modPow(g, a, p);   // Alice public key
  const B = modPow(g, b, p);   // Bob public key
  const sA = modPow(B, a, p);  // shared secret (Alice)
  const sB = modPow(A, b, p);  // shared secret (Bob)

  const lines = [
    '── PARAMETERS ──────────────────────',
    `  g (generator)  = ${g}`,
    `  p (prime)      = ${p}`,
    '',
    '── KEY GENERATION ───────────────────',
    `  Alice private  = ${a}`,
    `  Alice public   = g^a mod p = ${g}^${a} mod ${p} = ${A}`,
    '',
    `  Bob   private  = ${b}`,
    `  Bob   public   = g^b mod p = ${g}^${b} mod ${p} = ${B}`,
    '',
    '── SHARED SECRET ────────────────────',
    `  Alice computes: B^a mod p = ${B}^${a} mod ${p} = ${sA}`,
    `  Bob   computes: A^b mod p = ${A}^${b} mod ${p} = ${sB}`,
    '',
    sA === sB
      ? `✔ SHARED SECRET ESTABLISHED: ${sA}`
      : `✘ MISMATCH — Check parameters`,
  ];

  const resultEl = document.getElementById('dhResult');
  typewriterEffect(resultEl, lines.join('\n'));
  updateSecurityPanel('dhMeter','dhSecLabel','dhSecDetails','DH');
}

/* ─────────────────────────────────────────
   TYPEWRITER EFFECT
───────────────────────────────────────── */
function typewriterEffect(el, text) {
  el.textContent = '';
  let i = 0;
  const speed = Math.max(5, Math.min(25, Math.floor(800 / text.length)));
  function tick() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(tick, speed);
    }
  }
  tick();
}

/* ─────────────────────────────────────────
   COPY TO CLIPBOARD
───────────────────────────────────────── */
function copyOutput(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.textContent;
  navigator.clipboard.writeText(text)
    .then(() => showToast('✔ Copied to clipboard'))
    .catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✔ Copied to clipboard');
    });
}

/* ─────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────── */
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderColor = type === 'warn' ? 'var(--orange)' : 'var(--green)';
  toast.style.color = type === 'warn' ? 'var(--orange)' : 'var(--green)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ─────────────────────────────────────────
   ALGORITHM INFO MODAL
───────────────────────────────────────── */
const algoInfo = {
  AES: {
    title: 'AES — ADVANCED ENCRYPTION STANDARD',
    desc:  'AES is a symmetric block cipher adopted by NIST in 2001. It operates on 128-bit blocks using 128, 192, or 256-bit keys.',
    rows: [
      ['Type',        'Symmetric Block Cipher'],
      ['Block Size',  '128 bits'],
      ['Key Lengths', '128 / 192 / 256 bits'],
      ['Rounds',      '10 / 12 / 14'],
      ['Structure',   'Substitution-Permutation Network'],
      ['Use Cases',   'File encryption, TLS, VPN, databases'],
      ['Status',      '✔ Secure — No practical attacks known'],
    ]
  },
  DES: {
    title: 'DES — DATA ENCRYPTION STANDARD',
    desc:  'DES was the first widely adopted symmetric cipher, published in 1977. Its 56-bit key is now considered insecure due to brute-force attacks.',
    rows: [
      ['Type',        'Symmetric Block Cipher'],
      ['Block Size',  '64 bits'],
      ['Key Length',  '56 bits (64 bits with parity)'],
      ['Rounds',      '16'],
      ['Structure',   'Feistel Network'],
      ['Use Cases',   'Legacy systems only'],
      ['Status',      '⚠ BROKEN — Use AES'],
    ]
  },
  Blowfish: {
    title: 'BLOWFISH',
    desc:  'Blowfish is a fast, freely available block cipher designed by Bruce Schneier in 1993. Variable-length keys up to 448 bits.',
    rows: [
      ['Type',        'Symmetric Block Cipher'],
      ['Block Size',  '64 bits'],
      ['Key Length',  '32–448 bits'],
      ['Rounds',      '16'],
      ['Structure',   'Feistel Network'],
      ['Use Cases',   'Password hashing (bcrypt), VPN'],
      ['Status',      '⚠ Moderate — Small block size risk'],
    ]
  },
  SHA1: {
    title: 'SHA-1 — SECURE HASH ALGORITHM 1',
    desc:  'SHA-1 produces a 160-bit hash value. A practical collision attack (SHAttered) was demonstrated in 2017, making it insecure for certificates.',
    rows: [
      ['Type',        'Cryptographic Hash Function'],
      ['Output',      '160 bits (40 hex chars)'],
      ['Rounds',      '80'],
      ['Structure',   'Merkle–Damgård construction'],
      ['Use Cases',   'Legacy checksums, Git commits'],
      ['Status',      '⚠ WEAK — Use SHA-256 or SHA-3'],
    ]
  },
  JCA: {
    title: 'JCA — JAVA CRYPTOGRAPHY ARCHITECTURE',
    desc:  'JCA is not an algorithm but a framework that provides a unified API for cryptographic operations in Java. It supports AES, RSA, SHA and more.',
    rows: [
      ['Type',        'Cryptographic Framework'],
      ['Platform',    'Java SE'],
      ['Algorithms',  'AES, DES, RSA, SHA, DSA…'],
      ['Key Concept', 'Provider Architecture'],
      ['Use Cases',   'Java applications, Android'],
      ['Status',      'ℹ Framework — security depends on chosen algo'],
    ]
  },
  RSA: {
    title: 'RSA — RIVEST–SHAMIR–ADLEMAN',
    desc:  'RSA is an asymmetric algorithm based on the difficulty of factoring large integers. Widely used for key exchange and digital signatures.',
    rows: [
      ['Type',        'Asymmetric (Public-Key)'],
      ['Key Length',  '1024 / 2048 / 4096 bits'],
      ['Operation',   'Modular exponentiation'],
      ['Use Cases',   'TLS handshake, S/MIME, SSH keys'],
      ['Quantum Risk','⚠ Vulnerable to Shor\'s algorithm'],
      ['Status',      '✔ Secure with ≥ 2048-bit keys'],
    ]
  },
  DH: {
    title: 'DIFFIE-HELLMAN KEY EXCHANGE',
    desc:  'DH allows two parties to establish a shared secret over an insecure channel without prior shared knowledge, using modular arithmetic.',
    rows: [
      ['Type',        'Key Exchange Protocol'],
      ['Formula',     'K = g^(ab) mod p'],
      ['Security',    'Discrete Logarithm Problem'],
      ['Parameters',  'g (generator), p (prime)'],
      ['Use Cases',   'TLS/SSL, IPSec, SSH'],
      ['Weakness',    'Vulnerable to MITM without auth'],
      ['Status',      '✔ Secure with large p (2048+ bit)'],
    ]
  }
};

function showInfo(type) {
  let algo;
  if (type === 'sym')  algo = document.getElementById('symAlgo').value;
  if (type === 'asym') algo = document.getElementById('asymAlgo').value;
  if (type === 'dh')   algo = 'DH';

  const info = algoInfo[algo];
  if (!info) return;

  document.getElementById('modalTitle').textContent = info.title;
  const body = document.getElementById('modalBody');
  body.innerHTML =
    `<h4>OVERVIEW</h4><p>${info.desc}</p><h4>SPECIFICATIONS</h4>` +
    info.rows.map(([k,v]) =>
      `<div class="info-row"><span class="info-key">${k}</span><span class="info-val">${v}</span></div>`
    ).join('');

  document.getElementById('infoModal').classList.add('open');
}

function closeInfo() {
  document.getElementById('infoModal').classList.remove('open');
}

function closeModal(e) {
  if (e.target === document.getElementById('infoModal')) closeInfo();
}

/* ─────────────────────────────────────────
   INIT — set SHA-1 key field visibility
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateSymOp();
});
