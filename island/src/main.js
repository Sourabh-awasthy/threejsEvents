import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

let camera, scene, renderer;
let controls;
let islandObjects = [];
let labels = [];
let pins = [];

init();

function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(800, 450, 1200);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1b2a); 
    scene.fog = new THREE.Fog(0x0d1b2a, 500, 900);
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load('galaxy3.jpg'); // background image
    scene.background = backgroundTexture;

    scene.add(new THREE.HemisphereLight(0xf0f5f5, 0xd0dee7, 0.5));

   
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5).normalize();
    scene.add(directionalLight);
   
    const pointLight = new THREE.PointLight(0xffffff, 1, 500);
    pointLight.position.set(0, 200, 0); 
    scene.add(pointLight);

   
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.update();

    addStars(); 
    loadIslands(); 

    window.addEventListener('resize', resize);
    window.addEventListener('click', onClick);
}

function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    for (let i = 0; i < 20000; i++) {
        let x = (Math.random() - 0.5) * 3000;
        let y = (Math.random() - 0.5) * 3000;
        let z = (Math.random() - 0.5) * 3000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2.5,
        transparent: true,
        opacity: 0.7,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

function loadIslands() {
    const islandModels = [
        'models/floating_island.gltf',
        'models/islanddd.gltf',
        'models/floating_island1/scene.gltf',
        'models/floating_island2/scene.gltf',
        'models/floating_island3/scene.gltf',
        'models/floating_island4/scene.gltf',
        'models/floating_island5/scene.gltf',
        'models/floating_island6/scene.gltf',
        'models/floating_island7/scene.gltf',
        'models/floating_island8/scene.gltf',
        'models/floating_island9/scene.gltf',
        'models/floating_island10/scene.gltf',
    ];

    const loader = new GLTFLoader();

    islandModels.forEach((modelPath, i) => {
        loader.load(modelPath, (gltf) => {
            const originalIsland = gltf.scene;
            console.log('Island loaded:', modelPath);

            const islandPositions = [
                { x: 0, y: 0, z: 0},
                { x: -280, y: -40, z: 120 },
                { x: 230, y: -50, z: -150 },
                { x: 220, y: -30, z: 0 },
                { x: -250, y: 60, z: 50 },
                { x: 130, y: -60, z: 100 },
                { x: 160, y: 80, z: -100 },
                { x: -150, y: 90, z: -200 },
                { x: -10, y: -180, z: 100 },
                { x: 40, y: 90, z: -160 },
                { x: -50, y: -80, z: 190 },
                { x: -240, y: 80, z: -150 },
            ];

            const eventNames = ['Abhedya 4.0', 'Codequest Chronicle 2.0', 'Monopoly', 'CyberSiege', 'AeroQuest Glider', 'Chemystery 2.0', 'FilteRaid','Ohm Alone', 'Torque Dash', 'Triumph Cards','Breach-o-beach', 'Game on']; 

            const fixedScale = 110;

            const pos = islandPositions[i];
            const island = originalIsland.clone();
            island.position.set(pos.x, pos.y, pos.z);

            const box = new THREE.Box3().setFromObject(island);
            const size = new THREE.Vector3();
            box.getSize(size);

            const maxDimension = Math.max(size.x, size.y, size.z);
            const scaleFactor = fixedScale / maxDimension;
            island.scale.set(scaleFactor, scaleFactor, scaleFactor);

            scene.add(island);

            islandObjects.push({ object: island, position: new THREE.Vector3(pos.x, pos.y, pos.z) });

            addPinOnIsland(island, pos);
            const eventName = eventNames[i];
            addTextLabel(island, eventName, pos);
        }, undefined, (error) => {
            console.error('Error loading island model:', error);
        });
    });
}

function addPinOnIsland(island, position) {
    const pinHeight = 15;
    const pinRadius = 5;

    const pinGeometry = new THREE.ConeGeometry(pinRadius, pinHeight, 32);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red pin
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);

    pin.rotation.x = Math.PI;

    const islandBoundingBox = new THREE.Box3().setFromObject(island);
    const centerX = islandBoundingBox.getCenter(new THREE.Vector3()).x;
    const centerY = islandBoundingBox.max.y + pinHeight / 2;
    const centerZ = islandBoundingBox.getCenter(new THREE.Vector3()).z;

    pin.position.set(centerX, centerY, centerZ);
    scene.add(pin);

    pins.push(pin);
}

