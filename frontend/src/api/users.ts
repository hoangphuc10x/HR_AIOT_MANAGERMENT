import axios from '@/lib/axios';
import { User } from '@/types/employee/users.interface';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timeStamp: string;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<ApiResponse<User[]>>('/users');
    const data = response.data.data; // Access the data property from wrapper
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const deleteUser = async (
  userId: number,
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete<ApiResponse<{ message: string }>>(
      `/users/${userId}`,
    );
    return response.data.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
