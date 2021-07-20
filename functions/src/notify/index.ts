import { Router, Request, Response } from "express";
import { isAuthenticated, isAuthorized } from "../auth/index";
import admin from "../models/firebase-service";
const router = Router();

router.post('/', isAuthenticated, isAuthorized({ hasRole: ["admin", "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const payload = {
            notification: {
                title: body.title,
                body: body.message
            }
        };
        const messageTopicResponse: admin.messaging.MessagingTopicResponse = await admin.messaging().sendToTopic("maahitaNotifications", payload);
        res.status(200).send({ messageId: messageTopicResponse.messageId });
    } catch (error) {
        res.status(500).send(error);
    }
});

export = router;