using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using TiendaVideojuegos.Models;

namespace TiendaVideojuegos.Services
{
    public class CompraService
    {
        private readonly string _jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "facturas.json");
        private List<Factura> _facturas = new List<Factura>();

        private readonly CarritoService _carritoService;
        private readonly ProductoService _productoService;
        private readonly ConsolaService _consolaService;
        private readonly AccesorioService _accesorioService;

        public CompraService(CarritoService carritoService, ProductoService productoService,
                             ConsolaService consolaService, AccesorioService accesorioService)
        {
            _carritoService = carritoService;
            _productoService = productoService;
            _consolaService = consolaService;
            _accesorioService = accesorioService;
            CargarDesdeJson();
        }

        private void CargarDesdeJson()
        {
            if (File.Exists(_jsonFilePath))
            {
                var jsonText = File.ReadAllText(_jsonFilePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                _facturas = JsonSerializer.Deserialize<List<Factura>>(jsonText, options) ?? new List<Factura>();
            }
        }

        private void GuardarEnJson()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonText = JsonSerializer.Serialize(_facturas, options);
            File.WriteAllText(_jsonFilePath, jsonText);
        }

        public List<Factura> ObtenerTodas() => _facturas;

        public Factura? ObtenerPorNumero(int numero) => _facturas.FirstOrDefault(f => f.Numero == numero);

        public List<Factura> ObtenerPorCliente(int clienteId) => _facturas.Where(f => f.ClienteId == clienteId).ToList();

        // Revisa que el carrito tenga productos y que alcance el stock.
        // Devuelve null si todo está bien, o el mensaje de error.
        public string? ValidarCompra(int clienteId)
        {
            var carrito = _carritoService.ObtenerCarrito(clienteId);
            if (carrito.Count == 0)
            {
                return "El carrito está vacío. Agregue productos antes de continuar.";
            }

            foreach (var grupo in AgruparCarrito(carrito))
            {
                var producto = grupo.First();
                int cantidad = grupo.Count();
                if (producto.Stock < cantidad)
                {
                    return $"No hay stock suficiente de '{producto.Nombre}'. Disponibles: {producto.Stock}, en el carrito: {cantidad}.";
                }
            }
            return null;
        }

        // Procesa la compra: descuenta el stock, genera la factura y vacía el carrito (F5, F7)
        public Factura ProcesarCompra(Usuario cliente, string metodoPago)
        {
            var carrito = _carritoService.ObtenerCarrito(cliente.Id);

            var factura = new Factura
            {
                Numero = _facturas.Count > 0 ? _facturas.Max(f => f.Numero) + 1 : 1,
                ClienteId = cliente.Id,
                Cliente = cliente.Nombre,
                Correo = cliente.Correo,
                MetodoPago = metodoPago
            };

            foreach (var grupo in AgruparCarrito(carrito))
            {
                var producto = grupo.First();
                int cantidad = grupo.Count();

                DescontarStock(producto, cantidad);

                factura.Productos.Add(new LineaFactura
                {
                    ProductoId = producto.Id,
                    Categoria = producto.Categoria,
                    Nombre = producto.Nombre,
                    Cantidad = cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = producto.Precio * cantidad
                });
            }

            factura.Total = factura.Productos.Sum(l => l.Subtotal);

            _facturas.Add(factura);
            GuardarEnJson();
            _carritoService.VaciarCarrito(cliente.Id);

            return factura;
        }

        // Agrupa los productos iguales del carrito (misma categoría y mismo Id)
        private IEnumerable<IGrouping<string, Producto>> AgruparCarrito(List<Producto> carrito)
        {
            return carrito.GroupBy(p => p.Categoria + "-" + p.Id);
        }

        // Resta el stock y lo guarda usando el método Actualizar de cada servicio
        private void DescontarStock(Producto producto, int cantidad)
        {
            if (producto is Videojuego videojuego)
            {
                videojuego.Stock -= cantidad;
                _productoService.ActualizarProducto(videojuego.Id, videojuego);
            }
            else if (producto is Consola consola)
            {
                consola.Stock -= cantidad;
                _consolaService.ActualizarConsola(consola.Id, consola);
            }
            else if (producto is Accesorios accesorio)
            {
                accesorio.Stock -= cantidad;
                _accesorioService.ActualizarAccesorio(accesorio.Id, accesorio);
            }
        }
    }
}
