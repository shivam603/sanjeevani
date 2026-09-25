import urllib.request
import json
import time

time.sleep(2)

def check_url(name, url, method="GET", data=None, headers=None):
    try:
        req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            body = resp.read().decode("utf-8")
            print(f"[{status}] {name} ({url}) -> length: {len(body)}")
            return body
    except Exception as e:
        print(f"[FAIL] {name} ({url}): {e}")
        return None

print("--- CHECKING SERVICES ---")
check_url("FastAPI Health", "http://127.0.0.1:8000/health")
check_url("Farmer PWA", "http://127.0.0.1:3000/")

print("\n--- CHECKING CROP DOCTOR API ---")
diseases_raw = check_url("Crop Doctor Catalog", "http://127.0.0.1:8000/api/v1/crop-doctor/diseases")
if diseases_raw:
    d = json.loads(diseases_raw)
    print(f"Catalog Count: {d.get('count')} diseases loaded.")

req_data = json.dumps({"preset_name": "wheat_yellow_rust", "confidence": 0.94}).encode("utf-8")
diag_raw = check_url("Crop Doctor Diagnosis Preset", "http://127.0.0.1:8000/api/v1/crop-doctor/diagnose-json", method="POST", data=req_data, headers={"Content-Type": "application/json"})
if diag_raw:
    diag = json.loads(diag_raw)
    print("Diagnosis result keys:", list(diag.keys()))
    print("Diagnosis WHAT:", diag.get("what"))
    print("Diagnosis ACTION:", diag.get("action")[:80] + "...")

print("\n--- CHECKING RISK & EARLY WARNING API ---")
warn_raw = check_url("Early Warnings API", "http://127.0.0.1:8000/api/v1/warnings?lat=30.65&lon=76.28")
if warn_raw:
    w = json.loads(warn_raw)
    risks = w.get("risks", [])
    print(f"Active risks evaluated: {len(risks)}")
    if risks:
        sample = risks[0]
        print("Sample risk keys:", list(sample.keys()))
        print(f"Sample WHAT: {sample.get('what')} | WHY: {sample.get('why')} | WHEN: {sample.get('when')}")

print("\n--- ALL CHECKS COMPLETED ---")
