import axios from '@/lib/axios';
import { User } from '@/types/employee/users.interface';

export const getUsers = async (): Promise<User[]> => {
  try {
    const userId = '0ca5226c-0700-4322-b68f-68a54743ca2c';

    const response = await axios.get(`/departments/department/${userId}`);
    const data = response.data.data?.items; // Access the data property from wrapper
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const deleteUserFromDepartment = async (
  userId: string,
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
