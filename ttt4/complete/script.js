class StarShape extends THREE.Shape{
  constructor(sides, innerRadius, outerRadius){
    super();
    let theta = 0;
    const inc = ((2 * Math.PI) / sides) * 0.5;
  
    this.moveTo(Math.cos(theta)*outerRadius, Math.sin(theta)*outerRadius);
  
    for(let i=0; i<sides; i++){
      theta += inc;
      this.lineTo(Math.cos(theta)*innerRadius, Math.sin(theta)*innerRadius);
      theta += inc;
      this.lineTo(Math.cos(theta)*outerRadius, Math.sin(theta)*outerRadius);
    }
  }  
}

var scene, camera, renderer, mesh, group, clock;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  clock = new THREE.Clock();
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, 150);
  
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
  scene.add(ambient);
  
  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set( 1, 10, 6);
  scene.add(light);
  
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  createMesh();
  
  window.addEventListener( 'resize', resize, false);
  
  update();
}

function createMesh(){
  const extrudeSettings = {
    depth: 6,
    bevelEnabled: false
  };
  const shape = new StarShape(5, 5, 12);
  const heartGeometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
  group = new THREE.Group();
  scene.add(group);
  const geometry = new THREE.IcosahedronBufferGeometry( 60, 1 );
  const mat = new THREE.MeshBasicMaterial({wireframe:true});
  mesh = new THREE.Mesh(geometry, mat);
  scene.add(mesh);
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  for(let i=0; i<position.array.length; i+=3){
    const color = new THREE.Color().setHSL(i/position.count, 1.0, 0.7);
    const material = new THREE.MeshStandardMaterial({ color: color });
    const heart = new THREE.Mesh(heartGeometry, material);
    const pos = new THREE.Vector3(position.array[i], position.array[i+1], position.array[i+2]);
    const norm = new THREE.Vector3(normal.array[i], normal.array[i+1], normal.array[i+2]);
    heart.position.copy(pos);
    const target = pos.clone().add(norm.multiplyScalar(10.0));
    heart.lookAt(target);
    group.add(heart);
  }
}

function updateMesh(){
  const time = clock.getElapsedTime();
  const geometry = mesh.geometry;
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const radius = 40 + Math.sin(time) * 20;
  console.log(radius);
  for(let i=0; i<position.array.length; i+=3){
    const norm = new THREE.Vector3(normal.array[i], normal.array[i+1], normal.array[i+2]);
    const pos = norm.multiplyScalar(radius);
    position.array[i] = pos.x;
    position.array[i+1] = pos.y;
    position.array[i+2] = pos.z;
  }
  position.needsUpdate = true;
}

function update(){
  requestAnimationFrame( update );
  updateMesh();
	renderer.render( scene, camera );  
}

function resize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}