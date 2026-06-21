# Node — E-commerce API

## Express · Clean Architecture · SQLite nativo · Zod

---

## La idea central

En Clean Architecture existe una **regla de dependencia**: las capas internas nunca conocen las externas.

```
┌──────────────────────────────────────────────┐
│  DOMINIO (centro)                            │
│  Product, Order — entidades con reglas de    │
│  negocio. Cero imports de Express o SQLite.  │
└──────────────────┬───────────────────────────┘
                   ↑ dependen de
┌──────────────────┴───────────────────────────┐
│  CASOS DE USO                                │
│  CreateOrder, UpdateOrderStatus, etc.        │
│  Orquesta entidades. Sin frameworks.         │
└──────────────────┬───────────────────────────┘
                   ↑ dependen de
┌──────────────────┴───────────────────────────┐
│  INTERFACES (controllers, routes)            │
│  Traduce HTTP → use case → HTTP response     │
│  Aquí vive Express y Zod.                    │
└──────────────────┬───────────────────────────┘
                   ↑ dependen de
┌──────────────────┴───────────────────────────┐
│  INFRAESTRUCTURA (repositorios, DB)          │
│  Aquí vive SQLite. Implementa contratos.     │
└──────────────────────────────────────────────┘
```

---

## Estructura del proyecto

```
node-express-clean/
├── src/
│   ├── server.js                              # Punto de entrada
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Product.js                     # Entidad con reglas de negocio
│   │   │   └── Order.js                       # Entidad + máquina de estados
│   │   ├── repositories/
│   │   │   └── index.js                       # Contratos abstractos
│   │   └── errors/
│   │       └── index.js                       # Errores tipados de dominio
│   ├── use-cases/
│   │   ├── product/index.js                   # CRUD de productos
│   │   └── order/index.js                     # Crear orden, cambiar status
│   ├── interfaces/
│   │   ├── controllers/
│   │   │   ├── ProductController.js           # Valida con Zod, llama use cases
│   │   │   └── OrderController.js
│   │   ├── routes/
│   │   │   └── index.js                       # Registra rutas Express
│   │   └── middleware/
│   │       └── errorHandler.js                # Manejo centralizado de errores
│   └── infrastructure/
│       ├── container.js                       # DI: conecta todo
│       ├── database/
│       │   └── sqlite.js                      # SQLite nativo Node 22
│       └── repositories/
│           ├── SqliteProductRepository.js     # Implementa el contrato
│           └── SqliteOrderRepository.js
```

---

## Requisitos previos

- **Node.js 22+**
  Verifica con: `node --version`

> Usa el módulo SQLite nativo de Node 22 (`node:sqlite`). No necesitas instalar ningún driver extra.

---

## Cómo correr el proyecto

### 1. Instala las dependencias

```bash
npm install
```

### 2. Corre el servidor

```bash
# Modo desarrollo (reinicia al guardar cambios)
npm run dev

# O modo normal
npm start
```

El servidor arranca en: **http://localhost:3000**

> La base de datos `ecommerce.db` se crea automáticamente al primer arranque. No necesitas ninguna migración.

### 3. Verifica que funciona

```
GET http://localhost:3000/
```

Respuesta esperada:

```json
{
  "status": "ok",
  "project": "Node - Express Clean Architecture",
  "version": "1.0.0"
}
```

---

## Cómo probarlo en Postman

### URL base

```
http://localhost:3000/api
```

---

### PRODUCTOS

#### 1. Crear un producto

**POST** `/api/products`

```json
{
  "name": "Laptop Pro 15",
  "description": "Laptop de alto rendimiento con 32GB RAM",
  "price": 25999.99,
  "stock": 10,
  "category": "electronica"
}
```

#### 2. Listar productos

**GET** `/api/products`

Query params opcionales:

- `category` → filtra por categoría
- `minPrice` / `maxPrice` → rango de precio
- `skip` / `take` → paginación

Ejemplos:

```
GET /api/products
GET /api/products?category=electronica
GET /api/products?minPrice=100&maxPrice=5000
GET /api/products?skip=0&take=5
```

#### 3. Ver un producto

**GET** `/api/products/{id}`

#### 4. Actualizar producto

**PUT** `/api/products/{id}`

```json
{
  "price": 23999.99,
  "stock": 15
}
```

Todos los campos son opcionales.

#### 5. Eliminar producto

**DELETE** `/api/products/{id}`

---

### ÓRDENES

#### 6. Crear una orden

**POST** `/api/orders`

```json
{
  "customerId": "cliente-001",
  "items": [{ "productId": "ID_DEL_PRODUCTO", "quantity": 2 }]
}
```

> Al crear la orden el stock se descuenta automáticamente. Si no hay stock, devuelve 409.

