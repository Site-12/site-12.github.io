// Enhanced Modal Function with Dynamic Dropdown Support and Reorderable Lists with Animations
function createModal(options = {}) {
  // Add CSS for drag animations if not already present
  if (!document.querySelector("#modal-drag-animations")) {
    const style = document.createElement("style");
    style.id = "modal-drag-animations";
    style.textContent = `
            .drag-item {
                transition: all 0.2s ease;
                transform-origin: center;
            }

            .drag-item.dragging {
                opacity: 0.3;
                transform: scale(0.95);
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 1000;
                position: relative;
            }

            .drag-item.drag-over {
                transform: translateY(8px);
                background-color: rgba(108, 117, 125, 0.2) !important;
                border-color: #6c757d !important;
            }

            .drag-item.drag-over-top {
                transform: translateY(-8px);
                background-color: rgba(108, 117, 125, 0.2) !important;
                border-color: #6c757d !important;
            }

            .drag-placeholder {
                height: 4px;
                background: linear-gradient(90deg, #0d6efd, #6610f2);
                border-radius: 2px;
                margin: 2px 0;
                opacity: 0;
                transform: scaleX(0);
                transition: all 0.2s ease;
            }

            .drag-placeholder.show {
                opacity: 1;
                transform: scaleX(1);
            }

            .list-group-item {
                border-radius: 0.375rem !important;
                margin-bottom: 2px;
            }

            .drag-handle {
                opacity: 0.5;
                transition: opacity 0.2s ease;
            }

            .drag-item:hover .drag-handle {
                opacity: 1;
            }
        `;
    document.head.appendChild(style);
  }

  // Default options
  const config = {
    title: options.title || "Modal",
    fields: options.fields || [],
    onApply: options.onApply || null,
    onCancel: options.onCancel || null,
    applyText: options.applyText || "Apply",
    cancelText: options.cancelText || "Cancel",
    size: options.size || "modal-lg",
    ...options,
  };

  // Generate unique modal ID
  const modalId =
    "modal-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);

  // Create Bootstrap modal elements
  const modalDiv = document.createElement("div");
  modalDiv.className = "modal fade";
  modalDiv.id = modalId;
  modalDiv.setAttribute("tabindex", "-1");
  modalDiv.setAttribute("aria-labelledby", modalId + "Label");
  modalDiv.setAttribute("aria-hidden", "true");

  const modalDialog = document.createElement("div");
  modalDialog.className = `modal-dialog ${config.size}`;

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content bg-dark text-light";

  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header border-secondary";

  const title = document.createElement("h5");
  title.className = "modal-title";
  title.id = modalId + "Label";
  title.textContent = config.title;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn-close";
  closeBtn.setAttribute("data-bs-dismiss", "modal");
  closeBtn.setAttribute("aria-label", "Close");

  const modalBody = document.createElement("div");
  modalBody.className = "modal-body";

  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-footer border-secondary";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-outline-light";
  cancelBtn.setAttribute("data-bs-dismiss", "modal");
  cancelBtn.textContent = config.cancelText;

  const applyBtn = document.createElement("button");
  applyBtn.type = "button";
  applyBtn.className = "btn btn-primary";
  applyBtn.textContent = config.applyText;

  // Build Bootstrap structure
  modalHeader.appendChild(title);
  modalHeader.appendChild(closeBtn);
  modalFooter.appendChild(cancelBtn);
  modalFooter.appendChild(applyBtn);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modalDialog.appendChild(modalContent);
  modalDiv.appendChild(modalDialog);

  // Store field values and references
  const fieldValues = {};
  const fieldElements = {};

  // Helper function to update dependent dropdowns
  function updateDependentDropdowns(sourceFieldName, sourceValue) {
    config.fields.forEach((field) => {
      if (field.dependsOn === sourceFieldName && field.type === "select") {
        const targetSelect = fieldElements[field.name];
        if (targetSelect && field.dynamicOptions) {
          // Clear existing options except default
          targetSelect.innerHTML = "";

          // Add default option if specified
          if (field.defaultOption) {
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.textContent = field.defaultOption;
            defaultOpt.selected = true;
            targetSelect.appendChild(defaultOpt);
          }

          // Get new options based on source value
          const newOptions = field.dynamicOptions[sourceValue] || [];
          newOptions.forEach((option) => {
            const optionEl = document.createElement("option");
            if (typeof option === "string") {
              optionEl.value = option;
              optionEl.textContent = option;
            } else {
              optionEl.value = option.hasOwnProperty("value")
                ? option.value
                : option.label;
              optionEl.textContent = option.label || option.value;
            }
            targetSelect.appendChild(optionEl);
          });

          // Reset the dependent field value
          fieldValues[field.name] = "";
          targetSelect.value = "";

          // Trigger change event for further dependencies
          targetSelect.dispatchEvent(new Event("change"));
        }
      }
    });
  }

  // Helper function to make list sortable with animations
  function makeSortable(listContainer, listData, field, renderList) {
    let draggedElement = null;
    let draggedIndex = null;
    let placeholder = null;

    function createPlaceholder() {
      const placeholder = document.createElement("div");
      placeholder.className = "drag-placeholder";
      return placeholder;
    }

    function showPlaceholder(targetElement, position = "after") {
      if (!placeholder) {
        placeholder = createPlaceholder();
      }

      placeholder.classList.add("show");

      if (position === "before") {
        targetElement.parentNode.insertBefore(placeholder, targetElement);
      } else {
        targetElement.parentNode.insertBefore(
          placeholder,
          targetElement.nextSibling,
        );
      }
    }

    function hidePlaceholder() {
      if (placeholder && placeholder.parentNode) {
        placeholder.classList.remove("show");
        setTimeout(() => {
          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
          }
        }, 200);
      }
    }

    function clearDragStates() {
      const items = listContainer.querySelectorAll(".drag-item");
      items.forEach((item) => {
        item.classList.remove("dragging", "drag-over", "drag-over-top");
      });
    }

    function addDragListeners() {
      const items = listContainer.querySelectorAll(".drag-item");

      items.forEach((item, index) => {
        item.addEventListener("dragstart", (e) => {
          draggedElement = e.target;
          draggedIndex = index;

          // Add dragging class for visual feedback
          e.target.classList.add("dragging");

          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/html", e.target.outerHTML);

          // Create placeholder
          placeholder = createPlaceholder();
        });

        item.addEventListener("dragend", (e) => {
          // Clean up
          clearDragStates();
          hidePlaceholder();

          draggedElement = null;
          draggedIndex = null;
          placeholder = null;
        });

        item.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";

          if (draggedElement && draggedElement !== e.currentTarget) {
            const rect = e.currentTarget.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const isAbove = e.clientY < midY;

            // Clear previous drag states
            clearDragStates();

            // Add appropriate drag state
            if (isAbove) {
              e.currentTarget.classList.add("drag-over-top");
              showPlaceholder(e.currentTarget, "before");
            } else {
              e.currentTarget.classList.add("drag-over");
              showPlaceholder(e.currentTarget, "after");
            }
          }
        });

        item.addEventListener("dragleave", (e) => {
          // Only remove drag state if we're actually leaving the element
          if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove("drag-over", "drag-over-top");
          }
        });

        item.addEventListener("drop", (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (draggedElement && draggedElement !== e.currentTarget) {
            const targetIndex = Array.from(
              listContainer.querySelectorAll(".drag-item"),
            ).indexOf(e.currentTarget);
            const rect = e.currentTarget.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const isAbove = e.clientY < midY;

            let newIndex = targetIndex;
            if (isAbove && draggedIndex > targetIndex) {
              newIndex = targetIndex;
            } else if (!isAbove && draggedIndex < targetIndex) {
              newIndex = targetIndex;
            } else if (isAbove && draggedIndex < targetIndex) {
              newIndex = targetIndex - 1;
            } else if (!isAbove && draggedIndex > targetIndex) {
              newIndex = targetIndex + 1;
            }

            if (
              draggedIndex !== newIndex &&
              draggedIndex !== -1 &&
              newIndex !== -1
            ) {
              // Reorder the data array
              const draggedItem = listData.splice(draggedIndex, 1)[0];
              listData.splice(newIndex, 0, draggedItem);

              // Update field values to trigger save
              fieldValues[field.name] = [...listData];

              // Re-render the list with a slight delay for smooth animation
              setTimeout(() => {
                renderList();
              }, 100);
            }
          }

          // Clean up
          clearDragStates();
          hidePlaceholder();
        });
      });
    }

    return addDragListeners;
  }

  // Create fields using Bootstrap classes
  config.fields.forEach((field) => {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "mb-3";

    let input, label;

    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "date":
        label = document.createElement("label");
        label.className = "form-label";
        label.textContent = field.label || field.name;
        label.setAttribute("for", field.name);

        input = document.createElement("input");
        input.className = "form-control bg-dark text-light border-secondary";
        input.type = field.type;
        input.name = field.name;
        input.id = field.name;
        input.value = field.value || "";
        input.placeholder = field.placeholder || "";
        if (field.required) input.required = true;

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        break;

      case "textarea":
        label = document.createElement("label");
        label.className = "form-label";
        label.textContent = field.label || field.name;
        label.setAttribute("for", field.name);

        input = document.createElement("textarea");
        input.className = "form-control bg-dark text-light border-secondary";
        input.name = field.name;
        input.id = field.name;
        input.value = field.value || "";
        input.placeholder = field.placeholder || "";
        input.rows = field.rows || 3;
        if (field.required) input.required = true;

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        break;

      case "select":
      case "dropdown":
        label = document.createElement("label");
        label.className = "form-label";
        label.textContent = field.label || field.name;
        label.setAttribute("for", field.name);

        input = document.createElement("select");
        input.className = "form-select bg-dark text-light border-secondary";
        input.name = field.name;
        input.id = field.name;
        if (field.required) input.required = true;

        // Add default option if specified
        if (field.defaultOption) {
          const defaultOpt = document.createElement("option");
          defaultOpt.value = "";
          defaultOpt.textContent = field.defaultOption;
          defaultOpt.selected = true;
          input.appendChild(defaultOpt);
        }

        // Add options (static or initial dynamic options)
        const initialOptions = field.options || [];
        initialOptions.forEach((option) => {
          const optionEl = document.createElement("option");
          if (typeof option === "string") {
            optionEl.value = option;
            optionEl.textContent = option;
          } else {
            optionEl.value = option.hasOwnProperty("value")
              ? option.value
              : option.label;
            optionEl.textContent = option.label || option.value;
          }
          if (optionEl.value === field.value) optionEl.selected = true;
          input.appendChild(optionEl);
        });

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        break;

      case "checkbox":
        const checkDiv = document.createElement("div");
        checkDiv.className = "form-check";

        input = document.createElement("input");
        input.className = "form-check-input";
        input.type = "checkbox";
        input.name = field.name;
        input.id = field.name;
        input.checked = field.value || false;

        label = document.createElement("label");
        label.className = "form-check-label";
        label.textContent = field.label || field.name;
        label.setAttribute("for", field.name);

        checkDiv.appendChild(input);
        checkDiv.appendChild(label);
        fieldDiv.appendChild(checkDiv);
        break;

      case "toggle":
        const toggleDiv = document.createElement("div");
        toggleDiv.className = "form-check form-switch";

        input = document.createElement("input");
        input.className = "form-check-input";
        input.type = "checkbox";
        input.role = "switch";
        input.name = field.name;
        input.id = field.name;
        input.checked = field.value || false;

        label = document.createElement("label");
        label.className = "form-check-label";
        label.textContent = field.label || field.name;
        label.setAttribute("for", field.name);

        toggleDiv.appendChild(input);
        toggleDiv.appendChild(label);
        fieldDiv.appendChild(toggleDiv);
        break;

      case "radio":
        label = document.createElement("label");
        label.className = "form-label";
        label.textContent = field.label || field.name;
        fieldDiv.appendChild(label);

        (field.options || []).forEach((option, index) => {
          const radioDiv = document.createElement("div");
          radioDiv.className = "form-check";

          const radioInput = document.createElement("input");
          radioInput.className = "form-check-input";
          radioInput.type = "radio";
          radioInput.name = field.name;
          radioInput.id = `${field.name}_${index}`;
          radioInput.value = typeof option === "string" ? option : option.value;
          if (radioInput.value === field.value) radioInput.checked = true;

          const radioLabel = document.createElement("label");
          radioLabel.className = "form-check-label";
          radioLabel.textContent =
            typeof option === "string" ? option : option.label;
          radioLabel.setAttribute("for", `${field.name}_${index}`);

          radioDiv.appendChild(radioInput);
          radioDiv.appendChild(radioLabel);
          fieldDiv.appendChild(radioDiv);
        });
        break;

      case "list":
        label = document.createElement("label");
        label.className =
          "form-label d-flex justify-content-between align-items-center";

        const labelText = document.createElement("span");
        labelText.textContent = field.label || field.name;

        const dragHint = document.createElement("small");
        dragHint.className = "text-white-50";
        dragHint.textContent = "Drag to reorder";

        label.appendChild(labelText);
        label.appendChild(dragHint);
        fieldDiv.appendChild(label);

        // Create list container
        const listContainer = document.createElement("div");
        listContainer.className = "list-group bg-dark";
        listContainer.style.maxHeight = "200px";
        listContainer.style.overflowY = "auto";

        // Initialize list data
        const listData = field.value || [];

        function renderList() {
          listContainer.innerHTML = "";

          if (listData.length === 0) {
            const emptyItem = document.createElement("div");
            emptyItem.className =
              "list-group-item bg-dark text-light border-secondary text-center";
            emptyItem.textContent = "No items added yet";
            listContainer.appendChild(emptyItem);
          } else {
            listData.forEach((item, index) => {
              const listItem = document.createElement("div");
              listItem.className =
                "list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center drag-item";
              listItem.draggable = true;
              listItem.style.cursor = "move";

              // Add drag handle visual indicator
              const dragHandle = document.createElement("span");
              dragHandle.className = "text-muted me-2 drag-handle";
              dragHandle.innerHTML =
                '<i class="fas fa-grip-vertical text-white"></i>';
              dragHandle.style.cursor = "grab";
              dragHandle.style.userSelect = "none";

              const contentDiv = document.createElement("div");
              contentDiv.className = "d-flex align-items-center flex-grow-1";
              contentDiv.appendChild(dragHandle);

              const itemText = document.createElement("span");
              const value =
                field.editFields.find((s) => s.name === field.displayField) ||
                item[field.displayField];
              itemText.textContent = field.displayField
                ? value.type === "select"
                  ? value.options.find(
                      (t) =>
                        t.value.toString() ===
                        item[field.displayField].toString(),
                    ).label
                  : item[field.displayField]
                : typeof item === "string"
                  ? item
                  : JSON.stringify(item);
              contentDiv.appendChild(itemText);

              const buttonGroup = document.createElement("div");
              buttonGroup.className = "btn-group btn-group-sm";

              const editBtn = document.createElement("button");
              editBtn.className = "btn btn-outline-primary btn-sm";
              editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
              editBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                editListItem(index);
              });

              const deleteBtn = document.createElement("button");
              deleteBtn.className = "btn btn-outline-danger btn-sm";
              deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
              deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteListItem(index);
              });

              buttonGroup.appendChild(editBtn);
              buttonGroup.appendChild(deleteBtn);

              listItem.appendChild(contentDiv);
              listItem.appendChild(buttonGroup);
              listContainer.appendChild(listItem);
            });

            // Re-add drag listeners after rendering
            addDragListeners();
          }
        }

        function editListItem(index = -1) {
          const isNew = index === -1;
          const itemData = isNew ? {} : { ...listData[index] };

          // build a fresh copy of editFields, injecting the current value for each
          const initialFields = field.editFields.map((f) => ({
            ...f,
            // if it's a list, give it the existing array; for everything else, give it the current scalar
            value: itemData[f.name] !== undefined ? itemData[f.name] : f.value,
          }));

          // Create nested modal for editing
          const nestedModal = createModal({
            title: isNew
              ? `Add ${field.label || field.name}`
              : `Edit ${field.label || field.name}`,
            size: field.editModalSize || "modal-lg",
            fields: initialFields,
            onApply: (formData, jsonData) => {
              delete formData.title; // Remove title from the data

              if (isNew) {
                listData.push(formData);
              } else {
                listData[index] = formData;
              }

              renderList();
              fieldValues[field.name] = [...listData];
            },
            onCancel: () => {
              console.log("Edit cancelled");
            },
          });

          // Pre-populate form with existing data
          if (!isNew) {
            setTimeout(() => {
              // First pass: Set independent fields (fields that don't depend on others)
              field.editFields.forEach((editField) => {
                if (!editField.dependsOn) {
                  const input = nestedModal.element.querySelector(
                    `[name="${editField.name}"]`,
                  );
                  if (input && itemData[editField.name] !== undefined) {
                    if (
                      editField.type === "checkbox" ||
                      editField.type === "toggle"
                    ) {
                      input.checked = itemData[editField.name];
                    } else if (editField.type === "radio") {
                      const radioInput = nestedModal.element.querySelector(
                        `input[name="${editField.name}"][value="${itemData[editField.name]}"]`,
                      );
                      if (radioInput) radioInput.checked = true;
                    } else {
                      input.value = itemData[editField.name] || "";
                      // Trigger change event to update dependent fields
                      input.dispatchEvent(new Event("change"));
                    }
                  }
                }
              });

              // Second pass: Set dependent fields after their parent fields have been set
              setTimeout(() => {
                field.editFields.forEach((editField) => {
                  if (editField.dependsOn) {
                    const input = nestedModal.element.querySelector(
                      `[name="${editField.name}"]`,
                    );
                    if (input && itemData[editField.name] !== undefined) {
                      if (
                        editField.type === "checkbox" ||
                        editField.type === "toggle"
                      ) {
                        input.checked = itemData[editField.name];
                      } else if (editField.type === "radio") {
                        const radioInput = nestedModal.element.querySelector(
                          `input[name="${editField.name}"][value="${itemData[editField.name]}"]`,
                        );
                        if (radioInput) radioInput.checked = true;
                      } else {
                        input.value = itemData[editField.name] || "";
                      }
                    }
                  }
                });
              }, 50); // Short delay to allow dependent dropdowns to populate
            }, 100);
          }
        }

        function deleteListItem(index) {
          if (confirm("Are you sure you want to delete this item?")) {
            listData.splice(index, 1);
            renderList();
            fieldValues[field.name] = [...listData];
          }
        }

        // Add button
        const addBtn = document.createElement("button");
        addBtn.type = "button";
        addBtn.className = "btn btn-outline-success btn-sm mt-2";
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
        addBtn.addEventListener("click", () => editListItem());

        fieldDiv.appendChild(listContainer);
        fieldDiv.appendChild(addBtn);

        // Make the list sortable
        const addDragListeners = makeSortable(
          listContainer,
          listData,
          field,
          renderList,
        );

        renderList();
        break;
    }

    // Store element reference
    if (input) {
      fieldElements[field.name] = input;
    }

    // Store initial value
    if (field.type === "list") {
      fieldValues[field.name] = field.value || [];
    } else {
      fieldValues[field.name] =
        field.value ||
        (field.type === "checkbox" || field.type === "toggle" ? false : "");
    }

    // Add change event listeners
    if (input && field.type !== "list") {
      input.addEventListener("change", () => {
        let newValue;
        if (field.type === "checkbox" || field.type === "toggle") {
          newValue = input.checked;
        } else {
          newValue = input.value;
        }

        fieldValues[field.name] = newValue;

        // Handle dependent dropdowns
        if (field.type === "select" || field.type === "dropdown") {
          updateDependentDropdowns(field.name, newValue);
        }

        // Call custom onChange if provided
        if (field.onChange) {
          field.onChange(newValue, fieldValues, fieldElements);
        }
      });
    }

    // Handle radio buttons separately
    if (field.type === "radio") {
      const radioInputs = fieldDiv.querySelectorAll('input[type="radio"]');
      radioInputs.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.checked) {
            fieldValues[field.name] = radio.value;

            // Handle dependent dropdowns for radio buttons
            updateDependentDropdowns(field.name, radio.value);

            // Call custom onChange if provided
            if (field.onChange) {
              field.onChange(radio.value, fieldValues, fieldElements);
            }
          }
        });
      });
    }

    modalBody.appendChild(fieldDiv);
  });

  // Initialize dependent dropdowns after all fields are created
  config.fields.forEach((field) => {
    if (field.dependsOn && fieldValues[field.dependsOn]) {
      updateDependentDropdowns(field.dependsOn, fieldValues[field.dependsOn]);
    }
  });

  // Modal functions
  function closeModal() {
    const modalInstance = bootstrap.Modal.getInstance(modalDiv);
    if (modalInstance) {
      modalInstance.hide();
    }
  }

  function getFormData() {
    const formData = { title: config.title };
    config.fields.forEach((field) => {
      if (field.type === "radio") {
        const checkedRadio = modalDiv.querySelector(
          `input[name="${field.name}"]:checked`,
        );
        formData[field.name] = checkedRadio ? checkedRadio.value : "";
      } else if (field.type === "list") {
        formData[field.name] = fieldValues[field.name] || [];
      } else {
        const input = modalDiv.querySelector(`[name="${field.name}"]`);
        if (input) {
          if (field.type === "checkbox" || field.type === "toggle") {
            formData[field.name] = input.checked;
          } else {
            formData[field.name] = input.value;
          }
        }
      }
    });
    return formData;
  }

  // Event listeners
  cancelBtn.addEventListener("click", () => {
    if (config.onCancel) {
      config.onCancel();
    }
  });

  applyBtn.addEventListener("click", () => {
    const formData = getFormData();
    const jsonData = JSON.stringify(formData, null, 2);

    if (config.onApply) {
      config.onApply(formData);
    } else {
      console.log("Modal Data:", jsonData);
    }

    closeModal();
  });

  // Clean up when modal is hidden
  modalDiv.addEventListener("hidden.bs.modal", () => {
    modalDiv.remove();
  });

  // Show modal
  document.body.appendChild(modalDiv);
  const modalInstance = new bootstrap.Modal(modalDiv);
  modalInstance.show();

  // Return modal instance for advanced control
  return {
    close: closeModal,
    getFormData: getFormData,
    element: modalDiv,
    instance: modalInstance,
    fieldElements: fieldElements,
    fieldValues: fieldValues,
  };
}

function notificationComplete(name, success, reason) {
  const alert = document.createElement("div");
  alert.className = "alert alert-success alert-dismissible fade show";
  alert.innerHTML = `
                <strong>${success ? "Success" : "Failed"}!</strong> ${name} ${success ? "saved successfully!" : reason}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
  document.body.insertBefore(alert, document.body.firstChild);

  if (success) {
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 3000);
  }
}
