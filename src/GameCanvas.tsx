import { useEffect, useRef, useState } from 'react'
import { Application, Assets, Graphics, Sprite } from 'pixi.js'

type GameConfig = {
  matchDuration: number
  enemySpawnInterval: number
  playerHealth: number
  chaserHealth: number
  shooterHealth: number
  playerSpeed: number
  rotationSpeed: number
  projectileSpeed: number
  frontShotDamage: number
  sideShotDamage: number
  frontShotCooldown: number
  sideShotCooldown: number
  shooterShotCooldown: number
  chaserCollisionDamage: number
  shooterAttackRange: number
}

const GAME_CONFIG: GameConfig = {
  matchDuration: 60,
  enemySpawnInterval: 2000,
  playerHealth: 100,
  chaserHealth: 100,
  shooterHealth: 50,
  playerSpeed: 3,
  rotationSpeed: 0.05,
  projectileSpeed: 7,
  frontShotDamage: 25,
  sideShotDamage: 15,
  frontShotCooldown: 500,
  sideShotCooldown: 1000,
  shooterShotCooldown: 1500,
  chaserCollisionDamage: 25,
  shooterAttackRange: 250,
}

function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [health, setHealth] = useState(100)
  const [scoreDisplay, setScoreDisplay] = useState(0)
  const [timeLeft, setTimeLeft] = useState(
  Number(localStorage.getItem('matchDuration')) || GAME_CONFIG.matchDuration
)
  const [matchEnded, setMatchEnded] = useState(false)
  const [endReason, setEndReason] = useState('')
  const [pauseDisplay, setPauseDisplay] = useState(false)

  const [matchDuration, setMatchDuration] = useState(
  Number(localStorage.getItem('matchDuration')) || GAME_CONFIG.matchDuration
)

