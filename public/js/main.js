import * as THREE from 'three';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Client } from 'https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js';

let audioInitialized = false;
let positionalSound;

// Initialize Gradio client
const gradioClient = await Client.connect("pourgrammar/Salesforce-blip-4800");

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Player movement variables
const moveSpeed = 0.15;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let isDrawing = false;
let currentCanvas = null;
let isInteracting = false;

// Color variables
let currentDrawingColor = '#000000'; // Default to black
const colorMap = {
    '1': '#000000', // Black
    '2': '#FFD700', // Yellow
    '3': '#FFA500', // Orange
    '4': '#FF0000', // Red
    '5': '#800080', // Purple
    '6': '#0000FF', // Blue
    '7': '#008000'  // Green
};

// Controls setup
const controls = new PointerLockControls(camera, document.body);

// Room dimensions
const roomWidth = 20;
const roomHeight = 15;
const roomDepth = 15;

// Canvas dimensions
const smallCanvasWidth = 2;
const smallCanvasHeight = 2;
const bigCanvasWidth = 6;
const bigCanvasHeight = 4;

// Create the room
// Create separate geometries for each wall, floor, and ceiling
const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const ceilingGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
const frontWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);

// Create materials
const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xf0f0f0,  // Slightly off-white for walls
    roughness: 0.8,    // Make walls slightly rough
    metalness: 0.1     // Low metalness for a matte finish
});

const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x696969,
    roughness: 0.3,
    metalness: 0.2
});

const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0
});

// Create meshes
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);

// Position everything
floor.rotation.x = -Math.PI/2;
floor.position.y = 0;

ceiling.rotation.x = Math.PI/2;
ceiling.position.y = roomHeight;

backWall.position.set(0, roomHeight/2, -roomDepth/2);

frontWall.position.set(0, roomHeight/2, roomDepth/2);
frontWall.rotation.y = Math.PI;

leftWall.position.set(-roomWidth/2, roomHeight/2, 0);
leftWall.rotation.y = Math.PI/2;

rightWall.position.set(roomWidth/2, roomHeight/2, 0);
rightWall.rotation.y = -Math.PI/2;

// Add everything to the scene
scene.add(floor);
scene.add(ceiling);
scene.add(backWall);
scene.add(frontWall);
scene.add(leftWall);
scene.add(rightWall);

// Create model loader
const loader = new GLTFLoader();

// Create vase pedestal group
const vasePedestal = new THREE.Group();
loader.load('models/vase_pillar.glb', function(gltf) {
    vasePedestal.add(gltf.scene);
    vasePedestal.position.set(-roomWidth/3, 0.75, -roomDepth/2 + 2);
    vasePedestal.scale.set(0.5, 0.5, 0.5);
    scene.add(vasePedestal);
});

// Create bonsai pedestal group
const bonsaiPedestal = new THREE.Group();
loader.load('models/bonsai_pillar.glb', function(gltf) {
    bonsaiPedestal.add(gltf.scene);
    bonsaiPedestal.position.set(roomWidth/3, 0.75, -roomDepth/2 + 2);
    bonsaiPedestal.scale.set(0.5, 0.5, 0.5);
    scene.add(bonsaiPedestal);
});

// Create radio for music
const radio = new THREE.Group();
loader.load('models/radio.glb', function(gltf) {
    radio.add(gltf.scene);
    radio.position.set(roomWidth/2 - 1, 0.25, roomDepth/2 - 1);
    radio.scale.set(0.25, 0.25, 0.25);
    radio.rotation.set(0, Math.PI + Math.PI/4, 0);
    scene.add(radio);
});

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Enhance the existing ambient light
ambientLight.intensity = 0.3;  // Reduce this to allow other lights to have more impact

