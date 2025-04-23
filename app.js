// app.js or inline script in index.html

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
    // Register the service worker after the page has loaded
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js') // Path to your service worker file
        .then(registration => {
          console.log('Service Worker registered successfully with scope:', registration.scope);
  
          // --- Optional: Listen for updates ---
          registration.addEventListener('updatefound', () => {
            // A new service worker is installing.
            const installingWorker = registration.installing;
            console.log('A new service worker is installing:', installingWorker);
  
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // At this point, the old content is still being served.
                  // A new service worker is waiting to activate.
                  // You could prompt the user here to refresh the page to get the update.
                  console.log('New content is available; please refresh.');
                  // Example: showRefreshUI(registration);
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a "Content is cached for offline use." message.
                  console.log('Content is cached for offline use.');
                }
              }
            });
          });
  
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  
    // --- Optional: Detect controller change ---
    // This fires when the service worker controlling this page changes,
    // often due to registration.claim() or a refresh after an update.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Controller changed. Page may be using a new service worker.');
      // Optionally force-reload the page to ensure the latest assets are used.
      // window.location.reload();
    });
  
  } else {
    console.log('Service Workers are not supported in this browser.');
  }
  
  // --- Optional: UI function to prompt for refresh ---
  /*
  function showRefreshUI(registration) {
    // Create a button or notification element
    const refreshButton = document.createElement('button');
    refreshButton.style.position = 'fixed';
    refreshButton.style.bottom = '20px';
    refreshButton.style.left = '20px';
    refreshButton.style.zIndex = '1000';
    refreshButton.style.padding = '10px';
    refreshButton.style.backgroundColor = '#0d9488';
    refreshButton.style.color = 'white';
    refreshButton.style.border = 'none';
    refreshButton.style.borderRadius = '5px';
    refreshButton.textContent = 'New version available. Refresh?';
  
    refreshButton.addEventListener('click', () => {
      if (!registration.waiting) {
        // Just to ensure registration.waiting is available before calling postMessage()
        return;
      }
      // Send message to SW to skip waiting and activate immediately
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      // Optionally, remove the button after clicking
      refreshButton.remove();
      // Reload the page once the new SW is active (controllerchange event handles this)
    });
  
    document.body.appendChild(refreshButton);
  }
  
  // Add this inside the 'install' event listener in sw.js to handle the message:
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  */
  
  
  // --- Your existing application logic ---
  // (e.g., navigation, data handling, dark mode toggle)
  
  document.addEventListener('DOMContentLoaded', () => {
      const navLinks = document.querySelectorAll('.nav-link');
      const sections = document.querySelectorAll('.main-content .section');
      const themeToggleButton = document.getElementById('theme-toggle'); // Assuming you add this button
      const addItemButton = document.querySelector('#inventory-section .tw-button-primary'); // Get Add Item button
      const modal = document.getElementById('add-item-modal'); // Assuming you add a modal with this ID
      const closeModalButton = document.getElementById('close-modal'); // Assuming a close button in the modal
  
      // Function to switch sections
      function showSection(targetId) {
          sections.forEach(section => {
              if (section.id === targetId + '-section') {
                  section.classList.add('active');
                  section.classList.remove('hidden'); // Make sure it's visible
              } else {
                  section.classList.remove('active');
                  section.classList.add('hidden'); // Hide inactive sections
              }
          });
  
          navLinks.forEach(link => {
              if (link.id === 'nav-' + targetId) {
                  link.classList.add('active');
              } else {
                  link.classList.remove('active');
              }
          });
          // Store the active section in localStorage
          localStorage.setItem('activeSection', targetId);
      }
  
      // Navigation click handling
      navLinks.forEach(link => {
          link.addEventListener('click', (e) => {
              e.preventDefault();
              const targetId = link.getAttribute('href').substring(1); // Get 'inventory', 'reports', etc.
              showSection(targetId);
          });
      });
  
      // Restore last active section on page load
      const lastActiveSection = localStorage.getItem('activeSection');
      if (lastActiveSection) {
          // Ensure the default active classes are removed before applying the stored one
          document.querySelector('.nav-link.active')?.classList.remove('active');
          document.querySelector('.main-content .section.active')?.classList.remove('active');
          document.querySelector('.main-content .section:not(.hidden)')?.classList.add('hidden');
  
          showSection(lastActiveSection);
      } else {
          // Default to inventory if nothing is stored
          showSection('inventory');
      }
  
  
      // --- Dark Mode Toggle ---
      const applyTheme = (theme) => {
          if (theme === 'dark') {
              document.documentElement.classList.add('dark');
              document.body.classList.add('dark'); // Ensure body gets dark class too
          } else {
              document.documentElement.classList.remove('dark');
              document.body.classList.remove('dark');
          }
          localStorage.setItem('theme', theme);
      };
  
      // Check for saved theme preference or use system preference
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
      if (savedTheme) {
          applyTheme(savedTheme);
      } else {
          applyTheme(prefersDark ? 'dark' : 'light');
      }
  
      // Add a theme toggle button listener (assuming you add a button with id="theme-toggle")
      if (themeToggleButton) {
          themeToggleButton.addEventListener('click', () => {
              const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
              applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
          });
      }
  
      // --- Modal Handling (Example) ---
      if (addItemButton && modal && closeModalButton) {
          addItemButton.addEventListener('click', () => {
              modal.classList.remove('hidden');
              modal.classList.add('flex'); // Use flex to center it if using flex layout for modal background
          });
  
          closeModalButton.addEventListener('click', () => {
              modal.classList.add('hidden');
              modal.classList.remove('flex');
          });
  
          // Optional: Close modal if clicking outside the content
          modal.addEventListener('click', (event) => {
              if (event.target === modal) { // Check if the click is on the backdrop itself
                  modal.classList.add('hidden');
                  modal.classList.remove('flex');
              }
          });
      }
  
      // --- Placeholder for Data Loading/Display ---
      // loadInventoryData(); // Example function call
      // loadReportData(); // Example function call
      // loadAuditLog(); // Example function call
  });
  
  // Example function to load inventory (replace with actual data fetching/display)
  function loadInventoryData() {
      const tableBody = document.querySelector('#inventory-table tbody'); // Assuming table has id="inventory-table"
      if (!tableBody) return;
  
      // Clear existing rows
      tableBody.innerHTML = '';
  
      // Sample data (replace with data from IndexedDB or API)
      const items = [
          { id: 'SKU001', name: 'Heavy Duty Widget', category: 'Widgets', quantity: 150, status: 'In Stock' },
          { id: 'SKU002', name: 'Standard Gizmo', category: 'Gizmos', quantity: 0, status: 'Out of Stock' },
          { id: 'SKU003', name: 'Premium Thingamajig', category: 'Thingamajigs', quantity: 35, status: 'Low Stock' },
      ];
  
      items.forEach(item => {
          const row = tableBody.insertRow();
          row.className = 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150';
  
          row.innerHTML = `
              <td class="py-3 px-4 text-sm">${item.id}</td>
              <td class="py-3 px-4 font-medium">${item.name}</td>
              <td class="py-3 px-4 text-sm">${item.category}</td>
              <td class="py-3 px-4 text-sm text-center">${item.quantity}</td>
              <td class="py-3 px-4 text-sm">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-700 dark:text-emerald-100' :
                      item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' :
                      'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                  }">
                      ${item.status}
                  </span>
              </td>
              <td class="py-3 px-4 text-sm text-center">
                  <button class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
              </td>
          `;
      });
  }
  
  // Call loadInventoryData initially if inventory is the default section
  if (!localStorage.getItem('activeSection') || localStorage.getItem('activeSection') === 'inventory') {
     // loadInventoryData(); // Uncomment when ready
  }
  
  // Add placeholders for other data loading functions
  function loadReportData() { console.log("Load Report Data"); }
  function loadAuditLog() { console.log("Load Audit Log"); }
  