const [spawnInterval, setSpawnInterval] = useState(
  Number(localStorage.getItem('spawnInterval')) || GAME_CONFIG.enemySpawnInterval
)

  useEffect(() => {
    const app = new Application()
    let destroyed = false
    let gameOver = false
    let remainingTime = matchDuration
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

const shooterTexture = await Assets.load(
  '/assets/png/default/ships/ship_3.png'
)

const islandTextures = await Promise.all([
  Assets.load('/assets/png/default/tiles/tile_6.png'),
  Assets.load('/assets/png/default/tiles/tile_7.png'),
  Assets.load('/assets/png/default/tiles/tile_8.png'),
  Assets.load('/assets/png/default/tiles/tile_9.png'),

  Assets.load('/assets/png/default/tiles/tile_22.png'),
  Assets.load('/assets/png/default/tiles/tile_23.png'),
  Assets.load('/assets/png/default/tiles/tile_24.png'),
  Assets.load('/assets/png/default/tiles/tile_25.png'),

  Assets.load('/assets/png/default/tiles/tile_38.png'),
  Assets.load('/assets/png/default/tiles/tile_39.png'),
  Assets.load('/assets/png/default/tiles/tile_40.png'),
  Assets.load('/assets/png/default/tiles/tile_41.png'),

  Assets.load('/assets/png/default/tiles/tile_54.png'),
  Assets.load('/assets/png/default/tiles/tile_55.png'),
  Assets.load('/assets/png/default/tiles/tile_56.png'),
  Assets.load('/assets/png/default/tiles/tile_57.png'),
])

if (destroyed) return

const islandTiles = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
]

const tileSize = 64
const islandStartX = 350
const islandStartY = 120

islandTiles.forEach((row, rowIndex) => {
  row.forEach((textureIndex, columnIndex) => {
    const tile = new Sprite(islandTextures[textureIndex])

    tile.width = tileSize
    tile.height = tileSize

    tile.x = islandStartX + columnIndex * tileSize
    tile.y = islandStartY + rowIndex * tileSize

    app.stage.addChild(tile)
  })
})

const ship = new Sprite(shipTexture)

ship.anchor.set(0.5)
ship.position.set(480, 460)
ship.rotation = Math.PI

app.stage.addChild(ship)

const playerHealthBarBackground = new Graphics()
const playerHealthBar = new Graphics()

app.stage.addChild(playerHealthBarBackground)
app.stage.addChild(playerHealthBar)

const shooter = new Sprite(shooterTexture)

shooter.anchor.set(0.5)
shooter.position.set(800, 150)

app.stage.addChild(shooter)

const shooterHealthBarBackground = new Graphics()
const shooterHealthBar = new Graphics()

app.stage.addChild(shooterHealthBarBackground)
app.stage.addChild(shooterHealthBar)

let playerHealth = GAME_CONFIG.playerHealth
let score = 0

let shooterHealth = GAME_CONFIG.shooterHealth
let shooterAlive = true

let chaserHealth = GAME_CONFIG.chaserHealth
let chaserAlive = false

let isPaused = false

const chaser = new Sprite(chaserTexture)
chaser.anchor.set(0.5)

const chaserHealthBarBackground = new Graphics()
const chaserHealthBar = new Graphics()

app.stage.addChild(chaserHealthBarBackground)
app.stage.addChild(chaserHealthBar)

const spawnChaser = () => {
  chaserHealth = GAME_CONFIG.chaserHealth
  chaserAlive = true

const safeSpawnPoints = [
  { x: 120, y: 120 },
  { x: 840, y: 120 },
  { x: 120, y: 420 },
  { x: 840, y: 420 },
]

const availableSpawnPoints = safeSpawnPoints.filter((point) => {
  const dx = point.x - ship.x
  const dy = point.y - ship.y
  const distanceFromPlayer = Math.sqrt(dx * dx + dy * dy)

  return distanceFromPlayer > 200
})

const spawnPoints =
  availableSpawnPoints.length > 0
    ? availableSpawnPoints
    : safeSpawnPoints

const spawnPoint =
  spawnPoints[Math.floor(Math.random() * spawnPoints.length)]

chaser.position.set(spawnPoint.x, spawnPoint.y)

  if (!chaser.parent) {
    app.stage.addChild(chaser)
  }

  console.log('Chaser spawned!')
}

spawnChaser()

const chaserCollisionDamage = GAME_CONFIG.chaserCollisionDamage

let lastShotTime = 0
const shootCooldown = GAME_CONFIG.frontShotCooldown

let lastSideShotTime = 0
const sideShotCooldown = GAME_CONFIG.sideShotCooldown

let lastShooterShotTime = 0
const shooterShootCooldown = GAME_CONFIG.shooterShotCooldown

const islandBounds = {
    left: 390,
    right: 570,
    top: 170,
    bottom: 370,
  }

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
  const projectileSpeed = GAME_CONFIG.projectileSpeed

  app.stage.addChild(cannonBall)

 const projectileTicker = (ticker: any) => {
  if (isPaused) {
  return
  }
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
  shooterHealth -= GAME_CONFIG.sideShotDamage

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
}, spawnInterval)
  }

  return
}

if (shooterAlive) {
  const dxToShooter = cannonBall.x - shooter.x
  const dyToShooter = cannonBall.y - shooter.y

  const distanceToShooter = Math.sqrt(
    dxToShooter * dxToShooter +
    dyToShooter * dyToShooter
  )

  if (distanceToShooter < 40) {
    shooterHealth -= 25

    console.log(`Shooter health: ${shooterHealth}`)

    app.ticker.remove(projectileTicker)
    cannonBall.destroy()

    if (shooterHealth <= 0) {
      shooterAlive = false
      shooter.destroy()

      score += 1
      setScoreDisplay(score)

      console.log(`Shooter destroyed! Score: ${score}`)
    }

    return
  }
}

}

const projectileHitIsland =
  cannonBall.x > islandBounds.left &&
  cannonBall.x < islandBounds.right &&
  cannonBall.y > islandBounds.top &&
  cannonBall.y < islandBounds.bottom

