#!/usr/bin/env python3
"""
Actualiza data.js de «Cómo está la vida» con las fuentes oficiales que tienen API pública.

  Luz (PVPC hora a hora) ... Red Eléctrica, apidatos.ree.es
  Gasolina 95 y diésel ..... Ministerio (Geoportal de Hidrocarburos), API REST de precios por estación
  IPC ...................... INE, API Tempus3
  Brent .................... EIA, vía FRED (serie DCOILBRENTEU)

  Euríbor y tipo del BCE .. BCE, data-api.ecb.europa.eu
  Depósitos e hipotecas ... BCE (estadísticas MIR de España)
  Servicios e IPC por productos (agua, basuras, telefonía, transporte, seguros, carne, pescado…)
                            INE, API Tempus3 (IPC base 2025, códigos en SERIES_INE)

Lo que solo sale en notas de prensa (recibo y cesta de FACUA, idealista, butano, TUR del gas,
paro, salario mínimo, sello) lo actualiza la tarea diaria de Claude o se cambia a mano.

Uso:  python3 actualizar_datos.py            (lee y reescribe ./data.js)
Solo usa la biblioteca estándar de Python 3.9+.
"""
import csv, io, json, os, re, sys, datetime as dt, urllib.request
from zoneinfo import ZoneInfo

DATA = "data.js"
MADRID = ZoneInfo("Europe/Madrid")
HOY = dt.datetime.now(MADRID).date()

# Código de la serie del INE «Índice general nacional. Variación anual» (IPC base 2021).
# Compruébalo una vez en https://servicios.ine.es/wstempus/js/ES/SERIES_OPERACION/IPC?page=1
# buscando "Total Nacional. Índice general. Variación anual." y pon aquí su COD.
INE_SERIE_IPC = "IPC290750"   # IPC base 2025 (ECOICOP ver.2), tabla 76125
INE_SERIE_SUBYACENTE = "IPC292510"   # opcional: "Índice general sin alimentos no elaborados ni productos energéticos. Variación anual."

MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def get(url, timeout=60, intentos=4):
    """Descarga con reintentos: el BCE y el INE a veces dan 504 al primer intento."""
    import time
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "comoestalavida/1.0", "Accept": "application/json, text/csv"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(8 * (i + 1))


def cargar():
    txt = open(DATA, encoding="utf-8").read()
    m = re.search(r"^window\.CELV\s*=", txt, re.M)  # la asignación real, no la del comentario
    cuerpo = txt[m.end():].strip().rstrip(";")
    cabecera = txt[:m.start()]
    return cabecera, json.loads(cuerpo)


def guardar(cabecera, d):
    with open(DATA, "w", encoding="utf-8") as f:
        f.write(cabecera + "window.CELV = " + json.dumps(d, ensure_ascii=False, indent=2) + ";\n")


def pvpc_dia(fecha):
    url = ("https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real"
           f"?start_date={fecha}T00:00&end_date={fecha}T23:59&time_trunc=hour")
    j = json.loads(get(url))
    for inc in j.get("included", []):
        if inc.get("type", "").upper().startswith("PVPC"):
            vals = inc["attributes"]["values"]
            horas = [None] * 24
            cuentas = [0] * 24
            for v in vals:  # puede venir por cuartos de hora: se promedia por hora
                h = int(v["datetime"][11:13])
                horas[h] = (horas[h] or 0) + v["value"] / 1000.0
                cuentas[h] += 1
            return [round(horas[h] / cuentas[h], 5) if cuentas[h] else None for h in range(24)]
    raise RuntimeError("REE no devolvió la serie PVPC")


