import api from "@/api"
import { GET_ALL_POST_NAME } from "@/fixtures/api-query"
import globalReducer from "@/redux/globalReducer"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useDispatch } from "react-redux"

const useDeletePost = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  return useMutation(async (postId) => {
    const res = await api.request.deletePostByPostId(postId)
    return res
  }, {
    onMutate: async (postId) => {
      dispatch(globalReducer.action.showLoadingOverlay(true))
      await queryClient.cancelQueries([GET_ALL_POST_NAME])
      const prevPost = queryClient.getQueryData([GET_ALL_POST_NAME])

      queryClient.setQueryData([GET_ALL_POST_NAME], (oldData) => {
        const newData = oldData.pages.map(p => ({
          ...p,
          data: p.data.filter(i => i.id !== postId)
        }))

        return {
          ...oldData,
          pages: newData
        }
      })
      return {
        prevPost
      }
    },
    onError: (err, _var, context) => {
      queryClient.setQueryData([GET_ALL_POST_NAME], context.prevPost)
      const message = err?.response?.data?.message
      dispatch(globalReducer.action.showNotification({ message, status: "error" }))
      dispatch(globalReducer.action.showLoadingOverlay(false))
    },
    onSettled: () => {
      queryClient.invalidateQueries([GET_ALL_POST_NAME])
    },
    onSuccess: () => {
      dispatch(globalReducer.action.showNotification({ message: "success delete post", status: "success" }))
      dispatch(globalReducer.action.showLoadingOverlay(false))
    }
  })
}

export default useDeletePost