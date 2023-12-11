import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// NormalizeWheel function is required for handling wheel events
import NormalizeWheel from 'normalize-wheel';

import Media from './demo-1/Media';

class App {
  constructor() {
    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0,
    };

    this.speed = 2;

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.createGallery();

    this.onResize();

    this.createGeometry();
    this.createMedias();

    this.update();

    this.addEventListeners();
  }

  createGallery() {
    this.gallery = document.querySelector('.demo-1__gallery');
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    });

    this.gl = this.renderer.domElement;

    document.body.appendChild(this.gl);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createGeometry() {
    // You need to define the plane geometry in three.js. Adjust parameters as needed.
    this.planeGeometry = new THREE.PlaneGeometry(1, 1, 10, 10);
  }

  createMedias() {
    this.mediasElements = document.querySelectorAll('.demo-1__gallery__figure');
    this.medias = Array.from(this.mediasElements).map((element) => {
      const media = new Media({
        element,
        geometry: this.planeGeometry,
        gl: this.renderer,
        height: this.galleryHeight,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
      });

      return media;
    });
  }

  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = (this.start - y) * 2;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  onWheel(event) {
    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed * 0.5;
  }

  onResize() {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      height,
      width,
    };

    this.galleryBounds = this.gallery.getBoundingClientRect();
    this.galleryHeight = (this.viewport.height * this.galleryBounds.height) / this.screen.height;

    if (this.medias) {
      this.medias.forEach((media) => media.onResize({
        height: this.galleryHeight,
        screen: this.screen,
        viewport: this.viewport,
      }));
    }
  }

  update() {
    this.scroll.target += this.speed;

    this.scroll.current = this.lerp(this.scroll.current, this.scroll.target, this.scroll.ease);

    if (this.scroll.current > this.scroll.last) {
      this.direction = 'down';
      this.speed = 2;
    } else if (this.scroll.current < this.scroll.last) {
      this.direction = 'up';
      this.speed = -2;
    }

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, this.direction));
    }

    this.renderer.render(this.scene, this.camera);

    this.scroll.last = this.scroll.current;

    requestAnimationFrame(() => this.update());
  }

  addEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousewheel', (event) => this.onWheel(event));
    window.addEventListener('wheel', (event) => this.onWheel(event));

    window.addEventListener('mousedown', (event) => this.onTouchDown(event));
    window.addEventListener('mousemove', (event) => this.onTouchMove(event));
    window.addEventListener('mouseup', () => this.onTouchUp());

    window.addEventListener('touchstart', (event) => this.onTouchDown(event));
    window.addEventListener('touchmove', (event) => this.onTouchMove(event));
    window.addEventListener('touchend', () => this.onTouchUp());
  }

  lerp(start, end, t) {
    return (1 - t) * start + t * end;
  }
}

const app = new App();
