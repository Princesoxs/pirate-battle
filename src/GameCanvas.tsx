import { useEffect, useRef } from 'react'
import { Application, Assets, Graphics, Sprite } from 'pixi.js'

function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const app = new Application()
    let destroyed = false

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

if (destroyed) return

const ship = new Sprite(shipTexture)

ship.anchor.set(0.5)
ship.position.set(480, 270)

app.stage.addChild(ship)

let lastShotTime = 0
const shootCooldown = 500

const shoot = () => {
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

window.addEventListener('keydown', keyDown)
window.addEventListener('keyup', keyUp)

app.ticker.add((ticker) => {
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
  
})

    }

    startGame()

    return () => {
      destroyed = true

      if (app.renderer) {
        app.destroy(true)
      }
    }
  }, [])

  return <div ref={containerRef} />
}

export default GameCanvas