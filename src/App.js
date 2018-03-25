import React, { Component } from 'react';
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


class App extends Component {

  render() {
    const { chosenCategoryId, chosenItemToEditId, todoList, actions, filter, showCompleted } = this.props;
    const chosenCategory = todoList.categoriesStorage[chosenCategoryId];
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(MyTheme)}>
        <div>
          <Route render={(props) => (
            <Header
              {...props}
              actions={actions}
              filter={filter}
              currentLinkPath={chosenCategory ? chosenCategory.linkPath : this.props.location.pathname }
              showCompleted={showCompleted}
              progress={todoList.totalProgress}
              undoDisabled={!todoList.prevState}
              redoDisabled={!todoList.nextState} />
          )} />
          <div style={{display: 'flex'}}>
            <Route render={() => (
              <Sidebar 
                actions={actions}
                chosenItemToEditId={chosenItemToEditId}
                root={todoList.root}
                categoriesStorage={todoList.categoriesStorage}
                showCompleted={showCompleted}
                filter={filter} />
            )} />
            <Route path={todoList.root.linkPath} render={(props) => (
              <Main 
                {...props}
                chosenCategory={chosenCategory}
                chosenCategoryId={chosenCategoryId}
                chosenItemToEditId={chosenItemToEditId}
                itemsStorage={todoList.itemsStorage}
                rootLinkpath={todoList.root.linkPath}
                actions={actions}
                filter={filter}
                showCompleted={showCompleted} />
            )} />
          </div>
        </div>        
      </MuiThemeProvider>
    );
  }
}

function mapStateToProps (state) {
  return {
    todoList: state.todoList.toJS(),
    showCompleted: state.appView.toJS().showCompleted,
    filter: state.appView.toJS().filter,
    chosenCategoryId: state.appView.toJS().chosenCategoryId,
    chosenItemToEditId: state.appView.toJS().chosenItemToEditId,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
