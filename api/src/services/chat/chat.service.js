import { Op, Sequelize } from "sequelize"
import ApiNotFoundError from "../../exceptions/ApiNotFoundError"
import sequelizeError from "../../exceptions/sequelize-error"
import { CHAT_BELONGS_TO_MANY_USER_CHAT_ALIAS, CHAT_HAS_MANY_MESSAGE_ALIAS } from "../../fixtures/models"
import paginationHelper from "../../helper/pagination-helper"
import toPaginationHelper from "../../helper/to-pagination-helper"
import { MESSAGE_ATTRIBUTES } from "./chat.constants"
import moment from "moment"

const ChatService = ({
  chatRepo,
  userChatRepo,
  userRepo,
  sequelize,
  messageRepo
}) => {


  const createChat = async (user, params) => {
    try {
      const chat = await chatRepo.findOne({
        where: {
          [Op.or]: [
            {
              sender_id: user.id,
              receiver_id: params.id
            },
            {
              sender_id: params.id,
              receiver_id: user.id
            }
          ]
        }
      })

      if (chat) throw new ApiNotFoundError('chat already exists')
      await sequelize.transaction(async trx => {

        const newChat = await chatRepo.create({
          sender_id: user.id,
          receiver_id: params.id
        }, { transaction: trx })

        const users = await userRepo.findAll(
          {
            attributes: ['id'],
            where: {
              id: {
                [Op.in]: [user.id, params.id]
              }
            },
            transaction: trx
          }
        )

        const mappedUserChat = users.map(u => ({
          user_id: u.dataValues.id,
          chat_id: newChat.id,
        }))

        await userChatRepo.bulkCreate(mappedUserChat, { transaction: trx })

      })

    } catch (error) {
      throw sequelizeError(error)
    }
  }

  const getChats = async (user, query) => {
    try {
      const { limit, offset } = paginationHelper(query)
      const chats = await chatRepo.findAndCountAll({
        where: {
          [Op.or]: [
            {
              sender_id: user.id
            },
            {
              receiver_id: user.id
            }
          ]
        },
        attributes: ['id'],
        order: [[Sequelize.literal('messages.created_at'), 'DESC'],],
        include: [
          {
            association: CHAT_BELONGS_TO_MANY_USER_CHAT_ALIAS,
            attributes: ['id', 'username', 'photo_profile'],
            through: {
              attributes: []
            },
            where: {
              id: {
                [Op.ne]: user.id
              }
            }
          },
          {
            association: CHAT_HAS_MANY_MESSAGE_ALIAS,
            attributes: ['text', 'media', 'created_at'],
            where: {
              [Op.or]: [
                {
                  sender_id: user.id
                },
                {
                  receiver_id: user.id
                }
              ]
            },
          },
        ],
        subQuery: false,
        distinct: true,
        limit,
        offset
      })

      const mappedResult = chats.rows.map(c => ({
        id: c.dataValues.id,
        user: c.dataValues.user.reduce((acc, obj) => ({ ...acc, ...obj })),
        last_message: c.dataValues.messages[0]
      }))

      console.log(chats.count);
      return toPaginationHelper(mappedResult, chats.count, query, 'chats')
    } catch (error) {
      throw sequelizeError(error)
    }
  }

  const sendMessage = async (user, data) => {
    try {
      const { receiver_id, text, media } = data

      const users = await userRepo.findAll({
        where: {
          id: {
            [Op.in]: [user.id, receiver_id]
          }
        }
      })
      if (users.length < 2) throw new ApiNotFoundError('user not found')

      const chat = await chatRepo.findOne({
        where: {
          [Op.or]: [
            {
              sender_id: user.id,
              receiver_id: receiver_id
            },
            {
              sender_id: receiver_id,
              receiver_id: user.id
            },
          ]
        },
        attributes: ['sender_id', 'receiver_id', 'id']
      })

      if (!chat) throw new ApiNotFoundError('please create chat first')

      await sequelize.transaction(async trx => {

        await messageRepo.create({
          chat_id: chat.id,
          sender_id: user.id,
          receiver_id,
          text,
          media
        }, { transaction: trx })

      })

    } catch (error) {
      throw sequelizeError(error)
    }
  }

  const getMessages = async (user, params, query) => {
    try {
      const { user_id } = params
      const chat = await chatRepo.findOne({
        where: {
          [Op.or]: [
            {
              sender_id: user.id,
              receiver_id: user_id
            },
            {
              sender_id: user_id,
              receiver_id: user.id
            }
          ]
        }
      })

      if (!chat) throw new ApiNotFoundError('please create chat with that user first')
      const { limit, offset } = paginationHelper(query)
      const result = await messageRepo.findAndCountAll({
        where: {
          chat_id: chat.id,
        },
        attributes: MESSAGE_ATTRIBUTES,
        limit,
        offset,
        order: [
          ["created_at", 'DESC']
        ]
      })

      const lastId = await messageRepo.max('id')

      const mappedResult = result.rows.map(m => ({
        ...m.dataValues,
        created_at: moment(m.dataValues.created_at).format("DD/MM/YYYY")
      }))

      return toPaginationHelper(mappedResult, result.count, query, null, lastId)
    } catch (error) {
      throw sequelizeError(error)
    }
  }


  return {
    createChat,
    getChats,
    sendMessage,
    getMessages
  }
}

export default ChatService