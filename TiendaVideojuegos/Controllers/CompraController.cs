using Microsoft.AspNetCore.Mvc;
using TiendaVideojuegos.Models;
using TiendaVideojuegos.Services;

namespace TiendaVideojuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompraController : ControllerBase
    {
        private readonly CompraService _compraService;
        private readonly ClienteService _clienteService;

        public CompraController(CompraService compraService, ClienteService clienteService)
        {
            _compraService = compraService;
            _clienteService = clienteService;
        }

        // Confirma la compra: descuenta stock, genera la factura y vacía el carrito
        // POST api/Compra/confirmar   { "clienteId": 3, "metodoPagoSeleccionado": "Nequi" }
        [HttpPost("confirmar")]
        public IActionResult Confirmar([FromBody] PreCheckoutRequest request)
        {
            var cliente = _clienteService.ObtenerPorId(request.ClienteId);
            if (cliente == null)
            {
                return NotFound(new { mensaje = "Cliente no encontrado" });
            }

            var error = _compraService.ValidarCompra(request.ClienteId);
            if (error != null)
            {
                return BadRequest(new { mensaje = error });
            }

            var factura = _compraService.ProcesarCompra(cliente, request.MetodoPagoSeleccionado);
            return Ok(factura);
        }

        // GET api/Compra/facturas
        [HttpGet("facturas")]
        public IActionResult Facturas() => Ok(_compraService.ObtenerTodas());

        // GET api/Compra/facturas/1
        [HttpGet("facturas/{numero}")]
        public IActionResult FacturaPorNumero(int numero)
        {
            var factura = _compraService.ObtenerPorNumero(numero);
            return factura == null ? NotFound(new { mensaje = "Factura no encontrada" }) : Ok(factura);
        }

        // GET api/Compra/cliente/3
        [HttpGet("cliente/{clienteId}")]
        public IActionResult FacturasDelCliente(int clienteId) => Ok(_compraService.ObtenerPorCliente(clienteId));
    }
}
