@echo off
cd /d %~dp0
call .venv\Scripts\activate
streamlit run dashboard\app.py
