class Player {
  constructor(options) {
    const fps = options.fps || 30; //default fps

    this.name = options.name | "Player";

    options.app.scene.add(options.object);

    this.object = options.object;
    this.showPath = options.showPath | false;
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

  newPath(pt) {
    console.log(
      `New path to ${pt.x.toFixed(1)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}`
    );
    const player = this.object;

    const targetGroup = this.pathfinder.getGroup(this.ZONE, pt);
    const closestTargetNode = this.pathfinder.getClosestNode(
      pt,
      this.ZONE,
      targetGroup
    );

    // Calculate a path to the target and store it
    this.calculatedPath = this.pathfinder.findPath(
      player.position,
      pt,
      this.ZONE,
      this.navMeshGroup
    );

    const self = this;

    if (this.calculatedPath && this.calculatedPath.length) {
      this.action = "walk";

      const pt = this.calculatedPath[0].clone();
      pt.y = player.position.y;
      const quaternion = player.quaternion.clone();
      player.lookAt(pt);
      this.quaternion = player.quaternion.clone();
      player.quaternion.copy(quaternion);

      if (this.pathLines) this.app.scene.remove(this.pathLines);

      if (this.showPath){
        const material = new THREE.LineBasicMaterial({
          color: self.pathColor,
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
    } else {
      this.action = "idle";

      const closestPlayerNode = self.pathfinder.getClosestNode(
        player.position,
        this.ZONE,
        this.navMeshGroup
      );
      const clamped = new THREE.Vector3();
      this.pathfinder.clampStep(
        player.position,
        pt.clone(),
        closestPlayerNode,
        this.ZONE,
        this.navMeshGroup,
        clamped
      );

      if (this.pathLines) this.app.scene.remove(this.pathLines);
    }
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
          if (this.npc) {
            this.newPath(this.app.randomWaypoint);
          } else {
            this.action = "idle";
          }
        } else {
          const pt = this.calculatedPath[0].clone();
          pt.y = player.position.y;
          const quaternion = player.quaternion.clone();
          player.lookAt(pt);
          this.quaternion = player.quaternion.clone();
          player.quaternion.copy(quaternion);
        }
      }
    }else{
      this.newPath( this.app.getNextWaypoint() );
    }
  }
}

const assetsPath = "https://niksfiles.s3.eu-west-2.amazonaws.com/";

THREE.Pathfinding = threePathfinding.Pathfinding;

var scene, camera, renderer, navmesh, pathfinder, clock, mouse, player, ZONE, waypoints, waypointIndex, listener, sound, mesh;

init();

function init() {
  camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 3, 30);
  camera.lookAt(0, 0, 0);

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

  waypoints = [];
  waypoints.push(new THREE.Vector3(-15.8, 0.03, 10.47));
  waypoints.push(new THREE.Vector3(-6.3, 0.03, -13.67));
  waypoints.push(new THREE.Vector3(15.2, 0.09, 1.00));
  waypoints.push(new THREE.Vector3(1.1, 0.09, 25.03));
  waypoints.push(new THREE.Vector3(0, 0.09, 25.03));
  waypointIndex = 0;

  window.addEventListener("resize", onWindowResize, false);
}

function getNextWaypoint(){
  const wp = waypoints[waypointIndex];
  waypointIndex++;
  if (waypointIndex>=waypoints.length) waypointIndex = 0;
  return wp;
}

function createPlayer(){
  const geometry = new THREE.SphereBufferGeometry(1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  mesh = new THREE.Mesh( geometry, material );
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

function playSound(){
  //Create sound here
  const listener = new THREE.AudioListener();
  camera.add( listener );
  
  const ambience = new THREE.Audio( listener );
  const footsteps = new THREE.PositionalAudio( listener );
  
  footsteps.setDirectionalCone( 180, 230, 1.0 );
  const helper = new THREE.PositionalAudioHelper( footsteps );
  footsteps.add(helper);
  
  const loader = new THREE.AudioLoader();
  loader.setPath( assetsPath );
  loader.load( 'wind.mp3', buffer => {
    ambience.setBuffer( buffer );
    ambience.setLoop( true );
    ambience.setVolume( 1.0 );
    ambience.play();
    loader.load('footstep.mp3', buffer => {
      footsteps.setBuffer( buffer );
      footsteps.setLoop( true );
      footsteps.setVolume( 1.0 );
      footsteps.setRefDistance( 5.0 );
      footsteps.play();
      mesh.add(footsteps);
    })
  })
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
  camera.lookAt(player.object.position);
  renderer.render(scene, camera);
}