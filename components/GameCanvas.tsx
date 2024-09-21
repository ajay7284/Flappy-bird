// "use client"

// import React, { useState, useEffect, useRef } from 'react'

// // Game Canvas Component
// const GameCanvas: React.FC<{ onGameOver: () => void; onScoreUpdate: (score: number) => void }> = ({ onGameOver, onScoreUpdate }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [isGameActive, setIsGameActive] = useState(true)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return

//     const ctx = canvas.getContext('2d')
//     if (!ctx) return

//     const bird = {
//       x: 50,
//       y: canvas.height / 2,
//       radius: 20,
//       velocity: 0,
//     }

//     let pipes: { x: number; topHeight: number }[] = []
//     let score = 0
//     let animationFrameId: number

//     const gravity = 0.5
//     const jump = -10
//     const pipeWidth = 50
//     const pipeGap = 150
//     const pipeSpeed = 2

//     const drawBird = () => {
//       ctx.fillStyle = 'yellow'
//       ctx.beginPath()
//       ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2)
//       ctx.fill()
//     }

//     const drawPipes = () => {
//       ctx.fillStyle = 'green'
//       pipes.forEach((pipe) => {
//         ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight)
//         ctx.fillRect(
//           pipe.x,
//           pipe.topHeight + pipeGap,
//           pipeWidth,
//           canvas.height - pipe.topHeight - pipeGap
//         )
//       })
//     }

//     const updateGame = () => {
//       if (!isGameActive) return

//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       bird.velocity += gravity
//       bird.y += bird.velocity

//       pipes.forEach((pipe) => {
//         pipe.x -= pipeSpeed
//       })

//       pipes = pipes.filter((pipe) => pipe.x > -pipeWidth)

//       if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
//         pipes.push({
//           x: canvas.width,
//           topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50,
//         })
//       }

//       const birdBox = {
//         left: bird.x - bird.radius,
//         right: bird.x + bird.radius,
//         top: bird.y - bird.radius,
//         bottom: bird.y + bird.radius,
//       }

//       for (const pipe of pipes) {
//         const topPipeBox = {
//           left: pipe.x,
//           right: pipe.x + pipeWidth,
//           top: 0,
//           bottom: pipe.topHeight,
//         }

//         const bottomPipeBox = {
//           left: pipe.x,
//           right: pipe.x + pipeWidth,
//           top: pipe.topHeight + pipeGap,
//           bottom: canvas.height,
//         }

//         if (
//           (birdBox.right > topPipeBox.left &&
//             birdBox.left < topPipeBox.right &&
//             birdBox.top < topPipeBox.bottom) ||
//           (birdBox.right > bottomPipeBox.left &&
//             birdBox.left < bottomPipeBox.right &&
//             birdBox.bottom > bottomPipeBox.top) ||
//           bird.y > canvas.height ||
//           bird.y < 0
//         ) {
//           setIsGameActive(false)
//           onGameOver()
//           return
//         }
//       }

//       if (pipes[0] && bird.x > pipes[0].x + pipeWidth && pipes[0].x > bird.x - pipeSpeed) {
//         score++
//         onScoreUpdate(score)
//       }

//       drawBird()
//       drawPipes()

//       animationFrameId = requestAnimationFrame(updateGame)
//     }

//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.code === 'Space' && isGameActive) {
//         bird.velocity = jump
//       }
//     }

//     document.addEventListener('keydown', handleKeyPress)
//     updateGame()

//     return () => {
//       document.removeEventListener('keydown', handleKeyPress)
//       cancelAnimationFrame(animationFrameId)
//     }
//   }, [onGameOver, onScoreUpdate, isGameActive])

//   return (
//     <canvas
//       ref={canvasRef}
//       width={800}
//       height={400}
//       className="border border-gray-300 rounded-lg"
//     />
//   )
// }