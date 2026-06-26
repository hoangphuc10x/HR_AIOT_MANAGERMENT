import axios from '@/lib/axios';

// Request user permission user
export const fetchUserPermissions = async (userId: number) => {
  try {
    const res = await axios.get(`/permissions/${userId}`);
    if (res.data?.success) {
      return res.data.data || []; // number array
    }

    return [];
  } catch (err) {
    console.error('Error fetching user permissions:', err);
    return [];
  }
};

// request user department permission
export const fetchDepartmentPermissions = async (userId: number) => {
  try {
    const res = await axios.get(`/departments/permissions/${userId}`);
    if (res.data?.success) {
      return res.data.data || [];
      // [{ departmentId, departmentName, permissions: [1,2,3...] }]
    }
    return [];
  } catch (err) {
    console.error('Error fetching department permissions:', err);
    return [];
  }
};

// Service call both of user permission and user department permission
export const fetchAllPermissions = async (userId: number) => {
  const [userPermissions, departmentPermissions] = await Promise.all([
    fetchUserPermissions(userId),
    fetchDepartmentPermissions(userId),
  ]);

  return {
    userPermissions, // number array
    departmentPermissions, // object
  };
};
