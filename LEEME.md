# Cómo está la vida

Web estática, sin servidor ni base de datos:

| Archivo | Qué es |
|---|---|
| `index.html` | Diseño, estilos e iconos |
| `app.js` | Toda la lógica (tarjetas, gráficos, Radio Patio, Gaceta, chat…) |
| `remedios.js` | Los dibujos de Remedios |
| `patio.js` | Textos fijos: refranes, santoral, fiestas, recetas, comentarios |
| `data.js` | **Todos los datos.** Es lo único que cambia cada día |

## Publicarla en vida.saulcastillo.es (Cloudflare Pages)

1. Crea un repositorio en GitHub (por ejemplo `comoestalavida`) y sube estos archivos, incluida la carpeta `.github`.
2. En Cloudflare: *Workers & Pages → Create → Pages → Connect to Git*, elige el repositorio.
   - Framework preset: **None**. Build command: vacío. Output directory: `/`.
3. En el proyecto de Pages: *Custom domains → Set up a domain* → `vida.saulcastillo.es`. Como el dominio ya está en Cloudflare, el DNS se crea solo (igual que hiciste con `sismolive`).
4. Cada vez que cambie algo en el repositorio (también `data.js`), Cloudflare vuelve a publicar la web en unos segundos.

## Actualización diaria sin depender de Claude

Dos capas, que se complementan:

1. **GitHub Actions** (`.github/workflows/actualizar.yml`, todos los días a las 07:20): ejecuta `actualizar_datos.py`, que lee las fuentes que tienen API pública y gratuita:
   - Red Eléctrica (`apidatos.ree.es`): luz PVPC hora a hora
   - Geoportal de Hidrocarburos del Ministerio: gasolina y diésel
   - INE (API Tempus3): IPC general y, si se añaden sus códigos de serie, seguros, agua, telefonía, transporte público y las rúbricas de alimentos
   - EIA vía FRED: Brent

   Si `data.js` cambia, el bot hace *commit* y Cloudflare publica.
2. **Datos sin API** (recibo de FACUA, cesta de FACUA, alquiler y vivienda de idealista, butano, euríbor, paro, depósitos…): salen en notas de prensa, no en una API. Opciones:
   - Mantener la tarea diaria de Claude, cambiándola para que haga *commit* de `data.js` en el repositorio (hace falta conectar GitHub a Claude).
   - O actualizarlos a mano una vez al mes: son unos pocos números en `data.js`.

Antes de activar la Action, revisa en `actualizar_datos.py` el código de la serie del IPC del INE (`INE_SERIE_IPC`). El script no se ha podido probar contra las APIs desde el entorno donde se escribió (sin acceso a internet). Si una fuente falla, sigue con las demás y lo indica en el registro.

## Chat «Pregúntale a Remedios»

Ahora responde sin conexión: reconoce palabras clave (luz, gasolina, hipoteca, receta, fiesta…) y contesta con los datos de `data.js`. Para que conteste a cualquier pregunta con IA haría falta un pequeño Cloudflare Worker que reciba la pregunta y llame a la API de un modelo (con la clave guardada en el Worker, nunca en la página). Tiene un coste por uso.

## Las etiquetas «hoy» y «nuevo dato»

Cada bloque de `data.js` tiene un campo `actualizado` (AAAA-MM-DD). Si coincide con la fecha de Madrid sale «hoy». Si es de los últimos 7 días y el dato no es diario o semanal, sale «nuevo dato». Por eso solo hay que cambiar `actualizado` cuando el dato cambia de verdad.
