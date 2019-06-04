import React from "react";
import { Route, Switch } from "react-router-dom";
import Profile from "./containers/Profile";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Search from "./containers/Search";
import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";



export default ({ childProps }) =>
<Switch>
  <AuthenticatedRoute path="/" exact component={Profile} props={childProps} />
  <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
  <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
  <AuthenticatedRoute path="/search" exact component={Search} props={childProps} />
  { /* Finally, catch all unmatched routes */ }
  {/* <Route component={NotFound} /> */}
</Switch>;

