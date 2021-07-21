import { Router, Request, Response } from "express";
import * as dbCollection from '../config/dbCollection.json';
import * as dbOp from '../models/dbOps';
import { randomUUID } from "crypto";
const router = Router();
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        dbOp.createDocument(data, dbCollection.jitsithook, randomUUID({ disableEntropyCache: true }));
        res.status(200).json({ "status": "success" });
    }
    catch (error) {
        res.status(500).json(error);
    }
});

export = router;