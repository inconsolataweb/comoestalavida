# Diagnóstico: lista series del IPC del INE que contienen ciertas palabras, con su último dato.
import json, urllib.request, sys
def get(u):
    r = urllib.request.Request(u, headers={"User-Agent": "comoestalavida/1.0"})
    return json.loads(urllib.request.urlopen(r, timeout=90).read())
BUSCA = ["general", "subyacente", "sin alimentos no elaborados", "agua", "basura", "telef", "comunicaci", "combinado", "ferrocarril",
         "seguro", "electricidad", "alquiler", "vacuno", "ovino", "porcino", "ave", "pescado", "crust", "huevo", "leche", "lácteo", "queso",
         "fruta", "hortaliza", "legumbre", "pan", "café", "azúcar"]
cand = []
p = 1
while p <= 600:
    lote = get(f"https://servicios.ine.es/wstempus/js/ES/SERIES_OPERACION/IPC?page={p}")
    if not lote: break
    for s in lote:
        n = s.get("Nombre", "")
        if "Total Nacional" in n and "anual" in n.lower() and any(b in n.lower() for b in BUSCA):
            cand.append((s["COD"], n))
    p += 1
print("paginas", p - 1, "candidatas", len(cand))
for cod, n in cand:
    try:
        d = get(f"https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/{cod}?nult=1")["Data"]
        ult = f'{d[-1]["Anyo"]}-{d[-1]["FK_Periodo"]:02d} {d[-1]["Valor"]}' if d else "-"
    except Exception as e:
        ult = "ERR " + str(e)
    if ult.startswith("2026") or ult.startswith("2025"):
        print(cod, "|", ult, "|", n)
for u in ["https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.DFR.LEV?lastNObservations=3&format=csvdata",
          "https://data-api.ecb.europa.eu/service/data/MIR/M.ES.B.L22.F.R.A.2250.EUR.N?lastNObservations=2&format=csvdata"]:
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "comoestalavida/1.0"}), timeout=120).read().decode()
        print("BCE OK", u.split("/data/")[1][:40], r.splitlines()[-1][:200])
    except Exception as e:
        print("BCE ERR", u, e)
