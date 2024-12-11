export default () => {
  // $(document).on(`click`, `a[href^="#"]`, function (event) {
  //   event.preventDefault();

  //   $(`html, body`).animate({
  //     scrollTop: $($.attr(this, `href`)).offset().top 
  //   }, 500);
  // });

  const menu = document.querySelector('.menu');
  let menuHeight = 0;
  menu ? menuHeight = menu.clientHeight + menu.offsetTop : menuHeight = 0;
  
  const links = document.querySelectorAll('[href^="#"]');
  links.forEach(link => link.addEventListener('click', handleLink))

  function handleLink(event) {
    event.preventDefault();
    const {
      target
    } = event;

    const elem = document.querySelector(target.getAttribute('href'));
    console.log(elem);
    window.scrollTo({
      top: elem.getBoundingClientRect().top + window.scrollY - menuHeight,
      behavior: "smooth"
    });
  }
};
