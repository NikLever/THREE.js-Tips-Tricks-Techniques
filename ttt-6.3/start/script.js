var parts;

const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,2);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setAnimationLoop( update );

const rand = (min,max) => Math.random()*(max-min) + min

const texture = new THREE.TextureLoader().setPath( assetPath ).load( 'star_01.png');

//Add code here


const controls = new THREE.OrbitControls(camera, renderer.domElement);

onWindowResize();
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update(time){ 
  if(parts) parts.update(time);
  renderer.render( scene, camera );
}