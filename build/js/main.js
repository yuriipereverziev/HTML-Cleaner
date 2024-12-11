(function () {
  'use strict';

  // import "./helpers/postDate";
  // import "./helpers/everad";

  function main() {
  }
  if (document.documentElement.clientWidth < 480) {
    window.addEventListener("scroll", function () {
      setTimeout(main, 1000);
    }, {
      once: true,
      passive: true
    });
  }

}());
//# sourceMappingURL=main.js.map
