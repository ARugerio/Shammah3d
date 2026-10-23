// ==========================================
// SHAMMAH CREA 3D — CONECTOR CENTRAL (app.js)
// Conexión Frontend -> Google Apps Script
// ==========================================

// Pega aquí la URL exacta de tu Web App que termina en /exec
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzDXRDZUXn4mYl1pSTOdW05sT50foV94CrK9L1U026nDzbAxHIR3n0o9FOr2ayU-de8/exec";

// ==========================================
// 1. OBTENCIÓN DE DATOS DEL PANEL (GET protegido)
// ==========================================
async function obtenerDatosSheets(pin) {
    try {
        const respuesta = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ accion: 'obtenerDatos', pin: pin }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await respuesta.json();
        return data;
    } catch (e) {
        console.error("Error obteniendo base de datos:", e);
        return null;
    }
}

// ==========================================
// 2. SINCRONIZACIÓN GERENCIAL (Panel -> DB)
// ==========================================
async function sincronizarGoogleSheets(datosLocales, pin) {
    try {
        const payload = {
            accion: 'sincronizarDatos',
            pin: pin,
            data: datosLocales
        };
        const respuesta = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const resultado = await respuesta.json();
        return resultado.status === 'success';
    } catch (error) {
        console.error("Error sincronizando base de datos:", error);
        return false;
    }
}
