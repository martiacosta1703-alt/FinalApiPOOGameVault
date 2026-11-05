using Microsoft.AspNetCore.Mvc;
using System.Linq;
using TiendaVideojuegos.Models;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController : ControllerBase
    {
        private readonly CarritoService _carritoService;
        private readonly ClienteService _clienteService;

        public CheckoutController(CarritoService carritoService, ClienteService clienteService)
        {
            _carritoService = carritoService;
            _clienteService = clienteService;
        }

        [HttpPost("resumen")]
        public IActionResult ObtenerResumen([FromBody] PreCheckoutRequest request)
        {
            var cliente = _clienteService.ObtenerPorId(request.ClienteId);
            if (cliente == null)
            {
                return NotFound(new { mensaje = "Cliente no encontrado" });
            }

            var productosEnCarrito = _carritoService.ObtenerCarrito(request.ClienteId);
            if (productosEnCarrito.Count == 0)
            {
                return BadRequest(new { mensaje = "El carrito está vacío. Agregue productos antes de continuar." });
            }

            decimal total = productosEnCarrito.Sum(p => p.Precio);

            // Devuelve únicamente el resumen previo a confirmar (sin registrar compras ni cobrar)
            var resumen = new
            {
                Mensaje = "Resumen previo a la compra generado con éxito (Sin procesar pago)",
                Cliente = cliente.Nombre,
                Correo = cliente.Correo,
                MetodoPagoElegido = request.MetodoPagoSeleccionado,
                Productos = productosEnCarrito,
                TotalAPagar = total
            };

            return Ok(resumen);
        }
    }
}