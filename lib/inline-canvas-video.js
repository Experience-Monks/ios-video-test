var parallel = require('run-parallel')
var media = require('./media-element')
var assign = require('object-assign')
var createLoop = require('raf-loop')
var defined = require('defined')
var now = require('right-now')
var raf = require('raf')
var noop = function () {}

module.exports = createCanvasVideo
function createCanvasVideo (source, opt, cb) {
  if (typeof opt === 'function') {
    cb = opt
    opt = {}
  }
  opt = assign({}, opt)
  cb = cb || noop

  var fallback = typeof opt.fallback === 'boolean'
    ? opt.fallback : /i(Pad|Phone)/i.test(navigator.userAgent)
  var video = opt.element || document.createElement('video')
  var audio

  if (fallback && !opt.muted) {
    audio = document.createElement('audio')
    
    // disable autoplay for this scenario
    opt.autoplay = false
  }

  var loop = createLoop()
  var lastTime = now()
  
  var fps = defined(opt.fps, 60)
  var elapsed = 0
  var canvas = opt.canvas || document.createElement('canvas')
  var context = null
  var render = opt.render || defaultRender
  
  var canvasVideo = {}
  canvasVideo.play = play
  canvasVideo.pause = pause
  canvasVideo.canvas = canvas
  canvasVideo.video = video
  canvasVideo.audio = audio
  canvasVideo.fallback = fallback
  
  var duration = Infinity
  var looping = opt.loop
  
  if (fallback) {
    // load audio and muted video
    parallel([
      function (next) {
        media.video(source, assign({}, opt, {
          muted: true,
          element: video
        }), next)
      },
      function (next) {
        media.audio(source, assign({}, opt, {
          element: audio
        }), next)
      }
    ], ready)
  } else {
    media.video(source, assign({}, opt, {
      element: video
    }), ready)
  }
  
  function ready (err) {
    if (err) return cb(err)
    
    // maintain aspect ratio if only one dimension is specified
    var aspect = video.videoWidth / video.videoHeight
    if (typeof opt.width === 'number' && typeof opt.height === 'number') {
      canvas.width = opt.width
      canvas.height = opt.height
    } else if (typeof opt.width === 'number') {
      canvas.width = opt.width
      canvas.height = opt.width / aspect
    } else if (typeof opt.height === 'number') {
      canvas.height = opt.height
      canvas.width = opt.height * aspect
    } else {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
    }

    if (fallback) {
      video.addEventListener('timeupdate', drawFrame, false)
      if (audio) {
        audio.addEventListener('ended', function () {
          if (looping) {
            audio.currentTime = 0
          } else {            
            loop.stop()
          }
        }, false)
      }
    }
    
    duration = video.duration
    loop = createLoop(tick)
    raf(drawFrame)
    cb(null, canvasVideo)
  }

  function play () {
    lastTime = now()
    loop.start()
    if (audio) audio.play()
    if (!fallback) video.play()
  }

  function pause () {
    loop.stop()
    if (audio) audio.pause()
    if (!fallback) video.pause()
  }

  function tick () {
    // render immediately in desktop
    if (!fallback) {
      return drawFrame()
    }
    
    // in iPhone, we render based on audio (if it exists)
    // otherwise we step forward by a target FPS
    var time = now()
    elapsed = (time - lastTime) / 1000
    if (elapsed >= ((1000 / fps) / 1000)) {
      if (fallback) { // seek and wait for timeupdate
        if (audio) {
          video.currentTime = audio.currentTime
        } else {
          video.currentTime = video.currentTime + elapsed
        }
      }
      lastTime = time
    }
    
    // in iPhone, when audio is not present we need
    // to track duration
    if (fallback && !audio) {
      if (Math.abs(video.currentTime - duration) < 0.1) {
        // whether to restart or just stop the raf loop
        if (looping) video.currentTime = 0
        else loop.stop()
      }
    }
  }

  function drawFrame () {
    render(video)
  }
  
  function defaultRender (video) {
    if (!context) context = canvas.getContext('2d')
    if (!context) {
      render = noop
      throw new Error('no 2d context for <canvas> element')
    }
    var width = canvas.width
    var height = canvas.height
    context.clearRect(0, 0, width, height)
    context.drawImage(video, 0, 0, width, height)
  }
}
