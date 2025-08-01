// Original functions from your code
const connectionIp = "https://localhost:7777/api/";
let CurrentDepartment = "";
function start() {
  refresh();
}

async function refresh() {
  const sesRes = await fetch(connectionIp + "session", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!sesRes.ok) {
    logout();
    return;
  }
  console.log("You have a valid session..");

  fetch(connectionIp + "session/department", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CurrentDepartment: "" }),
    credentials: "include",
  }).then((response) => {
    if (!response.ok) return;
    response.json().then((data) => {
      if (data.Departments === undefined) return;
      const list = document.getElementById("departmentsList");
      list.innerHTML = "";
      data.Departments.forEach((d) => {
        const li = document.createElement("li");
        li.innerHTML = `
                <a href="#" class="department-link" data-department="${d}">
                    <i class="${getTextIcon(d)} me-2"></i> ${d}
                </a>
                `;

        if (d === CurrentDepartment) li.classList.add("active");
        list.appendChild(li);
      });
    });
  });

  if (CurrentDepartment === "") return;

  fetch(connectionIp + "session/department", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CurrentDepartment: CurrentDepartment }),
    credentials: "include",
  }).then((response) => {
    if (!response.ok) return;
    response.json().then((data) => {
      if (data.Balance === undefined) return;
      document.getElementById("mainContent").hidden = false;
      document.getElementById("roles-tab").hidden = !data.CanAccessRoles;
      document.getElementById("roster-tab").hidden = !data.CanAccessRoster;
      document.getElementById("usersButton").hidden = !data.CanAccessUsers;
      document.getElementById("noneSelected").hidden = true;
      document.getElementById("departmentHome").textContent =
        CurrentDepartment.toUpperCase() + " DEPARTMENT";

      updateMoneyDisplay(data.Balance);
    });
  });

  rosterLoad();
  rolesLoad();
}

// document.addEventListener('click', function(e) {
//     if (e.target.id.includes('-tab') || e.target.closest('.nav-link')) {
//         if(e.target.id.startsWith("overview")) {
//             rosterOverviewLoad();
//         }
//
//         if(e.target.id.startsWith("roster")) {
//             rosterLoad();
//         }
//     }
// });

function truncateText(text, maxLength, ellipsis = "...") {
  if (text.length > maxLength) {
    // If the text is longer than maxLength, truncate it and add an ellipsis
    // Subtract ellipsis.length from maxLength to ensure the total length
    // including the ellipsis does not exceed maxLength.
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
  } else {
    // If the text is shorter than or equal to maxLength, return it as is
    return text;
  }
}

const iconMappings = {
  Engineering: "fas fa-cogs",
  Security: "fas fa-shield-alt",
};

function getTextIcon(text) {
  return iconMappings[text] || "fas fa-question-circle";
}

function formatMoney(amount) {
  return "$" + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateMoneyDisplay(value) {
  document.getElementById("money-display").textContent = formatMoney(value);
}

function logout() {
  window.location.href = "login.html";
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  start();
});
