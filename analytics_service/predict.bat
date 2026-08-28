@echo off
cd /d %~dp0
call .venv\Scripts\activate
python predict.py --input data\network_state_sequence.csv
