import * as THREE from 'three';

const canvas = document.getElementById('gl');
const hero = document.getElementById('top');
const fail = () => document.documentElement.classList.add('no-gl');

try {
  const reduce = window.KR ? window.KR.reduce : false;
  const small = matchMedia('(max-width: 700px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa9cfd8, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(4, 8, 5); scene.add(sun);

  // sea: parallel lines like depth contours on a chart
  const ROWS = small ? 26 : 44, COLS = small ? 70 : 120, W = 30, D = 22;
  const rows = [];
  const mat = i => new THREE.LineBasicMaterial({ color: i % 6 === 0 ? 0x1d78b0 : 0x0c2a45, transparent: true, opacity: i % 6 === 0 ? 0.55 : 0.22 });
  for (let r = 0; r < ROWS; r++) {
    const pos = new Float32Array(COLS * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const line = new THREE.Line(g, mat(r)); line.frustumCulled = false; scene.add(line);
    rows.push({ pos, g, z: -D / 2 + (r / (ROWS - 1)) * D });
  }
  const ptr = { x: 0, z: 0, k: 0, tx: 0, tz: 0 };
  const H = (x, z, t) => {
    let h = Math.sin(x * 0.5 + t * 0.9) * 0.28 + Math.sin(z * 0.7 - t * 0.7 + x * 0.2) * 0.22 + Math.sin(x * 1.3 + z * 0.4 + t * 1.4) * 0.07;
    const dx = x - ptr.x, dz = z - ptr.z, d = Math.hypot(dx, dz);
    h += Math.sin(d * 2.4 - t * 3.2) * Math.exp(-d * 0.55) * 0.55 * ptr.k;
    return h;
  };

  // buoy riding the same waves
  const buoy = new THREE.Group();
  const M = (c, o) => new THREE.MeshLambertMaterial({ color: c, ...(o || {}) });
  const bBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, 0.7, 20), M(0xffc21a)); bBody.position.y = 0.3; buoy.add(bBody);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.43, 0.14, 20), M(0x0c2a45)); band.position.y = 0.34; buoy.add(band);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), M(0x0c2a45)); mast.position.y = 1.0; buoy.add(mast);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), M(0xffffff, { emissive: 0xffc21a, emissiveIntensity: .9 })); lamp.position.y = 1.5; buoy.add(lamp);
  scene.add(buoy);
  const BX = 6.2, BZ = 1.2;

  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const wide = w / h > 1;
    camera.position.set(0, wide ? 4.2 : 5.2, 11.5); camera.lookAt(wide ? 0 : -1, 0.4, 0);
    const hw = Math.tan(17 * Math.PI / 180) * 10.3 * camera.aspect; buoy.position.x = hw * 0.66; buoy.visible = camera.aspect > 1;
  };
  resize(); addEventListener('resize', resize);

  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height;
    ptr.tx = nx * W * 0.7; ptr.tz = (ny - 0.2) * D * 0.9 - 4;
    ptr.k = 1;
  });
  hero.addEventListener('pointerleave', () => { ptr.k = 0; });

  let vis = true;
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  const clock = new THREE.Clock();
  let kk = 0;
  const frame = () => {
    requestAnimationFrame(frame);
    if (!vis) return;
    const t = reduce ? 0 : clock.getElapsedTime();
    kk += ((ptr.k) - kk) * 0.06;
    ptr.x += (ptr.tx - ptr.x) * 0.1; ptr.z += (ptr.tz - ptr.z) * 0.1;
    const sp = window.KR ? window.KR.p : 0;
    const flat = 1 - Math.min(1, scrollY / (hero.clientHeight * 0.9)) * 0.7;
    const kSave = ptr.k; ptr.k = kk;
    for (const row of rows) {
      const p = row.pos;
      for (let i = 0; i < COLS; i++) {
        const x = -W / 2 + (i / (COLS - 1)) * W;
        p[i * 3] = x; p[i * 3 + 1] = H(x, row.z, t) * flat; p[i * 3 + 2] = row.z;
      }
      row.g.attributes.position.needsUpdate = true;
    }
    const by = H(buoy.position.x, BZ, t) * flat;
    buoy.position.set(buoy.position.x, by - 0.05, BZ);
    buoy.rotation.z = Math.sin(t * 1.1) * 0.12 + (H(buoy.position.x + 0.4, BZ, t) - H(buoy.position.x - 0.4, BZ, t)) * -0.3;
    buoy.rotation.x = Math.sin(t * 0.8) * 0.08;
    lamp.material.emissiveIntensity = 0.7 + Math.sin(t * 2.4) * 0.3;
    ptr.k = kSave;
    renderer.render(scene, camera);
  };
  frame();
} catch (e) { console.error(e); fail(); }
