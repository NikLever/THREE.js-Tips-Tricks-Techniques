var scene, camera, renderer, clock, mesh, helpers, buffer;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  clock = new THREE.Clock();
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, 100);
  
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  scene.add(ambient);
  
  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set( 1, 10, 6);
  scene.add(light);
  
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
   
  buffer = true;
  
  createMesh(buffer);
  
  window.addEventListener( 'resize', resize, false);
  
  update();
}

function createMesh(buffer){
  const points = [];
  
  const height = 80;
  const radius = 30;
  const orgY = -height/2;
  const incY = height/20;
  
  points.push( new THREE.Vector3(radius, orgY));
  points.push( new THREE.Vector3(radius, orgY + incY*2));
  points.push( new THREE.Vector3(radius*0.8, orgY + incY*2));
  points.push( new THREE.Vector3(radius*0.8, orgY + incY*4));
  points.push( new THREE.Vector3(radius*0.6, orgY + incY*5));
  points.push( new THREE.Vector3(radius*0.5, orgY + incY*5));
  points.push( new THREE.Vector3(radius*0.5, orgY + incY*7));
  points.push( new THREE.Vector3(radius*0.4, orgY + incY*13));
  points.push( new THREE.Vector3(radius*0.3, orgY + incY*13));
  points.push( new THREE.Vector3(radius*0.2, orgY + incY*17));
  points.push( new THREE.Vector3(radius*0.1, orgY + incY*17));
  points.push( new THREE.Vector3(0, orgY + incY*20));
  
  let geometry;
  
  if (buffer){
    geometry = new THREE.LatheBufferGeometry( points );
    const normals = geometry.getAttribute('normal');
    const defaultNormals = normals.clone();
    geometry.setAttribute('defaultNormal', defaultNormals);
  }else{
    geometry = new THREE.LatheGeometry( points );
  }
  const material = new THREE.MeshStandardMaterial( { color: 0xabcdef, flatShading: true });
  mesh = new THREE.Mesh( geometry, material );
  
  scene.add(mesh);
}

function update(){
  requestAnimationFrame( update );
	renderer.render( scene, camera ); 
  if (helpers!==undefined) helpers.forEach( helper => helper.update());
  updateNormals();
}

function resize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}