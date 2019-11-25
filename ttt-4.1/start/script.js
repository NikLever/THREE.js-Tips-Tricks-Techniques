var scene, camera, renderer, controls, world, helper, dt, damping, groundMaterial;

init();

function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 3, 10);

  const ambient = new THREE.HemisphereLight(0x555555, 0xFFFFFF);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0,1.25,1.25);
  light.castShadow = true;
  const size = 15;
  light.shadow.left = -size;
  light.shadow.bottom = -size;
  light.shadow.right = size;
  light.shadow.top = size;
  scene.add(light);

  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 2, 0);
  controls.update();
  
  onWindowResize();

  window.addEventListener( 'resize', onWindowResize, false );

  update();
}

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  if (world !== undefined) world.step(dt);
  if (helper !== undefined) helper.update( );
  renderer.render( scene, camera );
}