import { Router, Request, Response } from "express";
import * as dbCollection from '../config/dbCollection.json';
import { uuid, sessionStatus, convertDate, firestore_timestamp, session_columns, session_columns_with_enrollments, hasKey } from '../models/helper';
import * as dbOp from '../models/dbOps';
import { isAuthenticated, isAuthorized } from "../auth/index";
import { query } from "../models";
const router = Router();

router.get('/public', async (req: Request, res: Response) => {
    try {
        const query: query = {
            field: 'status',
            op: 'in',
            val: [1, 2, 3, 6]
        };
        const results = await dbOp.getCollectionData(dbCollection.sessions, query, session_columns);
        results.map((_result: any) => convertDate(_result)).map((_result: any) => _result['scheduledon'] = _result['date']);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json(error);
    }
});

router.get('/', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter", "user"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const query: query = {
            field: 'status',
            op: 'in',
            val: [1, 2, 3, 6]
        };
        const results = await dbOp.getCollectionData(dbCollection.sessions, query, session_columns_with_enrollments);
        results.map((_result: any) => convertDate(_result)).map((_result: any) => _result['scheduledon'] = _result['date']);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json(error);
    }
});

router.get('/:id', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter", "user"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error('Pass the right data');
        const result = await dbOp.findDocById(id, dbCollection.sessions).then(res => convertDate(res));
        if (result) {
            res.status(200).json({ ...result, id: id });
        }
        throw new Error('Issue in reading the data');
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/createdby/:id', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter", "user"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error('Pass the right data');
        const queries: query[] = [{ field: 'createdby', op: '==', val: id }, { field: 'status', op: 'in', val: [1, 2, 3, 6] }];
        const results = await dbOp.getDocumentsByQuery(dbCollection.sessions, queries, session_columns);
        if (results) {
            results.map((_result: any) => convertDate(_result));
            res.status(200).json(results);
        }
        throw new Error('Issue in reading the data');
    }
    catch (error) {
        res.status(500).json(error);
    }
});

router.post('/', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const id = uuid();
        const scheduledon = firestore_timestamp(new Date(Date.parse(req.body.scheduledon)));
        data.status = sessionStatus.created;
        data.createdon = firestore_timestamp(new Date());
        data.scheduledon = scheduledon;
        data.date = scheduledon;
        data.updatedon = firestore_timestamp(new Date());
        const result = await dbOp.createDocument(req.body, dbCollection.sessions, id);
        if (result) {
            data.id = id;
            res.status(200).json(convertDate(data));
        }
        throw new Error(`Issue in saving session`);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:id', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const data = req.body;
        data.updatedon = firestore_timestamp(new Date());
        const result = await dbOp.updateDocument(id, data, dbCollection.sessions);
        if (result) {
            res.status(200).json(convertDate(data));
        }
        throw new Error("Issue in updating the session");
    } catch (error) {
        res.status(500).json(error);
    }
});

// start - stop - cancel

router.put('/:op/:id', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const op = req.params.op; // operation - start - stop - cancel
        if (!id) throw new Error("Id parameter is missing");
        const data = req.body;
        if (op === 'start') {
            data.status = sessionStatus.started;
            // data.meetingid = uid;
            data.meetingID = uuid();
            data.startedon = firestore_timestamp(new Date());
        } else if (op === 'complete') {
            data.status = sessionStatus.completed;
            data.completedon = firestore_timestamp(new Date());
        } else if (op === 'cancel') {
            data.status = sessionStatus.cancelled;
            data.cancelledon = firestore_timestamp(new Date());
        }
        data.updatedon = firestore_timestamp(new Date());
        console.log(`op - ${op}, id - ${id}, body - ${JSON.stringify(data)}`);
        const result = await dbOp.updateDocument(id, data, dbCollection.sessions);
        if (result) {
            res.status(200).json(convertDate(data));
        }
        throw new Error("Issue in updating the session");
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/enroll/:id', isAuthenticated, isAuthorized({ hasRole: ['user'], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const session = await dbOp.findDocById(body.id, dbCollection.sessions);
        if (hasKey(session, 'enrollments')) {
            session.enrollments.push(id);
        } else {
            session['enrollments'] = [id];
        }
        const result = await dbOp.updateDocument(body.id, session, dbCollection.sessions);
        if (result) {
            res.status(200).json(result);
        }
        throw new Error('Error in enrolloing the session');
    } catch (error) {
        res.status(500).json(error);
    }
});

router.delete('/:id', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const result = await dbOp.deleteDocumentById(id, dbCollection.sessions);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});
export = router;