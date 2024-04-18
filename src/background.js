import Medicine from './medicine.js';
import Reminder from './reminder.js'
import { v4 as uuidv4 } from 'uuid';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getMedicines") {
    chrome.storage.sync.get("medicines", function(data) {
      sendResponse(data.medicines || []);
    });
    return true;
  } else if (request.action === "getMedicine") {
    chrome.storage.sync.get("medicines", function(data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.id === request.uuid);
      sendResponse(medicine);
    });
    return true;
  } 
   else if (request.action === "addMedicine") {
    const medicineId = uuidv4();
    chrome.storage.sync.get("medicines", function(data) {
      const medicines = data.medicines || [];
      medicines.push(new Medicine(medicineId, request.medicineName, request.medicineDose));
      chrome.storage.sync.set({ "medicines": medicines }, function() {
        sendResponse({ success: true });
      });
    });
    return true;
  } else if (request.action === "editMedicine") {
    chrome.storage.sync.get("medicines", function(data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.id === request.uuid);
      if (medicine) {
        medicine.name = request.medicineName;
        medicine.dose = request.medicineDose;
        chrome.storage.sync.set({ "medicines": medicines }, function() {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Medicine not found" });
      }
    });
    return true;
  } else if (request.action === "editReminderOfMedicine") {
    chrome.storage.sync.get("medicines", function(data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.id === request.uuid);
      console.log("1");
      const reminderUUID = uuidv4();
      if (medicine) {
        console.log("2");
        medicine.reminders.push(new Reminder(reminderUUID, request.reminderTime));
        console.log("3");
        chrome.storage.sync.set({ "medicines": medicines }, function() {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Medicine not found" });
      }
    });
    return true;
   } else if (request.action === "editReminder") {
    chrome.storage.sync.get("medicines", function(data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.id === request.muuid);
      const reminder = medicine.reminders.find(rem => rem.id === request.uuid);
      if(reminder) {
        reminder.date = request.time;
        chrome.storage.sync.set({ "medicines": medicines }, function() {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Reminder not found" });
      }
    });
    return true;
  } else if (request.action === "removeMedicine") {
    chrome.storage.sync.get("medicines", function(data) {
      const medicines = data.medicines || [];
      const index = medicines.findIndex(med => med.id === request.uuid);
      if (index !== -1) {
        medicines.splice(index, 1);
        chrome.storage.sync.set({ "medicines": medicines }, function() {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Medicine not found" });
      }
    });
    return true;
  }
});
