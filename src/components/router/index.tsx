import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import about from "src/components/router/about";
import home from "src/components/router/home";

const Router: React.FC = () => {
  return (
    <BrowserRouter >
      <Suspense fallback="loading...">
        <Switch>
          <Route exact path="/" component={home}/>
          <Route path="/about" component={about}/>
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
