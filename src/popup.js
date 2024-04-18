document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btn2").onclick = function () {
    var medicineName = document.getElementById("medName").value;
    var medicineDose = document.getElementById("medDose").value;

    if (medicineName && medicineDose) {
      chrome.runtime.sendMessage({ action: "addMedicine", medicineName, medicineDose }, function (response) {
        if (response.success) {
          console.log("Medicine added successfully.");
          document.dispatchEvent(new Event("medListUpdated"));
        } else {
          console.error("Failed to add medicine.");
        }
      });
    }
  };

  chrome.runtime.sendMessage({ action: "getMedicines" }, function (medicines) {
    displayMedicines(medicines);
  });


  document.getElementById("medicine-list").addEventListener("click", function (event) {
    const target = event.target;
    const listItem = target.closest("li");

    if (listItem) {
      const uuid = listItem.dataset.uuid;

      if (target.classList.contains("editbtn")) {
        console.log("edit");
        handleEdit(uuid);
      } else if (target.classList.contains("removebtn")) {
        handleRemove(uuid);
      } else if (target.classList.contains("addReminderBtn")) {
        console.log(uuid + " / " + listItem);
        handleAddReminder(uuid, listItem);
      } else if (target.classList.contains("editRemindersBtn")) {
        handleEditReminders(uuid);
      }
    }
  });

  function displayMedicines(medicines) {
    const listContainer = document.getElementById("medicine-list");
    const html = medicines.map((medicine) => {
      return `
        <li id="${medicine.id}" data-uuid="${medicine.id}">
          ${medicine.name}: ${medicine.dose}
          <button class="editbtn">Edit</button>
          <button class="removebtn">Remove</button>
          <button class="addReminderBtn" id="addReminderBtn">Add Reminder</button>
          <button class="editRemindersBtn" id="editRemindersBtn">Edit Reminders</button>
        </li>
      `;
    }).join("");

    listContainer.innerHTML = `<ul>${html}</ul>`;
  }

  function handleEdit(uuid) {
    var medicineName = prompt("Enter new medicine name:");
    var medicineDose = prompt("Enter new medicine dose:");

    if (medicineName && medicineDose) {
      chrome.runtime.sendMessage({ action: "editMedicine", uuid, medicineName, medicineDose }, function (response) {
        if (response.success) {
          console.log("Medicine edited successfully.");
          document.dispatchEvent(new Event("medListUpdated"));
        } else {
          console.error("Failed to edit medicine.");
        }
      });
    }
  }

  function handleRemove(uuid) {
    chrome.runtime.sendMessage({ action: "removeMedicine", uuid }, function (response) {
      if (response.success) {
        console.log("Medicine removed successfully.");
        document.dispatchEvent(new Event("medListUpdated"));
      } else {
        console.error("Failed to remove medicine.");
      }
    });
  }

  document.addEventListener("medListUpdated", function () {
    chrome.runtime.sendMessage({ action: "getMedicines" }, function (medicines) {
      displayMedicines(medicines);
    });
  });


  function handleAddReminder(uuid, listItem) {

    console.log("2/" + uuid + " / " + listItem);

    var reminderInput = document.createElement("input");
    reminderInput.type = "time";
    reminderInput.placeholder = "Enter your reminder";
    reminderInput.id = "reminderInput";

    var saveReminderBtn = document.createElement("button");
    saveReminderBtn.textContent = "Save Reminder";
    saveReminderBtn.id = "saveReminderBtn";

    var reminderDiv = document.getElementById("reminderDiv");
    reminderDiv.innerHTML = ""; 
    reminderDiv.appendChild(reminderInput);
    reminderDiv.appendChild(saveReminderBtn);

    listItem.appendChild(reminderDiv);

    document.getElementById("saveReminderBtn").addEventListener("click", function () {
      var reminderTime = reminderInput.value;
      console.log("Reminder:", reminderTime);

      chrome.runtime.sendMessage({ action: "editReminderOfMedicine", uuid, reminderTime }, function (response) {
                    if (response.success) {
                      console.log("Remminder added successfully.");
                      document.dispatchEvent(new Event("medListUpdated"));
                    } else {
                      console.error("Failed to add reminder.");
                    }
                  });
      reminderDiv.innerHTML = "";
      document.body.appendChild(reminderDiv);  //listedeki ilaçlar silinince reminderDiv in parenti da silinmiş olduğundan boşa düşüyordu. Her ihtimale karşı her add reminder butonuna         
    });                                        //basıldığında div body'e sabit olacak şekilde fonksiyondan çıkıyor.
  }

  function handleEditReminders(uuid) {
    chrome.runtime.sendMessage({action: "getMedicine", uuid}, function (medicine) {
      console.log(medicine.reminders);
      displayReminders(medicine);
    })
  }

  function displayReminders(medicine) {
    const reminders = medicine.reminders;
    const listContainer = document.getElementById("reminder-list");
    const medlistli = document.getElementById(medicine.id);
    medlistli.appendChild(listContainer);
    const html = reminders.map((reminder) => {
      return `
        <li data-muuid="${medicine.id}" data-uuid="${reminder.id}">
          ${reminder.date}
          <button class="editReminderBtn" id="editReminderBtn">Edit</button>
          <button class="removeReminderBtn" id="removeReminderBtn">Remove</button>
        </li>
      `;
    }).join("");

    listContainer.innerHTML = `<ul>${html}</ul>`;
  }

  document.getElementById("reminder-list").addEventListener("click", function (event) {
    const target = event.target;
    const listItem = target.closest("li");

    if (listItem) {
      const uuid = listItem.dataset.uuid;
      const muuid = listItem.dataset.muuid;

      if (target.classList.contains("editReminderBtn")) {
        console.log("edit");
        handleEditReminder(uuid,muuid);
      } else if (target.classList.contains("removeReminderBtn")) {
        handleRemoveReminder(uuid);
      }
    }
  });

  function handleEditReminder(uuid, muuid) {
    var time = prompt("Enter time:");

    if (time) {
      chrome.runtime.sendMessage({ action: "editReminder", uuid, muuid, time }, function (response) {
        if (response.success) {
          console.log("Reminder edited successfully.");
        } else {
          console.error("Failed to edit reminder.");
        }
      });
    }
  }
});
