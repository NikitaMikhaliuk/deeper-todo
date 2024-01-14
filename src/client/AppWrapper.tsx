import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from './redux/store';
import App from './App';

const AppWrapper = () => (
    <Provider store={store}>
        <Router>
            <App />
        </Router>
    </Provider>
);

export default AppWrapper;
