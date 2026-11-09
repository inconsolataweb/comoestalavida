# Diagnóstico 3: series de variación anual en las tablas nuevas del IPC (ECOICOP ver.2).
import json, urllib.request
def get(u):
    r = urllib.request.Request(u, headers={"User-Agent": "comoestalavida/1.0"})
    return json.loads(urllib.request.urlopen(r, timeout=180).read())
KW = ["agua", "basura", "residuos", "telef", "comunicaci", "internet", "combinado", "ferrocarril", "tren", "autob", "seguro",
      "electricidad", "alquiler", "vacuno", "bovino", "ovino", "porcino", "ave", "pescado", "crust", "huevo", "leche", "queso",
      "fruta", "hortaliza", "legumbre", "pan", "café", "azúcar", "gas", "combustible", "gasóleo", "aceite"]
for tid in [76125, 76130, 76129, 76128]:
    d = get(f"https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/{tid}?nult=1")
    print("== TABLA", tid, len(d))
    for s in d:
        n = s.get("Nombre", "")
        if "anual" not in n.lower(): continue
        if tid in (76128, 76129) and not any(k in n.lower() for k in KW): continue
        x = s["Data"][-1] if s.get("Data") else {}
        print("S", tid, s.get("COD"), "|", n, "|", x.get("Anyo"), x.get("FK_Periodo"), x.get("Valor"))
