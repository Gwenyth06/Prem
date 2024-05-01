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
      const reminderUUID = uuidv4();
      if (medicine) {
        const notificationOpts = {
          type: "basic",
          iconUrl : "icons/bell.png",
          title: "Time for your " + medicine.name,
          message: "Name: " + medicine.name + " Dose: " + medicine.dose,
        }
        const newReminder = new Reminder(reminderUUID,medicine.uuid, request.reminderHour,request.reminderMin, notificationOpts);
        medicine.reminders.push(newReminder);
        chrome.storage.sync.get("remindersStorage", function(data2) {
          const remindersStorage = data2.remindersStorage || [];
          remindersStorage.push(newReminder);
          chrome.storage.sync.set({"remindersStorage" : remindersStorage});
        })

        chrome.alarms.create(reminderUUID, {
          when: getAlarmTime(request.reminderHour, request.reminderMin)
        });
        
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
      if (reminder) {
        reminder.hour = request.newHour;
        reminder.min = request.newMin;
        chrome.alarms.clear(request.reminderUuid);

        chrome.storage.sync.get("remindersStorage", function(data2) {
          const remindersStorage = data2.remindersStorage || [];
          const reminderEdited = remindersStorage.find( rem => rem.uuid === request.reminderUuid);
          reminderEdited.hour = request.newHour;
          reminderEdited.min = request.newMin;

          chrome.alarms.create(request.reminderUuid, {
            when: getAlarmTime(request.newHour, request.newMin)
          });

          chrome.storage.sync.set({"remindersStorage" : remindersStorage});
        })

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

        chrome.storage.sync.get("remindersStorage", function(data2) {
          const remindersStorage = data2.remindersStorage || [];
          const remindersStorageIndex = remindersStorage.findIndex( rem => rem.uuid === request.reminderUuid);
          if(remindersStorageIndex !== -1) {
            remindersStorage.splice(remindersStorageIndex, 1);
            chrome.alarms.clear(request.reminderUuid);
            chrome.storage.sync.set({"remindersStorage" : remindersStorage});
          }

        });

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
  chrome.storage.sync.get("remindersStorage", function(data) {
    const reminders = data.remindersStorage || [];
    const reminderFromStorage = reminders.find(rem => rem.uuid === reminder.name);
    if(reminderFromStorage) {
      chrome.notifications.create(reminderFromStorage.notificationOpts);
      console.log(reminderFromStorage.notificationOpts);
    }
  });
});

function getAlarmTime(hour, minute) {
  var now = new Date();
  var alarmTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0, // Saniye
      0 // Milisaniye
  );

  // Eğer alarm zamanı geçtiyse bir sonraki gün için ayarla
  if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
  }

  return alarmTime.getTime();
}