const dialog = document.querySelector('#signin-dialog');
const triggers = document.querySelectorAll('[data-signin]');
const closeButton = dialog.querySelector('.close');

triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => dialog.showModal());
});

closeButton.addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
