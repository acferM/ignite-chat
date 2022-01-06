import { container } from 'tsyringe'
import { io } from '../http'
import { CreateChatRoomService } from '../services/CreateChatRoomService'
import { CreateMessageService } from '../services/CreateMessageService'

import { CreateUserService } from '../services/CreateUserService'
import { GetAllUsersService } from '../services/GetAllUsersService'
import { GetChatRoomByUsersService } from '../services/GetChatRoomByUsersService'
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
    const getRoomByUsers = container.resolve(GetChatRoomByUsersService)
    const getUserBySocketId = container.resolve(GetUserBySocketIdService)

    const userLogged = await getUserBySocketId.execute(socket.id)

    let room = await getRoomByUsers.execute([userLogged.id, user.id])

    if (!room) {
      room = await createChatRoom.execute([user.idUser, userLogged._id])
    }

    socket.join(room.idChatRoom)

    callback(room)
  })

  socket.on('message', async data => {
    const getUserBySocketId = container.resolve(GetUserBySocketIdService)
    const createMessage = container.resolve(CreateMessageService)

    const user = await getUserBySocketId.execute(socket.id)

    const message = await createMessage.execute({
      to: user._id,
      text: data.message,
      roomId: data.idChatRoom
    })

    io.to(data.idChatRoom).emit('message', {
      message,
      user
    })
  })
})