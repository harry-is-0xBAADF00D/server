function graphics(playlists) {

	var canvas = document.getElementById("playlistsCanvas");

	var scene = new THREE.Scene();

	var ratio = canvas.width / canvas.height;
	var camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);

	var renderer = new THREE.WebGLRenderer({canvas: canvas, preserveDrawingBuffer: true, antialias: true });
	renderer.setSize(canvas.width, canvas.height);
  renderer.autoClear = false;

  // Lighting
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight.position.set(0, 0, 1).normalize();
  scene.add(dirLight);
  var pointLight = new THREE.PointLight(0xffffff, 1.2);
  pointLight.position.set(0, 100, 90);
  scene.add(pointLight);

  camera.position.set(0, 0, 500);

	var height = 20;
	var size = 40;
	var hover = 30;
	var curveSegments = 4;
	var bevelThickness = 2;
	var bevelSize = 1.5;
	var bevelSegments = 3;
	var bevelEnabled = true;

	var fontLoader = new THREE.FontLoader();
	fontLoader.load('/lib/fonts/font1.json', function (font) {

    console.log("Loaded Font");

    for (var i = 0; i < playlists.length; i++) {
      var playlist = playlists[i];


      var color = playlist.collaborative ? 0x00ff00 : 0xff0000;

      // var textMaterial = new THREE.MeshBasicMaterial({ color: color });
      var textMaterial = new THREE.MeshPhongMaterial({ color: color, shading: THREE.SmoothShading });

      console.log(playlist.name);
      playlist.geometry = new THREE.TextGeometry(playlist.name, {
        font: font,
        size: size,
        height: height,
        curveSegments: curveSegments,
        bevelThickness: bevelThickness,
        bevelSize: bevelSize,
        bevelEnabled: bevelEnabled,
        material: 0,
        extrudeMaterial: 1
      });

      playlist.mesh = new THREE.Mesh(playlist.geometry, textMaterial);

      playlist.mesh.position.y = i * 50 - 200;
      playlist.mesh.position.x = -500;

      scene.add(playlist.mesh);
    }

	});


	var clock = new THREE.Clock();

	var deltaTime = 0;


	// 360 deg = 2 * pi radians
	// 1 deg = pi / 180 radians

	// Radians per second
	const ROTATION_SPEED = 360 * Math.PI / 180;

	var render = function () {
		requestAnimationFrame(render);

		// for (var i = 0; i < playlists.length; i++) {
		// 	playlists[i].mesh.rotation.y += ROTATION_SPEED * deltaTime * (i+1) / 5;
		// }

		// camera.position.z -= 10 * deltaTime;

    pointLight.position.x = Math.sin(clock.getElapsedTime()) * 300;

    camera.position.z = -Math.tan(clock.getElapsedTime() / 2) * 10 + 500;

    renderer.clear();
		renderer.render(scene, camera);

		deltaTime = clock.getDelta();
	};

	render();
}