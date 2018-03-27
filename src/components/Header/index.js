import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import LinearProgress from 'material-ui/LinearProgress';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import Undo from 'material-ui/svg-icons/content/undo';
import Redo from 'material-ui/svg-icons/content/redo';
import List from 'material-ui/svg-icons/action/list';
import ExitToApp from 'material-ui/svg-icons/action/exit-to-app';
import HeaderIconButton from './HeaderIconButton';
import './index.css';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: ''
    }
  }

  componentDidMount() {
    this.setState({
      filter: this.props.filter
    })
  }

  handleFilterChange = (evt) => {
    this.setState({
      filter: evt.target.value
    })
  }

  handleShowDoneCheck = (evt, isChecked) => {
    this.props.actions.ToggleShowCompleted(isChecked)
  }

  handleSubmitFilter = () => {
    this.props.actions.ApplyFilter(this.state.filter)
  }

  handleUndoClick = () => {
    this.props.actions.Undo();
  }

  handleRedoClick = () => {
    this.props.actions.Redo();
  }

  render() {
    const completed = this.props.progress * 100;
    const exitButton = (
      <a href={`${window.location.origin}/logout`}>
        <HeaderIconButton>
          <ExitToApp/>
        </HeaderIconButton>
      </a>);
    const homeButton = (
      <HeaderIconButton>
        <List/>
      </HeaderIconButton>
    );
    return (
      <header className='b-header'>
        <AppBar
        title={<span>DeeperTodo</span>}
        titleStyle={{margin: 'auto 10px'}}
        iconElementLeft={homeButton}
        iconStyleLeft={{margin: 'auto 10px'}}
        iconElementRight={exitButton}
        iconStyleRight={{margin: 'auto 0'}}>
        </AppBar>
        <Subheader>Total progerss</Subheader>
        <LinearProgress mode='determinate' value={completed} style={{marginBottom: '10px'}} />
        <div className='b-header__control-panel'>
          <div>
            <RaisedButton
              label='UNDO'
              onClick={this.handleUndoClick}
              style={{margin: ' 0 10px'}}
              disabled={this.props.undoDisabled}
              icon={<Undo />} />
            <RaisedButton
              label='REDO'
              labelPosition='before'
              onClick={this.handleRedoClick}
              style={{margin: '0 10px'}}
              disabled={this.props.redoDisabled} 
              icon={<Redo />} />
          </div>
          <div>
            <Checkbox
              checked={this.props.showCompleted}
              label='Show done'
              onCheck={this.handleShowDoneCheck}/>            
            <TextField
              type='search'
              placeholder='Filter'
              value={this.state.filter}
              onChange={this.handleFilterChange}
              inputStyle={{
                fontSize: '110%'
              }}
              id={'1'}/>
            <Link style={{ color: 'inherit', textDecoration: 'none',}} 
              to={this.props.currentLinkPath + (this.state.filter ? `&filter=${this.state.filter}` : '')}>
              <FlatButton 
                onClick={this.handleSubmitFilter}
                label='Search'/>
            </Link>
          </div>
        </div>
        <Divider />
      </header>
    );
  }
}