const Home = () => {
  return (
    <main class="w-full max-w-md mt-6 bg-white rounded-lg shadow-md p-4">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">
          Welcome to the Local First To-Do App!
        </h2>
        <p class="mt-2 text-gray-700">
          This application is designed to help you manage your tasks
          efficiently. It uses a local-first approach to ensure your data is
          always available, even when you're offline. The tech stack includes:
        </p>
        <ul class="list-disc list-inside mt-2 text-gray-700">
          <li>
            <strong>SolidJS:</strong> A declarative, efficient, and flexible
            JavaScript library for building user interfaces.
          </li>
          <li>
            <strong>Express:</strong> A minimal and flexible Node.js web
            application framework that provides a robust set of features for web
            and mobile applications.
          </li>
          <li>
            <strong>MongoDB:</strong> A source-available cross-platform
            document-oriented database program. Classified as a NoSQL database
            program, MongoDB uses JSON-like documents with optional schemas.
          </li>
        </ul>
        <p class="mt-2 text-gray-700">
          You can start by adding your tasks below. Click on a task to mark it
          as completed or not completed.
        </p>
      </div>
    </main>
  );
};

export default Home;
