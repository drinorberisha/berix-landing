import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { addAfterEffect, Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { ACESFilmicToneMapping, AnimationMixer, Color, Matrix4, Mesh, PerspectiveCamera, PMREMGenerator, Vector3 } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Three owns these mutable graphics objects. Its scene, projection, and mixer
// APIs are intentionally imperative inside effects and the render loop.
/* eslint-disable react-hooks/immutability */

function authoredShots(value, position, target) {
    try {
        const stops = typeof value === 'string' ? JSON.parse(value) : value;
        if (Array.isArray(stops) && stops.length >= 2 && stops.every((pair) => Array.isArray(pair) && pair.length === 2 && pair.every((vector) => Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite)))) {
            const convert = ([x, y, z]) => new Vector3(x, z, -y);
            return stops.map(([point, focus]) => ({ position: convert(point), target: convert(focus) }));
        }
    } catch { /* An unchanged delivery camera remains a safe still-view fallback. */ }
    return [{ position: position.clone(), target }, { position: position.clone(), target }];
}

function batchStaticGeometry(scene, clips) {
    const animated = new Set(clips.flatMap((clip) => clip.tracks.map((track) => track.name.split('.')[0])));
    const groups = new Map();
    const inverse = new Map();
    scene.updateMatrixWorld(true);
    scene.traverse((object) => {
        if (!object.isMesh || object.isSkinnedMesh || animated.has(object.name) || Array.isArray(object.material)) return;
        if (object.material.transparent || object.material.transmission > 0 || object.morphTargetInfluences?.length) return;
        let parent = object.parent;
        while (parent !== scene && parent && !animated.has(parent.name)) parent = parent.parent;
        parent ??= scene;
        if (!inverse.has(parent.uuid)) inverse.set(parent.uuid, parent.matrixWorld.clone().invert());
        const attributes = Object.keys(object.geometry.attributes).sort().join('|');
        const key = `${parent.uuid}:${object.material.uuid}:${attributes}`;
        if (!groups.has(key)) groups.set(key, { parent, material: object.material, objects: [] });
        groups.get(key).objects.push(object);
    });
    let batches = 0;
    for (const group of groups.values()) {
        if (group.objects.length < 2) continue;
        const geometries = group.objects.map((object) => {
            const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
            geometry.applyMatrix4(new Matrix4().multiplyMatrices(inverse.get(group.parent.uuid), object.matrixWorld));
            return geometry;
        });
        const geometry = mergeGeometries(geometries, false);
        geometries.forEach((item) => item.dispose());
        if (!geometry) continue;
        const batch = new Mesh(geometry, group.material);
        batch.name = `WEB_Batch_${batches}`;
        batch.castShadow = true;
        batch.receiveShadow = true;
        group.parent.add(batch);
        // Keep source nodes for animation bindings and child transforms. Layers
        // hide only their own draw call, without hiding animated descendants.
        group.objects.forEach((object) => object.layers.disableAll());
        batches += 1;
    }
    return batches;
}

function StudioEnvironment() {
    const { gl, scene } = useThree();
    useEffect(() => {
        const generator = new PMREMGenerator(gl);
        const room = new RoomEnvironment();
        const target = generator.fromScene(room, 0.04);
        const previous = scene.environment;
        scene.environment = target.texture;
        scene.environmentIntensity = 0.65;
        scene.background = new Color('#f2efe7');
        return () => {
            scene.environment = previous;
            target.dispose();
            room.dispose();
            generator.dispose();
        };
    }, [gl, scene]);
    return null;
}

