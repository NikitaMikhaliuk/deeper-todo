import './index.css';
// import 'babel-polyfill';
// import 'whatwg-fetch';

function handleLoginSwitchButton(evt) {
    document.forms['auth'].action = '/login';
    document.getElementById('submit').innerText = 'LOGIN';
    document
        .getElementById('register-switch')
        .classList.remove('button-focused');
    evt.target.classList.add('button-focused');
}

function handleRegisterSwitchButton(evt) {
    document.forms['auth'].action = '/register';
    document.getElementById('submit').innerText = 'REGISTER';
    document.getElementById('login-switch').classList.remove('button-focused');
    evt.target.classList.add('button-focused');
}

function handleAuthFormSubmit(evt) {
    evt.preventDefault();
    const authForm = evt.target;
    const options = {
        method: 'POST',
        headers: new Headers({
            'Content-type': 'application/x-www-form-urlencoded',
        }),
        body: `login=${encodeURIComponent(
            authForm.elements.login.value
        )}&password=${encodeURIComponent(authForm.elements.password.value)}`,
        credentials: 'include',
        redirect: 'follow',
    };
    fetch(authForm.action, options)
        .then((res) => {
            if (res.status === 200) {
                return res.json();
            }
            console.log(res.statusText);
            if (res.status === 401) {
                authForm.elements.login.classList.add('input-incorrect');
                authForm.elements.password.classList.add('input-incorrect');
                document
                    .getElementById('login')
                    .classList.add('input-incorrect-warning');
                document
                    .getElementById('password')
                    .classList.add('input-incorrect-warning');
            }
        })
        .then((res) => {
            if (res) {
                window.location.assign(window.location.origin + res.redirect);
            }
        });
}
document.getElementById('register-switch').onclick = handleRegisterSwitchButton;
document.getElementById('login-switch').onclick = handleLoginSwitchButton;
document.forms['auth'].onsubmit = handleAuthFormSubmit;
