using System.Collections.Generic;
using System.Linq;
using TiendaVideojuegos.Models;

namespace TiendaVideojuegos.Services
{
    public class CarritoService
    {
        // El carrito guarda Producto para que quepan videojuegos, consolas y accesorios
        private readonly Dictionary<int, List<Producto>> _carritos = new Dictionary<int, List<Producto>>();
        private readonly ProductoService _productoService;
        private readonly ConsolaService _consolaService;
        private readonly AccesorioService _accesorioService;
        private readonly ClienteService _clienteService;

        public CarritoService(ProductoService productoService, ConsolaService consolaService,
                              AccesorioService accesorioService, ClienteService clienteService)
        {
            _productoService = productoService;
            _consolaService = consolaService;
            _accesorioService = accesorioService;
            _clienteService = clienteService;
        }

        public List<Producto> ObtenerCarrito(int clienteId)
        {
            if (!_carritos.ContainsKey(clienteId))
            {
                _carritos[clienteId] = new List<Producto>();
            }
            return _carritos[clienteId];
        }

        public bool AgregarProducto(int clienteId, int productoId)
        {
            var producto = _productoService.ObtenerPorId(productoId);
            if (producto == null) return false;

            var carrito = ObtenerCarrito(clienteId);
            carrito.Add(producto);
            return true;
        }

        public bool AgregarConsola(int clienteId, int consolaId)
        {
            var consola = _consolaService.ObtenerPorId(consolaId);
            if (consola == null) return false;

            var carrito = ObtenerCarrito(clienteId);
            carrito.Add(consola);
            return true;
        }

        public bool AgregarAccesorio(int clienteId, int accesorioId)
        {
            var accesorio = _accesorioService.ObtenerPorId(accesorioId);
            if (accesorio == null) return false;

            var carrito = ObtenerCarrito(clienteId);
            carrito.Add(accesorio);
            return true;
        }

        public bool QuitarProducto(int clienteId, string categoria, int productoId)
        {
            var carrito = ObtenerCarrito(clienteId);
            var item = carrito.FirstOrDefault(p => p.Id == productoId && p.Categoria.ToLower() == categoria.ToLower());
            if (item != null)
            {
                carrito.Remove(item);
                return true;
            }
            return false;
        }

        public bool VaciarCarrito(int clienteId)
        {
            if (_carritos.ContainsKey(clienteId))
            {
                _carritos[clienteId].Clear();
                return true;
            }
            return false;
        }
    }
}
