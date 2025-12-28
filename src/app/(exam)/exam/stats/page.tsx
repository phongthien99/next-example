"use client";

/**
 * Statistics Page
 * View detailed exam statistics and analytics
 */
export default function StatisticsPage() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Statistics
        </h1>
        <p className="text-gray-600 mb-6">
          Analyze your performance and identify areas for improvement
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Total Exams
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Average Score
            </div>
            <div className="text-3xl font-bold text-blue-600">-</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Best Score
            </div>
            <div className="text-3xl font-bold text-green-600">-</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Study Time
            </div>
            <div className="text-3xl font-bold text-gray-900">0h</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Chart will appear here after completing exams
          </div>
        </div>
      </div>
    </div>
  );
}
