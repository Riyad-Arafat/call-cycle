import React from "react";
import { GlobalContext } from "@context/Global";

export const useGlobal = () => React.useContext(GlobalContext);

export default useGlobal;
