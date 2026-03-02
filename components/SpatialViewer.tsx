'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, ContactShadows, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import { Info, Ruler, MapPin } from 'lucide-react';

// Types
interface CameraAnchor {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface MaterialDef {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
}

interface AnnotationProps {
  position: [number, number, number];
  title: string;
  description: string;
}

interface SpatialViewerProps {
  style?: string;
  budget?: string;
}

// --- Components ---

const Annotation = ({ position, title, description, isOpen, onToggle }: AnnotationProps & { isOpen: boolean, onToggle: () => void }) => {
  return (
    <Html position={position} center distanceFactor={10} zIndexRange={[100, 0]}>
      <div className="relative group cursor-pointer">
        <div 
          className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center border-2 transition-all duration-300 ${isOpen ? 'border-[#C6A87C] scale-110' : 'border-white hover:scale-110'}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <Info className={`w-4 h-4 ${isOpen ? 'text-[#C6A87C]' : 'text-gray-600'}`} />
        </div>
        
        {isOpen && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-2 z-50 pointer-events-none">
            <h4 className="font-serif text-sm font-medium text-gray-900 mb-1">{title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
          </div>
        )}
      </div>
    </Html>
  );
};

const DimensionLine = ({ start, end, label }: { start: [number, number, number], end: [number, number, number], label: string }) => {
  return (
    <group>
      <Line points={[start, end]} color="#10B981" lineWidth={1} dashed dashScale={2} dashSize={0.5} gapSize={0.5} opacity={0.6} transparent />
      <Html position={[
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
      ]} center distanceFactor={10}>
        <div className="bg-[#10B981]/10 backdrop-blur-sm px-2 py-0.5 rounded border border-[#10B981]/30 flex items-center gap-1">
          <Ruler className="w-3 h-3 text-[#10B981]" />
          <span className="text-[10px] font-mono font-medium text-[#10B981] whitespace-nowrap">{label}</span>
        </div>
      </Html>
    </group>
  );
};

const CameraController = ({ anchor, isAutoTour }: { anchor: CameraAnchor | null, isAutoTour: boolean }) => {
  const { camera, controls } = useThree() as any;
  
  useEffect(() => {
    if (anchor && controls) {
      // Smoothly animate camera to new position
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...anchor.position);
      const startTarget = controls.target.clone();
      const endTarget = new THREE.Vector3(...anchor.target);

      let startTime: number | null = null;
      const duration = 2000; // ms

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        
        // Smooth ease-in-out
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        camera.position.lerpVectors(startPos, endPos, ease);
        controls.target.lerpVectors(startTarget, endTarget, ease);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [anchor, camera, controls]);

  useFrame((state) => {
    if (isAutoTour && controls) {
      // Gentle rotation for cinematic feel
      // controls.azimuthAngle += 0.0005;
      // controls.update();
    }
  });

  return null;
};

const Model = ({ 
  url, 
  materials, 
  onMeshClick 
}: { 
  url: string; 
  materials: Record<string, MaterialDef>; 
  onMeshClick: (meshName: string) => void;
}) => {
  const { scene } = useGLTF(url);
  const textureCache = useRef<Record<string, THREE.Texture>>({});

  // Apply materials
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materialId = mesh.userData.materialId || 'default'; // Fallback or custom logic
        const matDef = materials[materialId];

        if (matDef) {
          // Create or update material
          if (!mesh.material || (mesh.material as THREE.MeshStandardMaterial).name !== matDef.name) {
             const newMat = new THREE.MeshStandardMaterial({
              name: matDef.name,
              color: new THREE.Color(matDef.color),
              roughness: matDef.roughness,
              metalness: matDef.metalness,
            });

            if (matDef.textureUrl) {
                // Simple texture loading (in production use useTexture from drei)
                if (!textureCache.current[matDef.textureUrl]) {
                    new TextureLoader().load(matDef.textureUrl, (tex) => {
                        tex.wrapS = THREE.RepeatWrapping;
                        tex.wrapT = THREE.RepeatWrapping;
                        textureCache.current[matDef.textureUrl!] = tex;
                        newMat.map = tex;
                        newMat.needsUpdate = true;
                    });
                } else {
                    newMat.map = textureCache.current[matDef.textureUrl];
                }
            }
            mesh.material = newMat;
          }
        }
        
        // Enable shadows
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene, materials]);

  return (
    <primitive 
      object={scene} 
      onClick={(e: any) => {
        e.stopPropagation();
        onMeshClick(e.object.name);
      }} 
    />
  );
};

// --- Main Viewer Component ---

