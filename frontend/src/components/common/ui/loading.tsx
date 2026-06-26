export function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
