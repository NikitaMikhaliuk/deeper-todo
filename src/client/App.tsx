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
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { fromJS } from 'immutable';
import './App.css';
import UserContext from './contexts/userContext';

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

function AppComponent({ location }: any) {
    const [state, dispatch] = useReducer(reducer, {
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
            dispatch({
                type: 'INITIAL_UPLOAD',
                payload: uploadedState,
            });
        };
    }, [username]);

    const {
        chosenCategoryId,
        chosenItemToEditId,
        filter,
        showCompleted,
        todoList,
    } = mapState(state);

    const actions = useMemo(() => {
        const result = {};
        for (const [actionName, actionCreator] of Object.entries(
            actionCreators
        )) {
            result[actionName] = (...args) => {
                const action = actionCreator(...args);
                if (action.type) {
                    dispatch(action);
                } else if (typeof action === 'function') {
                    action(dispatch, () => stateRef.current);
                }
            };
        }

        return result;
    }, [dispatch]);

    if (!todoList) {
        return <div>Loading</div>;
    }

    console.log(todoList);
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
                                progress={todoList.totalProgress}
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
                                    chosenCategoryId={chosenCategoryId}
                                    chosenItemToEditId={chosenItemToEditId}
                                    root={todoList.root}
                                    categoriesStorage={
                                        todoList.categoriesStorage
                                    }
                                    showCompleted={showCompleted}
                                    filter={filter}
                                />
                            )}
                        />
                        <Route
                            path={todoList.root.linkPath}
                            render={(props: object) => (
                                <Main
                                    {...props}
                                    chosenCategory={chosenCategory}
                                    chosenCategoryId={chosenCategoryId}
                                    chosenItemToEditId={chosenItemToEditId}
                                    itemsStorage={todoList.itemsStorage}
                                    rootLinkpath={todoList.root.linkPath}
                                    actions={actions}
                                    filter={filter}
                                    showCompleted={showCompleted}
                                />
                            )}
                        />
                    </div>
                </div>
            </MuiThemeProvider>
        </UserContext>
    );
}

const App = withRouter(AppComponent);
export default App;
