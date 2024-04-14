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
        handleEdit(uuid);
      } else if (target.classList.contains("removebtn")) {
        handleRemove(uuid);
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

});
