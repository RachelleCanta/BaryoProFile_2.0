import { createContext, useState } from "react";

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [page, setPage] = useState({
    prev: "",
    current: "",
  });

  return <PageContext.Provider value={{}}>{children}</PageContext.Provider>;
};

export { PageContext };
