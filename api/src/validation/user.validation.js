import Joi from "joi"

const getUserById = {
  params: Joi.object().keys({
    userId: Joi.string().required().empty().uuid().guid().messages({
      "string.empty": "userId is required!!",
      "any.required": "userId is required!!",
      "string.uuid": "userId must have a valid uuid",
      "string.guid": "userId must have a valid uuid"
    })
  })
}


const updateProfile = {
  body: Joi.object().keys({
    bio: Joi.string().min(4).max(100).allow(null).optional(),
    birthday: Joi.date().allow(null).optional(),
    phone: Joi.number().min(4).max(14).optional()
  })
}

export default {
  getUserById,
  updateProfile
}