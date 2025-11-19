// Simple BMI app (metric & imperial) with local history (localStorage)
const metricBtn = document.getElementById('metricBtn');
const imperialBtn = document.getElementById('imperialBtn');
const weightEl = document.getElementById('weight');
const heightEl = document.getElementById('height');
const weightLabel = document.getElementById('weightLabel');
const heightLabel = document.getElementById('heightLabel');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const resultEl = document.getElementById('result');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

const STORAGE_KEY = 'bmi_pwa_history_v1';
let unit = 'metric'; // or 'imperial'
let history = loadHistory();

function setUnit(u){
  unit = u;
  if(u === 'metric'){
    metricBtn.classList.add('active');
    imperialBtn.classList.remove('active');
    weightLabel.textContent = 'Weight (kg)';
    heightLabel.textContent = 'Height (cm)';
    weightEl.placeholder = '70';
    heightEl.placeholder = '170';
  } else {
    imperialBtn.classList.add('active');
    metricBtn.classList.remove('active');
    weightLabel.textContent = 'Weight (lb)';
    heightLabel.textContent = 'Height (in)';
    weightEl.placeholder = '154';
    heightEl.placeholder = '67';
  }
}

metricBtn.addEventListener('click', ()=> setUnit('metric'));
imperialBtn.addEventListener('click', ()=> setUnit('imperial'));

function computeCategory(bmi){
  if(bmi < 18.5) return 'Underweight';
  if(bmi < 25) return 'Normal';
  if(bmi < 30) return 'Overweight';
  return 'Obese';
}

function renderResult(bmi){
  resultEl.innerHTML = '';
  if(bmi == null){
    const p = document.createElement('div');
    p.className = 'resultPlaceholder';
    p.textContent = 'Enter values and press Calculate';
    resultEl.appendChild(p);
    return;
  }
  const v = document.createElement('div');
  v.className = 'bmiVal';
  v.textContent = bmi;
  const c = document.createElement('div');
  c.className = 'category';
  c.textContent = computeCategory(bmi);
  resultEl.appendChild(v);
  resultEl.appendChild(c);
}

function saveHistory(item){
  history.unshift(item);
  history = history.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

function loadHistory(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}

function renderHistory(){
  historyList.innerHTML = '';
  if(history.length === 0){
    const li = document.createElement('li');
    li.textContent = 'No saved results yet.';
    li.style.opacity = 0.7;
    historyList.appendChild(li);
    return;
  }
  history.forEach(h => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.innerHTML = `<strong>${h.bmi} — ${h.category}</strong><div class="meta">${h.weight} ${h.unit === 'metric' ? 'kg' : 'lb'} • ${h.height} ${h.unit === 'metric' ? 'cm' : 'in'}</div>`;
    const right = document.createElement('div');
    right.className = 'meta';
    right.textContent = new Date(h.at).toLocaleString();
    li.appendChild(left);
    li.appendChild(right);
    historyList.appendChild(li);
  });
}

calcBtn.addEventListener('click', ()=>{
  const w = parseFloat(weightEl.value);
  const h = parseFloat(heightEl.value);
  if(!w || !h || w <= 0 || h <= 0){
    alert('Please enter positive numbers for weight and height.');
    return;
  }
  let bmi;
  if(unit === 'metric'){
    const hm = h / 100;
    bmi = w / (hm * hm);
  } else {
    bmi = (703 * w) / (h * h);
  }
  bmi = Math.round(bmi * 10) / 10;
  renderResult(bmi);
  const entry = { id: Date.now().toString(), bmi, category: computeCategory(bmi), unit, weight: w, height: h, at: new Date().toISOString() };
  saveHistory(entry);
});

clearBtn.addEventListener('click', ()=>{
  weightEl.value = '';
  heightEl.value = '';
  renderResult(null);
});

clearHistoryBtn.addEventListener('click', ()=>{
  if(confirm('Clear history?')) {
    history = [];
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  }
});

// initial
setUnit('metric');
renderResult(null);
renderHistory();