const assetsPath = "https://niksfiles.s3.eu-west-2.amazonaws.com/";

var scene, camera, renderer, clock, planeGeometry, ball, ballGeometry, simplex, sound, analyser;

init();

function init() {
  clock = new THREE.Clock();
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000033 );
  
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 0, 4);
  camera.lookAt(0, 1, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  planeGeometry = new THREE.PlaneBufferGeometry(6, 6, 10, 10);
  const material1 = new THREE.MeshBasicMaterial({ color:0x0000aa, wireframe: true } );
  
  const plane = new THREE.Mesh( planeGeometry, material1 );
  plane.rotateX(-Math.PI/3);
  scene.add(plane);
  
  ballGeometry = new THREE.IcosahedronBufferGeometry(1, 4);
  
  const material2 = new THREE.MeshBasicMaterial({ color:0xaa0000, wireframe: true } );
  
  ball = new THREE.Mesh( ballGeometry, material2 );
  ball.position.y = 1;
  scene.add(ball);
  
  simplex = new SimplexNoise(4);
  
  listener = new THREE.AudioListener();
  camera.add( listener );
  
  sound = new THREE.Audio( listener );
  
  const loader = new THREE.AudioLoader();
  loader.setPath(assetsPath);
  loader.load( 'against-the-odds.mp3', buffer => {
    sound.setBuffer( buffer );
    sound.play();
  })
  
  //Add analyser here

  update();
  
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener('mousedown', onMouseDown, false);
}

function onMouseDown(){
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function update() {
  const time = clock.getElapsedTime();
  
  ball.rotateY( 0.01 );
  
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

function updateGround( geometry, distortionFr, time ){
  const position = geometry.getAttribute( 'position' );
  const amp = 0.1;
  for(let i=0; i<position.array.length; i+=3){
    const offset = simplex.noise2D(position.array[i] + time * 0.0003, position.array[i+1] + time * 0.0001) * distortionFr * amp;
    position.array[i+2] = offset;
  };
  position.needsUpdate = true;
}

function updateBall( geometry, baseFr, trebleFr, time){
  const amp = 0.08;
  const rf = 0.01;
  const radius = geometry.parameters.radius;
  const position = geometry.getAttribute( 'position' );
  
  for(let i=0; i<position.array.length; i+=3){
    const vertex = new THREE.Vector3( position.array[i], position.array[i+1], position.array[i+2]);
    vertex.normalize();
    const distance = radius + baseFr*amp*0.5 + simplex.noise3D(vertex.x + time *rf, vertex.y +  time*rf, vertex.z + time*rf) * amp * trebleFr;
    vertex.multiplyScalar(distance);
    position.array[i] = vertex.x;
    position.array[i+1] = vertex.y;
    position.array[i+2] = vertex.z;
  };
  position.needsUpdate = true;
}

//some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}