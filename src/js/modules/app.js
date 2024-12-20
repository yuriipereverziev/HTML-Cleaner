export default function () {

  document.addEventListener('DOMContentLoaded', () => {
    const processButton = document.getElementById('processButton');
    const clearButton = document.getElementById('clearButton');
    const copyButtons = document.querySelectorAll('.copy-btn');

    processButton.addEventListener('click', processHTML);
    clearButton.addEventListener('click', clearFields);

    copyButtons.forEach(button => {
      button.addEventListener('click', event => {
        const targetId = event.target.dataset.copyTarget;
        copyToClipboard(targetId, event.target);
      });
    });
  });

  function processHTML() {
    const input = document.getElementById('inputHTML').value.trim();

    // Если поле пустое, ничего не делаем
    if (input === "") {
      return;
    }

    // Считываем значения чекбоксов
    const options = {
      cleanHTML: document.getElementById('cleanHTML').checked,
      replaceCenterTags: document.getElementById('replaceCenterTags').checked,
      removeEmptyTags: document.getElementById('removeEmptyTags').checked,
      shouldGroupStyles: document.getElementById('groupStyles').checked,
      omitBodyTag: document.getElementById('omitBodyTag').checked,
    };

    // Если выбран только "Не публиковать body", не делаем обработку
    if (options.omitBodyTag && !options.cleanHTML && !options.replaceCenterTags && !options.removeEmptyTags && !options.shouldGroupStyles) {
      return;
    }

    // Скрываем контейнеры с результатами до обработки
    document.getElementById('cleanedHTMLContainer').style.display = 'none';
    document.getElementById('extractedStylesContainer').style.display = 'none';

    // Проверяем, является ли введенный текст CSS или HTML
    const isCSS = checkIfCSS(input);
    const isHTML = input.startsWith('<');

    // Если выбран чекбокс для извлечения стилей или очистки HTML
    if (options.cleanHTML || options.removeEmptyTags || options.replaceCenterTags || options.omitBodyTag) {
      // Если только CSS
      if (isCSS && !isHTML) {
        if (options.shouldGroupStyles) {
          const groupedCSS = groupCSS(input);
          displayResult({ styles: groupedCSS });
        } else {
          displayResult({ styles: input });
        }
      }
      // Если только HTML
      else if (isHTML && !isCSS) {
        const result = extractStylesAndCleanHTML(input, options);
        displayResult(result);
      }
      // Если и HTML и CSS
      else {
        const result = extractStylesAndCleanHTML(input, options);
        const groupedCSS = options.shouldGroupStyles ? groupCSS(input) : input; // Группируем только если стоит чекбокс
        displayResult({
          cleanedHTML: result.cleanedHTML,
          styles: groupedCSS,
        });
      }
    }
  }

  function checkIfCSS(text) {
    return /^\s*[.#a-zA-Z][^{]+\{[^}]*\}\s*$/m.test(text);
  }

  function groupCSS(cssText) {
    let styles = new Map();
    parseAndAddStyles(styles, cssText);
    return formatStyles(styles);
  }

  function extractStylesAndCleanHTML(html, options) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let styles = new Map();
    let inlineStyleCounter = 1;

    // 1. Извлекаем стили из тега <style> в HTML
    if (options.cleanHTML) {
      doc.querySelectorAll('style').forEach(style => {
        parseAndAddStyles(styles, style.textContent);
        style.remove();
      });

      // 2. Обрабатываем inline стили, если выбран чекбокс "cleanHTML"
      doc.querySelectorAll('[style]').forEach(element => {
        const inlineStyle = element.getAttribute('style');
        if (inlineStyle) {
          const className = `inl_${inlineStyleCounter++}`;
          addStyle(styles, `.${className}`, inlineStyle);
          element.removeAttribute('style');
          element.classList.add(className);
        }
      });
    }

    // 3. Убираем пустые теги, если выбран чекбокс "removeEmptyTags"
    if (options.removeEmptyTags) removeEmptyTags(doc);

    // 4. Меняем теги <center> на <div>, если выбран чекбокс "replaceCenterTags"
    if (options.replaceCenterTags) replaceCenterTags(doc);

    let cleanedHTML = options.omitBodyTag
      ? doc.body.innerHTML.trim()
      : new XMLSerializer().serializeToString(doc.body);

    const finalStyles = formatStyles(styles);

    return { cleanedHTML, styles: finalStyles };
  }

  function parseAndAddStyles(styles, cssText) {
    const rules = cssText.match(/[^{]+{[^}]*}/g) || [];

    rules.forEach(rule => {
      const match = rule.match(/(.*?)\s*{\s*([^}]*)\s*}/);
      if (match) {
        const selector = match[1].trim();
        const properties = match[2].trim();
        addStyle(styles, selector, properties);
      }
    });
  }

  function addStyle(styles, selector, properties) {
    const normalizedProps = properties
      .split(';')
      .map(prop => prop.trim())
      .filter(Boolean)
      .sort()
      .join('; ');

    if (styles.has(normalizedProps)) {
      const existingSelectors = styles.get(normalizedProps);
      styles.set(normalizedProps, `${existingSelectors}, ${selector}`);
    } else {
      styles.set(normalizedProps, selector);
    }
  }

  function formatStyles(styles) {
    return Array.from(styles.entries()).map(
      ([properties, selectors]) => `${selectors} { ${properties}; }`
    );
  }

  function removeEmptyTags(doc) {
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'source'];

    doc.querySelectorAll('*').forEach(element => {
      const tagName = element.tagName.toLowerCase();
      const isSelfClosing = selfClosingTags.includes(tagName);
      const isEmpty = !element.textContent.trim() && element.children.length === 0;
      const isInvalidImage = tagName === 'img' && !element.getAttribute('src');
      const isEmptyParagraphWithBr =
        tagName === 'p' &&
        element.children.length === 1 &&
        element.firstElementChild.tagName.toLowerCase() === 'br';

      if (!isSelfClosing && (isEmpty || isInvalidImage || isEmptyParagraphWithBr)) {
        element.remove();
      }
    });
  }

  function replaceCenterTags(doc) {
    doc.querySelectorAll('center').forEach(center => {
      const div = document.createElement('div');
      div.innerHTML = center.innerHTML;
      div.className = center.className ? `${center.className} content-center` : 'content-center';
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
    const textToCopy = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Скопировано!';
      setTimeout(() => {
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
