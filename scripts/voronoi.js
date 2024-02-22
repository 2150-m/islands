import * as THREE from 'three';
import { RandomFromRange } from './main.js';

class Region {
    constructor(point, color) {
        this.m_point = point;
        this.m_color = color;
        this.m_voronoiColor = new THREE.Color(RandomFromRange(40,255), RandomFromRange(40,255), RandomFromRange(40,255))
    }

    SetToWater() {
        this.m_color = new THREE.Color(62, 134, 249);
    }

    SetToLand() {
        this.m_color = new THREE.Color(74, 249, 62);
    }
}

export function VoronoiGeneratePoints(numOfGridsX, numOfGridsY, pixelsPerGrid) {
    let regions = new Array(numOfGridsX);
    for (let i = 0; i < numOfGridsX; i++) { regions[i] = new Array(numOfGridsY); }

    for (let y = 0; y < numOfGridsY; y++) {
        for (let x = 0; x < numOfGridsX; x++) {
            let posX = Math.floor(x * pixelsPerGrid + RandomFromRange(0, pixelsPerGrid - 1));
            let posY = Math.floor(y * pixelsPerGrid + RandomFromRange(0, pixelsPerGrid - 1));

            regions[x][y] = new Region(
                new THREE.Vector2(posX, posY),
                new THREE.Color(RandomFromRange(40,255), RandomFromRange(40,255), RandomFromRange(40,255))
            );
        }
    }

    return regions;
}

// Source: https://youtu.be/-fYI_5hQcOI?t=220, but fixed
export function VoronoiGenerateDiagrams(mapHeight, mapWidth, pixelsPerGrid, numOfGridsX, numOfGridsY, regions) {
    // TODO - function that generates continents

    let colorMap = new Array(mapWidth * mapHeight);

    for (let j = 0; j < mapHeight; j++) {
        for (let i = 0; i < mapWidth; i++) {
            let xGrid = Math.floor(i / pixelsPerGrid);
            let yGrid = Math.floor(j / pixelsPerGrid);

            let closest = Number.POSITIVE_INFINITY;
            let closestPoint;

            for (let u = -1; u < 2; u++) {
                for (let v = -1; v < 2; v++) {
                    let x = xGrid + u;
                    let y = yGrid + v;

                    if (x < 0 || y < 0 || x >= numOfGridsX || y >= numOfGridsY)
                        continue;

                    let dist = new THREE.Vector2(i ,j).distanceTo(regions[x][y].m_point);
                    if (dist < closest) {
                        closest = dist;
                        closestPoint = regions[x][y];
                    }
                }
            }

            colorMap[j * mapWidth + i] = closestPoint.m_color;
        }
    }

    return colorMap;
}
