const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,2);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const material = new THREE.MeshBasicMaterial();
const geometry = new THREE.PlaneBufferGeometry(100, 100);
const plane = new THREE.Mesh( geometry, material );

const texture = new THREE.TextureLoader().setPath( assetPath ).load( 'star_01.png');

const options = {
  maxParticles: 10000,
  position: new THREE.Vector3(0, 0, 0),
  positionRandomness: 0.0,
  baseVelocity: new THREE.Vector3(0.0, 0.3, -0.1),
  velocity: new THREE.Vector3(0.0, 0.0, 0.0),
  velocityRandomness: 1.0,
  acceleration: new THREE.Vector3(0, -1.0, 0),
  startColor: new THREE.Color(1.0, 1.0, 0.5),
  endColor: new THREE.Color(1.0,0,0),
  colorRandomness: 0.5,
  lifetime: 2,
  size: 100,
  sizeRandomness: 1.0,
  particleSpriteTex: texture,
  blending: THREE.AdditiveBlending
}

let spawnRate = 1;

const parts = new GPUParticleSystem({
  maxParticles: 10000,
  particleSpriteTex: texture,
  blending: THREE.AdditiveBlending,
  onTick:(system, time) => {
    for ( let i=0; i<spawnRate; i++ ) {
      options.velocity.copy( options.baseVelocity );
      options.velocity.x += system.random() * options.velocityRandomness
      options.velocity.y += system.random() * options.velocityRandomness
      options.velocity.z += system.random() * options.velocityRandomness
      system.spawnParticle( options );
    }
  }});
scene.add(parts)


onWindowResize();
window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mouseup', onMouseUp, false );

renderer.setAnimationLoop( update );

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onMouseDown( event ){
  spawnRate = 30;
}

function onMouseMove( event ){
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObject( plane );
  if (intersects.length>0){
    options.position.copy(intersects[0].point);
  }
}

function onMouseUp( event ){
  spawnRate = 1;
}

function update(time){ 
  if(parts) parts.update(time);
  renderer.render( scene, camera );
}