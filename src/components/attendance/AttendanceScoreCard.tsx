export default function AttendanceScoreCard({ score }: { score: number }) {

  return (

    <div className="border rounded-lg p-6 bg-white">

      <h2 className="text-lg font-semibold mb-2">
        Attendance Score
      </h2>

      <div className="text-4xl font-bold text-green-600">
        {score}%
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Based on your recorded attendance.
      </p>

    </div>
  )
}