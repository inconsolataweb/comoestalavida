# Diagnóstico 2: tablas del IPC, metadatos de la serie general y prueba del BCE (MIR).
import json, urllib.request, time
def raw(u, acc="application/json", t=120):
    r = urllib.request.Request(u, headers={"User-Agent": "comoestalavida/1.0", "Accept": acc})
    return urllib.request.urlopen(r, timeout=t).read().decode("utf-8", "replace")
def get(u): return json.loads(raw(u))
print("== DATOS_SERIE IPC251856")
print(raw("https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/IPC251856?nult=2")[:600])
print("== TABLAS_OPERACION IPC")
for t in get("https://servicios.ine.es/wstempus/js/ES/TABLAS_OPERACION/IPC"):
    n = t.get("Nombre", "")
    if "2021" in n or "2025" in n or t.get("Anyo_Periodo_fin") in (None, "", 2026) :
        print("TABLA", t.get("Id"), "|", n, "|", t.get("Anyo_Periodo_ini"), t.get("FK_Periodicidad"), t.get("Ultima_Modificacion"))
for tid in [50902, 50913, 76080, 76083, 76093]:
    try:
        d = get(f"https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/{tid}?nult=1")
        print("== DATOS_TABLA", tid, len(d))
        for s in d[:12]: print("   ", s.get("COD"), "|", s.get("Nombre"), "|", s["Data"][-1] if s.get("Data") else "-")
    except Exception as e:
        print("== DATOS_TABLA", tid, "ERR", e)
for u in ["https://data-api.ecb.europa.eu/service/data/MIR/M.ES.B.L22.F.R.A.2250.EUR.N?lastNObservations=2",
          "https://data-api.ecb.europa.eu/service/data/MIR/M.ES.B.A2C.A.R.A.2250.EUR.N?lastNObservations=2",
          "https://data-api.ecb.europa.eu/service/data/MIR/M.ES.B.L22.F.R.A.2250.EUR.N?lastNObservations=2&detail=dataonly"]:
    for intento in range(3):
        try:
            r = raw(u, "text/csv", 180); print("BCE OK", u[45:], r.strip().splitlines()[-1][:160]); break
        except Exception as e:
            print("BCE ERR", intento, u[45:], e); time.sleep(10)
