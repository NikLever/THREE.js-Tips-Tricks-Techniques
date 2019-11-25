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
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );


  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 2, 0);
  controls.update();
  
  initPhysics();
  
  onWindowResize();

  window.addEventListener( 'resize', onWindowResize, false );

  update();
}

function initPhysics(){
	world = new CANNON.World();
		
  dt = 1.0/60.0;
	damping = 0.01;
		
	world.broadphase = new CANNON.NaiveBroadphase();
	world.gravity.set(0, -10, 0);
  
  helper = new CannonHelper( scene, world );
		
	const groundShape = new CANNON.Plane();
  groundMaterial = new CANNON.Material();
	const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
	groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
	groundBody.addShape(groundShape);
	world.add(groundBody);
  helper.addVisual(groundBody, 0xffaa00);
  
  setInterval(addBody, 1000);
}

function addBody(){
  let shape;
  if (Math.random()>0.5){
	  shape = new CANNON.Sphere(0.5);
  }else{
	  shape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
  }
  const material = new CANNON.Material();
	const body = new CANNON.Body({ mass: 5, material: material });
  body.addShape(shape);
  const x = Math.random()*0.3 + 1;
		
  body.position.set(x, 5, 0);
	body.linearDamping = damping;
	world.add(body);
        
  helper.addVisual(body);
}

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  world.step(dt);
  helper.update( );
  renderer.render( scene, camera );
}