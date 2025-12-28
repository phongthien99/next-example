"use client";

/**
 * Timed Test Page
 * Full exam with strict time limits
 */
export default function TimedTestPage() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Timed Test
        </h1>
        <p className="text-gray-600 mb-6">
          Take a full TOEIC exam with official time limits
        </p>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="test-duration" className="block text-sm font-medium text-gray-700 mb-2">
                Test Duration
              </label>
              <select id="test-duration" className="w-full border rounded-md p-2">
                <option>120 minutes (Full TOEIC)</option>
                <option>60 minutes (Half Test)</option>
                <option>30 minutes (Quick Test)</option>
              </select>
            </div>

            <div>
              <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select id="num-questions" className="w-full border rounded-md p-2">
                <option>200 questions (Full TOEIC)</option>
                <option>100 questions (Half Test)</option>
                <option>50 questions (Quick Test)</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
              Start Timed Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
