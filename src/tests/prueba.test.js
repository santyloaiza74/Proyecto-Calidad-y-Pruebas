const { describe, expect, test } = require("@jest/globals");
const {
  calcularResumen,
  buscarProductos,
  guardarProductoEnLista,
  agregarProductoAlCarrito,
  crearVenta,
} = require("../js/main");

const productosPrueba = [
  {
    id: 1,
    sku: "PROD-001",
    nombre: "Leche Entera 1L",
    categoria: "Lácteos",
    costo: 1.2,
    precio: 1.8,
    stock: 12,
  },
  {
    id: 2,
    sku: "PROD-002",
    nombre: "Pan Molde Familiar",
    categoria: "Panadería",
    costo: 1.5,
    precio: 2.3,
    stock: 4,
  },
  {
    id: 3,
    sku: "PROD-003",
    nombre: "Aceite Vegetal 900ml",
    categoria: "Abarrotes",
    costo: 2.8,
    precio: 3.9,
    stock: 8,
  },
];

describe("calcularResumen", () => {
  test("no considera stock igual al límite como crítico", () => {
    const productos = [{ ...productosPrueba[0], stock: 5 }];

    expect(calcularResumen(productos, [], "2026-10-02")).toEqual({
      valorInventario: 6,
      productosCriticos: [],
      ventasHoy: 0,
    });
  });
});

describe("buscarProductos", () => {
  test("busca por nombre sin distinguir mayúsculas y minúsculas", () => {
    expect(buscarProductos(productosPrueba, "lEcHe")).toEqual([
      productosPrueba[0],
    ]);
  });

  test("busca por SKU", () => {
    expect(buscarProductos(productosPrueba, "prod-003")).toEqual([
      productosPrueba[2],
    ]);
  });

  test("devuelve una lista vacía cuando no hay coincidencias", () => {
    expect(buscarProductos(productosPrueba, "Queso")).toEqual([]);
  });
});

describe("guardarProductoEnLista", () => {
  test("agrega un producto y genera un ID", () => {
    const nuevoProducto = {
      sku: "PROD-004",
      nombre: "Producto nuevo",
      categoria: "Varios",
      costo: 1,
      precio: 2,
      stock: 3,
    };

    expect(guardarProductoEnLista(productosPrueba, nuevoProducto)).toEqual([
      ...productosPrueba,
      { ...nuevoProducto, id: 4 },
    ]);
  });

  test("actualiza un producto existente sin modificar la lista original", () => {
    const actualizado = { ...productosPrueba[0], nombre: "Leche actualizada" };
    const resultado = guardarProductoEnLista(productosPrueba, actualizado);

    expect(resultado[0]).toEqual(actualizado);
    expect(productosPrueba[0].nombre).toBe("Leche Entera 1L");
  });

  test("rechaza SKU duplicado sin distinguir mayúsculas ni espacios", () => {
    expect(() =>
      guardarProductoEnLista(productosPrueba, {
        sku: " prod-001 ",
        nombre: "Otro producto",
        categoria: "Varios",
        costo: 1,
        precio: 2,
        stock: 1,
      }),
    ).toThrow("Ya existe un producto con ese SKU.");
  });

  test.each([
    [
      { ...productosPrueba[0], sku: " " },
      "El SKU es obligatorio.",
    ],
    [
      { ...productosPrueba[0], costo: -1 },
      "El costo debe ser un número mayor o igual a cero.",
    ],
    [
      { ...productosPrueba[0], precio: 0 },
      "El precio de venta debe ser estrictamente mayor al precio de costo.",
    ],
    [
      { ...productosPrueba[0], stock: -1 },
      "El stock debe ser un número entero mayor o igual a cero.",
    ],
    [
      { ...productosPrueba[0], stock: 1.5 },
      "El stock debe ser un número entero mayor o igual a cero.",
    ],
  ])("rechaza valores de producto inválidos", (datos, mensaje) => {
    expect(() => guardarProductoEnLista([], datos)).toThrow(mensaje);
  });
});

