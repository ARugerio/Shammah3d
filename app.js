// ==========================================
// SHAMMAH CREA 3D — CONECTOR CENTRAL (app.js)
// Conexión Frontend -> Google Apps Script
// ==========================================

// URL oficial de tu Web App en Google Apps Script
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyC0c8e00F3i3_q6jJ7uS00t19-gQd7v-O6dF23E1bL3yD12sE/exec";

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
