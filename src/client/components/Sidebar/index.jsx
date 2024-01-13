import { useState } from 'react';
import { Route } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import TodoCategoriesList from '../TodoCategoriesList/index.jsx';
import { nameToUrl } from '../../utils';
import './index.css';

export default function Sidebar({ actions, root, categoriesStorage }) {
    const [newCategory, setNewCategory] = useState('');

    function handleAddCategoryInput(e) {
        setNewCategory(e.target.value);
    }

    function submitCategoryAdd() {
        if (newCategory) {
            const name = newCategory;
            const linkPath = root.linkPath + nameToUrl(name);
            actions.AddCategory('root', name, crypto.randomUUID(), linkPath);
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
                <Route
                    render={(props) => (
                        <TodoCategoriesList
                            {...props}
                            actions={actions}
                            root={root}
                            categoriesStorage={categoriesStorage}
                        />
                    )}
                />
            </Paper>
        </aside>
    );
}
