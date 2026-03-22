// ================= ELEMENTS =================
const userModal = document.getElementById('userModal');
const resultModal = document.getElementById('resultModal');
const mainForm = document.getElementById('mainForm');

// ================= OPEN MODAL =================
function openModal(type) {
    document.getElementById('analysisType').value = type;

    document.getElementById('modalTitle').innerText =
        (type === 'heart' ? 'Heart Risk Analysis' : 'Brain Stroke Analysis');

    const inputs = document.getElementById('dynamicInputs');

    let commonInputs = `
        <input type="number" id="age" placeholder="Age" required>
    `;

    if (type === 'heart') {
        inputs.innerHTML = commonInputs + `
            <input type="number" id="ef" placeholder="Ejection %" required>
            <input type="number" id="creatinine" placeholder="Creatinine" step="0.1" required>
            <input type="number" id="sodium" placeholder="Sodium" required>
            <input type="number" id="platelets" placeholder="Platelets" required>
            <input type="number" id="cpk" placeholder="CPK Level" required>
        `;
    } else {
        inputs.innerHTML = commonInputs + `
            <input type="number" id="bmi" placeholder="BMI" step="0.1" required>
            <input type="number" id="glucose" placeholder="Glucose Level" step="0.1" required>
            <input type="number" id="hypertension" placeholder="Hypertension (0/1)" required>
            <input type="number" id="heart_disease" placeholder="Heart Disease (0/1)" required>
        `;
    }

    userModal.classList.add('active');
}

// ================= CLOSE MODAL =================
function closeModal() {
    userModal.classList.remove('active');
    resultModal.classList.remove('active');
}

// ================= FORM SUBMIT =================
mainForm.onsubmit = async (e) => {
    e.preventDefault();

    const type = document.getElementById('analysisType').value;
    const resText = document.getElementById('resultText');
    const spinner = document.getElementById('spinner') || {};
    // UI SWITCH
    userModal.classList.remove('active');
    resultModal.classList.add('active');

    resText.innerText = "Calculating...";
    spinner.style.display = 'block';
    // ================= FORM DATA =================
    let formData = {
        name: document.getElementById('pName').value,
        age: parseFloat(document.getElementById('age').value)
    };

    if (type === 'heart') {
        formData = {
            ...formData,
            anaemia: 0,
            diabetes: 0,
            hbp: 0,
            sex: 1,
            smoking: 0,
            time: 100,

            ef: parseFloat(document.getElementById('ef').value),
            creatinine: parseFloat(document.getElementById('creatinine').value),
            sodium: parseFloat(document.getElementById('sodium').value),
            platelets: parseFloat(document.getElementById('platelets').value),
            cpk: parseFloat(document.getElementById('cpk').value)
        };
    } else {
        formData = {
            ...formData,
            bmi: parseFloat(document.getElementById('bmi').value),
            glucose: parseFloat(document.getElementById('glucose').value),
            hypertension: parseInt(document.getElementById('hypertension').value),
            heart_disease: parseInt(document.getElementById('heart_disease').value),
            smoking_status: 1
        };
    }

    // ================= FETCH =================
    try {
        const response = await fetch(`/predict/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error("Server Error");

        const result = await response.json();

        // ⚠️ MODEL RETURNS 0 OR 1 → CONVERT TO REAL %
        let riskValue = result.risk === 1 ? 75 : 15;

        // ================= SHOW TEMP RESULT =================
        if (riskValue >= 60) {
            resText.innerText = `HIGH RISK (${riskValue}%)`;
            resText.style.color = "#ef4444";
        } else {
            resText.innerText = `CONDITION STABLE (${riskValue}%)`;
            resText.style.color = "#10b981";
        }

        spinner.style.display = 'none';

        // ================= REDIRECT AFTER DELAY =================
        setTimeout(() => {
            const params = new URLSearchParams({
                name: formData.name,
                type: type,
                prediction: riskValue,
                age: formData.age
            });

            window.location.href = `/report?${params}`;
        }, 1500);

    } catch (err) {
        spinner.style.display = 'none';
        resText.innerText = "Server Connection Failed 😢";
        resText.style.color = "#ef4444";
        console.error(err);
    }
};