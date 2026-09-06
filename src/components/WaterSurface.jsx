import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Simplex noise implementation for water
const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// Vertex shader for water surface
const waterVertexShader = `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveFreq;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPos;
  
  ${NOISE_GLSL}
  
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    
    // Multi-layered noise for realistic water
    float wave1 = snoise(vec3(position.xz * 0.15, uTime * 0.08)) * 0.8;
    float wave2 = snoise(vec3(position.xz * 0.3 + 10.0, uTime * 0.12)) * 0.4;
    float wave3 = snoise(vec3(position.xz * 0.6 + 20.0, uTime * 0.06)) * 0.2;
    
    float elevation = (wave1 + wave2 + wave3) * uWaveHeight;
    
    vElevation = elevation;
    worldPos.y += elevation;
    vWorldPos = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Fragment shader for water with reflection and Fresnel
const waterFragmentShader = `
  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uOpacity;
  uniform vec3 uMouse;
  uniform float uMouseInfluence;
  
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPos;
  
  void main() {
    // Distance from center for depth gradient
    float dist = length(vWorldPos.xz) / 20.0;
    float depthFade = smoothstep(0.0, 1.0, dist);
    
    // Fresnel effect
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
    
    // Water color with depth
    vec3 deepColor = uWaterColor * 0.6;
    vec3 shallowColor = uWaterColor * 1.2;
    vec3 waterColor = mix(deepColor, shallowColor, 1.0 - depthFade);
    
    // Specular highlight (moonlight reflection)
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    vec3 normal = normalize(vec3(
      dFdx(vElevation),
      1.0,
      dFdy(vElevation)
    ));
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);
    
    // Subtle highlight streak
    float highlight = pow(max(dot(normal, lightDir), 0.0), 32.0) * 0.3;
    
    // Combine
    vec3 color = waterColor;
    color += vec3(0.8, 0.85, 0.9) * spec * 0.15;
    color += vec3(0.7, 0.75, 0.8) * highlight * 0.1;
    
    // Fresnel adds sky color at grazing angles
    vec3 skyColor = vec3(0.3, 0.4, 0.5);
    color = mix(color, skyColor, fresnel * 0.5);
    
    // Fog
    float fogFactor = smoothstep(uFogNear, uFogFar, length(vWorldPos - cameraPosition));
    color = mix(color, uFogColor, fogFactor);
    
    // Edge fade
    float edgeFade = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
    edgeFade *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    
    gl_FragColor = vec4(color, edgeFade);
  }
`;

// Particle shader for mist/atmosphere
const particleVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;
  
  varying float vAlpha;
  
  void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    
    // Gentle drift
    float t = uTime * aSpeed * 0.1;
    vec3 pos = position;
    pos.x += sin(t + aOffset) * 0.8;
    pos.y += cos(t * 0.5 + aOffset) * 0.3;
    pos.z += cos(t * 0.7 + aOffset) * 0.5;
    
    // Mouse influence - particles follow cursor
    pos.x += uMouse.x * uMouseInfluence * 2.0;
    pos.y += uMouse.y * uMouseInfluence * 1.0;
    
    mvPos = modelViewMatrix * vec4(pos, 1.0);
    
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * uPixelRatio * (100.0 / -mvPos.z);
    
    // Fade based on height
    vAlpha = smoothstep(-2.0, 2.0, position.y) * 0.7;
  }
`;

const particleFragmentShader = `
  varying float vAlpha;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(vec3(0.8, 0.85, 0.9), alpha);
  }
`;

function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function isMobileDevice() {
  return window.matchMedia('(max-width: 768px), (max-device-width: 768px)').matches;
}

export default function WaterSurface({ opacity = 0.6, scrollAffected = true }) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    animationId: null,
    time: 0,
    mouse: { x: 0, y: 0 },
    scrollProgress: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsWebGL2()) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobileDevice(),
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice() ? 1 : 1.5));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 8);
    camera.lookAt(0, -1.5, 0);

    // Water surface - positioned at bottom of hero
    const waterGeo = new THREE.PlaneGeometry(40, 40, 128, 128);
    waterGeo.rotateX(-Math.PI / 2);

    const waterUniforms = {
      uTime: { value: 0 },
      uWaveHeight: { value: prefersReducedMotion ? 0.02 : 0.18 },
      uWaveFreq: { value: 1.0 },
      uWaterColor: { value: new THREE.Color(0x1a4a5a) },
      uFogColor: { value: new THREE.Color(0xffffff) },
      uFogNear: { value: 10.0 },
      uFogFar: { value: 30.0 },
      uOpacity: { value: opacity },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: prefersReducedMotion ? 0.0 : 0.5 },
    };

    const waterMat = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: waterUniforms,
      transparent: true,
      depthWrite: false,
    });

    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = -2.5;
    scene.add(water);

    // Particles (mist/atmosphere) - positioned higher
    const particleCount = prefersReducedMotion ? 30 : 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 5 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      sizes[i] = Math.random() * 2 + 0.8;
      speeds[i] = Math.random() * 0.4 + 0.15;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    particleGeo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));

    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: prefersReducedMotion ? 0.0 : 0.5 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Fog - transparent, don't cover background
    scene.fog = new THREE.Fog(0xffffff, 12, 30);

    // Mouse tracking
    let targetMouseX = 0, targetMouseY = 0;
    const onPointerMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    if (!prefersReducedMotion) {
      window.addEventListener('pointermove', onPointerMove);
    }

    // Scroll tracking
    const onScroll = () => {
      stateRef.current.scrollProgress = Math.min(window.scrollY / (window.innerHeight || 1), 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    resizeObserver.observe(container);

    // Visibility observer
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Animation loop
    const animate = () => {
      if (!isVisible) {
        stateRef.current.animationId = requestAnimationFrame(animate);
        return;
      }

      stateRef.current.time += 0.016;
      const time = stateRef.current.time;

      // Smooth mouse follow
      stateRef.current.mouse.x += (targetMouseX - stateRef.current.mouse.x) * 0.02;
      stateRef.current.mouse.y += (targetMouseY - stateRef.current.mouse.y) * 0.02;

      // Update uniforms
      waterUniforms.uTime.value = time;
      waterUniforms.uMouse.value.set(stateRef.current.mouse.x, stateRef.current.mouse.y);
      particleMat.uniforms.uTime.value = time;
      particleMat.uniforms.uMouse.value.set(stateRef.current.mouse.x, stateRef.current.mouse.y);

      // Camera parallax
      if (!prefersReducedMotion) {
        camera.position.x += (stateRef.current.mouse.x * 0.3 - camera.position.x) * 0.015;
        camera.position.y += (0.5 + stateRef.current.mouse.y * 0.15 - camera.position.y) * 0.015;
      }
      camera.lookAt(0, -1.5, 0);

      // Scroll effect
      if (scrollAffected) {
        const sp = stateRef.current.scrollProgress;
        camera.position.z = 8 + sp * 3;
        waterUniforms.uOpacity.value = opacity * (1 - sp * 0.5);
      }

      renderer.render(scene, camera);
      stateRef.current.animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (stateRef.current.animationId) {
        cancelAnimationFrame(stateRef.current.animationId);
      }
      if (!prefersReducedMotion) {
        window.removeEventListener('pointermove', onPointerMove);
      }
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
  }, [opacity, scrollAffected]);

  return <div ref={containerRef} className="three-scene hero__water" aria-hidden="true" />;
}
