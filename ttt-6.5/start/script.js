var camera, scene, renderer, control, particles;
const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/';

init(); 

function init() {

  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
  camera.position.z = 5;
  scene.add( camera );

  light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(-1,0,1);
  scene.add(light);

  control = new THREE.OrbitControls( camera, renderer.domElement );
  
  //Add code here
  


  renderer.setAnimationLoop( update );
}
 
function update() { 
    const dt = clock.getDelta();
    if (particles){
      particles.forEach( particle => {
        particle.rotation.z += dt * 0.1;
      });
    }
    renderer.render( scene, camera );
}