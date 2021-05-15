import { Router, Request, Response } from "express";
import * as dbCollection from '../config/dbCollection.json';
import { firestore_timestamp, covertToFireStoreTimeStamp, presenter_columns, convertDate, default_password, claims } from '../models/helper';
import * as dbOp from '../models/dbOps';
import { isAuthenticated, isAuthorized } from "../auth/index";
import admin from "../models/firebase-service";
import { query } from "../models";

const router = Router();

router.get('/', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const query: query = {
            field: 'status',
            op: 'in',
            val: [1, 2, 3, 6]
        };
        const results = await dbOp.getCollectionData(dbCollection.presenters, query, presenter_columns);
        results.map((_result: any) => convertDate(_result));
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json(error);
    }
});

router.get('/:id', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error('Id parameter is missing');
        const result = await dbOp.findDocById(id, dbCollection.presenters).then(res => convertDate(res));
        if (result) {
            res.status(200).json({ ...result, id: id });
        }
        throw new Error("Issue in reading the data");
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const data = covertToFireStoreTimeStamp(req.body);
        data.status = 1; // set the active status
        let user, result, id;
        if (data.usercategory === 'existing_user') {
            user = await admin.auth().getUserByEmail(data.email);
            id = user?.uid;
            await admin.auth().setCustomUserClaims(id, claims.presenter);
            result = await dbOp.createDocument(data, dbCollection.presenters, id);
        } else if (data.usercategory === 'new_user') {
            user = await admin.auth().createUser({ email: data.email, password: default_password, displayName: data.displayName }); // userRecord
            id = user?.uid;
            await admin.auth().setCustomUserClaims(id, claims.presenter);
            result = await dbOp.createDocument(data, dbCollection.presenters, id);
        }
        if (result && id) {
            data.id = id;
            res.status(200).json(data);
        }
        throw new Error("Issue in saving the presenter");
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:id', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const body = req.body;
        body.updateon = firestore_timestamp(new Date());
        const result = await dbOp.updateDocument(id, body, dbCollection.presenters);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.delete('/:id', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("Id parameter is missing");
        const result = await dbOp.deleteDocumentById(id, dbCollection.presenters);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});
export = router;