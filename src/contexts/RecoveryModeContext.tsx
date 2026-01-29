import { createContext, useContext } from "react";

export const RecoveryModeContext = createContext<boolean>(false);

export function useRecoveryMode() {
  return useContext(RecoveryModeContext);
}
