/**
 * Aceternity UI Background Cubes Grid 的 Perspective 示例，移植自其公开组件源码。
 * https://ui.aceternity.com/components/background-cubes-grid
 * 场景采用实例化圆角方块；可见性、分屏和帧率由 Vue 组件管理。
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

const MAX_TRAIL = 48;
const CUBE_WIDTH = 0.72;
const CUBE_HEIGHT = 3;
const CAMERA_RADIUS = 12;
const ALPHA_RANGE = Math.PI * 0.03;
const BETA_RANGE = Math.PI * 0.05;

const PERSPECTIVE_WAVE = {
  speed: 6.0,
  frequency: 1.2,
  width: 3.0,
  jitter: 0.2,
  fadeTime: 2.0,
  trailSpacing: 0.1,
  idleStrength: 0.8,
};

const VignetteRGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    shiftAmount: { value: 0.004 },
    vignetteRadius: { value: 0.35 },
    vignetteSoftness: { value: 0.45 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float shiftAmount;
    uniform float vignetteRadius;
    uniform float vignetteSoftness;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      vec2 dir = sign(vUv - center);
      float vignetteFactor = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, dist);
      vec2 shift = dir * shiftAmount * vignetteFactor;
      float r = texture2D(tDiffuse, vUv + shift).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - shift).b;
      gl_FragColor = vec4(vec3(r, g, b) * (1.0 - vignetteFactor * 0.7), 1.0);
    }
  `,
};

const overrideVertexShader = (vertexShader: string) =>
  vertexShader
    .replace(
      "#include <common>",
      `#include <common>
      varying float vHeight;
      attribute vec2 aOffset;
      uniform sampler2D uTrailTexture;
      uniform int       uTrailCount;
      uniform float     uWaveSpeed;
      uniform float     uWaveFreq;
      uniform float     uWaveWidth;
      uniform float     uFadeTime;
      uniform float     uAmplitude;
      uniform float     uJitter;
      uniform float     uMaxHeight;

      vec2 hash2( vec2 p ) {
        p = vec2(
          dot( p, vec2( 127.1, 311.7 ) ),
          dot( p, vec2( 269.5, 183.3 ) )
        );
        return fract( sin( p ) * 43758.5453123 ) - 0.5;
      }`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vHeight = 0.0;
      if ( position.y > 0.0 ) {
        vec2 worldXZ = aOffset + hash2( aOffset ) * uJitter;
        float waveHeight  = 0.0;
        float totalWeight = 0.0;

        for ( int i = 0; i < uTrailCount; i++ ) {
          vec4 td = texture2D(
            uTrailTexture,
            vec2( ( float(i) + 0.5 ) / ${MAX_TRAIL}.0, 0.5 )
          );
          float dist    = length( worldXZ - td.rg );
          float relDist = dist - uWaveSpeed * td.b;
          float window  = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
          float fade    = exp( -td.b / uFadeTime );
          float atten   = 1.0 / ( 1.0 + dist * 0.1 );
          float weight  = fade * window * atten * td.a;

          waveHeight  += weight * cos( uWaveFreq * relDist );
          totalWeight += weight;
        }

        waveHeight /= max( totalWeight, 1.0 );

        float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
        transformed.y += displacement;
        vHeight = displacement;
      }`,
    );

type TrailPoint = { x: number; z: number; age: number; distDelta: number };

export function createDarkCubesScene(canvas: HTMLCanvasElement, container: HTMLElement) {
  const gridSize = 40;
  const gap = 0.08;
  const baseColor = "#2a2a30";
  const waveColor = "#ff6a2b";
  const backgroundColor = "#0b0b0d";
  const glow = 0.9;
  const amplitude = 0.5;
  const tilt = 0.7;
  let width = container.clientWidth;
  let height = container.clientHeight;
  let pixelRatio = Math.min(window.devicePixelRatio, 1.35, Math.sqrt(1_600_000 / Math.max(1, width * height)));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  scene.fog = new THREE.Fog(backgroundColor, 9, 26);

  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
  const mouse = new THREE.Vector2();
  const lerpedMouse = new THREE.Vector2();
  const updateCamera = (mx: number, my: number) => {
    const alpha = tilt + my * ALPHA_RANGE;
    const beta = mx * BETA_RANGE;
    camera.position.set(
      -CAMERA_RADIUS * Math.cos(alpha) * Math.sin(beta),
      CAMERA_RADIUS * Math.cos(alpha) * Math.cos(beta),
      CAMERA_RADIUS * Math.sin(alpha),
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
  };
  updateCamera(0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(pixelRatio);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(VignetteRGBShiftShader));
  composer.addPass(new OutputPass());
  composer.setSize(width, height);
  composer.setPixelRatio(pixelRatio);

  scene.add(new THREE.AmbientLight("#ffffff", 0.35));
  const keyLight = new THREE.DirectionalLight("#ffffff", 3.0);
  keyLight.position.set(-20, 12, -6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.radius = 6;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 60;
  keyLight.shadow.camera.left = -22;
  keyLight.shadow.camera.right = 22;
  keyLight.shadow.camera.top = 22;
  keyLight.shadow.camera.bottom = -22;
  keyLight.shadow.bias = 0.0001;
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(waveColor, 1.2);
  rimLight.position.set(12, 4, 10);
  scene.add(rimLight);

  const bounds = gridSize * (CUBE_WIDTH + gap);
  const maxHeight = amplitude;

  const trail: TrailPoint[] = [
    { x: -2.8, z: -1.2, age: 0.6, distDelta: 1.2 },
    { x: 3.1, z: 2.4, age: 1.1, distDelta: 1.0 },
  ];
  let lastPoint: { x: number; z: number } | null = null;
  let timeSinceLastMove = 0;
  let randomPointTimer = 0;
  let isPlacingRandomPoints = true;

  const trailData = new Float32Array(MAX_TRAIL * 4);
  const trailTexture = new THREE.DataTexture(
    trailData,
    MAX_TRAIL,
    1,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  trailTexture.needsUpdate = true;
  const trailUniforms = {
    uTrailTexture: { value: trailTexture },
    uTrailCount: { value: 0 },
    uFadeTime: { value: PERSPECTIVE_WAVE.fadeTime },
  };

  const rayPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds, bounds),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }),
  );
  rayPlane.rotation.x = -Math.PI / 2;
  rayPlane.updateMatrixWorld(true);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const pushPoint = (point: TrailPoint) => {
    if (trail.length >= MAX_TRAIL) trail.shift();
    trail.push(point);
  };

  const waveUniforms = () => ({
    ...trailUniforms,
    uWaveSpeed: { value: PERSPECTIVE_WAVE.speed },
    uWaveFreq: { value: PERSPECTIVE_WAVE.frequency },
    uWaveWidth: { value: PERSPECTIVE_WAVE.width },
    uAmplitude: { value: amplitude },
    uJitter: { value: PERSPECTIVE_WAVE.jitter },
    uMaxHeight: { value: maxHeight },
  });

  const count = gridSize * gridSize;
  const geometry = new RoundedBoxGeometry(CUBE_WIDTH, CUBE_HEIGHT, CUBE_WIDTH, 2, 0.12);
  const offsetAttribute = new THREE.InstancedBufferAttribute(
    new Float32Array(count * 2),
    2,
  );
  geometry.setAttribute("aOffset", offsetAttribute);

  const material = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, waveUniforms(), {
      uColorBase: { value: new THREE.Color(baseColor) },
      uColorHigh: { value: new THREE.Color(waveColor) },
      uGlow: { value: glow },
    });
    shader.vertexShader = overrideVertexShader(shader.vertexShader);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying float vHeight;
        uniform vec3  uColorBase;
        uniform vec3  uColorHigh;
        uniform float uMaxHeight;
        uniform float uGlow;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float crest  = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
        float trough = clamp( -vHeight / uMaxHeight, 0.0, 1.0 );
        diffuseColor.rgb = mix( uColorBase, uColorHigh, crest ) * ( 1.0 - trough * 0.6 );`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += uColorHigh * crest * crest * uGlow;`,
      );
  };

  const depthMaterial = new THREE.MeshDepthMaterial();
  depthMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, waveUniforms());
    shader.vertexShader = overrideVertexShader(shader.vertexShader);
  };

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.customDepthMaterial = depthMaterial;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const spacing = CUBE_WIDTH + gap;
  const gridOffset = ((gridSize - 1) * spacing) / 2;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = i * gridSize + j;
      const x = i * spacing - gridOffset;
      const z = j * spacing - gridOffset;
      dummy.position.set(x, 0, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      offsetAttribute.setXY(index, x, z);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  offsetAttribute.needsUpdate = true;

  // Listen on window so content placed above the canvas does not block waves.
  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    if (Math.abs(nx) > 1 || Math.abs(ny) > 1) return;
    mouse.set(nx, ny);
    pointer.set(nx, ny);

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(rayPlane);
    if (hits.length === 0) return;

    const { x, z } = hits[0].point;
    let distDelta = 0;
    if (lastPoint) {
      distDelta = Math.hypot(x - lastPoint.x, z - lastPoint.z);
      if (distDelta < PERSPECTIVE_WAVE.trailSpacing) return;
    }
    pushPoint({ x, z, age: 0, distDelta });
    lastPoint = { x, z };
    timeSinceLastMove = 0;
    isPlacingRandomPoints = false;
    randomPointTimer = 0;
  };

  const resizeObserver = new ResizeObserver(() => {
    if (!container.clientWidth || !container.clientHeight) return;
    width = container.clientWidth;
    height = container.clientHeight;
    pixelRatio = Math.min(window.devicePixelRatio, 1.35, Math.sqrt(1_600_000 / Math.max(1, width * height)));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    composer.setPixelRatio(pixelRatio);
  });
  resizeObserver.observe(container);


  const update = (delta: number) => {
    lerpedMouse.x += (mouse.x - lerpedMouse.x) * 0.04;
    lerpedMouse.y += (mouse.y - lerpedMouse.y) * 0.04;
    updateCamera(lerpedMouse.x, lerpedMouse.y);

    const expiry = PERSPECTIVE_WAVE.fadeTime * 4;
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].age += delta;
      if (trail[i].age > expiry) trail.splice(i, 1);
    }

    timeSinceLastMove += delta;
    if (timeSinceLastMove >= 3.0 && !isPlacingRandomPoints) {
      isPlacingRandomPoints = true;
      randomPointTimer = 0;
    }
    if (isPlacingRandomPoints) {
      randomPointTimer += delta;
      if (randomPointTimer >= 1.5) {
        pushPoint({
          x: (Math.random() * 0.5 - 0.25) * bounds,
          z: (Math.random() * 0.5 - 0.25) * bounds,
          age: 0,
          distDelta: PERSPECTIVE_WAVE.idleStrength + Math.random() * 0.2,
        });
        randomPointTimer = 0;
      }
    }

    const live = Math.min(trail.length, MAX_TRAIL);
    if (live > 0 || trailUniforms.uTrailCount.value > 0) {
      for (let i = 0; i < live; i++) {
        trailData.set(
          [trail[i].x, trail[i].z, trail[i].age, trail[i].distDelta],
          i * 4,
        );
      }
      trailTexture.needsUpdate = true;
      trailUniforms.uTrailCount.value = live;
    }

    composer.render();
  };

  const dispose = () => {
    resizeObserver.disconnect();

    mesh.dispose();
    geometry.dispose();
    material.dispose();
    depthMaterial.dispose();
    rayPlane.geometry.dispose();
    rayPlane.material.dispose();
    trailTexture.dispose();
    for (const pass of composer.passes) pass.dispose();
    composer.dispose();
    keyLight.shadow.dispose();
    renderer.dispose();
  };

  return { update, dispose, pointerMove: onPointerMove };
}
