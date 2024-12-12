(function () {
  'use strict';

  function app () {
    document.addEventListener('DOMContentLoaded', function () {
      var processButton = document.getElementById('processButton');
      var copyButtons = document.querySelectorAll('.copy-btn');
      processButton.addEventListener('click', processHTML);
      copyButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          var targetId = event.target.getAttribute('data-copy-target');
          copyToClipboard(targetId, event.target);
        });
      });
    });
    function extractStylesAndCleanHTML(html, cleanHTML, replaceCenterTags) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var styles = [];
      var inlineStyleCounter = 1;
      if (cleanHTML) {
        // Extract and remove <style> tags
        styles = Array.from(doc.querySelectorAll('style')).map(function (style) {
          return style.textContent;
        });
        doc.querySelectorAll('style').forEach(function (style) {
          return style.remove();
        });

        // Process inline styles
        doc.querySelectorAll('[style]').forEach(function (element) {
          var inlineStyle = element.getAttribute('style');
          if (inlineStyle) {
            var className = "inl_".concat(inlineStyleCounter++);
            styles.push(".".concat(className, " { ").concat(inlineStyle, " }"));
            element.removeAttribute('style');
            element.classList.add(className);
          }
        });
      }
      if (replaceCenterTags) {
        // Replace <center> with <div class="content-center">
        doc.querySelectorAll('center').forEach(function (center) {
          var div = document.createElement('div');
          div.innerHTML = center.innerHTML;
          div.className = center.className ? center.className + ' content-center' : 'content-center';
          center.replaceWith(div);
        });
      }

      // Convert the remaining document to a string
      var cleanedHTML = doc.body.innerHTML;
      return {
        cleanedHTML: cleanedHTML,
        styles: styles
      };
    }
    function processHTML() {
      var html = document.getElementById('inputHTML').value;
      var cleanHTML = document.getElementById('cleanHTML').checked;
      var replaceCenterTags = document.getElementById('replaceCenterTags').checked;
      var result = extractStylesAndCleanHTML(html, cleanHTML, replaceCenterTags);
      document.getElementById('cleanedHTMLContainer').style.display = 'none';
      document.getElementById('extractedStylesContainer').style.display = 'none';
      if (cleanHTML) {
        document.getElementById('cleanedHTML').textContent = result.cleanedHTML;
        document.getElementById('cleanedHTMLContainer').style.display = 'block';
        document.getElementById('extractedStyles').textContent = result.styles.join('\n');
        document.getElementById('extractedStylesContainer').style.display = 'block';
      }
    }
    function copyToClipboard(elementId, button) {
      var textToCopy = document.getElementById(elementId).textContent;
      var tempInput = document.createElement('textarea');
      tempInput.value = textToCopy;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      // Change button text temporarily
      var originalText = button.textContent;
      button.textContent = 'Скопировано!';
      setTimeout(function () {
        button.textContent = originalText;
      }, 2000);
    }
  }

  // import "./helpers/postDate";
  function main() {
    app();
  }
  if (document.documentElement.clientWidth < 480) {
    window.addEventListener("scroll", function () {
      setTimeout(main, 1000);
    }, {
      once: true,
      passive: true
    });
  } else {
    main();
  }

}());
//# sourceMappingURL=main.js.map