if (projectileHitIsland) {
  app.ticker.remove(projectileTicker)
  cannonBall.destroy()
  return
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

const sideShoot = (side: 'left' | 'right') => {
  if (gameOver) {
    return
  }

  const now = performance.now()

  if (now - lastSideShotTime < sideShotCooldown) {
    return
  }

  lastSideShotTime = now

  const sideRotation =
    side === 'left'
      ? ship.rotation - Math.PI / 2
      : ship.rotation + Math.PI / 2

const projectileSpeed = 7

const fireSideProjectile = (offset: number) => {
  const cannonBall = new Sprite(cannonBallTexture)
  cannonBall.anchor.set(0.5)

  // Separates the three cannonballs along the side of the ship
  const spreadX = Math.sin(ship.rotation) * offset
  const spreadY = Math.cos(ship.rotation) * offset

  cannonBall.position.set(
    ship.x + spreadX,
    ship.y + spreadY
  )

  app.stage.addChild(cannonBall)

  const projectileTicker = (ticker: any) => {
    if (isPaused) {
       return
    }
    cannonBall.x -=
      Math.sin(sideRotation) * projectileSpeed * ticker.deltaTime

    cannonBall.y +=
      Math.cos(sideRotation) * projectileSpeed * ticker.deltaTime

    // Chaser collision
    if (chaserAlive) {
      const dx = cannonBall.x - chaser.x
      const dy = cannonBall.y - chaser.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 40) {
        chaserHealth -= GAME_CONFIG.sideShotDamage

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
          }, spawnInterval)
        }

        return
      }
    }

    // Shooter collision
    if (shooterAlive) {
      const dx = cannonBall.x - shooter.x
      const dy = cannonBall.y - shooter.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 40) {
        shooterHealth -= 25

        console.log(`Shooter health: ${shooterHealth}`)

        app.ticker.remove(projectileTicker)
        cannonBall.destroy()

        if (shooterHealth <= 0) {
          shooterAlive = false
          shooter.destroy()

          score += 1
          setScoreDisplay(score)

          console.log(`Shooter destroyed! Score: ${score}`)
        }

        return
      }
    }

    // Island collision
    const projectileHitsIsland =
      cannonBall.x > islandBounds.left &&
      cannonBall.x < islandBounds.right &&
      cannonBall.y > islandBounds.top &&
      cannonBall.y < islandBounds.bottom

    if (projectileHitsIsland) {
      app.ticker.remove(projectileTicker)
      cannonBall.destroy()
      return
    }

    // Arena bounds
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

// Three parallel cannonballs
fireSideProjectile(-25)
fireSideProjectile(0)
fireSideProjectile(25)

console.log(`Side shot: ${side}`)

}



const keys: Record<string, boolean> = {}

const keyDown = (event: KeyboardEvent) => {
  keys[event.key.toLowerCase()] = true

  if (event.code === 'Space') {
    shoot()
  }

  if (event.code === 'KeyQ') {
  sideShoot('left')
  }

  if (event.code === 'KeyE') {
  sideShoot('right')
  }

  if (event.key.toLowerCase() === 'p') {
  isPaused = !isPaused
  setPauseDisplay(isPaused)

  console.log(isPaused ? 'Game paused' : 'Game resumed')
}
}

const keyUp = (event: KeyboardEvent) => {
  keys[event.key.toLowerCase()] = false
}

keyDownHandler = keyDown
keyUpHandler = keyUp

window.addEventListener('keydown', keyDown)
window.addEventListener('keyup', keyUp)

