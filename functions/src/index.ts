// All required imports
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as user_routes from './user/index';
import * as session_routes from './session/index';
import * as presenter_routes from './presenter/index';
import * as notify_routes from "./notify/index";
import * as session_request_routes from "./sessionrequest/index";
import * as upload_routes from "./upload/index";
// user
const app_user: express.Application = express();
const main_user: express.Application = express();
app_user.use('/', user_routes);
main_user.use(helmet());
main_user.use(cors({ origin: true }));
main_user.use(express.json());
main_user.use('/', app_user);

// session
const app_session: express.Application = express();
const main_session: express.Application = express();
app_session.use('/', session_routes);
main_session.use(helmet());
main_session.use(cors({ origin: true }));
main_session.use(express.json());
main_session.use('/', app_session);

// presenter
const app_presenter: express.Application = express();
const main_presenter: express.Application = express();
app_presenter.use('/', presenter_routes);
main_presenter.use(helmet());
main_presenter.use(cors({ origin: true }));
main_presenter.use(express.json());
main_presenter.use('/', app_presenter);

// notify
const app_notifiy: express.Application = express();
const main_notifiy: express.Application = express();
app_notifiy.use('/', notify_routes);
main_notifiy.use(helmet());
main_notifiy.use(cors({ origin: true }));
main_notifiy.use(express.json());
main_notifiy.use('/', app_notifiy);

// session requests
const app_sessionrequest: express.Application = express();
const main_sessionrequest: express.Application = express();
app_sessionrequest.use('/', session_request_routes);
main_sessionrequest.use(helmet());
main_sessionrequest.use(cors({ origin: true }));
main_sessionrequest.use(express.json());
main_sessionrequest.use('/', app_sessionrequest);

// session requests
const app_upload: express.Application = express();
const main_upload: express.Application = express();
app_upload.use('/', upload_routes);
main_upload.use(helmet());
main_upload.use(cors({ origin: true }));
main_upload.use(express.json());
main_upload.use('/', app_upload);

//session/request
export const user = functions.https.onRequest(main_user);
export const session = functions.https.onRequest(main_session);
export const presenter = functions.https.onRequest(main_presenter);
export const notify = functions.https.onRequest(main_notifiy);
export const upload = functions.https.onRequest(main_upload);
export const sessionrequest = functions.https.onRequest(main_sessionrequest);

