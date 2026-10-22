"""Compatibility entry point; use build_nexys_realistic.py for the full model."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name('build_nexys_realistic.py')), run_name='__main__')
