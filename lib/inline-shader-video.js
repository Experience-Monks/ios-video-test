var inlineCanvasVideo = require('./inline-canvas-video')
var createTexture = require('glo-texture/2d')
var createShader = require('gl-shader')
var triangle = require('a-big-triangle')
var getContext = require('get-canvas-context')
var assign = require('object-assign')
var isPOT = require('is-power-of-two')

var defaultFragmentShader = [
  'precision mediump float;',
  'varying vec2 vUv;',
  'uniform sampler2D video;',
  'uniform vec2 resolution;',
  'uniform vec2 videoResolution;',
  'uniform float currentTime;',
  'uniform float duration;',
  'void main() {',
  'gl_FragColor = texture2D(video, vUv);',
  '}'
].join('\n')

var defaultVertexShader = [
  'attribute vec4 position;',
  'varying vec2 vUv;',
  'void main() {',
  'gl_Position = position;',
  'vUv = vec2(position.xy + 1.0) * 0.5;',
  'vUv.y = 1.0 - vUv.y;',
  '}'
].join('\n')

module.exports = inlineShaderVideo
function inlineShaderVideo (source, opt, cb) {
  var gl,
    texture,
    shader,
    size,
    canvasSize,
    canvas
  
  inlineCanvasVideo(source, assign({}, opt, {
    render: render
  }), function (err, result) {
    if (err) return cb(err)
    canvas = result.canvas
  
    gl = getContext('webgl', { canvas: canvas })
  
    var video = result.video
    size = [ video.videoWidth, video.videoHeight ]
    canvasSize = [ canvas.width, canvas.height ]
    
    texture = createTexture(gl, null, size)
    texture.minFilter = gl.LINEAR
    texture.magFilter = gl.LINEAR
    if (isPOT(texture.width) && isPOT(texture.height)) {
      texture.wrap = gl.REPEAT
    }

    var vertex = opt.vertex || defaultVertexShader
    var fragment = opt.fragment || defaultFragmentShader
    shader = createShader(gl, vertex, fragment)

    shader.bind()
    shader.uniforms.duration = video.duration
    shader.uniforms.video = 0
    shader.uniforms.videoResolution = size
    
    result.texture = texture
    result.shader = shader
    result.gl = gl
    cb(null, result)
  })

  function render (video) {
    canvasSize[0] = canvas.width
    canvasSize[1] = canvas.height

    texture.update(video, size)

    var width = gl.drawingBufferWidth
    var height = gl.drawingBufferHeight
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, width, height)
    shader.bind()
    texture.bind()
    shader.uniforms.currentTime = video.currentTime
    shader.uniforms.resolution = canvasSize
    triangle(gl)
  }
}
