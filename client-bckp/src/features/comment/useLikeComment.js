import api from '@/api'
import { GET_USER_HAS_LIKE_COMMENT_QUERY_NAME } from '@/fixtures/api-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const useLikeComment = ({ cid, uid }) => {
  const queryClient = useQueryClient()
  return useMutation(async () => {
    await api.request.likeComment({ cid })
  }, {
    onMutate: async () => {
      await queryClient.cancelQueries([GET_USER_HAS_LIKE_COMMENT_QUERY_NAME, uid, cid])
      const prevData = queryClient.getQueryData([GET_USER_HAS_LIKE_COMMENT_QUERY_NAME, uid, cid])

      queryClient.setQueryData([GET_USER_HAS_LIKE_COMMENT_QUERY_NAME, uid, cid], () => {
        return {
          hasLike: true
        }
      })

      return {
        prevData
      }
    },
    onError: (err, _ctx, ctx) => {
      queryClient.setQueryData([GET_USER_HAS_LIKE_COMMENT_QUERY_NAME, uid, cid], ctx.prevData)
    },
    onSettled: () => {
      queryClient.invalidateQueries([GET_USER_HAS_LIKE_COMMENT_QUERY_NAME, uid, cid])
    }

  })
}

export default useLikeComment