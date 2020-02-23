import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import homePage from "src/components/router/homePage";

const Router: React.FC = () => {
  return (
    <BrowserRouter >
      <Suspense fallback="loading...">
        <Switch>
          <Route exact path="/" component={homePage}/>
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
