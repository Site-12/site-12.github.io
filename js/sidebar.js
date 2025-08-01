const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const mainContent = document.getElementById('mainContent');

// Department link functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('department-link') || e.target.closest('.department-link')) {
        const link = e.target.classList.contains('department-link') ? e.target : e.target.closest('.department-link');

        // Remove active class from all links
        document.querySelectorAll('.department-link').forEach(l => l.classList.remove('active'));

        // Add active class to clicked link
        link.classList.add('active');

        const department = link.getAttribute('data-department');
        fetch(connectionIp + 'session/department', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({CurrentDepartment: department}),
            credentials: 'include'
        }).then(response => {
            if(!response.ok) {
                // They have no permissions, so we should skip .json() to prevent an error
                return;
            }
            response.json().then(data => {
                CurrentDepartment = department;
                document.getElementById("mainContent").hidden = false;
                document.getElementById("roles-tab").hidden = !data.CanAccessRoles;
                document.getElementById("roster-tab").hidden = !data.CanAccessRoster;
                document.getElementById("usersButton").hidden = !data.CanAccessUsers;
                document.getElementById("noneSelected").hidden = true;
                document.getElementById("departmentHome").textContent = department.toUpperCase() + " DEPARTMENT";

                rosterLoad();
                rolesLoad();
                updateMoneyDisplay(data.Balance);
            });
        });

        console.log('Switched to department:', department);
    }
});

sidebarToggle.addEventListener('click', toggleSidebar);
sidebarOverlay.addEventListener('click', toggleSidebar);

function toggleSidebar() {
    sidebar.classList.toggle('show');
    sidebarOverlay.classList.toggle('show');

    // For desktop, adjust main content margin
    if (window.innerWidth > 768) {
        mainContent.classList.toggle('sidebar-open');
    }
}

// Close sidebar on window resize if mobile
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        mainContent.classList.remove('sidebar-open');
    } else if (sidebar.classList.contains('show')) {
        mainContent.classList.add('sidebar-open');
    }
});