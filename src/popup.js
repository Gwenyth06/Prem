document.addEventListener("DOMContentLoaded", function () {
  const medicineList = document.getElementById("medicine-list");

  document.getElementById("btn2").onclick = function () {
    var medicineName = document.getElementById("medName").value;
    var medicineDose = document.getElementById("medDose").value;

    if (medicineName && medicineDose) {
      chrome.runtime.sendMessage({ action: "addMedicine", medicineName, medicineDose }, function (response) {
        if (response.success) {
          chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
            displayMedicines(response);
          });
          console.log("Medicine added successfully.");
        } else {
          console.error("Failed to add medicine.");
        }
      });
    }
  };

  chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
    displayMedicines(response);
  });

  function displayMedicines(medicines) {
    medicineList.innerHTML = "";
    medicines.forEach(function (medicine) {
      const medicineItem = document.createElement("div");
      medicineItem.textContent = `${medicine.name}: ${medicine.dose}`;
      medicineItem.className = "medicineItem";

      const editButton = document.createElement("button");
      editButton.className = "editButton";
      editButton.addEventListener("click", function () {
        editMedicine(medicine.uuid);
      });
      medicineItem.appendChild(editButton);

      const addReminderButton = document.createElement("button");
      addReminderButton.className = "addReminderButton";
      addReminderButton.addEventListener("click", function () {
        addReminder(medicine.uuid);
      });
      medicineItem.appendChild(addReminderButton);

      const removeButton = document.createElement("button");
      removeButton.className = "removeButton";
      removeButton.addEventListener("click", function () {
        removeMedicine(medicine.uuid);
      });
      medicineItem.appendChild(removeButton);
      
      if (medicine.reminders && medicine.reminders.length > 0) {
        const reminderList = document.createElement("ul");
        medicine.reminders.forEach(function (reminder) {
          const reminderItem = document.createElement("li");
          reminderItem.textContent = reminder.hour + ":" + reminder.min;

          const editReminderButton = document.createElement("button");
          editReminderButton.textContent = "Edit";
          editReminderButton.addEventListener("click", function () {
            editReminder(medicine.uuid, reminder.uuid);
          });
          reminderItem.appendChild(editReminderButton);

          const removeReminderButton = document.createElement("button");
          removeReminderButton.textContent = "Remove";
          removeReminderButton.addEventListener("click", function () {
            removeReminder(medicine.uuid, reminder.uuid);
          });
          reminderItem.appendChild(removeReminderButton);

          reminderList.appendChild(reminderItem);
        });
        medicineItem.appendChild(reminderList);
      }

      medicineList.appendChild(medicineItem);
    });
  }

  function editMedicine(medicineUuid) {
    const newName = prompt("Enter new medicine name:");
    const newDose = prompt("Enter new medicine dose:");
    if (newName && newDose) {
      chrome.runtime.sendMessage({ action: "editMedicine", medicineUuid, newName, newDose }, function (response) {
        if (response.success) {
          chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
            displayMedicines(response);
          });
        } else {
          console.error("Failed to edit medicine.");
        }
      });
    }
  }

  function removeMedicine(medicineUuid) {
    const confirmation = confirm("Are you sure you want to remove this medicine?");
    if (confirmation) {
      chrome.runtime.sendMessage({ action: "removeMedicine", medicineUuid }, function (response) {
        if (response.success) {
          chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
            displayMedicines(response);
          });
        } else {
          console.error("Failed to remove medicine.");
        }
      });
    }
  }

  function addReminder(medicineUuid) {
    const reminderHour = prompt("Enter reminder Hour:");
    const reminderMin = prompt("Enter reminder Minute:");
    if (reminderHour && reminderMin) {
      chrome.runtime.sendMessage({ action: "addReminder", medicineUuid, reminderHour, reminderMin }, function (response) {
        if (response.success) {
          chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
            displayMedicines(response);
          });
        } else {
          console.error("Failed to add reminder.");
        }
      });
    }
  }

  function editReminder(medicineUuid, reminderUuid) {
    const newHour = prompt("Enter new reminder hour:");
    const newMin = prompt("Enter new reminder minute:");
    if (newHour && newMin) {
      chrome.runtime.sendMessage({ action: "editReminder", reminderUuid, medicineUuid, newHour, newMin }, function (response) {
        if (response.success) {
          chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
            displayMedicines(response);
          });
        } else {
          console.error("Failed to edit reminder.");
        }
      });
    }
  }

  function removeReminder(medicineUuid, reminderUuid) {
    const confirmation = confirm("Are you sure you want to remove this reminder?");
    if (confirmation) {
      chrome.runtime.sendMessage({ action: "removeReminder", medicineUuid, reminderUuid }, function (response) {
        if (response.success) {
          chrome.runtime.sendMessage({ action: "getMedicines" }, function (response) {
            displayMedicines(response);
          });
        } else {
          console.error("Failed to remove reminder.");
        }
      });
    }
  }
});
