function rosterLoad() {
    fetch(connectionIp + 'roster', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({CurrentDepartment: CurrentDepartment}),
        credentials: 'include'
    }).then(response => {
        if(!response.ok)
            return;
        response.json().then(data => {
            const rosterContent = document.getElementById('rosterContent');
            if(data.Players.length === 0)
                rosterContent.innerHTML = '<i class="fas fa-info-circle"></i> It\'s quiet here, you should add someone with a friend so they aren\'t alone.';
            else
                rosterContent.innerHTML = '';
            data.Players.forEach(player => {
                rosterContent.appendChild(createRosterCard(player));
            });
        });
    }).catch(r => {
        console.error(r)
        notificationComplete('Roster', false, r.reason);
    });
}

function createRosterCard(player) {
    const card = document.createElement('div');
    card.classList.add('custom-card');

    // Left: Username (SteamId)
    const info = document.createElement('span');
    info.classList.add('card-info');
    info.textContent = `${player.Username} (${player.SteamId})`;

    // Right: Edit & Delete buttons
    const actions = document.createElement('div');
    actions.classList.add('card-actions');

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    // icon + text
    editBtn.innerHTML = `<i class="fas fa-edit"></i> Edit`;
    editBtn.addEventListener('click', () => {
        fetch(connectionIp + 'roster/department', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({CurrentDepartment: CurrentDepartment}),
            credentials: 'include'
        }).then(response => {
            if(!response.ok) {
                refresh();
                return;
            }
            response.json().then(data => openPlayerModal(player, data));
        });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    // icon only
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteBtn.addEventListener('click', () => {
        fetch(connectionIp + 'roster/delete', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({SteamId: player.SteamId, Department: CurrentDepartment}),
            credentials: 'include'
        }).then(response => {
            if(!response.ok) {
                refresh();
                return;
            }
            refresh();
        });
    });

    actions.append(editBtn, deleteBtn);
    card.append(info, actions);
    return card;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('rosterSearch');
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const text = card.querySelector('.card-info').textContent.toLowerCase();
            card.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });
});