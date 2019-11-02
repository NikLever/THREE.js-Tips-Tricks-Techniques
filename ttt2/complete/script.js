var scene, camera, renderer, controls, material, mesh;

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
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  material = new THREE.MeshStandardMaterial();
  
  const options = { 
        name: 'heart',
        type: 'extrude'
  };
  const gui = new dat.GUI();
  gui.add(options, 'name', ['california', 'triangle', 'heart', 'square', 'rectangle', 'rounded rectangle', 'track', 'circle', 'fish', 'arc circle', 'smiley', 'spline']).onChange(value=>createMesh(value, options.type));
  gui.add(options, 'type', ['shape', 'extrude', 'points', 'lines']).onChange( value => createMesh(options.name, value ));
  
  createMesh(options.name, options.type);
  
  window.addEventListener( 'resize', resize, false);
  
  update();
}

function createMesh(name, type){
  let pts = [];
  if (mesh!==undefined) scene.remove(mesh);
  let shape = new THREE.Shape();
  let width, height, x, y, radius;
  const pos = new THREE.Vector3();
  let rot = 0;
  
  switch(name){
    case 'california':
    pts.push( new THREE.Vector2( 610, 320 ) );
    pts.push( new THREE.Vector2( 450, 300 ) );
    pts.push( new THREE.Vector2( 392, 392 ) );
    pts.push( new THREE.Vector2( 266, 438 ) );
    pts.push( new THREE.Vector2( 190, 570 ) );
    pts.push( new THREE.Vector2( 190, 600 ) );
    pts.push( new THREE.Vector2( 160, 620 ) );
    pts.push( new THREE.Vector2( 160, 650 ) );
    pts.push( new THREE.Vector2( 180, 640 ) );
    pts.push( new THREE.Vector2( 165, 680 ) );
    pts.push( new THREE.Vector2( 150, 670 ) );
    pts.push( new THREE.Vector2( 90, 737 ) );
    pts.push( new THREE.Vector2( 80, 795 ) );
    pts.push( new THREE.Vector2( 50, 835 ) );
    pts.push( new THREE.Vector2( 64, 870 ) );
    pts.push( new THREE.Vector2( 60, 945 ) );
    pts.push( new THREE.Vector2( 300, 945 ) );
    pts.push( new THREE.Vector2( 300, 743 ) );
    pts.push( new THREE.Vector2( 600, 473 ) );
    pts.push( new THREE.Vector2( 626, 425 ) );
    pts.push( new THREE.Vector2( 600, 370 ) );
    pts.push( new THREE.Vector2( 610, 320 ) );
    pts = pts.map(pt => pt.multiplyScalar(0.15));
    shape = new THREE.Shape( pts );
    rot = 0;//Math.PI;
    pos.x = -50;
    pos.y = -100;
    break;
    case 'triangle':
    shape.moveTo( 80, 20 );
    shape.lineTo( 40, 80 );
    shape.lineTo( 120, 80 );
    shape.lineTo( 80, 20 ); // close path
    pos.x = -80;
    pos.y = -50;
    break;
    case 'heart':
    // From http://blog.burlock.org/html5/130-paths
    x = y = 0;
    shape.moveTo( x + 25, y + 25 );
    shape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
    shape.bezierCurveTo( x - 30, y, x - 30, y + 35, x - 30, y + 35 );
    shape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
    shape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
    shape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
    shape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );
    rot = Math.PI;
    pos.x = 20;
    pos.y = 50;
    break;
    case 'square':
    width = 80;
    shape.moveTo( 0, 0 );
    shape.lineTo( 0, width );
    shape.lineTo( width, width );
    shape.lineTo( width, 0 );
    shape.lineTo( 0, 0 );
    pos.x = -40;
    pos.y = -40;
    break;
    case 'rectangle':
    height = 120;
    width = 40;
    shape.moveTo( 0, 0 );
    shape.lineTo( 0, width );
    shape.lineTo( height, width );
    shape.lineTo( height, 0 );
    shape.lineTo( 0, 0 );
    pos.x = -60;
    pos.y = -20;
    break;
    case 'rounded rectangle':
    x = y = 0;
    width = height = 50;
    radius = 20;
    shape.moveTo( x, y + radius );
    shape.lineTo( x, y + height - radius );
    shape.quadraticCurveTo( x, y + height, x + radius, y + height );
    shape.lineTo( x + width - radius, y + height );
    shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    shape.lineTo( x + width, y + radius );
    shape.quadraticCurveTo( x + width, y, x + width - radius, y );
    shape.lineTo( x + radius, y );
    shape.quadraticCurveTo( x, y, x, y + radius );
    pos.x = -20;
    pos.y = -20;
    break;
    case 'track':
    shape.moveTo( 40, 40 );
    shape.lineTo( 40, 160 );
    shape.absarc( 60, 160, 20, Math.PI, 0, true );
    shape.lineTo( 80, 40 );
    shape.absarc( 60, 40, 20, 2 * Math.PI, Math.PI, true );
    pos.x = -60;
    pos.y = -100;
    break;
    case 'circle':
    radius = 40;
    shape.moveTo( 0, radius );
    shape.quadraticCurveTo( radius, radius, radius, 0 );
    shape.quadraticCurveTo( radius, - radius, 0, - radius );
    shape.quadraticCurveTo( - radius, - radius, - radius, 0 );
    shape.quadraticCurveTo( - radius, radius, 0, radius );
    break;
    case 'fish':
    x = y = 0;
    shape.moveTo( x, y );
    shape.quadraticCurveTo( x + 50, y - 80, x + 90, y - 10 );
    shape.quadraticCurveTo( x + 100, y - 10, x + 115, y - 40 );
    shape.quadraticCurveTo( x + 115, y, x + 115, y + 40 );
    shape.quadraticCurveTo( x + 100, y + 10, x + 90, y + 10 );
    shape.quadraticCurveTo( x + 50, y + 80, x, y );
    pos.x = -60;
    pos.y = 0;
    break;
    case 'arc circle':
    shape.moveTo( 50, 10 );
    shape.absarc( 10, 10, 40, 0, Math.PI * 2, false );
    const holePath = new THREE.Path();
    holePath.moveTo( 20, 10 );
    holePath.absarc( 10, 10, 10, 0, Math.PI * 2, true );
    shape.holes.push( holePath );
    break;
    case 'smiley':
    shape.moveTo( 80, 40 );
    shape.absarc( 40, 40, 40, 0, Math.PI * 2, false );
    const eye1Path = new THREE.Path();
    eye1Path.moveTo( 35, 20 );
    eye1Path.absellipse( 25, 20, 10, 10, 0, Math.PI * 2, true );
    shape.holes.push( eye1Path );
    const eye2Path = new THREE.Path();
    eye2Path.moveTo( 65, 20 );
    eye2Path.absarc( 55, 20, 10, 0, Math.PI * 2, true );
    shape.holes.push( eye2Path );
    const mouthPath = new THREE.Path();
    mouthPath.moveTo( 20, 40 );
    mouthPath.quadraticCurveTo( 40, 60, 60, 40 );
    mouthPath.bezierCurveTo( 70, 45, 70, 50, 60, 60 );
    mouthPath.quadraticCurveTo( 40, 80, 20, 60 );
    mouthPath.quadraticCurveTo( 5, 50, 20, 40 );
    shape.holes.push( mouthPath );
    rot = Math.PI;
    pos.x = 40;
    pos.y = 35;
    break;
    case 'spline':
    pts.push( new THREE.Vector2( 70, 20 ) );
    pts.push( new THREE.Vector2( 80, 90 ) );
    pts.push( new THREE.Vector2( - 30, 70 ) );
    pts.push( new THREE.Vector2( 0, 0 ) );
    shape.moveTo( 0, 0 );
    shape.splineThru( pts );
    pos.x = -30;
    pos.y = -40;
    break;
  }
  
  const extrudeSettings = { 
    depth: 8, 
    bevelEnabled: true, 
    bevelSegments: 2, 
    steps: 2, 
    bevelSize: 1, 
    bevelThickness: 1
  };
  
  let geometry;
  material.side = THREE.FrontSide;
  
  switch(type){
    case 'extrude':
      geometry = new THREE.ExtrudeBufferGeometry( shape, extrudeSettings );
      mesh = new THREE.Mesh( geometry, material );
      break;
    case 'shape':
      geometry = new THREE.ShapeBufferGeometry( shape );
      material.side = THREE.DoubleSide;
      mesh = new THREE.Mesh( geometry, material );
      break;
    case 'lines':
      geometry = new THREE.BufferGeometry().setFromPoints( shape.getPoints() );
      mesh = new THREE.Line( geometry, new THREE.LineBasicMaterial(  )  );
      break;
    case 'points':
      geometry = new THREE.BufferGeometry().setFromPoints( shape.getPoints() );
      mesh = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0xFFFFFF, size: 2 } )  );
      break;
  }
    
	
  mesh.position.copy(pos);
  mesh.rotation.z = rot;
	scene.add( mesh );
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