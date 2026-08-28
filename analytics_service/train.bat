@echo off
cd /d %~dp0
call .venv\Scripts\activate
python train.py
python evaluate.py
