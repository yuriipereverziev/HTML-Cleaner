// import "./helpers/postDate";
// import "./helpers/everad";

import app from "./modules/app";

function main() {
  app()
}

if (document.documentElement.clientWidth < 480) {
  window.addEventListener("scroll", function () {
    setTimeout(main, 1000);
  }, {
    once: true,
    passive: true,
  });
} else {
  main();
}
