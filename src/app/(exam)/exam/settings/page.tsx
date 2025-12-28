"use client";

/**
 * Exam Settings Page
 * Configure exam preferences and options
 */
export default function ExamSettingsPage() {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Exam Settings
        </h1>
        <p className="text-gray-600 mb-6">
          Customize your exam experience
        </p>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    Auto-save answers
                  </label>
                  <p className="text-sm text-gray-500">
                    Automatically save your answers as you work
                  </p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    Show timer
                  </label>
                  <p className="text-sm text-gray-500">
                    Display countdown timer during exam
                  </p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">
                    Enable keyboard shortcuts
                  </label>
                  <p className="text-sm text-gray-500">
                    Use keyboard to navigate questions
                  </p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default exam duration
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>120 minutes</option>
                  <option>90 minutes</option>
                  <option>60 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions per page
                </label>
                <select className="w-full border rounded-md p-2">
                  <option>1 question</option>
                  <option>5 questions</option>
                  <option>10 questions</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
              Reset to defaults
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
