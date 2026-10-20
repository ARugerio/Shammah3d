# 🖨️ SHAMMAH CREA 3D — Cotizador & Panel Gerencial

Sistema web ligero para la simulación de cotizaciones de impresión 3D, control de taller y gestión financiera bajo el régimen **RESICO MX**.

---

## 🚀 Características Principales

- **Mostrador Digital (`index.html`)**: Cotizador en tiempo real considerando gramos de filamento, tiempo de impresión en Bambu Lab P2S, acabados de placa (PEI, PEO, PEY) y descuentos por mayoreo.
- **Panel Gerencial (`admin.html`)**: Dashboard CRM para visualizar ventas concretadas, cotizaciones pendientes, edición de montos en vivo y reserva de fondos.
- **Lógica Centralizada (`app.js`)**: Módulo unificado para reglas de negocio, desglose financiero y sincronización asíncrona.
- **Persistencia**: Sincronización bidireccional con Google Sheets mediante un Webhook en Google Apps Script.

---

## 📊 Reglas de Negocio Financieras

El sistema calcula de forma automática el desglose sobre cada venta:

| Concepto | Regla / Fórmula |
| :--- | :--- |
| **Reserva RESICO** | 1.00% del Monto Total (`total * 0.01`) |
| **Fondo Redes / Mkt** | 5.00% del Monto Total (`total * 0.05`) |
| **Costo Directo** | (Gramos × $0.50 MXN) + (Horas × $9.00 MXN) + Herraje ($2.63 MXN si aplica) |
| **Utilidad Neta** | `Total - (RESICO + Redes + Costo Directo)` |

### Escalado por Mayoreo
- **≥ 12 piezas**: Multiplicador `2.2x`
- **≥ 6 piezas**: Multiplicador `2.5x`
- **< 6 piezas**: Multiplicador `3.0x` *(Precio mínimo unitario $35.00 MXN)*

---

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (CDN).
- **Hardware Taller**: Bambu Lab P2S + AMS 2 Pro.
- **Backend / DB**: Google Sheets + Google Apps Script Webhook.
- **Hosting**: GitHub Pages.

---

## 📁 Estructura del Repositorio

```text
├── index.html     # Interfaz pública del cotizador (Mostrador)
├── admin.html     # Panel privado de administración y CRM
├── app.js         # Configuración global, cálculos y conector API
└── README.md      # Documentación del proyecto