const handleVisibilityChange = () => {
  if (document.hidden && !gameOver) {
    isPaused = true
    console.log('Game auto-paused')
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange)

app.ticker.add((ticker) => {
  if (gameOver || isPaused) {
    return
  }

// Player health bar
playerHealthBarBackground.clear()
playerHealthBarBackground
  .rect(ship.x - 30, ship.y - 45, 60, 7)
  .fill(0x333333)

playerHealthBar.clear()

const playerHealthPercent = Math.max(0, playerHealth / 100)

playerHealthBar
  .rect(
    ship.x - 30,
    ship.y - 45,
    60 * playerHealthPercent,
    7
  )
  .fill(0x00ff00)

// Shooter health bar
shooterHealthBarBackground.clear()
shooterHealthBar.clear()

if (shooterAlive) {
  shooterHealthBarBackground
    .rect(shooter.x - 30, shooter.y - 45, 60, 7)
    .fill(0x333333)

  const shooterHealthPercent = Math.max(0, shooterHealth / 50)

  shooterHealthBar
    .rect(
      shooter.x - 30,
      shooter.y - 45,
      60 * shooterHealthPercent,
      7
    )
    .fill(0xff0000)
}

// Chaser health bar
chaserHealthBarBackground.clear()
chaserHealthBar.clear()

if (chaserAlive) {
  chaserHealthBarBackground
    .rect(chaser.x - 30, chaser.y - 45, 60, 7)
    .fill(0x333333)

  const chaserHealthPercent = Math.max(0, chaserHealth / 100)

  chaserHealthBar
    .rect(
      chaser.x - 30,
      chaser.y - 45,
      60 * chaserHealthPercent,
      7
    )
    .fill(0xff0000)
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

    setEndReason('Time expired')
    setMatchEnded(true)

    console.log(`Game over! Final score: ${score}`)   
    return
  }
}
  const speed = GAME_CONFIG.playerSpeed * ticker.deltaTime
  const rotationSpeed = GAME_CONFIG.rotationSpeed * ticker.deltaTime

  if (keys['a'] || keys['arrowleft']) {
    ship.rotation -= rotationSpeed
  }

  if (keys['d'] || keys['arrowright']) {
    ship.rotation += rotationSpeed
  }

  const previousX = ship.x
  const previousY = ship.y

  if (keys['w'] || keys['arrowup']) {
    ship.x -= Math.sin(ship.rotation) * speed
    ship.y += Math.cos(ship.rotation) * speed
  }

  const shipHitIsland =
  ship.x > islandBounds.left &&
  ship.x < islandBounds.right &&
  ship.y > islandBounds.top &&
  ship.y < islandBounds.bottom

if (shipHitIsland) {
  ship.x = previousX
  ship.y = previousY
}

    const dx = ship.x - chaser.x
    const dy = ship.y - chaser.y

    const distance = Math.sqrt(dx * dx + dy * dy)

    const chaserSpeed = 1.5 * ticker.deltaTime

if (distance > 0 && chaserAlive) {
      chaser.rotation = Math.atan2(-dx, dy)

     const previousChaserX = chaser.x
  const previousChaserY = chaser.y

  chaser.x += (dx / distance) * chaserSpeed
  chaser.y += (dy / distance) * chaserSpeed

  const chaserHitIsland =
    chaser.x > islandBounds.left &&
    chaser.x < islandBounds.right &&
    chaser.y > islandBounds.top &&
    chaser.y < islandBounds.bottom

  if (chaserHitIsland) {
    chaser.x = previousChaserX
    chaser.y = previousChaserY
  }

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

    setEndReason('Player destroyed')
    setMatchEnded(true)

    console.log(`Game over! Player destroyed. Final score: ${score}`)
  }

  app.stage.removeChild(chaser)

  if (!gameOver) {
  setTimeout(() => {
    if (!gameOver) {
      spawnChaser()
    }
  }, spawnInterval)
}
}
    }
