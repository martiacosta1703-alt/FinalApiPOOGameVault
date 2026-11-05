using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using TiendaVideojuegos.Models;

namespace TiendaVideojuegos.Services
{
    public class ClienteService
    {
        private readonly string _jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "usuarios.json");
        private List<Usuario> _usuarios = new List<Usuario>();

        public ClienteService()
        {
            CargarDesdeJson();
        }

        private void CargarDesdeJson()
        {
            if (File.Exists(_jsonFilePath))
            {
                var jsonText = File.ReadAllText(_jsonFilePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                _usuarios = JsonSerializer.Deserialize<List<Usuario>>(jsonText, options) ?? new List<Usuario>();
            }
        }

        private void GuardarEnJson()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonText = JsonSerializer.Serialize(_usuarios, options);
            File.WriteAllText(_jsonFilePath, jsonText);
        }

        public List<Usuario> ObtenerTodos() => _usuarios;

        public Usuario? ObtenerPorId(int id) => _usuarios.FirstOrDefault(u => u.Id == id);

        // Método para agregar usuario (POST)
        public void AgregarUsuario(Usuario nuevoUsuario)
        {
            nuevoUsuario.Id = _usuarios.Count > 0 ? _usuarios.Max(u => u.Id) + 1 : 1;
            _usuarios.Add(nuevoUsuario);
            GuardarEnJson();
        }

        // Método para actualizar usuario (PUT - El botón amarillo)
        public bool ActualizarUsuario(int id, Usuario usuarioActualizado)
        {
            var usuario = ObtenerPorId(id);
            if (usuario == null) return false;

            usuario.Username = usuarioActualizado.Username;
            usuario.Nombre = usuarioActualizado.Nombre;
            usuario.Correo = usuarioActualizado.Correo;
            usuario.Rol = usuarioActualizado.Rol;
            usuario.KeyAcceso = usuarioActualizado.KeyAcceso;

            GuardarEnJson();
            return true;
        }

        // Método para eliminar usuario (DELETE)
        public bool EliminarUsuario(int id)
        {
            var usuario = ObtenerPorId(id);
            if (usuario != null)
            {
                _usuarios.Remove(usuario);
                GuardarEnJson();
                return true;
            }
            return false;
        }

        public Usuario? ValidarKey(string keyAcceso)
        {
            return _usuarios.FirstOrDefault(u => u.KeyAcceso.Equals(keyAcceso, StringComparison.OrdinalIgnoreCase));
        }
    }
}