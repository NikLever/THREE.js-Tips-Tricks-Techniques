const vshader = `
uniform float u_time;
uniform float u_radius;

varying vec3 v_normal;

void main() {
  float delta = ((sin(u_time)+1.0)/2.0);

  vec3 v = normalize(position) * u_radius;
  vec3 pos = mix(position, v, delta);

  v_normal = (modelMatrix * vec4(mix(normal, normalize(position), delta), 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`
const fshader = `
uniform vec3 u_light;

varying vec3 v_normal;

void main(){
  vec3 lightVector = normalize(u_light);
  float lightIntensity = clamp(dot(lightVector, v_normal), 0.0, 1.0) + 0.2;
  vec3 color = lightIntensity * vec3(0.0, 1.0, 0.0);

  gl_FragColor = vec4(color, 1.0); 
}
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
uniforms.u_mouse = { value:{ x:0.0, y:0.0 }};
uniforms.u_resolution = { value:{ x:0, y:0 }};
uniforms.u_radius = { value: 20.0 };
uniforms.u_light = { value: new THREE.Vector3(0.5,0.8,0.1) };

const material = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
  wireframe: false
} );

const material1 = new THREE.MeshBasicMaterial({
  color: 0xb7ff00,
  wireframe: true
});

const ball = new THREE.Mesh( geometry, material );
scene.add( ball );

const controls = new THREE.OrbitControls(camera, renderer.domElement);

onWindowResize();
if ('ontouchstart' in window){
  document.addEventListener('touchmove', move);
}else{
  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener('mousemove', move);
}

function move(evt){
  uniforms.u_mouse.value.x = (evt.touches) ? evt.touches[0].clientX : evt.clientX;
  uniforms.u_mouse.value.y = (evt.touches) ? evt.touches[0].clientY : evt.clientY;
}

animate();

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  requestAnimationFrame( animate );
  uniforms.u_time.value += clock.getDelta();
  renderer.render( scene, camera );
}