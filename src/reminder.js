class Reminder {
    constructor(uuid,parentUuid,hour,min, notificationOpts) {
        this.uuid = uuid;
        this.parentUuid = parentUuid;
        this.hour = hour;
        this.min = min;
        this.notificationOpts = notificationOpts;
    }
}

export default Reminder;