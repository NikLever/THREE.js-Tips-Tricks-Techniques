const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,2);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const rand = (min,max) => Math.random()*(max-min) + min

const texture = new THREE.TextureLoader().setPath( assetPath ).load( 'star_01.png');

const options = {
  position: new THREE.Vector3(0,0,0),
  positionRandomness: 0.0,
  velocity: new THREE.Vector3(0.0, -0.5, 0.0),
  velocityRandomness: 1.0,
  acceleration: new THREE.Vector3(0.0,-1.0,0.0),

  color: new THREE.Color(1.0,1.0,1.0),
  endColor: new THREE.Color(1.0,0.0,1.0),
  colorRandomness: 0.0,

  lifetime: 2.0,
  fadeIn:0.001,
  fadeOut:0.001,
  size: 100,
  sizeRandomness: 0.0,
}

const parts = new GPUParticleSystem({
  maxParticles: 10000,
  particleSpriteTex: texture,
  blending: THREE.AdditiveBlending,
  onTick:(system, time) => {
    for (let i = 0; i < 10; i++) {
      options.velocity.set(rand(-1,1), rand(-1,1), 0);
      system.spawnParticle(options);
    }
  }});
scene.add(parts)

const controls = new THREE.OrbitControls(camera, renderer.domElement);

onWindowResize();
window.addEventListener( 'resize', onWindowResize, false );

renderer.setAnimationLoop( update );

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update(time){ 
  if(parts) parts.update(time);
  renderer.render( scene, camera );
}