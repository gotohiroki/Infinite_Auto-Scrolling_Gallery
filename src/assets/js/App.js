import webGL from "./webgl";
import imagesLoaded from "imagesloaded";
import "../scss/app.scss";

const preloadImages = () => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll('img'), resolve);
  });
};


preloadImages().then(() => {
  new webGL("#webgl");
});