if (shooterAlive) {

const shooterDx = ship.x - shooter.x
const shooterDy = ship.y - shooter.y

const shooterDistance = Math.sqrt(
  shooterDx * shooterDx + shooterDy * shooterDy
)

const shooterSpeed = 1 * ticker.deltaTime
const shooterAttackRange = GAME_CONFIG.shooterAttackRange

if (shooterDistance > 0) {
  shooter.rotation = Math.atan2(-shooterDx, shooterDy)

  if (shooterDistance > shooterAttackRange) {
  const previousShooterX = shooter.x
  const previousShooterY = shooter.y

  shooter.x += (shooterDx / shooterDistance) * shooterSpeed
  shooter.y += (shooterDy / shooterDistance) * shooterSpeed

  const shooterHitIsland =
    shooter.x > islandBounds.left &&
    shooter.x < islandBounds.right &&
    shooter.y > islandBounds.top &&
    shooter.y < islandBounds.bottom

  if (shooterHitIsland) {
    shooter.x = previousShooterX
    shooter.y = previousShooterY
  }
} else {
    const now = performance.now()

    if (now - lastShooterShotTime >= shooterShootCooldown) {
      lastShooterShotTime = now

      const enemyCannonBall = new Sprite(cannonBallTexture)

      enemyCannonBall.anchor.set(0.5)
      enemyCannonBall.position.set(shooter.x, shooter.y)

app.stage.addChild(enemyCannonBall)

const enemyProjectileSpeed = 5

const directionX = shooterDx / shooterDistance
const directionY = shooterDy / shooterDistance

const enemyProjectileTicker = (ticker: any) => {
    if (isPaused) {
    return
  }
  enemyCannonBall.x += directionX * enemyProjectileSpeed * ticker.deltaTime
  enemyCannonBall.y += directionY * enemyProjectileSpeed * ticker.deltaTime

  const enemyProjectileHitIsland =
  enemyCannonBall.x > islandBounds.left &&
  enemyCannonBall.x < islandBounds.right &&
  enemyCannonBall.y > islandBounds.top &&
  enemyCannonBall.y < islandBounds.bottom

if (enemyProjectileHitIsland) {
  app.ticker.remove(enemyProjectileTicker)
  enemyCannonBall.destroy()
  return
}

  const dxToPlayer = enemyCannonBall.x - ship.x
const dyToPlayer = enemyCannonBall.y - ship.y

const distanceToPlayer = Math.sqrt(
  dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer
)

if (distanceToPlayer < 35) {
  playerHealth -= 25

  if (playerHealth < 0) {
    playerHealth = 0
  }

  setHealth(playerHealth)

  app.ticker.remove(enemyProjectileTicker)
  enemyCannonBall.destroy()

  console.log(`Shooter hit player! Health: ${playerHealth}`)

  if (playerHealth <= 0) {
    gameOver = true

    setEndReason('Player destroyed')
    setMatchEnded(true)

    console.log(`Game over! Player destroyed. Final score: ${score}`)
  }

  return
}

  const outsideArena =
    enemyCannonBall.x < 0 ||
    enemyCannonBall.x > 960 ||
    enemyCannonBall.y < 0 ||
    enemyCannonBall.y > 540

  if (outsideArena) {
    app.ticker.remove(enemyProjectileTicker)
    enemyCannonBall.destroy()
  }
}

app.ticker.add(enemyProjectileTicker)

console.log('Shooter fired!')
       }
     }
   }
 }
}

)}

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

    <div>
  <label>
    Match Duration:{' '}
    <select
      value={matchDuration}
      onChange={(event) => {
        const value = Number(event.target.value)
        setMatchDuration(value)
        localStorage.setItem('matchDuration', String(value))
      }}
    >
      <option value={60}>60 seconds</option>
      <option value={90}>90 seconds</option>
      <option value={120}>120 seconds</option>
    </select>
  </label>

  {' | '}

  <label>
    Enemy Spawn Interval:{' '}
    <select
      value={spawnInterval}
      onChange={(event) => {
        const value = Number(event.target.value)
        setSpawnInterval(value)
        localStorage.setItem('spawnInterval', String(value))
      }}
    >
      <option value={2000}>2 seconds</option>
      <option value={3000}>3 seconds</option>
      <option value={5000}>5 seconds</option>
    </select>
  </label>
</div>
    
<div>
  <strong>Controls:</strong>{' '}
  W / ↑ Move | A / ← Turn Left | D / → Turn Right | Space Front Shot |
  Q Left Broadside | E Right Broadside | P Pause
</div>

{pauseDisplay && !matchEnded && (
  <div>
    <h2>PAUSED</h2>
    <p>Press P to resume</p>
  </div>
)}

{matchEnded && (
  <div>
    <h2>Game Over</h2>
    <p>Final Score: {scoreDisplay}</p>
    <p>Reason: {endReason}</p>

    <button onClick={() => window.location.reload()}>
      Play Again
    </button>
  </div>
)}

    <div ref={containerRef} />
  </div>
)
}

export default GameCanvas