var scene, camera, renderer, controls, world, helper, dt, damping, marker, jointBody, raycaster, mouse, box;

init();

function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 1, 3);
  camera.lookAt( 0, 0.75, 0 );

  const ambient = new THREE.HemisphereLight(0x555555, 0xFFFFFF);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1,1.25,1.25);
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
  
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  mouse.down = false;
  mouse.constraint = false;
  
  //Create a plane for following mouse movement
  const geometry1 = new THREE.PlaneGeometry(100, 100);
  const material1 = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
  gplane = new THREE.Mesh( geometry1, material1 );
  scene.add(gplane);
  
  //Create a marker to indicate where the mouse is
  const geometry2 = new THREE.SphereBufferGeometry( 0.1, 8, 8 );
  const material2 = new THREE.MeshStandardMaterial({ color: 0xaa0000 });
  marker = new THREE.Mesh( geometry2, material2 );
  marker.visible = false;
  scene.add(marker);
  
  initPhysics();
  
  onWindowResize();

  window.addEventListener( 'resize', onWindowResize, false );
  window.addEventListener("mousedown", onMouseDown, false );
  window.addEventListener("mousemove", onMouseMove, false );
  window.addEventListener("mouseup", onMouseUp, false );
  
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
  
  // Joint body
  const shape = new CANNON.Sphere(0.1);
  jointBody = new CANNON.Body({ mass: 0 });
  jointBody.addShape(shape);
  jointBody.collisionFilterGroup = 0;
  jointBody.collisionFilterMask = 0;
  world.add(jointBody);
  
  box = addBody();
}

function addBody(box=true){
  let shape;
  if (!box){
	  shape = new CANNON.Sphere(0.5);
  }else{
	  shape = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));
  }
  const material = new CANNON.Material();
	const body = new CANNON.Body({ mass: 5, material: material });
  body.addShape(shape);
  	
  body.position.set(0, 1, 0);
	body.linearDamping = damping;
	world.add(body);
        
  helper.addVisual(body);
  
  return body;
}

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
//console.log( `${mouse.x.toFixed(1)}, ${mouse.y.toFixed(1)}`);
  
  if (mouse.constraint){
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObject( gplane );
    console.log( "constraint:" + intersects.length );
    if (intersects.length>0){
      marker.position.copy( intersects[0].point );
      jointBody.position.copy( intersects[0].point );
      mouse.constraint.update(); 
    }
  }
}

function onMouseDown( event ){
  // Find mesh from a ray
  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObject( box.threemesh, true );
  if (intersects.length>0){
    marker.visible = true;
    marker.position.copy( intersects[0].point );
    let object = intersects[0].object;
    mouse.down = true;
    //Align movement plane to intersection
    gplane.position.copy(intersects[0].point);
    gplane.lookAt(camera.position);  

    addMouseConstraint(intersects[0].point, box);
  }
}

function addMouseConstraint(pos, body){
  const pivot = pos.clone();
  body.threemesh.worldToLocal(pivot);

  jointBody.position.copy(pos);
 
  mouse.constraint = new CANNON.PointToPointConstraint(body, pivot, jointBody, new CANNON.Vec3(0,0,0));

  world.addConstraint(mouse.constraint);
}

function onMouseUp(){
  marker.visible = false;
  mouse.down = false;
  if (mouse.constraint){
    world.removeConstraint(mouse.constraint);
    mouse.constraint = false;
  }
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