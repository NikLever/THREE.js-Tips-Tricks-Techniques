const vshader = `
uniform vec3 u_gravity;
uniform float u_time;

attribute vec3 velocity;

void main() {
  vec3 acc = u_gravity * 0.5 * u_time * u_time;
  vec3 vel = velocity * u_time;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position + acc + vel, 1.0 );
  gl_PointSize = 46.0;
}
`

var matShader, geometry;

const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,20);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const COUNT = 100;
const positions = new Float32Array(COUNT*3);
const velocity = new Float32Array(COUNT*3);
geometry = new THREE.BufferGeometry();

const size = 0;
const speed = 10;

for(let i=0; i<positions.length; i++) {
  positions[i] = (Math.random()-0.5) * size;
  velocity[i] = (Math.random()-0.5) * speed;
}

let index = 0;

geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ));
geometry.setAttribute( 'velocity', new THREE.BufferAttribute( velocity, 3 ));

const material = new THREE.PointsMaterial({
  map: new THREE.TextureLoader().setPath( assetPath ).load('star_01.png'),
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});

mesh = new THREE.Points(geometry, material);
scene.add(mesh);


const controls = new THREE.OrbitControls(camera, renderer.domElement);

onWindowResize();
window.addEventListener( 'resize', onWindowResize, false );

update();

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  if (matShader){
    matShader.uniforms.u_time.value += clock.getDelta();
    if (matShader.uniforms.u_time.value > 3.0) matShader.uniforms.u_time.value = 0;
  }
  renderer.render( scene, camera );
}