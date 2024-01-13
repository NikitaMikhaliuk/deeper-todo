import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Route, withRouter } from 'react-router-dom';
import actionCreators from './actions';
import todoListReducer from './reducers/todoList';
import appViewReducer from './reducers/appView';
import { FC, useEffect, useMemo, useReducer, useRef } from 'react';
import { fromJS } from 'immutable';
import './App.css';
import UserContext from './contexts/userContext';
import { fetchTodoList } from './redux/slices/todoListSlice';
import { useAppDispatch, useAppSelector } from './hooks';

function reducer(state, action) {
    if (action.type === 'INITIAL_UPLOAD') {
        return { ...action.payload };
    }

    const todoList = todoListReducer(state.todoList, action);
    const appView = appViewReducer(state.appView, action);
    return { todoList, appView };
}

interface State {
    todoList: { toJS: () => object };
    appView: {
        toJS: () => Omit<State['appView'], 'toJS'>;
        showCompleted: boolean;
        filter: string;
        chosenCategoryId: string;
        chosenItemToEditId: string;
    };
}

function mapState(state: State) {
    return {
        todoList: state.todoList ? state.todoList.toJS() : null,
        showCompleted: state.appView.toJS().showCompleted,
        filter: state.appView.toJS().filter,
        chosenCategoryId: state.appView.toJS().chosenCategoryId,
        chosenItemToEditId: state.appView.toJS().chosenItemToEditId,
    };
}

const AppComponent: FC<{ location: string }> = ({ location }) => {
    const [state, reactDispatch] = useReducer(reducer, {
        appView: fromJS({
            chosenCategoryId: null,
            chosenItemToEditId: null,
            filter: '',
            showCompleted: false,
        }),
        todoList: fromJS(null),
    });

    const stateRef = useRef(state);
    stateRef.current = state;

    const username = window.location.pathname.split('/')[2];

    // redux logic
    const chosenCategoryId = useAppSelector((state) => state.appView.chosenCategoryId);
    const dispatch = useAppDispatch();
    // redux logic

    useEffect(() => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/api/users/${username}/get-todolist`, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (this.readyState !== 4) {
                return;
            }
            if (this.status !== 200) {
                return;
            }
            const todoList = JSON.parse(this.responseText);

            const normalizedCatStorage = {};
            const normalizedItemsStorage = {};
            for (const item of todoList.itemsStorage) {
                normalizedItemsStorage[item.id] = item;
            }
            for (const cat of todoList.categoriesStorage) {
                normalizedCatStorage[cat.id] = cat;
            }
            const normalizedTodoList = {
                ...todoList,
                categoriesStorage: normalizedCatStorage,
                itemsStorage: normalizedItemsStorage,
            };
            const uploadedState = {
                todoList: fromJS(normalizedTodoList),
                appView: fromJS({
                    chosenCategoryId: null,
                    chosenItemToEditId: null,
                    showCompleted: false,
                    filter: '',
                }),
            };
            reactDispatch({
                type: 'INITIAL_UPLOAD',
                payload: uploadedState,
            });

            // redux logic
            dispatch(fetchTodoList(username));
            // redux logic
        };
    }, [username]);

    const { todoList } = mapState(state);

    const actions = useMemo(() => {
        const result = {};
        for (const [actionName, actionCreator] of Object.entries(actionCreators)) {
            result[actionName] = (...args) => {
                const action = actionCreator(...args);
                if (action.type) {
                    reactDispatch(action);
                } else if (typeof action === 'function') {
                    action(reactDispatch, () => stateRef.current);
                }
            };
        }

        return result;
    }, [reactDispatch]);

    if (!todoList) {
        return <div>Loading</div>;
    }

    const chosenCategory = todoList.categoriesStorage[chosenCategoryId];
    return (
        <UserContext user={username}>
            <MuiThemeProvider muiTheme={getMuiTheme(MyTheme)}>
                <div>
                    <Route
                        render={(props: object) => (
                            <Header
                                {...props}
                                actions={actions}
                                currentLinkPath={
                                    chosenCategory
                                        ? chosenCategory.linkPath
                                        : location.pathname
                                }
                                undoDisabled={!todoList.prevState}
                                redoDisabled={!todoList.nextState}
                            />
                        )}
                    />
                    <div style={{ display: 'flex', height: '100%' }}>
                        <Route
                            render={() => (
                                <Sidebar
                                    actions={actions}
                                    root={todoList.root}
                                    categoriesStorage={todoList.categoriesStorage}
                                />
                            )}
                        />
                        <Route
                            path={todoList.root.linkPath}
                            render={(props: object) => (
                                <Main
                                    {...props}
                                    chosenCategory={chosenCategory}
                                    itemsStorage={todoList.itemsStorage}
                                    rootLinkpath={todoList.root.linkPath}
                                    actions={actions}
                                />
                            )}
                        />
                    </div>
                </div>
            </MuiThemeProvider>
        </UserContext>
    );
};

const App = withRouter(AppComponent);
export default App;
