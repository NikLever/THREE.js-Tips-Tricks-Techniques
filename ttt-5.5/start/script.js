var camera, scene, renderer, composer, object, glslPass;

init();

function init() {

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 400;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

  scene.add( new THREE.AmbientLight( 0x222222 ) );

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  object = new THREE.Object3D();
  scene.add( object );

  const geometry = new THREE.SphereBufferGeometry( 1, 4, 4 );

  for ( let i=0; i<100; i++ ) {

    const material = new THREE.MeshPhongMaterial( {
      color: 0xffffff * Math.random(), 
      flatShading: true 
    } );

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( Math.random() - 0.5, 
                      Math.random() - 0.5, 
                      Math.random() - 0.5 ).normalize();
    mesh.position.multiplyScalar( Math.random() * 400 );
    
    mesh.rotation.set( Math.random() * 2, 
                      Math.random() * 2, 
                      Math.random() * 2 );
    
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
    
    object.add( mesh );
  }

  onWindowResize();
  
  window.addEventListener( 'resize', onWindowResize, false );

  update();
  
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  if (composer) composer.setSize( window.innerWidth, window.innerHeight );

}

function update() {
  requestAnimationFrame( update );

  object.rotation.x += 0.005;
  object.rotation.y += 0.01;

  renderer.render(scene, camera);
}