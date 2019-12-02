var scene, camera, renderer;

scene = new THREE.Scene();
scene.background = new THREE.Color( 0x00aaff );

camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0, 20, 20);

const light = new THREE.DirectionalLight( 0xffffff, 1.3 );
light.position.set(0,1,0);
scene.add(light);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const clock = new THREE.Clock();

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const size = 32;
const flatShading = false;

const geometry = new THREE.PlaneGeometry( size, size, size, size );
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00aaff,
  vertexColors: THREE.VertexColors,
  metalness: 0,
  roughness: 1,
  flatShading: flatShading
});
const mesh = new THREE.Mesh( geometry, material );
mesh.rotateX( -Math.PI/2 );
mesh.position.y = 0.3;
scene.add(mesh);

onWindowResize();
window.addEventListener( 'resize', onWindowResize );

update();

function map(val, smin, smax, emin, emax) {
    const t =  (val-smin)/(smax-smin)
    return (emax-emin)*t + emin
}

function noise(nx, ny) {
    // Re-map from -1.0:+1.0 to 0.0:1.0
    return map(simplex.noise2D(nx,ny),-1,1,0,1)
}

//stack some noisefields together
function octave(nx,ny,octaves) {
    let val = 0;
    let freq = 1;
    let max = 0;
    let amp = 1;
    for(let i=0; i<octaves; i++) {
        val += noise(nx*freq,ny*freq)*amp;
        max += amp;
        amp /= 2;
        freq  *= 2;
    }
    return val/max;
}

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  renderer.render( scene, camera );
}