var scene, camera, renderer, world, helper, vehicle, dt, light, lightOffset;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xaaaaff );
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.set(10, 10, 10);
  
  const ambient = new THREE.HemisphereLight(0x555555, 0xFFFFFF);
  scene.add(ambient);

  light = new THREE.DirectionalLight(0xffffff, 0.5);
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
  
  initPhysics();
  
  onWindowResize();

  window.addEventListener( 'resize', onWindowResize, false );
  const joystick = new JoyStick({
    game: this,
    onMove: onMove
  });
  
  update();
}

function onMove( forward, turn ){
  const maxSteerVal = 0.5;
  const maxForce = 500;
  const brakeForce = 5;

  const force = maxForce * forward;
  const steer = maxSteerVal * -turn;

  if (forward!=0){
    vehicle.setBrake(0, 0);
    vehicle.setBrake(0, 1);
    vehicle.setBrake(0, 2);
    vehicle.setBrake(0, 3);

    vehicle.applyEngineForce(force, 2);
    vehicle.applyEngineForce(force, 3);
  }else{
    vehicle.setBrake(brakeForce, 0);
    vehicle.setBrake(brakeForce, 1);
    vehicle.setBrake(brakeForce, 2);
    vehicle.setBrake(brakeForce, 3);
  }

  vehicle.setSteeringValue(steer, 0);
  vehicle.setSteeringValue(steer, 1); 
}

function initPhysics(){
  world = new CANNON.World();
	helper = new CannonHelper( scene, world );
  
  dt = 1/60;
		
	world.broadphase = new CANNON.SAPBroadphase(world);
	world.gravity.set(0, -10, 0);
  world.defaultContactMaterial.friction = 0;

  const groundMaterial = new CANNON.Material("groundMaterial");
  const wheelMaterial = new CANNON.Material("wheelMaterial");
  const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  });

  // We must add the contact materials to the world
  world.addContactMaterial(wheelGroundContactMaterial);

  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
  const chassisBody = new CANNON.Body({ mass: 150, material: groundMaterial });
  chassisBody.addShape(chassisShape);
  chassisBody.position.set(0, 4, 0);
  helper.addVisual(chassisBody, 0x0000aa, 'car');
  light.target = chassisBody.threemesh;
  lightOffset = chassisBody.threemesh.position.clone().sub(light.position);

  const options = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.8,
    frictionSlip: 1,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence:  0.01,
    axleLocal: new CANNON.Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: 30,
    useCustomSlidingRotationalSpeed: true
  };

  // Create the vehicle
  vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody,
    indexRightAxis: 0,
    indexUpAxis: 1,
    indeForwardAxis: 2
  });

  options.chassisConnectionPointLocal.set(1, 0, -1);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(-1, 0, -1);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(1, 0, 1);
  vehicle.addWheel(options);

  options.chassisConnectionPointLocal.set(-1, 0, 1);
  vehicle.addWheel(options);

  vehicle.addToWorld(world);

  const wheelBodies = [];
  vehicle.wheelInfos.forEach( function(wheel){
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
    const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
    const q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
    wheelBodies.push(wheelBody);
    helper.addVisual(wheelBody, 0x111111, 'wheel');
  });

  // Update wheels
  world.addEventListener('postStep', function(){
    let index = 0;
    let r;
    vehicle.wheelInfos.forEach(function(wheel){
      vehicle.updateWheelTransform(index);
      const t = wheel.worldTransform;
      wheelBodies[index].threemesh.position.copy(t.position);
      wheelBodies[index].threemesh.quaternion.copy(t.quaternion);
      index++; 
    });
  });

  let matrix = [];
  let sizeX = 64,
      sizeY = 64;

  for (let i = 0; i < sizeX; i++) {
    matrix.push([]);
    for (let j = 0; j < sizeY; j++) {
      let height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * 2 + 2;
      if(i===0 || i === sizeX-1 || j===0 || j === sizeY-1)
        height = 3;
      matrix[i].push(height);
    }
  }

  const hfShape = new CANNON.Heightfield(matrix, {
    elementSize: 100 / sizeX
  });
  const hfBody = new CANNON.Body({ mass: 0 });
  hfBody.addShape(hfShape);
  hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2);
  hfBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
  world.add(hfBody);
  helper.addVisual(hfBody, 0x00aa00, 'landscape');
}       

function onWindowResize( event ) {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function update() {
  requestAnimationFrame( update );
  world.step(dt);
  light.position.copy(vehicle.chassisBody.threemesh.position).sub(lightOffset);
  camera.lookAt( vehicle.chassisBody.threemesh.position );
  helper.update( );
  renderer.render( scene, camera );
}