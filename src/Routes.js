import React from "react";
import { Route, Switch } from "react-router-dom";
import Profile from "./containers/Profile";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Search from "./containers/Search";
import AppliedRoute from "./components/AppliedRoute";




export default ({ childProps }) =>
<Switch>
  <AppliedRoute path="/" exact component={Profile} props={childProps} />
  <AppliedRoute path="/login" exact component={Login} props={childProps} />
  <AppliedRoute path="/signup" exact component={Signup} props={childProps} />
  <AppliedRoute path="/search" exact component={Search} props={childProps} />
  { /* Finally, catch all unmatched routes */ }
  {/* <Route component={NotFound} /> */}
</Switch>;

