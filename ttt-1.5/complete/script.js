function plane(u, v, target){
  const size = 80;
  
  u *= size;
  v *= size;
  
  target.set(u-size*0.5, v-size*0.5, 0);
}

function klein ( v, u, target ) {
  u *= Math.PI;
  v *= 2 * Math.PI;

  u = u * 2;
  var x, y, z;
  
  if ( u < Math.PI ) {

    x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
    z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

  } else {

    x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
    z = - 8 * Math.sin( u );

  }

  y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );

  target.set( x, y, z ).multiplyScalar(5);

}

function sphere(u, v, target){
  const radius = 30;
  
  u *= 2 * Math.PI;
  v *= Math.PI;
  
  const x = Math.cos(u) * Math.sin(v) * radius;
  const y = Math.cos(v) * radius;
  const z = Math.sin(u) * Math.sin(v) * radius;
  
  target.set(x, y, z);
}

function mobius(u, t, target){
  u *= Math.PI;
		t *= 2 * Math.PI;

		u = u * 2;
		var phi = u / 2;
		var major = 2.25, a = 0.125, b = 0.65;

		var x, y, z;

		x = a * Math.cos( t ) * Math.cos( phi ) - b * Math.sin( t ) * Math.sin( phi );
		z = a * Math.cos( t ) * Math.sin( phi ) + b * Math.sin( t ) * Math.cos( phi );
		y = ( major + x ) * Math.sin( u );
		x = ( major + x ) * Math.cos( u );

		target.set( x, y, z ).multiplyScalar(15);
}

function torus(u, t, target){
  const R = 30;
  const r = 10;
  
  u *= 2 * Math.PI;
	t *= 2 * Math.PI;
  
  const n = R + Math.cos(u)*r;
	const	x = Math.cos( t ) * n;
	const	z = Math.sin( t ) * n;
	const	y = r * Math.sin( u );

	target.set( x, y, z );
}

function helix(u, t, target){
//thanks to https://math.stackexchange.com/questions/461547/whats-the-equation-of-helix-surface
  const R = 15;
  const r = 4;
  const turns = 4;
  const h = 3;
  const n = Math.sqrt(R*R + h*h);
  
  u *= 2 * Math.PI;
  t *= 2 * Math.PI * turns;
  
  const ct = Math.cos(t);
  const st = Math.sin(t);
  const cu = Math.cos(u);
  const su = Math.sin(u);
  
  const x = R*ct - r*ct*cu + h*r*st*su/n;
  const y = h*t + R*r*su/n - turns*h*h;
  const z = R*st - r*st*cu - h*r*ct*su/n;
        
  target.set( x, y, z );
}

var scene, camera, renderer, mesh;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
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
  
  const options = {
    func: 'helix'
  }
  
  const gui = new dat.GUI();
  gui.add(options, 'func', ['plane', 'sphere', 'klein', 'torus', 'mobius', 'helix']).onChange(value => createMesh(window[value]));
  createMesh(window[options.func]);
  
  window.addEventListener( 'resize', resize, false);
  
  update();
}

function createMesh(func){
  if (mesh!==undefined) scene.remove(mesh);
  const geometry = new THREE.ParametricBufferGeometry( func, 25, 50 );
  const material = new THREE.MeshStandardMaterial( { color: 0x00ffff, wireframe:true } );
  mesh = new THREE.Mesh( geometry, material );
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