import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import home from "src/components/router/home";

const Router: React.FC = () => {
  return (
    <BrowserRouter >
      <Suspense fallback="loading...">
        <Switch>
          <Route exact path="/" component={home}/>
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
