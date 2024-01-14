import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const appViewSlice = createSlice({
    name: 'appView',
    initialState: {
        chosenCategoryId: '',
        chosenItemToEditId: '',
        showCompleted: false,
        filter: '',
    },
    reducers: {
        chooseCategory: (state, action: PayloadAction<string>) => {
            state.chosenCategoryId = action.payload;
        },
        chooseItemToEdit: (state, action: PayloadAction<string>) => {
            state.chosenItemToEditId = action.payload;
        },
        toggleShowCompleted: (state) => {
            state.showCompleted = !state.showCompleted;
        },
        setFilter: (state, action: PayloadAction<string>) => {
            state.filter = action.payload;
        },
    },
});

export default appViewSlice.reducer;

export const { chooseCategory, chooseItemToEdit, toggleShowCompleted, setFilter } =
    appViewSlice.actions;
