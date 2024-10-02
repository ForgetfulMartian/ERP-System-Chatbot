// client/script.js

const appDiv = document.getElementById('app');
let token = '';
let role = '';

// Render the appropriate view
const render = () => {
    appDiv.innerHTML = '';
    if (!token) {
        appDiv.innerHTML = `
            <h1>User Authentication</h1>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
                <button type="button" id="registerButton">Register</button>
            </form>
        `;
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        document.getElementById('registerButton').addEventListener('click', () => {
            window.location.href = 'register.html';
        });
    } else {
        appDiv.innerHTML = `
            <h1>Welcome ${role}</h1>
            <form id="dataForm">
                <input type="text" id="content" placeholder="Enter Data" required>
                <button type="submit">Submit Data</button>
            </form>
            <ul id="dataList"></ul>
        `;
        document.getElementById('dataForm').addEventListener('submit', handleDataSubmission);
        fetchData();
    }
};

// Handle login
const handleLogin = async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        token = data.token;
        role = data.role;
        render();
    } else {
        alert('Login failed!');
    }
};

// Handle registration
const handleRegister = async (username, password, role) => {
    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
    });

    if (response.ok) {
        alert('Registration successful! Please log in.');
        window.location.href = 'index.html'; // Redirect to the login page
    } else {
        alert('Registration failed!');
    }
};

// Handle registration form
const renderRegister = () => {
    appDiv.innerHTML = `
        <h1>Register</h1>
        <form id="registerForm">
            <input type="text" id="regUsername" placeholder="Username" required>
            <input type="password" id="regPassword" placeholder="Password" required>
            <select id="regRole">
                <option value="dataEntry">Data Entry</option>
                <option value="validator">Validator</option>
                <option value="approver">Approver</option>
            </select>
            <button type="submit">Register</button>
        </form>
    `;
    document.getElementById('registerForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        handleRegister(username, password, role);
    });
};

// Check if on registration page
if (window.location.pathname.endsWith('register.html')) {
    renderRegister();
} else {
    render();
}
