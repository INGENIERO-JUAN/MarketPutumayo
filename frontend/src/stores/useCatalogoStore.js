import { create } from 'zustand';
import API from '../api/axios';

/**
 * useCatalogoStore — gestión de productos y carrito
 * Reemplaza estado local de Catalogo.jsx y Carrito.jsx
 */
const useCatalogoStore = create((set, get) => ({
  // ── Estado ───────────────────────────────────────────────────────
  productos: [],
  categorias: [],
  carrito: JSON.parse(localStorage.getItem('carrito') || '[]'),
  cargando: false,
  cargandoCategorias: false,
  error: null,

  // ── Acciones de productos ─────────────────────────────────────────
  fetchProductos: async () => {
    set({ cargando: true, error: null });
    try {
      const { data } = await API.get('/productos');
      set({ productos: data, cargando: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Error al cargar productos', cargando: false });
    }
  },

  fetchCategorias: async () => {
    set({ cargandoCategorias: true });
    try {
      const { data } = await API.get('/categorias');
      set({ categorias: data, cargandoCategorias: false });
    } catch {
      set({ cargandoCategorias: false });
    }
  },

  // ── Acciones de carrito ───────────────────────────────────────────
  agregarAlCarrito: (producto) => {
    const carrito = [...get().carrito];
    const existe = carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    set({ carrito });
  },

  quitarDelCarrito: (id_producto) => {
    const carrito = get().carrito.filter(p => p.id_producto !== id_producto);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    set({ carrito });
  },

  actualizarCantidad: (id_producto, cantidad) => {
    if (cantidad < 1) return;
    const carrito = get().carrito.map(p =>
      p.id_producto === id_producto ? { ...p, cantidad } : p
    );
    localStorage.setItem('carrito', JSON.stringify(carrito));
    set({ carrito });
  },

  limpiarCarrito: () => {
    localStorage.removeItem('carrito');
    set({ carrito: [] });
  },

  totalCarrito: () => {
    return get().carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  },
}));

export default useCatalogoStore;
