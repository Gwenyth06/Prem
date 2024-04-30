import Medicine from './medicine.js';
import Reminder from './reminder.js'
import { v4 as uuidv4 } from 'uuid';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getMedicines") {
    chrome.storage.sync.get("medicines", function (data) {
      sendResponse(data.medicines || []);
    });
    return true;
  } else if (request.action === "getMedicine") {
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.uuid === request.medicineUuid);
      sendResponse(medicine);
    });
    return true;
  } else if (request.action === "addMedicine") {
    const medicineId = uuidv4();
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      medicines.push(new Medicine(medicineId, request.medicineName, request.medicineDose));
      chrome.storage.sync.set({ "medicines": medicines }, function () {
        sendResponse({ success: true });
      });
    });
    return true;
  } else if (request.action === "editMedicine") {
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.uuid === request.medicineUuid);
      if (medicine) {
        medicine.name = request.newName;
        medicine.dose = request.newDose;
        chrome.storage.sync.set({ "medicines": medicines }, function () {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Medicine not found" });
      }
    });
    return true;
  } else if (request.action === "removeMedicine") {
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      const index = medicines.findIndex(med => med.uuid === request.medicineUuid);
      if (index !== -1) {
        medicines.splice(index, 1);
        chrome.storage.sync.set({ "medicines": medicines }, function () {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Medicine not found" });
      }
    });
    return true;
  } else if (request.action === "addReminder") {
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.uuid === request.medicineUuid);
      console.log("1");
      const reminderUUID = uuidv4();
      if (medicine) {
        console.log("2");
        const notificationOpts = {
          type: "basic",
          title: "Time for your " + medicine.name,
          message: "Name: " + medicine.name + " Dose: " + medicine.dose,
        }
        medicine.reminders.push(new Reminder(reminderUUID, request.reminderTime, notificationOpts));

        chrome.storage.sync.get("reminders", function (data) {
          const allreminders = data.allreminders || [];
          var r = new Reminder(reminderUUID, request.reminderTime, notificationOpts);
          allreminders.push(r);
          console.log("3");
          chrome.alarms.create(reminderUUID,{
            delayInMinutes: 0.1,
            periodInMinutes: 1
          });
          console.log(allreminders);
          chrome.storage.sync.set({ "reminders" : allreminders});
        })
        
        chrome.storage.sync.set({ "medicines": medicines }, function () {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Medicine not found" });
      }
    });
    return true;
  } else if (request.action === "editReminder") {
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.uuid === request.medicineUuid);
      const reminder = medicine.reminders.find(rem => rem.uuid === request.reminderUuid);
      chrome.storage.sync.get("reminders", function(data) {
        const r = data.find(r => r.uuid === request.reminderUuid)
        r.time = request.newTime;
        chrome.storage.sync.set({ "reminders" : allreminders});
      })
      if (reminder) {
        reminder.time = request.newTime;
        chrome.storage.sync.set({ "medicines": medicines }, function () {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Reminder not found" });
      }
    });
    return true;
  } else if (request.action === "removeReminder") {
    chrome.storage.sync.get("medicines", function (data) {
      const medicines = data.medicines || [];
      const medicine = medicines.find(med => med.uuid === request.medicineUuid);
      const reminderIndex = medicine.reminders.findIndex(rem => rem.uuid === request.reminderUuid);
      if (reminderIndex !== -1) {
        medicine.reminders.splice(reminderIndex, 1);
        //chrome.alarms.clear(reminderUuid);
        chrome.storage.sync.set({ "medicines": medicines }, function () {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: "Reminder not found" });
      }
    });
    return true;
  }
  

});

chrome.alarms.onAlarm.addListener(function(reminder) {
  chrome.storage.sync.get("reminders", function(reminders) {
    for(var r in reminders) {
      console.log(reminder.name);
      console.log(r.uuid);
      if( reminder.name === r.uuid) {
        console.log(r.uuid);
        console.log(r.notificationOpts);
        chrome.notifications.create(r.notificationOpts);

      }
    }
  })
  
});