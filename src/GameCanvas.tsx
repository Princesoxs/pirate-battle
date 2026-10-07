import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Graphics, Sprite } from 'pixi.js'

function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [health, setHealth] = useState(100)
  const [scoreDisplay, setScoreDisplay] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    const app = new Application()
    let destroyed = false
    let gameOver = false
    let remainingTime = 60
    let lastTimerUpdate = performance.now()

let keyDownHandler: ((event: KeyboardEvent) => void) | null = null
let keyUpHandler: ((event: KeyboardEvent) => void) | null = null

    const startGame = async () => {
      await app.init({
        width: 960,
        height: 540,
        backgroundColor: 0x2495c4,
      })

      if (destroyed) {
        app.destroy(true)
        return
      }

      const container = containerRef.current
      if (!container) return

      container.appendChild(app.canvas)

      const ocean = new Graphics()
        .rect(0, 0, 960, 540)
        .fill(0x2495c4)

      app.stage.addChild(ocean)

      const shipTexture = await Assets.load(
  '/assets/png/default/ships/ship_1.png'
)

const cannonBallTexture = await Assets.load(
  '/assets/png/default/ship_parts/cannon_ball.png'
)
const chaserTexture = await Assets.load(
  '/assets/png/default/ships/ship_2.png'
)
if (destroyed) return

const ship = new Sprite(shipTexture)

ship.anchor.set(0.5)
ship.position.set(480, 270)

app.stage.addChild(ship)

let playerHealth = 100
let score = 0

let chaserHealth = 100
let chaserAlive = false

const chaser = new Sprite(chaserTexture)
chaser.anchor.set(0.5)

const spawnChaser = () => {
  chaserHealth = 100
  chaserAlive = true

  chaser.position.set(150, 150)

  if (!chaser.parent) {
    app.stage.addChild(chaser)
  }

  console.log('Chaser spawned!')
}

spawnChaser()

const chaserCollisionDamage = 25

let lastShotTime = 0
const shootCooldown = 500

const shoot = () => {
  if (gameOver) {
  return
}
  const now = performance.now()

if (now - lastShotTime < shootCooldown) {
  return
}

lastShotTime = now
  const cannonBall = new Sprite(cannonBallTexture)

  cannonBall.anchor.set(0.5)
  cannonBall.position.set(ship.x, ship.y)

  const shotRotation = ship.rotation
  const projectileSpeed = 7

  app.stage.addChild(cannonBall)

 const projectileTicker = (ticker: any) => {
  cannonBall.x -=
    Math.sin(shotRotation) * projectileSpeed * ticker.deltaTime

  cannonBall.y +=
    Math.cos(shotRotation) * projectileSpeed * ticker.deltaTime

if (chaserAlive) {
  const dxToChaser = cannonBall.x - chaser.x
  const dyToChaser = cannonBall.y - chaser.y
  const distanceToChaser = Math.sqrt(
    dxToChaser * dxToChaser + dyToChaser * dyToChaser
  )

if (distanceToChaser < 40) {
  chaserHealth -= 25

  console.log(`Chaser health: ${chaserHealth}`)

  app.ticker.remove(projectileTicker)
  cannonBall.destroy()

  if (chaserHealth <= 0) {
    chaserAlive = false
    app.stage.removeChild(chaser)

    score += 1
    setScoreDisplay(score)
    console.log(`Chaser destroyed! Score: ${score}`)

    setTimeout(() => {
  if (!gameOver) {
    spawnChaser()
  }
}, 2000)
  }

  return
}
}

  const outsideArena =
    cannonBall.x < 0 ||
    cannonBall.x > 960 ||
    cannonBall.y < 0 ||
    cannonBall.y > 540

  if (outsideArena) {
    app.ticker.remove(projectileTicker)
    cannonBall.destroy()
  }
}

  app.ticker.add(projectileTicker)
}

const keys: Record<string, boolean> = {}

const keyDown = (event: KeyboardEvent) => {
  keys[event.key.toLowerCase()] = true

  if (event.code === 'Space') {
    shoot()
  }
}

const keyUp = (event: KeyboardEvent) => {
  keys[event.key.toLowerCase()] = false
}

keyDownHandler = keyDown
keyUpHandler = keyUp

window.addEventListener('keydown', keyDown)
window.addEventListener('keyup', keyUp)

app.ticker.add((ticker) => {
  if (gameOver) {
  return
}

const now = performance.now()

if (now - lastTimerUpdate >= 1000) {
  remainingTime -= 1
  setTimeLeft(remainingTime)
  lastTimerUpdate = now

  if (remainingTime <= 0) {
    remainingTime = 0
    setTimeLeft(0)
    gameOver = true

    console.log(`Game over! Final score: ${score}`)
    return
  }
}
  const speed = 3 * ticker.deltaTime
  const rotationSpeed = 0.05 * ticker.deltaTime

  if (keys['a'] || keys['arrowleft']) {
    ship.rotation -= rotationSpeed
  }

  if (keys['d'] || keys['arrowright']) {
    ship.rotation += rotationSpeed
  }

  if (keys['w'] || keys['arrowup']) {
    ship.x -= Math.sin(ship.rotation) * speed
    ship.y += Math.cos(ship.rotation) * speed
  }

  if (!chaserAlive) {
  return
}

    const dx = ship.x - chaser.x
    const dy = ship.y - chaser.y

    const distance = Math.sqrt(dx * dx + dy * dy)

    const chaserSpeed = 1.5 * ticker.deltaTime

if (distance > 0 && chaserAlive) {
      chaser.rotation = Math.atan2(-dx, dy)

      chaser.x += (dx / distance) * chaserSpeed
      chaser.y += (dy / distance) * chaserSpeed

      const collisionDistance = 55

if (distance < collisionDistance && chaserAlive) {
  playerHealth -= chaserCollisionDamage
  setHealth(playerHealth)
  chaserAlive = false

  console.log(`Player health: ${playerHealth}`)

  if (playerHealth <= 0) {
    playerHealth = 0
    setHealth(0)
    gameOver = true

    console.log(`Game over! Player destroyed. Final score: ${score}`)
  }

  app.stage.removeChild(chaser)

  if (!gameOver) {
  setTimeout(() => {
    if (!gameOver) {
      spawnChaser()
    }
  }, 2000)
}
}
    }
})

    }

    startGame()

    return () => {
  destroyed = true

  if (keyDownHandler) {
    window.removeEventListener('keydown', keyDownHandler)
  }

  if (keyUpHandler) {
    window.removeEventListener('keyup', keyUpHandler)
  }

  if (app.renderer) {
    app.destroy(true)
  }
}
}, [])

  return (
  <div>
    <div>
      <strong>Health: {health}</strong>
      {' | '}
      <strong>Score: {scoreDisplay}</strong>
      {' | '}
      <strong>Time: {timeLeft}</strong>
    </div>

    <div ref={containerRef} />
  </div>
)
}

export default GameCanvas