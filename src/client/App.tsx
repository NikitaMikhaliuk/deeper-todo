import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Route, withRouter } from 'react-router-dom';
import { FC, useEffect } from 'react';
import './App.css';
import UserContext from './contexts/userContext';
import { fetchTodoList } from './redux/slices/todoListSlice';
import { useAppDispatch, useAppSelector } from './hooks';
import { getCategoryById } from './redux/slices/todoCategoriesSlice';
import { getCategoriesRootPath } from './utils';

const AppComponent: FC<{ location: Location }> = ({ location }) => {
    const username = location.pathname.split('/')[2];

    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const chosenCategory = useAppSelector((state) =>
        getCategoryById(state, chosenCategoryId)
    );
    const loading = useAppSelector((state) => state.todoList.loading);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchTodoList(username));
    }, [username, dispatch]);

    if (loading) {
        return <div>Loading</div>;
    }

    return (
        <UserContext user={username}>
            <MuiThemeProvider muiTheme={getMuiTheme(MyTheme)}>
                <>
                    <Route
                        render={(props: object) => (
                            <Header
                                {...props}
                                currentLinkPath={
                                    chosenCategory
                                        ? chosenCategory.linkPath
                                        : location.pathname
                                }
                            />
                        )}
                    />
                    <div style={{ display: 'flex', height: '100%' }}>
                        <Route render={() => <Sidebar />} />
                        <Route
                            path={getCategoriesRootPath(username)}
                            render={(props: object) => <Main {...props} />}
                        />
                    </div>
                </>
            </MuiThemeProvider>
        </UserContext>
    );
};

const App = withRouter(AppComponent);
export default App;
