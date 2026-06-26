export const getStatusText = (status: string, t: (key: string) => string) => {
  switch (status) {
    case 'on_time':
      return t('attendance.attendanceStatus.on_time');
    case 'late':
      return t('attendance.attendanceStatus.late');
    case 'early_leave':
      return t('attendance.attendanceStatus.early_leave');
    case 'absent':
      return t('attendance.attendanceStatus.absent');
    case 'on_leave':
      return t('attendance.attendanceStatus.on_leave');
    case 'late_and_early_leave':
      return t('attendance.attendanceStatus.late_and_early_leave');
    default:
      return t('attendance.attendanceStatus.not_started');
  }
};
