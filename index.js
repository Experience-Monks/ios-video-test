var inlineVideo2D = require('./lib/inline-canvas-video')
var inlineVideoGPU = require('./lib/inline-shader-video')
var timeout = require('callback-timeout')
var glslify = require('glslify')
var queryString = require('query-string')

var canvas = document.querySelector('canvas')

var hasGL = require('get-canvas-context')('webgl')
console.log(hasGL ? 'WebGL Enabled' : 'No WebGL')

var muted = queryString.parse(window.location.search).muted === 'true'

var fragment = glslify('./demo.glsl')
var effect = 0

var inlineVideo = hasGL ? inlineVideoGPU : inlineVideo2D
inlineVideo('assets/video.mp4', {
  canvas: canvas,
  loop: true,
  fragment: fragment,
  autoplay: true,
  preload: true,
  width: 640,
  muted: muted
}, timeout(start, 10000))

function start (err, canvasVideo) {
  if (err) {
    console.error(err)
    return alert(err.message)
  }

  canvas.addEventListener('touchstart', function (ev) {
    ev.preventDefault() // prevent swipe
    swapEffect()
  }, false)
  canvas.addEventListener('click', swapEffect, false)

  var fallback = canvasVideo.fallback
  console.log(fallback ? 'Using currentTime hack' : 'Using standard video playback')

  // in fallback + audio mode (iPhone) we need to show a Play button
  var needsGesture = /Android/i.test(navigator.userAgent) || (fallback && canvasVideo.audio)
  if (needsGesture) {
    var btn = document.querySelector('.button')
    var play = document.querySelector('.play')
    
    // show play button
    play.style.display = 'flex'
    btn.addEventListener('click', function () {
      play.style.display = 'none'
      canvasVideo.play()
    })
  } else {
    canvasVideo.play()
  }

  resize()
  window.addEventListener('resize', resize, false)
  function resize () {
    var width = document.documentElement.clientWidth
    var height = document.documentElement.clientHeight
    letterbox(canvas, [
      width, height
    ], canvasVideo.video)
  }
  
  // resize and reposition canvas to form a letterbox view
  function letterbox (element, parent, video) {
    var aspect = video.videoWidth / video.videoHeight
    var pwidth = parent[0]
    var pheight = parent[1]

    var width = pwidth
    var height = Math.round(width / aspect)
    var y = Math.floor(pheight - height) / 2
    
    // this is a fix specifically for full-screen on iOS9
    // without it, the status bars will not hide... O.o
    if (canvasVideo.fallback) height += 1
    
    element.style.top = y + 'px'
    element.style.width = width + 'px'
    element.style.height = height + 'px'
  }
  
  function swapEffect () {
    effect ^= 1
    if (canvasVideo.shader) {
      canvasVideo.shader.bind()
      canvasVideo.shader.uniforms.mode = effect
    }
  }
}
