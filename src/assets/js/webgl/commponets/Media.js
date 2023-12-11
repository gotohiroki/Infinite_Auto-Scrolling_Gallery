import { Mesh, ShaderMaterial, TextureLoader, Vector2 } from 'three';

import vertexShader from "../shader/vertex.glsl";
import fragmentShader from "../shader/fragment.glsl";

export default class Media {
  constructor({ 
    element,
    texture,
    geometry,
    gl,
    height,
    scene,
    screen,
    viewport,
  }) {
    this.element = element;
    this.img = this.element.querySelector('img');

    this.texture = texture;
    this.geometry = geometry;
    this.height = height;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    
    this.extra = 0;

    this.createMesh();
    this.createBounds();
    this.onResize();
  }

  createMesh() {
    const textureLoader = new TextureLoader();

    const material = new ShaderMaterial({
      fragmentShader,
      vertexShader,
      uniforms: {
        tMap: { value: this.texture },
        uPlaneSizes: { value: new Vector2(0, 0) },
        uImageSizes: { value: new Vector2(this.img.naturalWidth, this.img.naturalHeight) },
        uViewportSizes: { value: new Vector2(this.viewport.width, this.viewport.height) },
        uStrength: { value: 0 },
      },
      transparent: true,
    });

    this.plane = new Mesh(this.geometry, material);
    this.scene.add(this.plane);
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    this.plane.material.uniforms.uPlaneSizes.value = new Vector2(this.plane.scale.x, this.plane.scale.y);
  }

  updateScale() {
    this.plane.scale.x =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    this.plane.scale.y =
      (this.viewport.height * this.bounds.height) / this.screen.height;
  }

  updateX(x = 0) {
    this.plane.position.x =
      -(this.viewport.width / 2) +
      this.plane.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  updateY(y = 0) {
    this.plane.position.y =
    this.viewport.height / 2 -
    this.plane.scale.y / 2 -
    ((this.bounds.top - y) / this.screen.height) * this.viewport.height -
    this.extra;
  }

  onResize(sizes) {
    this.extra = 0;

    if (sizes) {
      const { height, screen, viewport } = sizes;

      if (height) this.height = height;
      if (screen) this.screen = screen;
      if (viewport) {
        this.viewport = viewport;

        this.plane.material.uniforms.uViewportSizes.value = new Vector2(this.viewport.width, this.viewport.height);
      }
    }

    this.createBounds();
  }

  update(y, direction) {
    this.updateY(y.current);

    this.plane.material.uniforms.uStrength.value =
      ((y.current - y.last) / this.screen.width) * 10;

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

    // if (direction === 'down' && this.isBefore) {
    //   this.extra += this.height;

    //   this.isBefore = false;
    //   this.isAfter = false;
    // }

    // if (direction === 'up' && this.isAfter) {
    //   this.extra -= this.height;

    //   this.isBefore = false;
    //   this.isAfter = false;
    // }
  }
}