def actualizar_luz(d):
    L = d["luz"]
    horas = pvpc_dia(HOY.isoformat())
    if None in horas:
        raise RuntimeError("faltan horas del PVPC de hoy")
    media = sum(horas) / 24
    ayer = (HOY - dt.timedelta(days=1)).isoformat()
    previa = dict((k, v) for k, v in L["dias"]).get(ayer)
    if previa is None:
        try:
            h_ayer = pvpc_dia(ayer)
            previa = round(sum(h_ayer) / 24, 4)
        except Exception:
            previa = L.get("media_ayer")
    dias = [x for x in L["dias"] if x[0] != HOY.isoformat()]
    if ayer not in dict(dias):
        dias.append([ayer, previa])
    dias.append([HOY.isoformat(), round(media, 4)])
    hist = L.setdefault("historico", {})
    hist[HOY.isoformat()] = horas
    for k in sorted(hist)[:-7]:
        del hist[k]
    L.update(fecha=HOY.isoformat(), actualizado=HOY.isoformat(), horas=horas,
             media_ayer=previa, dias=sorted(dias)[-15:])
    # media del mes en curso
    mes = HOY.strftime("%Y-%m")
    del_mes = [v for k, v in L["dias"] if k.startswith(mes) and v is not None]
    etiqueta = MESES[HOY.month - 1] + (" " + HOY.strftime("%y") if HOY.month in (1, 11) else "")
    if L["meses"] and L["meses"][-1][0].split()[0] == MESES[HOY.month - 1]:
        L["meses"][-1] = [L["meses"][-1][0], round(sum(del_mes) / len(del_mes), 3)]
    else:
        L["meses"] = (L["meses"] + [[etiqueta, round(sum(del_mes) / len(del_mes), 3)]])[-13:]
    L["fuente"] = {"nombre": "Red Eléctrica (apidatos.ree.es)", "url": "https://www.ree.es/es/apidatos"}


def actualizar_carburantes(d):
    url = "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/"
    j = json.loads(get(url, timeout=180))
    def media(campo):
        v = [float(e[campo].replace(",", ".")) for e in j["ListaEESSPrecio"] if e.get(campo)]
        return round(sum(v) / len(v), 3)
    g, di = media("Precio Gasolina 95 E5"), media("Precio Gasoleo A")
    C = d["carburantes"]
    etiqueta = f"{HOY.day} {MESES[HOY.month - 1]}"
    ultima = C["serie"][-1]
    if ultima[1] != g or ultima[2] != di:
        # una entrada por semana: si la última es de hace menos de 7 días se sustituye
        if C.get("fecha") and (HOY - dt.date.fromisoformat(C["fecha"])).days < 7:
            C["serie"][-1] = [etiqueta, g, di]
        else:
            C["serie"] = (C["serie"] + [[etiqueta, g, di]])[-12:]
        C["actualizado"] = HOY.isoformat()
    C["fecha"] = HOY.isoformat()
    C["fuente"] = {"nombre": "Geoportal de Hidrocarburos (Ministerio)", "url": "https://geoportalgasolineras.es/"}


def serie_ine(cod, n=8):
    j = json.loads(get(f"https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/{cod}?nult={n}"))
    return [(int(x["Anyo"]), int(x["FK_Periodo"]), round(float(x["Valor"]), 1)) for x in j["Data"] if x.get("Valor") is not None]


def actualizar_ipc(d):
    gen = serie_ine(INE_SERIE_IPC, 13)
    sub = dict(((a, m), v) for a, m, v in serie_ine(INE_SERIE_SUBYACENTE, 13)) if INE_SERIE_SUBYACENTE else {}
    gen.sort()
    ult = gen[-1]
    hace_un_anio = [v for a, m, v in gen if a == ult[0] - 1 and m == ult[1]]
    nueva = [[MESES[m - 1], v, sub.get((a, m))] for a, m, v in gen[-8:]]
    if nueva != d["ipc"]["serie"]:
        d["ipc"]["serie"] = nueva
        d["ipc"]["actualizado"] = HOY.isoformat()
    d["ipc"]["fecha"] = f"{ult[0]}-{ult[1]:02d}-28"
    d["ipc"]["provisional"] = False
    if hace_un_anio:
        d["ipc"]["hace_un_anio"] = hace_un_anio[0]
    d["ipc"]["fuente"] = {"nombre": "INE", "url": "https://www.ine.es/"}


def actualizar_brent(d):
    txt = get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU").decode()
    filas = [r for r in csv.reader(io.StringIO(txt)) if r and r[1] not in (".", "DCOILBRENTEU")]
    fecha, valor = filas[-1][0], round(float(filas[-1][1]), 2)
    B = d["brent"]
    if fecha != B.get("fecha"):
        f = dt.date.fromisoformat(fecha)
        B["serie"] = (B["serie"] + [[f"{f.day} {MESES[f.month - 1]}", valor]])[-12:]
        B.update(fecha=fecha, actualizado=HOY.isoformat())
        B["fuente"] = {"nombre": "EIA vía FRED (spot)", "url": "https://fred.stlouisfed.org/series/DCOILBRENTEU"}


