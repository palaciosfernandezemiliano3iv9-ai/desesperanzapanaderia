
document.addEventListener('DOMContentLoaded', () => {
  if (AppState.usuario) {
    window.location.href = 'index.html';
    return;
  }
  
  configurarFormularios();
});

function configurarFormularios() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginCard = document.querySelector('.login-card');
  const registerCard = document.getElementById('registerCard');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const showLoginBtn = document.getElementById('showLoginBtn');
  
  showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
  });
  
  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
  });
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.style.display = 'none';
    
    const result = await login(email, password);
    
    if (result.success) {
      mostrarToast('Bienvenido de vuelta!');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      errorMessage.textContent = result.error || 'Error al iniciar sesión';
      errorMessage.style.display = 'block';
    }
  });
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const errorMessage = document.getElementById('regErrorMessage');
    
    errorMessage.style.display = 'none';
    
    if (password.length < 6) {
      errorMessage.textContent = 'La contraseña debe tener al menos 6 caracteres';
      errorMessage.style.display = 'block';
      return;
    }
    
    const result = await registro(nombre, email, password);
    
    if (result.success) {
      mostrarToast('Cuenta creada exitosamente!');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      errorMessage.textContent = result.error || 'Error al crear la cuenta';
      errorMessage.style.display = 'block';
    }
  });
}
