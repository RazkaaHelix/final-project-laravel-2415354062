// Global State Caching
let state = {
    currentView: 'dashboard',
    customers: [],
    services: [],
    subscriptions: [],
    searchQuery: '',
    activeDropdownId: null
};

// CSRF Token Setup
const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Set default theme
    initTheme();
    
    // Switch to initial dashboard view
    switchView('dashboard');

    // Close active dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.action-dropdown-btn') && !e.target.closest('.dropdown-menu')) {
            closeAllDropdowns();
        }
        if (!e.target.closest('#profile-menu-button') && !e.target.closest('#profile-dropdown')) {
            document.getElementById('profile-dropdown')?.classList.add('hidden');
        }
    });

    // Run lucide icons replacement
    lucide.createIcons();
});

// Theme Management
window.toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
};

const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeUI(isDark);
};

const updateThemeUI = (isDark) => {
    const label = document.getElementById('theme-label');
    if (label) {
        label.textContent = isDark ? 'Dark' : 'Light';
    }
};

// Routing / View Switching
window.switchView = async (viewName) => {
    // Hide active dropdowns
    closeAllDropdowns();
    
    // Clear search bar
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.value = '';
        state.searchQuery = '';
    }

    state.currentView = viewName;

    // Update active nav button state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-slate-800', 'text-white', 'shadow-sm');
        btn.classList.add('hover:bg-slate-800', 'hover:text-white', 'text-slate-400');
    });
    
    const activeBtn = document.getElementById(`nav-${viewName}`);
    if (activeBtn) {
        activeBtn.classList.remove('hover:bg-slate-800', 'hover:text-white', 'text-slate-400');
        activeBtn.classList.add('bg-slate-800', 'text-white', 'shadow-sm');
    }

    // Set page header title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    }

    // Show loader
    const loader = document.getElementById('view-loader');
    const content = document.getElementById('dynamic-content');
    if (loader && content) {
        loader.classList.remove('hidden');
        content.classList.add('opacity-40');
    }

    // Fetch and Load dynamic content
    try {
        if (viewName === 'dashboard') {
            await fetchAllData();
            renderDashboard();
        } else if (viewName === 'customers') {
            await fetchCustomers();
            renderCustomers();
        } else if (viewName === 'services') {
            await fetchServices();
            renderServices();
        } else if (viewName === 'subscriptions') {
            await fetchSubscriptions();
            await fetchCustomers(); // Dynamic dropdown loading helper
            await fetchServices();   // Dynamic dropdown loading helper
            renderSubscriptions();
        }
    } catch (err) {
        console.error('Error fetching view data:', err);
        showToast('Failed to load data. Please check connection.', 'error');
    } finally {
        if (loader && content) {
            loader.classList.add('hidden');
            content.classList.remove('opacity-40');
        }
    }
};

// Global Search
window.handleSearch = (query) => {
    state.searchQuery = query.toLowerCase().trim();
    if (state.currentView === 'customers') {
        renderCustomers();
    } else if (state.currentView === 'services') {
        renderServices();
    } else if (state.currentView === 'subscriptions') {
        renderSubscriptions();
    }
};

// Profile Menu
window.toggleProfileDropdown = () => {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown?.classList.toggle('hidden');
};

// Logout Functionality
window.openSignOutModal = () => {
    openModalDirect('sign-out');
};

window.logoutAction = () => {
    showToast('Signing out...', 'info');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
};

// API Fetching wrappers
const fetchAllData = async () => {
    const custRes = await fetch('/api/customers');
    const custData = await custRes.json();
    state.customers = custData.data || [];

    const servRes = await fetch('/api/services');
    const servData = await servRes.json();
    state.services = servData.data || [];

    const subRes = await fetch('/api/subscriptions');
    const subData = await subRes.json();
    state.subscriptions = subData.data || [];
};

const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    state.customers = data.data || [];
};

const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    state.services = data.data || [];
};

const fetchSubscriptions = async () => {
    const res = await fetch('/api/subscriptions');
    const data = await res.json();
    state.subscriptions = data.data || [];
};

// ==============================================
// VIEW RENDERING LOGIC
// ==============================================

