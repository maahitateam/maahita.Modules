import { Router, Request, Response } from "express";
import * as dbCollection from '../config/dbCollection.json';
import { jaas_columns } from '../models/helper';
import * as dbOp from '../models/dbOps';
// import { isAuthenticated, isAuthorized } from "../auth/index";
import { query } from "../models";
const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const query: query = {
            field: 'isActive',
            op: '==',
            val: true
        };
        const results = await dbOp.getCollectionData(dbCollection.jaassettings, query, jaas_columns);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json(error);
    }
});

export = router;