const vshader = `
uniform vec3 u_gravity;
uniform float u_duration;
uniform float u_time;

attribute vec3 velocity;
attribute float startTime;

void main() {
  float time = u_time - startTime;
  if (time<u_duration){
    vec3 acc = u_gravity * 0.5 * time * time;
    vec3 vel = velocity * time;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position + acc + vel, 1.0 );
  gl_PointSize = 46.0;
  }else{
    gl_PointSize = 0.0;
  }
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

const COUNT = 1000;
const positions = new Float32Array(COUNT*3);
const velocity = new Float32Array(COUNT*3);
geometry = new THREE.BufferGeometry();

const size = 0;
const speed = 10;

for(let i=0; i<positions.length; i++) {
  positions[i] = (Math.random()-0.5) * size;
  velocity[i] = (Math.random()-0.5) * speed;
}

geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ));
geometry.setAttribute( 'velocity', new THREE.BufferAttribute( velocity, 3 ));

const startTime = new Float32Array(COUNT);
for(let i=0; i<startTime.length; i++){
  startTime[i] = -5.0;
}
geometry.setAttribute( 'startTime', new THREE.BufferAttribute( startTime, 1 ));

let index = 0;

const material = new THREE.PointsMaterial({
  map: new THREE.TextureLoader().setPath( assetPath ).load('star_01.png'),
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});

material.onBeforeCompile = shader => {
  shader.uniforms.u_gravity = { value: new THREE.Vector3(0, -2, 0) };
  shader.uniforms.u_time = { value: 0 };
  shader.uniforms.u_duration = { value: 10.0 };
  shader.vertexShader = vshader;
  matShader = shader;
};

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
  const time = clock.getElapsedTime();
  if (matShader) matShader.uniforms.u_time.value = time;
  if (geometry){
    const startTime = geometry.getAttribute( 'startTime' );
    const spawnRate = 3;
    let count = 0;
    let offset = index;
    for(let i=0; i<spawnRate; i++){
      startTime.array[index] = time;
      index++;
      count++;
      if (index>=COUNT){
        index = 0;
        break;
      }
    }
    startTime.updateRange.offset = offset;
    startTime.updateRange.count = count;
    startTime.needsUpdate = true;
  }
  
  renderer.render( scene, camera );
}