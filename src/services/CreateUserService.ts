import { injectable } from "tsyringe"
import { User } from "../schemas/User"

interface CreateUserDTO {
  email: string
  socket_id: string
  avatar: string
  name: string
}

@injectable()
class CreateUserService {
  async execute({ avatar, email, socket_id, name }: CreateUserDTO) {
    const userExists = await User.findOne({ email }).exec()

    if (userExists) {
      const user = await User.findOneAndUpdate(
        {
          _id: userExists._id,
        },
        {
          $set: {
            socket_id,
            avatar,
            name,
          }
        },
        {
          new: true,
        }
      )

      return user
    }

    const user = await User.create({
      avatar,
      email,
      name,
      socket_id
    })

    return user
  }
}

export { CreateUserService }