// Add a warm overhead spotlight for the main canvas area
const mainSpotLight = new THREE.SpotLight(0xfff0dd, 1.5);
mainSpotLight.position.set(0, roomHeight - 1, -roomDepth/4);
mainSpotLight.angle = Math.PI/3;
mainSpotLight.penumbra = 0.5;
mainSpotLight.decay = 1;
mainSpotLight.distance = roomHeight * 2;
scene.add(mainSpotLight);

// Add two softer spotlights for the pedestals
const leftSpotLight = new THREE.SpotLight(0xffeedd, 1);
leftSpotLight.position.set(-roomWidth/3, roomHeight - 2, -roomDepth/2 + 2);
leftSpotLight.target.position.set(-roomWidth/3, 0, -roomDepth/2 + 2);
leftSpotLight.angle = Math.PI/4;
leftSpotLight.penumbra = 0.5;
leftSpotLight.decay = 1.5;
leftSpotLight.distance = roomHeight * 1.5;
scene.add(leftSpotLight);
scene.add(leftSpotLight.target);

const rightSpotLight = new THREE.SpotLight(0xffeedd, 1);
rightSpotLight.position.set(roomWidth/3, roomHeight - 2, -roomDepth/2 + 2);
rightSpotLight.target.position.set(roomWidth/3, 0, -roomDepth/2 + 2);
rightSpotLight.angle = Math.PI/4;
rightSpotLight.penumbra = 0.5;
rightSpotLight.decay = 1.5;
rightSpotLight.distance = roomHeight * 1.5;
scene.add(rightSpotLight);
scene.add(rightSpotLight.target);

// Add subtle side lights for the small canvases
const leftWallLight = new THREE.PointLight(0xffffff, 0.5);
leftWallLight.position.set(-roomWidth/2 + 1, roomHeight - 2, 0);
leftWallLight.decay = 1.5;
leftWallLight.distance = roomWidth;
scene.add(leftWallLight);

const rightWallLight = new THREE.PointLight(0xffffff, 0.5);
rightWallLight.position.set(roomWidth/2 - 1, roomHeight - 2, 0);
rightWallLight.decay = 1.5;
rightWallLight.distance = roomWidth;
scene.add(rightWallLight);

// Add paintbrush model
scene.add(camera);
const paintbrush = new THREE.Group();
loader.load('models/paintbrush.glb', function(gltf) {
    paintbrush.add(gltf.scene);
    camera.add(paintbrush);
    paintbrush.scale.set(0.1, 0.1, 0.1);
    paintbrush.rotation.set(-Math.PI/4, 0, 0);
    paintbrush.position.set(0.5, -0.5, -0.5);
});

// Add paint palette model to left hand
const paintPalette = new THREE.Group();
loader.load('models/paint_palette.glb', function(gltf) {
    paintPalette.add(gltf.scene);
    camera.add(paintPalette);
    paintPalette.scale.set(0.1, 0.1, 0.1);
    paintPalette.rotation.set(-Math.PI/4, 0, 0);
    paintPalette.position.set(-0.5, -0.3, -0.5);
});

// Create crosshair
const crosshair = document.createElement('div');
crosshair.style.position = 'fixed';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.width = '20px';
crosshair.style.height = '20px';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.pointerEvents = 'none'; // Ensure it doesn't interfere with clicking
crosshair.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="1.5" fill="black"/>
        <line x1="10" y1="0" x2="10" y2="5" stroke="black" stroke-width="3"/>
        <line x1="10" y1="15" x2="10" y2="20" stroke="black" stroke-width="3"/>
        <line x1="0" y1="10" x2="5" y2="10" stroke="black" stroke-width="3"/>
        <line x1="15" y1="10" x2="20" y2="10" stroke="black" stroke-width="3"/>
    </svg>
