import { createContext, useState } from "react";

const ResidentContext = createContext();

export const ResidentProvider = ({ children }) => {
  const [editingID, setEditingID] = useState(null);
  const [deletingID, setDeletingID] = useState(null);

  return (
    <ResidentContext.Provider
      value={{ editingID, setEditingID, deletingID, setDeletingID }}
    >
      {children}
    </ResidentContext.Provider>
  );
};

export { ResidentContext };
