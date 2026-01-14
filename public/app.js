
const AppState = {
  usuario: null,
  carrito: [],
  productos: []
};


document.addEventListener('DOMContentLoaded', () => {
  cargarEstadoLocal();
  actualizarUI();
  cargarProductosDestacados();
  configurarEventos();
});


function cargarEstadoLocal() {
  try {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      AppState.usuario = JSON.parse(usuario);
    }
    
    const carrito = localStorage.getItem('carrito');
    if (carrito) {
      AppState.carrito = JSON.parse(carrito);
    }
  } catch (error) {
    console.error('Error cargando estado local:', error);
  }
}


function guardarEstadoLocal() {
  try {
    if (AppState.usuario) {
      localStorage.setItem('usuario', JSON.stringify(AppState.usuario));
    } else {
      localStorage.removeItem('usuario');
    }
    localStorage.setItem('carrito', JSON.stringify(AppState.carrito));
  } catch (error) {
    console.error('Error guardando estado local:', error);
  }
}


function actualizarUI() {
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    const totalItems = AppState.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
  
  
  const userBtn = document.getElementById('userBtn');
  if (userBtn) {
    if (AppState.usuario) {
      userBtn.textContent = AppState.usuario.nombre;
      userBtn.href = '#';
      userBtn.onclick = (e) => {
        e.preventDefault();
        cerrarSesion();
      };
    } else {
      userBtn.textContent = 'Iniciar Sesión';
      userBtn.href = 'login.html';
      userBtn.onclick = null;
    }
  }
  
  // mostrar link de admin si es admin -bynd
  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    if (AppState.usuario && AppState.usuario.rol === 'admin') {
      adminLink.style.display = 'inline-block';
    } else {
      adminLink.style.display = 'none';
    }
  }
}

async function cargarProductosDestacados() {
  const grid = document.getElementById('featuredProductsGrid');
  if (!grid) return;
  
  try {
    const response = await fetch('/api/productos/destacados');
    const productos = await response.json();
    AppState.productos = productos;
    
    grid.innerHTML = productos.map(producto => crearProductoCard(producto)).join('');
    
  
    grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const producto = productos.find(p => p.id === id);
        if (producto) {
          agregarAlCarrito(producto);
        }
      });
    });
  } catch (error) {
    console.error('Error cargando productos:', error);
    grid.innerHTML = '<p>Error cargando productos. Intenta de nuevo.</p>';
  }
}


function crearProductoCard(producto) {
  const estrellas = '*'.repeat(Math.floor(producto.rating));
  
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        ${producto.badge ? `<span class="product-badge">${producto.badge}</span>` : ''}
        ${producto.descuento ? `<span class="product-discount">-${producto.descuento}%</span>` : ''}
      </div>
      <div class="product-info">
        <h3>${producto.nombre}</h3>
        <p class="description">${producto.descripcion}</p>
        <div class="product-rating">
          <span class="stars">${estrellas}</span>
          <span class="count">(${producto.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            ${producto.precioOriginal ? `<span class="original">$${parseFloat(producto.precioOriginal).toFixed(2)}</span>` : ''}
            <span class="current">$${parseFloat(producto.precio).toFixed(2)}</span>
          </div>
          <button class="add-to-cart-btn" data-id="${producto.id}">+</button>
        </div>
      </div>
    </div>
  `;
}

function agregarAlCarrito(producto, cantidad = 1) {
  const itemExistente = AppState.carrito.find(item => item.id === producto.id);
  
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    AppState.carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: cantidad
    });
  }
  
  guardarEstadoLocal();
  actualizarUI();
  mostrarToast(`${producto.nombre} agregado al carrito`);
}


function removerDelCarrito(productoId) {
  AppState.carrito = AppState.carrito.filter(item => item.id !== productoId);
  guardarEstadoLocal();
  actualizarUI();
}

function actualizarCantidad(productoId, nuevaCantidad) {
  if (nuevaCantidad <= 0) {
    removerDelCarrito(productoId);
    return;
  }
  
  const item = AppState.carrito.find(item => item.id === productoId);
  if (item) {
    item.cantidad = nuevaCantidad;
    guardarEstadoLocal();
    actualizarUI();
  }
}

function obtenerTotalCarrito() {
  return AppState.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (toast && toastMessage) {
    toastMessage.textContent = mensaje;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

function configurarEventos() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      mobileMenuBtn.innerHTML = mobileMenu.classList.contains('active') ? 'X' : '=';
    });
  }
}


async function login(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      AppState.usuario = data.usuario;
      guardarEstadoLocal();
      actualizarUI();
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

async function registro(nombre, email, password) {
  try {
    const response = await fetch('/api/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      AppState.usuario = data.usuario;
      guardarEstadoLocal();
      actualizarUI();
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return { success: false, error: 'Error de conexión' };
  }
}

function cerrarSesion() {
  AppState.usuario = null;
  guardarEstadoLocal();
  actualizarUI();
  mostrarToast('Sesión cerrada');
  
  if (window.location.pathname.includes('admin')) {
    window.location.href = 'index.html';
  }
}

function esAdmin() {
  return AppState.usuario && AppState.usuario.rol === 'admin';
}

window.AppState = AppState;
window.agregarAlCarrito = agregarAlCarrito;
window.removerDelCarrito = removerDelCarrito;
window.actualizarCantidad = actualizarCantidad;
window.obtenerTotalCarrito = obtenerTotalCarrito;
window.mostrarToast = mostrarToast;
window.login = login;
window.registro = registro;
window.cerrarSesion = cerrarSesion;
window.esAdmin = esAdmin;
window.cargarEstadoLocal = cargarEstadoLocal;
window.guardarEstadoLocal = guardarEstadoLocal;
window.actualizarUI = actualizarUI;
window.crearProductoCard = crearProductoCard;
