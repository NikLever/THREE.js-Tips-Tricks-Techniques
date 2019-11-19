const vshader = `
uniform float u_time;
uniform float u_radius;

void main() {
  float delta = (sin(u_time)+1.0)/2.0;
  vec3 v = normalize(position) * u_radius;
  vec3 pos = delta * position + (1.0 - delta) * v;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`
const fshader = `
void main()
{
  vec3 color = vec3(0.0, 1.0, 0.0);
  gl_FragColor = vec4(color, 1.0);
}
`






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const clock = new THREE.Clock();

const ambient = new THREE.HemisphereLight(0x444444, 0x111111, 1);
const light = new THREE.DirectionalLight(0xcccccc, 0.8);
light.position.set(0,6,2);
scene.add(ambient);
scene.add(light);

const geometry = new THREE.BoxGeometry( 30, 30, 30, 10, 10, 10 );
const uniforms = {};
uniforms.u_time = { value: 0.0 };
uniforms.u_radius = { value: 20.0 };

const material = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
  wireframe: false
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