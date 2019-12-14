class Player {
  constructor(options) {
    this.name = options.name | "Player";

    options.app.scene.add(options.object);

    this.object = options.object;
    this.pathLines = new THREE.Object3D();
    this.pathColor = new THREE.Color(0xffffff);
    options.app.scene.add(this.pathLines);

    this.pathfinder = options.app.pathfinder;

    this.speed = options.speed;
    this.app = options.app;
    this.ZONE = options.app.ZONE;

    this.navMeshGroup = this.pathfinder.getGroup(
      this.ZONE,
      this.object.position
    );
  }

  newPath(pt, showPath=false) {
    const player = this.object;

    // Calculate a path to the target and store it
    this.calculatedPath = this.pathfinder.findPath(
      player.position,
      pt,
      this.ZONE,
      this.navMeshGroup
    );

    if (this.calculatedPath && this.calculatedPath.length) {
      //New path found
      this.action = "walk";

      this.updateDirection();
      
      if (this.pathLines) this.app.scene.remove(this.pathLines);
      
      if (showPath) this.createPathLines();
    } else {
      //No path found
      this.action = "idle";

      if (this.pathLines) this.app.scene.remove(this.pathLines);
    }
  }

  updateDirection(){
    const player = this.object;
    
    const pt = this.calculatedPath[0].clone();
    pt.y = player.position.y;
    const quaternion = player.quaternion.clone();
    player.lookAt(pt);
    this.quaternion = player.quaternion.clone();
    player.quaternion.copy(quaternion);
  }
  
  createPathLines(){
    //Creates a visual version of the path
    const player = this.object;
    
    const material = new THREE.LineBasicMaterial({
        color: this.pathColor,
        linewidth: 2
      });

      let geometry = new THREE.Geometry();
      geometry.vertices.push(player.position);

      // Draw debug lines
      this.calculatedPath.forEach(function(vertex) {
        geometry.vertices.push(
          vertex.clone().add(new THREE.Vector3(0, 0.2, 0))
        );
      });

      this.pathLines = new THREE.Line(geometry, material);
      this.app.scene.add(this.pathLines);

      const self = this;
      // Draw debug spheres except the last one. Also, add the player position.
      const debugPath = [player.position].concat(this.calculatedPath);

      debugPath.forEach(function(vertex) {
        geometry = new THREE.SphereBufferGeometry(0.2);
        const material = new THREE.MeshBasicMaterial({ color: self.pathColor });
        const node = new THREE.Mesh(geometry, material);
        node.position.copy(vertex);
        node.position.y += 0.2;
        self.pathLines.add(node);
      });
  }
  
  update(dt) {
    const speed = this.speed;
    const player = this.object;

    if (this.calculatedPath && this.calculatedPath.length) {
      const targetPosition = this.calculatedPath[0];

      const vel = targetPosition.clone().sub(player.position);

      if (vel.lengthSq() > 0.05 * 0.05) {
        vel.normalize();
        // Move player to target
        if (this.quaternion) player.quaternion.slerp(this.quaternion, 0.05);
        player.position.add(vel.multiplyScalar(dt * speed));
      } else {
        // Remove node from the path we calculated
        this.calculatedPath.shift();
        if (this.calculatedPath.length == 0) {
          this.action = "idle";
        } else {
          this.updateDirection();
        }
      }
    }
  }
}

const assetsPath = "https://niksfiles.s3.eu-west-2.amazonaws.com/";

THREE.Pathfinding = threePathfinding.Pathfinding;

var scene, camera, renderer, navmesh, pathfinder, clock, mouse, player, ZONE;

init();

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 50, 50);
  camera.lookAt(0, 0, 10);

  scene = new THREE.Scene();

  const ambient = new THREE.HemisphereLight(0x333355, 0x777799);
  this.scene.add(ambient);

  const light = new THREE.DirectionalLight(0xeeeeff, 3);
  light.castShadow = true;

  const lightSize = 25;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 17;
  light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
  light.shadow.camera.right = light.shadow.camera.top = lightSize;

  light.position.set(0, 10, 10);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  loadEnvironment();

  raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener("click", raycast, false);

  mouse = new THREE.Vector3();

  window.addEventListener("resize", onWindowResize, false);
}

function createPlayer(){
  const geometry = new THREE.SphereBufferGeometry(1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh( geometry, material );
  mesh.position.z = 25;
  
  const options = {
    object: mesh,
    speed: 4,
    app: this,
    name: 'player'
  };
  
  player = new Player( options );
  
  update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function raycast(e) {
  if (!navmesh) return;

  mouse.x = e.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(navmesh);

  if (intersects.length > 0) {
    const pt = intersects[0].point;

    player.newPath(pt, true);
  }
}

function loadEnvironment() {
  const loader = new THREE.GLTFLoader();

  // Load a glTF resource
  loader.load(
    // resource URL
    `${assetsPath}cemetry.glb`,
    // called when the resource is loaded
    function(gltf) {
      scene.add(gltf.scene);

      gltf.scene.traverse(function(child) {
        if (child.isMesh) {
          if (child.name == "Navmesh") {
            child.material.visible = false;
            navmesh = child;
          } else {
            child.castShadow = false;
            child.receiveShadow = true;
          }
        }
      });

      pathfinder = new THREE.Pathfinding();
      ZONE = "cemetry";
      pathfinder.setZoneData(
        ZONE,
        THREE.Pathfinding.createZone(navmesh.geometry)
      );
      
      createPlayer();
    }
  );
}

function update() {
  const dt = clock.getDelta();
  player.update(dt);
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}