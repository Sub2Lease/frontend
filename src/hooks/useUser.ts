import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE } from '@/constants';

// Define the User type (adjust fields to your API response)
interface User {
  id: string;
  name: string;
  email: string;
}

// Fetch function
const fetchUserById = async (id: string): Promise<User> => {
  const response = await axios.get(`${API_BASE}/users/?userId=${id}`);
  return response.data[0];
};

// React Query hook
export const useUser = (id: string) => {
  return useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};
