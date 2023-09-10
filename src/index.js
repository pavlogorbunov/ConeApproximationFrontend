import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './style.css'

const inputs = document.querySelectorAll('.menu__input')

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x999999)
document.body.appendChild(renderer.domElement)

const coneGeometry = new THREE.BufferGeometry(1, 1, 1)
const coneMaterial = new THREE.MeshStandardMaterial({
    color: 0x303030,
})

const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.position.set(10, -20, 5)
scene.add(directionalLight)

const light = new THREE.AmbientLight(0xffffff, 5)
scene.add(light)

const controls = new OrbitControls(camera, renderer.domElement)
camera.position.set(0, 10, -3)
camera.lookAt(0, 0, 0)
controls.update()

let t1 = Date.now()

function animate() {
    let t2 = Date.now()
    let dt = t1 - t2
    t1 = t2

    requestAnimationFrame(animate)
    coneGeometry.rotateZ(0.0001 * dt)
    controls.update()
    renderer.render(scene, camera)
}

function getConeDataFromBackend() {
    fetch('http://localhost:3000', {
        method: 'POST',
        body: JSON.stringify({ R: 1, N: 10, H: 5 }),
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then(res => res.json())
        .then(data => {
            coneGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.pointsArray), 3))
            coneGeometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normalsArray), 3))

            const cone = new THREE.Mesh(coneGeometry, coneMaterial)
            cone.position.z = -1
            scene.add(cone)
        })
        .catch(res => {
            alert('Fetch error')
        })
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function onInputChange(evt) {
    if (((evt.target.value == Number(evt.target.value)) && (evt.target.value != '')) || (evt.target.type === 'checkbox')) {
        evt.target.classList.remove('menu__input_incorrect')
        let formIsValid = true
        const reqBody = {}
        inputs.forEach(el => {
            if (el.type === 'checkbox') {
                reqBody[el.id.slice(-1)] = el.checked
            } else {
                if ((el.value == Number(el.value)) && (el.value != '')) {
                    if ((el.id.slice(-1) === 'N') && ((el.value <= 3) || (el.value > 300))) {
                        el.classList.add('menu__input_incorrect')
                        formIsValid = false
                    }
                    reqBody[el.id.slice(-1)] = el.value
                } else {
                    el.classList.add('menu__input_incorrect')
                    formIsValid = false
                }
            }
        })
        if (formIsValid) {
            fetch('http://localhost:3000', {
                method: 'POST',
                body: JSON.stringify(reqBody),
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json",
                }
            })
                .then(res => res.json())
                .then(data => {
                    coneGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.pointsArray), 3))
                    coneGeometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normalsArray), 3))
                })
        }
    } else {
        evt.target.classList.add('menu__input_incorrect')
    }
}

inputs.forEach(el => {
    el.addEventListener('input', onInputChange)
})

window.addEventListener('resize', onResize)

// setTimeout(getConeDataFromBackend, 5000)

getConeDataFromBackend()

animate()