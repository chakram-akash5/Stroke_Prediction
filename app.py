from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
import joblib
import numpy as np

from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')


brain_model = joblib.load("/home/chakram/Stroke_Prediction/model/brain_model.pkl")
heart_model = joblib.load("/home/chakram/Stroke_Prediction/model/model.pkl")

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

    if type == "heart":
        features = np.array([[
            data["age"], data["anaemia"], data["cpk"], data["diabetes"],
            data["ef"], data["hbp"], data["platelets"], data["creatinine"],
            data["sodium"], data["sex"], data["smoking"], data["time"]
        ]])

        proba = heart_model.predict_proba(features)[0][1]
        prediction = round(proba * 100, 2)

    else:
        features = np.array([[
            data["age"], data["hypertension"], data["heart_disease"],
            data["glucose"], data["bmi"], data["smoking_status"]
        ]])

        proba = brain_model.predict_proba(features)[0][1]
        prediction = round(proba * 100, 2)

    return jsonify({
        "status": "success",
        "risk": prediction,
        "name": data.get('name'),
        "age": data.get('age')
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)