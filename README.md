# 🖨️ SHAMMAH CREA 3D — Cotizador & Panel Gerencial

Sistema web ligero para simulación de cotizaciones de manufactura aditiva y control de taller.

## 🚀 Características Principales

- **Mostrador Digital (`index.html`)**: Cotizador en tiempo real considerando parámetros técnicos, tiempos de fabricación en Bambu Lab P2S + AMS 2 Pro, acabados de placa (PEI, PEO, PEY) y pedidos por volumen.
- **Panel Gerencial (`admin.html`)**: Dashboard administrativo protegido para gestión de pedidos, seguimiento de entregas y control interno.
- **Lógica Centralizada (`app.js`)**: Módulo unificado para procesamiento de parámetros y sincronización de base de datos.
- **Persistencia**: Sincronización continua con base de datos en Google Sheets.

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS (CDN).
- **Hardware Taller**: Bambu Lab P2S + AMS 2 Pro.
- **Base de Datos**: Google Sheets + Google Apps Script Webhook.
- **Hosting**: GitHub Pages.
