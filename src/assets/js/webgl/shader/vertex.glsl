uniform float uStrength;
uniform vec2 uViewportSizes;

varying vec2 vUv;
varying float vDistortion;

float PI = 3.1415926535897932384626433832795;

void main() {
  vec4 newPosition = modelViewMatrix * vec4(position, 1.);

  float distortion = sin(newPosition.y / uViewportSizes.y * PI + PI / 2.) * -uStrength;
  newPosition.z += distortion;

  vUv = uv;
  vDistortion = distortion;

  gl_Position = projectionMatrix * newPosition;
}