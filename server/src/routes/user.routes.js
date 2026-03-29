import express from 'express';
import { register, login, logout, getAllUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/', getAllUsers);

export default router;
