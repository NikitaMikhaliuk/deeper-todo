import { useState } from 'react';
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
import HeaderIconButton from './HeaderIconButton.jsx';
import './index.css';

export default function Header({
    actions,
    currentLinkPath,
    progress,
    undoDisabled,
    redoDisabled,
}) {
    const [filter, setFilter] = useState('');

    function handleFilterChange(e) {
        setFilter(e.target.value);
    }

    function handleShowDoneCheck(e, isChecked) {
        actions.ToggleShowCompleted(isChecked);
    }

    function handleSubmitFilter() {
        actions.ApplyFilter(filter);
    }

    function handleUndoClick() {
        actions.Undo();
    }

    function handleRedoClick() {
        actions.Redo();
    }

    const completed = progress * 100;
    const exitButton = (
        <a href={`${window.location.origin}/logout`}>
            <HeaderIconButton>
                <ExitToApp />
            </HeaderIconButton>
        </a>
    );
    const homeButton = (
        <HeaderIconButton>
            <List />
        </HeaderIconButton>
    );
    return (
        <header className='b-header'>
            <AppBar
                title={<span>DeeperTodo</span>}
                titleStyle={{ margin: 'auto 10px' }}
                iconElementLeft={homeButton}
                iconStyleLeft={{ margin: 'auto 10px' }}
                iconElementRight={exitButton}
                iconStyleRight={{ margin: 'auto 0' }}
            ></AppBar>
            <Subheader>Total progress</Subheader>
            <LinearProgress
                mode='determinate'
                value={completed}
                style={{ marginBottom: '10px' }}
            />
            <div className='b-header__control-panel'>
                <div>
                    <RaisedButton
                        label='UNDO'
                        onClick={handleUndoClick}
                        style={{ margin: ' 0 10px' }}
                        disabled={undoDisabled}
                        icon={<Undo />}
                    />
                    <RaisedButton
                        label='REDO'
                        labelPosition='before'
                        onClick={handleRedoClick}
                        style={{ margin: '0 10px' }}
                        disabled={redoDisabled}
                        icon={<Redo />}
                    />
                </div>
                <div>
                    <Checkbox
                        // checked={props.showCompleted}
                        label='Show done'
                        onCheck={handleShowDoneCheck}
                    />
                    <TextField
                        type='search'
                        placeholder='Filter'
                        value={filter}
                        onChange={handleFilterChange}
                        inputStyle={{
                            fontSize: '110%',
                        }}
                        id={'1'}
                    />
                    <Link
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        to={
                            currentLinkPath +
                            (filter ? `&filter=${filter}` : '')
                        }
                    >
                        <FlatButton
                            onClick={handleSubmitFilter}
                            label='Search'
                        />
                    </Link>
                </div>
            </div>
            <Divider />
        </header>
    );
}
