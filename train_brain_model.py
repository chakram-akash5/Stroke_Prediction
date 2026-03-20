import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os


print("Current Path:", os.getcwd())

os.makedirs("model", exist_ok=True)


df = pd.read_csv("data/brain_dataset.csv")

print("Columns:", df.columns.tolist())
print("Rows:", len(df))


df = df.drop(["id"], axis=1)


df["gender"] = df["gender"].map({"Male":1, "Female":0})
df["ever_married"] = df["ever_married"].map({"Yes":1, "No":0})
df["Residence_type"] = df["Residence_type"].map({"Urban":1, "Rural":0})

df["smoking_status"] = df["smoking_status"].map({
    "formerly smoked":1,
    "never smoked":0,
    "smokes":2
})


X = df[[
    "age",
    "hypertension",
    "heart_disease",
    "avg_glucose_level",
    "bmi",
    "smoking_status"
]]

y = df["stroke"]


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)


model = RandomForestClassifier(n_estimators=50, random_state=42)

model.fit(X_train, y_train)


y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print("Accuracy:", accuracy)


joblib.dump(model, "model/brain_model.pkl")

print("✅ Brain Model trained successfully 🧠🔥")