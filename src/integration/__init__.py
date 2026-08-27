"""
Integration modules for external data pipelines (Ganesh-Module).
"""
from .ganesh_adapter import process_raw_flows_to_sequence, is_ganesh_available

__all__ = ["process_raw_flows_to_sequence", "is_ganesh_available"]
