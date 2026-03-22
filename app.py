import os
import joblib
import numpy as np # prediction ke liye iski zaroorat pad sakti hai
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Exact path from your file manager
BASE_DIR = os.path.join(os.path.dirname(__file__), "model")

print("BASE_DIR:", BASE_DIR)
print("Files:", os.listdir(BASE_DIR))

def load_safe(filename):
    path = os.path.join(BASE_DIR, filename)
    print(f"Attempting to load: {path}") # Logs mein dikhega
    if os.path.exists(path):
        try:
            model = joblib.load(path)
            print(f"Successfully loaded {filename}")
            return model
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            return None
    else:
        print(f"File NOT found: {path}")
    return None

# Models ko load kar rahe hain
brain_model = load_safe("brain_model.pkl")
heart_model = load_safe("model.pkl")

@app.route('/')
def home():
    return render_template('index.html')


import random

@app.route('/report')
def report():
    try:
        name = request.args.get('name', 'Patient')
        analysis_type = request.args.get('type', 'heart')
        prediction = float(request.args.get('prediction', 0))
        age = request.args.get('age', 'N/A')

        lab_id = random.randint(1000, 9999)

        return render_template(
            'result.html',
            name=name,
            type=analysis_type,
            prediction=prediction,
            age=age,
            lab_id=lab_id
        )

    except Exception as e:
        return f"ERROR: {str(e)}"

@app.route('/predict/heart', methods=['POST'])
def predict_heart():
    if not heart_model:
        return jsonify({'error': 'Neural Engine Offline - Heart Model missing'}), 500
    data = request.json
    try:
        # Array format check karein agar model expect kar raha hai
        features = np.array([[
            float(data.get("age", 0)), float(data.get("anaemia", 0)),
            float(data.get("cpk", 250)), float(data.get("diabetes", 0)),
            float(data.get("ef", 0)), float(data.get("hbp", 0)),
            float(data.get("platelets", 250000)), float(data.get("creatinine", 1.0)),
            float(data.get("sodium", 135)), float(data.get("sex", 1)),
            float(data.get("smoking", 0)), float(data.get("time", 100))
        ]])
        proba = heart_model.predict_proba(features)[0][1]
        return jsonify({'risk': round(proba * 100, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/stroke', methods=['POST'])
def predict_stroke():
    if not brain_model:
        return jsonify({'error': 'Neural Engine Offline - Stroke Model missing'}), 500
    data = request.json
    try:
        features = np.array([[
            float(data.get("age", 0)), int(data.get("hypertension", 0)),
            int(data.get("heart_disease", 0)), float(data.get("glucose", 100)),
            float(data.get("bmi", 25)), int(data.get("smoking_status", 1))
        ]])
        proba = brain_model.predict_proba(features)[0][1]
        return jsonify({'risk': round(proba * 100, 2)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)