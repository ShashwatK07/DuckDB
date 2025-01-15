import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";

const Duck = () => {
    const { scene } = useGLTF("/duck/scene.gltf");

    return (
        <mesh castShadow receiveShadow>
            <hemisphereLight intensity={0.15} groundColor="black" />
            <pointLight intensity={2} />
            <spotLight
                position={[-20, 50, 10]}
                angle={0.12}
                penumbra={1}
                intensity={1}
                castShadow
                shadow-mapSize={1024}
            />
            <primitive
                object={scene}
                scale={0.67}
                position={[0, -3.25, -0.85]}
                rotation={[-0.01, -0.2, -0.1]}
                castShadow
                receiveShadow
            />
        </mesh>
    );
};

const DuckCanvas = () => {
    return (
        <Canvas
            frameloop="demand"
            shadows
            camera={{ position: [20, 3, 5], fov: 25 }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <OrbitControls
                enableZoom={false}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={Math.PI / 2}
            />
            <Duck />
            <Preload all />
        </Canvas>
    );
};

export default DuckCanvas;
