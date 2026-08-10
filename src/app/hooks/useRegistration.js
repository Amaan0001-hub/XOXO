import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userRegistration } from '../redux/slices/authSlice';

export const useRegistration = () => {
  const dispatch = useDispatch();
  const { loading, error, userData } = useSelector((state) => state.auth);

  const register = useCallback(async (userData) => {
    try {
      const result = await dispatch(userRegistration(userData)).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  }, [dispatch]);

  return {
    register,
    loading,
    error,
    userData,
    isLoading: loading,
    isError: !!error,
    isSuccess: !!userData && !error
  };
};

export default useRegistration;

