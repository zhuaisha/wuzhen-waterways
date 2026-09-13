import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const BASE = import.meta.env.BASE_URL;

const stages = [
  ['00', 'WUZHEN', 'Waterways & Bridges'],
  ['01', 'WATER', 'Water shapes the rhythm of Wuzhen.'],
  ['02', 'BRIDGES', 'Every bridge becomes a passage.'],
  ['03', 'UNDER THE ARCH', 'Darkness gives way to light.'],
  ['04', 'BOAT', 'Life moves with the water.'],
  ['05', 'STREET', 'The water leads into daily life.'],
  ['06', 'LIGHT', 'Night arrives, lantern by lantern.'],
  ['07', 'MEMORY', 'A journey through Wuzhen.'],
];

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch { return false; }
}

function addBuilding(scene, x, z, width, height, depth, side = 1) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color: side > 0 ? 0x385363 : 0x2a4252, roughness: .9 })
  );
  wall.position.set(x, height / 2 - .2, z);
  scene.add(wall);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(width * .9, height * .42, 4),
    new THREE.MeshStandardMaterial({ color: 0x1e313d, roughness: .78 })
  );
  roof.scale.z = depth / width * 1.12;
  roof.rotation.y = Math.PI / 4;
  roof.position.set(x, height + .12, z);
  scene.add(roof);
}

function createTown(scene, lights, lite) {
  scene.add(new THREE.HemisphereLight(0x547c93, 0x102330, 1.25));
  const moon = new THREE.DirectionalLight(0xa9cbe0, 1.45);
  moon.position.set(-8, 13, 3);
  scene.add(moon);

  const waterGeometry = new THREE.PlaneGeometry(15, 142, lite ? 24 : 50, lite ? 80 : 160);
  waterGeometry.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeometry, new THREE.MeshPhongMaterial({ color: 0x0a4052, shininess: 100, specular: 0x6c9db2, transparent: true, opacity: .92 }));
  water.position.set(0, -.18, -54);
  scene.add(water);

  const bankMaterial = new THREE.MeshStandardMaterial({ color: 0x294654, roughness: 1 });
  [-1, 1].forEach((side) => {
    const bank = new THREE.Mesh(new THREE.BoxGeometry(8, .55, 142), bankMaterial);
    bank.position.set(side * 7.4, -.44, -54);
    scene.add(bank);
  });
  const count = lite ? 11 : 19;
  for (let i = 0; i < count; i += 1) {
    const z = 8 - i * 6.3;
    const side = i % 2 ? 1 : -1;
    addBuilding(scene, side * (8.2 + (i % 3) * .85), z, 3.1 + (i % 3) * .55, 3.4 + (i % 4) * .65, 4.2, side);
  }

  // The bridge is a simple stone arch, deliberately shaped as a landmark on the camera path.
  const stone = new THREE.MeshStandardMaterial({ color: 0x52606a, roughness: .94 });
  const arch = new THREE.Mesh(new THREE.TorusGeometry(5.7, .62, 10, 40, Math.PI), stone);
  arch.rotation.set(0, 0, Math.PI);
  arch.position.set(0, 3.2, -29);
  scene.add(arch);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(15, .7, 4.4), stone);
  deck.position.set(0, 6.1, -29);
  scene.add(deck);
  [-1, 1].forEach((side) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 6.5, 4.4), stone);
    pillar.position.set(side * 5.5, 2.9, -29);
    scene.add(pillar);
  });

  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.1, .42, 5.1), new THREE.MeshStandardMaterial({ color: 0x11161b, roughness: .8 }));
  hull.position.y = .18;
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.8, 12, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x171b1d, roughness: .9 }));
  canopy.rotation.z = Math.PI / 2;
  canopy.position.set(0, .72, -.35);
  boat.add(hull, canopy);
  boat.position.set(1.7, 0, -50);
  scene.add(boat);

  const lanternMaterial = new THREE.MeshStandardMaterial({ color: 0x6e421d, emissive: 0xd48631, emissiveIntensity: .05, roughness: .6 });
  const lanternCount = lite ? 9 : 17;
  for (let i = 0; i < lanternCount; i += 1) {
    const side = i % 2 ? 1 : -1;
    const z = -8 - i * 5.7;
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), lanternMaterial.clone());
    lantern.position.set(side * 5.8, 3.7 + (i % 3) * .22, z);
    scene.add(lantern);
    const light = new THREE.PointLight(0xf2ad52, 0, 9, 2);
    light.position.copy(lantern.position);
    scene.add(light);
    lights.push({ light, material: lantern.material, threshold: .58 + i / lanternCount * .23 });
  }
  return { water, boat };
}

