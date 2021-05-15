import * as firestore from '@google-cloud/firestore';
import { query } from '.';
import * as config from '../config/firebaseConfig.json';
const dbref = new firestore.Firestore(config);
// columns: csv of column names
export const getCollectionData = async (collection: string, querie: query, columns: string[]) => {
    try {
        const snapShotData: any = [];
        const snapshot = await dbref.collection(collection)
            .where(querie.field, querie.op as firestore.WhereFilterOp, querie.val)
            .select(...columns).limit(20).get();
        snapshot.docs.forEach(doc => {
            const obj: any = doc.data();
            obj.id = doc.id; // document id
            snapShotData.push(obj);
        });
        return snapShotData;
    } catch (error) {
        throw new Error(error);
    }
};

export const createDocument = async (data: any, collection: string, uid: string): Promise<firestore.WriteResult> => {
    try {
        return await dbref.collection(collection).doc(uid).create(data);
    } catch (error) {
        throw new Error(error);
    }
};

export const updateDocument = async (id: string, data: any, collection: string): Promise<firestore.WriteResult> => {
    try {
        return await dbref.collection(collection).doc(id).set(data, { merge: true });
    } catch (error) {
        throw new Error(error);
    }
};

export const deleteDocumentById = async (id: string, collection: string): Promise<firestore.WriteResult> => {
    try {
        return await dbref.collection(collection).doc(id).delete();
    } catch (error) {
        throw new Error(error);
    }
};

export const findDocById = async (id: string, collection: string): Promise<any> => {
    try {
        const result = await dbref.collection(collection).doc(id).get();
        return result.data();
    } catch (error) {
        throw new Error(error);
    }
};

export const findDocByIdToUpdate = async (id: string, collection: string): Promise<firestore.DocumentSnapshot<firestore.DocumentData>> => {
    try {
        return await dbref.collection(collection).doc(id).get();
    } catch (error) {
        throw new Error(error);
    }
};

export const findDocByField = async (paramValue: string, collection: string, param: string) => {
    try {
        return await dbref.collection(collection).where(param, "==", paramValue).get();
    } catch (error) {
        throw new Error(error);
    }
};
export const getDocumentsByQuery = async (collection: string, queries: query[], columns: string[]) => {
    try {
        const snapShotData: any = [];
        const snapshot = await dbref.collection(collection)
            .where(queries[0].field, queries[0].op as firestore.WhereFilterOp, queries[0].val)
            .where(queries[1].field, queries[1].op as firestore.WhereFilterOp, queries[1].val)
            .select(...columns).get();
        snapshot.docs.forEach((doc: any) => {
            const obj: any = doc.data();
            obj.id = doc.id; // document id
            snapShotData.push(obj);
        });
        return snapShotData;
    } catch (error) {
        throw new Error(error);
    }
};