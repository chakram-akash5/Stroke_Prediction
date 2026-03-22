// ================= ELEMENTS =================
const userModal = document.getElementById('userModal');
const resultModal = document.getElementById('resultModal');
const mainForm = document.getElementById('mainForm');
const preloader = document.getElementById('preloader');

// ================= PRELOADER =================
window.addEventListener('load', () => {
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => { preloader.style.display = 'none'; }, 800);
    }
});

// ================= MODAL LOGIC =================
function openModal(type) {
    document.getElementById('analysisType').value = type;
    document.getElementById('modalTitle').innerText = (type === 'heart' ? 'Heart Risk Analysis' : 'Brain Stroke Analysis');

    const inputs = document.getElementById('dynamicInputs');
    let common = `
        <input type="text" id="p_name" placeholder="Patient Name" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-3 outline-none">
        <input type="number" id="p_age" placeholder="Age" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-3 outline-none">
    `;

    if (type === 'heart') {
        inputs.innerHTML = common + `
            <div class="grid grid-cols-2 gap-3 mb-3">
                <input type="number" id="ef" placeholder="EF %" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                <input type="number" id="creatinine" placeholder="Creatinine" step="0.1" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <input type="number" id="sodium" placeholder="Sodium" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                <input type="number" id="platelets" placeholder="Platelets" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
            </div>
            <input type="number" id="cpk" placeholder="CPK Level" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
        `;
    } else {
        inputs.innerHTML = common + `
            <div class="grid grid-cols-2 gap-3 mb-3">
                <input type="number" id="bmi" placeholder="BMI" step="0.1" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                <input type="number" id="glucose" placeholder="Glucose" step="0.1" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <input type="number" id="hypertension" placeholder="Hypertension (0/1)" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                <input type="number" id="heart_disease" placeholder="Heart Disease (0/1)" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
            </div>
        `;
    }
    userModal.classList.add('active');
}

function closeModal() {
    userModal.classList.remove('active');
    resultModal.classList.remove('active');
}

// ================= SUBMIT =================
mainForm.onsubmit = async (e) => {
    e.preventDefault();
    const type = document.getElementById('analysisType').value;
    const resText = document.getElementById('resultText');

    userModal.classList.remove('active');
    resultModal.classList.add('active');
    resText.innerText = "Analyzing Data...";

    try {
        let payload = {
            name: document.getElementById('p_name').value,
            age: parseFloat(document.getElementById('p_age').value)
        };

        if (type === 'heart') {
            Object.assign(payload, {
                ef: parseFloat(document.getElementById('ef').value),
                creatinine: parseFloat(document.getElementById('creatinine').value),
                sodium: parseFloat(document.getElementById('sodium').value),
                platelets: parseFloat(document.getElementById('platelets').value),
                cpk: parseFloat(document.getElementById('cpk').value),
                anaemia: 0, diabetes: 0, hbp: 0, sex: 1, smoking: 0, time: 100
            });
        } else {
            Object.assign(payload, {
                bmi: parseFloat(document.getElementById('bmi').value),
                glucose: parseFloat(document.getElementById('glucose').value),
                hypertension: parseInt(document.getElementById('hypertension').value),
                heart_disease: parseInt(document.getElementById('heart_disease').value),
                smoking_status: 1
            });
        }

        const response = await fetch(`/predict/${type === 'heart' ? 'heart' : 'stroke'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        resText.innerText = `Risk Level: ${result.risk}%`;
        resText.style.color = result.risk > 50 ? "#ef4444" : "#10b981";

        setTimeout(() => {
            window.location.href = `/report?name=${encodeURIComponent(payload.name)}&type=${type}&prediction=${result.risk}&age=${payload.age}`;
        }, 2000);

    } catch (err) {
        resText.innerText = "Error: " + err.message;
        resText.style.color = "#ef4444";
    }
};