#### 7. Listar órdenes

**GET** `/api/orders`

Query params opcionales:

- `customerId` → filtra por cliente
- `status` → `pending` · `confirmed` · `shipped` · `delivered` · `cancelled`

#### 8. Ver una orden

**GET** `/api/orders/{id}`

#### 9. Cambiar estado de la orden

**PUT** `/api/orders/{id}/status`

```json
{ "status": "confirmed" }
```

Máquina de estados válida:

```
pending → confirmed → shipped → delivered
pending → cancelled
confirmed → cancelled
```

Si intentas una transición inválida devuelve 409.

---

## Reglas de negocio que puedes probar en Postman

| Escenario           | Cómo probarlo                         | Error esperado |
| ------------------- | ------------------------------------- | -------------- |
| Stock insuficiente  | Crea orden con más quantity que stock | 409            |
| Producto no existe  | GET /api/products/id-falso            | 404            |
| Transición inválida | Cambia delivered → pending            | 409            |
| Precio negativo     | POST product con price: -100          | 422            |
| Orden sin items     | POST order sin items                  | 422            |

---

## Colección Postman (importar)

Guarda como `node-ecommerce.postman_collection.json` e impórtalo:

```json
{
  "info": {
    "name": "Node - Express Clean Architecture",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "base_url", "value": "http://localhost:3000/api" },
    { "key": "product_id", "value": "" },
    { "key": "order_id", "value": "" }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": { "method": "GET", "url": "http://localhost:3000/" }
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Create Product",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const r = pm.response.json(); if(r.id) pm.collectionVariables.set('product_id', r.id);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "url": "{{base_url}}/products",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\"name\": \"Laptop Pro\", \"price\": 25999.99, \"stock\": 10, \"category\": \"electronica\"}"
            }
          }
        },
        {
          "name": "List Products",
          "request": { "method": "GET", "url": "{{base_url}}/products" }
        },
        {
          "name": "Filter by Category",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/products?category=electronica"
          }
        },
        {
          "name": "Get Product",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/products/{{product_id}}"
          }
        },
        {
          "name": "Update Product",
          "request": {
            "method": "PUT",
            "url": "{{base_url}}/products/{{product_id}}",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\"price\": 22999.99, \"stock\": 20}"
            }
          }
        },
        {
          "name": "Delete Product",
          "request": {
            "method": "DELETE",
            "url": "{{base_url}}/products/{{product_id}}"
          }
        }
      ]
    },
    {
      "name": "Orders",
      "item": [
        {
          "name": "Create Order",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const r = pm.response.json(); if(r.id) pm.collectionVariables.set('order_id', r.id);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "url": "{{base_url}}/orders",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\"customerId\": \"cliente-001\", \"items\": [{\"productId\": \"{{product_id}}\", \"quantity\": 2}]}"
            }
          }
        },
        {
          "name": "List Orders",
          "request": { "method": "GET", "url": "{{base_url}}/orders" }
        },
        {
          "name": "Get Order",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/orders/{{order_id}}"
          }
        },
        {
          "name": "Confirm Order",
          "request": {
            "method": "PUT",
            "url": "{{base_url}}/orders/{{order_id}}/status",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\"status\": \"confirmed\"}" }
          }
        },
        {
          "name": "Ship Order",
          "request": {
            "method": "PUT",
            "url": "{{base_url}}/orders/{{order_id}}/status",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\"status\": \"shipped\"}" }
          }
        },
        {
          "name": "Cancel Order",
          "request": {
            "method": "PUT",
            "url": "{{base_url}}/orders/{{order_id}}/status",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": { "mode": "raw", "raw": "{\"status\": \"cancelled\"}" }
          }
        }
      ]
    }
  ]
}
```

> Los requests "Create Product" y "Create Order" guardan el `id` automáticamente en variables de colección para los siguientes requests.

---

## Despliegue en Render

Este proyecto está desplegado como un **Web Service** en [Render](https://render.com).

### Pasos para desplegar

1. En el dashboard de Render, crea un nuevo **Web Service** y conecta el repositorio.

2. Configura el servicio:

   | Campo | Valor |
   |-------|-------|
   | **Environment** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

3. Render detecta automáticamente Node.js. No se requieren variables de entorno — la base de datos SQLite se crea en el filesystem del contenedor al arrancar.

> Ten en cuenta que Render en el plan gratuito usa un **filesystem efímero**: la base de datos `ecommerce.db` se reinicia con cada nuevo deploy. Para persistencia en producción real se recomienda migrar a una base de datos externa (PostgreSQL, etc.).

4. Una vez desplegado, copia la URL pública (ej. `https://node-express-clean.onrender.com`) y pégala en el panel de ajustes de **API Explorer** para apuntar al entorno de producción.
