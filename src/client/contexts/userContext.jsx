import { createContext, useContext } from 'react';

const UserContext = createContext(null);

function useUserContext() {
    return useContext(UserContext);
}

export default function UserContextProvider({ children, user }) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
