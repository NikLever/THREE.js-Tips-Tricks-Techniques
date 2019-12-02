var scene, camera, renderer, matShader;

scene = new THREE.Scene();
const envmap = new THREE.CubeTextureLoader()
  .setPath( 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/' )
  .load( [
    'skybox2_px.jpg',
    'skybox2_nx.jpg',
    'skybox2_py.jpg',
    'skybox2_ny.jpg',
    'skybox2_pz.jpg',
    'skybox2_nz.jpg'
  ] );
scene.background = envmap;

camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0, 1, 3);

const light = new THREE.DirectionalLight();
light.position.set(0,1,0);
scene.add(light);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.PlaneBufferGeometry( 30, 30, 100, 100 );
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00aaff, 
  envMap: envmap, 
  metalness: 0.9, 
  roughness: 0.1 
});
material.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0}
    shader.vertexShader = `
        uniform float time;
    ` + shader.vertexShader

    const token = '#include <begin_vertex>'
    const customTransform = `
        vec3 transformed = vec3(position);
        float dx = position.x;
        float dy = position.y;
        float freq = sqrt(dx*dx + dy*dy);
        float amp = 0.04;
        float angle = -time*2.0+freq*3.0;
        transformed.z += sin(angle)*amp;

        objectNormal = normalize(vec3(0.0,-amp * freq * cos(angle),1.0));
        vNormal = normalMatrix * objectNormal;
    `
    shader.vertexShader = shader.vertexShader.replace(token,customTransform)
    matShader = shader
}
const mesh = new THREE.Mesh( geometry, material );
mesh.rotateX( -Math.PI/2.5 );
mesh.position.y = 0.3;
scene.add(mesh);

const clock = new THREE.Clock();

camera.position.z = 5;

const controls = new THREE.OrbitControls(camera, renderer.domElement);

onWindowResize();
window.addEventListener( 'resize', onWindowResize );

update();

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  const time = clock.getElapsedTime();
  if(matShader) matShader.uniforms.time.value = time;
  renderer.render( scene, camera );
}