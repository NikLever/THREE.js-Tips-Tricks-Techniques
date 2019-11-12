var scene, camera, renderer, controls, tube;

init();

function init(){
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, -150);
  
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  scene.add(ambient);
  
  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set( 1, 10, 6);
  scene.add(light);
  
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  //Add meshes here
  createTube('GrannyKnot');
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  const gui = new dat.GUI();
  const options = {
    type: 'GrannyKnot'
  };
  
  gui.add(options, 'type', Object.keys(THREE.Curves)).onChange(value => createTube(value)
  );
    
  window.addEventListener( 'resize', resize, false);
  
  update();
}

function createTube(type){
  if (tube!==undefined) scene.remove(tube);
  const curve = new THREE.Curves[type]();
  const geometry = new THREE.TubeBufferGeometry( curve, 200, 3, 8, true );
  const material = new THREE.MeshStandardMaterial({ wireframe:false, color: 0xffffff });
  tube = new THREE.Mesh( geometry, material );
  scene.add(tube);
}

function update(){
  requestAnimationFrame( update );
	renderer.render( scene, camera );  
}

function resize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}