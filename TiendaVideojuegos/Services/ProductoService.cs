using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using TiendaVideojuegos.Models;

namespace TiendaVideojuegos.Services
{
    public class ProductoService
    {
        private readonly string _jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "productos.json");
        private List<Videojuego> _productos = new List<Videojuego>();

        public ProductoService()
        {
            CargarDesdeJson();
        }

        private void CargarDesdeJson()
        {
            if (File.Exists(_jsonFilePath))
            {
                var jsonText = File.ReadAllText(_jsonFilePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                _productos = JsonSerializer.Deserialize<List<Videojuego>>(jsonText, options) ?? new List<Videojuego>();
            }
        }

        private void GuardarEnJson()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonText = JsonSerializer.Serialize(_productos, options);
            File.WriteAllText(_jsonFilePath, jsonText);
        }

        public List<Videojuego> ObtenerTodos() => _productos;

        public Videojuego? ObtenerPorId(int id) => _productos.FirstOrDefault(p => p.Id == id);

        public void AgregarProducto(Videojuego producto)
        {
            producto.Id = _productos.Count > 0 ? _productos.Max(p => p.Id) + 1 : 1;
            _productos.Add(producto);
            GuardarEnJson();
        }

        public bool ActualizarProducto(int id, Videojuego productoActualizado)
        {
            var producto = ObtenerPorId(id);
            if (producto == null) return false;

            producto.Nombre = productoActualizado.Nombre;
            producto.Precio = productoActualizado.Precio;
            producto.Stock = productoActualizado.Stock;
            producto.Genero = productoActualizado.Genero;
            producto.Plataforma = productoActualizado.Plataforma;

            GuardarEnJson();
            return true;
        }

        public bool EliminarProducto(int id)
        {
            var producto = ObtenerPorId(id);
            if (producto != null)
            {
                _productos.Remove(producto);
                GuardarEnJson();
                return true;
            }
            return false;
        }
    }
}