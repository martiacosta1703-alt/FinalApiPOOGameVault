using Microsoft.AspNetCore.Mvc;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarritoController : ControllerBase
    {
        private readonly CarritoService _carritoService;

        public CarritoController(CarritoService carritoService)
        {
            _carritoService = carritoService;
        }

        [HttpGet("{clienteId}")]
        public IActionResult VerCarrito(int clienteId)
        {
            var items = _carritoService.ObtenerCarrito(clienteId);
            return Ok(items);
        }

        [HttpPost("{clienteId}/agregar/{productoId}")]
        public IActionResult AgregarAlCarrito(int clienteId, int productoId)
        {
            var exito = _carritoService.AgregarProducto(clienteId, productoId);
            return exito
                ? Ok(new { mensaje = "Producto agregado al carrito exitosamente" })
                : NotFound(new { mensaje = "Producto no encontrado" });
        }

        [HttpPost("{clienteId}/agregar-consola/{consolaId}")]
        public IActionResult AgregarConsola(int clienteId, int consolaId)
        {
            var exito = _carritoService.AgregarConsola(clienteId, consolaId);
            return exito
                ? Ok(new { mensaje = "Consola agregada al carrito exitosamente" })
                : NotFound(new { mensaje = "Consola no encontrada" });
        }

        [HttpPost("{clienteId}/agregar-accesorio/{accesorioId}")]
        public IActionResult AgregarAccesorio(int clienteId, int accesorioId)
        {
            var exito = _carritoService.AgregarAccesorio(clienteId, accesorioId);
            return exito
                ? Ok(new { mensaje = "Accesorio agregado al carrito exitosamente" })
                : NotFound(new { mensaje = "Accesorio no encontrado" });
        }

        // categoria: videojuego, consola o accesorio
        [HttpDelete("{clienteId}/quitar/{categoria}/{productoId}")]
        public IActionResult Quitar(int clienteId, string categoria, int productoId)
        {
            var exito = _carritoService.QuitarProducto(clienteId, categoria, productoId);
            return exito
                ? Ok(new { mensaje = "Producto quitado del carrito" })
                : NotFound(new { mensaje = "El producto no está en el carrito" });
        }

        [HttpDelete("{clienteId}")]
        public IActionResult Vaciar(int clienteId)
        {
            _carritoService.VaciarCarrito(clienteId);
            return Ok(new { mensaje = "Carrito vaciado exitosamente" });
        }
    }
}
