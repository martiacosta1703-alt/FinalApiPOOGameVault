using System.Collections.Generic;

namespace TiendaVideojuegos.Models
{
    public class Carrito
    {
        public int ClienteId { get; set; }
        public List<Producto> Items { get; set; } = new List<Producto>();
        public decimal Total => CalcularTotal();

        private decimal CalcularTotal()
        {
            decimal suma = 0;
            foreach (var item in Items)
            {
                suma += item.Precio;
            }
            return suma;
        }
    }
}