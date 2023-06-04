const canvas = document.querySelector('canvas')

console.log(canvas)

const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio //1.5

let canvasWidth
let canvasHeight
let particles


function init() {
    canvasWidth = innerWidth
    canvasHeight = innerHeight
    
    canvas.style.width = canvasWidth + 'px'
    canvas.style.height = canvasHeight + 'px'
    
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    ctx.scale(dpr, dpr)
    
    particles = []

    const TOTAL = canvasWidth / 30

    for(let i = 0; i < TOTAL; i++) {
        const x =  randomNumBetwwon(0, canvasWidth)
        const y =  randomNumBetwwon(0, canvasHeight)
        const radius = randomNumBetwwon(50, 100)
        const vy = randomNumBetwwon(1, 5)
        const particle = new Particle(x, y, radius, vy)
        particles.push(particle)
    }
}

const feGaussianBlur = document.querySelector('feGaussianBlur')
const feColorMatrix = document.querySelector('feColorMatrix')

const controls = new function() {
    this.blurValue = 40
    this.alphaChannel = 100
    this.alphaOffset = -23
    this.acc = 1.03
    this.rectWidth = 200;
    this.rectHeight = 100;
}

let gui = new dat.GUI()

const f1 = gui.addFolder('Gooey Effect')
f1.open()


f1.add(controls, 'blurValue', 0, 100).onChange(value => {
    feGaussianBlur.setAttribute('stdDeviation', value)
})
f1.add(controls, 'alphaChannel', 1, 200).onChange(value => {
    feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${value} ${controls.alphaOffset}')
})

const f2 = gui.addFolder('Particle Property')
f2.open()
f2.add(controls, 'acc', 1, 1.5, 0.01).onChange(value => {
    particles.forEach(particle => particle.acc = value)
})

const f3 = gui.addFolder('Rect Dimensions')
f3.open()
f3.add(controls, 'rectWidth', 10, 500).onChange(value => {
    particles.forEach(particle => particle.rectWidth = value)
})
f3.add(controls, 'rectHeight', 10, 500).onChange(value => {
    particles.forEach(particle => particle.rectHeight = value)
})

class Particle {
    constructor(x, y, radius, vy) {
        this.x = x
        this.y = y
        this.radius = radius
        this.vy = vy
        this.acc = 1.01
        this.rectWidth = controls.rectWidth
        this.rectHeight = controls.rectHeight
    }
    update() {
        this.vy *= this.acc
        this.y += this.vy
    }
    draw() {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.rectWidth, this.rectHeight)
        ctx.fillStyle = 'blue'
        ctx.fill()
        ctx.closePath()
    }
}

const x = 100
const y = 100
const radius = 50
const particle = new Particle(x, y, radius)

const randomNumBetwwon = (min, max) => {
    return Math.random() * (max - min + 1) + min
}


let interval = 1000 / 60
let now, delta
let then  = Date.now()

function animate() {
    window.requestAnimationFrame(animate)
    now = Date.now()
    delta = now - then

    if (delta < interval) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    // x를 1px 이동시키기
    particles.forEach(particle => {
        particle.update()
        particle.draw()

        if (particle.y - particle.radius > canvasHeight) {
            particle.y = -particle.radius
            particle.x =  randomNumBetwwon(0, canvasWidth)
            particle.radius = randomNumBetwwon(50, 100)
            particle.vy = randomNumBetwwon(1, 5)
        }
    })

    then = now - (delta % interval)
}

window.addEventListener('load', () => {
    init()
    animate()
})

window.addEventListener('resize', () => {
    init()
})