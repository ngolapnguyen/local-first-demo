const apiFetch = async (
  url: string,
  options: {
    body?: any;
    method: "GET" | "POST";
    headers?: Record<string, string>;
  }
) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SERVER_API}/${url}`, {
      ...options,
      credentials: "include", // Ensure cookies are sent
    });

    return await response.json();
  } catch (error: unknown) {
    console.error("Fetch error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error };
    }
  }
};

export default apiFetch;
