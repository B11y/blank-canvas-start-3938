import { useEffect, useRef } from "react";
import * as THREE from "three";



const TUNNEL_WIDTH  = 2;
const TUNNEL_HEIGHT = 1.8;
const SEGMENT_DEPTH = 1;
const NUM_SEGMENTS  = 15;
const LINE_RADIUS   = 0.003;
const SCROLL_TO_Z   = 0.05;
const CAMERA_CHASE  = 0.1;
const FADE_IN       = 1;
const FOG_FAR       = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;
const SPEED         = 32;

interface HeroTunnelProps {
  images: string[];
}

export default function HeroTunnel({ images }: HeroTunnelProps) {
  const frameRef  = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!images || images.length === 0) return;

    const frame  = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#000000");
    scene.fog = new THREE.Fog(new THREE.Color("#000000"), FOG_FAR * 0.6, FOG_FAR);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#D68A4E"),
      transparent: true,
      opacity: 0.35,
    });

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const fading: THREE.MeshBasicMaterial[] = [];

    const imageMats = images.map((url) => {
      const mat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      loader.load(url, (tex) => {
        if (!alive) { tex.dispose(); return; }
        tex.minFilter       = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.colorSpace      = THREE.SRGBColorSpace;
        mat.map         = tex;
        mat.needsUpdate = true;
        fading.push(mat);
      });
      return mat;
    });

    const hw   = TUNNEL_WIDTH / 2;
    const hh   = TUNNEL_HEIGHT / 2;
    const cols = 4;
    const rows = 4;
    const colW = TUNNEL_WIDTH / cols;
    const rowH = TUNNEL_HEIGHT / rows;

    const geoFloor = new THREE.PlaneGeometry(colW, SEGMENT_DEPTH);
    const geoWall  = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowH);
    const geoTubeZ = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-SEGMENT_DEPTH)),
      1, LINE_RADIUS, 8
    );
    const geoTubeX = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(TUNNEL_WIDTH,0,0)),
      1, LINE_RADIUS, 8
    );
    const geoTubeY = new THREE.TubeGeometry(
      new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,TUNNEL_HEIGHT,0)),
      1, LINE_RADIUS, 8
    );

    const tube = (geo: THREE.BufferGeometry, x: number, y: number) => {
      const m = new THREE.Mesh(geo, lineMaterial);
      m.position.set(x, y, 0);
      return m;
    };

    const SLOTS: Array<{ geo: THREE.BufferGeometry; pos: THREE.Vector3; rot: THREE.Euler }> = [];
    const slotZ = -SEGMENT_DEPTH / 2;
    for (let i = 0; i < cols; i++) {
      const x = -hw + i * colW + colW / 2;
      SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x, -hh, slotZ), rot: new THREE.Euler(-Math.PI/2,0,0) });
      SLOTS.push({ geo: geoFloor, pos: new THREE.Vector3(x,  hh, slotZ), rot: new THREE.Euler( Math.PI/2,0,0) });
    }
    for (let i = 0; i < rows; i++) {
      const y = -hh + i * rowH + rowH / 2;
      SLOTS.push({ geo: geoWall, pos: new THREE.Vector3(-hw, y, slotZ), rot: new THREE.Euler(0, Math.PI/2,0) });
      SLOTS.push({ geo: geoWall, pos: new THREE.Vector3( hw, y, slotZ), rot: new THREE.Euler(0,-Math.PI/2,0) });
    }

    let imageIndex = 0;
    let populateIndex = 0;

    function populate(group: THREE.Group) {
      const takesSlabs = populateIndex % 2 === 0;
      populateIndex++;

      const slabs = group.userData.slabs as THREE.Mesh[];

      for (const slab of slabs) {
        if (!takesSlabs || Math.random() > 0.5) {
          slab.visible = false;
          continue;
        }

        slab.visible = true;
        slab.material = imageMats[imageIndex % imageMats.length];
        imageIndex++;
      }
    }

    function createSegment(z: number) {
      const group = new THREE.Group();
      group.position.z = z;

      for (let i = 0; i <= cols; i++) {
        const x = -hw + i * colW;
        group.add(tube(geoTubeZ, x, -hh));
        group.add(tube(geoTubeZ, x,  hh));
      }
      for (let i = 1; i < rows; i++) {
        const y = -hh + i * rowH;
        group.add(tube(geoTubeZ, -hw, y));
        group.add(tube(geoTubeZ,  hw, y));
      }
      group.add(tube(geoTubeX, -hw, -hh));
      group.add(tube(geoTubeX, -hw,  hh));
      group.add(tube(geoTubeY, -hw, -hh));
      group.add(tube(geoTubeY,  hw, -hh));

      const slabs = SLOTS.map((slot) => {
        const m = new THREE.Mesh(slot.geo, imageMats[0]);
        m.position.copy(slot.pos);
        m.rotation.copy(slot.rot);
        m.visible = false;
        group.add(m);
        return m;
      });
      group.userData.slabs = slabs;
      populate(group);
      return group;
    }

    const segments: THREE.Group[] = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const g = createSegment(-i * SEGMENT_DEPTH);
      scene.add(g);
      segments.push(g);
    }

    let alive     = true;
    let scrollPos = 0;
    let raf       = 0;
    let last      = 0;

    const resize = () => {
      const w = Math.max(1, frame.clientWidth);
      const h = Math.max(1, frame.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    resize();

    const animate = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(animate);
      const dt = last ? Math.min((now - last) / 1000, 1/30) : 1/60;
      last = now;

      scrollPos += SPEED * dt;
      const want = -SCROLL_TO_Z * scrollPos;
      camera.position.z += CAMERA_CHASE * (want - camera.position.z);

      const span = NUM_SEGMENTS * SEGMENT_DEPTH;
      const camZ = camera.position.z;
      for (const seg of segments) {
        if (seg.position.z > camZ + SEGMENT_DEPTH) {
          let min = 0;
          for (const s of segments) min = Math.min(min, s.position.z);
          seg.position.z = min - SEGMENT_DEPTH;
          populate(seg);
        } else if (seg.position.z < camZ - span - SEGMENT_DEPTH) {
          let max = -999999;
          for (const s of segments) max = Math.max(max, s.position.z);
          seg.position.z = max + SEGMENT_DEPTH;
          populate(seg);
        }
      }

      for (let i = fading.length - 1; i >= 0; i--) {
        const m = fading[i];
        m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
        if (m.opacity >= 1) fading.splice(i, 1);
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      geoFloor.dispose(); geoWall.dispose();
      geoTubeZ.dispose(); geoTubeX.dispose(); geoTubeY.dispose();
        for (const m of imageMats) { m.map?.dispose(); m.dispose(); }
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [images]);

  return (
    <div ref={frameRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
