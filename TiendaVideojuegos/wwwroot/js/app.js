/* ==========================================================
   GAME VAULT · Lógica de la página
   Organizada en clases (POO), igual que la API:
   - Categoria (+ CategoriaVideojuego, CategoriaConsola, CategoriaAccesorio)
                 -> cómo se muestra y se edita cada tipo de producto
   - ApiTienda   -> habla con los endpoints de la API
   - Sesion      -> guarda el usuario que ingresó y sus permisos
   - Formato     -> utilidades para mostrar datos
   - Vista*      -> cada parte de la página
   - App         -> une todo
   ========================================================== */

/* ---------- Categorías de producto (herencia y polimorfismo) ---------- */
class Categoria {
    constructor(nombre, plural, ruta) {
        this.nombre = nombre;   // "Videojuego", "Consola", "Accesorio" (igual que la propiedad Categoria de la API)
        this.plural = plural;
        this.ruta = ruta;       // endpoint de la API
    }
    // Cada clase hija sobrescribe estos métodos
    familia(p)      { return ""; }               // define el color de la tarjeta
    etiqueta(p)     { return ""; }               // texto pequeño sobre el nombre
    detalle(p)      { return ""; }               // línea de detalle en carrito y gestión
    campos()        { return { a: "", b: "", sugerenciasA: [], sugerenciasB: [] }; }
    leerCampos(p)   { return ["", ""]; }
    crearCuerpo(base, a, b) { return base; }
}

class CategoriaVideojuego extends Categoria {
    constructor() { super("Videojuego", "Videojuegos", "/Producto"); }
    familia(p)  { return p.plataforma; }
    etiqueta(p) { return p.genero; }
    detalle(p)  { return `${p.plataforma} · ${p.genero}`; }
    campos()    { return { a: "Género", b: "Plataforma",
                           sugerenciasA: ["Acción", "Aventura", "RPG", "Carreras", "Deportes", "Disparos", "Survival Horror"],
                           sugerenciasB: ["PlayStation 5", "Xbox Series X", "Nintendo Switch", "PC"] }; }
    leerCampos(p) { return [p.genero, p.plataforma]; }
    crearCuerpo(base, a, b) { return { ...base, genero: a, plataforma: b }; }
}

class CategoriaConsola extends Categoria {
    constructor() { super("Consola", "Consolas", "/Consola"); }
    familia(p)  { return p.marca; }
    etiqueta(p) { return `${p.marca} · ${p.almacenamiento}`; }
    detalle(p)  { return `${p.marca} · ${p.almacenamiento}`; }
    campos()    { return { a: "Marca", b: "Almacenamiento",
                           sugerenciasA: ["Sony", "Microsoft", "Nintendo", "Valve"],
                           sugerenciasB: ["32GB", "64GB", "512GB SSD", "1TB SSD", "2TB SSD"] }; }
    leerCampos(p) { return [p.marca, p.almacenamiento]; }
    crearCuerpo(base, a, b) { return { ...base, marca: a, almacenamiento: b }; }
}

class CategoriaAccesorio extends Categoria {
    constructor() { super("Accesorio", "Accesorios", "/Accesorio"); }
    familia(p)  { return p.compatibilidad; }
    etiqueta(p) { return p.tipo; }
    detalle(p)  { return `${p.tipo} · ${p.compatibilidad}`; }
    campos()    { return { a: "Tipo", b: "Compatibilidad",
                           sugerenciasA: ["Control", "Audífonos", "Cargador", "Memoria", "Protector", "Teclado"],
                           sugerenciasB: ["PlayStation 5", "Xbox Series X|S", "Nintendo Switch", "PC"] }; }
    leerCampos(p) { return [p.tipo, p.compatibilidad]; }
    crearCuerpo(base, a, b) { return { ...base, tipo: a, compatibilidad: b }; }
}

class Categorias {
    static lista = [new CategoriaVideojuego(), new CategoriaConsola(), new CategoriaAccesorio()];
    static de(nombre) { return Categorias.lista.find(c => c.nombre === nombre) ?? Categorias.lista[0]; }
    static clave(p)   { return `${p.categoria}-${p.id}`; }   // los Id se repiten entre categorías
}