`;
document.body.appendChild(crosshair);

// Create drawing canvases
const canvases = [];
const drawingContexts = [];
const canvasTextures = [];
const drawingData = new Array(4).fill(null);
const smallCanvasButtons = [];

function createCanvas(width, height, position, rotation) {
    // Create HTML canvas for drawing
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = 512;
    drawingCanvas.height = 512;
    const ctx = drawingCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 512, 512);
    
    // Create Three.js canvas
    const texture = new THREE.CanvasTexture(drawingCanvas);
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const canvas = new THREE.Mesh(geometry, material);
    
    canvas.position.set(...position);
    canvas.rotation.set(...rotation);
    
    scene.add(canvas);
    canvases.push(canvas);
    drawingContexts.push(ctx);
    canvasTextures.push(texture);
    
    return canvas;
}

async function canvasToBlob(canvas) {
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

function createCanvasButton(canvas, index) {
    const buttonGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.1);
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    
    // Position button below its canvas
    // Copy canvas position and adjust y coordinate down
    button.position.copy(canvas.position);
    button.position.y -= smallCanvasHeight/2 + 0.3;
    button.rotation.copy(canvas.rotation);
    
    scene.add(button);
    smallCanvasButtons.push(button);
}

// Create small canvases on opposite walls
createCanvas(smallCanvasWidth, smallCanvasHeight, [-roomWidth/2 + 0.01, 2, -3], [0, Math.PI/2, 0]);
createCanvas(smallCanvasWidth, smallCanvasHeight, [-roomWidth/2 + 0.01, 2, 3], [0, Math.PI/2, 0]);
createCanvas(smallCanvasWidth, smallCanvasHeight, [roomWidth/2 - 0.01, 2, -3], [0, -Math.PI/2, 0]);
createCanvas(smallCanvasWidth, smallCanvasHeight, [roomWidth/2 - 0.01, 2, 3], [0, -Math.PI/2, 0]);

const clearButtons = [];
const canvasLabels = [];

function createClearButton(canvas, index) {
    const buttonGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    
    // Position button below its canvas
    button.position.copy(canvas.position);
    button.position.y -= smallCanvasHeight/2 + 0.3;
    button.rotation.copy(canvas.rotation);
    
    // Adjust x offset based on which wall the canvas is on
    if (canvas.rotation.y === Math.PI/2) {  // Left wall
        button.position.z += 0.6;
    } else if (canvas.rotation.y === -Math.PI/2) {  // Right wall
        button.position.z -= 0.6;
    }
    
    scene.add(button);
    clearButtons.push(button);
}

function createCanvasLabel(canvas) {
    // Create a plane for the label
    const geometry = new THREE.PlaneGeometry(2, 0.3);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });
    const label = new THREE.Mesh(geometry, material);
    
    // Position label above its canvas
    label.position.copy(canvas.position);
    label.position.y += smallCanvasHeight/2 + 0.3;
    label.rotation.copy(canvas.rotation);
    
    // Add canvas texture for text
    const canvas2d = document.createElement('canvas');
    canvas2d.width = 512;
    canvas2d.height = 64;
    const context = canvas2d.getContext('2d');
    const texture = new THREE.CanvasTexture(canvas2d);
    label.material.map = texture;
    
    // Store context and texture for updates
    label.userData = {
        context: context,
        texture: texture
    };
    
    scene.add(label);
    canvasLabels.push(label);
    
    return label;
}

function updateLabelText(index, text) {
    const label = canvasLabels[index];
    const context = label.userData.context;
    const texture = label.userData.texture;
    
    // Clear the canvas
    context.clearRect(0, 0, 512, 64);
    
    // Set text properties
    context.fillStyle = 'black';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text, wrapping if necessary
    const maxWidth = 480;
    const words = text.split(' ');
    let line = '';
    let y = 32;
    
    for (let word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const metrics = context.measureText(testLine);
        
        if (metrics.width > maxWidth && line) {
            context.fillText(line, 256, y - 12);
            line = word;
            y += 24;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, 256, y - 12);
    
    // Update the texture
    texture.needsUpdate = true;
}

// Helper function to convert canvas to base64 image
function canvasToImage(canvas) {
    return canvas.toDataURL('image/png').split(',')[1];
}

function addFrameToCanvas(canvas, isMainCanvas = false) {
    const frame = new THREE.Group();
    loader.load('models/gold_frame.glb', function(gltf) {
        frame.add(gltf.scene);
        // change metalness and roughness of the frame
        frame.traverse((child) => {
            if (child.isMesh) {
                child.material.metalness = 0;
                child.material.roughness = 0;
            }
        });
        
        // Copy canvas position and rotation
        frame.position.copy(canvas.position);
        frame.rotation.copy(canvas.rotation);
        
        // Scale based on whether it's the main canvas or small canvas
        if (isMainCanvas) {
            frame.scale.set(
                bigCanvasWidth/5.5,  // Adjust these scaling factors
                bigCanvasHeight/5.5,
                1
            );
        } else {
            frame.scale.set(
                0.35,
                0.35,
                1
            );
        }
        
        // Offset slightly to prevent z-fighting
        if (canvas.rotation.y === Math.PI/2) {  // Left wall
            frame.position.x += 0.01;
        } else if (canvas.rotation.y === -Math.PI/2) {  // Right wall
            frame.position.x -= 0.01;
        } else {  // Front wall
            frame.position.z -= 0.01;
        }
        
        scene.add(frame);
    });
}

// Create main canvas
const mainCanvas = createCanvas(bigCanvasWidth, bigCanvasHeight, [0, 3, -roomDepth/2 + 0.01], [0, 0, 0]);

// Create buttons for the first 4 canvases (small ones)
for (let i = 0; i < 4; i++) {
    createCanvasButton(canvases[i], i);
    createClearButton(canvases[i], i);
    createCanvasLabel(canvases[i]);
    addFrameToCanvas(canvases[i]);
}

addFrameToCanvas(mainCanvas, true);

// Create button under main canvas
const buttonGeometry = new THREE.BoxGeometry(1, 0.5, 0.1);
const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
button.position.set(0, 1, -roomDepth/2 + 0.1);
scene.add(button);

// Set initial camera position
camera.position.set(0, 2, roomDepth/2 - 2);

// Event listeners
document.addEventListener('click', function() {
    if (!controls.isLocked) {
        controls.lock();
    }
    if (!audioInitialized) {
        audioInitialized = true;
        const listener = new THREE.AudioListener();
        camera.add(listener);
        positionalSound = new THREE.PositionalAudio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('audio/elevator_bossa_nova.mp3', function(buffer) {
            positionalSound.setBuffer(buffer);
            positionalSound.setVolume(0.25);
            positionalSound.setRefDistance(5);
            positionalSound.setLoop(true);
            positionalSound.play();
        });
        radio.add(positionalSound);
    }
});

document.addEventListener('mousedown', function() {
    if (currentCanvas !== null && controls.isLocked) {
        isDrawing = true;
    }
    isInteracting = true;
});

document.addEventListener('mouseup', function() {
    isDrawing = false;
    isInteracting = false;
    if (currentCanvas !== null) {
        // Sketch recognition with ML goes here :-)
        // drawingData[currentCanvas] = processDrawingWithML(drawingContexts[currentCanvas]);
    }
});

document.addEventListener('keydown', function(event) {
    function updateCrosshairColor(color) {
        const svgElements = crosshair.querySelectorAll('circle, line');
        svgElements.forEach(element => {
            if (element.tagName === 'circle') {
                element.setAttribute('fill', color);
            } else {
                element.setAttribute('stroke', color);
            }
        });
    }

    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        // Add color selection keys
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
            const key = event.code.slice(-1); // Get the number
            if (colorMap[key]) {
                currentDrawingColor = colorMap[key];
                updateCrosshairColor(currentDrawingColor);
            }
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
});



// Raycaster for interaction detection
const raycaster = new THREE.Raycaster();
const interactionDistance = 3;

function checkInteractions() {
    // Direction player is facing
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    raycaster.set(camera.position, direction);
    
    // Check for radio interactions
    const radioIntersects = raycaster.intersectObject(radio);
    if (radioIntersects.length > 0 && radioIntersects[0].distance < interactionDistance) {
        if (isInteracting && positionalSound) {
            if (positionalSound.isPlaying) {
                positionalSound.pause();
            } else {
                positionalSound.play();
            }
            isInteracting = false;
        }
    }

    // Check for canvas interactions
    const intersects = raycaster.intersectObjects(canvases);
    
    if (intersects.length > 0 && intersects[0].distance < interactionDistance) {
        currentCanvas = canvases.indexOf(intersects[0].object);
        
        // Handle drawing if mouse is pressed
        if (isDrawing) {
            const intersect = intersects[0];
            const point = intersect.uv;
            if (point) {
                const ctx = drawingContexts[currentCanvas];
                ctx.fillStyle = currentDrawingColor;
                ctx.beginPath();
                ctx.arc(
                    point.x * 512,
                    (1 - point.y) * 512,
                    5,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                canvasTextures[currentCanvas].needsUpdate = true;
            }
        }
    } else {
        currentCanvas = null;
    }
    
    const buttonIntersects = raycaster.intersectObjects(smallCanvasButtons);
    if (buttonIntersects.length > 0 && buttonIntersects[0].distance < interactionDistance) {
        const buttonIndex = smallCanvasButtons.indexOf(buttonIntersects[0].object);
        buttonIntersects[0].object.material.color.setHex(0x6666ff);
        
        if (controls.isLocked && isInteracting && gradioClient) {
            canvasToBlob(drawingContexts[buttonIndex].canvas)
                .then(async blob => {
                    try {
                        const result = await gradioClient.predict("/predict", [
                            blob
                        ]);
                        
                        // Extract the generated text from the response
                        const match = result.data[0].match(/generated_text='([^']+)'/);
                        if (match) {
                            const generatedText = match[1];
                            updateLabelText(buttonIndex, generatedText);
                        }
                        
                    } catch (error) {
                        console.error("Error calling Gradio API:", error);
                    }
                });
            
            isInteracting = false;
        }
    } else {
        // Reset button colors if not hovering
        smallCanvasButtons.forEach(button => {
            button.material.color.setHex(0x4444ff);
        });
    }

    // Check for clear button interactions
    const clearButtonIntersects = raycaster.intersectObjects(clearButtons);
    if (clearButtonIntersects.length > 0 && clearButtonIntersects[0].distance < interactionDistance) {
        const buttonIndex = clearButtons.indexOf(clearButtonIntersects[0].object);
        clearButtonIntersects[0].object.material.color.setHex(0xff6666); // Highlight button
        
        if (controls.isLocked && isInteracting) {
            // Clear the canvas
            const ctx = drawingContexts[buttonIndex];
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 512, 512);
            canvasTextures[buttonIndex].needsUpdate = true;
            drawingData[buttonIndex] = null;
            
            isInteracting = false;
        }
    } else {
        // Reset clear button colors if not hovering
        clearButtons.forEach(button => {
            button.material.color.setHex(0xff4444);
        });
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        // Update velocity based on movement keys
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        
        velocity.z = direction.z * moveSpeed;
        velocity.x = direction.x * moveSpeed;
        
        controls.moveRight(velocity.x);
        controls.moveForward(velocity.z);
        
        // Keep player within room bounds
        camera.position.y = 2; // Lock height
        camera.position.x = Math.max(-roomWidth/2 + 1, Math.min(roomWidth/2 - 1, camera.position.x));
        camera.position.z = Math.max(-roomDepth/2 + 1, Math.min(roomDepth/2 - 1, camera.position.z));
    }
    
    checkInteractions();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();