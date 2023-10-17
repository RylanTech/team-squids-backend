import { Router } from 'express';
import { allUser, createUser, getUser,

 signInUser, modifyUser,deleteUser, verifyCurrentUser, vrfyUser, getAPIKey } from '../controllers/churchUserController';
import { searchUser } from '../controllers/searchController';

const router = Router();

router.get('/', allUser);

router.get('/:id', getUser);

router.get("/apikey", getAPIKey);

router.post('/verify/:id', vrfyUser)

router.post('/create-account', createUser);

router.put('/edit-account/:id', modifyUser);

router.post('/signin', signInUser);

router.delete('/delete-account/:id', deleteUser);

router.get("/verify-current-user", verifyCurrentUser);

router.post("/search/:query", searchUser)

export default router; 