// 1. Dashboard Summary
const renderDashboard = () => {
    const content = document.getElementById('dynamic-content');
    if (!content) return;

    const totalCustomers = state.customers.length;
    const activeCustomers = state.customers.filter(c => c.status).length;
    const totalServices = state.services.length;
    const activeServices = state.services.filter(s => s.status).length;
    const totalSubs = state.subscriptions.length;
    const activeSubs = state.subscriptions.filter(s => s.status === 'active').length;
    const trialSubs = state.subscriptions.filter(s => s.status === 'trial').length;
    const isolirSubs = state.subscriptions.filter(s => s.status === 'isolir').length;

    content.innerHTML = `
        <div class="space-y-6">
            <!-- Summary Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Customers Card -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
                    <div class="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <i data-lucide="users" class="h-6 w-6"></i>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</p>
                        <h4 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">${totalCustomers}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${activeCustomers} Active &bull; ${totalCustomers - activeCustomers} Inactive</p>
                    </div>
                </div>

                <!-- Services Card -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
                    <div class="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <i data-lucide="server" class="h-6 w-6"></i>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Services</p>
                        <h4 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">${activeServices}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${totalServices} Total Catalog Items</p>
                    </div>
                </div>

                <!-- Active Subscriptions Card -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
                    <div class="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-950/40 flex items-center justify-center text-green-600 dark:text-green-400">
                        <i data-lucide="zap" class="h-6 w-6"></i>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Subs</p>
                        <h4 class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">${activeSubs}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${trialSubs} Trial &bull; ${isolirSubs} Isolated</p>
                    </div>
                </div>

                <!-- Total Revenue Estimate Card -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200">
                    <div class="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <i data-lucide="credit-card" class="h-6 w-6"></i>
                    </div>
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total MRR</p>
                        <h4 class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">${formatRupiah(calculateMRR())}</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Estimated Monthly Income</p>
                    </div>
                </div>
            </div>

            <!-- Dashboard Sub-panels -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Recent Customers -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-2">
                    <h3 class="font-bold text-slate-900 dark:text-white text-base">Recent Customers</h3>
                    <div class="mt-4 overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead>
                                <tr class="text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <th class="py-2">Name</th>
                                    <th class="py-2">Email</th>
                                    <th class="py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                                ${state.customers.slice(0, 5).map(cust => `
                                    <tr>
                                        <td class="py-3 font-semibold text-slate-800 dark:text-slate-200">${cust.name}</td>
                                        <td class="py-3 text-slate-500 dark:text-slate-400">${cust.email || '-'}</td>
                                        <td class="py-3">
                                            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${cust.status ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'}">
                                                ${cust.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Subscriptions Health/Stats Status -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 class="font-bold text-slate-900 dark:text-white text-base">Subscription Statuses</h3>
                    <div class="mt-6 space-y-4">
                        <div>
                            <div class="flex justify-between text-xs font-semibold mb-1">
                                <span class="text-slate-400 uppercase">Active (${activeSubs})</span>
                                <span class="text-slate-800 dark:text-white">${totalSubs ? Math.round((activeSubs/totalSubs)*100) : 0}%</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div class="bg-green-500 h-full" style="width: ${totalSubs ? (activeSubs/totalSubs)*100 : 0}%"></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-xs font-semibold mb-1">
                                <span class="text-slate-400 uppercase">Trial (${trialSubs})</span>
                                <span class="text-slate-800 dark:text-white">${totalSubs ? Math.round((trialSubs/totalSubs)*100) : 0}%</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div class="bg-yellow-500 h-full" style="width: ${totalSubs ? (trialSubs/totalSubs)*100 : 0}%"></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-xs font-semibold mb-1">
                                <span class="text-slate-400 uppercase">Isolir (${isolirSubs})</span>
                                <span class="text-slate-800 dark:text-white">${totalSubs ? Math.round((isolirSubs/totalSubs)*100) : 0}%</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div class="bg-red-500 h-full" style="width: ${totalSubs ? (isolirSubs/totalSubs)*100 : 0}%"></div>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between text-xs font-semibold mb-1">
                                <span class="text-slate-400 uppercase">Dismantle (${totalSubs - activeSubs - trialSubs - isolirSubs})</span>
                                <span class="text-slate-800 dark:text-white">${totalSubs ? Math.round(((totalSubs - activeSubs - trialSubs - isolirSubs)/totalSubs)*100) : 0}%</span>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div class="bg-slate-400 dark:bg-slate-600 h-full" style="width: ${totalSubs ? ((totalSubs - activeSubs - trialSubs - isolirSubs)/totalSubs)*100 : 0}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
};

const calculateMRR = () => {
    let total = 0;
    state.subscriptions.forEach(sub => {
        if (sub.status === 'active' || sub.status === 'trial') {
            total += sub.service?.price || 0;
        }
    });
    return total;
};

// 2. Customers Table View
const renderCustomers = () => {
    const content = document.getElementById('dynamic-content');
    if (!content) return;

    // Filter customers
    const filtered = state.customers.filter(c => 
        c.customer_id.toLowerCase().includes(state.searchQuery) ||
        c.name.toLowerCase().includes(state.searchQuery) ||
        (c.email && c.email.toLowerCase().includes(state.searchQuery)) ||
        (c.address && c.address.toLowerCase().includes(state.searchQuery))
    );

    let rowsHTML = filtered.map(cust => `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150 relative">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">${cust.customer_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-200">${cust.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">${cust.email || '-'}</td>
            <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">${cust.address || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${cust.status ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'}">
                    ${cust.status ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                <button onclick="toggleActionDropdown(event, 'cust-${cust.id}')" class="action-dropdown-btn p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all focus:outline-none">
                    <i data-lucide="more-horizontal" class="h-4 w-4"></i>
                </button>
                <!-- Context Action Menu -->
                <div id="dropdown-cust-${cust.id}" class="dropdown-menu hidden absolute right-6 top-12 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-25 text-left">
                    <button onclick="quickAction('customer', ${cust.id}, 'activate')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="check" class="h-3.5 w-3.5 text-green-500"></i> Active
                    </button>
                    <button onclick="quickAction('customer', ${cust.id}, 'deactivate')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="x" class="h-3.5 w-3.5 text-red-500"></i> Deactivate
                    </button>
                    <button onclick="openEditModal('customer', ${cust.id})" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="edit-3" class="h-3.5 w-3.5 text-blue-500"></i> Edit
                    </button>
                    <button onclick="deleteResource('customer', ${cust.id})" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400">
                        <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        rowsHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-slate-400 dark:text-slate-500">No customers found.</td>
            </tr>
        `;
    }

    content.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div class="px-6 py-4 flex items-center justify-between border-b border-slate-150 dark:border-slate-800">
                <h3 class="font-bold text-slate-800 dark:text-white text-base">Customers List</h3>
                <button onclick="openAddModal('customer')" class="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all">
                    <i data-lucide="plus" class="h-3.5 w-3.5"></i> Add Data
                </button>
            </div>
            
            <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th class="px-6 py-3">Customer ID</th>
                            <th class="px-6 py-3">Customer Name</th>
                            <th class="px-6 py-3">Email</th>
                            <th class="px-6 py-3">Address</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
};

// 3. Services Table View
const renderServices = () => {
    const content = document.getElementById('dynamic-content');
    if (!content) return;

    // Filter services
    const filtered = state.services.filter(s => 
        s.name.toLowerCase().includes(state.searchQuery) ||
        (s.description && s.description.toLowerCase().includes(state.searchQuery))
    );

    let rowsHTML = filtered.map(serv => `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-850 dark:text-slate-200">${serv.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400">${formatRupiah(serv.price)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${serv.status ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'}">
                    ${serv.status ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                <button onclick="toggleActionDropdown(event, 'serv-${serv.id}')" class="action-dropdown-btn p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all focus:outline-none">
                    <i data-lucide="more-horizontal" class="h-4 w-4"></i>
                </button>
                <!-- Context Action Menu -->
                <div id="dropdown-serv-${serv.id}" class="dropdown-menu hidden absolute right-6 top-12 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-25 text-left">
                    <button onclick="quickAction('service', ${serv.id}, 'activate')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="check" class="h-3.5 w-3.5 text-green-500"></i> Active
                    </button>
                    <button onclick="quickAction('service', ${serv.id}, 'deactivate')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="x" class="h-3.5 w-3.5 text-red-500"></i> Deactivate
                    </button>
                    <button onclick="openEditModal('service', ${serv.id})" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="edit-3" class="h-3.5 w-3.5 text-blue-500"></i> Edit
                    </button>
                    <button onclick="deleteResource('service', ${serv.id})" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400">
                        <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        rowsHTML = `
            <tr>
                <td colspan="4" class="text-center py-8 text-slate-400 dark:text-slate-500">No services found.</td>
            </tr>
        `;
    }

    content.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div class="px-6 py-4 flex items-center justify-between border-b border-slate-150 dark:border-slate-800">
                <h3 class="font-bold text-slate-800 dark:text-white text-base">Services List</h3>
                <button onclick="openAddModal('service')" class="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all">
                    <i data-lucide="plus" class="h-3.5 w-3.5"></i> Add Data
                </button>
            </div>
            
            <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th class="px-6 py-3">Service Name</th>
                            <th class="px-6 py-3">Price</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
};

// 4. Subscriptions Table View
const renderSubscriptions = () => {
    const content = document.getElementById('dynamic-content');
    if (!content) return;

    // Filter subscriptions
    const filtered = state.subscriptions.filter(sub => {
        const name = sub.customer?.name || '';
        const servName = sub.service?.name || '';
        return name.toLowerCase().includes(state.searchQuery) ||
               servName.toLowerCase().includes(state.searchQuery) ||
               sub.status.toLowerCase().includes(state.searchQuery);
    });

    let rowsHTML = filtered.map(sub => `
        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-150">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-850 dark:text-slate-200">${sub.customer?.name || 'Deleted'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">${sub.service?.name || 'Deleted'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">${formatPeriod(sub.start_date, sub.end_date)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full ${getStatusBadgeClass(sub.status)}">
                    ${capitalizeFirst(sub.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                <button onclick="toggleActionDropdown(event, 'sub-${sub.id}')" class="action-dropdown-btn p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all focus:outline-none">
                    <i data-lucide="more-horizontal" class="h-4 w-4"></i>
                </button>
                <!-- Context Action Menu -->
                <div id="dropdown-sub-${sub.id}" class="dropdown-menu hidden absolute right-6 top-12 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-25 text-left">
                    <button onclick="quickAction('subscription', ${sub.id}, 'active')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="check" class="h-3.5 w-3.5 text-green-500"></i> Active
                    </button>
                    <button onclick="quickAction('subscription', ${sub.id}, 'trial')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="gift" class="h-3.5 w-3.5 text-yellow-500"></i> Trial
                    </button>
                    <button onclick="quickAction('subscription', ${sub.id}, 'isolir')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="alert-triangle" class="h-3.5 w-3.5 text-red-500"></i> Isolir
                    </button>
                    <button onclick="quickAction('subscription', ${sub.id}, 'dismantle')" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350">
                        <i data-lucide="box" class="h-3.5 w-3.5 text-slate-400"></i> Dismantle
                    </button>
                    <button onclick="openEditModal('subscription', ${sub.id})" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 border-t border-slate-100 dark:border-slate-700">
                        <i data-lucide="edit-3" class="h-3.5 w-3.5 text-blue-500"></i> Edit
                    </button>
                    <button onclick="deleteResource('subscription', ${sub.id})" class="w-full px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400">
                        <i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    if (filtered.length === 0) {
        rowsHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-slate-400 dark:text-slate-500">No subscriptions found.</td>
            </tr>
        `;
    }

    content.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div class="px-6 py-4 flex items-center justify-between border-b border-slate-150 dark:border-slate-800">
                <h3 class="font-bold text-slate-800 dark:text-white text-base">Subscriptions List</h3>
                <button onclick="openAddModal('subscription')" class="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all">
                    <i data-lucide="plus" class="h-3.5 w-3.5"></i> Add Data
                </button>
            </div>
            
            <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                            <th class="px-6 py-3">Customer Name</th>
                            <th class="px-6 py-3">Services</th>
                            <th class="px-6 py-3">Services Period</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
};

// ==============================================
// MODALS LOGIC & HANDLING
// ==============================================

window.openModal = (type, item = null) => {
    // Select modal selectors
    const modal = document.getElementById(`${type}-modal`);
    const content = document.getElementById(`${type}-modal-content`);
    if (!modal || !content) return;

    // Reset forms
    const form = document.getElementById(`${type}-form`);
    form?.reset();
    
    // Bind dropdown datasets dynamically if subscription modal
    if (type === 'subscription') {
        populateSubscriptionSelects(item);
    }

    // Set fields for Edit Action
    if (item) {
        document.getElementById(`${type}-modal-title`).textContent = `Edit ${capitalizeFirst(type)}`;
        document.getElementById(`${type}-id-field`).value = item.id;
        
        if (type === 'customer') {
            document.getElementById('cust-uid').value = item.customer_id;
            document.getElementById('cust-uid').disabled = true; // Customer ID unique cannot change
            document.getElementById('cust-name').value = item.name;
            document.getElementById('cust-email').value = item.email || '';
            document.getElementById('cust-phone').value = item.phone || '';
            document.getElementById('cust-address').value = item.address || '';
            document.getElementById('cust-status').value = item.status ? '1' : '0';
        } else if (type === 'service') {
            document.getElementById('serv-name').value = item.name;
            document.getElementById('serv-price').value = item.price;
            document.getElementById('serv-description').value = item.description || '';
            document.getElementById('serv-status').value = item.status ? '1' : '0';
        } else if (type === 'subscription') {
            document.getElementById('sub-customer').value = item.customer_id;
            document.getElementById('sub-service').value = item.service_id;
            document.getElementById('sub-start-date').value = formatDateIso(item.start_date);
            document.getElementById('sub-end-date').value = formatDateIso(item.end_date);
            document.getElementById('sub-status').value = item.status;
        }
    } else {
        document.getElementById(`${type}-modal-title`).textContent = `Add ${capitalizeFirst(type)}`;
        document.getElementById(`${type}-id-field`).value = '';
        if (type === 'customer') {
            document.getElementById('cust-uid').disabled = false;
        }
    }

    // Activate class overlay
    modal.classList.add('modal-active');
    setTimeout(() => {
        content.classList.add('modal-content-active');
    }, 50);
};

window.closeModal = (type) => {
    const modal = document.getElementById(`${type}-modal`);
    const content = document.getElementById(`${type}-modal-content`);
    if (!modal || !content) return;

    content.classList.remove('modal-content-active');
    setTimeout(() => {
        modal.classList.remove('modal-active');
    }, 200);
};

const openModalDirect = (type) => {
    const modal = document.getElementById(`${type}-modal`);
    const content = document.getElementById(`${type}-modal-content`);
    if (!modal || !content) return;

    modal.classList.add('modal-active');
    setTimeout(() => {
        content.classList.add('modal-content-active');
    }, 50);
};

window.openAddModal = (type) => {
    openModal(type);
};

window.openEditModal = (type, id) => {
    closeAllDropdowns();
    const list = state[`${type}s` || type];
    const item = list.find(x => x.id === id);
    if (item) {
        openModal(type, item);
    }
};

const populateSubscriptionSelects = (sub = null) => {
    const custSelect = document.getElementById('sub-customer');
    const servSelect = document.getElementById('sub-service');
    
    if (custSelect && servSelect) {
        custSelect.innerHTML = state.customers.map(c => `
            <option value="${c.id}">${c.name} (${c.customer_id})</option>
        `).join('');
        
        servSelect.innerHTML = state.services.map(s => `
            <option value="${s.id}">${s.name} - ${formatRupiah(s.price)}</option>
        `).join('');
    }
};

// ==============================================
// FORM SUBMISSION ACTIONS
// ==============================================

window.submitCustomerForm = async (e) => {
    e.preventDefault();
    const id = document.getElementById('customer-id-field').value;
    const body = {
        customer_id: document.getElementById('cust-uid').value,
        name: document.getElementById('cust-name').value,
        email: document.getElementById('cust-email').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        status: document.getElementById('cust-status').value === '1'
    };

    const url = id ? `/api/customers/${id}` : '/api/customers';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.success) {
            showToast(id ? 'Customer updated successfully!' : 'Customer created successfully!', 'success');
            closeModal('customer');
            switchView('customers');
        } else {
            showToast(data.message || 'Validation failed', 'error');
        }
    } catch (err) {
        showToast('Operation failed', 'error');
    }
};

window.submitServiceForm = async (e) => {
    e.preventDefault();
    const id = document.getElementById('service-id-field').value;
    const body = {
        name: document.getElementById('serv-name').value,
        price: parseInt(document.getElementById('serv-price').value),
        description: document.getElementById('serv-description').value,
        status: document.getElementById('serv-status').value === '1'
    };

    const url = id ? `/api/services/${id}` : '/api/services';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.success) {
            showToast(id ? 'Service updated successfully!' : 'Service created successfully!', 'success');
            closeModal('service');
            switchView('services');
        } else {
            showToast(data.message || 'Validation failed', 'error');
        }
    } catch (err) {
        showToast('Operation failed', 'error');
    }
};

window.submitSubscriptionForm = async (e) => {
    e.preventDefault();
    const id = document.getElementById('subscription-id-field').value;
    const body = {
        customer_id: parseInt(document.getElementById('sub-customer').value),
        service_id: parseInt(document.getElementById('sub-service').value),
        start_date: document.getElementById('sub-start-date').value,
        end_date: document.getElementById('sub-end-date').value,
        status: document.getElementById('sub-status').value
    };

    const url = id ? `/api/subscriptions/${id}` : '/api/subscriptions';
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.success) {
            showToast(id ? 'Subscription updated successfully!' : 'Subscription created successfully!', 'success');
            closeModal('subscription');
            switchView('subscriptions');
        } else {
            showToast(data.message || 'Validation failed', 'error');
        }
    } catch (err) {
        showToast('Operation failed', 'error');
    }
};

// ==============================================
// ACTIONS DROPDOWN & CRUD OPS
// ==============================================

window.toggleActionDropdown = (e, id) => {
    e.stopPropagation();
    const elementId = `dropdown-${id}`;
    const dropdown = document.getElementById(elementId);
    
    const isCurrentlyOpen = dropdown && !dropdown.classList.contains('hidden');
    
    closeAllDropdowns();
    
    if (dropdown && !isCurrentlyOpen) {
        dropdown.classList.remove('hidden');
        state.activeDropdownId = elementId;
    }
};

const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
    state.activeDropdownId = null;
};

window.quickAction = async (type, id, action) => {
    closeAllDropdowns();
    let url = '';
    let method = 'PATCH';
    let body = null;

    if (type === 'customer') {
        url = `/api/customers/${id}/${action}`;
    } else if (type === 'service') {
        url = `/api/services/${id}/${action}`;
    } else if (type === 'subscription') {
        url = `/api/subscriptions/${id}`;
        body = { status: action };
        method = 'PUT';
    }

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: body ? JSON.stringify(body) : null
        });

        const data = await res.json();
        if (data.success) {
            showToast(`${capitalizeFirst(type)} status updated to ${action}!`, 'success');
            switchView(`${type}s`);
        } else {
            showToast(data.message || 'Action failed', 'error');
        }
    } catch (err) {
        showToast('Action execution failed', 'error');
    }
};

window.deleteResource = async (type, id) => {
    closeAllDropdowns();
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/${type}s/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken()
            }
        });

        const data = await res.json();
        if (data.success) {
            showToast(`${capitalizeFirst(type)} deleted successfully!`, 'success');
            switchView(`${type}s`);
        } else {
            showToast(data.message || 'Delete failed', 'error');
        }
    } catch (err) {
        showToast('Delete operation failed', 'error');
    }
};

// ==============================================
// UTILITY HELPERS
// ==============================================

// Rupiah Money Formatter (IDR)
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2
    }).format(number);
};

// Period display formatter (e.g. 1 Jan 2026 - 1 Jul 2027)
const formatPeriod = (startStr, endStr) => {
    if (!startStr) return '-';
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : null;
    
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const startFormatted = start.toLocaleDateString('en-GB', options);
    
    if (!end) return startFormatted;
    const endFormatted = end.toLocaleDateString('en-GB', options);
    
    return `${startFormatted} - ${endFormatted}`;
};

const formatDateIso = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
};

const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
        case 'trial':
            return 'bg-yellow-100 text-yellow-750 dark:bg-yellow-950/30 dark:text-yellow-450';
        case 'isolir':
            return 'bg-red-100 text-red-750 dark:bg-red-950/30 dark:text-red-450';
        case 'dismantle':
            return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        default:
            return 'bg-slate-100 text-slate-650';
    }
};

// Corner Toast Alerts
const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm transform translate-y-2 opacity-0 transition-all duration-300 ${
        type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-350' 
            : type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-350'
            : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-350'
    }`;

    let icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
        <i data-lucide="${icon}" class="h-4.5 w-4.5 shrink-0"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 50);

    // Remove toast
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
};
