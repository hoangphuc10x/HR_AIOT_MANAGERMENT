import React, { useState } from 'react';
import Image from 'next/image';
import {
  // Plus,
  // X,
  // Search,
  Pencil,
  User,
  CreditCard,
  Building2,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  // flattenStringArray,
  formatDateUTC,
  formatSex,
  getNameParts,
} from '@/lib/utils';
import {
  // Department,
  Employee,
  RoleEnum,
  SexEnum,
  // StatusEnum,
} from '@/types/common/common.type';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import AvatarCropModal from './PreviewAvatarModal';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/common/ui/loading';
import { isAxiosError } from 'axios';

export default function EmployeeDetailGet({
  employeeInfo,
}: {
  employeeInfo: Employee;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    employeeInfo.avatarUrl || '',
  );
  const [file, setFile] = useState<File | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    console.log(selected);
    if (selected) {
      console.log(openPreview);
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setOpenPreview(true);
      e.target.value = '';
    }
  };

  const handleSaveImage = async (file: File) => {
    if (!previewUrl) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        `/users/update-avatar/${employeeInfo.id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      toast.success(res.data.data.message);
      setAvatarUrl(res.data.data.avatarUrl);
      setOpenPreview(false);
      setFile(null);
      setPreviewUrl(null);
      router.refresh();
    } catch (error) {
      toast.error('Fail to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(employeeInfo);
  const { t } = useTranslation();

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle name changes
  const handleNameChange = (type: 'firstName' | 'lastName', value: string) => {
    const currentFirstName = getNameParts(editData.fullName || '').firstName;
    const currentLastName = getNameParts(editData.fullName || '').lastName;

    const newFirstName = type === 'firstName' ? value : currentFirstName;
    const newLastName = type === 'lastName' ? value : currentLastName;

    setEditData((prev) => ({
      ...prev,
      fullName: `${newFirstName} ${newLastName}`.trim(),
    }));
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);
      console.log('Saving employee data:', editData);

      const res = await axios.put(`users/${employeeInfo.id}`, editData);

      if (res.data.success) {
        toast.success(t('employee.update.success'));
        setIsEditing(false);
      } else {
        toast.error(res.data.message || t('employee.update.error'));
      }
    } catch (error) {
      console.error('Error saving employee data:', error);

      if (isAxiosError(error)) {
        const message =
          error.response?.data?.message || 'Login failed. Please try again';
        toast.error(message);
      } else {
        toast.error('Login failed. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditData(employeeInfo);
    setIsEditing(false);
    // setShowDepartmentSearch(false);
    // setDepartmentSearch('');
    // setDepartmentSuggestions([]);
  };

  const currentFirstName = getNameParts(editData.fullName || '').firstName;
  const currentLastName = getNameParts(editData.fullName || '').lastName;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen p-6 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  {editData?.avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Pencil icon overlay */}
                <label
                  htmlFor="avatarUpload"
                  className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Pencil className="w-4 h-4" />
                </label>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* User Info */}
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{editData.fullName}</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span className="text-lg">ID: {editData.id}</span>
                  <span className="text-lg">•</span>
                  <span className="text-lg">{editData.identityNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Personal Information */}
              <div className="space-y-6">
                {/* Personal Info Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-6">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t('employee.personalInfo')}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.firstName')}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentFirstName}
                            onChange={(e) =>
                              handleNameChange('firstName', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                            {currentFirstName}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.lastName')}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={currentLastName}
                            onChange={(e) =>
                              handleNameChange('lastName', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                            {currentLastName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200 break-all">
                          {editData.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('employee.phone')}
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) =>
                            handleInputChange('phone', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                          {editData.phone}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {t('employee.dateOfBirth')}
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={
                              editData.dateOfBirth
                                ? new Date(editData.dateOfBirth)
                                    .toISOString()
                                    .split('T')[0]
                                : ''
                            }
                            onChange={(e) =>
                              handleInputChange('dateOfBirth', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        ) : (
                          <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                            {formatDateUTC(
                              editData.dateOfBirth?.toString() || '',
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.sex')}
                        </label>
                        {isEditing ? (
                          <select
                            value={editData.sex}
                            onChange={(e) =>
                              handleInputChange('sex', parseInt(e.target.value))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value={SexEnum.MALE}>Male</option>
                            <option value={SexEnum.FEMALE}>Female</option>
                            <option value={SexEnum.OTHER}>Other</option>
                          </select>
                        ) : (
                          <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                            {formatSex(editData.sex || 0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {t('employee.address')}
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editData.address}
                          onChange={(e) =>
                            handleInputChange('address', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          rows={3}
                        />
                      ) : (
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                          {editData.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Other Information */}
              <div className="space-y-6">
                {/* Work Information Section */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center mb-6">
                    <Building2 className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t('employee.otherInfo')}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.role')}
                        </label>
                        {isEditing ? (
                          <select
                            value={editData.roles?.[0] || RoleEnum.STAFF}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                roles: [Number(e.target.value) as RoleEnum],
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          >
                            <option value={RoleEnum.STAFF}>
                              {t('employee.roles.STAFF')}
                            </option>
                            <option value={RoleEnum.ADMIN}>
                              {t('employee.roles.ADMIN')}
                            </option>
                          </select>
                        ) : (
                          <div className="bg-purple-100 text-purple-800 px-4 py-3 rounded-lg text-sm font-medium border border-purple-200">
                            {editData.roles && editData.roles.length > 0
                              ? editData.roles
                                  .map((r) =>
                                    r === RoleEnum.ADMIN
                                      ? t('employee.roles.ADMIN')
                                      : t('employee.roles.STAFF'),
                                  )
                                  .join(', ')
                              : t('employee.roles.STAFF')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">
                    {t('common.Timestamps')}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.createdDate')}
                        </label>
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                          {formatDateUTC(editData.createdAt?.toString() || '')}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.lastUpdate')}
                        </label>
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                          {formatDateUTC(editData.updatedAt?.toString() || '')}
                        </div>
                      </div>
                    </div>

                    {editData.deletedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('employee.deletedDate')}
                        </label>
                        <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm text-red-700">
                          {formatDateUTC(editData.deletedAt?.toString() || '')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Information Section */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center mb-6">
                    <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t('auth.bankInfo')}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.bankAccount')}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.bankAccount || ''}
                          onChange={(e) =>
                            handleInputChange('bankAccount', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Enter bank account number"
                        />
                      ) : (
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200 font-mono">
                          {editData.bankAccount || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        {t('auth.bankName')}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.bankName || ''}
                          onChange={(e) =>
                            handleInputChange('bankName', e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Enter bank name"
                        />
                      ) : (
                        <div className="bg-white px-4 py-3 rounded-lg text-sm border border-gray-200">
                          {editData.bankName || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
            <div className="flex justify-between items-center">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                onClick={() => window.history.back()}
              >
                {t('common.back')}
              </button>

              <div className="flex space-x-3">
                {!isEditing && (
                  <button
                    onClick={() => router.push('/change-password')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                  >
                    {t('auth.changePassword')}
                  </button>
                )}
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                    >
                      {t('common.save')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
                  >
                    {t('common.update')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Modal */}
      <AvatarCropModal
        open={openPreview}
        previewUrl={previewUrl}
        crop={crop}
        zoom={zoom}
        setCrop={setCrop}
        setZoom={setZoom}
        onClose={() => {
          setOpenPreview(false);
          setFile(null);
          setPreviewUrl(null);
        }}
        onSave={(file: File) => handleSaveImage(file)}
      />
    </div>
  );
}
