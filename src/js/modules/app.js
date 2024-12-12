export default function () {

  document.addEventListener('DOMContentLoaded', () => {
    const processButton = document.getElementById('processButton');
    const copyButtons = document.querySelectorAll('.copy-btn');

    processButton.addEventListener('click', processHTML);

    copyButtons.forEach(button => {
      button.addEventListener('click', event => {
        const targetId = event.target.getAttribute('data-copy-target');
        copyToClipboard(targetId, event.target);
      });
    });
  });

  function extractStylesAndCleanHTML(html, cleanHTML, replaceCenterTags) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    let styles = [];
    let inlineStyleCounter = 1;

    if (cleanHTML) {
      // Extract and remove <style> tags
      styles = Array.from(doc.querySelectorAll('style')).map(style => style.textContent);
      doc.querySelectorAll('style').forEach(style => style.remove());

      // Process inline styles
      doc.querySelectorAll('[style]').forEach(element => {
        const inlineStyle = element.getAttribute('style');
        if (inlineStyle) {
          const className = `inl_${inlineStyleCounter++}`;
          styles.push(`.${className} { ${inlineStyle} }`);
          element.removeAttribute('style');
          element.classList.add(className);
        }
      });
    }

    if (replaceCenterTags) {
      // Replace <center> with <div class="content-center">
      doc.querySelectorAll('center').forEach(center => {
        const div = document.createElement('div');
        div.innerHTML = center.innerHTML;
        div.className = center.className ? center.className + ' content-center' : 'content-center';
        center.replaceWith(div);
      });
    }

    // Convert the remaining document to a string
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

  function copyToClipboard(elementId, button) {
    const textToCopy = document.getElementById(elementId).textContent;
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Change button text temporarily
    const originalText = button.textContent;
    button.textContent = 'Скопировано!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }

}
