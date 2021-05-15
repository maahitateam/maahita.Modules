import { Router, Request, Response } from "express";
import { Stream } from "stream";
import { isAuthenticated, isAuthorized } from "../auth/index";
import * as dbCollection from '../config/dbCollection.json';
import admin from "../models/firebase-service";
import * as dbOp from '../models/dbOps';
import { claims } from "../models/helper";
const router = Router();

router.post('/:id', isAuthenticated, isAuthorized({ hasRole: ['admin', "presenter"], allowSameUser: true }), async (req: Request, res: Response) => {
    try {

        console.log('Image Upload started');
        let pictureUrl = '';
        const id = req.params.id;
        console.log(`id = ${id}`);
        if (!id) throw new Error('Id is missing');
        const { filename, profile, imagebucket, fileExtention } = req.body;
        console.log(`${filename}, ${profile}, ${imagebucket}, ${fileExtention}`);

        const base64EncodedImage = profile.replace(/^data:image\/\w+;base64,/, '');
        console.log(`base64 - ${base64EncodedImage}`);

        const imageBuffer = Buffer.from(base64EncodedImage, 'base64');

        const bucket = admin.storage().bucket();
        console.log(`bucket - ${bucket}`);

        const file = bucket.file(`${imagebucket}/${filename}`);

        console.log(`buffer stream started`);

        const bufferStream = new Stream.PassThrough();
        bufferStream.end(imageBuffer);
        console.log(`buffer stream completed`);

        const ws = file.createWriteStream({
            metadata: {
                contentType: fileExtention // fileextention
            },
            public: true,
            validation: 'md5'
        });

        console.log('file write stream is created');

        console.log(`buffer stream pipe is strated`);

        bufferStream.pipe(ws)
            .on('error', (err) => console.log(err))
            .on('finish', () => {
                console.log(`buffer stream is finished`);
                console.log(`calling signed urls`);
                file.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100'
                }).then(async (signUrls) => {
                    pictureUrl = signUrls[0];
                    console.log(`pictureurl - ${pictureUrl}`);
                    const userRecord = await admin.auth().updateUser(id, { photoURL: pictureUrl });
                    // for presenter upadte the presenter object
                    console.log(`claim - ${userRecord.customClaims?.claim}`);
                    if (userRecord.customClaims?.claim === claims.presenter.claim) {
                        await dbOp.updateDocument(id, { photoURL: pictureUrl }, dbCollection.presenters);
                    }
                    console.log(`photourl is udpated`);
                    res.status(200).send({ photoURL: pictureUrl });
                });
            });
    } catch (error) {
        res.status(500).json(error);
    }
});

export = router;