import { doc, setDoc, deleteDoc, getDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NotFoundError, AppError } from '../lib/errors';

export class FirebaseService {
    constructor(catalogId) {
        this.catalogId = catalogId;
    }

    getCollectionPath(...segments) {
        return ['artifacts', this.catalogId, 'public', 'data', ...segments];
    }
}

export class ProductService extends FirebaseService {
    async getProduct(id) {
        try {
            const docRef = doc(db, ...this.getCollectionPath('products', id));
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                throw new NotFoundError('Producto');
            }

            return { id: snapshot.id, ...snapshot.data() };
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new AppError('Error al obtener producto', 'FETCH_ERROR');
        }
    }

    async deleteProduct(id) {
        try {
            const docRef = doc(db, ...this.getCollectionPath('products', id));
            await deleteDoc(docRef);
        } catch (error) {
            throw new AppError('Error al eliminar producto', 'DELETE_ERROR');
        }
    }

    async updateProduct(id, data) {
        try {
            const docRef = doc(db, ...this.getCollectionPath('products', id));
            await setDoc(docRef, data, { merge: true });
        } catch (error) {
            throw new AppError('Error al actualizar producto', 'UPDATE_ERROR');
        }
    }

    async createProduct(data) {
        try {
            const id = Date.now().toString();
            const docRef = doc(db, ...this.getCollectionPath('products', id));
            await setDoc(docRef, data);
            return id;
        } catch (error) {
            throw new AppError('Error al crear producto', 'CREATE_ERROR');
        }
    }

    subscribeToProducts(callback, onError) {
        const productsRef = collection(db, ...this.getCollectionPath('products'));

        return onSnapshot(
            query(productsRef),
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(data);
            },
            (error) => {
                console.error('Firestore subscription error:', error);
                onError?.(new AppError('Error al sincronizar productos', 'SYNC_ERROR'));
            }
        );
    }
}

export class SettingsService extends FirebaseService {
    async getSettings() {
        try {
            const docRef = doc(db, ...this.getCollectionPath('settings', 'general'));
            const snapshot = await getDoc(docRef);
            return snapshot.exists() ? snapshot.data() : null;
        } catch (error) {
            throw new AppError('Error al obtener configuración', 'FETCH_ERROR');
        }
    }

    async updateSettings(data) {
        try {
            const docRef = doc(db, ...this.getCollectionPath('settings', 'general'));
            await setDoc(docRef, data, { merge: true });
        } catch (error) {
            throw new AppError('Error al actualizar configuración', 'UPDATE_ERROR');
        }
    }

    subscribeToSettings(callback, onError) {
        const settingsRef = doc(db, ...this.getCollectionPath('settings', 'general'));

        return onSnapshot(
            settingsRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    callback(docSnap.data());
                }
            },
            (error) => {
                console.error('Settings subscription error:', error);
                onError?.(new AppError('Error al sincronizar configuración', 'SYNC_ERROR'));
            }
        );
    }
}
