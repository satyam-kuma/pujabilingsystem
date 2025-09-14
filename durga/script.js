// ----- Data storage: localStorage key
const STORAGE_KEY = 'puja_chanda_v1';

// DOM refs
const yearSelect = document.getElementById('year');
const filterYear = document.getElementById('filterYear');
const form = document.getElementById('chandaForm');
const tbody = document.querySelector('#collectionTable tbody');
const totalOkEl = document.getElementById('totalOk');
const totalDueEl = document.getElementById('totalDue');
const toast = document.getElementById('toast');
const downloadCsv = document.getElementById('downloadCsv');

// populate year selects 2025..3000
(function populateYears(){
  for(let y=2025; y<=3000; y++){
    let o = document.createElement('option'); o.value = y; o.textContent = y;
    yearSelect.appendChild(o);
  }
  // preselect current year
  yearSelect.value = new Date().getFullYear();
  document.getElementById('yearNow').textContent = new Date().getFullYear();
})();

// load records
let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function saveRecords(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// render filter options based on stored records
function renderFilterOptions(){
  const years = Array.from(new Set(records.map(r=>r.year))).sort((a,b)=>b-a);
  filterYear.innerHTML = '<option value="all">All Years</option>';
  years.forEach(y=>{
    const o = document.createElement('option'); o.value = y; o.textContent = y; filterYear.appendChild(o);
  });
}

// render records
function renderRecords(){
  const sel = filterYear.value || 'all';
  tbody.innerHTML = '';
  let totalOk = 0, totalDue = 0;
  const sorted = records.slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  sorted.forEach(r=>{
    if(sel !== 'all' && String(r.year) !== String(sel)) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.year}</td><td>${r.date || ''}</td><td>${escapeHtml(r.name)}</td><td>₹${Number(r.amount||0).toLocaleString()}</td><td>${r.status}</td>`;
    tbody.appendChild(tr);
    if(r.status === 'ok') totalOk += Number(r.amount||0);
    else totalDue += Number(r.amount||0);
  });
  totalOkEl.textContent = totalOk.toLocaleString();
  totalDueEl.textContent = totalDue.toLocaleString();
}

// safe HTML escape
function escapeHtml(s){
  if(!s) return '';
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// show toast
function showToast(msg='Saved'){
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(()=> toast.style.display='none', 3000);
}

// form submit
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = {
    year: document.getElementById('year').value,
    date: document.getElementById('date').value,
    name: document.getElementById('name').value.trim(),
    address: document.getElementById('address').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    amount: Number(document.getElementById('amount').value) || 0,
    status: document.getElementById('status').value
  };
  if(!data.name || !data.amount){ alert('Please enter name and amount'); return; }

  records.push(data);
  saveRecords();
  renderFilterOptions();
  renderRecords();
  form.reset();
  document.getElementById('year').value = data.year;
  showToast(`✅ Thank you ${data.name}! Stored for ${data.year}`);
});

// filter change
filterYear.addEventListener('change', renderRecords);

// CSV export
downloadCsv.addEventListener('click', ()=>{
  if(records.length === 0){ alert('No records to export'); return; }
  const header = ['year','date','name','address','phone','amount','status'];
  const rows = records.map(r => header.map(h => `"${String(r[h]||'').replace(/"/g,'""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'puja_chanda_records.csv'; a.click();
  URL.revokeObjectURL(url);
});

// init UI
renderFilterOptions();
renderRecords();

// Optional: clicking gallery thumbs opens image in new tab
document.querySelectorAll('.gallery img').forEach(img=>{
  img.addEventListener('click', ()=> window.open(img.src, '_blank'));
});

// Make date default to today
document.getElementById('date').valueAsDate = new Date();
