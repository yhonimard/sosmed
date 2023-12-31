import api from "@/api";
import { GET_CURRENT_USER_PROFILE_NAME } from "@/fixtures/api-query";
import globalReducer from "@/redux/globalReducer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

const useUpdateCurrentUserProfile = (uid) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation(
    async (data) => {
      const res = await api.request.updateCurrentUserProfile(data);
      return res;
    },
    {
      onMutate: async (newData) => {
        dispatch(globalReducer.action.showLoadingOverlay(true));
        await queryClient.cancelQueries([GET_CURRENT_USER_PROFILE_NAME, uid]);
        const prevData = queryClient.getQueryData([GET_CURRENT_USER_PROFILE_NAME, uid]);

        queryClient.setQueryData([GET_CURRENT_USER_PROFILE_NAME, uid], (oldData) => {
          return {
            ...oldData,
            name: newData.name,
            bio: newData.bio,
            birthday: newData.birthday,
            phone: newData.phone,
          };
        });

        return {
          prevData,
        };
      },
      onError: (err, _var, context) => {
        const message = err?.response?.data?.message;
        queryClient.setQueryData(
          [GET_CURRENT_USER_PROFILE_NAME, uid],
          context.prevData
        );
        dispatch(
          globalReducer.action.showNotification({
            message: message || "error when updating profile, pls try again",
            status: "error",
          })
        );
        dispatch(globalReducer.action.showLoadingOverlay(false));
      },
      onSettled: () => {
        queryClient.invalidateQueries([GET_CURRENT_USER_PROFILE_NAME, uid]);
      },
      onSuccess: () => {
        dispatch(
          globalReducer.action.showNotification({
            message: "success updating profile",
          })
        );
        dispatch(globalReducer.action.showLoadingOverlay(false));
      },
    }
  );
};

export default useUpdateCurrentUserProfile;
