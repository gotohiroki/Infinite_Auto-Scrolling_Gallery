import {
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  Clock,
  MathUtils,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import NormalizeWheel from "normalize-wheel";
import GUI from "lil-gui";
import Media from "./commponets/Media";

export default class webGL {
  
  constructor(containerSelector) {
    // canvasタグが配置されるコンテナを取得
    this.container = document.querySelector(containerSelector);
    
    this.renderParam = {
      clearColor: 0xffffff,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.cameraParam = {
      fov: 45,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 100,
      fovRad: null,
      dist: null,
      lookAt: new Vector3(0, 0, 0),
      x: 0,
      y: 0,
      z: 5,
    };

    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0
    };

    this.speed = 2;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new Clock();

    this._setScene();
    this._setRender();
    this._setCamera();

    this.load();
  }

  load() {
    const images = [...document.querySelectorAll('.demo-1__gallery img')];
    const texturePromises = images.map((img) => new TextureLoader().load(img.src));

    Promise.all(texturePromises).then((textures) => {
      this.textures = textures;
      document.querySelector('html').classList.add('loaded');
      this.init();
    })
  }

  init() {
    // this._setGui();
    // this._setContorols();
    this._createGallery();

    this.onResize();

    this._createGeometry();
    this._createMedias();

    this.update();

    this.addEventListeners();
  }

  _createGallery() {
    this.gallery = document.querySelector('.demo-1__gallery');
  }

  _setScene() {
    this.scene = new Scene();
  }

  _setRender() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      transparent: true,
      alpha: true,
    });
    // this.renderer.setClearColor(new Color(this.renderParam.clearColor));
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);
    this.container.appendChild(this.renderer.domElement);
  }

  _setCamera() {
    this.camera = new PerspectiveCamera(
      this.cameraParam.fov, 
      this.cameraParam.aspect, 
      this.cameraParam.near, 
      this.cameraParam.far
    );
    this.camera.position.set(
      this.cameraParam.x,
      this.cameraParam.y,
      this.cameraParam.z
    );
  }

  _setGui() {
    let that = this;
    this.settings = {
      progress: 0,
    }
    this.gui = new GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01);
    // this.gui.add(this)
  }

  _setContorols() {
    this.contorols = new OrbitControls(this.camera, this.renderer.domElement);
  }

  _createGeometry() {
    this.planeGeometry = new PlaneGeometry();
  }

  _createMedias() {
    this.mediasElements = [...document.querySelectorAll('.demo-1__gallery__figure')];

    this.medias = this.mediasElements.map((element, index) => 
      new Media({
        element,
        texture: this.textures[index],
        geometry: this.planeGeometry,
        gl: this.renderer,
        height: this.galleryHeight,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport
      })
    );
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWheel(event) {
    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target -= speed * 0.5;
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

  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      width,
      height
    };

    this._render();

    this.galleryBounds = this.gallery.getBoundingClientRect();
    this.galleryHeight = (this.viewport.height * this.galleryBounds.height) / this.screen.height;

    if(this.medias) {
      this.medias.forEach((media) => media.onResize({
        height: this.galleryHeight,
        screen: this.screen,
        viewport: this.viewport
      }));
    }
  }

  update() {
    this._render();

    this.scroll.target += this.speed;

    this.scroll.current = MathUtils.lerp(
      this.scroll.current, 
      this.scroll.target, 
      this.scroll.ease
    );

    if (this.scroll.current > this.scroll.last) {
      this.direction = 'down';
      this.speed = 2;
    } else if (this.scroll.current < this.scroll.last) {
      this.direction = 'up';
      this.speed = -2;
    }

    // if (this.scroll.current < this.scroll.last) {
    //   this.direction = 'up';
    //   this.speed = 2;
    // } else if (this.scroll.current > this.scroll.last) {
    //   this.direction = 'down';
    //   this.speed = -2;
    // }

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, this.direction));
    }

    this.scroll.last = this.scroll.current;

    requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    
    window.addEventListener('mousewheel', this.onWheel.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this));

    window.addEventListener('mousedown', this.onTouchDown.bind(this));
    window.addEventListener('mousemove', this.onTouchMove.bind(this));
    window.addEventListener('mouseup', this.onTouchUp.bind(this));

    window.addEventListener('touchstart', this.onTouchDown.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));
  }
}