describe("agregarProductoAlCarrito", () => {
  test("agrega un producto sin modificar el carrito ni el stock originales", () => {
    const carrito = [];
    const resultado = agregarProductoAlCarrito(carrito, productosPrueba[0], 2);

    expect(resultado).toEqual([
      {
        productoId: 1,
        nombre: "Leche Entera 1L",
        precioUnitario: 1.8,
        cantidad: 2,
        subtotal: 3.6,
      },
    ]);
    expect(carrito).toEqual([]);
    expect(productosPrueba[0].stock).toBe(12);
  });

  test("incrementa la cantidad y subtotal de un producto que ya está en el carrito", () => {
    const carrito = [
      {
        productoId: 1,
        nombre: "Leche Entera 1L",
        precioUnitario: 1.8,
        cantidad: 1,
        subtotal: 1.8,
      },
    ];

    expect(agregarProductoAlCarrito(carrito, productosPrueba[0], 2)).toEqual([
      {
        productoId: 1,
        nombre: "Leche Entera 1L",
        precioUnitario: 1.8,
        cantidad: 3,
        subtotal: 5.4,
      },
    ]);
    expect(carrito[0].cantidad).toBe(1);
  });

  test.each([0, -1, 1.5, NaN])("rechaza cantidad inválida %s", (cantidad) => {
    expect(() =>
      agregarProductoAlCarrito([], productosPrueba[0], cantidad),
    ).toThrow("La cantidad debe ser un número entero mayor que cero.");
  });

  test("rechaza una cantidad mayor al stock", () => {
    expect(() =>
      agregarProductoAlCarrito([], productosPrueba[0], 13),
    ).toThrow("La cantidad solicitada supera el stock disponible (12).");
  });

  test("rechaza exceder el stock contando la cantidad que ya está en el carrito", () => {
    const carrito = [
      {
        productoId: 1,
        nombre: "Leche Entera 1L",
        precioUnitario: 1.8,
        cantidad: 10,
        subtotal: 18,
      },
    ];

    expect(() =>
      agregarProductoAlCarrito(carrito, productosPrueba[0], 3),
    ).toThrow("La cantidad solicitada supera el stock disponible (12).");
  });
});

describe("crearVenta", () => {
  const carritoVenta = [
    {
      productoId: 1,
      nombre: "Leche Entera 1L",
      precioUnitario: 1.8,
      cantidad: 2,
      subtotal: 3.6,
    },
    {
      productoId: 2,
      nombre: "Pan Molde Familiar",
      precioUnitario: 2.3,
      cantidad: 1,
      subtotal: 2.3,
    },
  ];

  test("crea la venta y descuenta el stock sin mutar productos originales", () => {
    const resultado = crearVenta(
      productosPrueba,
      carritoVenta,
      "V-123",
      "2026-10-02T12:00:00",
    );

    expect(resultado).toEqual({
      productos: [
        { ...productosPrueba[0], stock: 10 },
        { ...productosPrueba[1], stock: 3 },
        productosPrueba[2],
      ],
      venta: {
        id: "V-123",
        fecha: "2026-10-02T12:00:00",
        items: carritoVenta,
        total: 5.9,
      },
    });
    expect(productosPrueba[0].stock).toBe(12);
    expect(productosPrueba[1].stock).toBe(4);
  });

  test("rechaza un carrito vacío", () => {
    expect(() =>
      crearVenta(productosPrueba, [], "V-124", "2026-10-02T12:00:00"),
    ).toThrow("El carrito está vacío");
  });

  test("rechaza una venta con stock insuficiente", () => {
    const carrito = [
      {
        productoId: 2,
        nombre: "Pan Molde Familiar",
        precioUnitario: 2.3,
        cantidad: 5,
        subtotal: 11.5,
      },
    ];

    expect(() =>
      crearVenta(productosPrueba, carrito, "V-125", "2026-10-02T12:00:00"),
    ).toThrow("Stock insuficiente para Pan Molde Familiar.");
    expect(productosPrueba[1].stock).toBe(4);
  });
});
