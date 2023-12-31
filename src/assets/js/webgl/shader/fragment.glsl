uniform sampler2D tMap;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
uniform float uOpacity;

varying vec2 vUv;

#include './_inc/periodic2d.glsl'

void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  // float n = snoise(uv);
  
  gl_FragColor.rgb = texture2D(tMap, uv).rgb;
  gl_FragColor.a = uOpacity;
}