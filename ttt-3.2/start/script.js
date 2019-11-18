const vshader = `
`
const fshader = `
`






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const clock = new THREE.Clock();

const geometry = new THREE.BoxGeometry( 30, 30, 30, 10, 10, 10 );
const uniforms = {};
uniforms.u_time = { value: 0.0 };
uniforms.u_radius = { value: 20.0 };

const material = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  wireframe: true
} );

const box = new THREE.Mesh( geometry, material );
scene.add( box );

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
  uniforms.u_time.value += clock.getDelta();
  renderer.render( scene, camera );
}