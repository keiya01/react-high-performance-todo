import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

const Top = lazy(() => import("./Top"));
const About = lazy(() => import("./About"));

const App: React.FC = () => {
  return (
    <BrowserRouter >
      <Suspense fallback="loading...">
        <Switch>
          <Route exact path="/" component={Top}/>
          <Route path="/about" component={About}/>
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
