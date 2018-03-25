import './index.css';
// import 'babel-polyfill';
// import 'whatwg-fetch';

function handleLoginSwitchButton() {
  document.forms['auth'].action = '/login';
  document.getElementById('submit').innerText = 'LOGIN';
}

function handleRegisterSwitchButton() {
  document.forms['auth'].action = '/register';
  document.getElementById('submit').innerText = 'REGISTER';
}
document.getElementById('register-switch').onclick = handleRegisterSwitchButton;
document.getElementById('login-switch').onclick = handleLoginSwitchButton;
