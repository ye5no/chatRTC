function defaultResult() {
  switch (this.status) {
    case 200:
      window.location.reload();
      break;
    default:
      window.alert('Ошибка ' + this.responseText);
  }
}

export default (but) => {
  let xhr = new window.XMLHttpRequest();
  let sending;
  switch (but.getAttribute('data-auth')) {
    case 'signUp':
      sending = {
        email: document.getElementById('inpEmail').value,
        password: document.getElementById('inpPass').value,
      };
      xhr.open('POST', '/api/auth/reg');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(sending));
      break;
    case 'logIn':
      sending = {
        email: document.getElementById('inpEmail').value,
        password: document.getElementById('inpPass').value,
      };
      xhr.open('POST', '/api/auth/login');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(sending));
      break;
    case 'logOut':
      xhr.open('GET', '/api/auth/logout');
      xhr.send();
      break;
  }
  xhr.onload = defaultResult;
};
