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
        if (typeof window !== 'undefined') {
            window.onload = function() {
                configurarEventos();
                cargarEstado();
                renderizarTodo();
            };
        }

        // --- LÓGICA DE NEGOCIO ---
        function calcularResumen(productos, ventas, fechaHoy) {
            const productosCriticos = productos.filter(producto => producto.stock < 5);
            const valorInventario = productos.reduce((total, producto) => total + producto.costo * producto.stock, 0);
            const ventasHoy = ventas
                .filter(venta => venta.fecha.startsWith(fechaHoy))
                .reduce((total, venta) => total + venta.total, 0);

            return { valorInventario, productosCriticos, ventasHoy };
        }

        function buscarProductos(productos, consulta) {
            const query = consulta.toLowerCase();
            return productos.filter(producto =>
                producto.nombre.toLowerCase().includes(query) || producto.sku.toLowerCase().includes(query)
            );
        }

        function guardarProductoEnLista(productos, datos) {
            if (datos.precio <= datos.costo) {
                throw new Error('El precio de venta debe ser estrictamente mayor al precio de costo.');
            }

            if (datos.id) {
                const id = Number(datos.id);
                return productos.map(producto => producto.id === id ? { ...datos, id } : producto);
            }

            const nuevoId = productos.length > 0 ? Math.max(...productos.map(producto => producto.id)) + 1 : 1;
            return [...productos, { ...datos, id: nuevoId }];
        }

        function agregarProductoAlCarrito(carrito, producto, cantidad) {
            const itemExistente = carrito.find(item => item.productoId === producto.id);
            const cantidadTotal = (itemExistente?.cantidad || 0) + cantidad;
            if (cantidadTotal > producto.stock) {
                throw new Error(`La cantidad solicitada supera el stock disponible (${producto.stock}).`);
            }

            if (itemExistente) {
                return carrito.map(item => item.productoId === producto.id
                    ? { ...item, cantidad: cantidadTotal, subtotal: cantidadTotal * producto.precio }
                    : item
                );
            }

            return [...carrito, {
                productoId: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precio,
                cantidad,
                subtotal: cantidad * producto.precio
            }];
        }

        function crearVenta(productos, carrito, id, fecha) {
            if (carrito.length === 0) {
                throw new Error('El carrito está vacío');
            }

            const productosActualizados = productos.map(producto => {
                const item = carrito.find(elemento => elemento.productoId === producto.id);
                if (!item) return producto;
                if (item.cantidad > producto.stock) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}.`);
                }
                return { ...producto, stock: producto.stock - item.cantidad };
            });

            const venta = {
                id,
                fecha,
                items: carrito.map(item => ({ ...item })),
                total: carrito.reduce((total, item) => total + item.subtotal, 0)
            };

            return { productos: productosActualizados, venta };
        }

        function configurarEventos() {
            document.addEventListener('click', event => {
                const button = event.target.closest('[data-action]');
                if (!button) return;

                const { action } = button.dataset;
                if (action === 'tab') cambiarPestana(button.dataset.tab);
                if (action === 'reset-demo') reiniciarDatos();
                if (action === 'new-product') abrirModalProducto();
                if (action === 'add-to-cart') agregarAlCarrito();
                if (action === 'complete-sale') procesarVenta();
                if (action === 'close-product-modal') cerrarModalProducto();
                if (action === 'edit-product') editarProducto(Number(button.dataset.id));
                if (action === 'delete-product') eliminarProducto(Number(button.dataset.id));
                if (action === 'remove-cart-item') removerDelCarrito(Number(button.dataset.index));
                if (action === 'dismiss-alert') button.parentElement.remove();
            });

            document.getElementById('input-buscar-producto').addEventListener('input', filtrarProductos);
            document.getElementById('select-venta-producto').addEventListener('change', actualizarInfoProductoVenta);
            document.getElementById('form-producto').addEventListener('submit', guardarProducto);
        }

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
            const hoy = new Date().toISOString().split('T')[0];
            const resumen = calcularResumen(productos, ventas, hoy);
            const criticos = resumen.productosCriticos;
            document.getElementById('metric-valor-inventario').innerText = '$' + resumen.valorInventario.toFixed(2);
            document.getElementById('metric-stock-critico').innerText = criticos.length;
            document.getElementById('metric-ventas-hoy').innerText = '$' + resumen.ventasHoy.toFixed(2);

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
                        <button data-action="edit-product" data-id="${p.id}" class="text-indigo-600 hover:text-indigo-900"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button data-action="delete-product" data-id="${p.id}" class="text-rose-600 hover:text-rose-900"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function filtrarProductos() {
            const query = document.getElementById('input-buscar-producto').value.toLowerCase();
            const filtrados = buscarProductos(productos, query);
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

            try {
                productos = guardarProductoEnLista(productos, {
                    id: id ? parseInt(id) : null, sku, nombre, categoria, costo, precio, stock
                });
            } catch (error) {
                mostrarAlerta(error.message, "error");
                return;
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

            try {
                carrito = agregarProductoAlCarrito(carrito, p, cantidad);
            } catch (error) {
                mostrarAlerta(error.message, "error");
                return;
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
                        <button data-action="remove-cart-item" data-index="${index}" class="text-rose-500 hover:text-rose-700 text-xs">
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
            let resultado;
            try {
                resultado = crearVenta(
                    productos,
                    carrito,
                    "V-" + Date.now().toString().slice(-6),
                    new Date().toISOString()
                );
            } catch (error) {
                mostrarAlerta(error.message, "error");
                return;
            }
            productos = resultado.productos;
            ventas.push(resultado.venta);

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
                <button data-action="dismiss-alert" class="ml-3 text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            container.appendChild(div);

            setTimeout(() => {
                div.remove();
            }, 3500);
        }

            module.exports = {
                calcularResumen,
                buscarProductos,
                guardarProductoEnLista,
                agregarProductoAlCarrito,
                crearVenta
            };
