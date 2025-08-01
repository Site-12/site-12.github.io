const PermissionValues = {
    None: 0,
    ViewRoster: 1,      // 2^0
    ModifyRoster: 2,    // 2^1
    ViewRoles: 4,       // 2^2
    ModifyRoles: 8,     // 2^3
    ViewShop: 16,       // 2^4
    ModifyShop: 32,     // 2^5
    ViewLoans: 64,      // 2^6
    ModifyLoans: 128,   // 2^7
    ModifyUsers: 256,   // 2^8
};

const hasPermission = (userPermissions, permission) => {
    return (userPermissions & permission) === permission;
};

const getPermissionLevel = (userPermissions, viewFlag, modifyFlag) => {
    if (hasPermission(userPermissions, modifyFlag)) return "modify";
    if (hasPermission(userPermissions, viewFlag)) return "view";
    return "none";
};

const mapUsersToFormFields = (jsonUsers) => {
    return jsonUsers.map(user => {
        return {
            username: user.Username,
            password: user.Password,
            roster: getPermissionLevel(user.Permissions, PermissionValues.ViewRoster, PermissionValues.ModifyRoster),
            roles: getPermissionLevel(user.Permissions, PermissionValues.ViewRoles, PermissionValues.ModifyRoles),
            shop: getPermissionLevel(user.Permissions, PermissionValues.ViewShop, PermissionValues.ModifyShop),
            monetization: getPermissionLevel(user.Permissions, PermissionValues.ViewLoans, PermissionValues.ModifyLoans),
            users: hasPermission(user.Permissions, PermissionValues.ModifyUsers) ? "modify" : "none"
        };
    });
};

function openUserModal() {
    fetch(connectionIp + 'users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({CurrentDepartment: CurrentDepartment}),
        credentials: 'include'
    }).then(response => {
        if(!response.ok)
            return;
        response.json().then(data => {
            console.log(data);
            createModal({
                title: 'Users',
                size: 'modal-xl',
                fields: [
                    {
                        name: 'users',
                        type: 'list',
                        label: `Access users within the ${CurrentDepartment} department`,
                        displayField: 'username',
                        editModalSize: 'modal-lg',
                        editFields: [
                            {
                                name: 'username',
                                type: 'text',
                                label: 'Username (DO NOT CHANGE AFTER CREATION)',
                                value: `John ${CurrentDepartment}`,
                                placeholder: 'Enter username',
                                required: true
                            },
                            {
                                name: 'password',
                                type: 'password',
                                label: 'Password',
                                value: `${CurrentDepartment}123!`,
                                placeholder: 'Enter password',
                                required: true
                            },
                            {
                                name: 'roster',
                                type: 'dropdown',
                                label: 'Roster Permissions',
                                options: [
                                    {value: "none", label: "None"},
                                    {value: "view", label: "View"},
                                    {value: "modify", label: "Modify"},
                                ]
                            },
                            {
                                name: 'roles',
                                type: 'dropdown',
                                label: 'Role Permissions',
                                options: [
                                    {value: "none", label: "None"},
                                    {value: "view", label: "View"},
                                    {value: "modify", label: "Modify"},
                                ]
                            },
                            {
                                name: 'shop',
                                type: 'dropdown',
                                label: 'Shop Permissions',
                                options: [
                                    {value: "none", label: "None"},
                                    {value: "view", label: "View"},
                                    {value: "modify", label: "Modify"},
                                ]
                            },
                            {
                                name: 'monetization',
                                type: 'dropdown',
                                label: 'Loans Permissions',
                                options: [
                                    {value: "none", label: "None"},
                                    {value: "view", label: "View"},
                                    {value: "modify", label: "Modify"},
                                ]
                            },
                            {
                                name: 'users',
                                type: 'dropdown',
                                label: 'User Modification Permissions',
                                options: [
                                    {value: "none", label: "None"},
                                    {value: "modify", label: "Modify"},
                                ]
                            },
                        ],
                        value: mapUsersToFormFields(data.Users),
                    }
                ],
                onApply: (formData, jsonData) => {
                    console.log(formData);
                    fetch(connectionIp + 'pushUsers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            CurrentDepartment: CurrentDepartment,
                            Users: formData.users,
                        }),
                        credentials: 'include'
                    }).then(response => {
                        notificationComplete(formData.title, response.ok, response.statusText);
                        refresh();
                    }).catch(reason => {
                        notificationComplete(formData.title, false, reason);
                        refresh();
                    });
                },
                onCancel: () => refresh()
            })
        });
    });
}