import admin from './firebase-service';

export const default_password = 'P@ssw0rd1!';

export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r: number = Math.random() * 16 | 0, v: number = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
});

export const firestore_timestamp = (date: Date) => admin.firestore.Timestamp.fromDate(date);
export const passCode = () => window.crypto.getRandomValues(new Uint32Array(1)).toString();

const date_columns_look_up = ['joinedon', 'createdon', 'updatedon', 'dateofbirth', 'scheduledon', 'startedon', 'cancelledon', 'completedon'];
export const session_columns = ['id', 'title', 'description', 'duration', 'presenter', 'theme', 'scheduledon', 'status', 'category', 'displayName', 'presenterid', 'photoURL', 'meetingid', 'date', 'meetingID'];
export const session_columns_with_enrollments = ['id', 'title', 'description', 'duration', 'presenter', 'theme', 'scheduledon', 'status', 'category', 'displayName', 'presenterid', 'photoURL', 'meetingid', 'enrollments', 'youtube', 'date', 'meetingID'];

export const presenter_columns = ['id', 'displayName', 'skills', 'email', 'photoURL', 'joinedon', 'college', 'education', 'phone', 'address', 'city', 'country', 'dateofbirth', 'status', 'description', 'joinedon', 'qualification', 'state', 'zip'];
export const sessionStatus = {
    created: 1,
    enrolled: 2,
    started: 3,
    completed: 4,
    cancelled: 5,
    inprogress: 6
};

export const claims = { presenter: { claim: "presenter" }, admin: { claim: "admin" }, user: { claim: "user" } };

export const sessionRequest = {
    requested: 100,
    approved: 200,
    rejected: 300
};

export const jaas_columns = ['appid', 'kid', 'privatekey', 'server'];

function hasOwnProperty<X extends {}, Y extends PropertyKey>
    (obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj.hasOwnProperty('_' + prop); // firebase time has _seconds property
}
export const convertDate = (firebaseObject: any) => {
    if (!firebaseObject) return null;
    for (const [key, value] of Object.entries(firebaseObject)) {
        // covert items inside array
        if (value && Array.isArray(value)) {
            firebaseObject[key] = value.map(item => convertDate(item));
        }
        // convert inner objects
        if (value && typeof value === 'object') {
            firebaseObject[key] = convertDate(value);
        }
        // convert simple properties
        if (value && typeof value === 'object' && hasOwnProperty(value, 'seconds')) {
            // pass UTC
            firebaseObject[key] = (value as admin.firestore.Timestamp).toDate();
        }
    }
    return firebaseObject;
};

export const covertToFireStoreTimeStamp = (obj: any) => {
    if (!obj) return null;
    const objct_convert = { ...obj };
    for (const [key, value] of Object.entries(objct_convert)) {
        if (date_columns_look_up.includes(key)) {
            const date = value ? (new Date()) : (new Date(Date.parse(value as string)));
            objct_convert[key] = firestore_timestamp(date);
        }
    }
    return objct_convert;
};

export const hasKey = (data: Object, key: string) => data.hasOwnProperty(key);