import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function isMobileDevice() {
  return window.matchMedia('(max-width: 768px), (max-device-width: 768px)').matches;
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function makeCircleTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

const VARIANTS = {
  hero: {
    waterColor: 0x6F9295, particleColor: 0xd4e6e3,
    particleCount: 900, segments: 48,
    waterOpacity: 0.45, fogColor: 0x000000, fogNear: 8, fogFar: 24,
    waterY: -1.0, particleSize: 0.07, particleOpacity: 0.55,
  },
  summary: {
    waterColor: 0x5a7d80, particleColor: 0xb0d0cc,
    particleCount: 600, segments: 40,
    waterOpacity: 0.38, fogColor: 0x000000, fogNear: 8, fogFar: 22,
    waterY: -0.8, particleSize: 0.06, particleOpacity: 0.48,
  },
  core: {
    waterColor: 0x6F9295, particleColor: 0xc0d8d4,
    particleCount: 450, segments: 34,
    waterOpacity: 0.22, fogColor: 0x000000, fogNear: 8, fogFar: 22,
    waterY: -1.2, particleSize: 0.05, particleOpacity: 0.35,
  },
};

export default function ThreeScene({ variant = 'hero', className = '', opacity = 1, interactive = true, scrollAffected = false, visible = true }) {
  const containerRef = useRef(null);
  const stateRef = useRef({ animationId: null, time: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL fallback
    if (!supportsWebGL2()) {
      container.style.display = 'none';
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobileDevice(),
        powerPreference: 'high-performance',
      });
    } catch {
      container.style.display = 'none';
      return;
    }

    const cfg = VARIANTS[variant] || VARIANTS.hero;
    let pixelRatio = Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 2);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.opacity = opacity;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(cfg.fogColor, cfg.fogNear, cfg.fogFar);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2.2, 6);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(0, 8, 4);
    scene.add(dir);
    const point = new THREE.PointLight(0xd4e6e3, 0.3, 28);
    point.position.set(0, 3, 0);
    scene.add(point);

    // Water surface
    const waterGeo = new THREE.PlaneGeometry(40, 40, cfg.segments, cfg.segments);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: cfg.waterColor, metalness: 0.3, roughness: 0.5,
      transparent: true, opacity: cfg.waterOpacity,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = cfg.waterY;
    scene.add(water);

    const posAttr = waterGeo.attributes.position;
    const origX = new Float32Array(posAttr.count);
    const origZ = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      origX[i] = posAttr.getX(i);
      origZ[i] = posAttr.getZ(i);
    }

    // Particles
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(cfg.particleCount * 3);
    for (let i = 0; i < cfg.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 5 + 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: cfg.particleColor, size: cfg.particleSize,
      transparent: true, opacity: cfg.particleOpacity,
      map: makeCircleTexture(), blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const onPointerMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (interactive) window.addEventListener('pointermove', onPointerMove);

    // Scroll progress
    let scrollProgress = 0;
    const onScroll = () => {
      scrollProgress = Math.min(window.scrollY / (window.innerHeight || 1), 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    // Visibility (IntersectionObserver)
    let isVisible = visible;
    let animationId = null;

    const animate = () => {
      if (!isVisible) return;

      stateRef.current.time += 0.016;
      const time = stateRef.current.time;

      // Water waves
      for (let i = 0; i < posAttr.count; i++) {
        const x = origX[i], z = origZ[i];
        const w1 = Math.sin(x * 0.7 + time * 0.6) * 0.055;
        const w2 = Math.cos(z * 1.0 + time * 0.8) * 0.04;
        const w3 = Math.sin((x + z) * 0.4 + time * 0.45) * 0.025;
        posAttr.setY(i, w1 + w2 + w3);
      }
      posAttr.needsUpdate = true;
      waterGeo.computeVertexNormals();

      // Particle drift
      const pPos = particleGeo.attributes.position;
      for (let i = 0; i < pPos.count; i++) {
        let y = pPos.getY(i) + 0.0018;
        if (y > 5.5) y = 0.1;
        pPos.setY(i, y);
      }
      pPos.needsUpdate = true;

      // Camera parallax
      camera.position.x += (mouseX * 0.25 - camera.position.x) * 0.025;
      camera.position.y += (2.2 - mouseY * 0.12 - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);

      // Scroll effect
      if (scrollAffected) {
        camera.position.z = 6 + scrollProgress * 3.5;
        particleMat.opacity = cfg.particleOpacity * (1 - scrollProgress * 0.85);
        waterMat.opacity = cfg.waterOpacity * (1 - scrollProgress * 0.5);
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    // IntersectionObserver for visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animationId) {
            stateRef.current.time = 0;
            animate();
          } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (interactive) window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      observer.disconnect();
      waterGeo.dispose();
      waterMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [variant, opacity, interactive, scrollAffected, visible]);

  return <div ref={containerRef} className={`three-scene ${className}`} aria-hidden="true" />;
}
