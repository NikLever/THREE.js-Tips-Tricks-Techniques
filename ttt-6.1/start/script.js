const vshader = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = 6.0;
}
`
const fshader = `

void main(){
  vec3 color = vec3(1.0);

  gl_FragColor = vec4( color, 1.0 );
}
`





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,20);

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const uniforms ={
  u_time: { value: 0 }
};

const material = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader
});

//Add code here

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
  if (uniforms.u_time.value> 3.0) uniforms.u_time.value = 0;
  renderer.render( scene, camera );
}