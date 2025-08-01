function openNewPlayerModal() {
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
        response.json().then(data => openPlayerModal(undefined, data, true));
    });
}

function openPlayerModal(player, department, isNew) {
    const roleOptions = department.Roles.map(role => ({
        value: role.RoleId,
        label: role.Name
    }));
    const rankOptions = {};
    department.Roles.forEach(role => {
        rankOptions[role.RoleId] = (role.Ranks || []).map(rank => ({
            value: rank.RankId,
            label: rank.Name
        }));
    });

    const playerRoles = player === undefined ? [] : player.Roles.map(role => ({
        role: role.RoleId,
        rank: role.RankId,
    }));

    let totalTimePlayed = player === undefined ? 0 : player.TotalTimePlayed;

    let fields = [
        {
            name: 'timeSpent',
            type: 'number',
            label: 'Time Spent in seconds based in the current department',
            value: totalTimePlayed,
            placeholder: 'Somethings wrong or you removed their time.',
        },
        {
            name: 'roles',
            type: 'list',
            label: 'Roles and their ranks to it',
            displayField: 'role',
            editModalSize: 'modal-lg',
            editFields: [
                {
                    name: 'role',
                    type: 'select',
                    label: 'Role',
                    defaultOption: 'Select a role...',
                    options: roleOptions
                },
                {
                    name: 'rank',
                    type: 'select',
                    label: 'Rank',
                    defaultOption: 'Select a rank...',
                    dependsOn: 'role',
                    dynamicOptions: rankOptions
                }
            ],
            value: playerRoles
        }];
    if(isNew)
        fields = [
            {
                name: 'steamId',
                type: 'text',
                label: 'SteamID | E.X (76561199047996061@steam or @northwood or @discord) ask stick or any Lead Dev+ to know which',
                placeholder: '76561199047996061@steam'
            },
            {
                name: 'timeSpent',
                type: 'number',
                label: 'Time Spent in seconds based in the current department',
                value: totalTimePlayed,
                placeholder: 'Somethings wrong or you removed their time.',
            },
            {
                name: 'roles',
                type: 'list',
                label: 'Roles and their ranks to it',
                displayField: 'role',
                editModalSize: 'modal-lg',
                editFields: [
                    {
                        name: 'role',
                        type: 'select',
                        label: 'Role',
                        defaultOption: 'Select a role...',
                        options: roleOptions
                    },
                    {
                        name: 'rank',
                        type: 'select',
                        label: 'Rank',
                        defaultOption: 'Select a rank...',
                        dependsOn: 'role',
                        dynamicOptions: rankOptions
                    }
                ],
                value: playerRoles || []
            }];
    let title = player === undefined ? 'Add a new player to roster' : player.Username + ' (' + player.SteamId + ')';
    createModal({
        title: title,
        size: 'modal-xl',
        fields: fields,
        onApply: (formData) => {
            const body = {
                SteamId: player === undefined ? formData.steamId : player.SteamId,
                Department: CurrentDepartment,
                TotalTimePlayed: formData.timeSpent,
                roles: formData.roles
            };
            fetch(connectionIp + 'roster/modify', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
                credentials: 'include'
            }).then(response => {
                notificationComplete(formData.title, response.ok, response.statusText);
                refresh();
            }).catch(reason => {
                console.error(r);
                notificationComplete(formData.title, false, reason);
                refresh();
            });
        },
        onCancel: () => refresh()
    });
}