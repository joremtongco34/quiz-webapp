import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold text-gray-800 mb-4">
            Quiz App
          </h1>
          <p className="text-lg text-gray-600">
            Create or join a real-time quiz session
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-4">
            <Link
              href="/host"
              className="block w-full px-8 py-4 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-all duration-200 text-center shadow-sm hover:shadow-md"
            >
              Create Quiz
            </Link>
            <div className="text-center text-sm text-gray-500 py-2">
              or join as participant with a quiz code
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

