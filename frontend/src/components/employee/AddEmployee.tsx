'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { RoleEnum } from '@/enums/role.enum';
import { SexEnum } from '@/enums/sex.enum';
import { UserStatus } from '@/enums/user-status.enum';
import { CreateUserInterface } from '@/types/employee/createUser.interface';
import { availablePermissions } from './availablePermission';
import PermissionSections from './PermissionSection';

interface CreateUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserInterface) => Promise<void>;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  isOpen,
  onClose,
  onSubmit = () => Promise.resolve(),
}) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateUserInterface>({
    fullName: '',
    identityNumber: '',
    address: '',
    email: '',
    phone: '',
    sex: SexEnum.MALE,
    dateOfBirth: '',
    userRoles: RoleEnum.STAFF,
    status: UserStatus.INACTIVE,
    avatarUrl: '',
    bankAccount: '',
    bankName: '',
    userPermissions: [], //userPermissions
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserInterface | 'general', string>>
  >({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        identityNumber: '',
        address: '',
        email: '',
        phone: '',
        sex: SexEnum.MALE,
        dateOfBirth: '',
        userRoles: RoleEnum.STAFF,
        status: UserStatus.INACTIVE,
        avatarUrl: '',
        bankAccount: '',
        bankName: '',
        userPermissions: [],
      });
      setErrors({});
    }
  }, [isOpen]);
  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserInterface, string>> = {};

    if (
      !formData.fullName ||
      formData.fullName.length < 2 ||
      formData.fullName.length > 255
    ) {
      newErrors.fullName =
        t('validation.fullNameLength') ||
        'Full name must be between 2 and 255 characters';
    } else if (!/^[\p{L}\s]+$/u.test(formData.fullName)) {
      newErrors.fullName =
        t('validation.fullNameInvalid') ||
        'Full name must only contain letters and spaces';
    }

    if (!/^\d{12}$/.test(formData.identityNumber)) {
      newErrors.identityNumber =
        t('validation.identityNumber') ||
        'Identity number must be exactly 12 digits';
    }

    if (!formData.address) {
      newErrors.address =
        t('validation.addressRequired') || 'Address is required';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid') || 'Invalid email format';
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone =
        t('validation.phoneInvalid') || 'Phone number must be 10 digits';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth =
        t('validation.dateOfBirthRequired') || 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        newErrors.dateOfBirth =
          t('validation.dateOfBirthUnder18') ||
          'You must be at least 18 years old';
      }
    }

    if (formData.bankAccount && formData.bankAccount.length > 20) {
      newErrors.bankAccount =
        t('validation.bankAccountLength') ||
        'Bank account must not exceed 20 characters';
    }

    if (formData.bankName && formData.bankName.length > 100) {
      newErrors.bankName =
        t('validation.bankNameLength') ||
        'Bank name must not exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSubmit(formData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (typeof err === 'object') {
        setErrors(err); // err maybe { email: "Email already exists" }
      } else {
        setErrors({ general: 'Unexpected error occurred' });
      }
    }
    setIsLoading(false);
  };

  const handleChange = (
    field: keyof CreateUserInterface,
    value: string | SexEnum | RoleEnum | UserStatus | number[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionChange = (permissionId: number) => {
    setFormData((prev) => {
      const currentPermissions = prev.userPermissions || [];
      if (currentPermissions.includes(permissionId)) {
        return {
          ...prev,
          userPermissions: currentPermissions.filter(
            (id) => id !== permissionId,
          ),
        };
      } else {
        return {
          ...prev,
          userPermissions: [...currentPermissions, permissionId],
        };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header with Close Button */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold pr-12">
            {t('employee.createEmployee') || 'Create New User'}
          </h2>
          <p className="text-blue-100 mt-1">
            {t('employee.addEmployeeDescription')}
          </p>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Personal Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                👤 {t('employee.personalInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.fullName') || 'Full Name'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.fullName
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={
                      t('employee.fullNamePlaceholder') || 'Enter full name'
                    }
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Identity Number */}
                <div>
                  <label
                    htmlFor="identityNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.identityNumber') || 'Identity Number'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="identityNumber"
                    type="text"
                    value={formData.identityNumber}
                    onChange={(e) =>
                      handleChange('identityNumber', e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.identityNumber
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="123456789012"
                  />
                  {errors.identityNumber && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.identityNumber}
                    </p>
                  )}
                </div>

                {/* Sex */}
                <div>
                  <label
                    htmlFor="sex"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.sex') || 'Sex'}
                  </label>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) =>
                      handleChange('sex', parseInt(e.target.value) as SexEnum)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value={SexEnum.MALE}>
                      {t('employee.male') || 'Male'}
                    </option>
                    <option value={SexEnum.FEMALE}>
                      {t('employee.female') || 'Female'}
                    </option>
                    <option value={SexEnum.OTHER}>
                      {t('employee.other') || 'Other'}
                    </option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.dateOfBirth') || 'Date of Birth'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth.split('T')[0]}
                    onChange={(e) =>
                      handleChange('dateOfBirth', `${e.target.value}T00:00:00Z`)
                    }
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.dateOfBirth
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                📞 {t('employee.contactInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.email') || 'Email'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="example@domain.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.phone') || 'Phone'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="0329526357"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Address - Full width */}
              <div className="mt-6">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t('employee.address') || 'Address'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.address
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder={
                    t('employee.addressPlaceholder') || 'Enter complete address'
                  }
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    ⚠️ {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* System Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ⚙️ {t('employee.systemInfo')}
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Role */}
                <div>
                  <label
                    htmlFor="userRoles"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.role') || 'Role'}
                  </label>
                  <select
                    id="userRoles"
                    value={formData.userRoles}
                    onChange={(e) =>
                      handleChange(
                        'userRoles',
                        parseInt(e.target.value) as RoleEnum,
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value={RoleEnum.ADMIN}>
                      {t('common.admin') || 'Admin'}
                    </option>
                    <option value={RoleEnum.STAFF}>
                      {t('common.staff') || 'Staff'}
                    </option>
                  </select>
                </div>
                {/* Permissions */}
                <PermissionSections
                  availablePermissions={availablePermissions}
                  formData={formData}
                  handlePermissionChange={handlePermissionChange}
                  t={t}
                />
                {/* Bank Account - Full width */}
                <div>
                  <label
                    htmlFor="bankAccount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.bankAccount') || 'Bank Account'}{' '}
                    <span className="text-gray-500">
                      ({t('common.optional')})
                    </span>
                  </label>
                  <input
                    id="bankAccount"
                    type="text"
                    value={formData.bankAccount || ''}
                    onChange={(e) =>
                      handleChange('bankAccount', e.target.value)
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.bankAccount
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="12345678901234567890"
                  />
                  {errors.bankAccount && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.bankAccount}
                    </p>
                  )}
                </div>

                {/* Bank Name - Full width */}
                <div>
                  <label
                    htmlFor="bankName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t('employee.bankName') || 'Bank Name'}{' '}
                    <span className="text-gray-500">
                      ({t('common.optional')})
                    </span>
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    value={formData.bankName || ''}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.bankName
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Bank of Example"
                  />
                  {errors.bankName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      ⚠️ {errors.bankName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer with Submit Button - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-3 font-medium rounded-lg transition-all transform focus:outline-none focus:ring-2 shadow-lg
                ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('common.loading') || 'Loading...'}</span>
                </div>
              ) : (
                t('common.add') || 'Create User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
