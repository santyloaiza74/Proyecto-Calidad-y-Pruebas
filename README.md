# 🏪 Minimarket Express

## Prompt original

Actúa como un Desarrollador Software Junior. Necesito que crees una aplicación web sencilla en un solo archivo HTML (que incluya HTML, CSS con estilos básicos y JavaScript nativo) para que pueda ejecutarla localmente abriéndola directamente en mi navegador, sin instalar servidores ni dependencias.

### Idea de negocio a implementar

**Idea: Control de Inventario y Stock para Minimarket**

**Reglas de negocio clave:**

* No se puede registrar una venta si la cantidad solicitada supera el stock disponible.
* Si el stock de un producto cae por debajo de 5 unidades, la UI debe mostrar la alerta **"Stock Crítico"**.
* El precio de venta siempre debe ser estrictamente mayor al precio de costo.

### Requisitos de desarrollo

1. La aplicación debe ser totalmente funcional a nivel de interfaz (UI) para mostrar el flujo principal de la idea.

2. Utiliza `localStorage` si necesitas simular la persistencia de datos.

3. **Instrucción clave de calidad (Bugs deliberados):** Introduce entre 5 y 10 problemas de calidad de software que solo puedan ser detectables con las pruebas adecuadas, por ejemplo con checklists, sonarqube, o pruebas unitarias (ej. errores de validación en inputs, fallos de lógica al calcular totales, problemas de límites/boundary values, persistencia inconsistente o falta de manejo de caracteres especiales). **NO me digas cuáles son los errores ni dónde están.**

4. Entrégame el código completo listo para guardar en un archivo `index.html`.

---

# 🤖 Respuesta de la IA

¡Hola! Claro que sí, con gusto asumiré el rol de Desarrollador Software Junior y construiré la aplicación web de Control de Inventario y Stock para Minimarket en un único archivo HTML.

Voy a generar la aplicación completa, incluyendo el diseño responsive con Tailwind CSS, persistencia en localStorage, seeding de datos iniciales y todas las funcionalidades solicitadas para la gestión de productos, caja/ventas, historial y métricas del dashboard.

Procedo a generar el código de la aplicación.

---

