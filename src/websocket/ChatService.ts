import { container } from 'tsyringe'
import { io } from '../http'
import { CreateChatRoomService } from '../services/CreateChatRoomService'

import { CreateUserService } from '../services/CreateUserService'
import { GetAllUsersService } from '../services/GetAllUseresService'
import { GetUserBySocketIdService } from '../services/GetUserBySocketIdService'

io.on('connect', socket => {
  socket.on('start', async ({ name, email, avatar }) => {
    const createUser = container.resolve(CreateUserService)

    const user = await createUser.execute({
      name,
      email,
      avatar,
      socket_id: socket.id
    })

    socket.broadcast.emit('new_users', user)
  })

  socket.on('get_users', async (callback) => {
    const getAllUsers = container.resolve(GetAllUsersService)

    const users = await getAllUsers.execute()

    callback(users)
  })

  socket.on('start_chat', async (user, callback) => {
    const createChatRoom = container.resolve(CreateChatRoomService)
    const getUserBySocketId = container.resolve(GetUserBySocketIdService)

    const userLogged = await getUserBySocketId.execute(socket.id)

    const room = await createChatRoom.execute([user.idUser, userLogged._id])

    console.log(room)

    callback(room)
  })
})