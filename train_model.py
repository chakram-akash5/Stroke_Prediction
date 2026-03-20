import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

print("🔥 Training Heart Failure Model")

os.makedirs("model", exist_ok=True)

# =========================
# LOAD DATA
# =========================
df = pd.read_csv("data/dataset.csv")

print("Columns:", df.columns.tolist())
print("Rows:", len(df))

# =========================
# FEATURES & TARGET
# =========================
X = df.drop("DEATH_EVENT", axis=1)
y = df["DEATH_EVENT"]

# =========================
# TRAIN TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# MODEL
# =========================
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# =========================
# EVALUATION
# =========================
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# =========================
# SAVE MODEL
# =========================
joblib.dump(model, "model/model.pkl")

print("✅ Heart Model trained ❤️🔥")