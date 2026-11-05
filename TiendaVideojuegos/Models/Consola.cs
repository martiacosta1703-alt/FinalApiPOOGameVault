namespace TiendaVideojuegos.Models
{
    public class Consola : Producto
    {
        public string Marca { get; set; } = string.Empty;
        public string Almacenamiento { get; set; } = string.Empty;

        public override string Categoria => "Consola";
    }
}
