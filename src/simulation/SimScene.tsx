import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { SimState, AlertLevel } from "./types";

/* ─── Helpers ─────────────────────────────────────────────────── */
function getSceneAlertColor(level: AlertLevel): string {
  if (level >= 80) return "#dc2626";
  if (level >= 50) return "#ea580c";
  if (level >= 30) return "#ca8a04";
  return "#16a34a";
}

function getSensorStatus(online: boolean, level: AlertLevel): string {
  if (!online) return "offline";
  if (level >= 80) return "emergency";
  if (level >= 50) return "warning";
  if (level >= 30) return "caution";
  return "online";
}

/* ─── Ground ──────────────────────────────────────────────────── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#d5e8d5" roughness={0.9} />
    </mesh>
  );
}

/* ─── Grid helper ─────────────────────────────────────────────── */
function GridHelper() {
  return <gridHelper args={[30, 20, "#c0d0c0", "#b0c0b0"]} position={[0, 0, 0]} />;
}

/* ─── River ───────────────────────────────────────────────────── */
function River({ waterLevel }: { waterLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const height = 0.0 + (waterLevel / 100) * 1.2;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value = clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(() => ({ time: { value: 0 } }), []);

  return (
    <mesh ref={meshRef} position={[0, height, -3]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 3, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv; uniform float time;
          void main() { vUv = uv; vec3 p = position; p.z += sin(p.x*4.0+time*0.8)*0.04 + sin(p.y*6.0+time*0.5)*0.025; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }
        `}
        fragmentShader={`
          uniform float time; varying vec2 vUv;
          void main() {
            vec3 shallow = vec3(0.10,0.55,0.70);
            vec3 deep = vec3(0.05,0.35,0.55);
            float t = sin(vUv.x*12.0+time)*0.5+0.5;
            vec3 col = mix(deep, shallow, t);
            float alpha = 0.75 + 0.2*sin(vUv.y*10.0+time*0.3);
            gl_FragColor = vec4(col, alpha);
          }
        `}
        transparent side={THREE.DoubleSide} depthWrite={false}
      />
    </mesh>
  );
}

/* ─── Houses ──────────────────────────────────────────────────── */
function Houses({ waterLevel }: { waterLevel: number }) {
  const flood = Math.max(0, (waterLevel - 30) / 70);
  const houses = useMemo(() => [
    { pos: [-3.5, 0, 2] as const, wall: "#c4956a", roof: "#8b3a3a" },
    { pos: [-2, 0, 2.5] as const, wall: "#d4a574", roof: "#7a3030" },
    { pos: [-5, 0, 1.5] as const, wall: "#b8855a", roof: "#6a2828" },
    { pos: [-4.5, 0, 3.5] as const, wall: "#c49060", roof: "#5a2020" },
    { pos: [-1, 0, 1] as const, wall: "#d0a070", roof: "#8a3535" },
    { pos: [-6, 0, 3] as const, wall: "#bf8f5f", roof: "#783030" },
  ], []);

  return (
    <group>
      {houses.map((h, i) => (
        <group key={i} position={[h.pos[0], h.pos[1], h.pos[2]]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.9, 0.6, 0.75]} />
            <meshLambertMaterial color={h.wall} />
          </mesh>
          <mesh position={[0, 0.68, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.65, 0.35, 4]} />
            <meshLambertMaterial color={h.roof} />
          </mesh>
          <mesh position={[0.38, 0.2, 0]}>
            <planeGeometry args={[0.12, 0.22]} />
            <meshBasicMaterial color="#3d2010" />
          </mesh>
          {flood > 0 && (
            <mesh position={[0, -0.05 + flood * 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2, 2]} />
              <meshBasicMaterial color={waterLevel >= 80 ? "#1a3a5a" : "#2a5a7a"} transparent opacity={0.35 * flood} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/* ─── Rain ─────────────────────────────────────────────────────── */
function Rain({ intensity }: { intensity: number }) {
  const count = Math.floor(intensity * 400);
  const meshRef = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    const p = meshRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      p[i * 3 + 1] -= intensity * 0.8;
      if (p[i * 3 + 1] < -1) p[i * 3 + 1] = 14;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (intensity === 0) return null;
  return (
    <points ref={meshRef}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#7ab8e0" size={0.06} transparent opacity={0.35 * intensity} />
    </points>
  );
}

/* ─── Sensor Node ──────────────────────────────────────────────── */
function SensorNode({ online, alertLevel, waterLevel }: { online: boolean; alertLevel: AlertLevel; waterLevel: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const solarRef = useRef<THREE.Group>(null!);

  const status = getSensorStatus(online, alertLevel);

  const ledColor = status === "offline" ? "#666" : status === "emergency" ? "#ef4444" : status === "warning" ? "#f97316" : status === "caution" ? "#eab308" : "#22c55e";

  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.position.y = 0.25 + Math.sin(clock.getElapsedTime() * 0.4) * 0.04;
    if (solarRef.current) solarRef.current.rotation.z = -0.2 + Math.sin(clock.getElapsedTime() * 0.15) * 0.03;
  });

  return (
    <group ref={groupRef} position={[1.8, 0, -2]}>
      {/* Mount pole */}
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.03, 0.05, 1]} /><meshStandardMaterial color="#8899aa" /></mesh>
      {/* Body */}
      <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.22, 0.12, 0.12]} /><meshStandardMaterial color="#e8ecf0" metalness={0.3} roughness={0.4} /></mesh>
      {/* Status LED */}
      <mesh position={[0, 1.12, 0.08]}><sphereGeometry args={[0.035]} /><meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={online ? 1 : 0} /></mesh>
      {/* Antenna */}
      <mesh position={[0.08, 1.2, 0]} rotation={[0.1, 0, 0]}><cylinderGeometry args={[0.003, 0.003, 0.12]} /><meshStandardMaterial color="#aabbcc" /></mesh>
      {/* Solar panels */}
      <group ref={solarRef} position={[-0.12, 1.05, 0]} rotation={[0, 0, -0.2]}>
        <mesh><planeGeometry args={[0.14, 0.1]} /><meshStandardMaterial color="#1a3377" emissive={online ? "#1a3377" : "#111"} emissiveIntensity={online ? 0.4 : 0} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, 0.005]}><planeGeometry args={[0.1, 0.04]} /><meshBasicMaterial color="#3344aa" opacity={0.3} transparent side={THREE.DoubleSide} /></mesh>
      </group>
      {/* Battery indicator */}
      <mesh position={[0.15, 1.05, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshStandardMaterial color={waterLevel > 0 ? "#22c55e" : "#666"} emissive={waterLevel > 0 ? "#22c55e" : "#000"} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Sound Wave Ring ─────────────────────────────────────────── */
function SoundWaves({ active, color }: { active: boolean; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!meshRef.current || !active) return;
    const t = clock.getElapsedTime();
    const scale = 1 + (t % 2) * 0.8;
    meshRef.current.scale.setScalar(scale);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - (t % 2) * 0.5);
  });
  if (!active) return null;
  return (
    <mesh ref={meshRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.15, 0.2, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ─── Alert Pole ──────────────────────────────────────────────── */
function AlertPole({ alertLevel }: { alertLevel: AlertLevel }) {
  const lightGroupRef = useRef<THREE.Group>(null!);
  const rotorRef = useRef<THREE.Group>(null!);
  const isActive = alertLevel >= 30;
  const ac = getSceneAlertColor(alertLevel);

  useFrame(({ clock }) => {
    if (!lightGroupRef.current) return;
    const speed = alertLevel >= 80 ? 6 : alertLevel >= 50 ? 3 : 1.5;
    const flash = Math.sin(clock.getElapsedTime() * speed * Math.PI);
    lightGroupRef.current.children.forEach((child) => {
      if (child.type === "Mesh") {
        const m = child as THREE.Mesh;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat.emissive) mat.emissiveIntensity = flash > 0 ? (alertLevel >= 80 ? 3 : 2) : 0.05;
      }
    });
    if (rotorRef.current) {
      rotorRef.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group position={[-2.5, 0, 0.8]}>
      {/* Main pole */}
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.05, 0.07, 2.4]} /><meshStandardMaterial color="#b0b8c0" metalness={0.4} roughness={0.3} /></mesh>
      {/* Solar panel */}
      <mesh position={[0, 2.3, 0.1]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.5, 0.35]} />
        <meshStandardMaterial color="#1a3377" emissive="#1a3377" emissiveIntensity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Rotating beacon (police-style) */}
      <group ref={rotorRef} position={[0, 2.0, 0]}>
        <mesh><boxGeometry args={[0.25, 0.06, 0.06]} /><meshStandardMaterial color={ac} emissive={ac} emissiveIntensity={isActive ? 1.5 : 0.3} /></mesh>
        <mesh><boxGeometry args={[0.06, 0.06, 0.25]} /><meshStandardMaterial color={ac} emissive={ac} emissiveIntensity={isActive ? 1.5 : 0.3} /></mesh>
      </group>
      {/* LED bar */}
      <group ref={lightGroupRef} position={[0, 1.85, 0]}>
        <mesh position={[-0.12, 0, 0]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} /></mesh>
        <mesh position={[0.12, 0, 0]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} /></mesh>
        <mesh position={[0, 0, 0]}><sphereGeometry args={[0.04]} /><meshStandardMaterial color={ac} emissive={ac} emissiveIntensity={0.5} /></mesh>
      </group>
      {/* Siren horn */}
      {alertLevel >= 50 && (
        <mesh position={[0, 1.6, 0]}><coneGeometry args={[0.1, 0.12, 12]} /><meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} /></mesh>
      )}
      {/* Sound waves */}
      <group position={[0, 1.6, 0]}>
        <SoundWaves active={alertLevel >= 50} color={ac} />
        <SoundWaves active={alertLevel >= 80} color={ac} />
      </group>
      {/* Antenna */}
      <mesh position={[0, 2.45, 0]}><cylinderGeometry args={[0.003, 0.003, 0.15]} /><meshStandardMaterial color="#889" /></mesh>
    </group>
  );
}

/* ─── Lightning ────────────────────────────────────────────────── */
function Lightning({ active }: { active: boolean }) {
  const flashRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!flashRef.current || !active) return;
    if (Math.random() > 0.996) {
      (flashRef.current.material as THREE.MeshBasicMaterial).opacity = 1;
      setTimeout(() => { (flashRef.current.material as THREE.MeshBasicMaterial).opacity = 0; }, 80);
    }
  });
  if (!active) return null;
  return (
    <mesh ref={flashRef} position={[0, 6, -6]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0} />
    </mesh>
  );
}

/* ─── Scene ────────────────────────────────────────────────────── */
function Scene3D({ state }: { state: SimState }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 12, 6]} intensity={0.5} castShadow />
      <hemisphereLight args={["#aaddff", "#ddeedd", 0.4]} />
      <fog attach="fog" args={["#e8ecf0", 15, 35]} />

      <Ground />
      <GridHelper />
      <River waterLevel={state.waterLevel} />
      <Houses waterLevel={state.waterLevel} />
      <Rain intensity={state.rainIntensity} />
      <SensorNode online={state.sensorOnline} alertLevel={state.alertLevel} waterLevel={state.waterLevel} />
      <AlertPole alertLevel={state.alertLevel} />
      <Lightning active={state.rainIntensity > 0.5} />

      <OrbitControls
        enablePan enableZoom
        minPolarAngle={0.2} maxPolarAngle={1.2}
        target={[0, 0.5, 0]}
        autoRotate={state.phase === "alerta"}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

/* ─── Canvas wrapper ──────────────────────────────────────────── */
export default function SimCanvas({ state }: { state: SimState }) {
  return (
    <Canvas
      shadows
      camera={{ position: [7, 5, 9], fov: 45 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ background: "#e8ecf0" }}
    >
      <Scene3D state={state} />
    </Canvas>
  );
}
