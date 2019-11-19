const vshader = `
#include <common>
#include <lights_pars_begin>

uniform float u_time;
uniform float u_radius;

varying vec3 v_lightIntensity;

void main() {
  float delta = (sin(u_time)+1.0)/2.0;

  vec3 vLightFront;
  vec3 objectNormal = mix(normalize(position), normal, delta);

  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
  #include <lights_lambert_vertex>

  v_lightIntensity = vLightFront + ambientLightColor;
  
  vec3 v = normalize(position) * u_radius;
  vec3 pos = delta * position + (1.0 - delta) * v;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
`
const fshader = `
varying vec3 v_lightIntensity;

void main()
{
  vec3 color = vec3(0.0, 1.0, 0.0);
  gl_FragColor = vec4(v_lightIntensity * color, 1.0);
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
const uniforms = THREE.UniformsUtils.merge( [
  THREE.UniformsLib[ "common" ],
  THREE.UniformsLib[ "lights" ]
]); 
uniforms.u_time = { value: 0.0 };
uniforms.u_mouse = { value:{ x:0.0, y:0.0 }};
uniforms.u_resolution = { value:{ x:0, y:0 }};
uniforms.u_radius = { value: 20.0 };

const material = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: vshader,
  fragmentShader: fshader,
  lights: true
} );

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