export default function SpatialViewer({ style = 'Modern', budget = 'Premium' }: SpatialViewerProps) {
  const [anchors, setAnchors] = useState<CameraAnchor[]>([
    { id: '1', name: 'Overview', position: [8, 8, 8], target: [0, 0, 0], fov: 50 },
    { id: '2', name: 'Living', position: [2, 1.5, 2], target: [0, 0.5, -2], fov: 60 },
    { id: '3', name: 'Kitchen', position: [-2, 1.5, 2], target: [-2, 0.5, -2], fov: 60 },
  ]);
  const [activeAnchor, setActiveAnchor] = useState<CameraAnchor | null>(anchors[0]);
  const [materials, setMaterials] = useState<Record<string, MaterialDef>>({});
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [openAnnotationId, setOpenAnnotationId] = useState<string | null>(null);

  // Dynamic Annotations based on Style/Budget
  const annotations = [
    { 
      id: 'sofa',
      position: [0, 1.2, 0] as [number, number, number], 
      title: `${style} Sofa`, 
      description: `Premium 3-seater in ${style === 'Minimalist' ? 'neutral linen' : 'textured boucle'}.` 
    },
    { 
      id: 'island',
      position: [-3, 1.2, -2] as [number, number, number], 
      title: 'Kitchen Island', 
      description: `${budget === 'Luxury' ? 'Italian Marble' : 'Quartz'} countertop with waterfall edge.` 
    },
    {
      id: 'flooring',
      position: [2, 0.2, 2] as [number, number, number],
      title: 'Flooring',
      description: `${budget === 'Luxury' ? 'Engineered Hardwood' : 'High-grade Vitrified Tiles'}.`
    }
  ];

  // Load initial data
  useEffect(() => {
    // Simulate fetching data
    fetch('/data/materials.json')
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error("Failed to load materials:", err));
  }, []);

  const handleMeshClick = (meshName: string) => {
    // Safety check: Lock structural elements
    if (meshName.startsWith('Wall_') || meshName.startsWith('Window_') || meshName.startsWith('Structure_')) {
      console.warn(`Mesh ${meshName} is locked.`);
      return;
    }
    console.log(`Selected mesh: ${meshName}`);
    setSelectedMesh(meshName);
  };

  const toggleTour = () => {
    setIsAutoTour(!isAutoTour);
    if (!isAutoTour) {
      // Start tour sequence
      let step = 0;
      setActiveAnchor(anchors[0]);
      setOpenAnnotationId(null);

      const interval = setInterval(() => {
        step = (step + 1) % anchors.length;
        const currentAnchor = anchors[step];
        setActiveAnchor(currentAnchor);
        
        // Auto-open relevant annotation based on anchor
        if (currentAnchor.name === 'Living') setOpenAnnotationId('sofa');
        else if (currentAnchor.name === 'Kitchen') setOpenAnnotationId('island');
        else setOpenAnnotationId(null);

      }, 5000);
      return () => clearInterval(interval);
    } else {
      setOpenAnnotationId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* 3D Canvas */}
      <div className="flex-1 relative bg-gray-50">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault fov={50} position={[8, 8, 8]} />
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} autoRotate={isAutoTour} autoRotateSpeed={0.5} />
            
            <Environment preset="apartment" />
            <ambientLight intensity={0.5} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1} 
              castShadow 
              shadow-mapSize={[1024, 1024]} 
            />

            <CameraController anchor={activeAnchor} isAutoTour={isAutoTour} />
            
            {/* Placeholder Geometry */}
            <group>
              <mesh name="Floor_Main" rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={(e) => { e.stopPropagation(); handleMeshClick('Floor_Main'); }}>
                  <planeGeometry args={[12, 12]} />
                  <meshStandardMaterial color="#f5f5f5" />
              </mesh>
              <mesh name="Wall_North" position={[0, 1.5, -6]} receiveShadow castShadow onClick={(e) => { e.stopPropagation(); handleMeshClick('Wall_North'); }}>
                  <boxGeometry args={[12, 3, 0.2]} />
                  <meshStandardMaterial color="#ffffff" />
              </mesh>
               <mesh name="Furniture_Table" position={[0, 0.5, 0]} castShadow onClick={(e) => { e.stopPropagation(); handleMeshClick('Furniture_Table'); }}>
                  <boxGeometry args={[1.5, 0.8, 1.5]} />
                  <meshStandardMaterial color="#8B4513" />
              </mesh>
              <mesh name="Kitchen_Island" position={[-3, 0.5, -2]} castShadow>
                  <boxGeometry args={[2, 0.9, 4]} />
                  <meshStandardMaterial color="#2C3E50" />
              </mesh>
            </group>

            {/* Annotations */}
            {annotations.map((ann) => (
              <Annotation 
                key={ann.id}
                position={ann.position} 
                title={ann.title} 
                description={ann.description} 
                isOpen={openAnnotationId === ann.id}
                onToggle={() => setOpenAnnotationId(openAnnotationId === ann.id ? null : ann.id)}
              />
            ))}
            
            {/* Dimensions */}
            <DimensionLine start={[-6, 0.1, -6]} end={[6, 0.1, -6]} label="12' 0" />
            <DimensionLine start={[-6, 0.1, -6]} end={[-6, 0.1, 6]} label="12' 0" />

            <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
          </Suspense>
        </Canvas>
        
        {/* Overlay UI */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-white/20 flex gap-2">
          {anchors.map(anchor => (
            <button
              key={anchor.id}
              onClick={() => { setActiveAnchor(anchor); setIsAutoTour(false); setOpenAnnotationId(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeAnchor?.id === anchor.id 
                  ? 'bg-[#2C3E50] text-white shadow-md' 
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {anchor.name}
            </button>
          ))}
          <div className="w-px h-8 bg-gray-200 mx-1 self-center" />
          <button
            onClick={toggleTour}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isAutoTour
                ? 'bg-[#C6A87C] text-white shadow-md'
                : 'bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isAutoTour ? 'Pause Tour' : 'Start Tour'}
          </button>
        </div>

        {/* Loading Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg border border-white/20 text-xs space-y-1">
           <p className="font-medium text-gray-900">Interactive Walkthrough</p>
           <p className="text-gray-500">Tap points for details • Drag to rotate</p>
        </div>
      </div>
    </div>
  );
}
