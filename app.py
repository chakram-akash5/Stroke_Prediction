from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
import joblib
import numpy as np
# from pymongo import MongoClient # Uncomment if using MongoDB
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

# --- Load Models Once ---
# Ensure these paths are correct according to your folder structure
brain_model = joblib.load("model/brain_model.pkl")
heart_model = joblib.load("model/model.pkl")

@app.route('/report')
def report():
    name = request.args.get('name')
    report_type = request.args.get('type')
    prediction = request.args.get('prediction')
    age = request.args.get('age')
    return render_template('result.html', name=name, type=report_type, prediction=int(prediction), age=age)

@app.route("/predict/<type>", methods=["POST"])
def predict(type):
    data = request.json
    
    # Run Prediction Logic
    if type == "heart":
        features = np.array([[
            data["age"], data["anaemia"], data["cpk"], data["diabetes"], 
            data["ef"], data["hbp"], data["platelets"], data["creatinine"], 
            data["sodium"], data["sex"], data["smoking"], data["time"]
        ]])
        prediction = int(heart_model.predict(features)[0])
    else:
        features = np.array([[
            data["age"], data["hypertension"], data["heart_disease"], 
            data["glucose"], data["bmi"], data["smoking_status"]
        ]])
        prediction = int(brain_model.predict(features)[0])

    # Return prediction for JavaScript to handle redirection
    return jsonify({
        "status": "success",
        "risk": prediction,
        "name": data.get('name'),
        "age": data.get('age')
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)