using Microsoft.AspNetCore.Mvc;
using TiendaVideojuegos.Models;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly ProductoService _productoService;

        public ProductoController(ProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet]
        public IActionResult Get() => Ok(_productoService.ObtenerTodos());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var producto = _productoService.ObtenerPorId(id);
            return producto == null ? NotFound(new { mensaje = "Producto no encontrado" }) : Ok(producto);
        }

        [HttpPost]
        public IActionResult Crear([FromBody] Videojuego nuevoProducto)
        {
            _productoService.AgregarProducto(nuevoProducto);
            return CreatedAtAction(nameof(GetById), new { id = nuevoProducto.Id }, nuevoProducto);
        }

        // El PUT amarillo para modificar productos
        [HttpPut("{id}")]
        public IActionResult Actualizar(int id, [FromBody] Videojuego productoActualizado)
        {
            var actualizado = _productoService.ActualizarProducto(id, productoActualizado);
            return actualizado
                ? Ok(new { mensaje = "Producto actualizado correctamente" })
                : NotFound(new { mensaje = "Producto no encontrado" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var eliminado = _productoService.EliminarProducto(id);
            return eliminado
                ? Ok(new { mensaje = "Producto eliminado correctamente" })
                : NotFound(new { mensaje = "Producto no encontrado" });
        }
    }
}