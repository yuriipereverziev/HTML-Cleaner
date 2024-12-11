// import "./helpers/postDate";
// import "./helpers/everad";



function main() {
  function extractStylesAndCleanHTML(html, cleanHTML, replaceCenterTags) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let styles = [];

    if (cleanHTML) {
      // Извлекаем все <style> теги
      styles.push(...Array.from(doc.querySelectorAll('style')).map(style => style.textContent));
      // Удаляем все <style> теги из документа
      doc.querySelectorAll('style').forEach(style => style.remove());

      // Извлекаем стили из атрибутов style=""
      doc.querySelectorAll('[style]').forEach(element => {
        styles.push(`${element.tagName.toLowerCase()} { ${element.getAttribute('style')} }`);
        element.removeAttribute('style');
      });
    }

    if (replaceCenterTags) {
      // Заменяем <center> на <div class="content-center">
      doc.querySelectorAll('center').forEach(center => {
        const div = document.createElement('div');
        div.innerHTML = center.innerHTML;
        div.className = center.className ? center.className + ' content-center' : 'content-center';
        center.replaceWith(div);
      });
    }

    // Преобразуем оставшийся документ в строку
    const cleanedHTML = doc.body.innerHTML;

    return { cleanedHTML, styles };
  }

  function processHTML() {
    const html = document.getElementById('inputHTML').value;
    const cleanHTML = document.getElementById('cleanHTML').checked;
    const replaceCenterTags = document.getElementById('replaceCenterTags').checked;

    const result = extractStylesAndCleanHTML(html, cleanHTML, replaceCenterTags);

    document.getElementById('cleanedHTMLContainer').style.display = 'none';
    document.getElementById('extractedStylesContainer').style.display = 'none';

    if (cleanHTML) {
      document.getElementById('cleanedHTML').textContent = result.cleanedHTML;
      document.getElementById('cleanedHTMLContainer').style.display = 'block';
      document.getElementById('extractedStyles').textContent = result.styles.join('\n');
      document.getElementById('extractedStylesContainer').style.display = 'block';
    }
  }

  function copyToClipboard(elementId) {
    const textToCopy = document.getElementById(elementId).textContent;
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Скопировано!');
  }
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
