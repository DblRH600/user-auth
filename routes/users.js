import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import verifyJWT from '../middlewares/verifyJWT.js'

dotenv.config() // need to config globally

const secret = process.env.JWT_SECRET
console.log('JWT secret: ', secret)
const expiration = '2h'

const router = express.Router()


router.get('/', verifyJWT, (req, res) => {
    // this route is protected by JWT
  console.log('User: ', req.user)

  res.send(req.user)
})

/**
 * GET route with verfication to get user info by ID
 */
router.get('/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id)
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})
/**
 *  PATCH route with verfication to update user info
 */
router.patch('/:id', verifyJWT, async (req, res) => {
    const { id } = req.params 
    try {
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true })
        res.status(202).json({ message: 'User information has been updated', user: updatedUser})
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
})
/**
 * DELETE route with verification to delete user data
 */
router.delete('/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.status(200).json({ message: 'User deletion successful', user: deletedUser })
    } catch (error) {
        console.error('Error deleting user: ', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/register', async (req, res) => {
  //TODO: Implement user registration logic
  try {
    const newUser = await User.create(req.body)
    res.status(201).json(newUser)
  } catch (error) {
    console.error('Error registering user: ', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    // find user by email
    const user = await User.findOne({ email: email })
    console.log('Found User: ', user)

    if (!user) {
      return res.status(404).json({ message: 'Incorrect email or password' })
    }

    // compare pw with hashed pw
    const correctPw = await user.isCorrectPassword(password)

    if (!correctPw) {
      return res.status(400).json({ message: 'Incorrect email or password' })
    }

    // JWT token creation process
    // payload creation
    const payload = {
      _id: user._id,
      username: user.username,
      email: user.email
    }

    // token
    const token = jwt.sign({ data: payload }, secret, { expiresIn: expiration })

    res.json({ token, user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
