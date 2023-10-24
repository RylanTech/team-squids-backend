import { Router } from 'express';
import { createChurch, deleteChurch, editChurch, getChurch, getFavoriteChurches, getOneChurch, getOneChurchByName, getUserChurch } from '../controllers/churchController';
import { searchChurch } from '../controllers/searchController';

const router = Router();

router.post('/favorites', getFavoriteChurches);

router.get('/', getChurch);

router.get('/userchurch/:userId', getUserChurch)

router.post('/', createChurch);

router.get('/:id', getOneChurch);

router.get('/name/:churchName', getOneChurchByName)

router.get('/search/:query', searchChurch)

router.put('/:id', editChurch);

router.delete('/:id', deleteChurch);


export default router;