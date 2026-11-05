using Microsoft.AspNetCore.Mvc;
using TiendaVideojuegos.Models;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccesorioController : ControllerBase
    {
        private readonly AccesorioService _accesorioService;

        public AccesorioController(AccesorioService accesorioService)
        {
            _accesorioService = accesorioService;
        }

        [HttpGet]
        public IActionResult Get() => Ok(_accesorioService.ObtenerTodos());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var accesorio = _accesorioService.ObtenerPorId(id);
            return accesorio == null ? NotFound(new { mensaje = "Accesorio no encontrado" }) : Ok(accesorio);
        }

        [HttpPost]
        public IActionResult Crear([FromBody] Accesorios nuevoAccesorio)
        {
            _accesorioService.AgregarAccesorio(nuevoAccesorio);
            return CreatedAtAction(nameof(GetById), new { id = nuevoAccesorio.Id }, nuevoAccesorio);
        }

        [HttpPut("{id}")]
        public IActionResult Actualizar(int id, [FromBody] Accesorios accesorioActualizado)
        {
            var actualizado = _accesorioService.ActualizarAccesorio(id, accesorioActualizado);
            return actualizado
                ? Ok(new { mensaje = "Accesorio actualizado correctamente" })
                : NotFound(new { mensaje = "Accesorio no encontrado" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var eliminado = _accesorioService.EliminarAccesorio(id);
            return eliminado
                ? Ok(new { mensaje = "Accesorio eliminado correctamente" })
                : NotFound(new { mensaje = "Accesorio no encontrado" });
        }
    }
}
