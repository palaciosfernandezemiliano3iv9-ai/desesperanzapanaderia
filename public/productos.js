
let todosLosProductos = [];
let productosFiltrados = [];

let filtros = {
  busqueda: '',
  categoria: 'all',
  tema: 'all',
  precioMax: 1000,
  ordenar: 'destacados'
};

document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  configurarFiltros();
});

async function cargarProductos() {
  const grid = document.getElementById('productsGrid');
  
  try {
    const response = await fetch('/api/productos');
    todosLosProductos = await response.json();
    productosFiltrados = [...todosLosProductos];
    
    aplicarFiltros();
  } catch (error) {
    console.error('Error cargando productos:', error);
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error cargando productos. Intenta de nuevo.</p>';
  }
}

function configurarFiltros() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    filtros.busqueda = e.target.value.toLowerCase();
    aplicarFiltros();
  });
  
  const sortSelect = document.getElementById('sortSelect');
  sortSelect.addEventListener('change', (e) => {
    filtros.ordenar = e.target.value;
    aplicarFiltros();
  });
  
  document.querySelectorAll('input[name="categoria"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      filtros.categoria = e.target.value;
      aplicarFiltros();
    });
  });
  
  document.querySelectorAll('input[name="tema"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      filtros.tema = e.target.value;
      aplicarFiltros();
    });
  });
  
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  priceRange.addEventListener('input', (e) => {
    filtros.precioMax = parseInt(e.target.value);
    priceValue.textContent = filtros.precioMax;
    aplicarFiltros();
  });
  
  const clearBtn = document.getElementById('clearFiltersBtn');
  clearBtn.addEventListener('click', limpiarFiltros);
}

function aplicarFiltros() {
  productosFiltrados = todosLosProductos.filter(producto => {
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda;
      const nombreMatch = producto.nombre.toLowerCase().includes(busqueda);
      const descripcionMatch = producto.descripcion.toLowerCase().includes(busqueda);
      if (!nombreMatch && !descripcionMatch) return false;
    }
    
    if (filtros.categoria !== 'all' && producto.categoria !== filtros.categoria) {
      return false;
    }
    
    if (filtros.tema !== 'all' && producto.tema !== filtros.tema) {
      return false;
    }
    
    if (producto.precio > filtros.precioMax) {
      return false;
    }
    
    return true;
  });
  
  switch (filtros.ordenar) {
    case 'precio-menor':
      productosFiltrados.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-mayor':
      productosFiltrados.sort((a, b) => b.precio - a.precio);
      break;
    case 'recientes':
      productosFiltrados.sort((a, b) => b.id - a.id);
      break;
    case 'destacados':
    default:
      productosFiltrados.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
      break;
  }
  
  renderizarProductos();
}

function renderizarProductos() {
  const grid = document.getElementById('productsGrid');
  const resultCount = document.getElementById('resultCount');
  
  resultCount.textContent = productosFiltrados.length;
  
  if (productosFiltrados.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem; color: var(--color-muted);">?</div>
        <h2>No se encontraron productos</h2>
        <p style="color: var(--color-muted); margin-bottom: 1.5rem;">Intenta ajustar tus filtros o búsqueda</p>
        <button onclick="limpiarFiltros()" class="btn-primary">Limpiar Filtros</button>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = productosFiltrados.map(producto => crearProductoCard(producto)).join('');
  
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const producto = productosFiltrados.find(p => p.id === id);
      if (producto) {
        agregarAlCarrito(producto);
      }
    });
  });
}

function limpiarFiltros() {
  filtros = {
    busqueda: '',
    categoria: 'all',
    tema: 'all',
    precioMax: 1000,
    ordenar: 'destacados'
  };
  
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value = 'destacados';
  document.getElementById('cat-all').checked = true;
  document.getElementById('tema-all').checked = true;
  document.getElementById('priceRange').value = 1000;
  document.getElementById('priceValue').textContent = '1000';
  
  aplicarFiltros();
}

window.limpiarFiltros = limpiarFiltros;
