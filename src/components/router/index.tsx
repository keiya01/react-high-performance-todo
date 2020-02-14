import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import about from "src/components/router/about";
import top from "src/components/router/top";

const Router: React.FC = () => {
  return (
    <BrowserRouter >
      <Suspense fallback="loading...">
        <Switch>
          <Route exact path="/" component={top}/>
          <Route path="/about" component={about}/>
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
