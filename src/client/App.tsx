import './App.css';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import MyTheme from './Theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Route, withRouter } from 'react-router-dom';
import actions from './actions';

function AppComponent(appProps: any) {
    const {
        chosenCategoryId,
        chosenItemToEditId,
        todoList,
        actions,
        filter,
        showCompleted,
        location,
    } = appProps;
    const chosenCategory = todoList.categoriesStorage[chosenCategoryId];
    return (
        <MuiThemeProvider muiTheme={getMuiTheme(MyTheme)}>
            <div>
                <Route
                    render={(props: object) => (
                        <Header
                            {...props}
                            actions={actions}
                            filter={filter}
                            currentLinkPath={
                                chosenCategory
                                    ? chosenCategory.linkPath
                                    : location.pathname
                            }
                            showCompleted={showCompleted}
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
                                chosenItemToEditId={chosenItemToEditId}
                                root={todoList.root}
                                categoriesStorage={todoList.categoriesStorage}
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
    );
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

function mapStateToProps(state: State) {
    return {
        todoList: state.todoList.toJS(),
        showCompleted: state.appView.toJS().showCompleted,
        filter: state.appView.toJS().filter,
        chosenCategoryId: state.appView.toJS().chosenCategoryId,
        chosenItemToEditId: state.appView.toJS().chosenItemToEditId,
    };
}

function mapDispatchToProps(dispatch: unknown) {
    return {
        actions: bindActionCreators(actions, dispatch),
    };
}

const App = withRouter(
    connect(mapStateToProps, mapDispatchToProps)(AppComponent)
);
export default App;