/* ---------- Comunicación con la API ---------- */
class ApiTienda {
    constructor(baseUrl = "/api") {
        this.baseUrl = baseUrl;
    }

    async #pedir(ruta, metodo = "GET", cuerpo = null) {
        const opciones = { method: metodo, headers: {} };
        if (cuerpo !== null) {
            opciones.headers["Content-Type"] = "application/json";
            opciones.body = JSON.stringify(cuerpo);
        }
        const respuesta = await fetch(this.baseUrl + ruta, opciones);
        const texto = await respuesta.text();
        const datos = texto ? JSON.parse(texto) : null;
        if (!respuesta.ok) {
            throw new Error(datos?.mensaje ?? `Error ${respuesta.status}`);
        }
        return datos;
    }

    // Productos de las tres categorías (F1, F2)
    async obtenerCatalogo() {
        const listas = await Promise.all(Categorias.lista.map(c => this.#pedir(c.ruta)));
        return listas.flat();
    }
    crearProducto(categoria, producto)          { return this.#pedir(categoria.ruta, "POST", producto); }
    actualizarProducto(categoria, id, producto) { return this.#pedir(`${categoria.ruta}/${id}`, "PUT", producto); }
    eliminarProducto(categoria, id)             { return this.#pedir(`${categoria.ruta}/${id}`, "DELETE"); }

    // Usuarios (F3)
    obtenerUsuarios()               { return this.#pedir("/Cliente"); }
    crearUsuario(usuario)           { return this.#pedir("/Cliente", "POST", usuario); }
    actualizarUsuario(id, usuario)  { return this.#pedir(`/Cliente/${id}`, "PUT", usuario); }
    eliminarUsuario(id)             { return this.#pedir(`/Cliente/${id}`, "DELETE"); }
    validarKey(keyAcceso)           { return this.#pedir("/Cliente/validar-key", "POST", { keyAcceso }); }

    // Carrito (F4)
    obtenerCarrito(clienteId)                 { return this.#pedir(`/Carrito/${clienteId}`); }
    agregarAlCarrito(clienteId, categoria, id) {
        const rutas = { Videojuego: "agregar", Consola: "agregar-consola", Accesorio: "agregar-accesorio" };
        return this.#pedir(`/Carrito/${clienteId}/${rutas[categoria]}/${id}`, "POST");
    }
    quitarDelCarrito(clienteId, categoria, id){ return this.#pedir(`/Carrito/${clienteId}/quitar/${categoria.toLowerCase()}/${id}`, "DELETE"); }
    vaciarCarrito(clienteId)                  { return this.#pedir(`/Carrito/${clienteId}`, "DELETE"); }

    // Compra, método de pago y resumen (F5, F6, F7)
    generarResumen(clienteId, metodoPago) {
        return this.#pedir("/Checkout/resumen", "POST", {
            clienteId: clienteId,
            metodoPagoSeleccionado: metodoPago
        });
    }
    confirmarCompra(clienteId, metodoPago) {
        return this.#pedir("/Compra/confirmar", "POST", {
            clienteId: clienteId,
            metodoPagoSeleccionado: metodoPago
        });
    }
}

/* ---------- Sesión del usuario ---------- */
class Sesion {
    static #clave = "gamevault.usuario";
    #usuario = null;

    constructor() {
        try {
            const guardado = localStorage.getItem(Sesion.#clave);
            this.#usuario = guardado ? JSON.parse(guardado) : null;
        } catch { this.#usuario = null; }
    }

    get usuario()   { return this.#usuario; }
    get activa()    { return this.#usuario !== null; }
    get rol()       { return this.#usuario?.rol ?? ""; }

    // Permisos según la tabla "Relación entre actores y funcionalidades"
    get puedeComprar()   { return ["Cliente", "Vendedor"].includes(this.rol); }        // F4, F5, F6
    get puedeGestionar() { return ["Administrador", "Vendedor"].includes(this.rol); }  // F1

    iniciar(usuario) {
        this.#usuario = usuario;
        try { localStorage.setItem(Sesion.#clave, JSON.stringify(usuario)); } catch { }
    }

    cerrar() {
        this.#usuario = null;
        try { localStorage.removeItem(Sesion.#clave); } catch { }
    }
}

/* ---------- Utilidades de formato ---------- */
class Formato {
    static #moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

    static precio(valor) { return Formato.#moneda.format(valor); }

    static iniciales(texto = "") {
        return texto.replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
    }

    // Color según plataforma, marca o compatibilidad
    static color(familia = "") {
        const f = familia.toLowerCase();
        if (f.includes("playstation") || f.includes("sony") || f.includes("ps5")) return "var(--ps)";
        if (f.includes("xbox") || f.includes("microsoft")) return "var(--xbox)";
        if (f.includes("switch") || f.includes("nintendo")) return "var(--switch)";
        return "var(--pc)";
    }

    static escapar(texto = "") {
        return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    // Agrupa productos iguales para mostrar cantidades
    static agrupar(productos) {
        const grupos = new Map();
        for (const p of productos) {
            const clave = Categorias.clave(p);
            if (!grupos.has(clave)) grupos.set(clave, { producto: p, cantidad: 0 });
            grupos.get(clave).cantidad++;
        }
        return [...grupos.values()];
    }
}

/* ---------- Avisos flotantes ---------- */
class Aviso {
    static #elemento = document.getElementById("aviso");
    static #temporizador = null;

    static mostrar(mensaje, esError = false) {
        Aviso.#elemento.textContent = mensaje;
        Aviso.#elemento.classList.toggle("error", esError);
        Aviso.#elemento.classList.add("visible");
        clearTimeout(Aviso.#temporizador);
        Aviso.#temporizador = setTimeout(() => Aviso.#elemento.classList.remove("visible"), 2800);
    }
}

/* ---------- Vista: Catálogo ---------- */
class VistaCatalogo {
    #productos = [];
    #categoria = "Todo";

    constructor(app) {
        this.app = app;
        this.grilla = document.getElementById("grillaProductos");
        this.txtBuscar = document.getElementById("txtBuscar");
        this.selOrden = document.getElementById("selOrden");
        this.chips = document.getElementById("chipsCategoria");

        this.txtBuscar.addEventListener("input", () => this.pintar());
        this.selOrden.addEventListener("change", () => this.pintar());
        this.grilla.addEventListener("click", e => {
            const boton = e.target.closest("[data-agregar]");
            if (boton) this.app.agregarAlCarrito(boton.dataset.categoria, Number(boton.dataset.agregar));
        });
    }

    buscar(categoria, id) {
        return this.#productos.find(p => p.categoria === categoria && p.id === id);
    }

    cargar(productos) {
        this.#productos = productos;
        this.#pintarChips();
        this.#pintarEstadisticas();
        this.pintar();
    }

    #pintarChips() {
        const opciones = [{ valor: "Todo", texto: "Todo" }, ...Categorias.lista.map(c => ({ valor: c.nombre, texto: c.plural }))];
        this.chips.innerHTML = opciones.map(o => {
            const cantidad = o.valor === "Todo" ? this.#productos.length : this.#productos.filter(p => p.categoria === o.valor).length;
            return `<button class="chip ${o.valor === this.#categoria ? "activo" : ""}" data-categoria="${o.valor}">${o.texto} · ${cantidad}</button>`;
        }).join("");
        this.chips.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => {
            this.#categoria = chip.dataset.categoria;
            this.#pintarChips();
            this.pintar();
        }));
    }

    #pintarEstadisticas() {
        const total = this.#productos.length;
        const categorias = new Set(this.#productos.map(p => p.categoria)).size;
        const unidades = this.#productos.reduce((suma, p) => suma + p.stock, 0);
        document.getElementById("estadisticas").innerHTML = `
            <div class="stat"><div class="stat__valor">${total}</div><div class="stat__nombre">Productos</div></div>
            <div class="stat"><div class="stat__valor">${categorias}</div><div class="stat__nombre">Categorías</div></div>
            <div class="stat"><div class="stat__valor">${unidades}</div><div class="stat__nombre">En stock</div></div>`;
    }

    #filtrar() {
        const texto = this.txtBuscar.value.trim().toLowerCase();
        const lista = this.#productos.filter(p => {
            const cat = Categorias.de(p.categoria);
            const textoProducto = [p.nombre, ...cat.leerCampos(p)].join(" ").toLowerCase();
            return (this.#categoria === "Todo" || p.categoria === this.#categoria) && textoProducto.includes(texto);
        });
        const orden = {
            "precio-asc":  (a, b) => a.precio - b.precio,
            "precio-desc": (a, b) => b.precio - a.precio,
            "nombre":      (a, b) => a.nombre.localeCompare(b.nombre),
            "id":          () => 0
        };
        return lista.sort(orden[this.selOrden.value]);
    }

    pintar() {
        const lista = this.#filtrar();
        document.getElementById("sinResultados").classList.toggle("oculto", lista.length > 0);
        const mostrarBoton = this.app.sesion.puedeComprar || !this.app.sesion.activa;

        this.grilla.innerHTML = lista.map(p => {
            const cat = Categorias.de(p.categoria);
            return `
            <article class="tarjeta" style="--color-plataforma:${Formato.color(cat.familia(p))}">
                <div class="caratula">
                    <span class="caratula__categoria">${cat.nombre}</span>
                    <span class="caratula__iniciales">${Formato.iniciales(p.nombre)}</span>
                    <span class="caratula__plataforma">${Formato.escapar(cat.familia(p))}</span>
                </div>
                <div class="tarjeta__cuerpo">
                    <span class="tarjeta__genero">${Formato.escapar(cat.etiqueta(p))}</span>
                    <h3 class="tarjeta__nombre">${Formato.escapar(p.nombre)}</h3>
                    <div class="tarjeta__pie">
                        <div>
                            <div class="precio">${Formato.precio(p.precio)}</div>
                            <div class="stock ${p.stock <= 5 ? "bajo" : ""}">${p.stock > 0 ? `${p.stock} disponibles` : "Agotado"}</div>
                        </div>
                        ${mostrarBoton ? `<button class="boton-agregar" data-categoria="${p.categoria}" data-agregar="${p.id}" title="Agregar al carrito" ${p.stock === 0 ? "disabled" : ""}>+</button>` : ""}
                    </div>
                </div>
            </article>`;
        }).join("");
    }
}

/* ---------- Vista: Carrito ---------- */
class VistaCarrito {
    #items = [];

    constructor(app) {
        this.app = app;
        this.lista = document.getElementById("listaCarrito");
        document.getElementById("btnVaciar").addEventListener("click", () => this.vaciar());
        document.getElementById("btnComprar").addEventListener("click", () => this.comprar());

        // Botones + y − de cada producto (modificar cantidad, F4)
        this.lista.addEventListener("click", async e => {
            const boton = e.target.closest("[data-accion]");
            if (!boton) return;
            const { accion, categoria, id } = boton.dataset;
            const clienteId = this.app.sesion.usuario.id;
            try {
                if (accion === "sumar") await this.app.api.agregarAlCarrito(clienteId, categoria, id);
                else await this.app.api.quitarDelCarrito(clienteId, categoria, id);
                await this.cargar();
            } catch (error) { Aviso.mostrar(error.message, true); }
        });
    }

    async cargar() {
        if (!this.app.sesion.puedeComprar) { this.#items = []; this.pintar(); return; }
        try {
            this.#items = await this.app.api.obtenerCarrito(this.app.sesion.usuario.id);
        } catch (error) {
            this.#items = [];
            Aviso.mostrar(error.message, true);
        }
        this.pintar();
    }

    pintar() {
        const total = this.#items.reduce((suma, p) => suma + p.precio, 0);
        document.getElementById("contadorCarrito").textContent = this.#items.length;
        document.getElementById("resCantidad").textContent = this.#items.length;
        document.getElementById("resTotal").textContent = Formato.precio(total);
        document.getElementById("btnComprar").disabled = this.#items.length === 0;
        document.getElementById("btnVaciar").disabled = this.#items.length === 0;

        if (this.#items.length === 0) {
            this.lista.innerHTML = `<p class="vacio">Tu carrito está vacío. Ve al catálogo y agrega juegos, consolas o accesorios.</p>`;
            return;
        }
        this.lista.innerHTML = Formato.agrupar(this.#items).map(({ producto: p, cantidad }) => {
            const cat = Categorias.de(p.categoria);
            return `
            <div class="item" style="--color-plataforma:${Formato.color(cat.familia(p))}">
                <div class="item__mini">${Formato.iniciales(p.nombre)}</div>
                <div>
                    <div class="item__nombre">${Formato.escapar(p.nombre)}</div>
                    <div class="item__detalle">${cat.nombre} · ${Formato.escapar(cat.detalle(p))}</div>
                </div>
                <div class="item__derecha">
                    <div class="item__precio">${Formato.precio(p.precio * cantidad)}</div>
                    <div class="cantidad">
                        <button data-accion="restar" data-categoria="${p.categoria}" data-id="${p.id}" title="Quitar uno">−</button>
                        <span>${cantidad}</span>
                        <button data-accion="sumar" data-categoria="${p.categoria}" data-id="${p.id}" title="Agregar uno" ${cantidad >= p.stock ? "disabled" : ""}>+</button>
                    </div>
                </div>
            </div>`;
        }).join("");
    }

    async vaciar() {
        try {
            await this.app.api.vaciarCarrito(this.app.sesion.usuario.id);
            Aviso.mostrar("Carrito vaciado");
            await this.cargar();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    // Cuántas unidades de un producto hay en el carrito
    cantidadDe(categoria, id) {
        return this.#items.filter(p => p.categoria === categoria && p.id === id).length;
    }

    // Paso 1: resumen previo (Checkout/resumen, sin cobrar)
    async comprar() {
        const metodo = document.querySelector('input[name="pago"]:checked').value;
        try {
            const r = await this.app.api.generarResumen(this.app.sesion.usuario.id, metodo);
            const dato = (n) => r[n] ?? r[n.charAt(0).toLowerCase() + n.slice(1)];
            const lineas = Formato.agrupar(dato("Productos") ?? []).map(({ producto: p, cantidad }) => ({
                nombre: p.nombre, categoria: p.categoria, cantidad, subtotal: p.precio * cantidad
            }));
            this.#mostrarComprobante({
                titulo: "Resumen de compra",
                numero: "Pendiente",
                fecha: new Date(),
                cliente: dato("Cliente"), correo: dato("Correo"), metodo: dato("MetodoPagoElegido"),
                lineas, total: dato("TotalAPagar"),
                nota: "Revisa tu pedido. Al confirmar se descuenta el stock y se genera la factura.",
                confirmar: true
            });
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    // Paso 2: confirmar la compra (Compra/confirmar): descuenta stock y genera la factura
    async confirmar() {
        const metodo = document.querySelector('input[name="pago"]:checked').value;
        const boton = document.getElementById("btnConfirmarCompra");
        boton.disabled = true;
        try {
            const f = await this.app.api.confirmarCompra(this.app.sesion.usuario.id, metodo);
            this.#mostrarComprobante({
                titulo: "Factura de venta",
                numero: "GV-" + String(f.numero).padStart(5, "0"),
                fecha: new Date(f.fecha),
                cliente: f.cliente, correo: f.correo, metodo: f.metodoPago,
                lineas: f.productos, total: f.total,
                nota: "¡Compra realizada con éxito! El stock fue actualizado.",
                confirmar: false
            });
            await this.app.recargar();
        } catch (error) {
            boton.disabled = false;
            Aviso.mostrar(error.message, true);
        }
    }

    #mostrarComprobante(c) {
        const fecha = c.fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
        const lineas = c.lineas.map(l => `
            <div class="factura__linea">
                <span>${l.cantidad} × ${Formato.escapar(l.nombre)} <small style="color:var(--texto-suave)">(${Formato.escapar(l.categoria)})</small></span>
                <span>${Formato.precio(l.subtotal)}</span>
            </div>`).join("");

        const acciones = c.confirmar
            ? `<button class="boton boton--texto" onclick="this.closest('dialog').close()">Volver</button>
               <button class="boton boton--principal" id="btnConfirmarCompra">Confirmar compra</button>`
            : `<button class="boton boton--borde" onclick="window.print()">Imprimir</button>
               <button class="boton boton--principal" onclick="this.closest('dialog').close()">Listo</button>`;

        document.getElementById("contenidoFactura").innerHTML = `
            <div class="factura__cabecera">
                <div>
                    <p class="etiqueta" style="margin:0">Game Vault</p>
                    <h3>${c.titulo}</h3>
                </div>
                <div class="factura__numero">N.º ${c.numero}<br>${fecha}</div>
            </div>
            <div class="factura__datos">
                Cliente: <b>${Formato.escapar(c.cliente)}</b><br>
                Correo: <b>${Formato.escapar(c.correo)}</b><br>
                Método de pago: <b>${Formato.escapar(c.metodo)}</b>
            </div>
            <div class="factura__lineas">${lineas}</div>
            <div class="factura__total"><span>Total</span><span>${Formato.precio(c.total)}</span></div>
            <p class="factura__nota ${c.confirmar ? "" : "factura__nota--exito"}">${c.nota}</p>
            <div class="modal__acciones">${acciones}</div>`;

        if (c.confirmar) document.getElementById("btnConfirmarCompra").addEventListener("click", () => this.confirmar());
        const modal = document.getElementById("modalFactura");
        if (!modal.open) modal.showModal();
    }
}

/* ---------- Vista: Gestión de productos y usuarios ---------- */
class VistaGestion {
    #productos = [];
    #usuarios = [];

    constructor(app) {
        this.app = app;

        document.querySelectorAll(".pestana").forEach(p => p.addEventListener("click", () => {
            document.querySelectorAll(".pestana").forEach(x => x.classList.toggle("activa", x === p));
            document.querySelectorAll(".panel").forEach(x => x.classList.toggle("activo", x.id === `panel-${p.dataset.pestana}`));
        }));

        document.getElementById("btnNuevoProducto").addEventListener("click", () => this.abrirProducto());
        document.getElementById("btnNuevoUsuario").addEventListener("click", () => this.abrirUsuario());
        document.getElementById("formProducto").addEventListener("submit", e => this.guardarProducto(e));
        document.getElementById("formUsuario").addEventListener("submit", e => this.guardarUsuario(e));
        document.getElementById("prodCategoria").addEventListener("change", e => this.#ajustarCampos(Categorias.de(e.target.value)));

        document.getElementById("tablaProductos").addEventListener("click", e => this.#accionProducto(e));
        document.getElementById("tablaUsuarios").addEventListener("click", e => this.#accionUsuario(e));
    }

    async cargar(productos) {
        this.#productos = productos;
        this.#pintarProductos();
        try {
            this.#usuarios = await this.app.api.obtenerUsuarios();
            this.#pintarUsuarios();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    #pintarProductos() {
        document.getElementById("tablaProductos").innerHTML = this.#productos.map(p => {
            const cat = Categorias.de(p.categoria);
            return `
            <tr>
                <td>${p.id}</td>
                <td><span class="insignia">${cat.nombre}</span></td>
                <td>${Formato.escapar(p.nombre)}</td>
                <td>${Formato.escapar(cat.detalle(p))}</td>
                <td>${Formato.precio(p.precio)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="boton-icono" data-editar="${Categorias.clave(p)}">Editar</button>
                    <button class="boton-icono peligro" data-eliminar="${Categorias.clave(p)}">Eliminar</button>
                </td>
            </tr>`;
        }).join("");
    }

    #pintarUsuarios() {
        document.getElementById("tablaUsuarios").innerHTML = this.#usuarios.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${Formato.escapar(u.nombre)}</td>
                <td>${Formato.escapar(u.username)}</td>
                <td>${Formato.escapar(u.correo)}</td>
                <td><span class="insignia insignia--${u.rol.toLowerCase()}">${Formato.escapar(u.rol)}</span></td>
                <td>
                    <button class="boton-icono" data-editar="${u.id}">Editar</button>
                    <button class="boton-icono peligro" data-eliminar="${u.id}">Eliminar</button>
                </td>
            </tr>`).join("");
    }

    async #accionProducto(evento) {
        const boton = evento.target.closest("[data-editar], [data-eliminar]");
        if (!boton) return;
        const clave = boton.dataset.editar ?? boton.dataset.eliminar;
        const producto = this.#productos.find(p => Categorias.clave(p) === clave);
        const cat = Categorias.de(producto.categoria);

        if (boton.dataset.editar) return this.abrirProducto(producto);
        if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
        try {
            const r = await this.app.api.eliminarProducto(cat, producto.id);
            Aviso.mostrar(r.mensaje);
            await this.app.recargar();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    async #accionUsuario(evento) {
        const editar = evento.target.closest("[data-editar]");
        const eliminar = evento.target.closest("[data-eliminar]");
        if (editar) return this.abrirUsuario(this.#usuarios.find(u => u.id === Number(editar.dataset.editar)));
        if (!eliminar || !confirm("¿Eliminar este usuario?")) return;
        try {
            const r = await this.app.api.eliminarUsuario(Number(eliminar.dataset.eliminar));
            Aviso.mostrar(r.mensaje);
            await this.app.recargar();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    // Cambia las etiquetas y sugerencias de los dos campos propios según la categoría
    #ajustarCampos(cat) {
        const c = cat.campos();
        document.getElementById("lblCampoA").textContent = c.a;
        document.getElementById("lblCampoB").textContent = c.b;
        document.getElementById("listaCampoA").innerHTML = c.sugerenciasA.map(s => `<option value="${s}">`).join("");
        document.getElementById("listaCampoB").innerHTML = c.sugerenciasB.map(s => `<option value="${s}">`).join("");
    }

    abrirProducto(p = null) {
        const cat = Categorias.de(p?.categoria ?? "Videojuego");
        const [a, b] = p ? cat.leerCampos(p) : ["", ""];
        const selCategoria = document.getElementById("prodCategoria");

        document.getElementById("tituloProducto").textContent = p ? `Editar ${cat.nombre.toLowerCase()}` : "Nuevo producto";
        document.getElementById("prodId").value = p?.id ?? "";
        selCategoria.value = cat.nombre;
        selCategoria.disabled = p !== null;   // al editar no se cambia la categoría
        document.getElementById("prodNombre").value = p?.nombre ?? "";
        document.getElementById("prodPrecio").value = p?.precio ?? "";
        document.getElementById("prodStock").value = p?.stock ?? "";
        document.getElementById("prodCampoA").value = a;
        document.getElementById("prodCampoB").value = b;
        this.#ajustarCampos(cat);
        document.getElementById("modalProducto").showModal();
    }

    async guardarProducto(evento) {
        evento.preventDefault();
        const id = document.getElementById("prodId").value;
        const cat = Categorias.de(document.getElementById("prodCategoria").value);
        const base = {
            nombre: document.getElementById("prodNombre").value.trim(),
            precio: Number(document.getElementById("prodPrecio").value),
            stock: Number(document.getElementById("prodStock").value)
        };
        const producto = cat.crearCuerpo(base,
            document.getElementById("prodCampoA").value.trim(),
            document.getElementById("prodCampoB").value.trim());
        try {
            id ? await this.app.api.actualizarProducto(cat, id, producto) : await this.app.api.crearProducto(cat, producto);
            document.getElementById("modalProducto").close();
            Aviso.mostrar(id ? `${cat.nombre} actualizado` : `${cat.nombre} registrado`);
            await this.app.recargar();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    abrirUsuario(u = null, soloCliente = false) {
        document.getElementById("tituloUsuario").textContent = u ? "Editar usuario" : (soloCliente ? "Registro de cliente" : "Nuevo usuario");
        document.getElementById("usuId").value = u?.id ?? "";
        document.getElementById("usuNombre").value = u?.nombre ?? "";
        document.getElementById("usuUsername").value = u?.username ?? "";
        document.getElementById("usuCorreo").value = u?.correo ?? "";
        document.getElementById("usuKey").value = u?.keyAcceso ?? "";
        const rol = document.getElementById("usuRol");
        rol.value = u?.rol ?? "Cliente";
        rol.disabled = soloCliente;
        document.getElementById("modalUsuario").showModal();
    }

    async guardarUsuario(evento) {
        evento.preventDefault();
        const id = document.getElementById("usuId").value;
        const usuario = {
            nombre: document.getElementById("usuNombre").value.trim(),
            username: document.getElementById("usuUsername").value.trim(),
            correo: document.getElementById("usuCorreo").value.trim(),
            rol: document.getElementById("usuRol").value,
            keyAcceso: document.getElementById("usuKey").value.trim()
        };
        try {
            id ? await this.app.api.actualizarUsuario(id, usuario) : await this.app.api.crearUsuario(usuario);
            document.getElementById("modalUsuario").close();
            Aviso.mostrar(id ? "Usuario actualizado" : "Usuario registrado. Ya puedes ingresar con tu key.");
            if (this.app.sesion.puedeGestionar) await this.app.recargar();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }
}

/* ---------- Aplicación principal ---------- */
class App {
    constructor() {
        this.api = new ApiTienda();
        this.sesion = new Sesion();
        this.catalogo = new VistaCatalogo(this);
        this.carrito = new VistaCarrito(this);
        this.gestion = new VistaGestion(this);

        this.#conectarNavegacion();
        this.#conectarLogin();
        this.#actualizarSesion();
        this.recargar();
    }

    async recargar() {
        try {
            const productos = await this.api.obtenerCatalogo();
            this.catalogo.cargar(productos);
            if (this.sesion.puedeGestionar) await this.gestion.cargar(productos);
            if (this.sesion.puedeComprar) await this.carrito.cargar();
        } catch (error) {
            Aviso.mostrar("No se pudo conectar con la API: " + error.message, true);
        }
    }

    mostrarVista(nombre) {
        document.querySelectorAll(".vista").forEach(v => v.classList.toggle("activa", v.id === `vista-${nombre}`));
        document.querySelectorAll(".menu__item").forEach(m => m.classList.toggle("activo", m.dataset.vista === nombre));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async agregarAlCarrito(categoria, productoId) {
        if (!this.sesion.activa) {
            Aviso.mostrar("Ingresa con tu key para agregar productos");
            document.getElementById("modalLogin").showModal();
            return;
        }
        const producto = this.catalogo.buscar(categoria, productoId);
        if (producto && this.carrito.cantidadDe(categoria, productoId) >= producto.stock) {
            Aviso.mostrar(`Solo hay ${producto.stock} unidades de "${producto.nombre}"`, true);
            return;
        }
        try {
            const r = await this.api.agregarAlCarrito(this.sesion.usuario.id, categoria, productoId);
            Aviso.mostrar(r.mensaje);
            await this.carrito.cargar();
        } catch (error) { Aviso.mostrar(error.message, true); }
    }

    #conectarNavegacion() {
        document.querySelectorAll("[data-vista]").forEach(b => b.addEventListener("click", e => {
            e.preventDefault();
            this.mostrarVista(b.dataset.vista);
        }));
        document.querySelectorAll("[data-cerrar]").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));
    }

    #conectarLogin() {
        const modal = document.getElementById("modalLogin");
        const error = document.getElementById("errorLogin");

        document.getElementById("formLogin").addEventListener("submit", async e => {
            e.preventDefault();
            error.classList.add("oculto");
            try {
                const r = await this.api.validarKey(document.getElementById("txtKey").value.trim());
                this.sesion.iniciar(r.usuario);
                modal.close();
                document.getElementById("txtKey").value = "";
                Aviso.mostrar(`¡Hola, ${r.usuario.nombre}!`);
                this.#actualizarSesion();
                await this.recargar();
            } catch (err) {
                error.textContent = err.message;
                error.classList.remove("oculto");
            }
        });

        document.getElementById("lnkRegistro").addEventListener("click", e => {
            e.preventDefault();
            modal.close();
            this.gestion.abrirUsuario(null, true);
        });
    }

    #actualizarSesion() {
        const zona = document.getElementById("zonaSesion");
        const u = this.sesion.usuario;

        document.querySelectorAll(".solo-compra").forEach(el => el.classList.toggle("oculto", !this.sesion.puedeComprar));
        document.querySelectorAll(".solo-gestion").forEach(el => el.classList.toggle("oculto", !this.sesion.puedeGestionar));

        if (!u) {
            zona.innerHTML = `<button class="boton boton--borde" id="btnAbrirLogin">Ingresar</button>`;
            document.getElementById("btnAbrirLogin").addEventListener("click", () => document.getElementById("modalLogin").showModal());
            this.mostrarVista("catalogo");
            return;
        }

        zona.innerHTML = `
            <div class="sesion__usuario">
                <div class="sesion__nombre">${Formato.escapar(u.nombre)}</div>
                <div class="sesion__rol">${Formato.escapar(u.rol)}</div>
            </div>
            <div class="avatar">${Formato.iniciales(u.nombre)}</div>
            <button class="boton boton--texto" id="btnSalir">Salir</button>`;
        document.getElementById("btnSalir").addEventListener("click", () => {
            this.sesion.cerrar();
            this.#actualizarSesion();
            this.catalogo.pintar();
        });
    }
}

new App();
