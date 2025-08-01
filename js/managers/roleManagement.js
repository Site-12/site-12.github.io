function rolesLoad() {
  fetch(connectionIp + "roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CurrentDepartment }),
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then((data) => {
      const container = document.getElementById("roleContent");
      container.innerHTML = "";
      data.Roles.forEach((role) => {
        container.appendChild(createRoleCard(role));
      });
    })
    .catch((err) => {
      console.error("Failed to load roles:", err);
    });
}

function createRoleCard(role) {
  const card = document.createElement("div");
  card.classList.add("custom-card");

  // Left: "Name (RoleId)"
  const info = document.createElement("span");
  info.classList.add("card-info");
  info.textContent = `${role.Name} | ${truncateText(role.Description, 114)}`;

  // Right: edit & delete
  const actions = document.createElement("div");
  actions.classList.add("card-actions");

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.innerHTML = `<i class="fas fa-edit"></i> Edit`;
  editBtn.addEventListener("click", () => {
    openRoleModal(role, role.ItemCosts);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteBtn.addEventListener("click", () => {
    fetch(connectionIp + "roles/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        RoleId: role.RoleId,
        CurrentDepartment: CurrentDepartment,
      }),
      credentials: "include",
    }).then((response) => {
      notificationComplete(
        `Deleted ${role.RoleId};`,
        response.ok,
        response.statusText,
      );
      refresh();
    });
  });

  actions.append(editBtn, deleteBtn);
  card.append(info, actions);
  return card;
}

// Wire up search + initial load
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("roleSearch");
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    document.querySelectorAll(".role-card").forEach((card) => {
      const text = card.querySelector(".card-info").textContent.toLowerCase();
      card.style.display = text.includes(term) ? "flex" : "none";
    });
  });
});
