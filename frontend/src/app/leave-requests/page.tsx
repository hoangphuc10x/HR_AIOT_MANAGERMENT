'use client';
import LeaveRequestForm from '@/components/leave-request/leaveRequestForm';
import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
} from 'lucide-react';
import axios from '@/lib/axios';
import { getDecodedToken } from '@/lib/getDecodedToken';
import { toast } from 'react-toastify';

enum LeaveType {
  Annual = 1,
  Sick = 2,
  Unpaid = 3,
  Other = 4,
}

enum RequestStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
  CANCELLED = 4,
}
interface LeaveRequest {
  id: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: RequestStatus;
  reason: string;
  appliedDate: string;
}

const leaveTypeColors = {
  [LeaveType.Annual]: 'bg-blue-100 text-blue-800 border-blue-200',
  [LeaveType.Sick]: 'bg-red-100 text-red-800 border-red-200',
  [LeaveType.Unpaid]: 'bg-gray-100 text-gray-800 border-gray-200',
  [LeaveType.Other]: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusColors = {
  [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [RequestStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
  [RequestStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
  [RequestStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons = {
  [RequestStatus.PENDING]: AlertCircle,
  [RequestStatus.APPROVED]: CheckCircle,
  [RequestStatus.REJECTED]: XCircle,
  [RequestStatus.CANCELLED]: XCircle,
};

export default function LeaveRequestPage() {
  const { t } = useTranslation();
  const [showLeaveForm, setShowLeaveForm] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const decoded = getDecodedToken();
  const userId = decoded?.userId;
  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<{ data: LeaveRequest[] }>(
        `/leave-request/user/${userId}`,
      );
      setLeaveRequests(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchLeaveRequests();
  }, [userId]);

  // Stats
  const stats = useMemo(() => {
    const totalDays = leaveRequests.reduce((acc, req) => acc + req.days, 0);
    const approvedDays = leaveRequests
      .filter((req) => req.status === RequestStatus.APPROVED)
      .reduce((acc, req) => acc + req.days, 0);
    const pendingRequests = leaveRequests.filter(
      (req) => req.status === RequestStatus.PENDING,
    ).length;

    return {
      totalRequests: leaveRequests.length,
      totalDays,
      approvedDays,
      pendingRequests,
      remainingBalance: 25 - approvedDays,
    };
  }, [leaveRequests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((req) => {
      const matchesSearch =
        req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toString().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === null || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, searchTerm, statusFilter]);

  const getLeaveTypeName = (type: LeaveType) => {
    switch (type) {
      case LeaveType.Annual:
        return 'Annual Leave';
      case LeaveType.Sick:
        return 'Sick Leave';
      case LeaveType.Unpaid:
        return 'Unpaid Leave';
      case LeaveType.Other:
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  return (
    <div className="flex flex-col gap-6 relative p-6 h-full bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t('leaveRequest.title') || 'Leave Management'}
            </h1>
            <p className="text-gray-600">
              Manage your time off requests and view your leave history
            </p>
          </div>
          <button
            className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2"
            onClick={() => setShowLeaveForm(true)}
          >
            <Plus
              size={20}
              className="transition-transform group-hover:rotate-90 duration-300"
            />
            <span className="font-medium">
              {t('leaveRequest.newLeaveRequest') || 'New Leave Request'}
            </span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: 'Total Requests',
              value: stats.totalRequests,
              icon: FileText,
              color: 'bg-blue-500',
              bgColor: 'bg-blue-50',
            },
            {
              label: 'Days Taken',
              value: stats.approvedDays,
              icon: Calendar,
              color: 'bg-green-500',
              bgColor: 'bg-green-50',
            },
            {
              label: 'Days Remaining',
              value: stats.remainingBalance,
              icon: Clock,
              color: 'bg-purple-500',
              bgColor: 'bg-purple-50',
            },
            {
              label: 'Pending',
              value: stats.pendingRequests,
              icon: AlertCircle,
              color: 'bg-yellow-500',
              bgColor: 'bg-yellow-50',
            },
            {
              label: 'Approval Rate',
              value: `${
                leaveRequests.length > 0
                  ? Math.round(
                      (leaveRequests.filter(
                        (r) => r.status === RequestStatus.APPROVED,
                      ).length /
                        leaveRequests.length) *
                        100,
                    )
                  : 0
              }%`,
              icon: TrendingUp,
              color: 'bg-indigo-500',
              bgColor: 'bg-indigo-50',
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:shadow-md`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search leave requests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter ?? ''}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
            >
              <option value="">All Status</option>
              <option value={RequestStatus.PENDING}>Pending</option>
              <option value={RequestStatus.APPROVED}>Approved</option>
              <option value={RequestStatus.REJECTED}>Rejected</option>
              <option value={RequestStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={20} />
            Recent Leave Requests
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {filteredRequests.length}
            </span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No leave requests found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm || statusFilter !== null
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first leave request to get started'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request, index) => {
              const StatusIcon = statusIcons[request.status];
              return (
                <div
                  key={request.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 50}ms both`,
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${leaveTypeColors[request.type]}`}
                        >
                          {getLeaveTypeName(request.type)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]} flex items-center gap-1`}
                        >
                          <StatusIcon size={14} />
                          {RequestStatus[request.status]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {request.reason}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(request.startDate)} -{' '}
                        {formatDate(request.endDate)}
                        <span className="mx-2">•</span>
                        {request.days} day{request.days > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Applied on {formatDate(request.appliedDate)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {request.id}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showLeaveForm && (
        <LeaveRequestForm
          fetchData={fetchLeaveRequests}
          setShowModal={setShowLeaveForm}
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
