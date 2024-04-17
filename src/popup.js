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
      }
    }
  });

  function displayMedicines(medicines) {
    const listContainer = document.getElementById("medicine-list");
    const html = medicines.map((medicine) => {
      return `
        <li data-uuid="${medicine.id}">
          ${medicine.name}: ${medicine.dose}
          <button class="editbtn">Edit</button>
          <button class="removebtn">Remove</button>
          <button class="addReminderBtn" id="addReminderBtn">Add Reminder</button>
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

  //uuid keeps changing because of eventlistener.
  //   document.getElementById("medicine-list").addEventListener("click", function(event) {
  //       var hiddenReminder = document.getElementById("hiddenReminder");
  //       hiddenReminder.style.display = "block";
  // console.log(event.target);
  //         console.log(event.target.parentNode);
  //         const uuid = event.target.parentNode.dataset.uuid;

  //       document.getElementById("rbtn").onclick = function() {
  //         var reminderTime = document.getElementById("reminderTime").value;

  //         console.log(uuid);
  //           chrome.runtime.sendMessage({ action: "editReminderOfMedicine", uuid, reminderTime }, function (response) {
  //             if (response.success) {
  //               console.log("Remminder added successfully.");
  //               document.dispatchEvent(new Event("medListUpdated"));
  //               hiddenReminder.style.display = "none";
  //             } else {
  //               console.error("Failed to add reminder.");
  //             }
  //           });

  //       }


  //   })

  // <div id="hiddenReminder" style="display: none;">
  //             <input type="time" id="reminderTime">
  //             <button id="rbtn">Add Reminder</button>
  //           </div>

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
});
