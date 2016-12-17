function graphics() {

	var canvas = document.getElementById("playlistsCanvas");

	var scene = new THREE.Scene();

	var ratio = canvas.width / canvas.height;
	var camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);

	var renderer = new THREE.WebGLRenderer({ canvas: canvas });
	renderer.setSize(canvas.width, canvas.height);
	document.body.appendChild(renderer.domElement);

	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	camera.position.z = 10;


	var clock = new THREE.Clock();

	var deltaTime = 0;


	// 360 deg = 2 * pi radians
	// 1 deg = pi / 180 radians

	// Radians per second
	const CUBE_ROTATION_SPEED = 360 * Math.PI / 180;

	var render = function () {
		requestAnimationFrame(render);

		cube.rotation.y += CUBE_ROTATION_SPEED * deltaTime;

		// camera.position.z -= 0.01;

		renderer.render(scene, camera);

		deltaTime = clock.getDelta();
	};

	render();
}