# ---------------------------------------------------------------------------------------------
# BCE: euríbor a 12 meses (media mensual), tipo de la facilidad de depósito y tipos de los bancos
# en España. API pública: https://data-api.ecb.europa.eu
# ---------------------------------------------------------------------------------------------
BCE_EURIBOR = "FM/M.U2.EUR.RT.MM.EURIBOR1YD_.HSTA"
BCE_DFR = "FM/B.U2.EUR.4F.KR.DFR.LEV"
# Estadísticas MIR (operaciones nuevas, España). Si una clave no responde, búscala en
# https://data.ecb.europa.eu/data/datasets/MIR  (filtro: Spain, households).
BCE_DEPOSITO_ES = "MIR/M.ES.B.L22.F.R.A.2250.EUR.N"     # depósitos a plazo hasta 1 año, hogares
BCE_HIPOTECA_ES = "MIR/M.ES.B.A2C.A.R.A.2250.EUR.N"     # préstamos para vivienda, hogares
BCE_CONSUMO_ES = "MIR/M.ES.B.A2B.A.R.A.2250.EUR.N"      # crédito al consumo, hogares


def bce(clave, n=14):
    txt = get(f"https://data-api.ecb.europa.eu/service/data/{clave}?lastNObservations={n}&format=csvdata", timeout=180).decode()
    filas = list(csv.DictReader(io.StringIO(txt)))
    return [(f["TIME_PERIOD"], round(float(f["OBS_VALUE"]), 3)) for f in filas if f.get("OBS_VALUE")]


def etiqueta_mes(periodo):  # "2026-10" -> "oct 26"
    a, m = periodo[:4], int(periodo[5:7])
    return f"{MESES[m - 1]} {a[2:]}"


def actualizar_euribor(d):
    obs = bce(BCE_EURIBOR, 13)
    E = d["euribor"]
    nueva = [[etiqueta_mes(p), v] for p, v in obs]
    if nueva and nueva != E["serie"]:
        E["serie"] = nueva
        E["fecha"] = obs[-1][0] + "-28"
        E["actualizado"] = HOY.isoformat()
    E["fuente"] = {"nombre": "Banco Central Europeo", "url": "https://data.ecb.europa.eu/"}


def actualizar_bce(d):
    obs = bce(BCE_DFR, 400)
    cambios = [obs[0]] + [obs[i] for i in range(1, len(obs)) if obs[i][1] != obs[i - 1][1]]
    B = d["bce"]
    ult = cambios[-1]
    if ult[1] != B["valor"]:
        B["anterior"] = B["valor"]
        B["valor"] = ult[1]
        B["fecha"] = ult[0]
        B["actualizado"] = HOY.isoformat()
        B.setdefault("serie", []).append([ult[0][:7], ult[1]])


def actualizar_depositos(d):
    dep, hip, con = bce(BCE_DEPOSITO_ES, 2), bce(BCE_HIPOTECA_ES, 2), bce(BCE_CONSUMO_ES, 2)
    P = d["depositos"]
    if dep and round(dep[-1][1], 2) != P["valor"]:
        P.update(valor=round(dep[-1][1], 2), anterior=round(dep[-2][1], 2), fecha=dep[-1][0] + "-28",
                 actualizado=HOY.isoformat(), zona="España")
        if hip:
            P.update(hipoteca=round(hip[-1][1], 2), hipoteca_anterior=round(hip[-2][1], 2))
        if con:
            P.update(consumo=round(con[-1][1], 2), consumo_anterior=round(con[-2][1], 2))
        P["fuente"] = {"nombre": "BCE, tipos de interés de los bancos en España (MIR)", "url": "https://data.ecb.europa.eu/data/datasets/MIR"}


