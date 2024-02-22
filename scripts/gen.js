import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { ColorInRGB } from './other';

export default class Terrain {
    constructor(name, height, color) {
        this.m_name = name;
        this.m_height = height;
        this.m_color = color;
    }
}

let terrains = [
    // new Terrain("deeperwater", 0.15, new THREE.Color(26,163,255)),
    new Terrain("deepwater", 0.28, new THREE.Color(26,178,255)),
    new Terrain("water", 0.55, new THREE.Color(84, 200, 255)),
    new Terrain("flat", 0.59, new THREE.Color(77, 255, 77)),
    new Terrain("lessflat", 0.63, new THREE.Color(0, 230, 0)),
    new Terrain("lesslessflat", 0.68, new THREE.Color(0, 204, 0)),
    new Terrain("hills", 0.725, new THREE.Color(198, 140, 83)),
    new Terrain("higherhills", 0.8, new THREE.Color(191, 128, 64)),
    new Terrain("mountains", 0.9, new THREE.Color(172,115,57)),
    new Terrain("snow", 1, new THREE.Color(255,255,255)),
];

export function GenerateMap(mapWidth, mapHeight, seed, octaves, scale, persistence, lacunarity) {
    let noiseMap = GenerateNoiseMap(mapWidth, mapHeight, seed, persistence, lacunarity, octaves, scale);
    let falloffMap = GenerateFalloffMap(mapWidth, mapHeight);

    return [ noiseMap, falloffMap ];
}

function GenerateNoiseMap(mapWidth, mapHeight, seed, persistance, lacunarity, octaves, scale) {
    if (scale <= 0) scale = 0.0001;

    let noiseMap = new Array(mapWidth);
    for (let k = 0; k < noiseMap.length; k++) noiseMap[k] = new Array(mapHeight);

    const noise2D = createNoise2D(alea(seed));
    let maxNoise = Number.MIN_VALUE;
    let minNoise = Number.MAX_VALUE;

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let amplitude = 1;
            let frequency = 1;
            let noiseHeight = 0;

            // source: Sebastian Lague
            for (let k = 0; k < octaves; k++) {
                let sampleX = x / scale * frequency * 2 - 1;
                let sampleY = y / scale * frequency * 2 - 1;

                noiseHeight += noise2D(sampleX, sampleY) * amplitude;

                amplitude *= persistance;
                frequency *= lacunarity;
            }

            if (noiseHeight > maxNoise) maxNoise = noiseHeight;
            else if (noiseHeight < minNoise) minNoise = noiseHeight;

            noiseMap[x][y] = noiseHeight;
        }
    }

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            noiseMap[x][y] = THREE.MathUtils.inverseLerp(minNoise, maxNoise, noiseMap[x][y]);
        }
    }

    return noiseMap;
}

function GenerateFalloffMap(mapWidth, mapHeight) {
    let falloffMap = new Array(mapWidth);
    for (let k = 0; k < falloffMap.length; k++) {
        falloffMap[k] = new Array(mapHeight);
    }

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let xVal = x / mapWidth * 2 - 1;
            let yVal = y / mapHeight * 2 - 1;

            // source: redblobgames.com - square bump method
            let distance = 1 - (1 - xVal*xVal) * (1 - yVal*yVal);
            falloffMap[x][y] = THREE.MathUtils.lerp(0, distance, 0.7)
        }
    }

    return falloffMap;
}


export function DrawColorMap(mapWidth, mapHeight, applyFalloff, noiseMap, falloffMap) {
    let colorMap = new Array(mapWidth * mapHeight);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {

            let currentHeight = noiseMap[x][y];
            if (applyFalloff) {
                currentHeight -= falloffMap[x][y];
            }

            for (let k = 0; k < terrains.length; k++) {
                if (currentHeight <= terrains[k].m_height) {
                    colorMap[y * mapWidth + x] = terrains[k].m_color;
                    break;
                }
            }
        }
    }

    return colorMap;
}

// function DrawNoiseMapWoFalloff() {
//     let colorMap = new Array(mapWidth * mapHeight);
//     for (let y = 0; y < mapHeight; y++) {
//         for (let x = 0; x < mapWidth; x++) {
//             let currentHeight = noiseMap[x][y];
//             colorMap[y * mapWidth + x] = ColorInRGB(currentHeight);
//         }
//     }
//
//     return colorMap;
// }

export function DrawNoiseMap(mapWidth, mapHeight, applyFalloff, noiseMap, falloffMap) {
    let colorMap = new Array(mapWidth * mapHeight);
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let currentHeight = noiseMap[x][y];
            if (applyFalloff) {
                currentHeight -= falloffMap[x][y];
            }

            colorMap[y * mapWidth + x] = ColorInRGB(currentHeight);
        }
    }

    return colorMap;
}
