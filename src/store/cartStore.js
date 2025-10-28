import { create } from 'zustand'

/**
 * @typedef {Object} Product
 * @property {number|string} id - Identificador único del producto.
 * @property {string} name - Nombre del producto.
 * @property {number} price - Precio unitario del producto.
 * @property {number} [quantity] - Cantidad del producto en el carrito.
 */

/**
 * @callback NotificationCallback
 * @param {string} message - Mensaje a mostrar.
 * @param {'success'|'info'|'error'} type - Tipo de notificación.
 */

/**
 * @typedef {Object} CartStore
 * @property {Product[]} items - Lista de productos en el carrito.
 * @property {number} total - Monto total del carrito.
 * @property {(product: Product, showNotification?: NotificationCallback|null) => void} addItem - Agrega un producto al carrito o incrementa su cantidad.
 * @property {(productId: number|string, showNotification?: NotificationCallback|null) => void} removeItem - Elimina un producto del carrito.
 * @property {(productId: number|string, quantity: number) => void} updateQuantity - Actualiza la cantidad de un producto.
 * @property {(showNotification?: NotificationCallback|null) => void} clearCart - Vacía el carrito y reinicia el total.
 * @property {() => void} calculateTotal - Recalcula el monto total del carrito.
 * @property {() => number} getItemsCount - Retorna el número total de unidades en el carrito.
 */

/**
 * Hook de Zustand para manejar el estado del carrito de compras.
 *
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<CartStore>>}
 *
 * @example
 * const { items, addItem, removeItem } = useCartStore()
 * addItem({ id: 1, name: 'Producto A', price: 100 })
 */
const useCartStore = create((set, get) => ({
  // Estado inicial
  items: [],
  total: 0,

  /**
   * Agrega un producto al carrito.  
   * Si ya existe, incrementa su cantidad.
   * @param {Product} product - Producto a agregar.
   * @param {NotificationCallback|null} [showNotification=null] - Función para mostrar notificaciones opcional.
   */
  addItem: (product, showNotification = null) => {
    const { items } = get()
    const existingItem = items.find(item => item.id === product.id)

    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      })
      if (showNotification) {
        showNotification(`Se agregó una unidad más de ${product.name}`, 'success')
      }
    } else {
      set({
        items: [...items, { ...product, quantity: 1 }]
      })
      if (showNotification) {
        showNotification(`${product.name} agregado al carrito`, 'success')
      }
    }

    get().calculateTotal()
  },

  /**
   * Elimina un producto del carrito.
   * @param {number|string} productId - ID del producto a eliminar.
   * @param {NotificationCallback|null} [showNotification=null] - Función para mostrar notificaciones opcional.
   */
  removeItem: (productId, showNotification = null) => {
    const { items } = get()
    const removedItem = items.find(item => item.id === productId)
    
    set({
      items: items.filter(item => item.id !== productId)
    })
    
    if (showNotification && removedItem) {
      showNotification(`${removedItem.name} eliminado del carrito`, 'info')
    }
    
    get().calculateTotal()
  },

  /**
   * Actualiza la cantidad de un producto en el carrito.  
   * Si la cantidad es 0 o menor, se elimina.
   * @param {number|string} productId - ID del producto.
   * @param {number} quantity - Nueva cantidad.
   */
  updateQuantity: (productId, quantity) => {
    const { items } = get()
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set({
      items: items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    })
    get().calculateTotal()
  },

  /**
   * Vacía completamente el carrito y reinicia el total.
   * @param {NotificationCallback|null} [showNotification=null] - Función para mostrar notificaciones opcional.
   */
  clearCart: (showNotification = null) => {
    set({
      items: [],
      total: 0
    })
    
    if (showNotification) {
      showNotification('Carrito vaciado', 'info')
    }
  },

  /**
   * Calcula el total del carrito multiplicando precio por cantidad.
   */
  calculateTotal: () => {
    const { items } = get()
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    set({ total })
  },

  /**
   * Retorna el número total de productos (sumando cantidades).
   * @returns {number} Total de unidades en el carrito.
   */
  getItemsCount: () => {
    const { items } = get()
    return items.reduce((count, item) => count + item.quantity, 0)
  }
}))

export default useCartStore
