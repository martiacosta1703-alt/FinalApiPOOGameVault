using Microsoft.AspNetCore.Mvc;
using TiendaVideojuegos.Models;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClienteController : ControllerBase
    {
        private readonly ClienteService _clienteService;

        public ClienteController(ClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        [HttpGet]
        public IActionResult Get() => Ok(_clienteService.ObtenerTodos());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var usuario = _clienteService.ObtenerPorId(id);
            return usuario == null ? NotFound(new { mensaje = "Cliente no encontrado" }) : Ok(usuario);
        }

        [HttpPost]
        public IActionResult Crear([FromBody] Usuario nuevoUsuario)
        {
            _clienteService.AgregarUsuario(nuevoUsuario);
            return CreatedAtAction(nameof(GetById), new { id = nuevoUsuario.Id }, nuevoUsuario);
        }

        // El PUT amarillo para modificar clientes
        [HttpPut("{id}")]
        public IActionResult Actualizar(int id, [FromBody] Usuario usuarioActualizado)
        {
            var actualizado = _clienteService.ActualizarUsuario(id, usuarioActualizado);
            return actualizado
                ? Ok(new { mensaje = "Cliente actualizado correctamente" })
                : NotFound(new { mensaje = "Cliente no encontrado" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var eliminado = _clienteService.EliminarUsuario(id);
            return eliminado
                ? Ok(new { mensaje = "Cliente eliminado correctamente" })
                : NotFound(new { mensaje = "Cliente no encontrado" });
        }

        [HttpPost("validar-key")]
        public IActionResult ValidarKey([FromBody] ValidarKeyRequest request)
        {
            var usuario = _clienteService.ValidarKey(request.KeyAcceso);
            if (usuario == null) return Unauthorized(new { mensaje = "Key de acceso inválida" });
            return Ok(new { mensaje = "Acceso concedido", usuario });
        }
    }
}