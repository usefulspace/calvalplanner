"""Unit tests for GitHub Actions TLE/OMM download validation; no network calls."""
from __future__ import annotations
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from orbit_source_validation import validated_tle, validated_omm

TLE = "1 23455U 94089A   97320.90946019  .00000140  00000-0  10191-3 0  2621\n2 23455  99.0090 272.6745 0008546 223.1686 136.8816 14.11711747148495"
OMM = {"NORAD_CAT_ID": 58016, "EPOCH": "2026-11-22T01:58:07.941", "MEAN_MOTION": 14.8,
       "ECCENTRICITY": 0.00014, "INCLINATION": 97.9, "RA_OF_ASC_NODE": 32.4,
       "ARG_OF_PERICENTER": 99.9, "MEAN_ANOMALY": 260.25}

class ValidateOrbitSources(unittest.TestCase):
    def test_valid_tle(self):
        lines = validated_tle(TLE, '23455').splitlines()
        self.assertEqual(len(lines), 2)
        self.assertEqual(len(lines[0]), 69)
    def test_tle_checksum_corruption(self):
        a, b = TLE.splitlines()
        for wrong in (a[:-1]+('0' if a[-1]!='0' else '1')+'\n'+b,
                      a+'\n'+b[:-1]+('0' if b[-1]!='0' else '1')):
            with self.assertRaisesRegex(ValueError, 'checksum'):
                validated_tle(wrong, '23455')
    def test_tle_catalog_mismatch(self):
        with self.assertRaises(ValueError): validated_tle(TLE, '58016')
    def test_valid_omm(self):
        self.assertEqual(validated_omm(OMM, '58016')['EPOCH'], OMM['EPOCH'])
    def test_invalid_omm_date(self):
        with self.assertRaisesRegex(ValueError, 'epoch'):
            validated_omm({**OMM, 'EPOCH': '2026-02-30T10:00:00'}, '58016')
    def test_invalid_omm_orbit_fields(self):
        with self.assertRaisesRegex(ValueError, 'field'):
            validated_omm({**OMM, 'MEAN_MOTION': 0}, '58016')
    def test_invalid_omm_norad(self):
        with self.assertRaises(ValueError): validated_omm(OMM, '33396')
    def test_invalid_omm_time_system(self):
        with self.assertRaises(ValueError): validated_omm({**OMM, 'TIME_SYSTEM': 'TAI'}, '58016')

if __name__ == '__main__': unittest.main()