# 💻 Código

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minimarket Express - Control de Inventario</title>
    <!-- Tailwind CSS CDN para estilos rápidos y responsive -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen flex flex-col">

    <!-- Header/Navegación principal -->
    <header class="bg-indigo-700 text-white shadow-md">
        <div class="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center space-x-3">
                <i class="fa-solid fa-store text-2xl text-yellow-400"></i>
                <h1 class="text-xl font-bold tracking-wide">Minimarket Express - Sistema de Stock</h1>
            </div>
            <nav class="flex space-x-2 bg-indigo-800 p-1 rounded-lg text-sm">
                <button onclick="cambiarPestana('dashboard')" id="btn-dashboard" class="px-4 py-2 rounded-md transition font-medium bg-indigo-600 text-white">
                    <i class="fa-solid fa-chart-pie mr-2"></i>Dashboard
                </button>
                <button onclick="cambiarPestana('productos')" id="btn-productos" class="px-4 py-2 rounded-md transition font-medium text-indigo-200 hover:text-white">
                    <i class="fa-solid fa-boxes-stacked mr-2"></i>Productos
                </button>
                <button onclick="cambiarPestana('ventas')" id="btn-ventas" class="px-4 py-2 rounded-md transition font-medium text-indigo-200 hover:text-white">
                    <i class="fa-solid fa-cart-shopping mr-2"></i>Punto de Venta
                </button>
                <button onclick="cambiarPestana('historial')" id="btn-historial" class="px-4 py-2 rounded-md transition font-medium text-indigo-200 hover:text-white">
                    <i class="fa-solid fa-receipt mr-2"></i>Historial
                </button>
            </nav>
        </div>
    </header>

    <!-- Contenido Principal -->
    <main class="container mx-auto px-4 py-6 flex-1">
        
        <!-- Notificaciones flotantes -->
        <div id="alerta-container" class="fixed bottom-4 right-4 z-50 flex flex-col space-y-2"></div>

        <!-- VISTA DASHBOARD -->
        <section id="vista-dashboard" class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-slate-800">Panel de Control</h2>
                <button onclick="reiniciarDatos()" class="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-md transition">
                    <i class="fa-solid fa-rotate-right mr-1"></i>Restablecer datos demo
                </button>
            </div>

            <!-- Cards de Métricas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Valor del Inventario</p>
                        <h3 id="metric-valor-inventario" class="text-3xl font-extrabold text-indigo-600 mt-1">$0.00</h3>
                        <p class="text-xs text-slate-400 mt-1">Costo total acumulado</p>
                    </div>
                    <div class="p-4 bg-indigo-50 rounded-full text-indigo-600">
                        <i class="fa-solid fa-sack-dollar text-2xl"></i>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Stock Crítico</p>
                        <h3 id="metric-stock-critico" class="text-3xl font-extrabold text-amber-600 mt-1">0</h3>
                        <p class="text-xs text-slate-400 mt-1">Productos que requieren reabastecimiento</p>
                    </div>
                    <div class="p-4 bg-amber-50 rounded-full text-amber-600">
                        <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ventas de Hoy</p>
                        <h3 id="metric-ventas-hoy" class="text-3xl font-extrabold text-emerald-600 mt-1">$0.00</h3>
                        <p class="text-xs text-slate-400 mt-1">Total recaudado el día de hoy</p>
                    </div>
                    <div class="p-4 bg-emerald-50 rounded-full text-emerald-600">
                        <i class="fa-solid fa-chart-line text-2xl"></i>
                    </div>
                </div>
            </div>

            <!-- Tabla Resumen Stock Crítico -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <i class="fa-solid fa-bell text-amber-500 mr-2"></i>Alertas de Reabastecimiento
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th class="p-3">SKU</th>
                                <th class="p-3">Producto</th>
                                <th class="p-3">Categoría</th>
                                <th class="p-3">Stock Actual</th>
                                <th class="p-3">Estado</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-dashboard-criticos" class="divide-y divide-slate-100">
                            <!-- JS cargará las filas aquí -->
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- VISTA PRODUCTOS -->
        <section id="vista-productos" class="hidden space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 class="text-2xl font-bold text-slate-800">Catálogo de Productos</h2>
                <button onclick="abrirModalProducto()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition flex items-center justify-center">
                    <i class="fa-solid fa-plus mr-2"></i>Nuevo Producto
                </button>
            </div>

            <!-- Tabla de Productos -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <input type="text" id="input-buscar-producto" onkeyup="filtrarProductos()" placeholder="Buscar por nombre o SKU..." class="px-3 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-100 text-slate-600 uppercase text-xs">
                            <tr>
                                <th class="p-3">SKU</th>
                                <th class="p-3">Nombre</th>
                                <th class="p-3">Categoría</th>
                                <th class="p-3">Costo</th>
                                <th class="p-3">P. Venta</th>
                                <th class="p-3">Stock</th>
                                <th class="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-productos" class="divide-y divide-slate-200">
                            <!-- Contenido renderizado por JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- VISTA VENTAS / CAJA CHICA -->
        <section id="vista-ventas" class="hidden space-y-6">
            <h2 class="text-2xl font-bold text-slate-800">Punto de Venta</h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Formulario de Selección -->
                <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <h3 class="text-lg font-bold text-slate-800 mb-2 border-b pb-2">Registrar Ítem</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Seleccionar Producto</label>
                            <select id="select-venta-producto" onchange="actualizarInfoProductoVenta()" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500">
                                <option value="">-- Seleccione un producto --</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Cantidad a Vender</label>
                            <input type="number" id="input-venta-cantidad" min="1" value="1" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>

                    <!-- Detalle del Producto Seleccionado -->
                    <div id="detalle-producto-venta" class="hidden bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-1">
                        <p><span class="font-semibold text-slate-600">Stock disponible:</span> <span id="info-venta-stock" class="font-bold">0</span></p>
                        <p><span class="font-semibold text-slate-600">Precio Unitario:</span> $<span id="info-venta-precio">0.00</span></p>
                    </div>

                    <button onclick="agregarAlCarrito()" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center">
                        <i class="fa-solid fa-cart-plus mr-2"></i>Agregar al Carrito
                    </button>
                </div>

                <!-- Resumen de Venta / Carrito -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Carrito de Compra</h3>
                        <div id="carrito-items" class="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100">
                            <p class="text-slate-400 text-center py-6 text-sm">El carrito está vacío</p>
                        </div>
                    </div>

                    <div class="border-t border-slate-200 pt-4 space-y-3">
                        <div class="flex justify-between text-base font-bold text-slate-800">
                            <span>Total a Pagar:</span>
                            <span id="cart-total-precio" class="text-indigo-600 text-xl">$0.00</span>
                        </div>
                        <button onclick="procesarVenta()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transition flex items-center justify-center">
                            <i class="fa-solid fa-check-circle mr-2"></i>Completar Venta
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- VISTA HISTORIAL -->
        <section id="vista-historial" class="hidden space-y-6">
            <h2 class="text-2xl font-bold text-slate-800">Historial de Ventas</h2>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-slate-100 text-slate-600 uppercase text-xs">
                            <tr>
                                <th class="p-3">ID Transacción</th>
                                <th class="p-3">Fecha</th>
                                <th class="p-3">Productos</th>
                                <th class="p-3">Total Venta</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-historial-ventas" class="divide-y divide-slate-200">
                            <!-- Cargado por JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

    </main>

    <!-- Modal Producto (Crear / Editar) -->
    <div id="modal-producto" class="fixed inset-0 bg-slate-900/50 hidden flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div class="flex justify-between items-center border-b pb-3">
                <h3 id="modal-titulo" class="text-lg font-bold text-slate-800">Agregar Producto</h3>
                <button onclick="cerrarModalProducto()" class="text-slate-400 hover:text-slate-600">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <form id="form-producto" onsubmit="guardarProducto(event)" class="space-y-3">
                <input type="hidden" id="prod-id">
                
                <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">SKU / Código</label>
                    <input type="text" id="prod-sku" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Producto</label>
                    <input type="text" id="prod-nombre" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Categoría</label>
                    <input type="text" id="prod-categoria" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Precio Costo</label>
                        <input type="number" step="0.01" id="prod-costo" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Precio Venta</label>
                        <input type="number" step="0.01" id="prod-precio" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-600 uppercase mb-1">Stock Inicial / Actual</label>
                    <input type="number" id="prod-stock" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500">
                </div>

                <div class="flex justify-end space-x-2 pt-3 border-t">
                    <button type="button" onclick="cerrarModalProducto()" class="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Scripts de la Aplicación -->
    <script>
        // Datos Iniciales (Seed)
        const productosIniciales = [
            { id: 1, sku: "PROD-001", nombre: "Leche Entera 1L", categoria: "Lácteos", costo: 1.20, precio: 1.80, stock: 12 },
            { id: 2, sku: "PROD-002", nombre: "Pan Molde Familiar", categoria: "Panadería", costo: 1.50, precio: 2.30, stock: 4 },
            { id: 3, sku: "PROD-003", nombre: "Aceite Vegetal 900ml", categoria: "Abarrotes", costo: 2.80, precio: 3.90, stock: 3 },
            { id: 4, sku: "PROD-004", nombre: "Arroz Extra 1kg", categoria: "Abarrotes", costo: 0.90, precio: 1.40, stock: 25 },
            { id: 5, sku: "PROD-005", nombre: "Gaseosa Cola 1.5L", categoria: "Bebidas", costo: 1.10, precio: 1.75, stock: 5 }
        ];

        let productos = [];
        let ventas = [];
        let carrito = [];

        // Inicialización al cargar la página
        window.onload = function() {
            cargarEstado();
            renderizarTodo();
        };

        // Carga desde localStorage o carga datos seed
        function cargarEstado() {
            const prodLocal = localStorage.getItem('minimarket_productos');
            const ventLocal = localStorage.getItem('minimarket_ventas');

            if (prodLocal) {
                productos = JSON.parse(prodLocal);
            } else {
                productos = [...productosIniciales];
                guardarProductosStorage();
            }

            if (ventLocal) {
                ventas = JSON.parse(ventLocal);
            } else {
                ventas = [];
                localStorage.setItem('minimarket_ventas', JSON.stringify(ventas));
            }
        }

        function guardarProductosStorage() {
            localStorage.setItem('minimarket_productos', JSON.stringify(productos));
        }

        function guardarVentasStorage() {
            localStorage.setItem('minimarket_ventas', JSON.stringify(ventas));
        }

        function reiniciarDatos() {
            localStorage.removeItem('minimarket_productos');
            localStorage.removeItem('minimarket_ventas');
            carrito = [];
            cargarEstado();
            renderizarTodo();
            mostrarAlerta("Datos restablecidos con éxito", "success");
        }

        // Navegación entre pestañas
        function cambiarPestana(pestana) {
            const vistas = ['dashboard', 'productos', 'ventas', 'historial'];
            vistas.forEach(v => {
                document.getElementById(`vista-${v}`).classList.add('hidden');
                document.getElementById(`btn-${v}`).classList.remove('bg-indigo-600', 'text-white');
                document.getElementById(`btn-${v}`).classList.add('text-indigo-200');
            });

            document.getElementById(`vista-${pestana}`).classList.remove('hidden');
            document.getElementById(`btn-${pestana}`).classList.add('bg-indigo-600', 'text-white');
            document.getElementById(`btn-${pestana}`).classList.remove('text-indigo-200');

            if (pestana === 'ventas') cargarSelectVentas();
        }

        // Renderizado general
        function renderizarTodo() {
            renderizarDashboard();
            renderizarProductos();
            renderizarHistorial();
        }

        // --- VISTA DASHBOARD ---
        function renderizarDashboard() {
            // Métrica: Total Valorizado
            let totalValor = 0;
            for(let i = 0; i < productos.length; i++) {
                totalValor += productos[i].costo * productos[i].stock;
            }
            document.getElementById('metric-valor-inventario').innerText = '$' + totalValor.toFixed(2);

            // Métrica: Stock Crítico (< 5)
            let criticos = productos.filter(p => p.stock < 5);
            document.getElementById('metric-stock-critico').innerText = criticos.length;

            // Métrica: Ventas de Hoy
            const hoy = new Date().toISOString().split('T')[0];
            let totalHoy = 0;
            ventas.forEach(v => {
                if(v.fecha.startsWith(hoy)) {
                    totalHoy += v.total;
                }
            });
            document.getElementById('metric-ventas-hoy').innerText = '$' + totalHoy.toFixed(2);

            // Tabla Alertas Críticas
            const tbody = document.getElementById('tabla-dashboard-criticos');
            tbody.innerHTML = '';
            
            criticos.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="p-3 font-mono text-xs">${p.sku}</td>
                    <td class="p-3 font-medium">${p.nombre}</td>
                    <td class="p-3 text-slate-500">${p.categoria}</td>
                    <td class="p-3 font-bold text-amber-600">${p.stock}</td>
                    <td class="p-3"><span class="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold">Stock Crítico</span></td>
                `;
                tbody.appendChild(tr);
            });

            if(criticos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No hay productos en stock crítico.</td></tr>`;
            }
        }

        // --- VISTA PRODUCTOS ---
        function renderizarProductos(lista = productos) {
            const tbody = document.getElementById('tabla-productos');
            tbody.innerHTML = '';

            lista.forEach(p => {
                const tr = document.createElement('tr');
                
                let alertaStock = p.stock < 5 ? '<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Stock Crítico</span>' : '';

                tr.innerHTML = `
                    <td class="p-3 font-mono text-xs text-slate-500">${p.sku}</td>
                    <td class="p-3 font-medium">${p.nombre} ${alertaStock}</td>
                    <td class="p-3 text-slate-500">${p.categoria}</td>
                    <td class="p-3">$${p.costo.toFixed(2)}</td>
                    <td class="p-3 font-semibold text-slate-700">$${p.precio.toFixed(2)}</td>
                    <td class="p-3 font-bold">${p.stock}</td>
                    <td class="p-3 text-center space-x-2">
                        <button onclick="editarProducto(${p.id})" class="text-indigo-600 hover:text-indigo-900"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="eliminarProducto(${p.id})" class="text-rose-600 hover:text-rose-900"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function filtrarProductos() {
            const query = document.getElementById('input-buscar-producto').value.toLowerCase();
            const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
            renderizarProductos(filtrados);
        }

        function abrirModalProducto(prod = null) {
            const modal = document.getElementById('modal-producto');
            const titulo = document.getElementById('modal-titulo');
            
            if (prod) {
                titulo.innerText = 'Editar Producto';
                document.getElementById('prod-id').value = prod.id;
                document.getElementById('prod-sku').value = prod.sku;
                document.getElementById('prod-nombre').value = prod.nombre;
                document.getElementById('prod-categoria').value = prod.categoria;
                document.getElementById('prod-costo').value = prod.costo;
                document.getElementById('prod-precio').value = prod.precio;
                document.getElementById('prod-stock').value = prod.stock;
            } else {
                titulo.innerText = 'Agregar Producto';
                document.getElementById('form-producto').reset();
                document.getElementById('prod-id').value = '';
            }

            modal.classList.remove('hidden');
        }

        function cerrarModalProducto() {
            document.getElementById('modal-producto').classList.add('hidden');
        }

        function guardarProducto(event) {
            event.preventDefault();

            const id = document.getElementById('prod-id').value;
            const sku = document.getElementById('prod-sku').value;
            const nombre = document.getElementById('prod-nombre').value;
            const categoria = document.getElementById('prod-categoria').value;
            const costo = parseFloat(document.getElementById('prod-costo').value);
            const precio = parseFloat(document.getElementById('prod-precio').value);
            const stock = parseInt(document.getElementById('prod-stock').value);

            // Regla de Negocio: Precio de venta mayor al costo
            if (precio <= costo) {
                mostrarAlerta("El precio de venta debe ser estrictamente mayor al precio de costo.", "error");
                return;
            }

            if (id) {
                // Editar existente
                const index = productos.findIndex(p => p.id == id);
                if (index !== -1) {
                    productos[index] = { id: parseInt(id), sku, nombre, categoria, costo, precio, stock };
                }
            } else {
                // Crear nuevo
                const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
                productos.push({ id: nuevoId, sku, nombre, categoria, costo, precio, stock });
            }

            guardarProductosStorage();
            renderizarTodo();
            cerrarModalProducto();
            mostrarAlerta("Producto guardado correctamente", "success");
        }

        function editarProducto(id) {
            const prod = productos.find(p => p.id === id);
            if (prod) abrirModalProducto(prod);
        }

        function eliminarProducto(id) {
            productos = productos.filter(p => p.id !== id);
            guardarProductosStorage();
            renderizarTodo();
            mostrarAlerta("Producto eliminado", "info");
        }

        // --- VISTA VENTAS / PUNTO DE VENTA ---
        function cargarSelectVentas() {
            const select = document.getElementById('select-venta-producto');
            select.innerHTML = '<option value="">-- Seleccione un producto --</option>';
            
            productos.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.text = `${p.nombre} (Stock: ${p.stock}) - $${p.precio.toFixed(2)}`;
                select.appendChild(option);
            });
        }

        function actualizarInfoProductoVenta() {
            const prodId = document.getElementById('select-venta-producto').value;
            const infoBox = document.getElementById('detalle-producto-venta');

            if(!prodId) {
                infoBox.classList.add('hidden');
                return;
            }

            const p = productos.find(item => item.id == prodId);
            if(p) {
                document.getElementById('info-venta-stock').innerText = p.stock;
                document.getElementById('info-venta-precio').innerText = p.precio.toFixed(2);
                infoBox.classList.remove('hidden');
            }
        }

        function agregarAlCarrito() {
            const prodId = document.getElementById('select-venta-producto').value;
            const cantidad = parseInt(document.getElementById('input-venta-cantidad').value);

            if(!prodId) {
                mostrarAlerta("Por favor seleccione un producto", "error");
                return;
            }

            const p = productos.find(item => item.id == prodId);

            if(!p) return;

            // Regla de Negocio: No vender mas del stock disponible
            if(cantidad > p.stock) {
                mostrarAlerta(`No se puede solicitar más del stock disponible (${p.stock})`, "error");
                return;
            }

            // Agregar o actualizar en carrito
            const itemExistente = carrito.find(c => c.productoId == p.id);
            if(itemExistente) {
                if((itemExistente.cantidad + cantidad) > p.stock) {
                    mostrarAlerta(`La cantidad total en carrito supera el stock disponible`, "error");
                    return;
                }
                itemExistente.cantidad += cantidad;
                itemExistente.subtotal = itemExistente.cantidad * p.precio;
            } else {
                carrito.push({
                    productoId: p.id,
                    nombre: p.nombre,
                    precioUnitario: p.precio,
                    cantidad: cantidad,
                    subtotal: cantidad * p.precio
                });
            }

            renderizarCarrito();
            mostrarAlerta("Producto agregado al carrito", "success");
        }

        function renderizarCarrito() {
            const container = document.getElementById('carrito-items');
            container.innerHTML = '';

            if(carrito.length === 0) {
                container.innerHTML = '<p class="text-slate-400 text-center py-6 text-sm">El carrito está vacío</p>';
                document.getElementById('cart-total-precio').innerText = '$0.00';
                return;
            }

            let total = 0;

            carrito.forEach((item, index) => {
                total += item.subtotal;
                const div = document.createElement('div');
                div.className = 'pt-2 flex justify-between items-center text-sm';
                div.innerHTML = `
                    <div>
                        <p class="font-medium text-slate-800">${item.nombre}</p>
                        <p class="text-xs text-slate-500">${item.cantidad} x $${item.precioUnitario.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="font-bold text-slate-700">$${item.subtotal.toFixed(2)}</span>
                        <button onclick="removerDelCarrito(${index})" class="text-rose-500 hover:text-rose-700 text-xs">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                `;
                container.appendChild(div);
            });

            document.getElementById('cart-total-precio').innerText = '$' + total.toFixed(2);
        }

        function removerDelCarrito(index) {
            carrito.splice(index, 1);
            renderizarCarrito();
        }

        function procesarVenta() {
            if(carrito.length === 0) {
                mostrarAlerta("El carrito está vacío", "error");
                return;
            }

            // Descontar Stock
            carrito.forEach(item => {
                const prod = productos.find(p => p.id === item.productoId);
                if(prod) {
                    prod.stock -= item.cantidad;
                }
            });

            // Registrar Venta
            let totalVenta = 0;
            carrito.forEach(i => totalVenta += i.subtotal);

            const nuevaVenta = {
                id: "V-" + Date.now().toString().slice(-6),
                fecha: new Date().toISOString(),
                items: [...carrito],
                total: totalVenta
            };

            ventas.push(nuevaVenta);

            // Persistir cambios
            guardarProductosStorage();
            guardarVentasStorage();

            // Limpiar carrito y actualizar UI
            carrito = [];
            renderizarCarrito();
            renderizarTodo();
            cargarSelectVentas();

            mostrarAlerta("¡Venta completada con éxito!", "success");
        }

        // --- VISTA HISTORIAL ---
        function renderizarHistorial() {
            const tbody = document.getElementById('tabla-historial-ventas');
            tbody.innerHTML = '';

            if(ventas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-slate-400">No hay ventas registradas.</td></tr>';
                return;
            }

            ventas.slice().reverse().forEach(v => {
                const tr = document.createElement('tr');
                const fechaFormatted = new Date(v.fecha).toLocaleString('es-ES');
                
                const productosTexto = v.items.map(i => `${i.nombre} (x${i.cantidad})`).join(', ');

                tr.innerHTML = `
                    <td class="p-3 font-mono text-xs text-indigo-600 font-semibold">${v.id}</td>
                    <td class="p-3 text-slate-500 text-xs">${fechaFormatted}</td>
                    <td class="p-3 text-slate-700">${productosTexto}</td>
                    <td class="p-3 font-bold text-emerald-600">$${v.total.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // --- SISTEMA DE ALERTAS UI ---
        function mostrarAlerta(mensaje, tipo = "info") {
            const container = document.getElementById('alerta-container');
            const div = document.createElement('div');

            let colors = "bg-slate-800 text-white";
            if(tipo === "success") colors = "bg-emerald-600 text-white";
            if(tipo === "error") colors = "bg-rose-600 text-white";
            if(tipo === "info") colors = "bg-indigo-600 text-white";

            div.className = `${colors} px-4 py-3 rounded-lg shadow-lg text-sm flex items-center justify-between min-w-[250px] transition-all duration-300 transform translate-y-2`;
            div.innerHTML = `
                <span>${mensaje}</span>
                <button onclick="this.parentElement.remove()" class="ml-3 text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            container.appendChild(div);

            setTimeout(() => {
                div.remove();
            }, 3500);
        }
    </script>
</body>
</html>
```

---

# 📖 Instrucciones de uso local

Copia todo el bloque de código anterior y guárdalo en tu equipo con el nombre `index.html`.

Haz doble clic sobre el archivo `index.html` para abrirlo directamente en tu navegador web preferido (Chrome, Firefox, Edge, Safari, etc.).

No requiere ningún servidor local (como Node.js, Apache, Live Server) ni instalación de dependencias externas.
