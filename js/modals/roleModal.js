function openNewRoleModal() {
  fetch(connectionIp + "items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ CurrentDepartment }),
    credentials: "include",
  }).then((response) => {
    if (!response.ok) return;
    response.json().then((data) => openRoleModal(undefined, data.ItemCosts));
  });
}

function openRoleModal(role, itemCosts) {
  let name = role === undefined ? `${CurrentDepartment} Board` : role.Name;
  let starterName =
    role === undefined ? `Dr. [F] [L] [N] [Nl] [Ns]` : role.StarterName;
  let customInfo = role === undefined ? `Example Custom Info` : role.CustomInfo;
  let description = role === undefined ? `` : role.Description;
  let displayInRolePicker =
    role === undefined ? "false" : `${role.DisplayInRolePicker}`;

  let selectableItems = itemCosts.map((item) => {
    return {
      label: item.ItemType + " ($" + item.Price + ")",
      value: item.ItemType,
    };
  });
  let ranks =
    role === undefined
      ? []
      : role.Ranks.map((rank) => {
          return {
            rankId: rank.RankId,
            name: rank.Name,
            roleTypeId: `${rank.RoleTypeId}`,
            amountPaidPerRP: rank.AmountPaidPerRP,
            hasPda: `${rank.HasPda}`,
            hasSyringe: `${rank.HasSyringe}`,
            rosterLocked: `${rank.RosterLocked}`,
            useBaseGameSpawnLocation: `${rank.UseBaseGameSpawnLocation}`,
            items: rank.LoadoutItems.map((loadoutItem) => {
              return {
                itemType: loadoutItem.ItemType,
                amount: loadoutItem.Amount,
                permissions: loadoutItem.Permissions.map((permission) => {
                  return {
                    permission: permission,
                  };
                }),
              };
            }),
          };
        });
  createModal({
    title:
      role === undefined
        ? "Add a new role to the list"
        : role.Name + " (" + role.RoleId + ")",
    size: "modal-xl",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Role Name",
        value: name,
        placeholder: `${CurrentDepartment} Board`,
      },
      {
        name: "starterName",
        type: "text",
        label: "Starter Name (Prefix)",
        value: starterName,
        placeholder: "Somethings wrong or you removed their time.",
      },
      {
        name: "customInfo",
        type: "text",
        label: "Custom Info",
        value: customInfo,
        placeholder: "Somethings wrong or you removed their time.",
      },
      {
        name: "description",
        type: "text",
        label: "Description",
        value: description,
        placeholder: "Somethings wrong or you removed their time.",
      },
      {
        name: "displayInRolePicker",
        type: "dropdown",
        label: "Should this be displayed in a Role Picker?",
        value: displayInRolePicker,
        options: [
          { value: "true", label: "True" },
          { value: "false", label: "False" },
        ],
      },
      {
        name: "ranks",
        type: "list",
        label: "Ranks",
        displayField: "name",
        editModalSize: "modal-lg",
        editFields: [
          {
            name: "rankId",
            type: "number",
            label:
              "DO NOT CHANGE (CHANGING THIS WILL RESULT IN A POSSIBLE DELETION OF ANOTHER RANK (IN ANOTHER OR SAME DEPARTMENT))",
            value: -1,
          },
          {
            name: "name",
            type: "text",
            label: "Rank Name",
            placeholder: "Agent",
          },
          {
            name: "roleTypeId",
            type: "dropdown",
            label: "Role",
            options: [
              // ─── Human Personnel ─────────────────────────────────────
              { value: "1", label: "Class-D" },
              { value: "6", label: "Scientist" },
              { value: "15", label: "Facility Guard" },

              // ─── NTF (Nine-Tailed Fox) ───────────────────────────────
              { value: "4", label: "NTF Specialist" },
              { value: "11", label: "NTF Sergeant" },
              { value: "12", label: "NTF Captain" },
              { value: "13", label: "NTF Private" },

              // ─── Chaos Insurgency ───────────────────────────────────
              { value: "8", label: "Chaos Conscript" },
              { value: "18", label: "Chaos Rifleman" },
              { value: "19", label: "Chaos Marauder" },
              { value: "20", label: "Chaos Repressor" },

              // ─── SCP Entities ───────────────────────────────────────
              { value: "0", label: "SCP-173" },
              { value: "3", label: "SCP-106" },
              { value: "5", label: "SCP-049" },
              { value: "7", label: "SCP-079" },
              { value: "9", label: "SCP-096" },
              { value: "10", label: "SCP-049-2" },
              { value: "16", label: "SCP-939" },
              { value: "23", label: "SCP-3114" },

              // ─── Flamingo Variants ──────────────────────────────────
              // { value: '25', label: 'Flamingo'        },
              // { value: '26', label: 'Alpha Flamingo'  },
              // { value: '27', label: 'Zombie Flamingo' },

              // ─── Misc / Other ───────────────────────────────────────
              { value: "2", label: "Spectator" },
              { value: "21", label: "Overwatch" },
              { value: "22", label: "Filmmaker" },
              { value: "14", label: "Tutorial" },
            ],
          },
          {
            name: "amountPaidPerRP",
            type: "number",
            label: "Amount Paid Per RP",
            placeholder: "312",
          },
          {
            name: "hasPda",
            type: "dropdown",
            label: "Has a PDA System?",
            options: [
              { value: "true", label: "True" },
              { value: "false", label: "False" },
            ],
          },
          {
            name: "hasSyringe",
            type: "dropdown",
            label: "Has a syringe?",
            options: [
              { value: "true", label: "True" },
              { value: "false", label: "False" },
            ],
          },
          {
            name: "rosterLocked",
            type: "dropdown",
            label: "Roster Locked?",
            options: [
              { value: "true", label: "True" },
              { value: "false", label: "False" },
            ],
          },
          {
            name: "useBaseGameSpawnLocation",
            type: "dropdown",
            label: "Use the base game spawn location for the role",
            options: [
              { value: "true", label: "True" },
              { value: "false", label: "False" },
            ],
          },
          {
            name: "items",
            type: "list",
            label: "Items",
            displayField: "itemType",
            editModalSize: "modal-lg",
            editFields: [
              {
                name: "itemType",
                type: "dropdown",
                label: "Item Type",
                options: selectableItems,
              },
              {
                name: "amount",
                type: "number",
                label: "Amount of items",
              },
              {
                name: "permissions",
                type: "list",
                label: "Permissions (Will not display on non KeycardItems)",
                displayField: "permission",
                editModalSize: "modal-lg",
                editFields: [
                  {
                    name: "permission",
                    type: "dropdown",
                    label: "Permission Type",
                    options: [
                      { value: 1, label: "SEC_SSZ" }, // 0x1
                      { value: 2, label: "SEC_CDC" }, // 0x2
                      { value: 4, label: "SEC_RACK" }, // 0x4
                      { value: 8, label: "SEC_ARM" }, // 0x8
                      { value: 16, label: "SEC_OFC" }, // 0x10
                      { value: 32, label: "SEC_INTR" }, // 0x20
                      { value: 64, label: "SEC_RNG" }, // 0x40

                      { value: 128, label: "RSC_LAB" }, // 0x80
                      { value: 256, label: "RSC_STRG" }, // 0x100
                      { value: 512, label: "RSC_CNT1" }, // 0x200
                      { value: 1024, label: "RSC_CNT2" }, // 0x400

                      { value: 2048, label: "TEX_ELX1" }, // 0x800
                      { value: 4096, label: "ENG_LAB" }, // 0x1000
                      { value: 8192, label: "ENG_SPX" }, // 0x2000

                      { value: 16384, label: "MED_STRG" }, // 0x4000
                      { value: 32768, label: "MED_OFC" }, // 0x8000

                      // Note: these share the same bit‐values as ENG_* and MED_* above
                      { value: 4096, label: "ACC_CHKP" }, // 0x1000
                      { value: 8192, label: "ACC_EXIT" }, // 0x2000
                      { value: 16384, label: "ADM_COMM" }, // 0x4000
                      { value: 32768, label: "ADM_OFC" }, // 0x8000
                      { value: 65536, label: "ADM_EMX" }, // 0x10000
                    ],
                  },
                ],
              },
            ],
          },
        ],
        value: ranks,
      },
    ],
    onApply: (formData) => {
      const ranks = formData.ranks.map((rank) => {
        return {
          RankId: rank.rankId,
          Name: rank.name,
          RoleTypeId: parseInt(rank.roleTypeId),
          AmountPaidPerRP: parseFloat(rank.amountPaidPerRP),
          HasPda: rank.hasPda === "true",
          HasSyringe: rank.hasSyringe === "true",
          RosterLocked: rank.rosterLocked === "true",
          UseBaseGameSpawnLocation: rank.useBaseGameSpawnLocation === "true",
          LoadoutItems: rank.items.map((item) => {
            return {
              ItemType: item.itemType,
              Amount: parseInt(item.amount),
              Permissions: item.permissions.map(
                (permission) => permission.permission,
              ),
            };
          }),
        };
      });
      const body = {
        CurrentDepartment: CurrentDepartment,
        Response: {
          RoleId: role === undefined ? -1 : role.RoleId,
          Name: formData.name,
          StarterName: formData.starterName,
          CustomInfo: formData.customInfo,
          Description: formData.description,
          DisplayInRolePicker: formData.displayInRolePicker === "true",
          Ranks: ranks,
        },
      };
      fetch(connectionIp + "roles/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      })
        .then((response) => {
          notificationComplete(
            formData.title,
            response.ok,
            response.statusText,
          );
          refresh();
        })
        .catch((reason) => {
          console.error(r);
          notificationComplete(formData.title, false, reason);
          refresh();
        });
    },
    onCancel: () => refresh(),
  });
}
