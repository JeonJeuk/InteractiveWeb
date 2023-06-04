import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GUI } from 'lil-gui'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'


window.addEventListener('load', function(){
    init();
});

async function init() {
    gsap.registerPlugin(ScrollTrigger)

    const params = {
        waveColor: '#4268ff',
        backgroundColor: '#ffffff',
        fogColor: '#f0f0f0',
        waveHeight: 1.5,
    }

    const gui = new GUI();
    const canvas = document.querySelector('#canvas')

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
    });

    renderer.shadowMap.enabled = true

    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();

    scene.fog = new THREE.Fog(0xf0f0f0, 0.1, 500)

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        500,
    );
    camera.position.set(0, 25, 150)

    const waveGeometry = new THREE.PlaneGeometry(1500, 1500, 150, 150)
    const waveMaterial = new THREE.MeshStandardMaterial({
        color: params.waveColor,
    })

    const wave = new THREE.Mesh(waveGeometry, waveMaterial)
    wave.rotation.x = -Math.PI / 2
    wave.receiveShadow = true
    const waveHeight = params.waveHeight
    const initalZPositions = []

    for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
        const z = waveGeometry.attributes.position.getZ(i) + (Math.random() - 0.5) * waveHeight;
        waveGeometry.attributes.position.setZ(i, z)
        initalZPositions.push(z)
    }

    wave.update = function() {
        const elapsedTime = clock.getElapsedTime()
        for (let i = 0; i < waveGeometry.attributes.position.count; i++) {
            const z = initalZPositions[i] + Math.sin(elapsedTime * 3 + i ** 3) * waveHeight
            waveGeometry.attributes.position.setZ(i, z)
        }
        waveGeometry.attributes.position.needsUpdate = true
    }

    scene.add(wave)
    
    const gltfLoader = new GLTFLoader()
    const gltf = await gltfLoader.loadAsync('./models/scene.gltf')
    const ship = gltf.scene
    ship.castShadow = true
    ship.traverse(object => {
        if(object.isMesh) {
            object.castShadow = true
        }
    })

    ship.update = function() {
        const elapsedTime = clock.getElapsedTime()
        ship.position.y = Math.sin(elapsedTime * 3) + 38
    }

    ship.position.y = 38
    ship.rotation.y = Math.PI / 3
    ship.scale.set(10, 10, 10)
    scene.add(ship)

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(15, 15, 15)
    scene.add(pointLight)
    pointLight.shadow.mapSize.width = 1024
    pointLight.shadow.mapSize.height = 1024
    pointLight.shadow.radius = 10

    const directionLight = new THREE.DirectionalLight(0xfffff, 0.1)
    directionLight.position.set(-15, 15, 15)
    scene.add(directionLight)
    directionLight.shadow.mapSize.width = 1024
    directionLight.shadow.mapSize.height = 1024
    directionLight.shadow.radius = 10

    const clock = new THREE.Clock()

    render();

    function render() {
        wave.update()
        ship.update()

        camera.lookAt(ship.position)

        renderer.render(scene, camera);
        requestAnimationFrame(render);

        // controls.update()
    }

    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);

        // controls.update()
    }

    window.addEventListener('resize', handleResize);

/*GSAP ANIMAION
================================================================*/
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.wrap',
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
        }
    })
    tl
    .to(params, {
        waveColor: '#6666FF',
        onUpdate: () => {
            waveMaterial.color = new THREE.Color(params.waveColor)
        },
        duration: 1.5,
    })
    .to(params, {
        backgroundColor: '#FF9933',
        onUpdate: () => {
            scene.background = new THREE.Color(params.backgroundColor)
        },
        duration: 1.5,
    }, '<')
    .to(params, {
        fogColor: '#FF6600',
        onUpdate: () => {
            scene.fog.color = new THREE.Color(params.fogColor)
        },
        duration: 1.5,
    }, '<')
    .to(camera.position, {
        x: 100,
        z: -50,
        duration: 2.5,
    })
    .to(ship.position, {
        z: 150,
        duration: 2,
    })
    .to(camera.position, {
        x: -50,
        y: 25,
        z: 100,
        duration: 2,
    })
    .to(camera.position, {
        x: 0,
        y: 50,
        z: 300,
        duration: 2,
    })

    gsap.to('.title', {
        opacity: 0,
        scrollTrigger: {
            trigger: '.wrap',
            scrub: true,
            pin: true,
            end: '+=1000',
        }
    })


/*LIL GUI
================================================================*/
    gui
    .add(scene.fog, 'near')
    .min(0)
    .max(100)
    .step(0.1) 
    gui
    .add(scene.fog, 'far')
    .min(100)
    .max(500)
    .step(0.1)
    gui
    .add(camera.position, 'x')
    .min(-500)
    .max(500)
    gui
    .add(camera.position, 'y')
    .min(10)
    .max(500)
    gui
    .add(camera.position, 'z')
    .min(10)
    .max(500)
}