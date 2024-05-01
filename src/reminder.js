class Reminder {
    constructor(uuid,parentUuid,time, notificationOpts) {
        this.uuid = uuid;
        this.parentUuid = parentUuid;
        this.time = time;
        this.notificationOpts = notificationOpts;
    }
}

export default Reminder;