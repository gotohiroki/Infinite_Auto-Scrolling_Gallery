import * as THREE from 'three';

// Import shaders as strings
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export default class CustomShaderMesh {
  constructor({ element, geometry, height, scene, screen, viewport }) {
    this.element = element;
    this.image = this.element.querySelector('img');

    this.extra = 0;
    this.height = height;
    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.createMesh();
    this.createBounds();

    this.onResize();
  }

  createMesh() {
    const image = new Image();
    const textureLoader = new THREE.TextureLoader();

    image.src = this.image.src;
    image.onload = () => {
      this.material.uniforms.uImageSizes.value = new THREE.Vector2(image.naturalWidth, image.naturalHeight);
      this.material.uniforms.tMap.value = textureLoader.load(image.src);
    };

    this.material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        tMap: { value: null },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uImageSizes: { value: new THREE.Vector2(0, 0) },
        uViewportSizes: { value: new THREE.Vector2(this.viewport.width, this.viewport.height) },
        uStrength: { value: 0 },
      },
      transparent: true,
    });

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    this.material.uniforms.uPlaneSizes.value = new THREE.Vector2(this.plane.scale.x, this.plane.scale.y);
  }

  updateScale() {
    this.plane.scale.x = (this.viewport.width * this.bounds.width) / this.screen.width;
    this.plane.scale.y = (this.viewport.height * this.bounds.height) / this.screen.height;
  }

  updateX(x = 0) {
    this.plane.position.x =
      -this.viewport.width / 2 +
      this.plane.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  updateY(y = 0) {
    this.plane.position.y =
      ((this.viewport.height / 2 - this.plane.scale.y / 2 - ((this.bounds.top - y) / this.screen.height) * this.viewport.height) -
        this.extra);
  }

  update(y, direction) {
    this.updateScale();
    this.updateX();
    this.updateY(y.current);

    const planeOffset = this.plane.scale.y / 2;
    const viewportOffset = this.viewport.height / 2;

    this.isBefore = this.plane.position.y + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.y - planeOffset > viewportOffset;

    if (direction === 'up' && this.isBefore) {
      this.extra -= this.height;

      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === 'down' && this.isAfter) {
      this.extra += this.height;

      this.isBefore = false;
      this.isAfter = false;
    }

    this.material.uniforms.uStrength.value = ((y.current - y.last) / this.screen.width) * 10;
  }

  onResize(sizes) {
    this.extra = 0;

    if (sizes) {
      const { height, screen, viewport } = sizes;

      if (height) this.height = height;
      if (screen) this.screen = screen;
      if (viewport) {
        this.viewport = viewport;

        this.material.uniforms.uViewportSizes.value = new THREE.Vector2(this.viewport.width, this.viewport.height);
      }
    }

    this.createBounds();
  }
}
