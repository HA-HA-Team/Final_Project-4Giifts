import google.generativeai as genai
import os

# Pega aquí tu clave API directamente entre las comillas para probar rápido
api_key = os.getenv("GOOGLE_API_KEY")

genai.configure(api_key=api_key)

print("--- MODELOS DISPONIBLES PARA TU CLAVE ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
