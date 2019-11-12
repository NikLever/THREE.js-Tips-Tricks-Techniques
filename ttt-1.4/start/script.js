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

var scene, camera, renderer;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
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
  
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  window.addEventListener( 'resize', resize, false);
  
  update();
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