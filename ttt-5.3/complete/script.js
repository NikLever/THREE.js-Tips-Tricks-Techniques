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

let simplex = new SimplexNoise(4);
const size = 32;

const geometry = new THREE.PlaneGeometry( size, size, size, size );

let i=0;
geometry.vertices.forEach( vertex => {
  const y = Math.floor(i/size);
  const x = i - y*size;
  let v =  octave(x/size, y/size, 16);
  const v1 = geometry.vertices[i];
  v1.z = map(v,0,1,-10,10) //map from 0:255 to -10:10
  if (v1.z<0) v1.z = 0; //Create lakes
  if(v1.z > 2.5) v1.z *= 1.3 //exaggerate the peaks
  i++;
});

//for every face
geometry.faces.forEach(f=>{
  //get three verts for the face
  const a = geometry.vertices[f.a]
  const b = geometry.vertices[f.b]
  const c = geometry.vertices[f.c]

  //assign colors based on the highest point of the face
  const max = Math.max(a.z,Math.max(b.z,c.z))
  if(max <= 0){
    return f.color.set(0x44ccff);
  }else if(max <= 1.5){
    return f.color.set(0x228800);
  }else if(max <= 3.5){
    return f.color.set(0xeecc44);
  }
  
  //otherwise, return white
  f.color.set(0xFFFFFF);
});

const flatShading = false;

geometry.colorsNeedUpdate = true
geometry.verticesNeedUpdate = true

if (flatShading){
  //required for flat shading
  geometry.computeFlatVertexNormals();
}else{
  geometry.computeVertexNormals();
}

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