function addTextLabel(island, text, position) {
    const islandBoundingBox = new THREE.Box3().setFromObject(island);
    const centerX = islandBoundingBox.getCenter(new THREE.Vector3()).x;
    const centerY = islandBoundingBox.max.y; // Adjust label to be at the same Y as the pin
    const centerZ = islandBoundingBox.getCenter(new THREE.Vector3()).z;

    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = text;
    label.style.position = 'absolute';
    label.style.color = 'black';
    label.style.fontSize = '30px';
    label.style.fontWeight = 'bold';
    label.style.fontFamily = 'Arial, sans-serif';
    label.style.pointerEvents = 'auto';
    label.style.padding = '5px 10px';
    label.style.borderRadius = '8px';
    label.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    label.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
    label.style.textAlign = 'center';
    label.style.zIndex ='10';

    document.body.appendChild(label);
    labels.push({ label, island });

    updateLabelPosition(label, new THREE.Vector3(centerX, centerY, centerZ));

    label.addEventListener('click', (event) => {
        event.stopPropagation();
        window.location.href = 'demo.html';
        if (!popup) {
            alert('Popup blocked! Please allow popups in your browser settings.');
        }
    });
}

function updateLabelPosition(label, islandPosition) {
    const vector = islandPosition.clone();
    vector.project(camera);

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    const x = (vector.x * widthHalf) + widthHalf;
    const y = -(vector.y * heightHalf) + heightHalf;

    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = 'translate(-50%, -100%)'; // Center it above the pin
}

function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    controls.update();

    labels.forEach(({ label, island }) => {
        const islandBoundingBox = new THREE.Box3().setFromObject(island);
        const centerX = islandBoundingBox.getCenter(new THREE.Vector3()).x;
        const centerY = islandBoundingBox.max.y + 18;
        const centerZ = islandBoundingBox.getCenter(new THREE.Vector3()).z;

        updateLabelPosition(label, new THREE.Vector3(centerX, centerY, centerZ));
    });

    renderer.render(scene, camera);
}

function onClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(islandObjects.map(obj => obj.object), true);

    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;

        // Find the actual island in our array
        while (clickedObject.parent && !islandObjects.some(obj => obj.object === clickedObject)) {
            clickedObject = clickedObject.parent;
        }

        const islandData = islandObjects.find(obj => obj.object === clickedObject);
        if (islandData) {
            console.log("Island clicked:", clickedObject.name);

            // Get the actual island position
            const islandCenter = new THREE.Vector3(
                islandData.position.x,
                islandData.position.y,
                islandData.position.z
            );

            // Move the camera to a closer position in front of the island
            const directionToIsland = new THREE.Vector3().subVectors(camera.position, islandCenter).normalize();
            const fixedScale = 120;
            const zoomDistance = fixedScale * 2; 
            const newCameraPosition = islandCenter.clone().addScaledVector(directionToIsland, zoomDistance);

            controls.enabled = false;

            gsap.to(camera.position, {
                duration: 2,
                x: newCameraPosition.x,
                y: newCameraPosition.y,
                z: newCameraPosition.z,
                onUpdate: () => {
                    camera.lookAt(islandCenter);
                },
                onComplete: () => {
                    controls.enabled = true;
                }
            });

            gsap.to(controls.target, {
                duration: 2,
                x: islandCenter.x,
                y: islandCenter.y,
                z: islandCenter.z
            });
        }
    }
}
