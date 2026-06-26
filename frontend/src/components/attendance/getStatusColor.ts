export const getStatusColor = (status: string) => {
  switch (status) {
    case 'on_time':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'late':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'early_leave':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'absent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'working':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'on_leave':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'late_and_early_leave':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
