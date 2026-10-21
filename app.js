// ==========================================
// CONFIGURACIÓN PÚBLICA (CLIENTE)
// ==========================================
const CONFIG_SHAMMAH = {
    URL_API_GOOGLE: "https://script.google.com/macros/s/AKfycbzDXRDZUXn4mYl1pSTOdW05sT50foV94CrK9L1U026nDzbAxHIR3n0o9FOr2ayU-de8/exec",
    NUM_WHATSAPP: "5215559650025"
};

// ==========================================
// UTILIDADES DE FORMATO Y TIEMPO
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
// CONECTORES API SEGUROS (SOLO MÉTODO POST)
// ==========================================
async function solicitarCotizacionSegura(datosProducto) {
    try {
        const respuesta = await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            body: JSON.stringify({
                accion: "cotizar",
                gramos: datosProducto.gramos,
                horas: datosProducto.horas,
                cantidad: datosProducto.cantidad,
                tipoNegocio: datosProducto.tipoNegocio
            })
        });
        return await respuesta.json();
    } catch (e) {
        console.error("Error al cotizar:", e);
        return { exito: false };
    }
}

async function obtenerDatosSheets(pin) {
    try {
        const res = await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            body: JSON.stringify({
                accion: "obtenerDatos",
                pin: pin
            })
        });
        return await res.json();
    } catch (e) {
        console.error("Error al obtener datos:", e);
        return { autorizado: false, error: e.toString() };
    }
}

async function sincronizarGoogleSheets(dataArray, pin) {
    try {
        const res = await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            body: JSON.stringify({
                accion: "sincronizarDatos",
                pin: pin,
                data: dataArray
            })
        });
        return await res.json();
    } catch (e) {
        console.error("Error al sincronizar:", e);
        return false;
    }
}

async function enviarCotizacionDesdeMostrador(datosCotizacion) {
    try {
        await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({
                tipo: "NUEVA_COTIZACION",
                datos: datosCotizacion
            })
        });
        return true;
    } catch (e) {
        console.error("Error al registrar cotización:", e);
        return false;
    }
}
