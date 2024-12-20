(function () {
  'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  function app () {
    document.addEventListener('DOMContentLoaded', function () {
      var processButton = document.getElementById('processButton');
      var clearButton = document.getElementById('clearButton');
      var copyButtons = document.querySelectorAll('.copy-btn');
      processButton.addEventListener('click', processHTML);
      clearButton.addEventListener('click', clearFields);
      copyButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          var targetId = event.target.dataset.copyTarget;
          copyToClipboard(targetId, event.target);
        });
      });
    });
    function processHTML() {
      var input = document.getElementById('inputHTML').value.trim();

      // Если поле пустое, ничего не делаем
      if (input === "") {
        return;
      }

      // Считываем значения чекбоксов
      var options = {
        cleanHTML: document.getElementById('cleanHTML').checked,
        replaceCenterTags: document.getElementById('replaceCenterTags').checked,
        removeEmptyTags: document.getElementById('removeEmptyTags').checked,
        shouldGroupStyles: document.getElementById('groupStyles').checked,
        omitBodyTag: document.getElementById('omitBodyTag').checked
      };

      // Если выбран только "Не публиковать body", не делаем обработку
      if (options.omitBodyTag && !options.cleanHTML && !options.replaceCenterTags && !options.removeEmptyTags && !options.shouldGroupStyles) {
        return;
      }

      // Скрываем контейнеры с результатами до обработки
      document.getElementById('cleanedHTMLContainer').style.display = 'none';
      document.getElementById('extractedStylesContainer').style.display = 'none';

      // Проверяем, является ли введенный текст CSS или HTML
      var isCSS = checkIfCSS(input);
      var isHTML = input.startsWith('<');

      // Если выбран чекбокс для извлечения стилей или очистки HTML
      if (options.cleanHTML || options.removeEmptyTags || options.replaceCenterTags || options.omitBodyTag) {
        // Если только CSS
        if (isCSS && !isHTML) {
          if (options.shouldGroupStyles) {
            var groupedCSS = groupCSS(input);
            displayResult({
              styles: groupedCSS
            });
          } else {
            displayResult({
              styles: input
            });
          }
        }
        // Если только HTML
        else if (isHTML && !isCSS) {
          var result = extractStylesAndCleanHTML(input, options);
          displayResult(result);
        }
        // Если и HTML и CSS
        else {
          var _result = extractStylesAndCleanHTML(input, options);
          var _groupedCSS = options.shouldGroupStyles ? groupCSS(input) : input; // Группируем только если стоит чекбокс
          displayResult({
            cleanedHTML: _result.cleanedHTML,
            styles: _groupedCSS
          });
        }
      }
    }
    function checkIfCSS(text) {
      return /^\s*[.#a-zA-Z][^{]+\{[^}]*\}\s*$/m.test(text);
    }
    function groupCSS(cssText) {
      var styles = new Map();
      parseAndAddStyles(styles, cssText);
      return formatStyles(styles);
    }
    function extractStylesAndCleanHTML(html, options) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var styles = new Map();
      var inlineStyleCounter = 1;

      // 1. Извлекаем стили из тега <style> в HTML
      if (options.cleanHTML) {
        doc.querySelectorAll('style').forEach(function (style) {
          parseAndAddStyles(styles, style.textContent);
          style.remove();
        });

        // 2. Обрабатываем inline стили, если выбран чекбокс "cleanHTML"
        doc.querySelectorAll('[style]').forEach(function (element) {
          var inlineStyle = element.getAttribute('style');
          if (inlineStyle) {
            var className = "inl_".concat(inlineStyleCounter++);
            addStyle(styles, ".".concat(className), inlineStyle);
            element.removeAttribute('style');
            element.classList.add(className);
          }
        });
      }

      // 3. Убираем пустые теги, если выбран чекбокс "removeEmptyTags"
      if (options.removeEmptyTags) removeEmptyTags(doc);

      // 4. Меняем теги <center> на <div>, если выбран чекбокс "replaceCenterTags"
      if (options.replaceCenterTags) replaceCenterTags(doc);
      var cleanedHTML = options.omitBodyTag ? doc.body.innerHTML.trim() : new XMLSerializer().serializeToString(doc.body);
      var finalStyles = formatStyles(styles);
      return {
        cleanedHTML: cleanedHTML,
        styles: finalStyles
      };
    }
    function parseAndAddStyles(styles, cssText) {
      var rules = cssText.match(/[^{]+{[^}]*}/g) || [];
      rules.forEach(function (rule) {
        var match = rule.match(/(.*?)\s*{\s*([^}]*)\s*}/);
        if (match) {
          var selector = match[1].trim();
          var properties = match[2].trim();
          addStyle(styles, selector, properties);
        }
      });
    }
    function addStyle(styles, selector, properties) {
      var normalizedProps = properties.split(';').map(function (prop) {
        return prop.trim();
      }).filter(Boolean).sort().join('; ');
      if (styles.has(normalizedProps)) {
        var existingSelectors = styles.get(normalizedProps);
        styles.set(normalizedProps, "".concat(existingSelectors, ", ").concat(selector));
      } else {
        styles.set(normalizedProps, selector);
      }
    }
    function formatStyles(styles) {
      return Array.from(styles.entries()).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          properties = _ref2[0],
          selectors = _ref2[1];
        return "".concat(selectors, " { ").concat(properties, "; }");
      });
    }
    function removeEmptyTags(doc) {
      var selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'source'];
      doc.querySelectorAll('*').forEach(function (element) {
        var tagName = element.tagName.toLowerCase();
        var isSelfClosing = selfClosingTags.includes(tagName);
        var isEmpty = !element.textContent.trim() && element.children.length === 0;
        var isInvalidImage = tagName === 'img' && !element.getAttribute('src');
        var isEmptyParagraphWithBr = tagName === 'p' && element.children.length === 1 && element.firstElementChild.tagName.toLowerCase() === 'br';
        if (!isSelfClosing && (isEmpty || isInvalidImage || isEmptyParagraphWithBr)) {
          element.remove();
        }
      });
    }
    function replaceCenterTags(doc) {
      doc.querySelectorAll('center').forEach(function (center) {
        var div = document.createElement('div');
        div.innerHTML = center.innerHTML;
        div.className = center.className ? "".concat(center.className, " content-center") : 'content-center';
        center.replaceWith(div);
      });
    }
    function displayResult(result) {
      // Проверка, если ничего не нужно отображать
      if (!result.cleanedHTML && !result.styles) {
        return;
      }

      // Показываем только те блоки, которые имеют данные
      document.getElementById('cleanedHTMLContainer').style.display = result.cleanedHTML ? 'block' : 'none';
      document.getElementById('extractedStylesContainer').style.display = result.styles && result.styles.length > 0 ? 'block' : 'none';
      if (result.cleanedHTML) {
        document.getElementById('cleanedHTML').textContent = result.cleanedHTML;
      }
      if (result.styles && result.styles.length > 0) {
        document.getElementById('extractedStyles').textContent = result.styles.join('\n');
      }
    }
    function copyToClipboard(elementId, button) {
      var textToCopy = document.getElementById(elementId).textContent;
      navigator.clipboard.writeText(textToCopy).then(function () {
        var originalText = button.textContent;
        button.textContent = 'Скопировано!';
        setTimeout(function () {
          button.textContent = originalText;
        }, 2000);
      });
    }
    function clearFields() {
      // Очищаем все поля ввода
      document.getElementById('inputHTML').value = '';
      document.getElementById('cleanHTML').checked = false;
      document.getElementById('replaceCenterTags').checked = false;
      document.getElementById('removeEmptyTags').checked = false;
      document.getElementById('groupStyles').checked = false;
      document.getElementById('omitBodyTag').checked = false;

      // Скрываем блоки с результатами
      document.getElementById('cleanedHTMLContainer').style.display = 'none';
      document.getElementById('extractedStylesContainer').style.display = 'none';

      // Очистить текст внутри блоков с результатами
      document.getElementById('cleanedHTML').textContent = '';
      document.getElementById('extractedStyles').textContent = '';
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
