import * as THREE from 'three';

export function ColorInRGB(noiseMapValue) {
    let clr = new THREE.Color();
    clr.lerpColors(new THREE.Color(0, 0, 0), new THREE.Color(1,1,1), noiseMapValue);
    clr.r = ValueInRGBRange(clr.r);
    clr.g = ValueInRGBRange(clr.g);
    clr.b = ValueInRGBRange(clr.b);
    return clr;
}

function ValueInRGBRange(clrVal) {
    let oldVal = clrVal;
    let oldMin = -1;
    let oldMax = 1;
    let newMin = 0;
    let newMax = 255;

    return ( ( (oldVal - oldMin) * (newMax - newMin) ) / (oldMax - oldMin) ) + newMin;
}

function InvLerp(min, max, oldVal) {
    let oldMin = min;
    let oldMax = max;
    let newMin = -1;
    let newMax = 1;

    return ( ( (oldVal - oldMin) * (newMax - newMin) ) / (oldMax - oldMin) ) + newMin;
}

let controlsText
let mapText;

export function CreateUI(seed, scale, octaves, lacunarity, persistance) {
    controlsText = document.createElement('div');
    controlsText.style.position = 'absolute';
    controlsText.style.width = 100;
    controlsText.style.height = 100;
    controlsText.style.backgroundColor = 'rgb(42, 46, 50, 0.5)';
    controlsText.style.color = 'white';
    controlsText.innerHTML = 'Controls:<br>w: Toggle wireframe<br>e: Toggle voronoi mode<br>r: Toggle falloff<br>' +
        'a/s: Inc./dec. seed<br>' +
        'd/f: Inc./dec. scale<br>' +
        'g/h: Inc./dec. octaves<br>' +
        'j/k: Inc./dec. lacunarity<br>' +
        'z/x: Inc./dec. persistance<br>';
    controlsText.style.fontSize = 13 + 'pt';
    controlsText.style.fontFamily = 'monospace';
    controlsText.style.top = 10 + 'px';
    controlsText.style.left = 10 + 'px';
    document.body.appendChild(controlsText);

    mapText = document.createElement('div');
    mapText.style.position = 'absolute';
    mapText.style.width = 100;
    mapText.style.height = 100;
    mapText.style.backgroundColor = 'rgb(42, 46, 50, 0.5)';
    mapText.style.color = 'white';
    mapText.innerHTML =
        'Seed: ' + seed +
        '<br>Scale: ' + scale +
        '<br>Octaves: ' + octaves +
        '<br>Lacunarity: ' + lacunarity +
        '<br>Persistance: ' + persistance;
    mapText.style.fontSize = 16 + 'pt';
    mapText.style.fontFamily = 'monospace';
    mapText.style.top = 10 + 'px';
    mapText.style.right = 10 + 'px';
    document.body.appendChild(mapText);
}

export function UpdateUI(seed, scale, octaves, lacunarity, persistance) {
    mapText.innerHTML =
        'Seed: ' + seed +
        '<br>Scale: ' + scale +
        '<br>Octaves: ' + octaves +
        '<br>Lacunarity: ' + lacunarity +
        '<br>Persistance: ' + persistance;
}



// let geometry = new THREE.BoxGeometry(16, 16, 16, 16, 16, 16);
// let materials = [
//     new THREE.MeshBasicMaterial({ map: loader.load('resources/grid_red.png') }),
//     new THREE.MeshBasicMaterial({ map: loader.load('resources/grid_blue.png') }),
//     new THREE.MeshBasicMaterial({ map: loader.load('resources/grid_green.png') }),
//     new THREE.MeshBasicMaterial({ map: loader.load('resources/grid_pink.png') }),
//     new THREE.MeshBasicMaterial({ map: loader.load('resources/grid_cyan.png') }),
//     new THREE.MeshBasicMaterial({ map: loader.load('resources/grid_yellow.png') })
// ];
// let mesh = new THREE.Mesh(geometry, materials);
// scene.add(mesh);
//
// const wireframeGeometry = new THREE.WireframeGeometry(mesh.geometry);
// const wireframeMaterial = new THREE.LineBasicMaterial({color:0xffffff});
// const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
// scene.add(wireframe);

// function ProjectOntoSphere() {
//     const posAttrib = geometry.getAttribute('position');
//     const posAttribWf = wireframeGeometry.getAttribute('position');
//     const vertex = new THREE.Vector3();
//     const vertexWf = new THREE.Vector3();
//
//     // https://math.stackexchange.com/a/4696995
//     for (let i = 0; i < posAttrib.count; i++) {
//         vertex.fromBufferAttribute(posAttrib, i);
//         vertexWf.fromBufferAttribute(posAttribWf, i);
//         let x = vertex.x;
//         let y = vertex.y;
//         let z = vertex.z;
//         let p = 50;
//
//         let xc =
//             Math.sqrt(Math.pow(x, p) + Math.pow(y, 2) + Math.pow(z, 2))
//             *
//             Math.tan(
//                 x * Math.atan( (1 / Math.sqrt( Math.pow(x, p) + Math.pow(y, 2) + Math.pow(z, 2) )) )
//         );
//         let yc =
//             Math.sqrt(Math.pow(x, 2) + Math.pow(y, p) + Math.pow(z, 2))
//             *
//             Math.tan(
//                 y * Math.atan( (1 / Math.sqrt( Math.pow(x, 2) + Math.pow(y, p) + Math.pow(z, 2) )) )
//         );
//         let zc =
//             Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, p))
//             *
//             Math.tan(
//                 z * Math.atan( (1 / Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, p) )) )
//         );
//
//         vertex.x = xc / Math.sqrt( Math.pow(xc, 2) + Math.pow(yc, 2) + Math.pow(zc, 2) )
//         vertex.y = yc / Math.sqrt( Math.pow(xc, 2) + Math.pow(yc, 2) + Math.pow(zc, 2) )
//         vertex.z = zc / Math.sqrt( Math.pow(xc, 2) + Math.pow(yc, 2) + Math.pow(zc, 2) )
//
//         vertexWf.x = xc / Math.sqrt( Math.pow(xc, 2) + Math.pow(yc, 2) + Math.pow(zc, 2) )
//         vertexWf.y = yc / Math.sqrt( Math.pow(xc, 2) + Math.pow(yc, 2) + Math.pow(zc, 2) )
//         vertexWf.z = zc / Math.sqrt( Math.pow(xc, 2) + Math.pow(yc, 2) + Math.pow(zc, 2) )
//
//         posAttrib.setXYZ(i, vertex.x, vertex.y, vertex.z);
//         posAttribWf.setXYZ(i, vertexWf.x, vertexWf.y, vertexWf.z);
//     }
// }
