const UnauthorizedPage = () => {
  return (
    <div className="h-[600px] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">⚠️Unauthorized</h1>
      <p className="mt-2 text-md ">
        You do not have permission to access this page.
      </p>
      <br />
      <a
        href="/protected/active-learning"
        className="mt-4 text-blue-500 hover:underline"
      >
        <b>Return to Homepage</b>
      </a>
    </div>
  );
};

export default UnauthorizedPage;
