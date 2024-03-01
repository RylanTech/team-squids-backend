import { Router } from 'express';
import { createUser, editUser, testingId } from '../controllers/userController';

const router = Router();

router.post('/create-user', createUser);
router.put('/updateuser/', editUser)
router.post('/testing/:phoneId', testingId)

export default router; 