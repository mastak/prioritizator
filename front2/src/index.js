import ReactDOM from "react-dom";

import {loginUserSuccess} from "./actions";
import Root from "./containers/root";
import {JWT_TOKEN} from "./constants"
import configureStore from "./store/configureStore";

// import "./styles/index.css";

const store = configureStore(window.__INITIAL_STATE__);

let token = localStorage.getItem(JWT_TOKEN);
if (token !== null) {
  store.dispatch(loginUserSuccess(token));
}

ReactDOM.render(<Root.default store={store} />, document.getElementById("root"));