# ---------------------------------------------------------------------------------------------
# INE: IPC por subclases y rúbricas (agua, basuras, transporte, seguros, alimentos…)
# ---------------------------------------------------------------------------------------------
# Códigos de las series «Variación anual» del IPC base 2025 (ECOICOP ver.2), comprobados en noviembre de 2026.
# Tablas: 76125 general, 76130 grupos especiales, 76129 rúbricas, 76128 subclases.
# La «Variación mensual» de cada serie es el código + 2 (p. ej. IPC292242 anual -> IPC292244 mensual).
# Si el INE cambia de base, busca los nuevos en https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/76128?nult=1
SERIES_INE = {
    "agua": "IPC291826", "basuras": "IPC291830", "alquiler_ipc": "IPC291806", "comunidad": "IPC291838",
    "telefonia": "IPC292046", "bus_metro": "IPC291546", "tren": "IPC291990",
    "seguro_coche": "IPC292166", "seguro_salud": "IPC292162", "electricidad": "IPC291482",
    # alimentos que FACUA no sigue
    "filete": "IPC292222", "chuleta": "IPC292226", "jamon": "IPC292230", "muslo": "IPC292234",
    "pescado": "IPC292362", "gamba": "IPC292366", "huevos": "IPC292242", "leche": "IPC292246",
    "queso": "IPC291434", "manzana": "IPC292258", "lechuga": "IPC292262", "pan": "IPC292218",
    "cafe": "IPC292274", "azucar": "IPC292270",
}
NOMBRES_SERVICIOS = [("agua", "agua", "Agua del grifo"), ("basuras", "basura", "Recogida de basuras"),
                     ("comunidad", "casa", "Gastos de comunidad"), ("telefonia", "telefono", "Teléfono e internet"),
                     ("bus_metro", "metro", "Autobús y metro"), ("tren", "tren", "Tren"),
                     ("seguro_salud", "pension", "Seguro de salud"), ("alquiler_ipc", "llave", "Alquileres (IPC)")]


def mensual(cod):
    return "IPC" + str(int(cod[3:]) + 2)


def codigos_ine():
    return dict(SERIES_INE)


def ultimos_ine(cod, n=13):
    j = json.loads(get(f"https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/{cod}?nult={n}"))
    return sorted((int(x["Anyo"]), int(x["FK_Periodo"]), round(float(x["Valor"]), 1)) for x in j["Data"] if x.get("Valor") is not None)


def actualizar_ine(d):
    cods = codigos_ine()
    # Servicios de la casa
    items, fecha = [], None
    for clave, icono, nombre in NOMBRES_SERVICIOS:
        if clave in cods:
            datos = ultimos_ine(cods[clave], 13)
            if datos:
                a, m, v = datos[-1]
                items.append([icono, nombre, v, [[MESES[mm - 1] + " " + str(aa)[2:], vv] for aa, mm, vv in datos]])
                fecha = f"{a}-{m:02d}-28"
    if items:
        S = d.setdefault("servicios", {})
        if [i[:3] for i in items] != [i[:3] for i in S.get("items", [])]:
            S.update(items=items, fecha=fecha, actualizado=HOY.isoformat(),
                     fuente={"nombre": "INE, IPC por subclases", "url": "https://www.ine.es/"})
    # Seguro del coche
    if "seguro_coche" in cods:
        datos = ultimos_ine(cods["seguro_coche"], 6)
        if datos and datos[-1][2] != d["seguro_coche"]["valor"]:
            sc = d["seguro_coche"]
            sc.update(anterior=sc["valor"], valor=datos[-1][2], fecha=f"{datos[-1][0]}-{datos[-1][1]:02d}-28", actualizado=HOY.isoformat())
            sc["serie"] = [[MESES[m - 1], v] for a, m, v in datos[-4:]]
    # Alimentos del mercado (rúbricas)
    R = d["rubricas"]
    cambio = False
    for it in R["items"]:
        if it[0] in cods:
            datos = ultimos_ine(cods[it[0]], 2)
            mens = ultimos_ine(mensual(cods[it[0]]), 2)
            if datos and (datos[-1][2] != it[2] or (mens and mens[-1][2] != it[3])):
                it[2] = datos[-1][2]
                if mens:
                    it[3] = mens[-1][2]
                cambio = True
                R["fecha"] = f"{datos[-1][0]}-{datos[-1][1]:02d}-28"
                R["mes"] = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre",
                            "octubre", "noviembre", "diciembre"][datos[-1][1] - 1] + f" {datos[-1][0]}"
    if cambio:
        R["actualizado"] = HOY.isoformat()


def main():
    cab, d = cargar()
    errores = []
    pasos = [("luz", actualizar_luz), ("carburantes", actualizar_carburantes), ("brent", actualizar_brent),
             ("euribor", actualizar_euribor), ("bce", actualizar_bce), ("depositos", actualizar_depositos),
             ("ine", actualizar_ine), ("ipc", actualizar_ipc)]
    for nombre, f in pasos:
        try:
            f(d)
            print(f"ok  {nombre}")
        except Exception as e:  # una fuente caída no debe impedir actualizar las demás
            errores.append(nombre)
            print(f"ERR {nombre}: {e}", file=sys.stderr)
    d["generado"] = dt.datetime.now(MADRID).isoformat(timespec="seconds")
    guardar(cab, d)
    sys.exit(1 if len(errores) == len(pasos) else 0)


if __name__ == "__main__":
    main()
