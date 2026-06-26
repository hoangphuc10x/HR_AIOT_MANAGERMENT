import { JwtPayload } from '@/types/common/jwt.interface';
import { jwtDecode } from 'jwt-decode';

export const getDecodedToken = (): JwtPayload | null => {
  try {
    const token = localStorage.getItem('access_token') || '';
    if (!token) return null;
    const decoded: JwtPayload = jwtDecode(token);
    return decoded;
  } catch {
    return null;
  }
};
