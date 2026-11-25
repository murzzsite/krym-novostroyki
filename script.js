const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/NYU5SN9AV4';
window.KR = { p: 0, reduce: matchMedia('(prefers-reduced-motion: reduce)').matches };
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.KR.reduce;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const safe = fn => { try { fn(); } catch (e) { console.error(e); } };
  const NB = ' ';
  const money = n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, NB) + NB + '₽';
  const mln = n => { const v = Math.round(n / 1e5) / 10; return String(v).replace('.', ',') + NB + 'млн' + NB + '₽'; };

  // header + hero intro
  safe(() => {
    const bar = $('#bar');
    const on = () => bar.classList.toggle('stuck', scrollY > 24);
    addEventListener('scroll', on, { passive: true }); on();
    document.addEventListener('DOMContentLoaded', () => {
      const h1 = $('.hero__title');
      if (h1 && h1.querySelector('.mk-w')) {
        const kids = [...h1.childNodes]; h1.textContent = '';
        let w = null;
        kids.forEach(n => {
          if (n.nodeType === 1) { if (!w) { w = document.createElement('span'); w.className = 'mk-word'; h1.appendChild(w); } w.appendChild(n); }
          else { w = null; h1.appendChild(document.createTextNode(' ')); }
        });
      }
      $$('.hero__title .mk-w').forEach((s, i) => s.style.setProperty('--i', i));
      requestAnimationFrame(() => root.classList.add('intro'));
    });
    setTimeout(() => root.classList.add('intro'), 1500);
  });

  // range fill
  const paintRange = r => r.style.setProperty('--f', ((r.value - r.min) / (r.max - r.min) * 100) + '%');

  // ---- who: tabs ----
  safe(() => {
    const D = [
      ['Вы не подходите под семейную, IT или другие льготные программы, а обычная рыночная ипотека кажется слишком дорогой.', 'Проверим, можете ли вы воспользоваться ипотекой от 8% на новостройки Крыма и Севастополя, и посчитаем платёж до того, как вы выберете квартиру. Если не подойдёте, скажем прямо и покажем другие варианты.'],
      ['Хочется квартиру у моря: для отдыха, будущего переезда или жизни. Но Крым кажется дорогим, а платёж пугает.', 'Подберём новостройку под бюджет и цель, сравним застройщиков, посчитаем первоначальный взнос и ежемесячный платёж. Вы увидите реальные цифры, а не «от».'],
      ['Нужен объект для сдачи в аренду или долгосрочного вложения, и важно не ошибиться с застройщиком.', 'Сравним объекты разных застройщиков под вашу цель и посчитаем платёж. Доходность и рост цен не обещаем: даём цифры и условия, решение за вами.'],
      ['Вы не в Крыму, не знаете местный рынок и застройщиков, а приехать посмотреть объекты нет возможности.', 'Консультация, подбор и сопровождение проходят дистанционно. Работаем с покупателями из любого региона России, вместе пройдём каждый этап сделки.']
    ];
    const pain = $('#whoPain'), doo = $('#whoDo'), items = $$('#whoTabs [data-pill-item]');
    const set = i => {
      [pain, doo].forEach(e => { e.classList.remove('swap'); void e.offsetWidth; e.classList.add('swap'); });
      pain.textContent = D[i][0]; doo.textContent = D[i][1];
    };
    items.forEach((b, i) => b.addEventListener('click', () => set(i)));
    set(0);
  });

  // ---- calculator ----
  let calcSummary = '';
  safe(() => {
    const iP = $('#iPrice'), iD = $('#iDown'), iT = $('#iTerm');
    const oP = $('#oPrice'), oD = $('#oDown'), oT = $('#oTerm'), oPay = $('#oPay'), oLoan = $('#oLoan');
    const gA = document.createElementNS('http://www.w3.org/2000/svg', 'g'), gB = gA.cloneNode();
    const wave = cls => { let d = 'M-110 0'; for (let x = -110; x < 440; x += 110) d += ` q27.5 -9 55 0 t55 0`; return `<path class="wv ${cls}" d="${d} V420 H-110 Z"/>`; };
    gA.innerHTML = wave('wv--a'); gB.innerHTML = wave('wv--b');
    const base = $('#wBase'); base.innerHTML = ''; base.append(gA, gB);
    const lPr = $('#lblPr');
    const MAXV = 55e6, TOP = 292, H = 276;
    let cur = { pay: 0, loan: 0, int: 0, all: 0, a: 0, b: 0 }, goal = null, raf = 0;
    const calc = () => {
      const price = +iP.value * 1e6, down = +iD.value / 100, n = +iT.value * 12, r = 0.08 / 12;
      const loan = price * (1 - down);
      const pay = loan * r / (1 - Math.pow(1 + r, -n));
      const all = pay * n, int = all - loan;
      return { price, down, term: +iT.value, loan, pay, all, int };
    };
    const render = () => {
      [iP, iD, iT].forEach(paintRange);
      const c = calc();
      oP.textContent = mln(c.price);
      oD.textContent = Math.round(c.down * 100) + '%' + NB + '·' + NB + mln(c.price * c.down);
      const t = c.term; oT.textContent = t + NB + (t % 10 === 1 && t !== 11 ? 'год' : (t % 10 >= 2 && t % 10 <= 4 && (t < 12 || t > 14)) ? 'года' : 'лет');
      goal = { pay: c.pay, loan: c.loan, int: c.int, all: c.all, a: .2 + .8 * Math.min(1, c.all / MAXV), b: .2 + .8 * Math.min(1, c.loan / MAXV) };
      calcSummary = `Расчёт: квартира ${mln(c.price)}, взнос ${Math.round(c.down * 100)}% (${mln(c.price * c.down)}), срок ${c.term} лет, ставка 8%, платёж около ${money(c.pay)} в месяц`;
      const cf = $('#calcField'); if (cf) cf.value = calcSummary;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0; let moving = false;
      for (const k of ['pay', 'loan', 'int', 'all', 'a', 'b']) {
        const d = goal[k] - cur[k]; const small = k === 'a' || k === 'b' ? 0.0005 : 1;
        if (Math.abs(d) > small) { cur[k] += reduce ? d : d * 0.16; moving = true; } else cur[k] = goal[k];
      }
      oPay.textContent = money(cur.pay); oLoan.textContent = money(cur.loan);
      const ya = TOP - H * cur.a, yb = TOP - H * cur.b;
      gA.setAttribute('transform', `translate(0 ${ya})`); gB.setAttribute('transform', `translate(0 ${yb})`);
      const box = $('.vessel').getBoundingClientRect(), hh = box.height / 300;
      lPr.style.top = ((yb + 18) * hh) + 'px'; lPr.style.opacity = (TOP - yb) * hh > 44 ? 1 : 0; lPr.textContent = 'Кредит ' + mln(cur.loan);
      if (moving) raf = requestAnimationFrame(tick);
    };
    [iP, iD, iT].forEach(i => i.addEventListener('input', render));
    addEventListener('resize', () => { if (goal && !raf) raf = requestAnimationFrame(tick); });
    render();
    $('#saveCalc').addEventListener('click', () => { const cf = $('#calcField'); if (cf) cf.value = calcSummary; });
  });

  // ---- route chart ----
  safe(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const proj = ([lo, la]) => [150 + (lo - 32.4) * 165, 90 + (46.3 - la) * 230];
    const COAST = [[33.65, 46.15], [33.1, 45.95], [32.85, 45.75], [32.65, 45.5], [32.5, 45.35], [32.85, 45.3], [33.37, 45.2], [33.6, 45.1], [33.5, 44.9], [33.4, 44.75], [33.52, 44.64], [33.38, 44.58], [33.49, 44.5], [33.6, 44.5], [33.74, 44.39], [34.17, 44.49], [34.4, 44.67], [34.97, 44.85], [35.37, 45.03], [35.8, 45.0], [36.2, 45.08], [36.45, 45.1], [36.55, 45.3], [36.1, 45.43], [35.6, 45.35], [35.3, 45.55], [35.1, 45.75], [34.9, 46.0], [34.3, 46.15]].map(proj);
    const closed = pts => {
      const n = pts.length; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
      }
      return d + 'Z';
    };
    const dLand = closed(COAST);
    $('#land').setAttribute('d', dLand);
    const mk = (tag, a, par) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); par.appendChild(e); return e; };
    [[70, .07], [50, .1], [32, .14], [16, .2]].forEach(([w, o]) => mk('path', { d: dLand, class: 'sea-ring', 'stroke-width': w, opacity: o }, $('#seaRings')));
    [.86, .7, .54, .38].forEach(s => mk('path', { d: dLand, class: 'cont', transform: `translate(560 320) scale(${s}) translate(-560 -320)`, 'vector-effect': 'non-scaling-stroke' }, $('#contours')));

    // route
    const dR = 'M50,48 C200,40 300,70 356,125 S440,300 430,400 S350,450 335,476';
    const rb = $('#routeBase'), rl = $('#routeLive'); rb.setAttribute('d', dR); rl.setAttribute('d', dR);
    const L = rl.getTotalLength(); rl.style.strokeDasharray = L; rl.style.strokeDashoffset = L;
    const steps = $$('#steps li'), N = steps.length, track = $$('.route__track i');
    $('#route').style.setProperty('--n', N);

    // city pins
    const CITIES = [['Севастополь', [33.52, 44.62], -1], ['Симферополь', [34.1, 44.95], 1], ['Евпатория', [33.37, 45.2], -1]];
    const pinsG = $('#pins');
    const wrap = $('#chartWrap'), svgEl = $('#chart'), labels = [];
    const addLabel = (txt, x, y, side, cls) => {
      const l = document.createElement('span'); l.className = 'lbl ' + (cls || 'lbl--c') + (side < 0 ? ' lbl--l' : ' lbl--r'); l.textContent = txt;
      wrap.appendChild(l); labels.push([l, x, y]); return l;
    };
    const place = () => {
      const m = svgEl.getScreenCTM(), wr = wrap.getBoundingClientRect(); if (!m) return;
      labels.forEach(([l, x, y]) => { l.style.left = (m.a * x + m.e - wr.left) + 'px'; l.style.top = (m.d * y + m.f - wr.top) + 'px'; });
    };
    CITIES.forEach(([n, ll, side]) => {
      const [x, y] = proj(ll);
      const g = mk('g', { class: 'pin', tabindex: 0, role: 'button', 'aria-label': 'Город ' + n }, pinsG);
      mk('circle', { cx: x, cy: y, r: 8 }, g);
      const lb = addLabel(n, x, y, side);
      const pick = () => { $('.pin').forEach(p => p.classList.toggle('on', p === g)); $('.lbl--c').forEach(l => l.classList.toggle('on', l === lb)); const sel = $('#citySel'); if (sel) sel.value = n; };
      g._lb = lb; lb.addEventListener('click', pick);
      g.addEventListener('click', pick); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    const sevCity = $('.pin')[0]; if (sevCity) { sevCity.classList.add('on'); sevCity._lb.classList.add('on'); }
    addLabel('Екатеринбург', 50, 48, 1, 'lbl--e');
    addEventListener('resize', place); place(); setTimeout(place, 400); document.fonts && document.fonts.ready.then(place);

    // step markers
    const marks = [];
    for (let i = 0; i < N; i++) {
      const pt = rl.getPointAtLength(L * i / (N - 1));
      const g = mk('g', { class: 'mk' }, $('#marks'));
      mk('circle', { cx: pt.x, cy: pt.y, r: 15 }, g);
      const t = mk('text', { x: pt.x, y: pt.y + 1 }, g); t.textContent = i + 1;
      marks.push(g);
    }
    const boat = $('#boat');
    const sc = $('#route');
    let last = -1;
    const f = () => {
      const r = sc.getBoundingClientRect(), tot = sc.offsetHeight - innerHeight;
      const p = Math.max(0, Math.min(1, -r.top / tot));
      const q = Math.min(1, p / 0.93);
      window.KR.p = p;
      const len = L * q;
      rl.style.strokeDashoffset = L - len;
      const a = rl.getPointAtLength(len), b = rl.getPointAtLength(Math.min(L, len + 3));
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      boat.setAttribute('transform', `translate(${a.x} ${a.y - 20}) rotate(${Math.max(-18, Math.min(18, ang * .12))})`);
      const k = Math.min(N - 1, Math.round(q * (N - 1)));
      marks.forEach((m, i) => { m.classList.toggle('on', q * (N - 1) >= i - 0.02); m.classList.toggle('cur', i === k); });
      if (k !== last) {
        last = k;
        steps.forEach((s, i) => s.classList.toggle('on', i === k));
        track.forEach((s, i) => s.classList.toggle('on', i <= k));
      }
    };
    addEventListener('scroll', f, { passive: true }); addEventListener('resize', f); f();
  });

  // ---- FAQ ----
  safe(() => {
    const qs = $$('.q__b');
    qs.forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      qs.forEach(x => x.setAttribute('aria-expanded', 'false'));
      if (!open) b.setAttribute('aria-expanded', 'true');
    }));
  });

  // phone mask
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      const raw = e.target.value;
      if (/[a-zA-Zа-яА-Я@_]/.test(raw)) return;
      let v = raw.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      if (v[0] === '8') v = '7' + v.slice(1);
      if (v[0] !== '7') v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // ---- lead form ----
  const form = $('#leadForm');
  form && form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent, msg = $('#formMsg');
    const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { msg.textContent = 'Укажите имя и телефон или Telegram.'; return; }
    if (!form.elements.consent || !form.elements.consent.checked) { msg.textContent = 'Отметьте согласие с политикой конфиденциальности.'; return; }
    delete payload.consent;
    payload.comment = ['Цель: ' + payload.goal, 'Город: ' + payload.city, payload.region ? 'Регион: ' + payload.region : '', payload.budget ? 'Бюджет и взнос: ' + payload.budget : '', payload.wish ? 'Пожелания: ' + payload.wish : '', payload.calc || ''].filter(Boolean).join(' | ');
    btn.disabled = true; btn.textContent = 'Отправляем...'; msg.textContent = '';
    try {
      const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      msg.textContent = 'Заявка отправлена. Мы вернёмся с подборкой и расчётом.'; form.reset();
      const cf = $('#calcField'); if (cf) cf.value = calcSummary;
    } catch (err) { console.error(err); msg.textContent = 'Не получилось отправить. Попробуйте ещё раз или напишите во ВКонтакте.'; }
    finally { btn.textContent = orig; btn.disabled = false; }
  });
})();
