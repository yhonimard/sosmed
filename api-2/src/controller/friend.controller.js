import httpStatus from "http-status"
import FriendService from "../service/friend.service"
import friendValidation from "../validation/friend.validation"
import ApiBadRequestError from "../exception/ApiBadRequestError"

const FriendController = () => {
  const service = FriendService()
  const validation = friendValidation

  const followFriend = async (req, res, next) => {
    const { params, user } = req
    const currentUser = user
    try {
      await service.followUser(params?.receiverId, currentUser)
      res.status(httpStatus.CREATED).json({ message: "success follow user" })
    } catch (error) {
      return next(error)
    }
  }

  const unfollowUser = async (req, res, next) => {
    const { params, user } = req
    const currentUser = user
    try {
      await service.unfollowUser(params?.receiverId, currentUser)
      res.json({ message: "success unfriend user", })
    } catch (error) {
      return next(error)
    }
  }

  const getUserHasFollow = async (req, res, next) => {
    try {
      const response = await service.getUserHasFollow(req.user, req.params)
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  const getCurrentUserFriendRequest = async (req, res, next) => {
    try {
      const response = await service.getCurrentUserFriendRequest(req.user, req.query)
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  const getCurrentUserFollowing = async (req, res, next) => {
    try {
      const response = await service.getCurrentUserFollowing(req.user, req.query)
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  const confirmFriend = async (req, res, next) => {
    const { params, user } = req
    const currentUser = user
    try {
      await service.confirmFriend(params?.senderId, currentUser)
      res.json({ message: "success confirm user" })
    } catch (error) {
      return next(error)
    }
  }

  const unconfirmFriend = async (req, res, next) => {
    const { params, user } = req
    const currentUser = user
    try {
      await service.unconfirmFriend(params?.senderId, currentUser)
      res.json({ message: "success unconfirm user" })
    } catch (error) {
      return next(error)
    }
  }

  const getCurrentUserFollowers = async (req, res, next) => {
    try {
      const response = await service.getCurrentuserFollowers(req.user, req.query)
      res.json(response)
    } catch (err) {
      return next(err)
    }

  }

  const deleteFollowers = async (req, res, next) => {
    try {
      await service.deleteFollowers(req.user, req.body)
      res.json({ message: "success delete followers" })
    } catch (error) {
      return next(error)
    }
  }

  return {
    followFriend,
    unfollowUser,
    getUserHasFollow,
    getCurrentUserFriendRequest,
    getCurrentUserFollowing,
    confirmFriend,
    unconfirmFriend,
    getCurrentUserFollowers,
    deleteFollowers
  }

}
export default FriendController
