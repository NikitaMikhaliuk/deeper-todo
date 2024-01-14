import { useState } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import TodoCategoriesList from '../TodoCategoriesList/index.jsx';
import { getCategoriesRootPath, nameToUrl } from '../../utils';
import './index.css';
import { addTodoCategory } from '../../redux/slices/todoListSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';

export default function Sidebar() {
    const [newCategory, setNewCategory] = useState('');
    const dispatch = useAppDispatch();
    const username = useAppSelector((state) => state.todoList.user);

    function handleAddCategoryInput(e) {
        setNewCategory(e.target.value);
    }

    function submitCategoryAdd() {
        if (newCategory) {
            const name = newCategory;
            const linkPath = getCategoriesRootPath(username) + nameToUrl(name);
            dispatch(
                addTodoCategory({
                    id: crypto.randomUUID(),
                    name,
                    completed: false,
                    visible: true,
                    linkPath,
                    parentCategoryId: 'root',
                })
            );
            setNewCategory('');
        }
    }

    return (
        <aside className='b-aside'>
            <Paper
                zDepth={1}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            >
                <div className='b-aside__add-cat-input-form'>
                    <TextField
                        type='text'
                        hintText='Enter Category Title'
                        style={{ margin: '5px' }}
                        id={'2'}
                        value={newCategory}
                        onChange={handleAddCategoryInput}
                    />
                    <FlatButton label='Add' onClick={submitCategoryAdd} />
                </div>
                <TodoCategoriesList />
            </Paper>
        </aside>
    );
}
