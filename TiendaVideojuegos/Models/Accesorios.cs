namespace TiendaVideojuegos.Models
{
    public class Accesorios : Producto
    {
        public string Tipo { get; set; } = string.Empty;            // Control, audífonos, cargador, protector...
        public string Compatibilidad { get; set; } = string.Empty;  // PS5, Xbox, Nintendo Switch, PC...

        public override string Categoria => "Accesorio";
    }
}
