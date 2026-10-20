// ==========================================
// CONFIGURACIÓN PÚBLICA (CLIENTE)
// Solo contiene endpoints y datos no sensibles
// ==========================================
const CONFIG_SHAMMAH = {
    URL_API_GOOGLE: "https://script.google.com/macros/s/AKfycbzDXRDZUXn4mYl1pSTOdW05sT50foV94CrK9L1U026nDzbAxHIR3n0o9FOr2ayU-de8/exec",
    NUM_WHATSAPP: "5215559650025"
};

// ==========================================
// PARSERS Y FORMATO DE TIEMPO
// ==========================================
function parseTiempo(val) {
    let str = (val || '').toString().trim().toLowerCase();
    if (!str) return 0;
    if (str.includes(':')) {
        let p = str.split(':');
        return (parseFloat(p[0]) || 0) + ((parseFloat(p[1]) || 0) / 60);
    }
    if (str.includes('h') || str.includes('m')) {
        let hMatch = str.match(/(\d+)\s*h/);
        let mMatch = str.match(/(\d+)\s*m/);
        let h = hMatch ? parseFloat(hMatch[1]) : 0;
        let m = mMatch ? parseFloat(mMatch[2] || mMatch[1]) : 0;
        return h + (m / 60);
    }
    return parseFloat(str) || 0;
}

function formatTiempoVisual(horasDec) {
    let totalMin = Math.round(horasDec * 60);
    if (totalMin < 60) return `${totalMin}m`;
    let h = Math.floor(totalMin / 60);
    let m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ==========================================
// SOLICITUD DE COTIZACIÓN SEGURA (SERVIDORES)
// ==========================================
async function obtenerCotizacionSegura(datosProducto) {
    try {
        const respuesta = await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                accion: "cotizar",
                gramos: datosProducto.gramos,
                horas: datosProducto.horasDecimales,
                cantidad: datosProducto.cantidad,
                tipoNegocio: datosProducto.tipoNegocio
            })
        });
        
        return await respuesta.json();
    } catch (e) {
        console.error("Error al procesar cotización segura:", e);
        return { exito: false, mensaje: "No se pudo obtener la cotización." };
    }
}

// ==========================================
// CONECTOR Y SINCRONIZACIÓN DE REGISTROS
// ==========================================
async function obtenerDatosSheets() {
    try {
        const res = await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Error al obtener datos de Google Sheets:", e);
        return [];
    }
}

async function sincronizarGoogleSheets(dataArray) {
    try {
        await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataArray)
        });
        return true;
    } catch (e) {
        console.error("Error al sincronizar con Google Sheets:", e);
        return false;
    }
}
