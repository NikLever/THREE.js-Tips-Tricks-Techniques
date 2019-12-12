var camera, scene, renderer, particles, control;
const assetPath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/';

init(); 

function init() {

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
 
    scene = new THREE.Scene();
 
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100 );
    camera.position.z = 5;
    scene.add( camera );

    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(-1,0,1);
    scene.add(light);
  
    control = new THREE.OrbitControls( camera, renderer.domElement );
  
    const tex = new THREE.TextureLoader()
      .setPath(assetPath)
      .load('snowflake.png');
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff, 
      depthWrite: false,
      map: tex, 
      side: THREE.DoubleSide,
      transparent: true
    });
    const geometry = new THREE.PlaneGeometry(0.5,0.5);
    particles = [];

    const size = 5;
  
    for (let i=0; i<100; i++) {
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(
          ( Math.random()-0.5) * size, 
          ( Math.random()-0.5) * size * 2, 
          ( Math.random()-0.5) * size);
        particle.rotation.z = Math.random() * Math.PI * 2;
        scene.add(particle);
        particles.push(particle);
    }
 
    renderer.setAnimationLoop( update );
}
 
function update(time) { 
    const dt = clock.getDelta();
    
    if (particles){
      particles.forEach( particle => {
        particle.position.y -= dt*0.5;
        if (particle.position.y<-5) particle.position.y = 5;
        particle.rotation.z += dt * 0.2;
      });
    }
    renderer.render( scene, camera );
}