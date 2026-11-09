# Diagnóstico 4: ¿hay índices con 13 meses para calcular la variación anual?
import json, urllib.request
def get(u):
    r = urllib.request.Request(u, headers={"User-Agent": "comoestalavida/1.0"})
    return json.loads(urllib.request.urlopen(r, timeout=180).read())
for tid in [76128, 76129]:
    d = get(f"https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/{tid}?nult=14")
    for s in d:
        n = s.get("Nombre", "")
        if any(k in n for k in ["Recogida de basuras", "Suministro de agua", "Seguro de vehículo", "Carne de vacuno", "Huevos", "Servicios de comunicación móvil", "Transporte de pasajeros por tren"]):
            vals = [(x["Anyo"], x["FK_Periodo"], x["Valor"]) for x in s.get("Data", [])]
            print("S", tid, s["COD"], "|", n, "|", len(vals), vals[:2], vals[-2:])
