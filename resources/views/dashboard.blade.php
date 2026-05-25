<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>ERP Dashboard</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Vite Assets -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        .dark ::-webkit-scrollbar-thumb {
            background: #475569;
        }
        /* Modals and Dropdowns custom animations */
        .modal-active {
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        .modal-content-active {
            transform: scale(1) !important;
            opacity: 1 !important;
        }
        .dropdown-active {
            display: block !important;
        }
    </style>
</head>
<body class="h-full bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 antialiased overflow-hidden">

    <div class="flex h-full overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 z-30">
            <div>
                <!-- Brand Logo -->
                <div class="px-6 py-5 flex items-center gap-3 border-b border-slate-800">
                    <div class="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
                        <i data-lucide="layers" class="h-5 w-5"></i>
                    </div>
                    <span class="font-bold text-xl tracking-tight text-white">ERP System</span>
                </div>

                <!-- Navigation Menu -->
                <nav class="mt-6 px-4 space-y-1.5">
                    <button onclick="switchView('dashboard')" id="nav-dashboard" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 bg-slate-800 text-white shadow-sm">
                        <i data-lucide="layout-dashboard" class="h-4 w-4"></i>
                        <span>Dashboard</span>
                    </button>
                    
                    <button onclick="switchView('customers')" id="nav-customers" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-slate-800 hover:text-white text-slate-400">
                        <i data-lucide="users" class="h-4 w-4"></i>
                        <span>Customers</span>
                    </button>

                    <button onclick="switchView('services')" id="nav-services" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-slate-800 hover:text-white text-slate-400">
                        <i data-lucide="server" class="h-4 w-4"></i>
                        <span>Services</span>
                    </button>

                    <button onclick="switchView('subscriptions')" id="nav-subscriptions" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-slate-800 hover:text-white text-slate-400">
                        <i data-lucide="calendar" class="h-4 w-4"></i>
                        <span>Subscriptions</span>
                    </button>
                </nav>
            </div>

            <!-- Sidebar Bottom Actions -->
            <div class="p-4 border-t border-slate-800 space-y-2">
                <!-- Theme Toggle -->
                <button onclick="toggleTheme()" class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                    <div class="flex items-center gap-2.5">
                        <i data-lucide="sun" class="h-4 w-4 dark:hidden"></i>
                        <i data-lucide="moon" class="h-4 w-4 hidden dark:block text-yellow-400"></i>
                        <span>Appearance</span>
                    </div>
                    <span class="text-[10px] bg-slate-800 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-400" id="theme-label">Light</span>
                </button>

                <!-- Sign Out -->
                <button onclick="openSignOutModal()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all">
                    <i data-lucide="log-out" class="h-4 w-4"></i>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Topbar Header -->
            <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
                <div class="flex items-center gap-3">
                    <h1 id="page-title" class="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                </div>

                <!-- Global search & Profile -->
                <div class="flex items-center gap-4">
                    <!-- Search Input -->
                    <div class="relative w-64" id="search-container">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i data-lucide="search" class="h-4 w-4"></i>
                        </span>
                        <input type="text" id="global-search" oninput="handleSearch(this.value)" placeholder="Search dynamic data..." class="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500">
                    </div>

                    <!-- Profile Dropdown Trigger -->
                    <div class="relative">
                        <button onclick="toggleProfileDropdown()" class="flex items-center gap-2 focus:outline-none" id="profile-menu-button">
                            <div class="h-8 w-8 rounded-full bg-indigo-500 text-white font-semibold flex items-center justify-center shadow-md">
                                AE
                            </div>
                            <div class="hidden md:block text-left">
                                <p class="text-xs font-semibold leading-none text-slate-900 dark:text-white">Admin ERP</p>
                                <p class="text-[10px] text-slate-400 dark:text-slate-500">admin@erp.com</p>
                            </div>
                            <i data-lucide="chevron-down" class="h-3 w-3 text-slate-400"></i>
                        </button>

                        <!-- Profile Dropdown Menu -->
                        <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50">
                            <a href="#" class="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">My Profile</a>
                            <a href="#" class="block px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">Account Settings</a>
                            <hr class="border-slate-100 dark:border-slate-700 my-1">
                            <button onclick="openSignOutModal()" class="w-full text-left block px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">Sign Out</button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Inner Dynamic Container -->
            <div id="view-container" class="flex-1 overflow-y-auto p-6">
                <!-- Loader Placeholder -->
                <div id="view-loader" class="hidden h-full flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>

                <!-- Dynamic Content Injection point -->
                <div id="dynamic-content" class="h-full">
                    <!-- Dashboard Summary Content (Initial View) -->
                </div>
            </div>
        </main>
    </div>

    <!-- ============================================== -->
    <!-- MODALS SECTION -->
    <!-- ============================================== -->

    <!-- CUSTOMER MODAL -->
    <div id="customer-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
        <div class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300" id="customer-modal-content">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white" id="customer-modal-title">Add Customer</h3>
                <button onclick="closeModal('customer')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <form id="customer-form" onsubmit="submitCustomerForm(event)" class="mt-4 space-y-4">
                <input type="hidden" id="customer-id-field">
                
                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="cust-uid">Customer ID</label>
                    <input type="text" id="cust-uid" required placeholder="Enter customer numeric ID" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="cust-name">Customer Name</label>
                    <input type="text" id="cust-name" required placeholder="Enter customer name" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="cust-email">Email</label>
                    <input type="email" id="cust-email" required placeholder="Enter customer email" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="cust-phone">Phone (Optional)</label>
                    <input type="text" id="cust-phone" placeholder="Enter customer phone" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="cust-address">Address</label>
                    <textarea id="cust-address" placeholder="Enter customer address" rows="2" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none"></textarea>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="cust-status">Status</label>
                    <select id="cust-status" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                        <option value="1">Active</option>
                        <option value="0">Deactivate</option>
                    </select>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button type="button" onclick="closeModal('customer')" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">Cancel</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/20 transition-all">Submit</button>
                </div>
            </form>
        </div>
    </div>

    <!-- SERVICE MODAL -->
    <div id="service-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
        <div class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-880 rounded-2xl shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300" id="service-modal-content">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white" id="service-modal-title">Add Service</h3>
                <button onclick="closeModal('service')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <form id="service-form" onsubmit="submitServiceForm(event)" class="mt-4 space-y-4">
                <input type="hidden" id="service-id-field">
                
                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="serv-name">Service Name</label>
                    <input type="text" id="serv-name" required placeholder="Enter service name" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="serv-price">Price (IDR)</label>
                    <input type="number" id="serv-price" required min="0" placeholder="Enter price, e.g. 1000000" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="serv-description">Description</label>
                    <textarea id="serv-description" placeholder="Enter service details" rows="3" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none"></textarea>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="serv-status">Status</label>
                    <select id="serv-status" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                        <option value="1">Active</option>
                        <option value="0">Deactivate</option>
                    </select>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button type="button" onclick="closeModal('service')" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">Cancel</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/20 transition-all">Submit</button>
                </div>
            </form>
        </div>
    </div>

    <!-- SUBSCRIPTION MODAL -->
    <div id="subscription-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
        <div class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300" id="subscription-modal-content">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white" id="subscription-modal-title">Add Subscription</h3>
                <button onclick="closeModal('subscription')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <form id="subscription-form" onsubmit="submitSubscriptionForm(event)" class="mt-4 space-y-4">
                <input type="hidden" id="subscription-id-field">
                
                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="sub-customer">Customer</label>
                    <select id="sub-customer" required class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                        <!-- Populated dynamically -->
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="sub-service">Service</label>
                    <select id="sub-service" required class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                        <!-- Populated dynamically -->
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="sub-start-date">Start Date</label>
                        <input type="date" id="sub-start-date" required class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="sub-end-date">End Date</label>
                        <input type="date" id="sub-end-date" required class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1" for="sub-status">Status</label>
                    <select id="sub-status" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="isolir">Isolir</option>
                        <option value="dismantle">Dismantle</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button type="button" onclick="closeModal('subscription')" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">Cancel</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/20 transition-all">Submit</button>
                </div>
            </form>
        </div>
    </div>

    <!-- SIGN OUT MODAL -->
    <div id="sign-out-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300">
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transform scale-95 opacity-0 transition-all duration-300" id="sign-out-modal-content">
            <div class="text-center">
                <div class="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                    <i data-lucide="log-out" class="h-6 w-6"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Sign Out</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Are you sure you want to log out of the ERP system?</p>
            </div>
            <div class="flex items-center justify-center gap-3 mt-6">
                <button onclick="closeModal('sign-out')" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">Cancel</button>
                <button onclick="logoutAction()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-600/20 transition-all">Sign Out</button>
            </div>
        </div>
    </div>

    <!-- TOAST NOTIFICATION CONTAINER -->
    <div id="toast-container" class="fixed bottom-5 right-5 z-50 space-y-2"></div>

</body>
</html>
