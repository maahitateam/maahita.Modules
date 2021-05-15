import { Router, Request, Response } from "express";
import admin, { auth } from '../models/firebase-service';
import { isAuthenticated, isAuthorized } from "../auth";
import { claims } from "../models/helper";
const router = Router();

router.get('/getUserByUid/:id', isAuthenticated, isAuthorized({ hasRole: ['admin'] }), async (req: Request, res: Response) => {
    try {
        const uid = req.params.id;
        if (!uid) throw new Error("userid is missing");
        const userRecord = await admin.auth().getUser(uid);
        res.status(200).json(userRecord);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userCredentials = await auth().signInWithEmailAndPassword(email, password);
        let userRecord;
        if (userCredentials) {
            const token = await userCredentials.user?.getIdToken();
            const refreshToken = await userCredentials.user?.refreshToken;
            const uid = userCredentials.user?.uid;
            const displayName = userCredentials.user?.displayName;
            if (uid) {
                userRecord = await admin.auth().getUser(uid);
                if (!userRecord.customClaims) {
                    await admin.auth().setCustomUserClaims(userRecord.uid, claims.user); // set default custom claim as user
                    userRecord = await admin.auth().getUser(uid);
                }
                res.status(200).json({ 'token': `Bearer ${token}`, refreshToken, ...userRecord, displayName });
            }
            res.status(500).json("Invalid login details");
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const uid = req.params.id;
        if (!uid) throw new Error("userid is missing");
        const body = req.body;
        const userRecord = await admin.auth().updateUser(uid, { displayName: body.displayName });
        res.status(200).json({ userRecord });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/', isAuthenticated, isAuthorized({ hasRole: ['admin'], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const { email, password, hasClaims, displayName } = req.body;
        const userRecord = await admin.auth().createUser({ email: email, password: password, displayName: displayName });
        if (hasClaims) {
            const { claims } = req.body;
            for (let index = 0; index < claims.length; index++) {
                const claim = claims[index];
                await admin.auth().setCustomUserClaims(userRecord.uid, { claim });
            }
        } else {
            await admin.auth().setCustomUserClaims(userRecord.uid, claims.user);
        }
        res.status(200).json(userRecord);
    }
    catch (error) {
        res.status(500).json(error);
    }
});

router.delete('/:id', isAuthenticated, isAuthorized({ hasRole: ['admin'] }), async (req: Request, res: Response) => {
    try {
        const uid = req.params.id;
        if (!uid) throw new Error("userid is missing");
        await admin.auth().deleteUser(uid);
        res.status(200).json('user deleted successfully');
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/getToken', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userCredentials = await auth().signInWithEmailAndPassword(email, password);
        if (userCredentials) {
            const token = await userCredentials.user?.getIdToken();
            res.status(200).json({ 'token': `Bearer ${token}` });
        }
        res.status(500).json("Invalid login details");
    } catch (error) {
        res.status(500).json(error);
    }
});
export = router;