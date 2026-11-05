using System.Text.Json.Serialization;

namespace TiendaVideojuegos.Models
{
    // Estas líneas permiten que, al devolver una lista de Producto (por ejemplo el carrito),
    // también se muestren los datos propios de cada clase hija.
    [JsonDerivedType(typeof(Videojuego))]
    [JsonDerivedType(typeof(Consola))]
    [JsonDerivedType(typeof(Accesorios))]
    public class Producto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int Stock { get; set; }

        // Polimorfismo: cada clase hija dice a qué categoría pertenece
        public virtual string Categoria => "Producto";
    }
}
