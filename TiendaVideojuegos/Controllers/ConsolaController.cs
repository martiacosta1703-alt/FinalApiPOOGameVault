using Microsoft.AspNetCore.Mvc;
using TiendaVideojuegos.Models;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsolaController : ControllerBase
    {
        private readonly ConsolaService _consolaService;

        public ConsolaController(ConsolaService consolaService)
        {
            _consolaService = consolaService;
        }

        [HttpGet]
        public IActionResult Get() => Ok(_consolaService.ObtenerTodos());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var consola = _consolaService.ObtenerPorId(id);
            return consola == null ? NotFound(new { mensaje = "Consola no encontrada" }) : Ok(consola);
        }

        [HttpPost]
        public IActionResult Crear([FromBody] Consola nuevaConsola)
        {
            _consolaService.AgregarConsola(nuevaConsola);
            return CreatedAtAction(nameof(GetById), new { id = nuevaConsola.Id }, nuevaConsola);
        }

        [HttpPut("{id}")]
        public IActionResult Actualizar(int id, [FromBody] Consola consolaActualizada)
        {
            var actualizado = _consolaService.ActualizarConsola(id, consolaActualizada);
            return actualizado
                ? Ok(new { mensaje = "Consola actualizada correctamente" })
                : NotFound(new { mensaje = "Consola no encontrada" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var eliminado = _consolaService.EliminarConsola(id);
            return eliminado
                ? Ok(new { mensaje = "Consola eliminada correctamente" })
                : NotFound(new { mensaje = "Consola no encontrada" });
        }
    }
}
