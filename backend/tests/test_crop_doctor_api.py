"""
Unit tests for Crop Doctor MobileNetV2 Vision Pathology API.
Verifies leaf upload validation, JSON diagnosis, low-confidence handling,
ICAR disease database listing, and structured WHAT -> WHY -> WHEN -> ACTION outputs.
"""

import io
import os
import sys
import unittest
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app


class TestCropDoctorAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def _create_test_image(self, color=(80, 160, 60), size=(120, 120)):
        """Generates an in-memory test image with PIL."""
        img = Image.new("RGB", size, color=color)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        return buf.getvalue()

    def test_list_cataloged_diseases(self):
        res = self.client.get("/api/v1/crop-doctor/diseases")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("wheat_yellow_rust", data["diseases"])
        self.assertIn("rice_bacterial_blight", data["diseases"])
        self.assertIn("cotton_leaf_curl", data["diseases"])

    def test_diagnose_json_preset_wheat_yellow_rust(self):
        payload = {"crop": "Wheat", "preset_id": "wheat_yellow_rust"}
        res = self.client.post("/api/v1/crop-doctor/diagnose-json", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("Yellow Rust", data["disease_name"])
        self.assertIn("what", data)
        self.assertIn("why", data)
        self.assertIn("when", data)
        self.assertIn("action", data)
        self.assertGreaterEqual(data["confidence"], 0.70)
        self.assertFalse(data["is_inconclusive"])
        self.assertIn("Propiconazole", data["action"])

    def test_diagnose_json_preset_healthy_crop(self):
        payload = {"crop": "Wheat", "preset_id": "healthy_crop"}
        res = self.client.post("/api/v1/crop-doctor/diagnose-json", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("Healthy", data["what"])
        self.assertFalse(data["is_inconclusive"])

    def test_diagnose_multipart_upload_green_leaf(self):
        # Generate green leaf image
        img_bytes = self._create_test_image(color=(50, 180, 50))
        files = {"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
        data = {"crop": "Wheat"}
        res = self.client.post("/api/v1/crop-doctor/diagnose", files=files, data=data)
        self.assertEqual(res.status_code, 200)
        result = res.json()
        self.assertIn(result["status"], ["success", "low_confidence"])
        self.assertIn("what", result)
        self.assertIn("why", result)
        self.assertIn("when", result)
        self.assertIn("action", result)
        self.assertIn("ICAR", result["icar_reference"])

    def test_diagnose_multipart_upload_empty_fails(self):
        files = {"file": ("empty.jpg", b"", "image/jpeg")}
        res = self.client.post("/api/v1/crop-doctor/diagnose", files=files, data={"crop": "Wheat"})
        self.assertEqual(res.status_code, 400)

    def test_diagnose_multipart_invalid_mimetype_fails(self):
        files = {"file": ("malicious.exe", b"not an image", "application/x-msdownload")}
        res = self.client.post("/api/v1/crop-doctor/diagnose", files=files, data={"crop": "Wheat"})
        self.assertEqual(res.status_code, 400)


if __name__ == "__main__":
    unittest.main()
