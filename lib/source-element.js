var extname = require('path').extname

var mimeTypes = require('./mime-types.json')
var mimeLookup = {}
Object.keys(mimeTypes).forEach(function (key) {
  var extensions = mimeTypes[key]
  extensions.forEach(function (ext) {
    mimeLookup[ext] = key
  })
})

module.exports = createSourceElement
function createSourceElement (src, type) {
  var source = document.createElement('source')
  source.src = src
  if (!type) type = lookup(src)
  source.type = type
  return source
}

function lookup (src) {
  var ext = extname(src)
  if (ext.indexOf('.') === 0) {
    ext = mimeLookup[ext.substring(1).toLowerCase()]
  }
  if (!ext) {
    throw new TypeError('could not determine mime-type from source: ' + src)
  }
  return ext
}