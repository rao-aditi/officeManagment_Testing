export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e) => e.msg || e.message).join(", ");
  }
  return data?.message || error?.message || fallback;
};
