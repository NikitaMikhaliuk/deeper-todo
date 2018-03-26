import './index.css';
// import 'babel-polyfill';
// import 'whatwg-fetch';

function handleLoginSwitchButton(evt) {
  document.forms['auth'].action = '/login';
  document.getElementById('submit').innerText = 'LOGIN';
  document.getElementById('register-switch').classList.remove('button-focused');
  evt.target.classList.add('button-focused');
}

function handleRegisterSwitchButton(evt) {
  document.forms['auth'].action = '/register';
  document.getElementById('submit').innerText = 'REGISTER';
  document.getElementById('login-switch').classList.remove('button-focused');
  evt.target.classList.add('button-focused');
}
document.getElementById('register-switch').onclick = handleRegisterSwitchButton;
document.getElementById('login-switch').onclick = handleLoginSwitchButton;
