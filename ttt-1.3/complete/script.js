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

class SinCurve extends THREE.Curve{
  constructor(scale){
    super();
    this.scale = scale | 1.0;
  }
  
  getPoint(t){
    const tx = t * 3 - 1.5;
	  const ty = Math.sin( 2 * Math.PI * t );
	  return new THREE.Vector3( tx, ty, 0 ).multiplyScalar( this.scale );
  }
}

class CircleCurve extends THREE.Curve{
  constructor(radius){
    super();
    this.radius = radius | 1.0;
  }
  
  getPoint(t){
    const theta = 2 * Math.PI * t;
    const tx = Math.cos( theta );
	  const ty = Math.sin( theta );
	  return new THREE.Vector3( tx, ty, 0 ).multiplyScalar( this.radius );
  }
}

class RoundedRectCurve extends THREE.Curve{
  constructor(width, height, radius){
    super();
    this.width = width | 50.0;
    this.height = height | 50.0;
    this.radius = radius | 10.0;
  }
  
  getPoint(t){
    const pt = new THREE.Vector3();
    let theta;
    if (t<0.125){
      //0-0.125 = top right corner
      t *= 2;
      const theta = 2 * Math.PI * t;
      pt.x = Math.cos( theta ) * this.radius + this.width * 0.5;
	    pt.y = Math.sin( theta ) * this.radius + this.height * 0.5;
    }else if (t<0.25){
      //0.125-0.25 = top
      t = (t-0.125) * 8;
      pt.x = this.width * 0.5 - t * this.width;
      pt.y = this.height * 0.5 + this.radius;
    }else if (t<0.375){
      //0.25=0.375 = top left corner
      t = (t-0.25) * 2 + 0.25;
      const theta = 2 * Math.PI * t;
      pt.x = Math.cos( theta ) * this.radius - this.width * 0.5;
	    pt.y = Math.sin( theta ) * this.radius + this.height * 0.5;
    }else if (t<0.5){
      //0.375-0.5 = left
      t = (t-0.375) * 8;
      pt.x = -this.width * 0.5 - this.radius;
      pt.y = this.height * 0.5 - t * this.height;
    }else if (t<0.625){
      //0.5-0.625 = bottom left corner
      t = (t-0.5) * 2 + 0.5;
      const theta = 2 * Math.PI * t;
      pt.x = Math.cos( theta ) * this.radius - this.width * 0.5;
	    pt.y = Math.sin( theta ) * this.radius - this.height * 0.5;
    }else if (t<0.75){
      //0.625-0.75 = bottom
      t = (t-0.625) * 8;
      pt.x = -this.width * 0.5 + this.width * t;
      pt.y = -this.height * 0.5 - this.radius;
    }else if (t<0.875){
      //0.75-0.875 = bottom right corner
      t = (t-0.75) * 2 + 0.75;
      const theta = 2 * Math.PI * t;
      pt.x = Math.cos( theta ) * this.radius + this.width * 0.5;
	    pt.y = Math.sin( theta ) * this.radius - this.height * 0.5;
    }else{
      //0.875-1.0 = right
      t = (t-0.875) * 8;
      pt.x = this.width * 0.5 + this.radius;
      pt.y = -this.height * 0.5 + t * this.height;
    }
    
    return pt;
  }
}

var scene, camera, renderer, controls, material, mesh, outline;

init();

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, 200);
  
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
  
  const extrudeSettings1 = {
    depth: 10,
    steps: 1,
    bevelEnabled: false,
  };
  
  const extrudeSettings2 = {
    depth: 10,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelOffset: 0,
    bevelSegments: 1
  };
  
  const extrudeSettings3 = {
    steps: 50,
    bevelEnabled: false,
    extrudePath: new SinCurve(50)
  };
  
  const extrudeSettings4 = {
    steps: 50,
    bevelEnabled: false,
    extrudePath: new CircleCurve(50)
  };
  
  const extrudeSettings5 = {
    steps: 100,
    bevelEnabled: false,
    extrudePath: new RoundedRectCurve(60, 60, 20)
  };
  
  const extrudeSettings = [extrudeSettings1, extrudeSettings2, extrudeSettings3, extrudeSettings4, extrudeSettings5];
  const options = {
    extrudeIndex: 1,
    lines: false
  }
  
  createMesh(extrudeSettings[options.extrudeIndex], false);
  
  const gui = new dat.GUI();
  gui.add(options, 'extrudeIndex').onChange(value => createMesh(extrudeSettings[value], options.lines, 0, 4));
  gui.add(options, 'lines').onChange(value => createMesh(extrudeSettings[options.extrudeIndex], value) );
  window.addEventListener( 'resize', resize, false);
  
  update();
}

function createMesh(extrudeSettings, lines){
  if (mesh!==undefined) scene.remove(mesh);
  if (outline!==undefined) scene.remove(outline);
  const shape = new StarShape(5, 6, 15);
  
  //const geometry = new THREE.ShapeBufferGeometry(shape);
  //material.side = THREE.DoubleSide;
  
  const geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  mesh = new THREE.Mesh(geometry, material);
  
  if (lines){
    const edges = new THREE.EdgesGeometry( geometry, 20 );
    outline = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
scene.add( outline );  
  }
  
  scene.add(mesh);
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