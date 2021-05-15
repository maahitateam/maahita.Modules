// All Models has to be placed in this file
export interface IEnrollment {
    id: string;
}

export interface IAppInfo {
    app: string, // usuall user created from web admin
    device: string, // use in future to differentiate user from mobile and desktop
    module: string; // admin, presenter, user
}
export interface IAudit {
    createdon: Date,
    createdby: string;
    updatedon: Date,
    updatedby: string;
    status: Number;
}

export interface ISession extends IAudit {
    id: string,
    description: string,
    duration: string,
    enrollments: IEnrollment[],
    meetingid: string, //To-be introducted in coming versions
    presenter: string,
    presenterid: string,
    theme: string,
    title: string,
    scheduledon: Date, //TO-BE introduced in coming versions
    startedon: Date,
    cancelledon: Date;
    completedon: Date;
}

export interface IUser extends IAudit {
    id: string,
    email: string,
    displayName: string,
    isadmin: boolean,
    ispresenter: boolean;
    phone: string,
    password: string, // AES 192 encrypted
    app: string, // usuall user created from web admin
    device: string, // use in future to differentiate user from mobile and desktop
    module: string; // admin, presenter, user
}

export interface IPresenter extends IAudit {
    id: string,
    displayname: string,
    skills: string[],
    qualification: string;
    description: string;
    joinedon: Date;
    profile_pic: string; // expectecd to be a url other wise base64image
    dateofbirth: Date;
    address: string;
    city: string,
    state: string;
    country: string;
    zip: string;
    work_email: string;
    personal_email: string;
    work_phone: string;
    peronsal_phone: string;
    groups: [];
}

export interface ISessionRequest extends IAudit {
    scheduledon: Date;
    description: string;
    livestreaming: boolean;
    presenterid: string;
    presentername: string;
    requestedby: string;
    requestedon: string;
    title: string;
    status: number;
}

export interface IQuestion extends IAudit {
    id: string,
    series: number,
    description: string,
}


export interface query {
    field: string;
    op: string;
    val: any;
}