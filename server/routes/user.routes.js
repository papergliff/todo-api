const router = require('express').Router()

const userController = require('../controllers/user.controller')
const { authenticate } = require('../middleware/authenticate')

router.post('/', userController.signUp)
router.get('/me', authenticate, userController.getMe)
router.post('/login', userController.login)
router.delete('/me/token', authenticate, userController.logout)

module.exports = router