function Scene({ modelUrl, playing, seek, onReady, onProgress, captureMode }) {
    const gltf = useGLTF(modelUrl);
    const { set, size, invalidate, gl } = useThree();
    const elapsedSinceProgress = useRef(0);
    const orbit = useRef(null);
    const explored = useRef(false);
    const resumed = useRef(true);
    const pendingCapture = useRef(null);
    const onReadyRef = useRef(onReady);
    const onProgressRef = useRef(onProgress);
    useLayoutEffect(() => {
        onReadyRef.current = onReady;
        onProgressRef.current = onProgress;
    }, [onReady, onProgress]);

    const prepared = useMemo(() => {
        const scene = gltf.scene.clone(true);
        let sourceCamera;
        let objectCount = 0;
        scene.traverse((object) => {
            objectCount += 1;
            if (object.isLight) object.visible = false;
            if (object.isCamera && (!sourceCamera || object.name.startsWith('CAM_main'))) sourceCamera = object;
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
        scene.updateMatrixWorld(true);
        let camera;
        if (sourceCamera) {
            camera = sourceCamera.clone(false);
            sourceCamera.getWorldPosition(camera.position);
            sourceCamera.getWorldQuaternion(camera.quaternion);
        } else {
            camera = new PerspectiveCamera(48, 16 / 9, 0.1, 200);
            camera.position.set(11, 12, 16);
            camera.lookAt(0, 1.8, 0);
        }
        camera.near = 0.05;
        camera.far = 250;
        const mixer = new AnimationMixer(scene);
        const cameraNames = new Set();
        scene.traverse((object) => { if (object.isCamera) cameraNames.add(object.name); });
        const clips = gltf.animations.map((clip) => {
            const animation = clip.clone();
            animation.tracks = animation.tracks.filter((track) => !cameraNames.has(track.name.split('.')[0]));
            return animation;
        }).filter((clip) => clip.tracks.length > 0);
        const duration = Math.max(0, ...clips.map((clip) => clip.duration));
        batchStaticGeometry(scene, clips);
        const authoredTarget = scene.userData.BERIX_camera_target ?? sourceCamera?.userData.BERIX_camera_target ?? [0, 0, 1.8];
        const target = new Vector3(authoredTarget[0], authoredTarget[2], -authoredTarget[1]);
        const stops = authoredShots(scene.userData.BERIX_camera_shots, camera.position, target);
        return { scene, camera, baseFov: camera.fov, baseAspect: camera.aspect || 16 / 9, mixer, clips, duration, objectCount, target, stops };
    }, [gltf]);

    useLayoutEffect(() => {
        const camera = prepared.camera;
        camera.aspect = size.width / size.height;
        if (camera.isPerspectiveCamera) camera.fov = 2 * Math.atan(Math.tan(prepared.baseFov * Math.PI / 360) * Math.max(1, prepared.baseAspect / camera.aspect)) * 180 / Math.PI;
        camera.updateProjectionMatrix();
        set({ camera });
        invalidate();
    }, [prepared, set, size.width, size.height, invalidate]);

    useEffect(() => {
        const actions = prepared.clips.map((clip) => prepared.mixer.clipAction(clip));
        actions.forEach((action) => action.reset().play());
        onReadyRef.current({ duration: prepared.duration, animationCount: actions.length, objectCount: prepared.objectCount });
        invalidate();
        return () => {
            prepared.mixer.stopAllAction();
            prepared.mixer.uncacheRoot(prepared.scene);
        };
    }, [prepared, invalidate]);

    useEffect(() => {
        if (!seek) return;
        prepared.mixer.setTime(seek.time);
        if (seek.time === 0) explored.current = false;
        elapsedSinceProgress.current = 0;
        invalidate();
    }, [prepared, seek, invalidate]);

    useEffect(() => { if (playing) resumed.current = true; }, [playing]);

    useEffect(() => {
        if (!captureMode) return;
        const api = {
            model: modelUrl,
            duration: prepared.duration,
            cameraShotCount: prepared.stops.length,
            frame(time) {
                if (!Number.isFinite(time) || time < 0 || time > prepared.duration) return Promise.reject(new Error('Frame time is outside the scene.'));
                if (pendingCapture.current) return Promise.reject(new Error('A frame capture is already pending.'));
                return new Promise((resolve, reject) => {
                    explored.current = false;
                    prepared.mixer.setTime(time);
                    pendingCapture.current = { resolve, reject, time };
                    invalidate();
                });
            },
        };
        const unsubscribe = addAfterEffect(() => {
            const pending = pendingCapture.current;
            if (!pending) return;
            pendingCapture.current = null;
            try {
                pending.resolve({ png: gl.domElement.toDataURL('image/png'), time: pending.time, width: gl.domElement.width, height: gl.domElement.height, drawCalls: gl.info.render.calls, triangles: gl.info.render.triangles });
            } catch (error) { pending.reject(error); }
        });
        window.__BERIX_STUDY__ = api;
        return () => {
            unsubscribe();
            if (window.__BERIX_STUDY__ === api) delete window.__BERIX_STUDY__;
            pendingCapture.current?.reject(new Error('Scene closed before capture completed.'));
            pendingCapture.current = null;
        };
    }, [captureMode, gl, invalidate, modelUrl, prepared]);

    useFrame((_, delta) => {
        if (playing) {
            if (resumed.current) resumed.current = false;
            else prepared.mixer.update(delta);
        }
        if (orbit.current && !explored.current) {
            const phase = (prepared.mixer.time % Math.max(12, prepared.duration)) / Math.max(12, prepared.duration);
            const section = phase * (prepared.stops.length - 1);
            const index = Math.min(prepared.stops.length - 2, Math.floor(section));
            const amount = section - index;
            const eased = amount * amount * (3 - 2 * amount);
            prepared.camera.position.lerpVectors(prepared.stops[index].position, prepared.stops[index + 1].position, eased);
            orbit.current.target.lerpVectors(prepared.stops[index].target, prepared.stops[index + 1].target, eased);
            orbit.current.update();
        }
        if (!playing) return;
        elapsedSinceProgress.current += delta;
        if (elapsedSinceProgress.current >= 0.12) {
            elapsedSinceProgress.current = 0;
            onProgressRef.current(prepared.duration ? prepared.mixer.time % prepared.duration : 0);
        }
    });

    const controls = useMemo(() => {
        const position = prepared.camera.getWorldPosition(new Vector3());
        const target = prepared.target;
        const offset = position.clone().sub(target);
        const theta = Math.atan2(offset.x, offset.z);
        const phi = Math.acos(offset.y / offset.length());
        return { target, theta, phi, distance: offset.length() };
    }, [prepared]);

    return (
        <>
            <primitive object={prepared.scene} dispose={null} />
            <OrbitControls ref={orbit} onStart={() => { explored.current = true; }} enablePan={false} enableZoom zoomSpeed={0.65} minDistance={controls.distance * 0.3} maxDistance={controls.distance * 1.15} enableDamping dampingFactor={0.07} target={controls.target} minAzimuthAngle={controls.theta - 0.35} maxAzimuthAngle={controls.theta + 0.35} minPolarAngle={Math.max(0.1, controls.phi - 0.23)} maxPolarAngle={Math.min(Math.PI - 0.1, controls.phi + 0.23)} />
        </>
    );
}

export default function MotionStudyCanvas({ modelUrl, playing, seek, onReady, onProgress, captureMode = false }) {
    return (
        <div className="ms-canvas" aria-hidden="true">
            <Canvas shadows="percentage" dpr={[1, 1.5]} frameloop={playing ? 'always' : 'demand'} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 0.95 }} camera={{ position: [11, 12, 16], fov: 48, near: 0.05, far: 250 }} fallback={<div className="ms-webgl-fallback">Your browser cannot display this 3D study. The still view is available.</div>}>
                <StudioEnvironment />
                <ambientLight intensity={0.16} color="#f8f4eb" />
                <directionalLight position={[-5, 9, 4]} intensity={2} color="#fff4dd" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-camera-far={45} shadow-normalBias={0.035} />
                <directionalLight position={[6, 5, -5]} intensity={0.9} color="#f1f0dd" />
                <pointLight position={[0, 3, -7]} intensity={18} color="#fff5ed" decay={2} />
                <Suspense fallback={null}><Scene modelUrl={modelUrl} playing={playing} seek={seek} onReady={onReady} onProgress={onProgress} captureMode={captureMode} /></Suspense>
            </Canvas>
        </div>
    );
}