export default function Journey() {
  const canvasHost = useRef(null);
  const root = useRef(null);
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !canUseWebGL()) { setFallback(true); return undefined; }
    const host = canvasHost.current;
    if (!host) return undefined;
    let renderer;
    try {
      const lite = window.matchMedia('(max-width: 700px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
      renderer = new THREE.WebGLRenderer({ antialias: !lite, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x163b4d, 0.14);
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x163b4d, lite ? .012 : .016);
      const camera = new THREE.PerspectiveCamera(lite ? 57 : 51, host.clientWidth / host.clientHeight, .1, 180);
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(16, 19, 22), new THREE.Vector3(7, 8, 8), new THREE.Vector3(2.4, 2.1, -8),
        new THREE.Vector3(.3, 1.45, -23), new THREE.Vector3(-.1, 1.38, -35), new THREE.Vector3(1.4, 1.65, -51),
        new THREE.Vector3(7, 2.4, -67), new THREE.Vector3(2, 3.2, -88), new THREE.Vector3(0, 4.3, -108),
      ], false, 'catmullrom', .38);
      const lookPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, -25), new THREE.Vector3(0, 0, -16), new THREE.Vector3(0, 2.8, -29),
        new THREE.Vector3(0, 1.5, -35), new THREE.Vector3(1.7, .3, -50), new THREE.Vector3(9, 2.5, -66),
        new THREE.Vector3(3, 3, -86), new THREE.Vector3(0, 4, -110), new THREE.Vector3(0, 4, -124),
      ], false, 'catmullrom', .38);
      const lanterns = [];
      const { water, boat } = createTown(scene, lanterns, lite);
      const position = new THREE.Vector3();
      const target = new THREE.Vector3();
      let desired = 0, current = 0, frame = 0, lastStage = -1, animationId = 0, alive = true;
      const onScroll = () => {
        const el = root.current;
        if (!el) return;
        const distance = Math.max(1, el.offsetHeight - window.innerHeight);
        desired = Math.max(0, Math.min(1, (window.scrollY - el.offsetTop) / distance));
        el.classList.toggle('is-active', window.scrollY >= el.offsetTop && window.scrollY < el.offsetTop + distance);
      };
      const goTo = (event) => {
        const progress = event.detail?.progress;
        if (typeof progress !== 'number' || !root.current) return;
        const el = root.current;
        const destination = el.offsetTop + progress * (el.offsetHeight - window.innerHeight);
        if (window.__lenis) window.__lenis.scrollTo(destination, { duration: 1.1 });
        else window.scrollTo({ top: destination, behavior: 'smooth' });
      };
      const resize = () => {
        const width = host.clientWidth, height = host.clientHeight;
        camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
      };
      const onContextLost = (event) => {
        event.preventDefault();
        alive = false;
        cancelAnimationFrame(animationId);
        setFallback(true);
      };
      const animate = () => {
        if (!alive) return;
        current += (desired - current) * .055; // damp scroll velocity, never let the camera fly past its stage
        path.getPointAt(current, position); lookPath.getPointAt(current, target);
        camera.position.copy(position); camera.lookAt(target);
        const waterPos = water.geometry.attributes.position;
        for (let i = 0; i < waterPos.count; i += 1) {
          const x = waterPos.getX(i), z = waterPos.getZ(i);
          waterPos.setY(i, Math.sin(x * .75 + frame * .018) * .055 + Math.cos(z * .35 + frame * .012) * .035);
        }
        waterPos.needsUpdate = true;
        boat.position.x = 1.7 + Math.sin(frame * .012) * .55; boat.position.y = Math.sin(frame * .025) * .055;
        lanterns.forEach(({ light, material, threshold }, index) => {
          const amount = Math.max(0, Math.min(1, (current - threshold) * 8));
          light.intensity = amount * (lite ? .72 : 1.25); material.emissiveIntensity = .08 + amount * 1.25;
          if (index < 2) light.intensity += Math.max(0, (current - .35) * .4);
        });
        const nextStage = Math.min(7, Math.floor(current * 8 + .08));
        if (nextStage !== lastStage) { lastStage = nextStage; setStage(nextStage); }
        renderer.render(scene, camera); frame += 1; animationId = requestAnimationFrame(animate);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('journey:go', goTo); window.addEventListener('resize', resize);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
      onScroll(); animate(); setReady(true);
      return () => {
        alive = false; cancelAnimationFrame(animationId);
        window.removeEventListener('scroll', onScroll); window.removeEventListener('journey:go', goTo); window.removeEventListener('resize', resize);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.dispose(); water.geometry.dispose(); water.material.dispose(); scene.traverse((item) => { if (item.isMesh && item !== water) { item.geometry?.dispose(); item.material?.dispose(); } });
        renderer.domElement.remove();
      };
    } catch { renderer?.dispose(); setFallback(true); return undefined; }
  }, []);

  const [number, title, copy] = stages[stage];
  return (
    <section ref={root} className={`journey ${fallback ? 'journey--fallback' : ''}`} aria-label="A scroll journey through Wuzhen">
      <div className="journey__sticky">
        <div className="journey__fallback" aria-hidden="true"><img src={`${BASE}images/hero_wuzhen-1920.webp`} alt="" /></div>
        <div ref={canvasHost} className="journey__canvas" aria-hidden="true" />
        {!ready && !fallback && <div className="journey__loading" aria-live="polite"><b>WUZHEN</b><span /></div>}
        <div className="journey__shade" />
        <div className={`journey__copy journey__copy--${stage}`}>
          <p className="journey__number">{number}</p><h1>{title}</h1><p>{copy}</p>
        </div>
        <ol className="journey__stages" aria-label="Journey stages">{stages.map(([n], index) => <li className={index === stage ? 'is-active' : ''} key={n}>{String(index + 1).padStart(2, '0')}</li>)}</ol>
        {stage === 0 && <p className="journey__prompt">SCROLL TO EXPLORE</p>}
      </div>
    </section>
  );
}
