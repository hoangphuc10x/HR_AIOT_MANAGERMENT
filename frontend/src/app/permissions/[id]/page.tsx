'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import axios from '@/lib/axios';
import { UserWithPermissions } from '@/types/employee/userWithPermissions.interface';
import { PermissionEditModal } from '@/components/permission/UserPermissionEditModal';

export default function PermissionPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserWithPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users/${params.id}`);
        setUser(res.data.data);
        console.log(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center mt-20 text-red-500">User not found</div>;
  }

  return (
    <div className="p-6">
      <PermissionEditModal
        user={user}
        isOpen={true}
        onClose={() => router.push('/permissions')}
        onSave={() => {}}
      />
    </div>
  );
}
