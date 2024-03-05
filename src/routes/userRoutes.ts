import { Router } from 'express';
import { createUser, editUser, testingId } from '../controllers/userController';

const router = Router();

// router.post('/', createUser);
router.put('/', editUser)
router.post('/testing/:phoneId', testingId)

export default router; 