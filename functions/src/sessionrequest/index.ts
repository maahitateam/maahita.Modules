import { Router, Request, Response } from "express";
import { isAuthenticated, isAuthorized } from "../auth/index";
import * as dbCollection from '../config/dbCollection.json';
import { uuid, sessionRequest, firestore_timestamp, convertDate, session_columns } from '../models/helper';
import * as dbOp from '../models/dbOps';
import { query } from "../models";
const router = Router();

router.post('/', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const id = uuid();
        console.log(`post session request is started`);
        data.status = sessionRequest.requested;
        data.createdon = firestore_timestamp(new Date());
        data.scheduledon = firestore_timestamp(new Date(Date.parse(req.body.scheduledon)));
        data.updatedon = firestore_timestamp(new Date());
        const result = await dbOp.createDocument(req.body, dbCollection.sessionrequests, id);
        console.log(`post session request is completed`);
        if (result) {
            data.id = id;
            res.status(200).json(data);
        }
        throw new Error(`Issue in saving session`);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/:id', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error('Pass the right data');
        const result = await dbOp.findDocById(id, dbCollection.sessionrequests).then(res => convertDate(res));
        if (result) {
            res.status(200).json({ ...result, id: id });
        }
        throw new Error('Issue in reading the data');
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const query: query = {
            field: 'status',
            op: '==',
            val: 100
        };
        const results = await dbOp.getCollectionData(dbCollection.sessionrequests, query, session_columns);
        results.map((_result: any) => convertDate(_result));
        res.status(200).json(results);
    } catch (error) {
        res.status(500).send(error);
    }
});

// approve/reject session
router.put('/:id', isAuthenticated, isAuthorized({ hasRole: ["admin"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const data = req.body;
        data.updatedon = firestore_timestamp(new Date());
        if (data.status === sessionRequest.approved) {
            const result = await dbOp.updateDocument(id, data, dbCollection.sessionrequests);
            // after update add the same session to session
            data.status = 1;
            if (result) {
                data.createdby = data.presenterid;
                data.updatedby = data.presenterid;
                data.scheduledon = firestore_timestamp(new Date(Date.parse(data.scheduledon)));
                data.createdon = firestore_timestamp(new Date());
                const session_data = await dbOp.createDocument(data, dbCollection.sessions, data.id);
                res.status(200).json(convertDate(session_data));
            }
        } else if (data.status === sessionRequest.rejected) {
            const result = await dbOp.updateDocument(id, data, dbCollection.sessionrequests);
            if (result) {
                res.status(200).json(convertDate(data));
            }
        }
        throw new Error("Issue in updating the session");
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/:id', isAuthenticated, isAuthorized({ hasRole: ["admin"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const result = await dbOp.deleteDocumentById(id, dbCollection.sessionrequests);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error);
    }
});

export = router;