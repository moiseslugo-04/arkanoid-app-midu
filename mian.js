const canvas = document.querySelector('canvas')
const imgSprite = document.getElementById('sprite')
const brick = document.getElementById('brick')
// canvas measures
canvas.width = 448
canvas.height = 400
const ctx = canvas.getContext('2d')
//ball measures
const ball = {
  radius: 5,
  ballX: canvas.width / 2 - 5,
  ballY: canvas.height - 30,
}
// Ball Movement Speed
let moveX = 2
let moveY = -2
//paddle measures
const paddle = {
  width: 50,
  height: 10,
  paddleX: (canvas.width - 50) / 2,
  paddleY: canvas.height - 10 - 6,
}
// bricks measures
const bricks = {
  column: 13,
  row: 6,
  width: 30,
  height: 14,
  padding: 2,
  top: 80,
  left: 17,
  BRICK_STATUS: { FRESH: 1, HIT: 0 },
  array: [],
}

function iterator(action) {
  for (let column = 0; column < bricks.column; column++) {
    for (let row = 0; row < bricks.row; row++) {
      const currentBrick = bricks.array[column][row]
      action(currentBrick, column, row)
    }
  }
}
function initializeBricks() {
  for (let c = 0; c < bricks.column; c++) {
    bricks.array[c] = []
  }
  iterator((currentBrick, column, row) => {
    const brickX = column * (bricks.width + bricks.padding) + bricks.left
    const brickY = row * (bricks.height + bricks.padding) + bricks.top
    const random = Math.floor(Math.random() * 8)
    bricks.array[column][row] = {
      x: brickX,
      y: brickY,
      status: bricks.BRICK_STATUS.FRESH,
      color: random,
    }
  })
}
initializeBricks()
/************************************************************************
 *************** DRAWING FUNCTIONS **************************************
 ************************************************************************/

function drawBall() {
  const { ballX, ballY, radius } = ball
  ctx.beginPath()
  ctx.fillStyle = 'red'
  ctx.arc(ballX, ballY, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
}
function drawPaddle() {
  const { width, height, paddleX, paddleY } = paddle
  ctx.drawImage(
    imgSprite,
    29,
    174,
    width,
    height,
    paddleX,
    paddleY,
    width,
    height
  )
}
function drawBricks() {
  iterator((currentBrick, column, row) => {
    if (currentBrick.status == bricks.BRICK_STATUS.HIT) return
    const clipX = currentBrick.color * 32
    ctx.strokeStyle = '#009'
    ctx.drawImage(
      brick,
      clipX,
      0,
      bricks.width,
      bricks.height,
      currentBrick.x,
      currentBrick.y,
      bricks.width,
      bricks.height
    )
  })
}
/************************************************************************
 *************** LOGICAl FUNCTIONS **************************************
 ************************************************************************/
let keyLeft = false
let keyRight = false

function ballMovement() {
  const { ballX, ballY, radius } = ball
  const { paddleX, paddleY, width, height } = paddle
  if (ballX + moveX > canvas.width - radius || ballX < radius) {
    moveX = -moveX
  }
  if (ballY < radius) {
    moveY = -moveY
  }
  const isMatchedX = ballX > paddleX && ballX < paddleX + width
  const ballIsTouch = ballY + moveY > paddleY - height
  if (isMatchedX && ballIsTouch) {
    moveY = -moveY
  } else if (ballY + moveY > canvas.height - radius) {
    window.location.reload()
  }
  ball.ballX += moveX
  ball.ballY += moveY
}
function handlerKeydown({ key }) {
  if (key == 'right' || key == 'ArrowRight') {
    keyRight = true
  } else if (key == 'left' || key == 'ArrowLeft') {
    keyLeft = true
  }
}
function handlerKeyup({ key }) {
  if (key == 'left' || key == 'ArrowLeft') {
    keyLeft = false
  } else if (key == 'right' || key == 'ArrowRight') {
    keyRight = false
  }
}
function paddleMovement() {
  const { paddleX, width } = paddle
  if (keyRight && paddleX < canvas.width - width) {
    paddle.paddleX += 7
  } else if (keyLeft && paddleX > 0) {
    paddle.paddleX -= 7
  }
}
function initialEvents() {
  window.addEventListener('keydown', handlerKeydown)
  window.addEventListener('keyup', handlerKeyup)
}
function collisionDetection() {
  const { ballX, ballY } = ball
  iterator((currentBrick) => {
    if (currentBrick.status == bricks.BRICK_STATUS.HIT) return
    const isCollisionX =
      ballX > currentBrick.x && ballX < currentBrick.x + bricks.width
    const isCollisionY =
      ballY > currentBrick.y && ballY < currentBrick.y + bricks.height
    if (isCollisionX && isCollisionY) {
      moveY = -moveY
      currentBrick.status = bricks.BRICK_STATUS.HIT
    }
  })
}
const clearDrawn = () => ctx.clearRect(0, 0, canvas.width, canvas.height)
function draw() {
  clearDrawn()

  //drawing
  drawBall()
  drawPaddle()
  drawBricks()

  //logical
  ballMovement()
  paddleMovement()
  collisionDetection()
  window.requestAnimationFrame(draw)
}
initialEvents()
draw()
