const userModal = document.getElementById('userModal');
const resultModal = document.getElementById('resultModal');
const mainForm = document.getElementById('mainForm');

function openModal(type) {
    document.getElementById('analysisType').value = type;
    document.getElementById('modalTitle').innerText = (type === 'heart' ? 'Heart Risk' : 'Brain Stroke') + ' Analysis';
    
    const inputs = document.getElementById('dynamicInputs');
    // Common field for both
    let commonInputs = `<input type="number" id="age" placeholder="Age" class="w-full p-3 border rounded-xl" required>`;
    
    if(type === 'heart') {
        inputs.innerHTML = commonInputs + `
            <input type="number" id="ef" placeholder="Ejection %" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="creatinine" placeholder="Creatinine" step="0.1" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="sodium" placeholder="Sodium" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="platelets" placeholder="Platelets" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="cpk" placeholder="CPK Level" class="w-full p-3 border rounded-xl" required>
        `;
    } else {
        inputs.innerHTML = commonInputs + `
            <input type="number" id="bmi" placeholder="BMI" step="0.1" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="glucose" placeholder="Glucose Level" step="0.1" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="hypertension" placeholder="Hypertension (0/1)" class="w-full p-3 border rounded-xl" required>
            <input type="number" id="heart_disease" placeholder="Heart Disease (0/1)" class="w-full p-3 border rounded-xl" required>
        `;
    }
    userModal.style.display = 'flex';
}

function closeModal() {
    userModal.style.display = 'none';
    resultModal.style.display = 'none';
}

mainForm.onsubmit = async (e) => {
    e.preventDefault();
    const type = document.getElementById('analysisType').value;
    
    // UI Elements
    const userModal = document.getElementById('userModal');
    const resultModal = document.getElementById('resultModal');
    const resText = document.getElementById('resultText'); // Definition zaroori hai
    const spinner = document.getElementById('spinner');
    
    userModal.classList.remove('active');
    resultModal.classList.add('active');
    
    resText.innerText = "Calculating...";
    spinner.style.display = 'block';

    // Form Data with all required fields for app.py
    const formData = {
        name: document.getElementById('pName').value,
        email: document.getElementById('pEmail').value,
        phone: document.getElementById('pPhone').value,
        age: parseFloat(document.getElementById('age').value)
    };

    if(type === 'heart') {
        formData.ef = parseFloat(document.getElementById('ef').value);
        formData.creatinine = parseFloat(document.getElementById('creatinine').value);
        formData.sodium = parseFloat(document.getElementById('sodium').value);
        formData.platelets = parseFloat(document.getElementById('platelets').value);
        formData.cpk = parseFloat(document.getElementById('cpk').value);
        // Default values for remaining model features
        formData.anaemia=0; formData.diabetes=0; formData.hbp=0; formData.sex=1; formData.smoking=0; formData.time=100;
    } else {
        formData.bmi = parseFloat(document.getElementById('bmi').value);
        formData.glucose = parseFloat(document.getElementById('glucose').value);
        formData.hypertension = parseInt(document.getElementById('hypertension').value);
        formData.heart_disease = parseInt(document.getElementById('heart_disease').value);
        formData.smoking_status = 1;
    }

    try {
        const response = await fetch(`http://127.0.0.1:5000/predict/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        

        if (!response.ok) throw new Error('Server Error');

        // ... response aane ke baad ...
const result = await response.json();

// Redirect to new page with query parameters
const queryParams = new URLSearchParams({
    name: formData.name,
    type: type,
    prediction: result.risk,
    age: formData.age
}).toString();

window.location.href = `/report?${queryParams}`;
        

        setTimeout(() => {
            spinner.style.display = 'none';
            const riskValue = result.risk !== undefined ? result.risk : result.prediction;

            if(riskValue == 1) {
                resText.innerText = "HIGH RISK DETECTED";
                resText.style.color = "#ef4444";
            } else {
                resText.innerText = "CONDITION STABLE";
                resText.style.color = "#10b981";
            }
        }, 2000);

    } catch (err) {
        spinner.style.display = 'none';
        resText.innerText = "Server Connection Failed";
        resText.style.color = "#ef4444";
        console.error(err);
    }
};