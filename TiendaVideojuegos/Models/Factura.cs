using System;
using System.Collections.Generic;

namespace TiendaVideojuegos.Models
{
    // Comprobante que se genera al confirmar una compra (F7)
    public class Factura
    {
        public int Numero { get; set; }
        public DateTime Fecha { get; set; } = DateTime.Now;
        public int ClienteId { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string MetodoPago { get; set; } = string.Empty;
        public List<LineaFactura> Productos { get; set; } = new List<LineaFactura>();
        public decimal Total { get; set; }
    }

    // Cada renglón de la factura
    public class LineaFactura
    {
        public int ProductoId { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}
