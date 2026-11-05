namespace TiendaVideojuegos.Models
{
    public class PreCheckoutRequest
    {
        public int ClienteId { get; set; }
        public string MetodoPagoSeleccionado { get; set; } = "Tarjeta de Crédito";
    }
}