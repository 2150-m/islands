import '../index.d.ts';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import alea from 'alea';

import { VoronoiGeneratePoints } from './voronoi.js';
import { VoronoiGenerateDiagrams } from './voronoi.js';
import { GenerateMap } from './gen.js';
import { DrawColorMap } from './gen.js';
import { DrawNoiseMap } from './gen.js';
import { CreateUI } from './other.js';
import { UpdateUI } from './other.js';

// THREEJS SETUP
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias:true, canvas, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 100000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;

// MAP/GENERATION
let mapHeight = 512;
let mapWidth = mapHeight * 2;

let numOfGridsY = 10;
let numOfGridsX = numOfGridsY * 2;
let pixelsPerGrid = mapHeight / numOfGridsY;

let seed = 123;
let randNumGen = alea(seed);

let octaves = 6;
let scale = 500;
let persistance = 0.5;
let lacunarity = 2.02;

let drawColorMap = true;
let applyFalloff = true;
let voronoiMode = false;

let voronoiRegions;
let colorMap = new Array(mapWidth * mapHeight);
let colorMap_Noise = new Array(mapWidth * mapHeight);
let colorMap_Voronoi = new Array(mapWidth * mapHeight);

// THREEJS OBJECTS
let mapPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(mapWidth, mapHeight, numOfGridsX, numOfGridsY),
    new THREE.MeshBasicMaterial({ color:0xffffff })
);
scene.add(mapPlane);

let mapPlaneWireframeMaterial = new THREE.LineBasicMaterial({ color:0x000000 });
let mapPlaneWireframe = new THREE.LineSegments(new THREE.WireframeGeometry(mapPlane.geometry), mapPlaneWireframeMaterial);
scene.add(mapPlaneWireframe);

// FUNCTIONS
Main();
function Main() {
    // wireframe.visible = false;
    mapPlaneWireframe.visible = false;
    mapPlaneWireframe.position.z = 1;
    camera.position.z = mapWidth;
    camera.updateMatrixWorld();
    controls.update();

    CreateUI(seed, scale, octaves, lacunarity, persistance);

    document.addEventListener(
        "keyup",
        (event) => {
            const keyName = event.key;

            switch (keyName) {
                case 'w': {
                    mapPlaneWireframe.visible = !mapPlaneWireframe.visible;
                    break;
                }

                case 'e': {
                    voronoiMode = !voronoiMode;
                    Draw();
                    break;
                }

                case 'r': {
                    applyFalloff = !applyFalloff;
                    console.log("falloff: " + applyFalloff);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }

                case 'a': {
                    seed += 1;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }
                case 's': {
                    seed -= 1;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }

                case 'd': {
                    scale += 50;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }
                case 'f': {
                    scale -= 50;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }

                case 'g': {
                    octaves += 1;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }
                case 'h': {
                    octaves -= 1;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }

                case 'j': {
                    lacunarity += 0.02;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }
                case 'k': {
                    lacunarity -= 0.02;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }

                case 'z': {
                    persistance += 0.02;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }
                case 'x': {
                    persistance -= 0.02;
                    UpdateUI(seed, scale, octaves, lacunarity, persistance);
                    GenerateTerrainMap();
                    Draw();
                    break;
                }
            }
        }
    );

    Generate();
    Draw(colorMap, colorMap_Noise, colorMap_Voronoi, voronoiRegions);
    RenderScene();
}

function Generate() {
    GenerateVoronoi();
    GenerateTerrainMap();
}

function GenerateVoronoi() {
    voronoiRegions = VoronoiGeneratePoints(numOfGridsX, numOfGridsY, pixelsPerGrid, randNumGen);
    colorMap_Voronoi = VoronoiGenerateDiagrams(mapHeight, mapWidth, pixelsPerGrid, numOfGridsX, numOfGridsY, voronoiRegions);
}

function GenerateTerrainMap() {
    let [ noiseMap, falloffMap ] = GenerateMap(mapWidth, mapHeight, seed, octaves, scale, persistance, lacunarity);
    colorMap = DrawColorMap(mapWidth, mapHeight, applyFalloff, noiseMap, falloffMap);
    colorMap_Noise = DrawNoiseMap(mapWidth, mapHeight, applyFalloff, noiseMap, falloffMap);
}

function Draw() {
    if (!voronoiMode) {
        if (!drawColorMap)  ApplyTexture(colorMap_Noise, voronoiRegions);
        else                ApplyTexture(colorMap, voronoiRegions);
    }
    else {
        ApplyTexture(colorMap_Voronoi, voronoiRegions);
    }
}

function ApplyTexture(colorMap, voronoiRegions) {
    let canvas = document.createElement('canvas');
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    let context = canvas.getContext('2d');

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    if (voronoiMode) {
        // DRAW VORONOI CELL CENTERS
        for (let y = 0; y < numOfGridsY; y++) {
            for (let x = 0; x < numOfGridsX; x++) {
                colorMap[voronoiRegions[x][y].m_point.y * mapWidth + voronoiRegions[x][y].m_point.x] = new THREE.Color(255, 255, 255);
            }
        }
    }

    let u = 0;
    for (let k = 0; k < imageData.data.length; k += 4) {
        if (colorMap[u] === undefined) {
            imageData.data[k]   = 255;
            imageData.data[k+1] = 0;
            imageData.data[k+2] = 0;
            imageData.data[k+3] = 255;
            u++;
            continue;
        }

        imageData.data[k]   = colorMap[u].r;
        imageData.data[k+1] = colorMap[u].g;
        imageData.data[k+2] = colorMap[u].b;
        imageData.data[k+3] = 255;
        u++;
    }

    context.putImageData(imageData, 0, 0);
    let texture = new THREE.CanvasTexture(context.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    mapPlane.material = new THREE.MeshBasicMaterial({ map: texture });
}

function RenderScene() {
    requestAnimationFrame(RenderScene);
    renderer.render(scene, camera);
}

export function RandomFromRange(min, max) {
    return Math.floor(randNumGen() * (max-min+1) + min);
}

export function Random() {
    return randNumGen();
}
