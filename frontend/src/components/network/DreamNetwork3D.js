'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Individual Dream Node component
function DreamNode({ node, position, isHovered, onHover, onClick }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation on the whole group
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
    
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.01;
      
      // Scale animation on hover
      const targetScale = hovered || isHovered ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#fbbf24',      // Changed from green to golden yellow
      anxious: '#f59e0b',    // Amber for anxious
      peaceful: '#60a5fa',   // Soft blue for peaceful
      confused: '#c084fc',   // Purple for confused
      excited: '#fb923c',    // Orange for excited
      sad: '#94a3b8',        // Gray for sad
      curious: '#2dd4bf',    // Teal for curious
      fearful: '#f87171',    // Red for fearful
      neutral: '#a8a29e'     // Neutral gray
    };
    return colors[emotion] || colors.neutral;
  };

  const color = node.isUserDream ? '#0891b2' : getEmotionColor(node.emotion);
  const intensity = node.isUserDream ? 2 : 1;

  return (
    <group position={position}>
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(node);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            onHover(null);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(node.id);
          }}
        >
          {/* Main sphere */}
          <sphereGeometry args={[node.isUserDream ? 0.3 : 0.2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Glow effect */}
        <mesh scale={node.isUserDream ? 1.4 : 1.2}>
          <sphereGeometry args={[node.isUserDream ? 0.3 : 0.2, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Extra glow for user dreams */}
        {node.isUserDream && (
          <mesh scale={1.8}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Lucid dream indicator - sparkle effect */}
        {node.lucidDream && (
          <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={2}
              metalness={1}
              roughness={0}
            />
          </mesh>
        )}

        {/* Recurring dream indicator - ring */}
        {node.recurring && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.35, 0.03, 16, 100]} />
            <meshStandardMaterial
              color="#f97316"
              emissive="#f97316"
              emissiveIntensity={1}
              transparent
              opacity={0.6}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

// Connection Line component
function ConnectionLine({ source, target, similarity }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current) {
      // Animate opacity for shimmer effect - increased base opacity
      const opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      lineRef.current.material.opacity = opacity * Math.max(similarity, 0.6);
    }
  });

  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...source),
      new THREE.Vector3(
        (source[0] + target[0]) / 2,
        (source[1] + target[1]) / 2 + 1,
        (source[2] + target[2]) / 2
      ),
      new THREE.Vector3(...target)
    );
    return curve.getPoints(50);
  }, [source, target]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  // Use tube geometry for thicker lines
  const tubeGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 50, 0.02, 8, false);
  }, [points]);

  return (
    <mesh ref={lineRef} geometry={tubeGeometry}>
      <meshBasicMaterial
        attach="material"
        color={new THREE.Color('#0891b2')}
        transparent
        opacity={0.6 * Math.max(similarity, 0.6)}
      />
    </mesh>
  );
}

// Main 3D Scene component
function Scene({ networkData, onDreamHover, onDreamClick }) {
  const { camera } = useThree();
  const [hoveredNode, setHoveredNode] = useState(null);

  // Position nodes in 3D space
  const nodePositions = useMemo(() => {
    if (!networkData || !networkData.nodes) return new Map();

    const positions = new Map();
    const userDreams = networkData.nodes.filter(n => n.isUserDream);
    const otherDreams = networkData.nodes.filter(n => !n.isUserDream);

    // Position user dreams in a circle at the center
    const userRadius = 3;
    userDreams.forEach((node, i) => {
      const angle = (i / userDreams.length) * Math.PI * 2;
      const x = Math.cos(angle) * userRadius;
      const z = Math.sin(angle) * userRadius;
      const y = (Math.random() - 0.5) * 2;
      positions.set(node.id, [x, y, z]);
    });

    // Position similar dreams in an outer sphere
    const outerRadius = 8;
    otherDreams.forEach((node, i) => {
      const phi = Math.acos(-1 + (2 * i) / otherDreams.length);
      const theta = Math.sqrt(otherDreams.length * Math.PI) * phi;
      
      const x = outerRadius * Math.cos(theta) * Math.sin(phi);
      const y = outerRadius * Math.sin(theta) * Math.sin(phi);
      const z = outerRadius * Math.cos(phi);
      
      positions.set(node.id, [x, y, z]);
    });

    return positions;
  }, [networkData]);

  const handleHover = (node) => {
    setHoveredNode(node);
    onDreamHover(node);
  };

  useEffect(() => {
    if (camera) {
      camera.position.set(0, 5, 15);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  if (!networkData) return null;

  return (
    <>
      {/* Ambient lighting - reduced for darker atmosphere */}
      <ambientLight intensity={0.2} />
      
      {/* Main light - slightly reduced */}
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#a855f7" />
      
      {/* Starfield background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Render connection lines */}
      {networkData.links.map((link, index) => {
        const sourcePos = nodePositions.get(link.source);
        const targetPos = nodePositions.get(link.target);
        if (!sourcePos || !targetPos) return null;

        return (
          <ConnectionLine
            key={`link-${index}`}
            source={sourcePos}
            target={targetPos}
            similarity={link.similarity}
          />
        );
      })}

      {/* Render dream nodes */}
      {networkData.nodes.map((node) => {
        const position = nodePositions.get(node.id);
        if (!position) return null;

        return (
          <DreamNode
            key={node.id}
            node={node}
            position={position}
            isHovered={hoveredNode?.id === node.id}
            onHover={handleHover}
            onClick={onDreamClick}
          />
        );
      })}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main exported component
export default function DreamNetwork3D({ networkData, onDreamHover = () => {}, onDreamClick = () => {}, currentUser }) {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center p-8">
          <p className="text-red-400 mb-4">Failed to load 3D visualization</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas 
        style={{ background: '#0f172a' }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0f172a');
          // Handle context loss
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.error('WebGL context lost');
            setError('WebGL context lost');
          });
          gl.domElement.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored');
            setError(null);
          });
        }}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 10, 50]} />
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={75} />
        <Scene
          networkData={networkData}
          onDreamHover={onDreamHover}
          onDreamClick={onDreamClick}
        />
      </Canvas>
    </div>
  );
}
