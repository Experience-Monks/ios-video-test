precision mediump float;

uniform sampler2D video;
uniform vec2 resolution;
uniform vec2 videoResolution;
uniform float currentTime;
uniform int mode;
varying vec2 vUv;

#pragma glslify: luma = require('glsl-luma')
#pragma glslify: crosshatch = require('glsl-crosshatch-filter')

void main() {
   gl_FragColor = texture2D(video, vUv);

   if (mode == 0) {
      gl_FragColor = vec4(vec3(luma(gl_FragColor.rgb)), 1.0);
   } else {
     vec2 coord = vUv;
     coord.x *= resolution.x / resolution.y;
     vec3 effect = crosshatch(gl_FragColor.rgb);
     gl_FragColor.rgb = mix(gl_FragColor.rgb, effect, 0.5);
   }
}
