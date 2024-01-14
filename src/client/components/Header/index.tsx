import { ChangeEvent, FC, useState } from 'react';
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
import { getProgress } from '../../redux/slices/todoItemsSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { getCanRedo, getCanUndo, redo, undo } from '../../redux/slices/todoListSlice';
import { setFilter, toggleShowCompleted } from '../../redux/slices/appViewSlice';

type Props = {
    currentLinkPath: string;
};

const Header: FC<Props> = ({ currentLinkPath }) => {
    const [filter, setFilterValue] = useState('');
    const progress = useAppSelector(getProgress);
    const canUndo = useAppSelector(getCanUndo);
    const canRedo = useAppSelector(getCanRedo);
    const dispatch = useAppDispatch();

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFilterValue(e.target.value);
    };

    const handleShowDoneCheck = () => {
        dispatch(toggleShowCompleted());
    };

    const handleSubmitFilter = () => {
        dispatch(setFilter(filter));
    };

    const handleUndoClick = () => {
        dispatch(undo());
    };

    const handleRedoClick = () => {
        dispatch(redo());
    };

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
                value={progress}
                style={{ marginBottom: '10px' }}
            />
            <div className='b-header__control-panel'>
                <div>
                    <RaisedButton
                        label='UNDO'
                        onClick={handleUndoClick}
                        style={{ margin: ' 0 10px' }}
                        disabled={!canUndo}
                        icon={<Undo />}
                    />
                    <RaisedButton
                        label='REDO'
                        labelPosition='before'
                        onClick={handleRedoClick}
                        style={{ margin: '0 10px' }}
                        disabled={!canRedo}
                        icon={<Redo />}
                    />
                </div>
                <div>
                    <Checkbox label='Show done' onCheck={handleShowDoneCheck} />
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
                        to={currentLinkPath + (filter ? `&filter=${filter}` : '')}
                    >
                        <FlatButton onClick={handleSubmitFilter} label='Search' />
                    </Link>
                </div>
            </div>
            <Divider />
        </header>
    );
};

export default Header;
