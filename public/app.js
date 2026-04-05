// Initialize Lucide icons
lucide.createIcons();

// State
let token = localStorage.getItem('token');
let user = null;

// DOM Elements
const authView = document.getElementById('auth-view');
const dashView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const targetRegForm = document.getElementById('register-form');

// API Helper
async function apiCall(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`/api${endpoint}`, { ...options, headers });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Lifecycle Init
async function init() {
  if (token) {
    // Validate token and get user
    const res = await apiCall('/auth/me');
    if (res.ok && res.data.success) {
      user = res.data.data;
      document.getElementById('user-greeting').textContent = `Welcome, ${user.name}`;
      showDashboard();
    } else {
      logout();
    }
  } else {
    showAuth();
  }
}

function showAuth() {
  authView.style.display = 'block';
  dashView.style.display = 'none';
}

function showDashboard() {
  authView.style.display = 'none';
  dashView.style.display = 'flex';
  
  // Enforce frontend visibility based on role policies
  const actionPanel = document.querySelector('.action-panel');
  if (user && user.role !== 'admin') {
    actionPanel.style.display = 'none';
  } else {
    actionPanel.style.display = 'block';
  }

  fetchDashboard();
}

function logout() {
  token = null;
  user = null;
  localStorage.removeItem('token');
  showAuth();
}

// Auth Logic
function switchAuthTab(tab) {
  const btns = document.querySelectorAll('.tab-btn');
  btns[0].classList.toggle('active', tab === 'login');
  btns[1].classList.toggle('active', tab === 'register');
  
  loginForm.style.display = tab === 'login' ? 'block' : 'none';
  targetRegForm.style.display = tab === 'register' ? 'block' : 'none';
  
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent = '';
}

async function handleAuth(e, type) {
  e.preventDefault();
  const errorEl = document.getElementById(`${type === 'login' ? 'login' : 'reg'}-error`);
  const btn = e.target.querySelector('button[type="submit"]');
  
  errorEl.textContent = '';
  btn.disabled = true;
  btn.innerHTML = 'Processing...';

  const body = type === 'login' ? {
    email: e.target.querySelector('input[type="email"]').value,
    password: e.target.querySelector('input[type="password"]').value
  } : {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
    role: document.getElementById('reg-role').value
  };

  const res = await apiCall(`/auth/${type}`, { method: 'POST', body: JSON.stringify(body) });

  btn.disabled = false;
  btn.innerHTML = type === 'login' ? 'Sign In <i data-lucide="arrow-right"></i>' : 'Create Account <i data-lucide="user-plus"></i>';
  lucide.createIcons();

  if (res.ok && res.data.success) {
    token = res.data.data.token;
    localStorage.setItem('token', token);
    init(); // Reload state
  } else {
    errorEl.textContent = res.data?.error?.message || res.error || 'Authentication failed';
  }
}

// Dashboard Logic
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function fetchDashboard() {
  const tbody = document.getElementById('transactions-body');
  
  const res = await apiCall('/dashboard/summary');
  
  if (res.ok && res.data.success) {
    const d = res.data.data;
    
    // Update Summaries
    document.getElementById('net-balance').textContent = formatCurrency(d.netBalance);
    document.getElementById('total-income').textContent = formatCurrency(d.totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(d.totalExpense);

    // Update Table
    if (d.recentTransactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">No recent transactions</td></tr>';
    } else {
      tbody.innerHTML = d.recentTransactions.map(tx => `
        <tr>
          <td>${formatDate(tx.date)}</td>
          <td>
            <span class="badge badge-${tx.type}">${tx.type}</span> 
            ${tx.category}
          </td>
          <td style="font-weight: 600; color: ${tx.type === 'income' ? 'var(--success)' : 'var(--text-main)'}">
            ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
          </td>
          <td>${tx.notes || '-'}</td>
        </tr>
      `).join('');
    }
  } else {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:var(--danger)">Failed to load data</td></tr>`;
  }
}

// Transaction Logic
async function addRecord(e) {
  e.preventDefault();
  
  const msgEl = document.getElementById('rec-msg');
  const btn = e.target.querySelector('button');
  
  msgEl.textContent = '';
  msgEl.className = 'form-msg';
  btn.disabled = true;

  const type = document.querySelector('input[name="type"]:checked').value;
  const amount = parseFloat(document.getElementById('rec-amount').value);
  const category = document.getElementById('rec-category').value;
  const notes = document.getElementById('rec-notes').value;

  const res = await apiCall('/records', {
    method: 'POST',
    body: JSON.stringify({ type, amount, category, notes })
  });

  btn.disabled = false;

  if (res.ok && res.data.success) {
    msgEl.textContent = 'Transaction saved successfully!';
    msgEl.classList.add('success');
    e.target.reset();
    document.querySelector('input[name="type"][value="income"]').checked = true; // reset radio
    fetchDashboard(); // Refresh data
    setTimeout(() => { msgEl.textContent = ''; }, 3000);
  } else {
    msgEl.textContent = res.data?.error?.message || res.error || 'Failed to save transaction';
  }
}

// Boot
init();
